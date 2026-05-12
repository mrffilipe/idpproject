namespace IdPPlatform.Application.UseCases.TenantRole.Commands.CreateTenantRole;

public interface ICreateTenantRole
{
    Task<Guid> ExecuteAsync(CreateTenantRoleRequest request, CancellationToken cancellationToken = default);
}
