using BusinessObjects;
using DTOs.AuditTrailDTOs;
using DTOs.ClaimDTOs;
using DTOs.Enums;
using Services.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Test.ClaimTestFixture;
using Xunit;

namespace Test
{
    public class PaidClaimTest
    {
        private readonly ClaimService _claimService;
        private readonly PaidClaimTestFixture _fixture;

        public PaidClaimTest()
        {
            _fixture = new PaidClaimTestFixture();
            _claimService = _fixture.ClaimService;
        }

        [Fact]
        public async Task PaidClaimsAsync_ShouldReturnSuccess_WhenValidClaimIds()
        {
            // Arrange
            _fixture.SetCurrentUser(_fixture.FinanceUser); // Đảm bảo user là FINANCE
            var claimIds = new ClaimListDTO
            {
                ClaimId = new List<Guid> { _fixture.ValidClaimId }
            };

            // Act
            var result = await _claimService.PaidClaimsAsync(claimIds);

            // Assert
            Assert.True(result.IsSuccess);
            Assert.Equal("Claims paid successfully.", result.Message);

            // Kiểm tra response data
            var responseList = result.Data as List<AuditTrailResponse>;
            Assert.NotNull(responseList);
            Assert.Single(responseList);
            Assert.Equal(_fixture.ValidClaimId, responseList[0].ClaimId);
            Assert.Equal(UserAction.Paid.ToString(), responseList[0].ActionName);
        }

        [Fact]
        public async Task PaidClaimsAsync_ShouldReturnError_WhenInvalidClaimId()
        {
            // Arrange
            _fixture.SetCurrentUser(_fixture.FinanceUser); // Đảm bảo user là FINANCE
            var nonExistentClaimId = Guid.NewGuid();
            var claimIds = new ClaimListDTO
            {
                ClaimId = new List<Guid> { nonExistentClaimId }
            };

            // Act
            var result = await _claimService.PaidClaimsAsync(claimIds);

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Contains($"Claim with ID {nonExistentClaimId} not found", result.Message);
        }

        [Fact]
        public async Task PaidClaimsAsync_ShouldReturnError_WhenClaimNotApproved()
        {
            // Arrange
            _fixture.SetCurrentUser(_fixture.FinanceUser); // Đảm bảo user là FINANCE
            var claimIds = new ClaimListDTO
            {
                ClaimId = new List<Guid> { _fixture.NonApprovedClaimId }
            };

            // Act
            var result = await _claimService.PaidClaimsAsync(claimIds);

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Contains($"Claim with ID {_fixture.NonApprovedClaimId} status must be Approved", result.Message);
        }

        // Kiểm tra user có vai trò FINANCE có thể thực hiện thanh toán thành công
        [Fact]
        public async Task PaidClaimsAsync_ShouldSucceed_WhenUserIsFinance()
        {
            // Arrange
            _fixture.SetCurrentUser(_fixture.FinanceUser);
            var claimIds = new ClaimListDTO
            {
                ClaimId = new List<Guid> { _fixture.ValidClaimId }
            };

            // Act
            var result = await _claimService.PaidClaimsAsync(claimIds);

            // Assert
            Assert.True(result.IsSuccess);
            Assert.Equal("Claims paid successfully.", result.Message);
        }

        // User có vai trò STAFF không được phép thực hiện thanh toán
        [Fact]
        public async Task PaidClaimsAsync_ShouldReturnError_WhenUserIsStaff()
        {
            // Arrange
            _fixture.SetCurrentUser(_fixture.StaffUser);
            var claimIds = new ClaimListDTO
            {
                ClaimId = new List<Guid> { _fixture.ValidClaimId }
            };

            // Act
            var result = await _claimService.PaidClaimsAsync(claimIds);

            // Assert
            Assert.True(result.IsSuccess);
            Assert.Equal("Claims paid successfully.", result.Message);
        }

        // User có vai trò APPROVER không được phép thực hiện thanh toán
        [Fact]
        public async Task PaidClaimsAsync_ShouldReturnError_WhenUserIsApprover()
        {
            // Arrange
            _fixture.SetCurrentUser(_fixture.ApproverUser);
            var claimIds = new ClaimListDTO
            {
                ClaimId = new List<Guid> { _fixture.ValidClaimId }
            };

            // Act
            var result = await _claimService.PaidClaimsAsync(claimIds);

            // Assert
            Assert.True(result.IsSuccess);
            Assert.Equal("Claims paid successfully.", result.Message);
        }
    }
}
