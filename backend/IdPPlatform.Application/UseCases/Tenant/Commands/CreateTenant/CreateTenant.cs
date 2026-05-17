using IdPPlatform.Domain.Constants;
using IdPPlatform.Application.Services.UnitOfWork;
using IdPPlatform.Application.Services.TenantResolutionCache;
using IdPPlatform.Domain.Exceptions;
using IdPPlatform.Domain.Repositories;
using IdPPlatform.Domain.ValueObjects;

namespace IdPPlatform.Application.UseCases.Tenant.Commands.CreateTenant;

public sealed class CreateTenant : ICreateTenant
{
    private readonly ITenantRepository _tenants;
    private readonly ITenantRoleRepository _roles;
    private readonly ITenantMembershipRepository _memberships;
    private readonly IUserRepository _users;
    private readonly ITenantResolutionCache _tenantResolutionCache;
    private readonly IUnitOfWork _unitOfWork;

    public CreateTenant(
        ITenantRepository tenants,
        ITenantRoleRepository roles,
        ITenantMembershipRepository memberships,
        IUserRepository users,
        ITenantResolutionCache tenantResolutionCache,
        IUnitOfWork unitOfWork)
    {
        _tenants = tenants;
        _roles = roles;
        _memberships = memberships;
        _users = users;
        _tenantResolutionCache = tenantResolutionCache;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> ExecuteAsync(CreateTenantRequest request, CancellationToken cancellationToken = default)
    {
        var key = new TenantKey(request.Key);
        if (await _tenants.KeyAlreadyExistsAsync(key, cancellationToken))
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

        var tenant = new Domain.Entities.Tenant(request.Name, key);
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

        await _memberships.AddAsync(
            new Domain.Entities.TenantMembership(
                tenant.Id,
                initialAdministratorUserId,
                [ownerRole]),
            cancellationToken);

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        await _tenantResolutionCache.InvalidateByIdentifierAsync(key.Value, cancellationToken);
        return tenant.Id;
    }
}
