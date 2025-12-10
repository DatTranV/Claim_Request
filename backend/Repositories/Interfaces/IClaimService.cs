using BusinessObjects;

namespace Repositories.Interfaces;

public interface IClaimsService
{
    public Guid GetCurrentUserId { get; }

}