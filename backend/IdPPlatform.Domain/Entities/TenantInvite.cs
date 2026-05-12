using IdPPlatform.Domain.Common;
using IdPPlatform.Domain.Exceptions;
using IdPPlatform.Domain.ValueObjects;

namespace IdPPlatform.Domain.Entities;

public sealed class TenantInvite : TenantEntity
{
    public EmailAddress Email { get; private set; } = null!;
    public string TokenHash { get; private set; } = string.Empty;
    public DateTime ExpiresAt { get; private set; }
    public DateTime? ConsumedAt { get; private set; }
    public Guid InvitedByUserId { get; private set; }

    public ICollection<TenantInviteRole> Roles { get; private set; } = new List<TenantInviteRole>();

    private TenantInvite()
    {
    }

    public TenantInvite(
        Guid tenantId,
        string email,
        IEnumerable<TenantRole> roles,
        string tokenHash,
        DateTime expiresAt,
        Guid invitedByUserId) : base(tenantId)
    {
        if (invitedByUserId == Guid.Empty)
        {
            throw new DomainValidationException(DomainErrorMessages.TenantInvite.InvitedByUserIdRequired);
        }

        if (string.IsNullOrWhiteSpace(tokenHash))
        {
            throw new DomainValidationException(DomainErrorMessages.TenantInvite.TokenHashRequired);
        }

        Email = new EmailAddress(email);
        TokenHash = tokenHash.Trim();
        ExpiresAt = expiresAt;
        InvitedByUserId = invitedByUserId;
        ReplaceRoles(roles);
    }

    public bool IsExpired() => ExpiresAt <= DateTime.UtcNow;

    public bool IsConsumed() => ConsumedAt.HasValue;

    public void Consume()
    {
        if (IsConsumed())
        {
            return;
        }

        ConsumedAt = DateTime.UtcNow;
    }

    public void ReplaceRoles(IEnumerable<TenantRole> roles)
    {
        var normalizedRoles = NormalizeRoles(roles);
        Roles.Clear();
        foreach (var role in normalizedRoles)
        {
            Roles.Add(new TenantInviteRole(TenantId, Id, role));
        }
    }

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
