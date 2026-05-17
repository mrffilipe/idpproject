using IdPPlatform.Application.UseCases.Application.Commands.ProvisionApplicationTenant;

namespace IdPPlatform.Application.UseCases.Auth.Commands.SubscribeTenant;

public interface ISubscribeTenant
{
    Task<ProvisionApplicationTenantResult> ExecuteAsync(
        SubscribeTenantRequest request,
        CancellationToken cancellationToken = default);
}
