namespace IdPPlatform.Application.UseCases.Tenant.Commands.CreateTenant;

public interface ICreateTenant
{
    Task<Guid> ExecuteAsync(CreateTenantRequest request, CancellationToken cancellationToken = default);
}
