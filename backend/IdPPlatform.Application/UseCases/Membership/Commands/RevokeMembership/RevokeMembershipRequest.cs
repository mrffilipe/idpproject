namespace IdPPlatform.Application.UseCases.Membership.Commands.RevokeMembership;

public sealed record RevokeMembershipRequest
{
    public required Guid MembershipId { get; init; }
}
