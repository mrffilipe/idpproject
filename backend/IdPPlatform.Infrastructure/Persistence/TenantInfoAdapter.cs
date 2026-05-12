using IdPPlatform.Domain.Entities;
using TenancyKit.Abstractions;

namespace IdPPlatform.Infrastructure.Persistence;

public sealed class TenantInfoAdapter : ITenantInfo
{
    public TenantInfoAdapter(Tenant tenant)
    {
        Id = tenant.Id.ToString("D");
        Identifier = tenant.Key;
        Name = tenant.Name;
    }

    public string Id { get; }
    public string Identifier { get; }
    public string Name { get; }
}
