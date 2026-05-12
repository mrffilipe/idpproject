using IdPPlatform.Domain.Common;
using IdPPlatform.Domain.Exceptions;

namespace IdPPlatform.Domain.Entities;

public class TenantMembership : TenantEntity
{
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;

    public Tenant Tenant { get; private set; } = null!;

    public bool IsActive { get; private set; }
    public DateTime JoinedAt { get; private set; }

    public ICollection<TenantMembershipRole> Roles { get; private set; } = new List<TenantMembershipRole>();

    private TenantMembership()
    {
    }

    public TenantMembership(
        Guid tenantId,
        Guid userId,
        IEnumerable<TenantRole> roles) : base(tenantId)
    {
        if (userId == Guid.Empty)
        {
            throw new DomainValidationException(DomainErrorMessages.TenantMembership.UserIdRequired);
        }

        UserId = userId;
        IsActive = true;
        JoinedAt = DateTime.UtcNow;
        ReplaceRoles(roles);
    }

    public void ReplaceRoles(IEnumerable<TenantRole> roles)
    {
        if (!IsActive)
        {
            throw new DomainBusinessRuleException(DomainErrorMessages.TenantRole.CannotChangeRevokedMembershipRoles);
        }

        var normalizedRoles = NormalizeRoles(roles);
        Roles.Clear();
        foreach (var role in normalizedRoles)
        {
            Roles.Add(new TenantMembershipRole(TenantId, Id, role));
        }
    }

    public void MergeRoles(IEnumerable<TenantRole> roles)
    {
        if (!IsActive)
        {
            throw new DomainBusinessRuleException(DomainErrorMessages.TenantRole.CannotChangeRevokedMembershipRoles);
        }

        var existingRoleIds = Roles.Select(x => x.RoleId).ToHashSet();
        foreach (var role in NormalizeRoles(roles))
        {
            if (existingRoleIds.Add(role.Id))
            {
                Roles.Add(new TenantMembershipRole(TenantId, Id, role));
            }
        }
    }

    public void Revoke() => IsActive = false;

    private IReadOnlyList<TenantRole> NormalizeRoles(IEnumerable<TenantRole> roles)
    {
        var normalizedRoles = roles?.ToList() ?? [];
        if (normalizedRoles.Count == 0)
        {
            throw new DomainValidationException(DomainErrorMessages.TenantRole.AtLeastOneRoleRequired);
        }

        if (normalizedRoles.Any(x => x.TenantId != TenantId))
        {
            throw new DomainValidationException(DomainErrorMessages.TenantRole.RoleTenantMismatch);
        }

        if (normalizedRoles.Any(x => !x.IsActive))
        {
            throw new DomainValidationException(DomainErrorMessages.TenantRole.InactiveRole);
        }

        var duplicates = normalizedRoles
            .GroupBy(x => x.Id)
            .Any(x => x.Count() > 1);
        if (duplicates)
        {
            throw new DomainValidationException(DomainErrorMessages.TenantRole.DuplicateRole);
        }

        return normalizedRoles;
    }
}
