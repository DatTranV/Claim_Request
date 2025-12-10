using Repositories.Commons;
using DTOs.AuditTrailDTOs;

namespace Services.Interfaces
{
    public interface IAuditTrailService
    {
        Task<ApiResult<List<AuditTrailResponseV2>>> GetAllAuditTrailByClaimIdAsync(Guid claimId);
        Task<ApiResult<List<AuditTrailResponseV2>>> GetAllAuditTrailAsync();
    }
}