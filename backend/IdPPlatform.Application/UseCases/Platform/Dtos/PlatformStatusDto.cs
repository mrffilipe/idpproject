namespace IdPPlatform.Application.UseCases.Platform.Dtos;

public sealed record PlatformStatusDto
{
    public required bool IsConfigured { get; init; }
    public required bool RequiresBootstrap { get; init; }
    public string? OauthClientId { get; init; }
}
