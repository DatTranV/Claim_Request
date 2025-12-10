using BusinessObjects;
using DTOs.AuditTrailDTOs;
using DTOs.ClaimDTOs;
using Services.Services;
using Test.ClaimTestFixture;

namespace Test
{
    public class ReturnClaimTest : IClassFixture<ReturnClaimTestFixture>
    {
        private readonly ClaimService _claimService;
        private readonly ReturnClaimTestFixture _fixture;

        public ReturnClaimTest(ReturnClaimTestFixture fixture)
        {
            _claimService = fixture.ClaimService;
            _fixture = fixture;
        }

        [Fact]
        public async Task ReturnClaim_ShouldReturnError_WhenClaimNotFound()
        {
            var (result, emailData) =
                await _claimService.ReturnClaim(Guid.NewGuid(), new ReturnClaimDTO { Remark = "Valid remark" });

            Assert.False(result.IsSuccess);
            Assert.Equal("Claim not found", result.Message);
        }

        [Fact]
        public async Task ReturnClaim_ShouldReturnError_WhenClaimsNotPendingApproval()
        {
            var draftClaim = _fixture.Context.ClaimRequests
                .FirstOrDefault(c => c.Status == ClaimStatus.Draft);
            var request = new ReturnClaimDTO
            {
                Remark = "Valid remark"
            };

            var (result, emailData) = await _claimService.ReturnClaim(draftClaim.Id, request);

            Assert.False(result.IsSuccess);
            Assert.Equal("Claim status must be Pending Approval", result.Message);
        }

        [Fact]
        public async Task ReturnClaim_ShouldReturnError_WhenRemarkIsEmpty()
        {
            var pendingClaim = _fixture.Context.ClaimRequests
                .FirstOrDefault(c => c.Status == ClaimStatus.PendingApproval
                                     && c.Project.ProjectName == "Empty Remark Test Project"
                );
            var request = new ReturnClaimDTO
            {
                Remark = ""
            };

            var (result, emailData) = await _claimService.ReturnClaim(pendingClaim.Id, request);

            Assert.False(result.IsSuccess);
            Assert.Equal("{ code = MSG12, message = Please input your remarks in order to return Claim. }",
                result.Message);
        }

        [Fact]
        public async Task ReturnClaim_ShouldReturnSuccess_WhenValidRequest()
        {
            var pendingClaim = _fixture.Context.ClaimRequests
                .FirstOrDefault(c => c.Status == ClaimStatus.PendingApproval
                                     && c.Project.ProjectName == "Success Test Project"
                );
            var request = new ReturnClaimDTO
            {
                Remark = "Valid return remark"
            };

            var (result, emailData) = await _claimService.ReturnClaim(pendingClaim.Id, request);

            Assert.True(result.IsSuccess);
            Assert.Equal("Return claim successfully", result.Message);

            // Verify audit trail response
            var auditTrailResponse = result.Data as AuditTrailResponse;
            Assert.NotNull(auditTrailResponse);
            Assert.Equal(pendingClaim.Id, auditTrailResponse.ClaimId);
            Assert.Equal(UserAction.Return.ToString(), auditTrailResponse.ActionName);
            Assert.NotNull(auditTrailResponse.ActionBy);
            Assert.NotEqual(default, auditTrailResponse.ActionDate);

            // Verify email data
            Assert.NotNull(emailData);
            Assert.Equal(pendingClaim.Project.ProjectName, emailData.ProjectName);
            Assert.Equal(pendingClaim.Creator.Email, emailData.StaffEmail);
            Assert.Equal(pendingClaim.Creator.FullName, emailData.StaffName);
            Assert.Equal(pendingClaim.CreatorId, emailData.StaffId);
        }
    }
}