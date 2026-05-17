using IdPPlatform.Application.Exceptions;
using IdPPlatform.Application.Services.ApplicationClients;
using IdPPlatform.Application.Services.Auth;
using IdPPlatform.Application.Services.ExternalIdentityProvider;
using IdPPlatform.Application.Services.RefreshTokenHasher;
using IdPPlatform.Application.Services.TokenIssuer;
using IdPPlatform.Application.Services.UnitOfWork;
using IdPPlatform.Application.Services.UserScope;
using IdPPlatform.Application.UseCases.Auth.Commands.SubscribeTenant;
using SubscribeTenantCommandRequest = IdPPlatform.Application.UseCases.Auth.Commands.SubscribeTenant.SubscribeTenantRequest;
using SubscribeTenantRequestDto = IdPPlatform.Application.Services.Auth.SubscribeTenantRequest;
using IdPPlatform.Domain.Constants;
using IdPPlatform.Domain.Entities;
using IdPPlatform.Domain.Enums;
using IdPPlatform.Domain.Exceptions;
using IdPPlatform.Domain.Repositories;
using IdPPlatform.Domain.ValueObjects;
using IdPPlatform.Infrastructure.Configurations;
using Microsoft.Extensions.Options;

namespace IdPPlatform.Infrastructure.Services.Auth;

public sealed class IdPAuth : IAuth
{
    private readonly IExternalIdentityProvider _externalIdentityProvider;
    private readonly IApplicationClientValidator _applicationClientValidator;
    private readonly IUserRepository _users;
    private readonly IExternalIdentityRepository _externalIdentities;
    private readonly ITenantMembershipRepository _memberships;
    private readonly IAuthSessionRepository _sessions;
    private readonly IRefreshTokenRepository _refreshTokens;
    private readonly ITokenIssuer _tokenIssuer;
    private readonly IRefreshTokenHasher _refreshTokenHasher;
    private readonly IUserScope _userScope;
    private readonly IPlatformConfigurationRepository _platformConfigurations;
    private readonly ISubscribeTenant _subscribeTenant;
    private readonly IUnitOfWork _unitOfWork;
    private readonly JwtOptions _jwtOptions;
    private readonly SessionOptions _sessionOptions;

    public IdPAuth(
        IExternalIdentityProvider externalIdentityProvider,
        IApplicationClientValidator applicationClientValidator,
        IUserRepository users,
        IExternalIdentityRepository externalIdentities,
        ITenantMembershipRepository memberships,
        IAuthSessionRepository sessions,
        IRefreshTokenRepository refreshTokens,
        ITokenIssuer tokenIssuer,
        IRefreshTokenHasher refreshTokenHasher,
        IUserScope userScope,
        IPlatformConfigurationRepository platformConfigurations,
        ISubscribeTenant subscribeTenant,
        IUnitOfWork unitOfWork,
        IOptions<JwtOptions> jwtOptions,
        IOptions<SessionOptions> sessionOptions)
    {
        _externalIdentityProvider = externalIdentityProvider;
        _applicationClientValidator = applicationClientValidator;
        _users = users;
        _externalIdentities = externalIdentities;
        _memberships = memberships;
        _sessions = sessions;
        _refreshTokens = refreshTokens;
        _tokenIssuer = tokenIssuer;
        _refreshTokenHasher = refreshTokenHasher;
        _userScope = userScope;
        _platformConfigurations = platformConfigurations;
        _subscribeTenant = subscribeTenant;
        _unitOfWork = unitOfWork;
        _jwtOptions = jwtOptions.Value;
        _sessionOptions = sessionOptions.Value;
    }

