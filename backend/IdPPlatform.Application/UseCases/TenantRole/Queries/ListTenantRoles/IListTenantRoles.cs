using IdPPlatform.Application.Common;
using IdPPlatform.Application.UseCases.TenantRole.Dtos;

namespace IdPPlatform.Application.UseCases.TenantRole.Queries.ListTenantRoles;

public interface IListTenantRoles
{
    Task<PagedResult<TenantRoleDto>> ExecuteAsync(ListTenantRolesRequest request, CancellationToken cancellationToken = default);
}
