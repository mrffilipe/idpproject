namespace IdPPlatform.Application.UseCases.Tenant.Commands.AcceptInvite;

public interface IAcceptInvite
{
    Task<Guid> ExecuteAsync(AcceptInviteRequest request, CancellationToken cancellationToken = default);
}