    public async Task<AuthResult> ExchangeTokenAsync(
        ExchangeTokenRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsurePlatformBootstrapCompletedAsync(cancellationToken);

        var client = await _applicationClientValidator.ValidateAsync(
            request.ClientId,
            request.ClientSecret,
            request.RedirectUri,
            request.RequestedScopes,
            request.CodeChallenge,
            request.CodeChallengeMethod,
            cancellationToken);

        var externalAuth = await _externalIdentityProvider.ValidateAsync(request.IdentityToken, cancellationToken);
        var user = await _users.GetByEmailAsync(externalAuth.Email, cancellationToken);
        if (user is null)
        {
            user = new User(
                new EmailAddress(externalAuth.Email),
                externalAuth.Email.Split('@')[0]);
            await _users.AddAsync(user, cancellationToken);
        }

        var linkedIdentity = await _externalIdentities.GetByProviderAndProviderUserIdAsync(
            externalAuth.Provider,
            externalAuth.ProviderUserId,
            cancellationToken);

        if (linkedIdentity is null)
        {
            linkedIdentity = new ExternalIdentity(
                user.Id,
                externalAuth.Provider,
                externalAuth.ProviderUserId,
                externalAuth.Email);
            await _externalIdentities.AddAsync(linkedIdentity, cancellationToken);
        }

        var memberships = await _memberships.ListByUserIdWithTenantAndRolesAsync(user.Id, cancellationToken);

        var session = new AuthSession(
            user.Id,
            client.Id,
            tenantId: null,
            membershipId: null,
            DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenDays),
            request.UserAgent,
            request.IpAddress);

        await _sessions.AddAsync(session, cancellationToken);

