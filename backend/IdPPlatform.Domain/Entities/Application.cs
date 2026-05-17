using IdPPlatform.Domain.Common;
using IdPPlatform.Domain.Enums;
using IdPPlatform.Domain.Exceptions;

namespace IdPPlatform.Domain.Entities;

public class Application : BaseEntity
{
    public string Name { get; private set; } = string.Empty;
    public string Slug { get; private set; } = string.Empty;
    public ApplicationType Type { get; private set; }
    public bool IsFirstParty { get; private set; }

    public ICollection<ApplicationClient> Clients { get; private set; } = new List<ApplicationClient>();
    public ICollection<ApplicationTenant> Tenants { get; private set; } = new List<ApplicationTenant>();

    private Application()
    {
    }

    public Application(
        string name,
        string slug,
        ApplicationType type,
        bool isFirstParty = true)
    {
        if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(slug))
        {
            throw new DomainValidationException(DomainErrorMessages.Application.NameAndSlugRequired);
        }

        Name = name.Trim();
        Slug = slug.Trim().ToLowerInvariant();
        Type = type;
        IsFirstParty = isFirstParty;
    }
}
