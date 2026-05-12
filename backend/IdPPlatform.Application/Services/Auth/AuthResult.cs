namespace IdPPlatform.Application.Services.Auth;

public sealed record AuthResult
{
    public required string AccessToken { get; init; }

    public required string RefreshToken { get; init; }

    public required int ExpiresInSeconds { get; init; }

    public required Guid UserId { get; init; }

    public required string Email { get; init; }

    public Guid? TenantId { get; init; }

    public Guid? MembershipId { get; init; }

    public IReadOnlyList<string> TenantRoles { get; init; } = [];

    public IReadOnlyList<AuthTenantSummaryDto> Tenants { get; init; } = [];
}

public sealed record AuthTenantSummaryDto
{
    public required Guid TenantId { get; init; }

    public required string TenantName { get; init; }

    public required string TenantKey { get; init; }

    public required IReadOnlyList<string> Roles { get; init; }
}
