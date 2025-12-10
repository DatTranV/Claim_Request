using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Repositories.Interfaces;

namespace Repositories.Commons;

public class ClaimsService : IClaimsService
{
    public ClaimsService(IHttpContextAccessor httpContextAccessor)
    {
        // todo implementation to get the current userId
        var identity = httpContextAccessor.HttpContext?.User?.Identity as ClaimsIdentity;
        var extractedId = identity?.Claims.FirstOrDefault(x => x.Type == "uid" )?.Value ?? string.Empty;
        GetCurrentUserId = string.IsNullOrEmpty(extractedId) ? Guid.Empty : Guid.Parse(extractedId);
        
    }

    public Guid GetCurrentUserId { get; }
    
}