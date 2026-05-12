using IdPPlatform.Application.UseCases.Tenant.Dtos;

namespace IdPPlatform.Application.UseCases.Tenant.Queries.GetTenantById;

public interface IGetTenantById
{
    Task<TenantDto?> ExecuteAsync(GetTenantByIdRequest request, CancellationToken cancellationToken = default);
}
