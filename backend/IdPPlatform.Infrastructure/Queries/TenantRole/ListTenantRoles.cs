using IdPPlatform.Application.Common;
using IdPPlatform.Application.UseCases.TenantRole.Dtos;
using IdPPlatform.Application.UseCases.TenantRole.Queries.ListTenantRoles;
using IdPPlatform.Domain.Repositories;

namespace IdPPlatform.Infrastructure.Queries.TenantRole;

public sealed class ListTenantRoles : IListTenantRoles
{
    private readonly ITenantRoleRepository _roles;

    public ListTenantRoles(ITenantRoleRepository roles)
    {
        _roles = roles;
    }

    public async Task<PagedResult<TenantRoleDto>> ExecuteAsync(
        ListTenantRolesRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page <= 0 ? 1 : request.Page;
        var pageSize = request.PageSize <= 0 ? 20 : request.PageSize;
        var roles = await _roles.ListByTenantIdAsync(
            request.TenantId,
            request.IncludeInactive,
            cancellationToken);
        var items = roles
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new TenantRoleDto
            {
                Id = x.Id,
                TenantId = x.TenantId,
                Key = x.Key.Value,
                Name = x.Name,
                Description = x.Description,
                IsSystem = x.IsSystem,
                IsActive = x.IsActive
            })
            .ToList();

        return new PagedResult<TenantRoleDto>
        {
            Items = items,
            Total = roles.Count,
            Page = page,
            PageSize = pageSize
        };
    }
}
