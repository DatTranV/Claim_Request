using BusinessObjects;
using DTOs.ClaimDTOs;
using Services.Services;
using Test.ClaimTestFixture;

public class DownloadClaimTest : IClassFixture<DownloadClaimTestFixture>
{
    private readonly ClaimService _claimService;
    private readonly DownloadClaimTestFixture _fixture;

    public DownloadClaimTest(DownloadClaimTestFixture fixture)
    {
        _claimService = fixture.ClaimService;
        _fixture = fixture;
    }

    [Fact]
    public async Task DownloadClaim_ShouldReturnSuccess_WhenClaimsArePaidAndCurrentMonth()
    {
        // Arrange
        var paidClaim = _fixture.Context.ClaimRequests
            .FirstOrDefault(c => c.Status == ClaimStatus.Paid &&
                                c.CreatedAt.Month == DateTime.UtcNow.Month &&
                                c.CreatedAt.Year == DateTime.UtcNow.Year);

        var request = new ClaimListDTO
        {
            ClaimId = new List<Guid> { paidClaim.Id }
        };

        // Act
        var result = await _claimService.DownloadClaim(request);

        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal("Successfully generated claim report.", result.Message);
        Assert.NotNull(result.Data);
        Assert.IsType<MemoryStream>(result.Data);
    }

    [Fact]
    public async Task DownloadClaim_ShouldReturnError_WhenClaimsNotInCurrentMonthOrYear()
    {
        var oldClaim = _fixture.Context.ClaimRequests
            .FirstOrDefault(c => c.CreatedAt < DateTime.UtcNow.AddMonths(-1));

        var request = new ClaimListDTO
        {
            ClaimId = new List<Guid> { oldClaim.Id }
        };

        var result = await _claimService.DownloadClaim(request);

        Assert.False(result.IsSuccess);
        Assert.Equal("No claims found for download.", result.Message);
    }

}