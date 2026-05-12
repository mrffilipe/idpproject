namespace IdPPlatform.Application.UseCases.Application.Commands.CreateApplicationClient;

public interface ICreateApplicationClient
{
    Task<Guid> ExecuteAsync(CreateApplicationClientRequest request, CancellationToken cancellationToken = default);
}
