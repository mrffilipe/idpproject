using IdPPlatform.Application.UseCases.User.Dtos;
using IdPPlatform.Application.UseCases.User.Queries.GetUserByEmail;
using IdPPlatform.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace IdPPlatform.Infrastructure.Queries.User;

public sealed class GetUserByEmail : IGetUserByEmail
{
    private readonly ApplicationDbContext _context;

    public GetUserByEmail(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserDto?> ExecuteAsync(
        GetUserByEmailRequest request,
        CancellationToken cancellationToken = default)
    {
        var normalized = request.Email.Trim().ToLowerInvariant();
        var user = await _context.Users
            .AsNoTracking()
            .Include(x => x.Memberships)
            .ThenInclude(x => x.Tenant)
            .Include(x => x.Memberships)
            .ThenInclude(x => x.Roles)
            .ThenInclude(x => x.Role)
            .FirstOrDefaultAsync(x => x.Email.Value == normalized, cancellationToken);

        if (user is null)
        {
            return null;
        }

        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
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
