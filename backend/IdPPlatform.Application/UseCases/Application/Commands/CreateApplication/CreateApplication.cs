using IdPPlatform.Application.Services.UnitOfWork;
using IdPPlatform.Domain.Repositories;

namespace IdPPlatform.Application.UseCases.Application.Commands.CreateApplication;

public sealed class CreateApplication : ICreateApplication
{
    private readonly IApplicationRepository _applications;
    private readonly IUnitOfWork _unitOfWork;

    public CreateApplication(IApplicationRepository applications, IUnitOfWork unitOfWork)
    {
        _applications = applications;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> ExecuteAsync(CreateApplicationRequest request, CancellationToken cancellationToken = default)
    {
        var application = new Domain.Entities.Application(
            request.Name,
            request.Slug,
            request.Type);
        await _applications.AddAsync(application, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return application.Id;
    }
}
