using IdPPlatform.Application.Services.UnitOfWork;
using IdPPlatform.Domain.Entities;
using IdPPlatform.Domain.Repositories;

namespace IdPPlatform.Application.UseCases.Application.Commands.CreateApplicationClient;

public sealed class CreateApplicationClient : ICreateApplicationClient
{
    private readonly IApplicationClientRepository _clients;
    private readonly IUnitOfWork _unitOfWork;

    public CreateApplicationClient(IApplicationClientRepository clients, IUnitOfWork unitOfWork)
    {
        _clients = clients;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> ExecuteAsync(CreateApplicationClientRequest request, CancellationToken cancellationToken = default)
    {
        var client = new ApplicationClient(
            request.TenantId,
            request.ApplicationId,
            request.ClientId,
            request.ClientSecretHash,
            request.ClientType,
            request.RedirectUris,
            request.AllowedScopes,
            request.AccessTokenTtlSeconds);

        await _clients.AddAsync(client, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return client.Id;
    }
}
