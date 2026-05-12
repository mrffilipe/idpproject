using IdPPlatform.Domain.Constants;
using IdPPlatform.Application.Services.UnitOfWork;
using IdPPlatform.Domain.Exceptions;
using IdPPlatform.Domain.Repositories;
using IdPPlatform.Domain.ValueObjects;

namespace IdPPlatform.Application.UseCases.Tenant.Commands.CreateTenant;

public sealed class CreateTenant : ICreateTenant
{
    private readonly ITenantRepository _tenants;
    private readonly ITenantRoleRepository _roles;
    private readonly IUnitOfWork _unitOfWork;

    public CreateTenant(
        ITenantRepository tenants,
        ITenantRoleRepository roles,
        IUnitOfWork unitOfWork)
    {
        _tenants = tenants;
        _roles = roles;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> ExecuteAsync(CreateTenantRequest request, CancellationToken cancellationToken = default)
    {
        var key = new TenantKey(request.Key);
        if (await _tenants.KeyAlreadyExistsAsync(key, cancellationToken))
        {
            throw new DomainBusinessRuleException(DomainErrorMessages.Tenant.KeyAlreadyExists);
        }

        var tenant = new Domain.Entities.Tenant(request.Name, key);
        await _tenants.AddAsync(tenant, cancellationToken);
        foreach (var role in TenantRoleDefaults.All)
        {
            await _roles.AddAsync(
                new Domain.Entities.TenantRole(
                    tenant.Id,
                    role.Key,
                    role.Name,
                    isSystem: true),
                cancellationToken);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return tenant.Id;
    }
}
