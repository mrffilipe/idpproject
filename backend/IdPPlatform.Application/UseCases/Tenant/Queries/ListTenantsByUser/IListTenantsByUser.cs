using IdPPlatform.Application.Common;
using IdPPlatform.Application.UseCases.Tenant.Dtos;

namespace IdPPlatform.Application.UseCases.Tenant.Queries.ListTenantsByUser;

public interface IListTenantsByUser
{
    Task<PagedResult<TenantDto>> ExecuteAsync(ListTenantsByUserRequest request, CancellationToken cancellationToken = default);
}
