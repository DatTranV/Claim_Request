using AutoMapper;
using BusinessObjects;
using DTOs.AuditTrailDTOs;
using DTOs.ClaimDTOs;
using DTOs.EmailSendingDTO;
using DTOs.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Repositories.Commons;
using Repositories.Helpers;
using Repositories.Interfaces;
using Services.Download;
using Services.Gmail;
using Services.Interfaces;
using Services.Mapper;
using System.Linq.Expressions;

namespace Services.Services
{
    public class ClaimService : IClaimService
    {

        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IEmailService _emailService;
        private readonly ICurrentTime _currentTime;
        public ClaimService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IEmailService service,
            ICurrentTime currentTime)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _emailService = service;
            _currentTime = currentTime;
        }

        public async Task<List<ClaimRequest>> GetAllClaimsInSpecifedStatusAsync(string status)
        {

            Expression<Func<ClaimRequest, bool>> predicate = claim => claim.Status != null && claim.Status.ToString() == status;

            var claims = await _unitOfWork.ClaimRepository.GetAllClaimHaveFilterAsync(predicate);

            return claims;
        }

        public async Task<List<ClaimRequest>> GetAllClaimsForCreatorAsync(string status)
        {

            var currentUser = await _unitOfWork.UserRepository.GetCurrentUserAsync();

            Expression<Func<ClaimRequest, bool>> predicate = claim => claim.Status != null && claim.Status.ToString() == status && claim.CreatorId == currentUser.Id;

            var claims = await _unitOfWork.ClaimRepository.GetAllClaimHaveFilterAsync(predicate);

            return claims;
        }

        public async Task<ApiResult<List<ClaimResponseDTO>>> GetMyClaimsByStatus(string statuses)
        {
            if (string.IsNullOrEmpty(statuses))
            {
                throw new ArgumentException("Statuses cannot be empty");
            }
            var statusList = statuses.Split('&').Select(s => s.Trim()).ToList();
            var claimStatuses = new List<ClaimStatus>();
            foreach (var status in statusList)
            {
                if (!ClaimStatusMapper.TryGetClaimStatus(status, out var claimStatus))
                {
                    throw new ArgumentException($"Invalid status value: {status}");
                }
                claimStatuses.Add(claimStatus);
            }
            var currentUser = await _unitOfWork.UserRepository.GetCurrentUserAsync();
            var claims = await _unitOfWork.ClaimRepository.GetQueryable()
                .Where(c => claimStatuses.Contains(c.Status) && c.CreatorId == currentUser.Id)
                .Include(c => c.Project)
                .ToListAsync();
            if (claims.IsNullOrEmpty())
            {
                return new ApiResult<List<ClaimResponseDTO>>
                {
                    Data = [],
                    Message = $"Not found claim with status {string.Join(", ", claimStatuses)} of {currentUser.FullName}",
                    IsSuccess = false
                };
            }

            return ApiResult<List<ClaimResponseDTO>>.Succeed(_mapper.Map<List<ClaimResponseDTO>>(claims), $"Get claim with status {string.Join(", ", claimStatuses)} of {currentUser.FullName} successfully");
        }

        public async Task<ApiResult<ResponseCreatedClaimDTO>> CreateNewClaim(ClaimCreateDTO claim)
        {
            var currentUser = await _unitOfWork.UserRepository.GetCurrentUserAsync();
            if (currentUser == null) {
                return ApiResult<ResponseCreatedClaimDTO>.Error(null, "Can't find current user to create claim");
            }

            claim.CreatorId = currentUser.Id;
            claim.Status = ClaimStatus.Draft.ToString();
            if (claim.Remark == null)
            {
                claim.Remark = "";
            }
      
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    long totalHours = 0;

                    foreach (var detail in claim.ClaimDetails)
                    {
                        if ((long)(detail.ToDate - detail.FromDate).TotalHours <= 0)
                        {
                            return ApiResult<ResponseCreatedClaimDTO>.Error(null, "Working hours for each claim detail must be positive");
                        }

                        totalHours += (long)(detail.ToDate - detail.FromDate).TotalHours;
                        if (totalHours < 0) 
                        {
                            return ApiResult<ResponseCreatedClaimDTO>.Error(null, "Total working hours cannot be negative");
                        }
                        detail.CreatedBy = currentUser.Id;
                        detail.CreatedAt = _currentTime.GetCurrentTime();
                    }

                    var claimRequest = _mapper.Map<ClaimRequest>(claim);
                    claimRequest.Creator = await _unitOfWork.UserRepository.GetCurrentUserAsync();
                    claimRequest.CreatedBy = claim.CreatorId;
                    claimRequest.Project = await _unitOfWork.ProjectRepository.GetByIdAsync(claim.ProjectId);
                    claimRequest.TotalWorkingHours = totalHours;
                    claimRequest.TotalClaimAmount = (int)(totalHours * (currentUser.Salary / 192));


                    if (claimRequest.Project == null)
                    {
                        return ApiResult<ResponseCreatedClaimDTO>.Error(null, "Project does not exist");
                    }

                    var result = await _unitOfWork.ClaimRepository.AddAsync(claimRequest);


                    await _unitOfWork.SaveChangeAsync();
                    await transaction.CommitAsync();

                    if (result == null)
                    {
                        return ApiResult<ResponseCreatedClaimDTO>.Error(_mapper.Map<ResponseCreatedClaimDTO>(claim), "Create failed");
                    }
                    return ApiResult<ResponseCreatedClaimDTO>.Succeed(_mapper.Map<ResponseCreatedClaimDTO>(result), "Create successfully");
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return ApiResult<ResponseCreatedClaimDTO>.Error(null, "Create failed");
                }
            }
        }

        public async Task<ApiResult<PagedList<ClaimRequest>>> GetClaim(ClaimParams claimParam)
        {
            var currentUser = await _unitOfWork.UserRepository.GetCurrentUserAsync();

            if (currentUser.RoleName != RoleEnums.FINANCE.ToString()
                || currentUser.RoleName != RoleEnums.ADMIN.ToString()
                || currentUser.RoleName != RoleEnums.APPROVER.ToString()
                )
            {
                _unitOfWork.ClaimRepository.FilterAllField(claimParam)
                    .AsQueryable();
            }

            var claims = await PagedList<ClaimRequest>.ToPagedList(_unitOfWork.ClaimRepository.FilterAllField(claimParam), claimParam.PageNumber, claimParam.PageSize);

            return ApiResult<PagedList<ClaimRequest>>.Succeed(claims, "Not implemented");
        }

        public async Task<ApiResult<ClaimResponseDTO>> GetClaimById(Guid claimId)
        {
            var claim = await _unitOfWork.ClaimRepository
                .GetByIdAsync(claimId,
                    c => c.Project!,
                    c => c.Creator!,
                    c => c.ClaimDetails!);

            if (claim == null)
            {
                return ApiResult<ClaimResponseDTO>.Error(null, "Claim not found");
            }

            var claimResponse = _mapper.Map<ClaimResponseDTO>(claim);
            claimResponse.CreatedAt = claim.CreatedAt; // Add this line to include CreatedAt

            return ApiResult<ClaimResponseDTO>.Succeed(claimResponse, "Get Claim Successfully");
        }

        public async Task<ApiResult<ClaimFormDTO>> GetClaimFormData()
        {
            var currentUser = await _unitOfWork.UserRepository.GetCurrentUserAsync();

            var userProjects = await _unitOfWork.ProjectEnrollmentRepository.GetQueryable()
                .Where(pe => pe.UserId == currentUser.Id)
                // .Include(pe => pe.Project)
                .Select(pe => new ProjectDropdownDTO
                {
                    ProjectId = pe.Project!.Id,
                    ProjectName = pe.Project.ProjectName!,
                    ProjectRole = pe.ProjectRole.ToString(),
                    StartDate = pe.Project.StartDate,
                    EndDate = pe.Project.EndDate,
                })
                .OrderBy(pe => pe.ProjectName)
                .ToListAsync();

            var response = new ClaimFormDTO
            {
                StaffName = currentUser.FullName!,
                Department = currentUser.Department.ToString() ?? "N/A",
                Salary = currentUser.Salary,
                StaffId = currentUser.Id.ToString(),
                Projects = userProjects
            };
            return new ApiResult<ClaimFormDTO>
            {
                Data = response,
                Message = "Init Claim successfully",
                IsSuccess = true
            };
        }

        public async Task<(ApiResult<object> Result, SubmittedClaimEmailDTO EmailData)> SubmitClaim(Guid claimId)
        {
            try
            {
                // Load all necessary data in one go to avoid multiple database connections
                var currentUser = await _unitOfWork.UserRepository.GetCurrentUserAsync();
                if (currentUser == null)
                {
                    return (ApiResult<object>.Error(null, "invalid credentials"), null);
                }
                var userId = currentUser.Id;
                var claimToSubmit = await _unitOfWork.ClaimRepository.GetByIdAsync(claimId, 
                    c => c.Creator, 
                    c => c.Project);
                
                if (claimToSubmit == null)
                {
                    return (ApiResult<object>.Error(null, "Claim not found"), null);
                }

                if (userId != claimToSubmit.CreatorId)
                {
                    return (ApiResult<object>.Error(null, "You have no permission to submit this claim"), null);
                }

                if (claimToSubmit.Status != ClaimStatus.Draft)
                {
                    return (ApiResult<object>.Error(null, "Claim status must be Draft"), null);
                }

                // Get PM information for email before updating claim status
                var projectEnrollment = await _unitOfWork.ProjectEnrollmentRepository
                    .GetProjectEnrolmentByProjectAndProjectRoleAsync(claimToSubmit.ProjectId, ProjectRole.ProjectManager);
                
                if (projectEnrollment == null || projectEnrollment.User == null)
                {
                    return (ApiResult<object>.Error(null, "Project manager not found"), null);
                }
                
                // Prepare email data early with all required information
                var submittedInfoToSendMail = new SubmittedClaimEmailDTO()
                {
                    PMMail = projectEnrollment.User.Email ?? "no-email@example.com",
                    PMName = projectEnrollment.User.FullName ?? "Project Manager",
                    ProjectName = claimToSubmit.Project?.ProjectName ?? "Unknown Project",
                    StaffId = claimToSubmit.CreatorId,
                    StaffName = claimToSubmit.Creator?.FullName ?? "Staff Member",
                    ClaimStatus = ClaimStatus.PendingApproval.ToString(),
                };

                // Update claim status
                claimToSubmit.Status = ClaimStatus.PendingApproval;
                claimToSubmit.ModifiedBy = userId;
                var submitStatus = await _unitOfWork.ClaimRepository.Update(claimToSubmit);

                if (submitStatus == true)
                {
                    // Get action ID
                    //var actionId = await _unitOfWork.ActionRepository.GetActionByName(UserActionEnums.SUBMIT.ToString());
                    
                    // Add audit trail
                    var auditTrail = new AuditTrail()
                    {
                        ClaimId = claimId,
                        UserAction = UserAction.Submit,
                        ActionBy = userId,
                        LoggedNote = $"Submitted by {currentUser.FullName ?? "Unknown"} on {_currentTime.GetCurrentTime()}.",
                        CreatedBy = userId
                    };
                    await _unitOfWork.AuditTrailRepository.AddAuditTrailAsync(auditTrail);
                    
                    // Save all changes at once
                    await _unitOfWork.SaveChangeAsync();

                    // Map to DTO after saving
                    //var auditTrailResponse = _mapper.Map<AuditTrailDTO>(auditTrail);

                    //create response for audit trail
                    //var createdAuditTail = await _unitOfWork.AuditTrailRepository.GetByIdAsync(auditTrail.Id, a => a.User, a => a.Action);
                    var auditTrailResponse = new AuditTrailResponse()
                    {
                        ClaimId = auditTrail.ClaimId,
                        ActionName = auditTrail.UserAction.ToString(),
                        ActionBy = auditTrail.User.UserName,
                        LoggedNote = $"Submitted by {currentUser.FullName ?? "Unknown"} on {_currentTime.GetCurrentTime()}.",
                        ActionDate = auditTrail.ActionDate,
                    };

                    // Return tuple with API result and email data separately
                    return (ApiResult<object>.Succeed(auditTrailResponse, "Submit successfully"), submittedInfoToSendMail);
                }
                
                return (ApiResult<object>.Error(null, "Submit failed"), null);
            }
            catch (Exception ex)
            {
                // Log the exception
                Console.WriteLine($"Error in SubmitClaim: {ex.Message}");
                return (ApiResult<object>.Error(null, $"An error occurred: {ex.Message}"), null);
            }
        }

        public async Task<(ApiResult<object> Result, ReturnClaimEmailDTO EmailData)> ReturnClaim(Guid claimId, ReturnClaimDTO claimDTO)
        {
            var currentUser = await _unitOfWork.UserRepository.GetCurrentUserAsync();
            var userId = currentUser.Id;

            var claimReturn = await _unitOfWork.ClaimRepository.GetByIdAsync(claimId, c => c.Project, c => c.Creator);

            var returnInfoToSendMail = new ReturnClaimEmailDTO
            {
                ProjectName = claimReturn?.Project?.ProjectName ?? "Unknown Project",
                StaffEmail = claimReturn?.Creator?.Email ?? "no-email@example.com",
                StaffId = claimReturn?.CreatorId ?? Guid.Empty,
                StaffName = claimReturn?.Creator?.FullName ?? "Unknown Member",
            };

            if (claimReturn == null)
            {
                return (ApiResult<object>.Error(null, "Claim not found"), returnInfoToSendMail);
            }

            if (claimReturn.Status != ClaimStatus.PendingApproval)
            {
                return (ApiResult<object>.Error(null, "Claim status must be Pending Approval"), returnInfoToSendMail);
            }
            if (string.IsNullOrWhiteSpace(claimDTO.Remark))
            {
                return (ApiResult<object>.Error(null, "Please input your remarks in order to return Claim."), returnInfoToSendMail);
            }

            claimReturn.Status = ClaimStatus.Draft;
            claimReturn.ModifiedBy = userId;
            claimReturn.Remark = claimDTO.Remark;

            var result = await _unitOfWork.ClaimRepository.Update(claimReturn);
            if (result)
            {
                var auditTrail = new AuditTrail
                {
                    ClaimId = claimReturn.Id,
                    UserAction = UserAction.Return,
                    ActionDate = _currentTime.GetCurrentTime(),
                    ActionBy = currentUser.Id,
                    LoggedNote = $"Returned by {currentUser.FullName ?? "Unknown"} on {_currentTime.GetCurrentTime()}.",
                    CreatedBy = currentUser.Id
                };

                await _unitOfWork.AuditTrailRepository.AddAsync(auditTrail);
                await _unitOfWork.SaveChangeAsync();

                return (ApiResult<object>.Succeed(auditTrail, "Return claim successfully"), returnInfoToSendMail);
            }
            return (ApiResult<object>.Error(null, "Return failed"), returnInfoToSendMail);
        }


        public async Task<ApiResult<MemoryStream>> DownloadClaim(ClaimListDTO downloadClaim)
        {
            var currentMonth = DateTime.UtcNow.Month;
            var currentYear = DateTime.UtcNow.Year;

            var selectedClaims = await _unitOfWork.ClaimRepository
                .GetAllAsync(c => downloadClaim.ClaimId.Any(id => id == c.Id)
                && c.Status == ClaimStatus.Paid
                && c.CreatedAt.Month == currentMonth
                && c.CreatedAt.Year == currentYear,
                c => c.Creator,
                c => c.Project);

            if (selectedClaims == null || !selectedClaims.Any())
            {
                return ApiResult<MemoryStream>.Error(null, "No claims found for download.");
            }


            var exporter = new ClaimExcelExporter();
            var memoryStream = await exporter.ExportClaimsAsync(selectedClaims);
            if (memoryStream == null)
            {
                return ApiResult<MemoryStream>.Error(null, "Grenate claim report failed.");
            }
            return ApiResult<MemoryStream>.Succeed(memoryStream, "Successfully generated claim report.");
        }
        public async Task<ApiResult<object>> ApproveClaimAsync(Guid claimId, ClaimStatusDTO remark)
        {
            try
            {
                // 1
                var user = await _unitOfWork.UserRepository.GetCurrentUserAsync();
                if (user == null || user.RoleName == RoleEnums.STAFF.ToString())
                {
                    return ApiResult<object>.Error(null, "You are not authorized to reject this claim. Only STAFF can't reject claims.");
                }

                // 1.2 get info(Project, Creator)
                var claim = await _unitOfWork.ClaimRepository.GetByIdAsync(claimId, c => c.Project, c => c.Creator);
                if (claim == null)
                {
                    return ApiResult<object>.Error(null, "Claim not found");
                }

                if (claim.Status != ClaimStatus.PendingApproval)
                {
                    return ApiResult<object>.Error(null, "Claim status must be Pending Approval");
                }

                // 3. Update Claim
                claim.Status = ClaimStatus.Approved;
                claim.ModifiedBy = user.Id;
                claim.Remark = remark.Remark;

                // 4
                bool updateResult = await _unitOfWork.ClaimRepository.Update(claim);
                if (!updateResult)
                {
                    return ApiResult<object>.Error(null, "Failed to update claim");
                }

                var auditTrail = new AuditTrail
                {
                    ClaimId = claim.Id,
                    UserAction = UserAction.Approve, // Gán trực tiếp enum Approve
                    ActionDate = DateTime.UtcNow,
                    ActionBy = user.Id,
                    LoggedNote = $"Approved by {user.FullName ?? "Unknown"} on {DateTime.UtcNow}. Remark: {remark?.Remark ?? "No remark"}",
                    CreatedBy = user.Id
                };

                await _unitOfWork.AuditTrailRepository.AddAsync(auditTrail);

                await _unitOfWork.SaveChangeAsync();

                // 7. Send email for Finance team 
                var linkToItem = $"https://your-frontend/claim/{claim.Id}";  // Link đến claim

                // Send email for Finance team (ET 2)

                // Lấy danh sách email của nhóm Finance
                var financeTeamEmails = await _unitOfWork.UserRepository.GetQueryable()
                    .Where(u => u.RoleName == RoleEnums.FINANCE.ToString())
                    .Select(u => u.Email)
                    .ToListAsync();

                // Gọi hàm SendClaimRequestEmailAsync với List<string> financeTeamEmails
                await _emailService.SendClaimRequestEmailAsync(
                    financeTeamEmails,
                    claim.Project?.ProjectName ?? "Unknown Project",
                    claim.Creator?.FullName ?? "Unknown Creator",
                    claim.Creator?.Id ?? Guid.Empty,
                    linkToItem
                );


                // send mail for  claimer (ET 3)
                if (claim.Creator != null)
                {
                    await _emailService.SendApprovalNotificationEmailAsync(
                        claim.Project?.ProjectName ?? "Unknown Project",
                        claim.Creator.Id,
                        claim.Creator.Email,
                        claim.Creator.FullName,
                        linkToItem
                    );
                }

                // 8. 
                var auditTrailResponse = new AuditTrailResponse
                {
                    ClaimId = auditTrail.ClaimId,
                    ActionName = auditTrail.UserAction.ToString(), // Sử dụng giá trị của enum UserAction
                    ActionBy = user.FullName,
                    ActionDate = auditTrail.ActionDate
                };

                return ApiResult<object>.Succeed(auditTrailResponse, "Claim approved successfully.");
            }
            catch (Exception ex)
            {
                return ApiResult<object>.Fail(ex);
            }
        }
        public async Task<ApiResult<object>> RejectClaimAsync(Guid claimId, ClaimStatusDTO remark)
        {
            try
            {
                // 1
                var user = await _unitOfWork.UserRepository.GetCurrentUserAsync();

                // 2
                var claim = await _unitOfWork.ClaimRepository.GetByIdAsync(claimId, c => c.Project, c => c.Creator);
                if (claim == null)
                {
                    return ApiResult<object>.Error(null, "Claim not found");
                }

                // 3
                if (claim.Status != ClaimStatus.PendingApproval)
                {
                    return ApiResult<object>.Error(null, "Claim status must be Pending Approval");
                }

                if (string.IsNullOrWhiteSpace(remark.Remark))
                {
                    return (ApiResult<object>.Error(null, "Please input your remarks in order to reject Claim."));
                }
                // 4
                claim.Status = ClaimStatus.Rejected;
                claim.ModifiedBy = user.Id;
                claim.Remark = remark.Remark;

                // 5
                bool updateResult = await _unitOfWork.ClaimRepository.Update(claim);
                if (!updateResult)
                {
                    return ApiResult<object>.Error(null, "Failed to update claim");
                }
                var auditTrail = new AuditTrail
                {
                    ClaimId = claim.Id,
                    UserAction = UserAction.Reject,
                    ActionDate = _currentTime.GetCurrentTime(),
                    ActionBy = user.Id,
                    LoggedNote = $"Rejected by {user.FullName ?? "Unknown"} on {_currentTime.GetCurrentTime()}.",
                    CreatedBy = user.Id
                };

                await _unitOfWork.AuditTrailRepository.AddAsync(auditTrail);
                await _unitOfWork.SaveChangeAsync();

                return ApiResult<object>.Succeed(auditTrail, "Claim rejected successfully.");
            }
            catch (Exception ex)
            {
                return ApiResult<object>.Fail(ex);
            }
        }

        public async Task<ApiResult<object>> CancelClaimAsync(Guid claimId)
        {
            try
            {
                // 1
                var user = await _unitOfWork.UserRepository.GetCurrentUserAsync();

                // 2
                var claim = await _unitOfWork.ClaimRepository.GetByIdAsync(claimId, c => c.Project, c => c.Creator);
                if (claim == null)
                {
                    return ApiResult<object>.Error(null, "Claim not found");
                }



                // 3
                if (claim.Status != ClaimStatus.Draft)
                {
                    return ApiResult<object>.Error(null, "Claim status must be Draft");
                }

                // 4
                claim.Status = ClaimStatus.Cancelled;
                claim.ModifiedBy = user.Id;

                // 5
                bool updateResult = await _unitOfWork.ClaimRepository.Update(claim);
                if (!updateResult)
                {
                    return ApiResult<object>.Error(null, "Failed to cancel claim");
                }
                var auditTrail = new AuditTrail
                {
                    ClaimId = claim.Id,
                    UserAction = UserAction.Cancel,
                    ActionDate = _currentTime.GetCurrentTime(),
                    ActionBy = user.Id,
                    LoggedNote = $"Cancelled by {user.FullName ?? "Unknown"} on {_currentTime.GetCurrentTime()}.",
                    CreatedBy = user.Id
                };

                await _unitOfWork.AuditTrailRepository.AddAsync(auditTrail);
                await _unitOfWork.SaveChangeAsync();

                return ApiResult<object>.Succeed(null, "Claim cancelled successfully.");
            }
            catch (Exception ex)
            {
                return ApiResult<object>.Fail(ex);
            }
        }

        public async Task<ApiResult<Object>> PaidClaimAsync(Guid claimId, ClaimStatusDTO remark)
        {
            try
            {
                // 1
                var user = await _unitOfWork.UserRepository.GetCurrentUserAsync();
                if (user == null || user.RoleName == RoleEnums.FINANCE.ToString())
                {
                    return ApiResult<object>.Error(null, "You are not authorized to paid this claim. Only FINANCE can paid claims.");
                }

                // 2
                var claim = await _unitOfWork.ClaimRepository.GetByIdAsync(claimId, c => c.Project, c => c.Creator);
                if (claim == null)
                {
                    return ApiResult<object>.Error(null, "Claim not found");
                }

                // 3
                if (claim.Status != ClaimStatus.Approved)
                {
                    return ApiResult<object>.Error(null, "Claim status must be Approved");
                }

                // 4
                claim.Status = ClaimStatus.Paid;
                claim.ModifiedBy = user.Id;
                claim.Remark = remark.Remark;

                // 5
                bool updateResult = await _unitOfWork.ClaimRepository.Update(claim);
                if (!updateResult)
                {
                    return ApiResult<object>.Error(null, "Failed to update claim");
                }
                var auditTrail = new AuditTrail
                {
                    ClaimId = claim.Id,
                    UserAction = UserAction.Paid, // Gán trực tiếp enum Reject
                    ActionDate = DateTime.UtcNow,
                    LoggedNote = $"Paid by {user.FullName ?? "Unknown"} on {DateTime.UtcNow}. Remark: {remark?.Remark ?? "No remark"}",
                    ActionBy = user.Id,
                    CreatedBy = user.Id
                };

                await _unitOfWork.AuditTrailRepository.AddAsync(auditTrail);

                // 7
                await _unitOfWork.SaveChangeAsync();

                // 8
                var auditTrailResponse = new AuditTrailResponse
                {
                    ClaimId = auditTrail.ClaimId,
                    ActionName = auditTrail.UserAction.ToString(),
                    ActionBy = user?.FullName,
                    ActionDate = auditTrail.ActionDate
                };

                return ApiResult<object>.Succeed(auditTrailResponse, "Claim paid successfully.");
            }
            catch (Exception ex)
            {
                return ApiResult<object>.Fail(ex);
            }
        }

        public async Task<ApiResult<object>> UpdateClaim(ClaimToUpdateDTO claim)
        {
            var currentUser = await _unitOfWork.UserRepository.GetCurrentUserAsync();
            if (currentUser == null) 
            {
                return ApiResult<object>.Error(null, "Invalid credentials");
            }

            var existingClaim = await _unitOfWork.ClaimRepository.GetByIdAsync(claim.Id, c => c.ClaimDetails);
            if (existingClaim == null)
            {
                return ApiResult<object>.Error(null, "Claim not found");
            }

            if (existingClaim.Status != ClaimStatus.Draft)
            {
                return ApiResult<object>.Error(null, "Claim status must be Draft");
            }

            if (existingClaim.CreatorId != currentUser.Id)
            {
                return ApiResult<object>.Error(null, "You have no permission to update this claim");
            }

            // Xóa tất cả claim details ngay lập tức
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    // 1. Xóa tất cả các ClaimDetail hiện có và NGAY LẬP TỨC lưu thay đổi
                    var existingDetails = await _unitOfWork.ClaimDetailRepository.GetClaimDetailsByClaimIdAsync(claim.Id);
                    
                    // Xóa trực tiếp bằng SQL để đảm bảo hard delete
                    if (existingDetails.Any())
                    {
                        // string deleteQuery = $"DELETE FROM ClaimDetails WHERE ClaimId = '{claim.Id}'";
                        // await _unitOfWork.ExecuteRawSqlAsync(deleteQuery);
                        
                        //Hoặc bạn có thể sử dụng mã sau nếu không có phương thức ExecuteRawSqlAsync
                        foreach (var detail in existingDetails)
                        {
                            _unitOfWork.ClaimDetailRepository.Delete(detail);
                        }
                        await _unitOfWork.SaveChangeAsync();
                    }
                    
                    // 2. Reset transaction và bắt đầu phần còn lại của logic
                    await transaction.CommitAsync();
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return ApiResult<object>.Error(null, $"Failed to delete existing claim details: {ex.Message}");
                }
            }
            
            // Phần còn lại trong transaction mới
            using (var transaction = await _unitOfWork.BeginTransactionAsync())
            {
                try
                {
                    // 3. Cập nhật thông tin claim nhưng BỎ QUA việc map ClaimDetails
                    // Map từng thuộc tính thủ công thay vì sử dụng AutoMapper cho toàn bộ object
                    existingClaim.ProjectId = claim.ProjectId;
                    existingClaim.TotalClaimAmount = (int)(claim.TotalClaimAmount ?? 0);
                    existingClaim.Remark = claim.Remark;
                    
                    // 4. Tính toán lại tổng số giờ
                    long totalHours = 0;
                    foreach (var detail in claim.ClaimDetails)
                    {
                        totalHours += (long)(detail.ToDate - detail.FromDate).TotalHours;

                        // Thêm mới từng detail
                        var newDetail = _mapper.Map<ClaimDetail>(detail);
                        newDetail.ClaimId = existingClaim.Id;
                        await _unitOfWork.ClaimDetailRepository.AddAsync(newDetail);
                    }
                    
                    existingClaim.TotalWorkingHours = totalHours;
                    existingClaim.TotalClaimAmount = (int)(totalHours * (currentUser.Salary / 192));
                    existingClaim.ModifiedBy = currentUser.Id;
                    existingClaim.ModifiedAt = DateTime.UtcNow;
                    
                    var result = await _unitOfWork.ClaimRepository.Update(existingClaim);

                    //add audit trail
                    var auditTrail = new AuditTrail()
                    {
                        ClaimId = existingClaim.Id,
                        UserAction = UserAction.Update,
                        ActionBy = currentUser.Id,
                        CreatedBy = currentUser.Id
                    };
                    await _unitOfWork.AuditTrailRepository.AddAuditTrailAsync(auditTrail);

                    await _unitOfWork.SaveChangeAsync();
                    await transaction.CommitAsync();
                    
                    if (!result)
                    {
                        return ApiResult<object>.Error(null, "Update failed");
                    }
                    
                    //audit trail response
                    var auditTrailResponse = new AuditTrailResponse()
                    {
                        ClaimId = auditTrail.ClaimId,
                        ActionName = auditTrail.UserAction.ToString(),
                        ActionBy = currentUser.FullName,
                        ActionDate = auditTrail.ActionDate
                    };
                    return ApiResult<object>.Succeed(auditTrailResponse, "Update successfully");
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return ApiResult<object>.Error(null, $"Update failed: {ex.Message}");
                }
            }
        }

        public async Task<ApiResult<List<ClaimResponseDTO>>> GetClaimsForApproval(string statuses)
        {
            if (string.IsNullOrEmpty(statuses))
            {
                throw new ArgumentException("Statuses cannot be empty");
            }
            var statusList = statuses.Split('&').Select(s => s.Trim()).ToList();
            var claimStatuses = new List<ClaimStatus>();
            foreach (var status in statusList)
            {
                if (!ClaimStatusMapper.TryGetClaimStatus(status, out var claimStatus))
                {
                    throw new ArgumentException($"Invalid status value: {status}");
                }
                claimStatuses.Add(claimStatus);
            }
            var currentUser = await _unitOfWork.UserRepository.GetCurrentUserAsync();

            var claims = await _unitOfWork.ClaimRepository.GetQueryable()
                .Where(c => claimStatuses.Contains(c.Status))
                .Include(c => c.Project)
                .Include(c => c.Creator)
                .ToListAsync();
            if (claims.IsNullOrEmpty())
            {
                return new ApiResult<List<ClaimResponseDTO>>
                {
                    Data = [],
                    Message = $"Not found claim with status {string.Join(", ", claimStatuses)}",
                    IsSuccess = true
                };
            }
            return ApiResult<List<ClaimResponseDTO>>.Succeed(_mapper.Map<List<ClaimResponseDTO>>(claims), $"Get claim with status {string.Join(", ", claimStatuses)} successfully");
        }

        public async Task<ApiResult<Object>> PaidClaimsAsync(ClaimListDTO claims)
        {
            try
            {
                var user = await _unitOfWork.UserRepository.GetCurrentUserAsync();
                //if (user == null || user.RoleName != RoleEnums.FINANCE.ToString())
                //{
                //    return ApiResult<object>.Error(null, "You are no permissions on this action.");
                //}

                var auditTrailResponses = new List<AuditTrailResponse>();

                foreach (var claimId in claims.ClaimId)
                {
                    var claim = await _unitOfWork.ClaimRepository.GetByIdAsync(claimId, c => c.Project, c => c.Creator);
                    if (claim == null)
                    {
                        return ApiResult<object>.Error(null, $"Claim with ID {claimId} not found");
                    }

                    if (claim.Status != ClaimStatus.Approved)
                    {
                        return ApiResult<object>.Error(null, $"Claim with ID {claimId} status must be Approved");
                    }

                    claim.Status = ClaimStatus.Paid;
                    claim.ModifiedBy = user.Id;

                    bool updateResult = await _unitOfWork.ClaimRepository.Update(claim);
                    if (!updateResult)
                    {
                        return ApiResult<object>.Error(null, $"Failed to update claim with ID {claimId}");
                    }

                    var auditTrail = new AuditTrail
                    {
                        ClaimId = claim.Id,
                        UserAction = UserAction.Paid,
                        ActionDate = _currentTime.GetCurrentTime(),
                        LoggedNote = $"Paid by {user.FullName ?? "Unknown"} on {_currentTime.GetCurrentTime()}.",
                        ActionBy = user.Id,
                        CreatedBy = user.Id
                    };

                    await _unitOfWork.AuditTrailRepository.AddAsync(auditTrail);

                    var auditTrailResponse = new AuditTrailResponse
                    {
                        ClaimId = auditTrail.ClaimId,
                        ActionName = auditTrail.UserAction.ToString(),
                        ActionBy = user?.FullName,
                        ActionDate = auditTrail.ActionDate
                    };

                    auditTrailResponses.Add(auditTrailResponse);
                }

                await _unitOfWork.SaveChangeAsync();

                return ApiResult<object>.Succeed(auditTrailResponses, "Claims paid successfully.");
            }
            catch (Exception ex)
            {
                return ApiResult<object>.Fail(ex);
            }
        }

        public async Task<ApiResult<object>> ApproveClaimsAsync(ClaimListDTO claims)
        {
            try
            {
                var user = await _unitOfWork.UserRepository.GetCurrentUserAsync();
                if (user == null || user.RoleName == RoleEnums.STAFF.ToString())
                {
                    return ApiResult<object>.Error(null, "You are no permissions on this action.");
                }

                foreach (var claimId in claims.ClaimId)
                {
                    var claim = await _unitOfWork.ClaimRepository.GetByIdAsync(claimId, c => c.Project, c => c.Creator);
                    if (claim == null)
                    {
                        return ApiResult<object>.Error(null, $"Claim with ID {claimId} not found");
                    }

                    if (claim.Status != ClaimStatus.PendingApproval)
                    {
                        return ApiResult<object>.Error(null, $"Claim with ID {claimId} status must be Pending Approval");
                    }

                    // Update Claim
                    claim.Status = ClaimStatus.Approved;

                    bool updateResult = await _unitOfWork.ClaimRepository.Update(claim);
                    if (!updateResult)
                    {
                        return ApiResult<object>.Error(null, $"Failed to update claim with ID {claimId}");
                    }

                    var auditTrail = new AuditTrail
                    {
                        ClaimId = claim.Id,
                        UserAction = UserAction.Approve,
                        ActionDate = _currentTime.GetCurrentTime(),
                        ActionBy = user.Id,
                        LoggedNote = $"Approved by {user.FullName ?? "Unknown"} on {_currentTime.GetCurrentTime()}.",
                        CreatedBy = user.Id
                    };

                    await _unitOfWork.AuditTrailRepository.AddAsync(auditTrail);
                }

                await _unitOfWork.SaveChangeAsync();

                // Send email for Finance team
                var financeTeamEmails = await _unitOfWork.UserRepository.GetQueryable()
                    .Where(u => u.RoleName == RoleEnums.FINANCE.ToString())
                    .Select(u => u.Email)
                    .ToListAsync();

                foreach (var claimId in claims.ClaimId)
                {
                    var claim = await _unitOfWork.ClaimRepository.GetByIdAsync(claimId, c => c.Project, c => c.Creator);
                    var linkToItem = $"https://your-frontend/claim/{claim.Id}";

                    await _emailService.SendClaimRequestEmailAsync(
                        financeTeamEmails,
                        claim.Project?.ProjectName ?? "Unknown Project",
                        claim.Creator?.FullName ?? "Unknown Creator",
                        claim.Creator?.Id ?? Guid.Empty,
                        linkToItem
                    );

                    if (claim.Creator != null)
                    {
                        await _emailService.SendApprovalNotificationEmailAsync(
                            claim.Project?.ProjectName ?? "Unknown Project",
                            claim.Creator.Id,
                            claim.Creator.Email,
                            claim.Creator.FullName,
                            linkToItem
                        );
                    }
                }

                return ApiResult<object>.Succeed(null, "Claims approved successfully.");
            }
            catch (Exception ex)
            {
                return ApiResult<object>.Fail(ex);
            }
        }
        public async Task<ApiResult<object>> ApproveClaimsAsyncV2(ClaimListDTO claims)
        {
            try
            {
                // 1. Lấy thông tin người dùng
                var user = await _unitOfWork.UserRepository.GetCurrentUserAsync();
                if (user == null || user.RoleName == RoleEnums.STAFF.ToString())
                {
                    return ApiResult<object>.Error(null, "You are no permissions on this action.");
                }

                // 2. Truy vấn tất cả các claim cần duyệt cùng một lúc với Include các thuộc tính điều hướng
                var claimIds = claims.ClaimId; // Giả sử đây là List<Guid>
                var claimsList = await _unitOfWork.ClaimRepository.GetQueryable()
                    .Where(c => claimIds.Contains(c.Id))
                    .Include(c => c.Project)
                    .Include(c => c.Creator)
                    .ToListAsync();

                // Kiểm tra nếu không tìm thấy một claim nào
                if (claimsList.Count != claimIds.Count)
                {
                    var missingIds = claimIds.Except(claimsList.Select(c => c.Id));
                    return ApiResult<object>.Error(null, $"Claim with ID {string.Join(", ", missingIds)} not found");
                }

                // 3. Cập nhật trạng thái các claim và tạo audit trail
                var currentTime = _currentTime.GetCurrentTime();
                foreach (var claim in claimsList)
                {
                    if (claim.Status != ClaimStatus.PendingApproval)
                    {
                        return ApiResult<object>.Error(null, $"Claim with ID {claim.Id} status must be Pending Approval");
                    }

                    // Cập nhật trạng thái claim
                    claim.Status = ClaimStatus.Approved;
                    claim.ModifiedBy = user.Id;
                    // Nếu cần, cập nhật Remark ở đây (nếu ClaimListDTO chứa remark riêng cho mỗi claim)

                    // Tạo audit trail cho claim
                    var auditTrail = new AuditTrail
                    {
                        ClaimId = claim.Id,
                        UserAction = UserAction.Approve,
                        ActionDate = currentTime,
                        ActionBy = user.Id,
                        LoggedNote = $"Approved by {user.FullName ?? "Unknown"} on {currentTime}.",
                        CreatedBy = user.Id
                    };
                    await _unitOfWork.AuditTrailRepository.AddAsync(auditTrail);
                }

                // 4. Lưu tất cả thay đổi xuống DB chỉ một lần
                await _unitOfWork.SaveChangeAsync();

                // 5. Lấy danh sách email của Finance team (sử dụng AsNoTracking để cải thiện hiệu năng)
                var financeTeamEmails = await _unitOfWork.UserRepository.GetQueryable()
                    .Where(u => u.RoleName == RoleEnums.FINANCE.ToString())
                    .Select(u => u.Email)
                    .AsNoTracking()
                    .ToListAsync();

                // 6. Gửi email cho từng claim song song
                var emailTasks = new List<Task>();
                foreach (var claim in claimsList)
                {
                    var linkToItem = $"https://your-frontend/claim/{claim.Id}";

                    // Gửi email thông báo cho Finance team
                    emailTasks.Add(_emailService.SendClaimRequestEmailAsync(
                        financeTeamEmails,
                        claim.Project?.ProjectName ?? "Unknown Project",
                        claim.Creator?.FullName ?? "Unknown Creator",
                        claim.Creator?.Id ?? Guid.Empty,
                        linkToItem));

                    // Gửi email thông báo cho người tạo claim nếu có
                    if (claim.Creator != null)
                    {
                        emailTasks.Add(_emailService.SendApprovalNotificationEmailAsync(
                            claim.Project?.ProjectName ?? "Unknown Project",
                            claim.Creator.Id,
                            claim.Creator.Email,
                            claim.Creator.FullName,
                            linkToItem));
                    }
                }

                // Offload việc gửi email về background để API trả về kết quả sớm hơn
                _ = Task.Run(async () =>
                {
                    try
                    {
                        await Task.WhenAll(emailTasks);
                    }
                    catch (Exception ex)
                    {
                        // Log lỗi gửi email (nếu cần)
                    }
                });

                return ApiResult<object>.Succeed(null, "Claims approved successfully.");
            }
            catch (Exception ex)
            {
                return ApiResult<object>.Fail(ex);
            }
        }
        public async Task<ApiResult<object>> ApproveClaimAsyncV2(Guid claimId, ClaimStatusDTO remark)
        {
            try
            {
                // 1. Lấy thông tin người dùng
                var user = await _unitOfWork.UserRepository.GetCurrentUserAsync();
                if (user == null || user.RoleName == RoleEnums.STAFF.ToString())
                {
                    return ApiResult<object>.Error(null, "You are not authorized to reject this claim. Only STAFF can't reject claims.");
                }

                // 2. Lấy thông tin claim và các thuộc tính điều hướng
                var claim = await _unitOfWork.ClaimRepository
                    .GetByIdAsync(claimId, c => c.Project, c => c.Creator);
                if (claim == null)
                {
                    return ApiResult<object>.Error(null, "Claim not found");
                }
                if (claim.Status != ClaimStatus.PendingApproval)
                {
                    return ApiResult<object>.Error(null, "Claim status must be Pending Approval");
                }

                // 3. Cập nhật claim
                claim.Status = ClaimStatus.Approved;
                claim.ModifiedBy = user.Id;
                claim.Remark = remark.Remark;
                bool updateResult = await _unitOfWork.ClaimRepository.Update(claim);
                if (!updateResult)
                {
                    return ApiResult<object>.Error(null, "Failed to update claim");
                }

                // 4. Tạo audit trail
                var auditTrail = new AuditTrail
                {
                    ClaimId = claim.Id,
                    UserAction = UserAction.Approve,
                    ActionDate = _currentTime.GetCurrentTime(),
                    ActionBy = user.Id,
                    LoggedNote = $"Approved by {user.FullName ?? "Unknown"} on {DateTime.UtcNow}. Remark: {remark?.Remark ?? "No remark"}",
                    CreatedBy = user.Id
                };
                await _unitOfWork.AuditTrailRepository.AddAsync(auditTrail);

                // 5. Lưu tất cả thay đổi vào DB (chỉ gọi SaveChange một lần)
                await _unitOfWork.SaveChangeAsync();

                // 6. Chuẩn bị gửi email thông báo (tách riêng việc gửi email không đồng bộ)
                var linkToItem = $"https://your-frontend/claim/{claim.Id}";

                // Truy vấn danh sách email của Finance team với AsNoTracking để tăng tốc độ
                var financeTeamEmailsTask = _unitOfWork.UserRepository.GetQueryable()
                    .Where(u => u.RoleName == RoleEnums.FINANCE.ToString())
                    .Select(u => u.Email)
                    .AsNoTracking()
                    .ToListAsync();

                // Sau khi truy vấn danh sách email hoàn tất, tiến hành gửi email
                var financeTeamEmails = await financeTeamEmailsTask;
                var sendFinanceEmailTask = _emailService.SendClaimRequestEmailAsync(
                    financeTeamEmails,
                    claim.Project?.ProjectName ?? "Unknown Project",
                    claim.Creator?.FullName ?? "Unknown Creator",
                    claim.Creator?.Id ?? Guid.Empty,
                    linkToItem
                );

                Task sendClaimerEmailTask = Task.CompletedTask;
                if (claim.Creator != null)
                {
                    sendClaimerEmailTask = _emailService.SendApprovalNotificationEmailAsync(
                        claim.Project?.ProjectName ?? "Unknown Project",
                        claim.Creator.Id,
                        claim.Creator.Email,
                        claim.Creator.FullName,
                        linkToItem
                    );
                }

                // Offload việc gửi email vào tác vụ nền, không chờ hoàn thành trước khi trả về kết quả API
                _ = Task.Run(async () =>
                {
                    try
                    {
                        await Task.WhenAll(sendFinanceEmailTask, sendClaimerEmailTask);
                    }
                    catch (Exception ex)
                    {
                        // Log lỗi gửi email nếu cần, nhưng không ảnh hưởng đến phản hồi của API
                        // _logger.LogError(ex, "Error sending email notifications for claim approval.");
                    }
                });

                // 7. Trả về kết quả ngay lập tức
                var auditTrailResponse = new AuditTrailResponse
                {
                    ClaimId = auditTrail.ClaimId,
                    ActionName = auditTrail.UserAction.ToString(),
                    ActionBy = user.FullName,
                    ActionDate = auditTrail.ActionDate
                };

                return ApiResult<object>.Succeed(auditTrailResponse, "Claim approved successfully.");
            }
            catch (Exception ex)
            {
                return ApiResult<object>.Fail(ex);
            }
        }
    }
}
