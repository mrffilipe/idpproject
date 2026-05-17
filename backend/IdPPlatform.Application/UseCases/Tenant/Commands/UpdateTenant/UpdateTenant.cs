using IdPPlatform.Application.Exceptions;
using IdPPlatform.Application.Services.TenantResolutionCache;
using IdPPlatform.Domain.Constants;
using IdPPlatform.Application.Services.UnitOfWork;
using IdPPlatform.Domain.Exceptions;
using IdPPlatform.Domain.Repositories;

namespace IdPPlatform.Application.UseCases.Tenant.Commands.UpdateTenant;

public sealed class UpdateTenant : IUpdateTenant
{
    private readonly ITenantRepository _tenants;
    private readonly ITenantMembershipRepository _memberships;
    private readonly ITenantResolutionCache _tenantResolutionCache;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateTenant(
        ITenantRepository tenants,
        ITenantMembershipRepository memberships,
        ITenantResolutionCache tenantResolutionCache,
        IUnitOfWork unitOfWork)
    {
        _tenants = tenants;
        _memberships = memberships;
        _tenantResolutionCache = tenantResolutionCache;
        _unitOfWork = unitOfWork;
    }

    public async Task ExecuteAsync(UpdateTenantRequest request, CancellationToken cancellationToken = default)
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

        tenant.UpdateName(request.Name);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        await _tenantResolutionCache.InvalidateByIdentifierAsync(tenant.Key.Value, cancellationToken);
    }
}
