namespace IdPPlatform.Application.UseCases.Tenant.Commands.InviteMember;

public sealed record InviteMemberRequest
{
    public required Guid TenantId { get; init; }

    public required string Email { get; init; }

    public required IReadOnlyCollection<string> Roles { get; init; }

    public required Guid InvitedByUserId { get; init; }
}
