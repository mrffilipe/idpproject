using IdPPlatform.Application.Common;
using IdPPlatform.Application.UseCases.User.Dtos;
using IdPPlatform.Application.UseCases.User.Queries.ListUserMemberships;
using IdPPlatform.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace IdPPlatform.Infrastructure.Queries.User;

public sealed class ListUserMemberships : IListUserMemberships
{
    private readonly ApplicationDbContext _context;

    public ListUserMemberships(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<UserMembershipDto>> ExecuteAsync(
        ListUserMembershipsRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 20 : request.PageSize;
        var query = _context.TenantMemberships
            .AsNoTracking()
            .Include(x => x.Tenant)
            .Include(x => x.Roles)
            .ThenInclude(x => x.Role)
            .Where(x => x.UserId == request.UserId && x.IsActive);

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(x => x.Tenant.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new UserMembershipDto
            {
                MembershipId = x.Id,
                TenantId = x.TenantId,
                TenantName = x.Tenant.Name,
                TenantKey = x.Tenant.Key.Value,
                Roles = x.Roles.Select(role => role.Role.Key.Value).ToList()
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<UserMembershipDto>
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }
}
