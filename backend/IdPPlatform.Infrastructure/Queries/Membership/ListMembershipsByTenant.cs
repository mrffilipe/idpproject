using IdPPlatform.Application.Common;
using IdPPlatform.Application.UseCases.Membership.Dtos;
using IdPPlatform.Application.UseCases.Membership.Queries.ListMembershipsByTenant;
using IdPPlatform.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace IdPPlatform.Infrastructure.Queries.Membership;

public sealed class ListMembershipsByTenant : IListMembershipsByTenant
{
    private readonly ApplicationDbContext _context;

    public ListMembershipsByTenant(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<MembershipDto>> ExecuteAsync(
        ListMembershipsByTenantRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 20 : request.PageSize;
        var query = _context.TenantMemberships
            .AsNoTracking()
            .Where(x => x.TenantId == request.TenantId);

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(x => x.UserId)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new MembershipDto
            {
                Id = x.Id,
                UserId = x.UserId,
                TenantId = x.TenantId,
                Roles = x.Roles.Select(role => role.Role.Key.Value).ToList(),
                IsActive = x.IsActive
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<MembershipDto>
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }
}
