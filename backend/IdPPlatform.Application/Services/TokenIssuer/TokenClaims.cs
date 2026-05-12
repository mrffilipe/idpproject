namespace IdPPlatform.Application.Services.TokenIssuer;

public sealed record TokenClaims
{
    public required Guid UserId { get; init; }

    public required Guid SessionId { get; init; }

    public required string Email { get; init; }

    public Guid? TenantId { get; init; }

    public Guid? MembershipId { get; init; }

    public required IReadOnlyList<string> TenantRoles { get; init; }

    public required IReadOnlyList<string> Amr { get; init; }
}
