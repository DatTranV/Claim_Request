using BusinessObjects;
using DTOs.AuditTrailDTOs;
using DTOs.EmailSendingDTO;
using Services.Services;
using Test.ClaimTestFixture;

namespace Test
{
    public class SubmitClaimTest : IClassFixture<SubmitClaimTestFixture>
    {
        private readonly ClaimService _claimService;
        private readonly SubmitClaimTestFixture _fixture;

        public SubmitClaimTest(SubmitClaimTestFixture fixture)
        {
            _claimService = fixture.ClaimService;
            _fixture = fixture;
        }

        [Fact]
        public async Task SubmitClaim_ShouldReturnError_WhenClaimNotFound()
        {
            // Arrange - Sử dụng ID không tồn tại
            var nonExistentClaimId = Guid.NewGuid();

            // Act
            var (result, emailData) = await _claimService.SubmitClaim(nonExistentClaimId);

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Equal("Claim not found", result.Message);
            Assert.Null(emailData);
        }

        [Fact]
        public async Task SubmitClaim_ShouldReturnError_WhenUserNotClaimCreator()
        {
            // Act - Sử dụng ID claim cố định đã biết là tạo bởi người dùng khác
            var (result, emailData) = await _claimService.SubmitClaim(_fixture.DifferentCreatorClaimId);

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Equal("You have no permission to submit this claim", result.Message);
            Assert.Null(emailData);
        }

        [Fact]
        public async Task SubmitClaim_ShouldReturnError_WhenClaimNotInDraftStatus()
        {
            // Act - Sử dụng ID claim cố định đã biết là không ở trạng thái Draft
            var (result, emailData) = await _claimService.SubmitClaim(_fixture.WrongStatusClaimId);

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Equal("Claim status must be Draft", result.Message);
            Assert.Null(emailData);
        }

        [Fact]
        public async Task SubmitClaim_ShouldReturnError_WhenProjectManagerNotFound()
        {
            // Act - Sử dụng ID claim cố định đã biết là project không có manager
            var (result, emailData) = await _claimService.SubmitClaim(_fixture.NoManagerClaimId);

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Equal("Project manager not found", result.Message);
            Assert.Null(emailData);
        }

        [Fact]
        public async Task SubmitClaim_ShouldReturnSuccess_WhenValidRequest()
        {
            // Act - Sử dụng ID claim cố định đã biết là hợp lệ
            var (result, emailData) = await _claimService.SubmitClaim(_fixture.SuccessClaimId);

            // Assert
            Assert.True(result.IsSuccess);
            Assert.Equal("Submit successfully", result.Message);

            // Kiểm tra AuditTrail response
            var auditTrailResponse = result.Data as AuditTrailResponse;
            Assert.NotNull(auditTrailResponse);
            Assert.Equal(_fixture.SuccessClaimId, auditTrailResponse.ClaimId);
            Assert.Equal(UserAction.Submit.ToString(), auditTrailResponse.ActionName);
            Assert.NotNull(auditTrailResponse.ActionBy);
            
            // Kiểm tra email data
            Assert.NotNull(emailData);
            Assert.Equal("Success Project", emailData.ProjectName);
            Assert.Equal("Creator User", emailData.StaffName);
            Assert.Equal(_fixture.CreatorId, emailData.StaffId);
            Assert.Equal(ClaimStatus.PendingApproval.ToString(), emailData.ClaimStatus);
            Assert.NotNull(emailData.PMMail);
            Assert.NotNull(emailData.PMName);
        }
    }
} 