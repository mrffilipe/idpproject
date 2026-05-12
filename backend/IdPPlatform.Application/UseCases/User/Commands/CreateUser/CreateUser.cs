using IdPPlatform.Application.Services.UnitOfWork;
using IdPPlatform.Domain.Exceptions;
using IdPPlatform.Domain.Repositories;
using IdPPlatform.Domain.ValueObjects;

namespace IdPPlatform.Application.UseCases.User.Commands.CreateUser;

public sealed class CreateUser : ICreateUser
{
    private readonly IUserRepository _users;
    private readonly IUnitOfWork _unitOfWork;

    public CreateUser(IUserRepository users, IUnitOfWork unitOfWork)
    {
        _users = users;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> ExecuteAsync(CreateUserRequest request, CancellationToken cancellationToken = default)
    {
        var email = new EmailAddress(request.Email);
        if (await _users.EmailAlreadyExistsAsync(email, cancellationToken))
        {
            throw new DomainBusinessRuleException(DomainErrorMessages.User.EmailAlreadyExists);
        }

        var user = new Domain.Entities.User(
            email,
            request.DisplayName,
            request.PhotoUrl);
        await _users.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return user.Id;
    }
}
