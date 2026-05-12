using IdPPlatform.Domain.Common;
using IdPPlatform.Domain.Exceptions;
using IdPPlatform.Domain.ValueObjects;

namespace IdPPlatform.Domain.Entities;

public class User : BaseEntity
{
    public EmailAddress Email { get; private set; } = null!;
    public string DisplayName { get; private set; } = string.Empty;
    public string? PhotoUrl { get; private set; }
    public bool IsActive { get; private set; }

    public ICollection<ExternalIdentity> ExternalIdentities { get; private set; } = new List<ExternalIdentity>();
    public ICollection<TenantMembership> Memberships { get; private set; } = new List<TenantMembership>();

    private User()
    {
    }

    public User(
        EmailAddress email,
        string displayName,
        string? photoUrl = null)
    {
        if (string.IsNullOrWhiteSpace(displayName))
        {
            throw new DomainValidationException(DomainErrorMessages.User.DisplayNameRequired);
        }

        Email = email;
        DisplayName = displayName.Trim();
        PhotoUrl = photoUrl?.Trim();
        IsActive = true;
    }

    public void UpdateProfile(string displayName, string? photoUrl)
    {
        if (string.IsNullOrWhiteSpace(displayName))
        {
            throw new DomainValidationException(DomainErrorMessages.User.DisplayNameRequired);
        }

        DisplayName = displayName.Trim();
        PhotoUrl = photoUrl?.Trim();
    }
}
