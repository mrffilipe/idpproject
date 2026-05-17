using IdPPlatform.Application.UseCases.Platform.Dtos;
using IdPPlatform.Application.UseCases.Platform.Queries.GetPlatformStatus;
using IdPPlatform.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace IdPPlatform.Infrastructure.Queries.Platform;

public sealed class GetPlatformStatus : IGetPlatformStatus
{
    private readonly ApplicationDbContext _context;

    public GetPlatformStatus(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PlatformStatusDto> ExecuteAsync(CancellationToken cancellationToken = default)
    {
        var configuration = await _context.PlatformConfigurations
            .AsNoTracking()
            .OrderBy(x => x.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        var hasAnyPlatformAdmin = await _context.Users
            .AsNoTracking()
            .AnyAsync(x => x.IsPlatformAdmin, cancellationToken);

        var isConfigured = configuration?.IsBootstrapped == true && configuration.RootUserId.HasValue && hasAnyPlatformAdmin;
        return new PlatformStatusDto
        {
            IsConfigured = isConfigured,
            RequiresBootstrap = !isConfigured,
            OauthClientId = isConfigured ? configuration?.OauthClientId : null
        };
    }
}
