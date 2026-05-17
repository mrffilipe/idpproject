namespace IdPPlatform.Application.UseCases.Application.Commands.ProvisionApplicationTenant;

public interface IProvisionApplicationTenant
{
    Task<ProvisionApplicationTenantResult> ExecuteAsync(
        ProvisionApplicationTenantRequest request,
        CancellationToken cancellationToken = default);
}
