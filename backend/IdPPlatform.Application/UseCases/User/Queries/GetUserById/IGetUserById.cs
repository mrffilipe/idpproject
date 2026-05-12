using IdPPlatform.Application.UseCases.User.Dtos;

namespace IdPPlatform.Application.UseCases.User.Queries.GetUserById;

public interface IGetUserById
{
    Task<UserDto?> ExecuteAsync(GetUserByIdRequest request, CancellationToken cancellationToken = default);
}
