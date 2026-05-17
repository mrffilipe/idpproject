using IdPPlatform.Domain.Common;
using IdPPlatform.Domain.Exceptions;
using IdPPlatform.Domain.ValueObjects;

namespace IdPPlatform.Domain.Entities;

public class User : BaseEntity
{
    public EmailAddress Email { get; private set; } = null!;
    public string DisplayName { get; private set; } = string.Empty;
    public PhotoUrl? PhotoUrl { get; private set; }
    public bool IsActive { get; private set; }

    /// <summary>
    /// Indica administrador global da plataforma IdP. Único caminho para <c>true</c>:
    /// bootstrap inicial (<c>POST /v1/platform/bootstrap</c> → <see cref="PromoteToPlatformAdministrator"/>).
    /// Não há revogação no domínio; o banco permite no máximo um registro com esta flag (índice único filtrado).
    /// Em runtime gera a claim JWT <c>prole=plat_admin</c>.
    /// </summary>
    public bool IsPlatformAdmin { get; private set; }

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
        PhotoUrl = photoUrl;
        IsActive = true;
        IsPlatformAdmin = false;
    }

    public void UpdateProfile(string displayName, string? photoUrl)
    {
        if (string.IsNullOrWhiteSpace(displayName))
        {
            throw new DomainValidationException(DomainErrorMessages.User.DisplayNameRequired);
        }

        DisplayName = displayName.Trim();
        PhotoUrl = photoUrl;
    }

    /// <summary>
    /// Promove o usuário a administrador de plataforma. Deve ser invocado apenas no bootstrap inicial,
    /// quando ainda não existe outro administrador. Não pode ser revertido por métodos do domínio.
    /// </summary>
    public void PromoteToPlatformAdministrator()
    {
        IsPlatformAdmin = true;
    }
}
