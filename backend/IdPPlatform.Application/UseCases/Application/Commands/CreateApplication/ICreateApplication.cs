namespace IdPPlatform.Application.UseCases.Application.Commands.CreateApplication;

public interface ICreateApplication
{
    Task<Guid> ExecuteAsync(CreateApplicationRequest request, CancellationToken cancellationToken = default);
}