        var rawRefreshToken = GenerateRefreshToken();
        var refreshToken = new RefreshToken(
            session.Id,
            _refreshTokenHasher.Hash(rawRefreshToken),
            DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenDays));

        await _refreshTokens.AddAsync(refreshToken, cancellationToken);
        await EnforceSessionLimitAsync(
            user.Id,
            session.Id,
            cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return BuildAuthResult(
            user,
            session,
            rawRefreshToken,
            memberships);
    }

    public async Task<AuthResult> RefreshTokenAsync(
        RefreshTokenRequest request,
        CancellationToken cancellationToken = default)
    {
        var hash = _refreshTokenHasher.Hash(request.RefreshToken);
        var refreshToken = await _refreshTokens.GetByTokenHashWithSessionAndUserAsync(hash, cancellationToken)
            ?? throw new UnauthorizedApplicationException(ApplicationErrorMessages.Auth.InvalidRefreshToken);

        if (refreshToken.IsRevoked || refreshToken.ExpiresAt <= DateTime.UtcNow)
        {
            throw new UnauthorizedApplicationException(ApplicationErrorMessages.Auth.RefreshTokenExpiredOrRevoked);
        }

        var session = refreshToken.Session;
        if (session.Status != SessionStatus.Active)
        {
            throw new UnauthorizedApplicationException(ApplicationErrorMessages.Auth.SessionInactive);
        }

        var user = session.User;
        var memberships = await _memberships.ListByUserIdWithTenantAndRolesAsync(user.Id, cancellationToken);

        refreshToken.Revoke();
        var newRawRefresh = GenerateRefreshToken();
        var newRefreshToken = new RefreshToken(
            session.Id,
            _refreshTokenHasher.Hash(newRawRefresh),
            DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenDays));

        await _refreshTokens.AddAsync(newRefreshToken, cancellationToken);
        session.Touch();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return BuildAuthResult(
            user,
            session,
            newRawRefresh,
            memberships);
    }

    public async Task<AuthResult> SwitchTenantAsync(
        SwitchTenantRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!_userScope.IsAuthenticated || _userScope.UserId == Guid.Empty || !_userScope.SessionId.HasValue)
        {
            throw new UnauthorizedApplicationException(ApplicationErrorMessages.Auth.AuthenticatedSessionRequired);
        }

        var membership = await _memberships.GetByUserIdAndTenantIdWithRolesAsync(
            _userScope.UserId,
            request.TenantId,
            cancellationToken);
        if (membership is null || !membership.IsActive)
        {
            throw new ForbiddenApplicationException(ApplicationErrorMessages.Auth.UserHasNoTenantAccess);
        }

        var session = await _sessions.GetForUpdateAsync(_userScope.SessionId.Value, cancellationToken)
            ?? throw new UnauthorizedApplicationException(ApplicationErrorMessages.Auth.SessionNotFound);

        session.SwitchTenant(membership.TenantId, membership.Id);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var user = await _users.GetForUpdateAsync(_userScope.UserId, cancellationToken)
            ?? throw new UnauthorizedApplicationException(ApplicationErrorMessages.Auth.UserNotFound);

        var memberships = await _memberships.ListByUserIdWithTenantAndRolesAsync(user.Id, cancellationToken);
        var rawRefresh = GenerateRefreshToken();
        var refreshToken = new RefreshToken(
            session.Id,
            _refreshTokenHasher.Hash(rawRefresh),
            DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenDays));
        await _refreshTokens.AddAsync(refreshToken, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return BuildAuthResult(
            user,
            session,
            rawRefresh,
            memberships);
    }

    public async Task<AuthResult> SubscribeTenantAsync(
        SubscribeTenantRequestDto request,
        CancellationToken cancellationToken = default)
    {
        if (!_userScope.IsAuthenticated || _userScope.UserId == Guid.Empty || !_userScope.SessionId.HasValue)
        {
            throw new UnauthorizedApplicationException(ApplicationErrorMessages.Auth.AuthenticatedSessionRequired);
        }

        var provisioned = await _subscribeTenant.ExecuteAsync(
            new SubscribeTenantCommandRequest
            {
                ActorUserId = _userScope.UserId,
                SessionId = _userScope.SessionId.Value,
                TenantName = request.TenantName,
                TenantKey = request.TenantKey,
                PlanCode = request.PlanCode,
                ExternalCustomerId = request.ExternalCustomerId,
            },
            cancellationToken);

        var session = await _sessions.GetForUpdateAsync(_userScope.SessionId.Value, cancellationToken)
            ?? throw new UnauthorizedApplicationException(ApplicationErrorMessages.Auth.SessionNotFound);

        session.SwitchTenant(provisioned.TenantId, provisioned.MembershipId);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var user = await _users.GetForUpdateAsync(_userScope.UserId, cancellationToken)
            ?? throw new UnauthorizedApplicationException(ApplicationErrorMessages.Auth.UserNotFound);

        var memberships = await _memberships.ListByUserIdWithTenantAndRolesAsync(user.Id, cancellationToken);
        var rawRefresh = GenerateRefreshToken();
        var refreshToken = new RefreshToken(
            session.Id,
            _refreshTokenHasher.Hash(rawRefresh),
            DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenDays));
        await _refreshTokens.AddAsync(refreshToken, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return BuildAuthResult(user, session, rawRefresh, memberships);
    }

    public async Task LogoutAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        var hash = _refreshTokenHasher.Hash(refreshToken);
        var stored = await _refreshTokens.GetByTokenHashWithSessionAndUserAsync(hash, cancellationToken)
            ?? throw new UnauthorizedApplicationException(ApplicationErrorMessages.Auth.InvalidRefreshToken);

        stored.Revoke();
        stored.Session.Revoke();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AuthSessionDto>> ListActiveSessionsAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var sessions = await _sessions.ListActiveByUserIdAsync(userId, cancellationToken);
        return sessions
            .Select(session => new AuthSessionDto
            {
                SessionId = session.Id,
                TenantId = session.TenantId,
                MembershipId = session.MembershipId,
                ClientId = session.ClientId,
                Status = session.Status,
                UserAgent = session.UserAgent,
                IpAddress = session.IpAddress,
                ExpiresAt = session.ExpiresAt,
                LastActivityAt = session.LastActivityAt
            })
            .ToList();
    }

    public async Task RevokeSessionAsync(
        Guid userId,
        Guid sessionId,
        CancellationToken cancellationToken = default)
    {
        var session = await _sessions.GetForUpdateAsync(sessionId, cancellationToken)
            ?? throw new DomainNotFoundException(ApplicationErrorMessages.Auth.SessionNotFound);

        if (session.UserId != userId)
        {
            throw new ForbiddenApplicationException(ApplicationErrorMessages.Auth.CannotRevokeAnotherUserSession);
        }

        session.Revoke();
        var refreshTokens = await _refreshTokens.ListActiveBySessionAsync(sessionId, cancellationToken);
        foreach (var refreshToken in refreshTokens)
        {
            refreshToken.Revoke();
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private AuthResult BuildAuthResult(
        User user,
        AuthSession session,
        string rawRefreshToken,
        IReadOnlyList<TenantMembership> memberships)
    {
        var membership = memberships.FirstOrDefault(x => x.Id == session.MembershipId);
        var platformRoles = ResolvePlatformRoles(user);
        var accessToken = _tokenIssuer.Issue(new TokenClaims
        {
            UserId = user.Id,
            SessionId = session.Id,
            Email = user.Email,
            TenantId = session.TenantId,
            MembershipId = session.MembershipId,
            TenantRoles = membership?.Roles.Select(x => x.Role.Key.Value).ToList() ?? [],
            PlatformRoles = platformRoles,
            Amr = ["pwd"]
        });

        return new AuthResult
        {
            AccessToken = accessToken,
            RefreshToken = rawRefreshToken,
            ExpiresInSeconds = _jwtOptions.AccessTokenMinutes * 60,
            UserId = user.Id,
            Email = user.Email,
            TenantId = session.TenantId,
            MembershipId = session.MembershipId,
            TenantRoles = membership?.Roles.Select(x => x.Role.Key.Value).ToList() ?? [],
            PlatformRoles = platformRoles,
            Tenants = memberships
                .Select(x => new AuthTenantSummaryDto
                {
                    TenantId = x.TenantId,
                    TenantName = x.Tenant.Name,
                    TenantKey = x.Tenant.Key.Value,
                    Roles = x.Roles.Select(role => role.Role.Key.Value).ToList()
                })
                .ToList()
        };
    }

    private static IReadOnlyList<string> ResolvePlatformRoles(User user)
    {
        if (user.IsPlatformAdmin)
        {
            return [PlatformRoleDefaults.PlatformAdministrator];
        }

        return [];
    }

    private static string GenerateRefreshToken()
    {
        var bytes = new byte[64];
        System.Security.Cryptography.RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes).Replace('+', '-').Replace('/', '_').TrimEnd('=');
    }

    private async Task EnforceSessionLimitAsync(
        Guid userId,
        Guid newSessionId,
        CancellationToken cancellationToken)
    {
        var activeSessionCount = await _sessions.CountActiveByUserIdAsync(userId, cancellationToken);
        if (activeSessionCount <= _sessionOptions.MaxSessionsPerUser)
        {
            return;
        }

        var oldest = await _sessions.GetOldestActiveByUserIdAsync(userId, cancellationToken);
        if (oldest is null || oldest.Id == newSessionId)
        {
            return;
        }

        oldest.Revoke();
        var refreshTokens = await _refreshTokens.ListActiveBySessionAsync(oldest.Id, cancellationToken);
        foreach (var token in refreshTokens)
        {
            token.Revoke();
        }
    }

    private async Task EnsurePlatformBootstrapCompletedAsync(CancellationToken cancellationToken)
    {
        var configuration = await _platformConfigurations.GetForUpdateAsync(cancellationToken);
        var hasAnyPlatformAdmin = await _users.AnyPlatformAdministratorAsync(cancellationToken);
        var isConfigured = configuration?.IsBootstrapped == true && configuration.RootUserId.HasValue && hasAnyPlatformAdmin;
        if (!isConfigured)
        {
            throw new DomainBusinessRuleException(ApplicationErrorMessages.Auth.PlatformBootstrapRequired);
        }
    }
}
