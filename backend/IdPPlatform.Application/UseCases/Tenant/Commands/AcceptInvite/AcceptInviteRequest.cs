namespace IdPPlatform.Application.UseCases.Tenant.Commands.AcceptInvite;

public sealed record AcceptInviteRequest
{
    public required string InviteToken { get; init; }

    public required string IdentityToken { get; init; }
}
