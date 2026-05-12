namespace IdPPlatform.Application.UseCases.Membership.Commands.UpdateMembershipRole;

public sealed record UpdateMembershipRoleRequest
{
    public required Guid MembershipId { get; init; }

    public required IReadOnlyCollection<string> Roles { get; init; }
}
