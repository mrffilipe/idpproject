using IdPPlatform.Application.Services.UnitOfWork;
using IdPPlatform.Domain.Entities;
using IdPPlatform.Domain.Repositories;

namespace IdPPlatform.Application.UseCases.User.Commands.LinkExternalIdentity;

public sealed class LinkExternalIdentity : ILinkExternalIdentity
{
    private readonly IExternalIdentityRepository _externalIdentities;
    private readonly IUnitOfWork _unitOfWork;

    public LinkExternalIdentity(IExternalIdentityRepository externalIdentities, IUnitOfWork unitOfWork)
    {
        _externalIdentities = externalIdentities;
        _unitOfWork = unitOfWork;
    }

    public async Task ExecuteAsync(LinkExternalIdentityRequest request, CancellationToken cancellationToken = default)
    {
        var existing = await _externalIdentities.GetByProviderAndProviderUserIdAsync(
            request.Provider,
            request.ProviderUserId,
            cancellationToken);

        if (existing is not null)
        {
            return;
        }

        var externalIdentity = new ExternalIdentity(
            request.UserId,
            request.Provider,
            request.ProviderUserId,
            request.Email);
        await _externalIdentities.AddAsync(externalIdentity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
