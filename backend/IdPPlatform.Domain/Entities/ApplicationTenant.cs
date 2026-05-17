using IdPPlatform.Domain.Common;
using IdPPlatform.Domain.Exceptions;

namespace IdPPlatform.Domain.Entities;

public sealed class ApplicationTenant : BaseEntity
{
    public Guid ApplicationId { get; private set; }
    public Application Application { get; private set; } = null!;

    public Guid TenantId { get; private set; }
    public Tenant Tenant { get; private set; } = null!;

    public string? ExternalCustomerId { get; private set; }
    public string? PlanCode { get; private set; }
    public bool IsActive { get; private set; }

    private ApplicationTenant()
    {
    }

    public ApplicationTenant(
        Guid applicationId,
        Guid tenantId,
        string? externalCustomerId,
        string? planCode)
    {
        if (applicationId == Guid.Empty || tenantId == Guid.Empty)
        {
            throw new DomainValidationException(DomainErrorMessages.ApplicationTenant.DataInvalid);
        }

        ApplicationId = applicationId;
        TenantId = tenantId;
        ExternalCustomerId = string.IsNullOrWhiteSpace(externalCustomerId) ? null : externalCustomerId.Trim();
        PlanCode = string.IsNullOrWhiteSpace(planCode) ? null : planCode.Trim();
        IsActive = true;
    }
}
