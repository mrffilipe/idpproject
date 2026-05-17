using IdPPlatform.Application.Exceptions;
using IdPPlatform.Application.Services.TenantResolutionCache;
using IdPPlatform.Application.Services.UnitOfWork;
using IdPPlatform.Domain.Constants;
using IdPPlatform.Domain.Entities;
using IdPPlatform.Domain.Exceptions;
using IdPPlatform.Domain.Repositories;
using IdPPlatform.Domain.ValueObjects;

namespace IdPPlatform.Application.UseCases.Application.Commands.ProvisionApplicationTenant;

public sealed class ProvisionApplicationTenant : IProvisionApplicationTenant
{
    private readonly IApplicationRepository _applications;
    private readonly ITenantRepository _tenants;
    private readonly ITenantRoleRepository _roles;
    private readonly ITenantMembershipRepository _memberships;
    private readonly IApplicationTenantRepository _applicationTenants;
    private readonly IUserRepository _users;
    private readonly ITenantResolutionCache _tenantResolutionCache;
    private readonly IUnitOfWork _unitOfWork;

    public ProvisionApplicationTenant(
        IApplicationRepository applications,
        ITenantRepository tenants,
        ITenantRoleRepository roles,
        ITenantMembershipRepository memberships,
        IApplicationTenantRepository applicationTenants,
        IUserRepository users,
        ITenantResolutionCache tenantResolutionCache,
        IUnitOfWork unitOfWork)
    {
        _applications = applications;
        _tenants = tenants;
        _roles = roles;
        _memberships = memberships;
        _applicationTenants = applicationTenants;
        _users = users;
        _tenantResolutionCache = tenantResolutionCache;
        _unitOfWork = unitOfWork;
    }

    public async Task<ProvisionApplicationTenantResult> ExecuteAsync(
        ProvisionApplicationTenantRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!request.ActorPlatformRoles.Any(role => PlatformRoleDefaults.AdministrativeKeys.Contains(role)))
        {
            throw new ForbiddenApplicationException(ApplicationErrorMessages.Auth.UserHasNoTenantAccess);
        }

        var application = await _applications.GetByIdAsync(request.ApplicationId, cancellationToken)
            ?? throw new DomainNotFoundException(ApplicationErrorMessages.Application.NotFound);

        var tenantKey = new TenantKey(request.TenantKey);
        if (await _tenants.KeyAlreadyExistsAsync(tenantKey, cancellationToken))
        {
            throw new DomainBusinessRuleException(DomainErrorMessages.Tenant.KeyAlreadyExists);
        }

        var initialAdministratorUserId = request.InitialAdministratorUserId ?? request.ActorUserId;
        var initialAdministrator = await _users.GetForUpdateAsync(initialAdministratorUserId, cancellationToken)
            ?? throw new DomainNotFoundException(DomainErrorMessages.User.UserNotFound);

        if (!initialAdministrator.IsActive)
        {
            throw new DomainBusinessRuleException(DomainErrorMessages.User.UserInactive);
        }

        var tenant = new Domain.Entities.Tenant(request.TenantName, tenantKey);
        await _tenants.AddAsync(tenant, cancellationToken);

        Domain.Entities.TenantRole? ownerRole = null;
        foreach (var role in TenantRoleDefaults.All)
        {
            var createdRole = new Domain.Entities.TenantRole(
                tenant.Id,
                role.Key,
                role.Name,
                isSystem: true);
            await _roles.AddAsync(createdRole, cancellationToken);

            if (role.Key.Equals(TenantRoleDefaults.Owner, StringComparison.OrdinalIgnoreCase))
            {
                ownerRole = createdRole;
            }
        }

        if (ownerRole is null)
        {
            throw new DomainBusinessRuleException(DomainErrorMessages.TenantRole.AtLeastOneRoleRequired);
        }

        var membership = new Domain.Entities.TenantMembership(tenant.Id, initialAdministratorUserId, [ownerRole]);
        await _memberships.AddAsync(membership, cancellationToken);

        var applicationTenant = new ApplicationTenant(
            application.Id,
            tenant.Id,
            request.ExternalCustomerId,
            request.PlanCode);

        if (await _applicationTenants.ExistsAsync(application.Id, tenant.Id, cancellationToken))
        {
            throw new DomainBusinessRuleException(DomainErrorMessages.ApplicationTenant.MappingAlreadyExists);
        }

        await _applicationTenants.AddAsync(applicationTenant, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        await _tenantResolutionCache.InvalidateByIdentifierAsync(tenantKey.Value, cancellationToken);

        return new ProvisionApplicationTenantResult
        {
            ApplicationId = application.Id,
            TenantId = tenant.Id,
            MembershipId = membership.Id,
        };
    }
}
