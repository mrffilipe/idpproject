using IdPPlatform.Application.UseCases.User.Dtos;

namespace IdPPlatform.Application.UseCases.User.Queries.GetUserByEmail;

public interface IGetUserByEmail
{
    Task<UserDto?> ExecuteAsync(GetUserByEmailRequest request, CancellationToken cancellationToken = default);
}
