using IdPPlatform.Application.Common;
using IdPPlatform.Application.Exceptions;
using IdPPlatform.Application.Services.UnitOfWork;
using IdPPlatform.Domain.Constants;
using IdPPlatform.Domain.Entities;
using IdPPlatform.Domain.Repositories;

namespace IdPPlatform.Application.UseCases.Application.Commands.CreateApplicationClient;

public sealed class CreateApplicationClient : ICreateApplicationClient
{
    private readonly IApplicationClientRepository _clients;
    private readonly IUnitOfWork _unitOfWork;

    public CreateApplicationClient(
        IApplicationClientRepository clients,
        IUnitOfWork unitOfWork)
    {
        _clients = clients;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> ExecuteAsync(CreateApplicationClientRequest request, CancellationToken cancellationToken = default)
    {
        if (!request.ActorPlatformRoles.Any(role => PlatformRoleDefaults.AdministrativeKeys.Contains(role)))
        {
            throw new ForbiddenApplicationException(ApplicationErrorMessages.Auth.UserHasNoTenantAccess);
        }

        var client = new ApplicationClient(
            request.ApplicationId,
            request.ClientId,
            request.ClientSecretHash,
            request.ClientType,
            ApplicationClientListFields.ToRedirectUrisJson(request.RedirectUris),
            ApplicationClientListFields.ToAllowedScopesJson(request.AllowedScopes),
            request.AccessTokenTtlSeconds);

        await _clients.AddAsync(client, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return client.Id;
    }
}
