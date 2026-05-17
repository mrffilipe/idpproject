using System.Text.Json;
using IdPPlatform.Application.Exceptions;
using IdPPlatform.Application.Services.ExternalIdentityProvider;
using IdPPlatform.Application.Services.UnitOfWork;
using IdPPlatform.Application.UseCases.Platform.Commands.BootstrapPlatform;
using IdPPlatform.Application.UseCases.Platform.Dtos;
using IdPPlatform.Domain.Constants;
using IdPPlatform.Domain.Entities;
using IdPPlatform.Domain.Enums;
using IdPPlatform.Domain.Exceptions;
using IdPPlatform.Domain.Repositories;
using IdPPlatform.Domain.ValueObjects;

namespace IdPPlatform.Infrastructure.UseCases.Platform.Commands;

public sealed class BootstrapPlatform : IBootstrapPlatform
{
    private readonly IExternalIdentityProvider _externalIdentityProvider;
    private readonly IUserRepository _users;
    private readonly IExternalIdentityRepository _externalIdentities;
    private readonly ITenantRepository _tenants;
    private readonly ITenantRoleRepository _roles;
    private readonly ITenantMembershipRepository _memberships;
    private readonly IApplicationRepository _applications;
    private readonly IApplicationClientRepository _clients;
    private readonly IPlatformConfigurationRepository _platformConfigurations;
    private readonly IAuditLogRepository _auditLogs;
    private readonly IUnitOfWork _unitOfWork;

    public BootstrapPlatform(
        IExternalIdentityProvider externalIdentityProvider,
        IUserRepository users,
        IExternalIdentityRepository externalIdentities,
        ITenantRepository tenants,
        ITenantRoleRepository roles,
        ITenantMembershipRepository memberships,
        IApplicationRepository applications,
        IApplicationClientRepository clients,
        IPlatformConfigurationRepository platformConfigurations,
        IAuditLogRepository auditLogs,
        IUnitOfWork unitOfWork)
    {
        _externalIdentityProvider = externalIdentityProvider;
        _users = users;
        _externalIdentities = externalIdentities;
        _tenants = tenants;
        _roles = roles;
        _memberships = memberships;
        _applications = applications;
        _clients = clients;
        _platformConfigurations = platformConfigurations;
        _auditLogs = auditLogs;
        _unitOfWork = unitOfWork;
    }

