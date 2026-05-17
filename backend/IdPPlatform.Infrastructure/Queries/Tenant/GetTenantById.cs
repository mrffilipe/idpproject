using IdPPlatform.Application.UseCases.Tenant.Dtos;
using IdPPlatform.Application.UseCases.Tenant.Queries.GetTenantById;
using IdPPlatform.Domain.Constants;
using IdPPlatform.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace IdPPlatform.Infrastructure.Queries.Tenant;

public sealed class GetTenantById : IGetTenantById
{
    private readonly ApplicationDbContext _context;

    public GetTenantById(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TenantDto?> ExecuteAsync(GetTenantByIdRequest request, CancellationToken cancellationToken = default)
    {
        var isPlatformAdministrator = request.ActorPlatformRoles
            .Any(role => PlatformRoleDefaults.AdministrativeKeys.Contains(role));

        if (!isPlatformAdministrator)
        {
            var hasAdministrativeMembership = await _context.TenantMemberships
                .AsNoTracking()
                .Where(x => x.UserId == request.ActorUserId && x.TenantId == request.TenantId && x.IsActive)
                .AnyAsync(
                    membership => membership.Roles.Any(
                        role => TenantRoleDefaults.AdministrativeKeys.Contains(role.Role.Key.Value)),
                    cancellationToken);

            if (!hasAdministrativeMembership)
            {
                return null;
            }
        }

        return await _context.Tenants
            .AsNoTracking()
            .Where(x => x.Id == request.TenantId)
            .Select(x => new TenantDto
            {
                Id = x.Id,
                Name = x.Name,
                Key = x.Key.Value
            })
            .FirstOrDefaultAsync(cancellationToken);
    }
}
