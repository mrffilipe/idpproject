using IdPPlatform.Application.Exceptions;
using IdPPlatform.Application.Interfaces;
using IdPPlatform.Application.Services.Email;
using IdPPlatform.Application.Services.RefreshTokenHasher;
using IdPPlatform.Application.Services.TenantRoles;
using IdPPlatform.Application.Services.UnitOfWork;
using IdPPlatform.Domain.Constants;
using IdPPlatform.Domain.Entities;
using IdPPlatform.Domain.Exceptions;
using IdPPlatform.Domain.Repositories;

namespace IdPPlatform.Application.UseCases.Tenant.Commands.InviteMember;

public sealed class InviteMember : IInviteMember
{
    private readonly ITenantRepository _tenants;
    private readonly ITenantMembershipRepository _memberships;
    private readonly ITenantInviteRepository _invites;
    private readonly IRefreshTokenHasher _hasher;
    private readonly IInvitePolicy _policy;
    private readonly ITenantRoleResolver _roleResolver;
    private readonly IEmailService _emailService;
    private readonly IUnitOfWork _unitOfWork;

    public InviteMember(
        ITenantRepository tenants,
        ITenantMembershipRepository memberships,
        ITenantInviteRepository invites,
        IRefreshTokenHasher hasher,
        IInvitePolicy policy,
        ITenantRoleResolver roleResolver,
        IEmailService emailService,
        IUnitOfWork unitOfWork)
    {
        _tenants = tenants;
        _memberships = memberships;
        _invites = invites;
        _hasher = hasher;
        _policy = policy;
        _roleResolver = roleResolver;
        _emailService = emailService;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> ExecuteAsync(InviteMemberRequest request, CancellationToken cancellationToken = default)
    {
        var isPlatformAdministrator = request.ActorPlatformRoles
            .Any(role => PlatformRoleDefaults.AdministrativeKeys.Contains(role));

        if (!isPlatformAdministrator)
        {
            var membership = await _memberships.GetByUserIdAndTenantIdWithRolesAsync(
                request.ActorUserId,
                request.TenantId,
                cancellationToken);

            var hasAdministrativeRole = membership is not null
                && membership.IsActive
                && membership.Roles.Any(role => TenantRoleDefaults.AdministrativeKeys.Contains(role.Role.Key.Value));

            if (!hasAdministrativeRole)
            {
                throw new ForbiddenApplicationException(ApplicationErrorMessages.Auth.UserHasNoTenantAccess);
            }
        }

        var tenant = await _tenants.GetForUpdateAsync(request.TenantId, cancellationToken)
            ?? throw new DomainNotFoundException(DomainErrorMessages.Tenant.TenantNotFound);

        var roles = await _roleResolver.ResolveActiveRolesAsync(
            request.TenantId,
            request.Roles,
            cancellationToken);

        var rawToken = GenerateToken();
        var invite = new TenantInvite(
            request.TenantId,
            request.Email,
            roles,
            _hasher.Hash(rawToken),
            DateTime.UtcNow.AddHours(_policy.ExpirationHours),
            request.InvitedByUserId);

        await _invites.AddAsync(invite, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        await _emailService.SendInviteAsync(
            invite.Email.Value,
            tenant.Name,
            rawToken,
            cancellationToken);

        return invite.Id;
    }

    private static string GenerateToken()
    {
        var bytes = new byte[64];
        System.Security.Cryptography.RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes).Replace('+', '-').Replace('/', '_').TrimEnd('=');
    }
}
