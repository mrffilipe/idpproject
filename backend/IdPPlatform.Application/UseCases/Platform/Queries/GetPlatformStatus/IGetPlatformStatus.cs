using IdPPlatform.Application.UseCases.Platform.Dtos;

namespace IdPPlatform.Application.UseCases.Platform.Queries.GetPlatformStatus;

public interface IGetPlatformStatus
{
    Task<PlatformStatusDto> ExecuteAsync(CancellationToken cancellationToken = default);
}
