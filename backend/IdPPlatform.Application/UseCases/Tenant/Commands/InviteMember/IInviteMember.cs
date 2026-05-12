namespace IdPPlatform.Application.UseCases.Tenant.Commands.InviteMember;

public interface IInviteMember
{
    Task<Guid> ExecuteAsync(InviteMemberRequest request, CancellationToken cancellationToken = default);
}
