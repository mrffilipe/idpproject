namespace IdPPlatform.Application.UseCases.Tenant.Commands.UpdateTenant;

public interface IUpdateTenant
{
    Task ExecuteAsync(UpdateTenantRequest request, CancellationToken cancellationToken = default);
}
