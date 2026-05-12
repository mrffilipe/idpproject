namespace IdPPlatform.Application.UseCases.User.Queries.GetUserByEmail;

public sealed record GetUserByEmailRequest
{
    public required string Email { get; init; }
}
