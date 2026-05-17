namespace IdPPlatform.Application.UseCases.Auth.Commands.SubscribeTenant;

public sealed record SubscribeTenantRequest
{
    public required Guid ActorUserId { get; init; }

    public required Guid SessionId { get; init; }

    public required string TenantName { get; init; }

    public required string TenantKey { get; init; }

    public string? PlanCode { get; init; }

    public string? ExternalCustomerId { get; init; }
}
