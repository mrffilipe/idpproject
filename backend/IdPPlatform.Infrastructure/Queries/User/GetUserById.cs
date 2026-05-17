using IdPPlatform.Application.UseCases.User.Dtos;
using IdPPlatform.Application.UseCases.User.Queries.GetUserById;
using IdPPlatform.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace IdPPlatform.Infrastructure.Queries.User;

public sealed class GetUserById : IGetUserById
{
    private readonly ApplicationDbContext _context;

    public GetUserById(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserDto?> ExecuteAsync(
        GetUserByIdRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await _context.Users
            .AsNoTracking()
            .Include(x => x.Memberships)
            .ThenInclude(x => x.Tenant)
            .Include(x => x.Memberships)
            .ThenInclude(x => x.Roles)
            .ThenInclude(x => x.Role)
            .FirstOrDefaultAsync(x => x.Id == request.UserId, cancellationToken);

        if (user is null)
        {
            return null;
        }

        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            PhotoUrl = user.PhotoUrl,
            Memberships = user.Memberships
                .Where(x => x.IsActive)
                .Select(x => new UserMembershipDto
                {
                    MembershipId = x.Id,
                    TenantId = x.TenantId,
                    TenantName = x.Tenant.Name,
                    TenantKey = x.Tenant.Key.Value,
                    Roles = x.Roles.Select(role => role.Role.Key.Value).ToList()
                })
                .ToList()
        };
    }
}
