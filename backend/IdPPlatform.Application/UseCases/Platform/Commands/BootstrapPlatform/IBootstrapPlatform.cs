using IdPPlatform.Application.UseCases.Platform.Dtos;

namespace IdPPlatform.Application.UseCases.Platform.Commands.BootstrapPlatform;

public interface IBootstrapPlatform
{
    Task<BootstrapPlatformResult> ExecuteAsync(BootstrapPlatformRequest request, CancellationToken cancellationToken = default);
}
