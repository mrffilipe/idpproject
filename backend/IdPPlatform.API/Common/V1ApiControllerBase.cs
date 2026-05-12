using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;

namespace IdPPlatform.API.Common;

[ApiController]
[ApiVersion("1.0")]
[Route("v{version:apiVersion}/[controller]")]
public abstract class V1ApiControllerBase : ControllerBase
{
}
