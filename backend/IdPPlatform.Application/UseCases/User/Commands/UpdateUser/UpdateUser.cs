using IdPPlatform.Application.Services.UnitOfWork;
using IdPPlatform.Domain.Exceptions;
using IdPPlatform.Domain.Repositories;

namespace IdPPlatform.Application.UseCases.User.Commands.UpdateUser;

public sealed class UpdateUser : IUpdateUser
{
    private readonly IUserRepository _users;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateUser(IUserRepository users, IUnitOfWork unitOfWork)
    {
        _users = users;
        _unitOfWork = unitOfWork;
    }

    public async Task ExecuteAsync(UpdateUserRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _users.GetForUpdateAsync(request.UserId, cancellationToken)
            ?? throw new DomainNotFoundException(DomainErrorMessages.User.UserNotFound);

        user.UpdateProfile(request.DisplayName, request.PhotoUrl);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
