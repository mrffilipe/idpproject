namespace IdPPlatform.Application.UseCases.Platform.Dtos;

public sealed record BootstrapPlatformResult
{
    public required bool IsConfigured { get; init; }
    public required Guid RootUserId { get; init; }
    public required Guid TenantId { get; init; }
    public required Guid ApplicationId { get; init; }
    public required string OauthClientId { get; init; }
}
