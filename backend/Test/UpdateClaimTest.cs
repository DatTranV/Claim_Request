using BusinessObjects;
using DTOs.AuditTrailDTOs;
using DTOs.ClaimDTOs;
using Services.Services;
using Test.ClaimTestFixture;

namespace Test
{
    public class UpdateClaimTest : IClassFixture<UpdateClaimTestFixture>
    {
        private readonly ClaimService _claimService;
        private readonly UpdateClaimTestFixture _fixture;

        public UpdateClaimTest(UpdateClaimTestFixture fixture)
        {
            _claimService = fixture.ClaimService;
            _fixture = fixture;
        }

        [Fact]
        public async Task UpdateClaim_ShouldReturnError_WhenClaimNotFound()
        {
            // Arrange
            var updateDto = new ClaimToUpdateDTO
            {
                Id = Guid.NewGuid(), // ID không tồn tại
                ProjectId = _fixture.ProjectId,
                TotalClaimAmount = 1000,
                Remark = "Test update with invalid claim ID",
                ClaimDetails = new List<ClaimDetailDTO>
                {
                    new ClaimDetailDTO
                    {
                        FromDate = DateTime.Now,
                        ToDate = DateTime.Now.AddHours(8),
                        Remark = "Test detail"
                    }
                }
            };

            // Act
            var result = await _claimService.UpdateClaim(updateDto);

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Equal("Claim not found", result.Message);
        }

        [Fact]
        public async Task UpdateClaim_ShouldReturnError_WhenClaimNotInDraftStatus()
        {
            // Arrange
            var updateDto = new ClaimToUpdateDTO
            {
                Id = _fixture.NonDraftClaimId,
                ProjectId = _fixture.ProjectId,
                TotalClaimAmount = 1000,
                Remark = "Test update with non-draft status",
                ClaimDetails = new List<ClaimDetailDTO>
                {
                    new ClaimDetailDTO
                    {
                        FromDate = DateTime.Now,
                        ToDate = DateTime.Now.AddHours(8),
                        Remark = "Test detail"
                    }
                }
            };

            // Act
            var result = await _claimService.UpdateClaim(updateDto);

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Equal("Claim status must be Draft", result.Message);
        }

        [Fact]
        public async Task UpdateClaim_ShouldReturnError_WhenUserNotClaimCreator()
        {
            // Arrange
            var updateDto = new ClaimToUpdateDTO
            {
                Id = _fixture.DifferentCreatorClaimId,
                ProjectId = _fixture.ProjectId,
                TotalClaimAmount = 1000,
                Remark = "Test update with different creator",
                ClaimDetails = new List<ClaimDetailDTO>
                {
                    new ClaimDetailDTO
                    {
                        FromDate = DateTime.Now,
                        ToDate = DateTime.Now.AddHours(8),
                        Remark = "Test detail"
                    }
                }
            };

            // Act
            var result = await _claimService.UpdateClaim(updateDto);

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Equal("You have no permission to update this claim", result.Message);
        }

        [Fact]
        public async Task UpdateClaim_ShouldReturnSuccess_WhenValidRequest()
        {
            // Arrange
            var fromDate = DateTime.Now;
            var toDate = fromDate.AddHours(8);
            
            var updateDto = new ClaimToUpdateDTO
            {
                Id = _fixture.ValidClaimId,
                ProjectId = _fixture.ProjectId,
                TotalClaimAmount = 1000,
                Remark = "Test valid update",
                ClaimDetails = new List<ClaimDetailDTO>
                {
                    new ClaimDetailDTO
                    {
                        FromDate = fromDate,
                        ToDate = toDate,
                        Remark = "Test detail 1"
                    },
                    new ClaimDetailDTO
                    {
                        FromDate = fromDate.AddDays(1),
                        ToDate = toDate.AddDays(1),
                        Remark = "Test detail 2"
                    }
                }
            };

            // Act
            var result = await _claimService.UpdateClaim(updateDto);

            // Assert
            // Nếu test vẫn fail, bạn có thể gỡ lỗi bằng cách in ra thông báo lỗi
            if (!result.IsSuccess)
                Console.WriteLine($"Update failed with message: {result.Message}");
                
            Assert.True(result.IsSuccess);
            Assert.Equal("Update successfully", result.Message);
            
            // Kiểm tra auditTrail response
            var auditTrailResponse = result.Data as AuditTrailResponse;
            Assert.NotNull(auditTrailResponse);
            Assert.Equal(_fixture.ValidClaimId, auditTrailResponse.ClaimId);
            Assert.Equal(UserAction.Update.ToString(), auditTrailResponse.ActionName);
            Assert.NotNull(auditTrailResponse.ActionBy);
            Assert.NotEqual(default, auditTrailResponse.ActionDate);
        }
    }
}
