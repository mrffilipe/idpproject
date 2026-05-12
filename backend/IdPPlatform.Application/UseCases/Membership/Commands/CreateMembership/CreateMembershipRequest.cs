namespace IdPPlatform.Application.UseCases.Membership.Commands.CreateMembership;

public sealed record CreateMembershipRequest
{
    public required Guid UserId { get; init; }

    public required Guid TenantId { get; init; }

    public required IReadOnlyCollection<string> Roles { get; init; }
}
