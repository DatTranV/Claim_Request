using System.Linq.Expressions;
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

namespace Test
{
    public class ApproveClaimAsyncTests
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

        public ApproveClaimAsyncTests()
        {
            _uowMock = new Mock<IUnitOfWork>();
            _userRepoMock = new Mock<IUserRepository>();
            _claimRepoMock = new Mock<IClaimRepository>();
            _auditRepoMock = new Mock<IAuditTrailRepository>();
            _emailServiceMock = new Mock<IEmailService>();
            _mapperMock = new Mock<IMapper>();
            _currentTimeMock = new Mock<ICurrentTime>();

            // Setup unit of work
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

        [Fact]
        public async Task ApproveClaimAsync_ReturnsError_WhenUserNotAuthorized()
        {
            // Arrange: User hiện tại là null.
            _userRepoMock.Setup(r => r.GetCurrentUserAsync()).ReturnsAsync((User)null);

            // Act
            var result = await _claimService.ApproveClaimAsync(Guid.NewGuid(), new ClaimStatusDTO { Remark = "Test remark" });

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Equal("You are not authorized to reject this claim. Only STAFF can't reject claims.", result.Message);
        }

        [Fact]
        public async Task ApproveClaimAsync_ReturnsError_WhenUserIsStaff()
        {
            // Arrange: User có role là STAFF.
            var staffUser = new User { Id = Guid.NewGuid(), RoleName = RoleEnums.STAFF.ToString(), FullName = "Staff User" };
            _userRepoMock.Setup(r => r.GetCurrentUserAsync()).ReturnsAsync(staffUser);

            // Act
            var result = await _claimService.ApproveClaimAsync(Guid.NewGuid(), new ClaimStatusDTO { Remark = "Test remark" });

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Equal("You are not authorized to reject this claim. Only STAFF can't reject claims.", result.Message);
        }

        [Fact]
        public async Task ApproveClaimAsync_ReturnsError_WhenClaimNotFound()
        {
            // Arrange: Không tìm thấy claim.
            var adminUser = new User { Id = Guid.NewGuid(), RoleName = "ADMIN", FullName = "Admin User" };
            _userRepoMock.Setup(r => r.GetCurrentUserAsync()).ReturnsAsync(adminUser);
            _claimRepoMock.Setup(c => c.GetByIdAsync(It.IsAny<Guid>(),
                It.IsAny<Expression<Func<ClaimRequest, object>>>(),
                It.IsAny<Expression<Func<ClaimRequest, object>>>()))
                .ReturnsAsync((ClaimRequest)null);

            // Act
            var result = await _claimService.ApproveClaimAsync(Guid.NewGuid(), new ClaimStatusDTO { Remark = "Test remark" });

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Equal("Claim not found", result.Message);
        }

        [Fact]
        public async Task ApproveClaimAsync_ReturnsError_WhenClaimStatusNotPendingApproval()
        {
            // Arrange: Claim có trạng thái khác PendingApproval.
            var adminUser = new User { Id = Guid.NewGuid(), RoleName = "ADMIN", FullName = "Admin User" };
            _userRepoMock.Setup(r => r.GetCurrentUserAsync()).ReturnsAsync(adminUser);
            var claim = new ClaimRequest { Id = Guid.NewGuid(), Status = ClaimStatus.Draft };
            _claimRepoMock.Setup(c => c.GetByIdAsync(It.IsAny<Guid>(),
                It.IsAny<Expression<Func<ClaimRequest, object>>>(),
                It.IsAny<Expression<Func<ClaimRequest, object>>>()))
                .ReturnsAsync(claim);

            // Act
            var result = await _claimService.ApproveClaimAsync(claim.Id, new ClaimStatusDTO { Remark = "Test remark" });

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Equal("Claim status must be Pending Approval", result.Message);
        }

        [Fact]
        public async Task ApproveClaimAsync_ReturnsError_WhenUpdateFails()
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
            _claimRepoMock.Setup(c => c.GetByIdAsync(It.IsAny<Guid>(),
                It.IsAny<Expression<Func<ClaimRequest, object>>>(),
                It.IsAny<Expression<Func<ClaimRequest, object>>>()))
                .ReturnsAsync(claim);
            _claimRepoMock.Setup(c => c.Update(It.IsAny<ClaimRequest>())).ReturnsAsync(false);

            // Act
            var result = await _claimService.ApproveClaimAsync(claim.Id, new ClaimStatusDTO { Remark = "Test remark" });

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Equal("Failed to update claim", result.Message);
        }

