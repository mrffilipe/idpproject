using IdPPlatform.Application.UseCases.Application.Dtos;

namespace IdPPlatform.Application.UseCases.Application.Queries.GetApplicationById;

public interface IGetApplicationById
{
    Task<ApplicationDto?> ExecuteAsync(GetApplicationByIdRequest request, CancellationToken cancellationToken = default);
}
