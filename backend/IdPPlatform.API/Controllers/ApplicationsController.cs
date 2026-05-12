using IdPPlatform.API.Common;
using IdPPlatform.Application.UseCases.Application.Commands.CreateApplication;
using IdPPlatform.Application.UseCases.Application.Commands.CreateApplicationClient;
using IdPPlatform.Application.UseCases.Application.Queries.GetApplicationById;
using IdPPlatform.Application.UseCases.Application.Queries.ListApplications;
using IdPPlatform.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IdPPlatform.API.Controllers;

[Authorize]
public sealed class ApplicationsController : V1ApiControllerBase
{
    private readonly ICreateApplication _createApplication;
    private readonly ICreateApplicationClient _createApplicationClient;
    private readonly IGetApplicationById _getApplicationById;
    private readonly IListApplications _listApplications;

    public ApplicationsController(
        ICreateApplication createApplication,
        ICreateApplicationClient createApplicationClient,
        IGetApplicationById getApplicationById,
        IListApplications listApplications)
    {
        _createApplication = createApplication;
        _createApplicationClient = createApplicationClient;
        _getApplicationById = getApplicationById;
        _listApplications = listApplications;
    }

    [HttpPost]
    public async Task<IActionResult> CreateApplication(
        [FromBody] CreateApplicationBody body,
        CancellationToken cancellationToken)
    {
        var id = await _createApplication.ExecuteAsync(
            new CreateApplicationRequest
            {
                Name = body.Name,
                Slug = body.Slug,
                Type = body.Type
            },
            cancellationToken);

        return CreatedAtAction(nameof(GetApplicationById), new { id, version = "1.0" }, new { id });
    }

    [HttpGet]
    public async Task<IActionResult> ListApplications(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var result = await _listApplications.ExecuteAsync(
            new ListApplicationsRequest
            {
                Page = page,
                PageSize = pageSize
            },
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetApplicationById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _getApplicationById.ExecuteAsync(
            new GetApplicationByIdRequest
            {
                ApplicationId = id
            },
            cancellationToken);

        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost("{applicationId:guid}/clients")]
    public async Task<IActionResult> CreateApplicationClient(
        Guid applicationId,
        [FromBody] CreateApplicationClientBody body,
        CancellationToken cancellationToken)
    {
        var id = await _createApplicationClient.ExecuteAsync(
            new CreateApplicationClientRequest
            {
                TenantId = body.TenantId,
                ApplicationId = applicationId,
                ClientId = body.ClientId,
                ClientSecretHash = body.ClientSecretHash,
                ClientType = body.ClientType,
                RedirectUris = body.RedirectUris,
                AllowedScopes = body.AllowedScopes,
                AccessTokenTtlSeconds = body.AccessTokenTtlSeconds
            },
            cancellationToken);

        return Ok(new { id });
    }

    public sealed record CreateApplicationBody(
        string Name,
        string Slug,
        ApplicationType Type);

    public sealed record CreateApplicationClientBody(
        Guid TenantId,
        string ClientId,
        string? ClientSecretHash,
        ClientType ClientType,
        string RedirectUris,
        string AllowedScopes,
        int AccessTokenTtlSeconds);
}
