namespace IdPPlatform.Application.UseCases.User.Commands.LinkExternalIdentity;

public interface ILinkExternalIdentity
{
    Task ExecuteAsync(LinkExternalIdentityRequest request, CancellationToken cancellationToken = default);
}
