using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using AutoMapper;
using BusinessObjects;
using DTOs.AuditTrailDTOs;
using DTOs.ClaimDTOs;
using DTOs.Enums;
using Microsoft.EntityFrameworkCore.Query;
using Moq;
using Repositories.Interfaces;
using Services.Gmail;
using Services.Services;
using Xunit;

namespace Test
{
    public class RejectClaimTests
    {
        private readonly Mock<IUnitOfWork> _uowMock;
        private readonly Mock<IUserRepository> _userRepoMock;
        private readonly Mock<IClaimRepository> _claimRepoMock;
        private readonly Mock<IAuditTrailRepository> _auditRepoMock;
        private readonly Mock<IEmailService> _emailServiceMock;
        private readonly Mock<IMapper> _mapperMock;
        private readonly Mock<ICurrentTime> _currentTimeMock;
        private readonly ClaimService _claimService;
        private readonly DateTime _fixedTime = new DateTime(2025, 3, 23, 16, 27, 19, 462, DateTimeKind.Utc);

        public RejectClaimTests()
        {
            _uowMock = new Mock<IUnitOfWork>();
            _userRepoMock = new Mock<IUserRepository>();
            _claimRepoMock = new Mock<IClaimRepository>();
            _auditRepoMock = new Mock<IAuditTrailRepository>();
            _emailServiceMock = new Mock<IEmailService>();
            _mapperMock = new Mock<IMapper>();
            _currentTimeMock = new Mock<ICurrentTime>();

            // Setup unit of work và các repository
            _uowMock.Setup(u => u.UserRepository).Returns(_userRepoMock.Object);
            _uowMock.Setup(u => u.ClaimRepository).Returns(_claimRepoMock.Object);
            _uowMock.Setup(u => u.AuditTrailRepository).Returns(_auditRepoMock.Object);
            _uowMock.Setup(u => u.SaveChangeAsync()).ReturnsAsync(1);

            // Sử dụng fixed time cho test
            _currentTimeMock.Setup(c => c.GetCurrentTime()).Returns(_fixedTime);

            _claimService = new ClaimService(
                _uowMock.Object,
                _mapperMock.Object,
                _emailServiceMock.Object,
                _currentTimeMock.Object);
        }

        //[Fact]
        //public async Task RejectClaimAsync_ReturnsError_WhenUserNotAuthorized()
        //{
        //    // Arrange: User hiện tại là null.
        //    _userRepoMock.Setup(r => r.GetCurrentUserAsync()).ReturnsAsync((User)null);

        //    // Act
        //    var result = await _claimService.RejectClaimAsync(Guid.NewGuid(), new ClaimStatusDTO { Remark = "Some remark" });

        //    // Assert
        //    Assert.False(result.IsSuccess);
        //    Assert.Equal("You are not authorized to reject this claim. Only APPROVER can reject claims.", result.Message);
        //}

        //[Fact]
        //public async Task RejectClaimAsync_ReturnsError_WhenUserIsStaff()
        //{
        //    // Arrange: User có role là STAFF.
        //    var staffUser = new User { Id = Guid.NewGuid(), RoleName = RoleEnums.STAFF.ToString(), FullName = "Staff User" };
        //    _userRepoMock.Setup(r => r.GetCurrentUserAsync()).ReturnsAsync(staffUser);

        //    // Act
        //    var result = await _claimService.RejectClaimAsync(Guid.NewGuid(), new ClaimStatusDTO { Remark = "Some remark" });

        //    // Assert
        //    Assert.False(result.IsSuccess);
        //    Assert.Equal("You are not authorized to reject this claim. Only APPROVER can reject claims.", result.Message);
        //}

        [Fact]
        public async Task RejectClaimAsync_ReturnsError_WhenClaimNotFound()
        {
            // Arrange: Không tìm thấy claim.
            var adminUser = new User { Id = Guid.NewGuid(), RoleName = "ADMIN", FullName = "Admin User" };
            _userRepoMock.Setup(r => r.GetCurrentUserAsync()).ReturnsAsync(adminUser);
            _claimRepoMock.Setup(c => c.GetByIdAsync(
                It.IsAny<Guid>(),
                It.IsAny<Expression<Func<ClaimRequest, object>>>(),
                It.IsAny<Expression<Func<ClaimRequest, object>>>()))
                .ReturnsAsync((ClaimRequest)null);

            // Act
            var result = await _claimService.RejectClaimAsync(Guid.NewGuid(), new ClaimStatusDTO { Remark = "Some remark" });

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Equal("Claim not found", result.Message);
        }

        [Fact]
        public async Task RejectClaimAsync_ReturnsError_WhenClaimStatusNotPendingApproval()
        {
            // Arrange: Claim có trạng thái khác PendingApproval.
            var adminUser = new User { Id = Guid.NewGuid(), RoleName = "ADMIN", FullName = "Admin User" };
            _userRepoMock.Setup(r => r.GetCurrentUserAsync()).ReturnsAsync(adminUser);
            var claim = new ClaimRequest { Id = Guid.NewGuid(), Status = ClaimStatus.Approved };
            _claimRepoMock.Setup(c => c.GetByIdAsync(
                It.IsAny<Guid>(),
                It.IsAny<Expression<Func<ClaimRequest, object>>>(),
                It.IsAny<Expression<Func<ClaimRequest, object>>>()))
                .ReturnsAsync(claim);

            // Act
            var result = await _claimService.RejectClaimAsync(claim.Id, new ClaimStatusDTO { Remark = "Some remark" });

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Equal("Claim status must be Pending Approval", result.Message);
        }

