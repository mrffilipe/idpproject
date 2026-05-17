using IdPPlatform.Domain.Enums;

namespace IdPPlatform.Application.UseCases.Platform.Commands.BootstrapPlatform;

public sealed record BootstrapPlatformRequest
{
    public required string IdentityToken { get; init; }
    public required string TenantName { get; init; }
    public required string TenantKey { get; init; }
    public required string ApplicationName { get; init; }
    public required string ApplicationSlug { get; init; }
    public required ApplicationType ApplicationType { get; init; }
    public required string ClientId { get; init; }
    public required ClientType ClientType { get; init; }
    public string? ClientSecret { get; init; }
    public required IReadOnlyList<string> RedirectUris { get; init; }
    public required IReadOnlyList<string> AllowedScopes { get; init; }
    public required int AccessTokenTtlSeconds { get; init; }
    public string? UserAgent { get; init; }
    public string? IpAddress { get; init; }
}
