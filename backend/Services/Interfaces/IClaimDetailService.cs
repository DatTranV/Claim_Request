using DTOs.ClaimDTOs;
using Repositories.Commons;


namespace Services.Interfaces
{
    public interface IClaimDetailService
    {
        Task<ApiResult<object>> CreateNewClaimDetail(ClaimCreateDTO Claim);

    }
}
