using DTOs.ClaimDTOs;
using DTOs.EmailSendingDTO;
using Repositories.Commons;
using BusinessObjects;
using Repositories.Helpers;


namespace Services.Interfaces
{
    public interface IClaimService
    {
        Task<ApiResult<ClaimFormDTO>> GetClaimFormData();
        Task<ApiResult<ClaimResponseDTO>> GetClaimById(Guid claimId);
        Task<ApiResult<PagedList<ClaimRequest>>> GetClaim(ClaimParams claimParam);
        Task<ApiResult<ResponseCreatedClaimDTO>> CreateNewClaim(ClaimCreateDTO Claim);
        Task<ApiResult<object>> UpdateClaim(ClaimToUpdateDTO claim);
        Task<(ApiResult<object> Result, SubmittedClaimEmailDTO EmailData)> SubmitClaim(Guid claimId);
        Task<(ApiResult<object> Result, ReturnClaimEmailDTO EmailData)> ReturnClaim(Guid claimId, ReturnClaimDTO claimDTO);
        Task<ApiResult<MemoryStream>> DownloadClaim(ClaimListDTO downloadClaim);
        Task<ApiResult<object>> ApproveClaimAsync(Guid claimId, ClaimStatusDTO remark);
        Task<ApiResult<object>> RejectClaimAsync(Guid claimId, ClaimStatusDTO remark);
        Task<ApiResult<object>> CancelClaimAsync(Guid claimId);
        Task<ApiResult<object>> ApproveClaimsAsync(ClaimListDTO claims);
        Task<ApiResult<object>> PaidClaimsAsync(ClaimListDTO claims);

        Task<List<ClaimRequest>> GetAllClaimsInSpecifedStatusAsync(string status);

        Task<List<ClaimRequest>> GetAllClaimsForCreatorAsync(string status);

        //Task<ApiResult<object>> PaidClaimAsync(Guid claimId, ClaimStatusDTO remark);

        Task<ApiResult<List<ClaimResponseDTO>>> GetMyClaimsByStatus(string status);
        Task<ApiResult<List<ClaimResponseDTO>>> GetClaimsForApproval(string status);



    }
}
