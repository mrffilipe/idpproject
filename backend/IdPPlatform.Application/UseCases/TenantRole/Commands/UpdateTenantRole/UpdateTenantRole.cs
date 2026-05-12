using IdPPlatform.Application.Services.UnitOfWork;
using IdPPlatform.Domain.Exceptions;
using IdPPlatform.Domain.Repositories;

namespace IdPPlatform.Application.UseCases.TenantRole.Commands.UpdateTenantRole;

public sealed class UpdateTenantRole : IUpdateTenantRole
{
    private readonly ITenantRoleRepository _roles;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateTenantRole(ITenantRoleRepository roles, IUnitOfWork unitOfWork)
    {
        _roles = roles;
        _unitOfWork = unitOfWork;
    }

    public async Task ExecuteAsync(UpdateTenantRoleRequest request, CancellationToken cancellationToken = default)
    {
        var role = await _roles.GetForUpdateAsync(request.RoleId, cancellationToken)
            ?? throw new DomainNotFoundException(DomainErrorMessages.TenantRole.RoleNotFound);

        role.UpdateDetails(request.Name, request.Description);
        if (request.IsActive)
        {
            role.Activate();
        }
        else
        {
            role.Deactivate();
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
