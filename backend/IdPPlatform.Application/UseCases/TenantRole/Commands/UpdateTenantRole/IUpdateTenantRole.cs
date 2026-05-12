namespace IdPPlatform.Application.UseCases.TenantRole.Commands.UpdateTenantRole;

public interface IUpdateTenantRole
{
    Task ExecuteAsync(UpdateTenantRoleRequest request, CancellationToken cancellationToken = default);
}
