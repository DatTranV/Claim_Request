using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using BusinessObjects;
using DTOs.AuditTrailDTOs;
using DTOs.ProjectEnrollmentDTOs;
using Microsoft.IdentityModel.Tokens;
using Repositories.Commons;
using Repositories.Interfaces;
using Services.Interfaces;

namespace Services.Services
{
    public class AuditTrailService : IAuditTrailService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        public AuditTrailService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<ApiResult<List<AuditTrailResponseV2>>> GetAllAuditTrailByClaimIdAsync(Guid claimId)
        {
            var result = await _unitOfWork.AuditTrailRepository.GetAllAsync(x => x.ClaimId == claimId);
            var orderedResult = result.OrderByDescending(audit => audit.ActionDate).ToList();

            if (orderedResult == null || !orderedResult.Any())
            {
                return ApiResult<List<AuditTrailResponseV2>>.Error(null, "No audit-trail found");
            }

            return ApiResult<List<AuditTrailResponseV2>>.Succeed(_mapper.Map<List<AuditTrailResponseV2>>(orderedResult), "Get all audit-trail by claim Id successfully");
        }

        public async Task<ApiResult<List<AuditTrailResponseV2>>> GetAllAuditTrailAsync()
        {
            var auditList = await _unitOfWork.AuditTrailRepository.GetAllAsync();
            var userIds = auditList.Select(x => x.ActionBy).Distinct().ToList();
            var users = await _unitOfWork.UserRepository.GetUsersAsync(u => userIds.Contains(u.Id));

            var result = auditList.OrderByDescending(audit => audit.ActionDate).Select(audit => new AuditTrailResponseV2()
            {
                ClaimId = audit.ClaimId,
                ActionDate = audit.ActionDate,
                ActionBy = audit.ActionBy,
                UserAction = audit.UserAction,
                FullName = users.FirstOrDefault(u => u.Id == audit.ActionBy)?.FullName,
                LoggedNote = audit.LoggedNote
            }).ToList();

            if (result.IsNullOrEmpty())
            {
                return ApiResult<List<AuditTrailResponseV2>>.Error(null, "No audit-trail found");
            }

            return ApiResult<List<AuditTrailResponseV2>>.Succeed(result, "Get all audit-trail successfully");
        }
    }
}