        [Fact]
        public async Task ApproveClaimAsync_ReturnsSuccess_WhenValid()
        {
            // Arrange
            var claimId = Guid.NewGuid();
            var userId = Guid.NewGuid();
            var remarkDto = new ClaimStatusDTO { Remark = "Approved remark" };

            var adminUser = new User { Id = userId, RoleName = "ADMIN", FullName = "Admin User", Email = "admin@example.com" };
            _userRepoMock.Setup(r => r.GetCurrentUserAsync()).ReturnsAsync(adminUser);

            var claim = new ClaimRequest
            {
                Id = claimId,
                Status = ClaimStatus.PendingApproval,
                Project = new Project { ProjectName = "Project X" },
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
                UserAction = UserAction.Approve,
                ActionDate = _fixedTime,
                ActionBy = userId,
                User = adminUser
            };
            _auditRepoMock.Setup(a => a.AddAsync(It.IsAny<AuditTrail>())).ReturnsAsync(auditTrail);

            // Setup finance team query (dùng TestAsyncEnumerable để trả về danh sách email)
            var financeUsers = new List<User>
            {
                new User { Email = "finance1@example.com", RoleName = "FINANCE" },
                new User { Email = "finance2@example.com", RoleName = "FINANCE" }
            }.AsQueryable();
            _userRepoMock.Setup(r => r.GetQueryable()).Returns(new TestAsyncEnumerable<User>(financeUsers));

            _emailServiceMock.Setup(e => e.SendClaimRequestEmailAsync(
                It.IsAny<List<string>>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);
            _emailServiceMock.Setup(e => e.SendApprovalNotificationEmailAsync(
                It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            _mapperMock.Setup(m => m.Map<AuditTrailResponse>(It.IsAny<AuditTrail>()))
                .Returns((AuditTrail audit) => new AuditTrailResponse
                {
                    ClaimId = audit.ClaimId,
                    ActionName = audit.UserAction.ToString(),
                    ActionBy = adminUser.FullName,
                    ActionDate = audit.ActionDate
                });

            // Act
            var result = await _claimService.ApproveClaimAsync(claimId, remarkDto);

            // Assert
            Assert.True(result.IsSuccess);
            Assert.Equal("Claim approved successfully.", result.Message);
            var auditResponse = result.Data as AuditTrailResponse;
            Assert.NotNull(auditResponse);
            Assert.Equal(claimId, auditResponse.ClaimId);
            Assert.Equal(UserAction.Approve.ToString(), auditResponse.ActionName);
            Assert.Equal(adminUser.FullName, auditResponse.ActionBy);
            Assert.Equal(_fixedTime, auditResponse.ActionDate);

            _claimRepoMock.Verify(c => c.Update(It.IsAny<ClaimRequest>()), Times.Once);
            _auditRepoMock.Verify(a => a.AddAsync(It.IsAny<AuditTrail>()), Times.Once);
            _uowMock.Verify(u => u.SaveChangeAsync(), Times.Once);
        }

        [Fact]
        public async Task ApproveClaimAsync_HandleExceptions_ReturnsFailureResult()
        {
            // Arrange
            var claimId = Guid.NewGuid();
            var remarkDto = new ClaimStatusDTO { Remark = "Test remark" };
            _userRepoMock.Setup(r => r.GetCurrentUserAsync()).ThrowsAsync(new Exception("Test exception"));

            // Act
            var result = await _claimService.ApproveClaimAsync(claimId, remarkDto);

            // Assert
            Assert.False(result.IsSuccess);
            Assert.Equal("Test exception", result.Message);
        }
    }

    // Các lớp trợ giúp cho async queryable
    public class TestAsyncEnumerable<T> : EnumerableQuery<T>, IAsyncEnumerable<T>, IQueryable<T>
    {
        public TestAsyncEnumerable(IEnumerable<T> enumerable) : base(enumerable) { }
        public TestAsyncEnumerable(Expression expression) : base(expression) { }
        public IAsyncEnumerator<T> GetAsyncEnumerator(System.Threading.CancellationToken cancellationToken = default) => new TestAsyncEnumerator<T>(this.AsEnumerable().GetEnumerator());
        IQueryProvider IQueryable.Provider => new TestAsyncQueryProvider<T>(this);
    }

    public class TestAsyncEnumerator<T> : IAsyncEnumerator<T>
    {
        private readonly IEnumerator<T> _inner;
        public TestAsyncEnumerator(IEnumerator<T> inner) { _inner = inner; }
        public ValueTask DisposeAsync() { _inner.Dispose(); return ValueTask.CompletedTask; }
        public ValueTask<bool> MoveNextAsync() => new ValueTask<bool>(_inner.MoveNext());
        public T Current => _inner.Current;
    }

    public class TestAsyncQueryProvider<TEntity> : IAsyncQueryProvider
    {
        private readonly IQueryProvider _inner;
        public TestAsyncQueryProvider(IQueryProvider inner) { _inner = inner; }
        public IQueryable CreateQuery(Expression expression) => new TestAsyncEnumerable<TEntity>(expression);
        public IQueryable<TElement> CreateQuery<TElement>(Expression expression) => new TestAsyncEnumerable<TElement>(expression);
        public object Execute(Expression expression) => _inner.Execute(expression);
        public TResult Execute<TResult>(Expression expression) => _inner.Execute<TResult>(expression);
        public IAsyncEnumerable<TResult> ExecuteAsync<TResult>(Expression expression) => new TestAsyncEnumerable<TResult>(expression);
        public TResult ExecuteAsync<TResult>(Expression expression, System.Threading.CancellationToken cancellationToken) => Execute<TResult>(expression);
    }
}
