using BusinessObjects;
using DTOs.ClaimDTOs;
using DTOs.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Repositories.Commons;
using Repositories.Helpers;
using Repositories.Interfaces;
using Services.Gmail;
using Services.Interfaces;
using WebAPI.Middlewares;

namespace WebAPI.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [AuthorizationFilter]
    public class ClaimsController : ControllerBase
    {
        private readonly IClaimService _claimService;
        private readonly IClaimDetailService _claimDetailService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly EmailService _emailService;
        private readonly ILogger<ClaimsController> _logger;

        public ClaimsController(
            IClaimService claimService,
            IClaimDetailService claimDetailService,
            IUnitOfWork unitOfWork,
            EmailService emailService,
            ILogger<ClaimsController> logger
            )
        {
            _claimService = claimService;
            _claimDetailService = claimDetailService;
            _unitOfWork = unitOfWork;
            _emailService = emailService;
            _logger = logger;
        }

        [HttpGet("init")]
        public async Task<IActionResult> Get()
        {
            var result = await _claimService.GetClaimFormData();
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> Get([FromQuery] ClaimParams claimParams)
        {
            var result = await _claimService.GetClaim(claimParams);
            return Ok(result);
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var result = await _claimService.GetClaimById(id);
            return Ok(result);
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateAsync(ClaimCreateDTO claim)
        {
        
            var result = await _claimService.CreateNewClaim(claim);
            return Ok(result);

        }

        [HttpPut("update")]
        public async Task<IActionResult> UpdateAsync([FromBody]ClaimToUpdateDTO claim)
        {
            try
            {
                var result = await _claimService.UpdateClaim(claim);
                if (result.IsSuccess)
                {
                    return Ok(result);
                }
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResult<object>.Fail(ex));
            }
        }  

        [HttpPut("submit/{id}")]
        public async Task<IActionResult> SubmitAsync(Guid id)
        {          
            var (result, emailData) = await _claimService.SubmitClaim(id);
                
            if (result.IsSuccess && emailData != null)
            {
                try
                {
                    // Send email asynchronously without waiting for it to complete
                    _ = Task.Run(() => _emailService.toSendSubmitClaimRequestEmailAsync(
                        emailData.PMName,
                        emailData.PMMail, 
                        emailData.ProjectName, 
                        emailData.StaffId,
                        emailData.StaffName,
                        "https://example.com"
                    ));
                }
                catch (Exception ex)
                {
                    return BadRequest(ApiResult<object>.Fail(ex));
                }
            }               
            // Return the API result (which doesn't include the email data)
            return Ok(result);
        }

        //[AuthorizationFilter(RoleEnums.APPROVER)]
        [HttpPut("return/{id}")]
        public async Task<IActionResult> ReturnAsync(Guid id, ReturnClaimDTO claimDTO)
        {
            try
            {
                // Get result tuple from service
                var (result, emailData) = await _claimService.ReturnClaim(id, claimDTO);

                if (result.IsSuccess && emailData != null)
                {
                    try
                    {
                        // Send email asynchronously without waiting for it to complete
                        _ = Task.Run(() => _emailService.toSendReturnNotificationEmailAsync(
                            emailData.ProjectName,
                            emailData.StaffId,
                            emailData.StaffEmail,
                            emailData.StaffName,
                            "https://example.com"
                        ));
                    }
                    catch (Exception ex)
                    {
                        return BadRequest(ApiResult<object>.Fail(ex));
                    }
                }

                // Return the API result (which doesn't include the email data)
                return result.IsSuccess ? Ok(result) : BadRequest(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResult<object>.Fail(ex));
            }

        }

        //[AuthorizationFilter(RoleEnums.FINANCE)]
        [HttpGet("download")]
        public async Task<IActionResult> DownloadClaim([FromQuery] ClaimListDTO downloadClaimRequest)
        {
            try
            {
                var result = await _claimService.DownloadClaim(downloadClaimRequest);

                if (result.IsSuccess)
                {
                    var fileName = "Template_Export_Claim.xlsx";
                    return File(result.Data, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
                }
                return BadRequest(result);
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResult<object>.Fail(ex));
            }
        }

        [HttpGet("my-claim")]
        public async Task<IActionResult> GetMyClaimsByStatus([FromQuery] string status)
        {
            var claims = await _claimService.GetMyClaimsByStatus(status);
            return Ok(claims);
        }

        [HttpGet("claim-for-approval")]
        public async Task<IActionResult> GetClaimsByStatuses([FromQuery] string status)
        {
            var claims = await _claimService.GetClaimsForApproval(status);
            return Ok(claims);
        }
        [HttpPut("approve/{id}")]
        public async Task<IActionResult> ApproveClaim(Guid id, ClaimStatusDTO remark)
        {
            var result = await _claimService.ApproveClaimAsync(id, remark);
            return Ok(result);
        }
        [HttpPut("approve")]
        public async Task<IActionResult> ApproveClaims([FromQuery] ClaimListDTO claims)
        {
            var result = await _claimService.ApproveClaimsAsync(claims);
            return Ok(result);
        }
        [HttpPut("paid")]
        public async Task<IActionResult> PaidClaims([FromQuery] ClaimListDTO claims)
        {
            var result = await _claimService.PaidClaimsAsync(claims);
            return Ok(result);
        }

        [HttpPut("reject/{id}")]
        public async Task<IActionResult> RejectClaim(Guid id, ClaimStatusDTO remark)
        {
            var result = await _claimService.RejectClaimAsync(id, remark);
            return Ok(result);
        }

        [HttpPut("cancel/{id}")]
        public async Task<IActionResult> CancelClaim(Guid id)
        {
            var result = await _claimService.CancelClaimAsync(id);
            return Ok(result);
        }

        //[HttpPut("Paid/{id}")]
        ////[Authorize(Roles = "Finance")]

        //public async Task<IActionResult> PaidClaim(Guid id, ClaimStatusDTO remark)
        //{
        //    var result = await _claimService.PaidClaimAsync(id, remark);
        //    return Ok(result);
        //}
    }
}