    public async Task<BootstrapPlatformResult> ExecuteAsync(
        BootstrapPlatformRequest request,
        CancellationToken cancellationToken = default)
    {
        BootstrapPlatformResult? result = null;

        await _unitOfWork.ExecuteInSerializableTransactionAsync(async transactionCancellationToken =>
        {
            var configuration = await _platformConfigurations.GetForUpdateAsync(transactionCancellationToken);
            var hasAnyPlatformAdmin = await _users.AnyPlatformAdministratorAsync(transactionCancellationToken);
            if (configuration?.IsBootstrapped == true || hasAnyPlatformAdmin)
            {
                throw new DomainBusinessRuleException(ApplicationErrorMessages.Auth.PlatformBootstrapAlreadyCompleted);
            }

            if (await _tenants.KeyAlreadyExistsAsync(request.TenantKey, transactionCancellationToken))
            {
                throw new DomainBusinessRuleException(ApplicationErrorMessages.Auth.PlatformBootstrapTenantKeyAlreadyExists);
            }

            if (await _applications.SlugAlreadyExistsAsync(request.ApplicationSlug, transactionCancellationToken))
            {
                throw new DomainBusinessRuleException(ApplicationErrorMessages.Auth.PlatformBootstrapApplicationSlugAlreadyExists);
            }

            if (await _clients.GetByClientIdAsync(request.ClientId, transactionCancellationToken) is not null)
            {
                throw new DomainBusinessRuleException(ApplicationErrorMessages.Auth.PlatformBootstrapClientIdAlreadyExists);
            }

            ValidateBootstrapRequest(request);

            var externalAuth = await _externalIdentityProvider.ValidateAsync(request.IdentityToken, transactionCancellationToken);

            var user = await _users.GetByEmailAsync(externalAuth.Email, transactionCancellationToken);
            if (user is null)
            {
                user = new User(
                    new EmailAddress(externalAuth.Email),
                    externalAuth.Email.Split('@')[0]);
                await _users.AddAsync(user, transactionCancellationToken);
            }

            user.PromoteToPlatformAdministrator();

            var linkedIdentity = await _externalIdentities.GetByProviderAndProviderUserIdAsync(
                externalAuth.Provider,
                externalAuth.ProviderUserId,
                transactionCancellationToken);

            if (linkedIdentity is null)
            {
                linkedIdentity = new ExternalIdentity(
                    user.Id,
                    externalAuth.Provider,
                    externalAuth.ProviderUserId,
                    externalAuth.Email);
                await _externalIdentities.AddAsync(linkedIdentity, transactionCancellationToken);
            }

            var tenant = new Tenant(request.TenantName, new TenantKey(request.TenantKey));
            await _tenants.AddAsync(tenant, transactionCancellationToken);

            TenantRole? ownerRole = null;
            foreach (var role in TenantRoleDefaults.All)
            {
                var createdRole = new TenantRole(
                    tenant.Id,
                    new TenantRoleKey(role.Key),
                    role.Name,
                    isSystem: true);
                await _roles.AddAsync(createdRole, transactionCancellationToken);

                if (role.Key.Equals(TenantRoleDefaults.Owner, StringComparison.OrdinalIgnoreCase))
                {
                    ownerRole = createdRole;
                }
            }

            if (ownerRole is null)
            {
                throw new DomainBusinessRuleException(DomainErrorMessages.TenantRole.AtLeastOneRoleRequired);
            }

            var membership = new TenantMembership(tenant.Id, user.Id, [ownerRole]);
            await _memberships.AddAsync(membership, transactionCancellationToken);

            var application = new Domain.Entities.Application(
                request.ApplicationName,
                request.ApplicationSlug,
                request.ApplicationType);
            await _applications.AddAsync(application, transactionCancellationToken);

            var client = new ApplicationClient(
                application.Id,
                request.ClientId.Trim(),
                BuildClientSecretHash(request.ClientType, request.ClientSecret),
                request.ClientType,
                JsonSerializer.Serialize(NormalizeStringList(request.RedirectUris)),
                JsonSerializer.Serialize(NormalizeStringList(request.AllowedScopes)),
                request.AccessTokenTtlSeconds);
            await _clients.AddAsync(client, transactionCancellationToken);

            if (configuration is null)
            {
                configuration = new PlatformConfiguration();
                await _platformConfigurations.AddAsync(configuration, transactionCancellationToken);
            }

            configuration.MarkBootstrapped(user.Id, client.ClientId);

            await _auditLogs.AddAsync(
                new AuditLog(
                    tenant.Id,
                    user.Id,
                    membership.Id,
                    "PlatformBootstrapped",
                    "PlatformConfiguration",
                    configuration.Id,
                    request.IpAddress,
                    request.UserAgent),
                transactionCancellationToken);

            await _unitOfWork.SaveChangesAsync(transactionCancellationToken);

            result = new BootstrapPlatformResult
            {
                IsConfigured = true,
                RootUserId = user.Id,
                TenantId = tenant.Id,
                ApplicationId = application.Id,
                OauthClientId = client.ClientId
            };
        }, cancellationToken);

        return result!;
    }

    private static IReadOnlyList<string> NormalizeStringList(IReadOnlyList<string> values)
    {
        return values
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .Select(value => value.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private static void ValidateBootstrapRequest(BootstrapPlatformRequest request)
    {
        if (request.AccessTokenTtlSeconds <= 0)
        {
            throw new DomainValidationException(ApplicationErrorMessages.Auth.PlatformBootstrapAccessTokenTtlInvalid);
        }

        if (NormalizeStringList(request.RedirectUris).Count == 0)
        {
            throw new DomainValidationException(ApplicationErrorMessages.Auth.PlatformBootstrapRedirectUriRequired);
        }

        if (NormalizeStringList(request.AllowedScopes).Count == 0)
        {
            throw new DomainValidationException(ApplicationErrorMessages.Auth.PlatformBootstrapScopeRequired);
        }
    }

    private static string? BuildClientSecretHash(ClientType clientType, string? clientSecret)
    {
        if (clientType == ClientType.Public)
        {
            return null;
        }

        if (string.IsNullOrWhiteSpace(clientSecret))
        {
            throw new DomainValidationException(ApplicationErrorMessages.Auth.PlatformBootstrapClientSecretRequired);
        }

        return BCrypt.Net.BCrypt.HashPassword(clientSecret.Trim());
    }
}
