using IdPPlatform.Domain.Enums;

namespace IdPPlatform.Application.UseCases.Application.Commands.CreateApplicationClient;

public sealed record CreateApplicationClientRequest
{
    public required Guid TenantId { get; init; }

    public required Guid ApplicationId { get; init; }

    public required string ClientId { get; init; }

    public string? ClientSecretHash { get; init; }

    public required ClientType ClientType { get; init; }

    public required string RedirectUris { get; init; }

    public required string AllowedScopes { get; init; }

    public required int AccessTokenTtlSeconds { get; init; }
}
