using BusinessObjects;
using DTOs.AuditTrailDTOs;
using DTOs.ClaimDTOs;
using DTOs.Enums;
using Repositories.Commons;
using Services.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Test.ClaimTestFixture;
using Xunit;

namespace Test
{
    public class ApproveClaimTest
    {
        private readonly ApproveClaimTestFixture _fixture;
        private readonly IClaimApproveService _approveService;

        public ApproveClaimTest()
        {
            _fixture = new ApproveClaimTestFixture();
            _approveService = _fixture.ApproveClaimService;
        }

        [Fact]
        public async Task ApproveClaimAsync_ShouldReturnSuccess_WhenValidClaimId()
        {
            // Arrange
            _fixture.SetCurrentUser(_fixture.ApproverUser); // Đảm bảo user là APPROVER
            var claimId = _fixture.ValidClaimId;
            var remarkDto = new ClaimStatusDTO { Remark = "Approved by test" };

            // Act
            var result = await _approveService.ApproveClaimAsync(claimId, remarkDto);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.IsSuccess);
            Assert.Contains("approved successfully", result.Message.ToLower());
        }

        [Fact]
        public async Task ApproveClaimAsync_ShouldReturnError_WhenInvalidClaimId()
        {
            // Arrange
            _fixture.SetCurrentUser(_fixture.ApproverUser); // Đảm bảo user là APPROVER
            var claimId = _fixture.InvalidClaimId;
            var remarkDto = new ClaimStatusDTO { Remark = "Approve test" };

            // Act
            var result = await _approveService.ApproveClaimAsync(claimId, remarkDto);

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Equal("Claim not found", result.Message);
        }

        [Fact]
        public async Task ApproveClaimAsync_ShouldReturnError_WhenClaimNotPendingApproval()
        {
            // Arrange
            _fixture.SetCurrentUser(_fixture.ApproverUser); // Đảm bảo user là APPROVER
            var claimId = _fixture.NonPendingClaimId;
            var remarkDto = new ClaimStatusDTO { Remark = "Approve test" };

            // Act
            var result = await _approveService.ApproveClaimAsync(claimId, remarkDto);

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Equal("Claim status must be Pending Approval", result.Message);
        }

        // Kiểm tra vai trò APPROVER có thể approve
        [Fact]
        public async Task ApproveClaimAsync_ShouldSucceed_WhenUserIsApprover()
        {
            // Arrange
            _fixture.SetCurrentUser(_fixture.ApproverUser);
            var claimId = _fixture.ValidClaimId;
            var remarkDto = new ClaimStatusDTO { Remark = "Approved by approver" };

            // Act
            var result = await _approveService.ApproveClaimAsync(claimId, remarkDto);
            // Assert
            Assert.NotNull(result);
            Assert.True(result.IsSuccess);
            Assert.Contains("approved successfully", result.Message.ToLower());
        }

        // Kiểm tra vai trò FINANCE có thể approve
        [Fact]
        public async Task ApproveClaimAsync_ShouldSucceed_WhenUserIsFinance()
        {
            // Arrange
            _fixture.SetCurrentUser(_fixture.FinanceUser);
            var claimId = _fixture.ValidClaimId;
            var remarkDto = new ClaimStatusDTO { Remark = "Approved by finance" };

            // Act
            var result = await _approveService.ApproveClaimAsync(claimId, remarkDto);

            // Assert
            Assert.NotNull(result);
            Assert.True(result.IsSuccess);
            Assert.Contains("approved successfully", result.Message.ToLower());
        }

        // Kiểm tra vai trò STAFF không được phép approve
        [Fact]
        public async Task ApproveClaimAsync_ShouldReturnError_WhenUserIsStaff()
        {
            // Arrange
            _fixture.SetCurrentUser(_fixture.StaffUser);
            var claimId = _fixture.ValidClaimId;
            var remarkDto = new ClaimStatusDTO { Remark = "Approved by staff" };

            // Act
            var result = await _approveService.ApproveClaimAsync(claimId, remarkDto);

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Contains("You are not authorized to reject this claim", result.Message);
        }
    }
}
