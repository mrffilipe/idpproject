using IdPPlatform.API.Common;
using IdPPlatform.Application.Services.UserScope;
using IdPPlatform.Application.UseCases.User.Commands.UpdateUser;
using IdPPlatform.Application.UseCases.User.Queries.GetUserById;
using IdPPlatform.Application.UseCases.User.Queries.ListUserMemberships;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IdPPlatform.API.Controllers;

[Authorize]
public sealed class UsersController : V1ApiControllerBase
{
    private readonly IUserScope _userScope;
    private readonly IGetUserById _getUserById;
    private readonly IUpdateUser _updateUser;
    private readonly IListUserMemberships _listUserMemberships;

    public UsersController(
        IUserScope userScope,
        IGetUserById getUserById,
        IUpdateUser updateUser,
        IListUserMemberships listUserMemberships)
    {
        _userScope = userScope;
        _getUserById = getUserById;
        _updateUser = updateUser;
        _listUserMemberships = listUserMemberships;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMe(CancellationToken cancellationToken)
    {
        var user = await _getUserById.ExecuteAsync(
            new GetUserByIdRequest
            {
                UserId = _userScope.UserId
            },
            cancellationToken);

        return user is null ? NotFound() : Ok(user);
    }

    [HttpPatch("me")]
    public async Task<IActionResult> UpdateMe([FromBody] UpdateMeBody body, CancellationToken cancellationToken)
    {
        await _updateUser.ExecuteAsync(
            new UpdateUserRequest
            {
                UserId = _userScope.UserId,
                DisplayName = body.DisplayName,
                PhotoUrl = body.PhotoUrl
            },
            cancellationToken);

        return NoContent();
    }

    [HttpGet("me/memberships")]
    public async Task<IActionResult> ListUserMemberships(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _listUserMemberships.ExecuteAsync(
            new ListUserMembershipsRequest
            {
                UserId = _userScope.UserId,
                Page = page,
                PageSize = pageSize
            },
            cancellationToken);

        return Ok(result);
    }

    public sealed record UpdateMeBody(string DisplayName, string? PhotoUrl);
}
