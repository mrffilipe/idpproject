using IdPPlatform.Application.Services.UnitOfWork;
using IdPPlatform.Domain.Exceptions;
using IdPPlatform.Domain.Repositories;

namespace IdPPlatform.Application.UseCases.Tenant.Commands.UpdateTenant;

public sealed class UpdateTenant : IUpdateTenant
{
    private readonly ITenantRepository _tenants;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateTenant(ITenantRepository tenants, IUnitOfWork unitOfWork)
    {
        _tenants = tenants;
        _unitOfWork = unitOfWork;
    }

    public async Task ExecuteAsync(UpdateTenantRequest request, CancellationToken cancellationToken = default)
    {
        var tenant = await _tenants.GetForUpdateAsync(request.TenantId, cancellationToken)
            ?? throw new DomainNotFoundException(DomainErrorMessages.Tenant.TenantNotFound);

        tenant.UpdateName(request.Name);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
