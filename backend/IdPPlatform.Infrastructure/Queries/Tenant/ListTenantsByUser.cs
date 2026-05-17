using IdPPlatform.Application.Common;
using IdPPlatform.Application.UseCases.Tenant.Dtos;
using IdPPlatform.Application.UseCases.Tenant.Queries.ListTenantsByUser;
using IdPPlatform.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace IdPPlatform.Infrastructure.Queries.Tenant;

public sealed class ListTenantsByUser : IListTenantsByUser
{
    private readonly ApplicationDbContext _context;

    public ListTenantsByUser(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<TenantDto>> ExecuteAsync(
        ListTenantsByUserRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 20 : request.PageSize;
        var query = _context.TenantMemberships
            .AsNoTracking()
            .Include(x => x.Tenant)
            .Where(x => x.UserId == request.UserId && x.IsActive);

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(x => x.Tenant.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new TenantDto
            {
                Id = x.TenantId,
                Name = x.Tenant.Name,
                Key = x.Tenant.Key.Value
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<TenantDto>
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }
}