        //[Fact]
        //public async Task RejectClaimAsync_ReturnsError_WhenRemarkIsEmpty()
        //{
        //    // Arrange: Remark rỗng.
        //    var adminUser = new User { Id = Guid.NewGuid(), RoleName = "ADMIN", FullName = "Admin User" };
        //    _userRepoMock.Setup(r => r.GetCurrentUserAsync()).ReturnsAsync(adminUser);
        //    var claim = new ClaimRequest { Id = Guid.NewGuid(), Status = ClaimStatus.PendingApproval };
        //    _claimRepoMock.Setup(c => c.GetByIdAsync(
        //        It.IsAny<Guid>(),
        //        It.IsAny<Expression<Func<ClaimRequest, object>>>(),
        //        It.IsAny<Expression<Func<ClaimRequest, object>>>()))
        //        .ReturnsAsync(claim);

        //    // Act
        //    var result = await _claimService.RejectClaimAsync(claim.Id, new ClaimStatusDTO { Remark = " " });

        //    // Assert
        //    Assert.False(result.IsSuccess);
        //    Assert.Equal("Please input your remarks in order to return Claim.", result.Message);
        //}

        [Fact]
        public async Task RejectClaimAsync_ReturnsError_WhenUpdateFails()
        {
            // Arrange: Cập nhật claim thất bại.
            var adminUser = new User { Id = Guid.NewGuid(), RoleName = "ADMIN", FullName = "Admin User" };
            _userRepoMock.Setup(r => r.GetCurrentUserAsync()).ReturnsAsync(adminUser);
            var claim = new ClaimRequest
            {
                Id = Guid.NewGuid(),
                Status = ClaimStatus.PendingApproval,
                Creator = new User { Id = Guid.NewGuid() },
                Project = new Project { ProjectName = "Test Project" }
            };
            _claimRepoMock.Setup(c => c.GetByIdAsync(
                It.IsAny<Guid>(),
                It.IsAny<Expression<Func<ClaimRequest, object>>>(),
                It.IsAny<Expression<Func<ClaimRequest, object>>>()))
                .ReturnsAsync(claim);
            _claimRepoMock.Setup(c => c.Update(It.IsAny<ClaimRequest>())).ReturnsAsync(false);

            // Act
            var result = await _claimService.RejectClaimAsync(claim.Id, new ClaimStatusDTO { Remark = "Some remark" });

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Equal("Failed to update claim", result.Message);
        }

        [Fact]
        public async Task RejectClaimAsync_ReturnsSuccess_WhenValid()
        {
            // Arrange
            var claimId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var remarkDto = new ClaimStatusDTO { Remark = "Rejected remark" };

            var adminUser = new User { Id = userId, RoleName = "ADMIN", FullName = "Admin User", Email = "admin@example.com" };
            _userRepoMock.Setup(r => r.GetCurrentUserAsync()).ReturnsAsync(adminUser);

            var claim = new ClaimRequest
            {
                Id = claimId,
                Status = ClaimStatus.PendingApproval,
                Project = new Project { ProjectName = "Project Y" },
                Creator = new User { Id = Guid.NewGuid(), FullName = "Creator User", Email = "creator@example.com" }
            };
            _claimRepoMock.Setup(c => c.GetByIdAsync(
                It.Is<Guid>(id => id == claimId),
                It.IsAny<Expression<Func<ClaimRequest, object>>>(),
                It.IsAny<Expression<Func<ClaimRequest, object>>>()))
                .ReturnsAsync(claim);
            _claimRepoMock.Setup(c => c.Update(It.Is<ClaimRequest>(c => c.Id == claimId))).ReturnsAsync(true);

            var auditTrail = new AuditTrail
            {
                Id = Guid.NewGuid(),
                ClaimId = claimId,
                UserAction = UserAction.Reject,
                ActionDate = _fixedTime,
                ActionBy = userId,
                User = adminUser
            };
            _auditRepoMock.Setup(a => a.AddAsync(It.IsAny<AuditTrail>())).ReturnsAsync(auditTrail);

            // Act
            var result = await _claimService.RejectClaimAsync(claimId, remarkDto);

            // Assert
            Assert.True(result.IsSuccess);
            Assert.Equal("Claim rejected successfully.", result.Message);
            var returnedAuditTrail = result.Data as AuditTrail;
            Assert.NotNull(returnedAuditTrail);
            Assert.Equal(claimId, returnedAuditTrail.ClaimId);
            Assert.Equal(UserAction.Reject, returnedAuditTrail.UserAction);
            Assert.Equal(_fixedTime, returnedAuditTrail.ActionDate);
            Assert.Equal(userId, returnedAuditTrail.ActionBy);

            _claimRepoMock.Verify(c => c.Update(It.IsAny<ClaimRequest>()), Times.Once);
            _auditRepoMock.Verify(a => a.AddAsync(It.IsAny<AuditTrail>()), Times.Once);
            _uowMock.Verify(u => u.SaveChangeAsync(), Times.Once);
        }

        [Fact]
        public async Task RejectClaimAsync_HandleExceptions_ReturnsFailureResult()
        {
            // Arrange
            var claimId = Guid.NewGuid();
            var remarkDto = new ClaimStatusDTO { Remark = "Test remark" };
            _userRepoMock.Setup(r => r.GetCurrentUserAsync()).ThrowsAsync(new Exception("Test exception"));

            // Act
            var result = await _claimService.RejectClaimAsync(claimId, remarkDto);

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Equal("Test exception", result.Message);
        }
    }
}
