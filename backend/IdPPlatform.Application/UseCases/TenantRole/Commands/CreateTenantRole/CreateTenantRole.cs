using IdPPlatform.Application.Services.UnitOfWork;
using IdPPlatform.Domain.Exceptions;
using IdPPlatform.Domain.Repositories;
using IdPPlatform.Domain.ValueObjects;

namespace IdPPlatform.Application.UseCases.TenantRole.Commands.CreateTenantRole;

public sealed class CreateTenantRole : ICreateTenantRole
{
    private readonly ITenantRepository _tenants;
    private readonly ITenantRoleRepository _roles;
    private readonly IUnitOfWork _unitOfWork;

    public CreateTenantRole(
        ITenantRepository tenants,
        ITenantRoleRepository roles,
        IUnitOfWork unitOfWork)
    {
        _tenants = tenants;
        _roles = roles;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> ExecuteAsync(CreateTenantRoleRequest request, CancellationToken cancellationToken = default)
    {
        _ = await _tenants.GetForUpdateAsync(request.TenantId, cancellationToken)
            ?? throw new DomainNotFoundException(DomainErrorMessages.Tenant.TenantNotFound);

        var key = new TenantRoleKey(request.Key);
        if (await _roles.KeyAlreadyExistsAsync(
            request.TenantId,
            key,
            cancellationToken))
        {
            throw new DomainBusinessRuleException(DomainErrorMessages.TenantRole.RoleAlreadyExists);
        }

        var role = new Domain.Entities.TenantRole(
            request.TenantId,
            key,
            request.Name,
            request.Description);

        await _roles.AddAsync(role, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return role.Id;
    }
}
