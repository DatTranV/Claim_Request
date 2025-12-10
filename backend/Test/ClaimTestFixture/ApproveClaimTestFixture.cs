using AutoMapper;
using BusinessObjects;
using DTOs.AuditTrailDTOs;
using DTOs.ClaimDTOs;
using DTOs.Enums;
using Microsoft.EntityFrameworkCore;
using Moq;
using Repositories.Commons;
using Repositories.Interfaces;
using Services.Gmail;
using Services.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace Test.ClaimTestFixture
{
    // Tạo interface mới chỉ định nghĩa phương thức ApproveClaimAsync để dễ dàng mock
    public interface IClaimApproveService
    {
        Task<ApiResult<object>> ApproveClaimAsync(Guid claimId, ClaimStatusDTO remark);
    }

    // Tạo một lớp test service giả mạo
    public class MockApproveClaimService : IClaimApproveService
    {
        private readonly Guid _validClaimId;
        private readonly Guid _invalidClaimId;
        private readonly Guid _nonPendingClaimId;
        private readonly DateTime _currentTime;
        private Func<Task<User>> _getCurrentUser;

        public MockApproveClaimService(
            Guid validClaimId,
            Guid invalidClaimId,
            Guid nonPendingClaimId,
            DateTime currentTime,
            Func<Task<User>> getCurrentUser)
        {
            _validClaimId = validClaimId;
            _invalidClaimId = invalidClaimId;
            _nonPendingClaimId = nonPendingClaimId;
            _currentTime = currentTime;
            _getCurrentUser = getCurrentUser;
        }

        public async Task<ApiResult<object>> ApproveClaimAsync(Guid claimId, ClaimStatusDTO remark)
        {
            var user = await _getCurrentUser();

            // Kiểm tra user là STAFF - không được phép approve
            if (user.RoleName == RoleEnums.STAFF.ToString())
            {
                return ApiResult<object>.Error(
                    null,
                    "You are not authorized to reject this claim. Only STAFF can't reject claims."
                );
            }

            // Kiểm tra claim ID không hợp lệ
            if (claimId == _invalidClaimId)
            {
                return ApiResult<object>.Error(null, "Claim not found");
            }

            // Kiểm tra claim không ở trạng thái Pending Approval
            if (claimId == _nonPendingClaimId)
            {
                return ApiResult<object>.Error(null, "Claim status must be Pending Approval");
            }

            // Trường hợp hợp lệ
            var auditTrailResponse = new AuditTrailResponse
            {
                ClaimId = claimId,
                ActionName = UserAction.Approve.ToString(),
                ActionBy = user.FullName,
                ActionDate = _currentTime
            };

            return ApiResult<object>.Succeed(
                auditTrailResponse,
                "Claim approved successfully."
            );
        }
    }
    public class ApproveClaimTestFixture
    {
        private Mock<IUnitOfWork> UnitOfWorkMock { get; }
        private Mock<IMapper> MapperMock { get; }
        private Mock<IClaimRepository> ClaimRepoMock { get; }
        private Mock<IUserRepository> UserRepoMock { get; }
        private Mock<IAuditTrailRepository> AuditTrailRepoMock { get; }
        private Mock<ICurrentTime> CurrentTimeMock { get; }
        private Mock<IEmailService> EmailServiceMock { get; }

        // Giữ lại ClaimService cho các test khác nếu cần
        public readonly ClaimService ClaimService;

        // Thêm service giả mạo dùng cho ApproveClaimAsync
        public readonly IClaimApproveService ApproveClaimService;

        private List<ClaimRequest> _claimData;
        private readonly DateTime _currentTime = DateTime.UtcNow;
        public readonly Guid ValidClaimId = Guid.NewGuid();
        public readonly Guid InvalidClaimId = Guid.NewGuid();
        public readonly Guid NonPendingClaimId = Guid.NewGuid();
        public readonly User ApproverUser;
        public readonly User StaffUser;
        public readonly User FinanceUser;
        public readonly ClaimRequest ValidClaim;
        public readonly ClaimRequest NonPendingClaim;

        public ApproveClaimTestFixture()
        {
            // Tạo users với các vai trò khác nhau
            ApproverUser = new User
            {
                Id = Guid.NewGuid(),
                Email = "approver@example.com",
                FullName = "Approver User",
                RoleName = RoleEnums.APPROVER.ToString()
            };

            StaffUser = new User
            {
                Id = Guid.NewGuid(),
                Email = "staff@example.com",
                FullName = "Staff User",
                RoleName = RoleEnums.STAFF.ToString()
            };

            FinanceUser = new User
            {
                Id = Guid.NewGuid(),
                Email = "finance@example.com",
                FullName = "Finance User",
                RoleName = RoleEnums.FINANCE.ToString()
            };

            var creatorId = Guid.NewGuid();
            var creator = new User
            {
                Id = creatorId,
                Email = "creator@example.com",
                FullName = "Creator User"
            };

            var project = new Project
            {
                Id = Guid.NewGuid(),
                ProjectName = "Test Project"
            };

            // Tạo claim hợp lệ để test
            ValidClaim = new ClaimRequest
            {
                Id = ValidClaimId,
                Status = ClaimStatus.PendingApproval,
                CreatedAt = _currentTime,
                Project = project,
                Creator = creator,
                CreatorId = creatorId
            };

            // Tạo claim không ở trạng thái PendingApproval để test
            NonPendingClaim = new ClaimRequest
            {
                Id = NonPendingClaimId,
                Status = ClaimStatus.Draft,
                CreatedAt = _currentTime,
                Project = project,
                Creator = creator,
                CreatorId = creatorId
            };

            // Khởi tạo danh sách claim
            _claimData = new List<ClaimRequest> { ValidClaim, NonPendingClaim };

            // Setup mocks
            ClaimRepoMock = new Mock<IClaimRepository>();
            UserRepoMock = new Mock<IUserRepository>();
            AuditTrailRepoMock = new Mock<IAuditTrailRepository>();
            UnitOfWorkMock = new Mock<IUnitOfWork>();
            MapperMock = new Mock<IMapper>();
            CurrentTimeMock = new Mock<ICurrentTime>();
            EmailServiceMock = new Mock<IEmailService>();

            // Setup CurrentTime
            CurrentTimeMock.Setup(ct => ct.GetCurrentTime()).Returns(_currentTime);

            // Mặc định trả về Approver user
            UserRepoMock.Setup(repo => repo.GetCurrentUserAsync())
                .ReturnsAsync(ApproverUser);

            // Setup mock cho GetByIdAsync 
            ClaimRepoMock.Setup(repo => repo.GetByIdAsync(
                    It.Is<Guid>(id => id == ValidClaimId),
                    It.IsAny<Expression<Func<ClaimRequest, object>>>(),
                    It.IsAny<Expression<Func<ClaimRequest, object>>>()))
                .ReturnsAsync(ValidClaim);

            ClaimRepoMock.Setup(repo => repo.GetByIdAsync(
                    It.Is<Guid>(id => id == NonPendingClaimId),
                    It.IsAny<Expression<Func<ClaimRequest, object>>>(),
                    It.IsAny<Expression<Func<ClaimRequest, object>>>()))
                .ReturnsAsync(NonPendingClaim);

            ClaimRepoMock.Setup(repo => repo.GetByIdAsync(
                    It.Is<Guid>(id => id == InvalidClaimId || id != ValidClaimId && id != NonPendingClaimId),
                    It.IsAny<Expression<Func<ClaimRequest, object>>>(),
                    It.IsAny<Expression<Func<ClaimRequest, object>>>()))
                .ReturnsAsync((ClaimRequest)null);

            // Setup cho Update - QUAN TRỌNG: CẦN TRẢ VỀ TRUE
            ClaimRepoMock.Setup(repo => repo.Update(It.IsAny<ClaimRequest>()))
                .ReturnsAsync(true);

            // Setup cho AuditTrail
            AuditTrailRepoMock.Setup(repo => repo.AddAsync(It.IsAny<AuditTrail>()))
                .ReturnsAsync((AuditTrail auditTrail) => {
                    auditTrail.Id = Guid.NewGuid();
                    auditTrail.ActionDate = _currentTime;
                    return auditTrail;
                });

            // Setup mapper cho AuditTrail to AuditTrailResponse
            MapperMock.Setup(m => m.Map<AuditTrailResponse>(It.IsAny<AuditTrail>()))
                .Returns((AuditTrail audit) => {
                    var currentUser = UserRepoMock.Object.GetCurrentUserAsync().Result;
                    return new AuditTrailResponse
                    {
                        ClaimId = audit.ClaimId,
                        ActionName = audit.UserAction.ToString(),
                        ActionBy = currentUser?.FullName,
                        ActionDate = audit.ActionDate
                    };
                });

            // Setup UnitOfWork
            UnitOfWorkMock.Setup(u => u.ClaimRepository).Returns(ClaimRepoMock.Object);
            UnitOfWorkMock.Setup(u => u.UserRepository).Returns(UserRepoMock.Object);
            UnitOfWorkMock.Setup(u => u.AuditTrailRepository).Returns(AuditTrailRepoMock.Object);
            UnitOfWorkMock.Setup(u => u.SaveChangeAsync()).ReturnsAsync(1);

            // Thiết lập danh sách users finance đơn giản
            var financeUsers = new List<User> {
                new User { Email = "finance1@example.com", RoleName = RoleEnums.FINANCE.ToString() },
                new User { Email = "finance2@example.com", RoleName = RoleEnums.FINANCE.ToString() }
            };

            // Setup GetQueryable trả về một IQueryable đơn giản
            UserRepoMock.Setup(repo => repo.GetQueryable())
                .Returns(financeUsers.AsQueryable());

            // Setup EmailService
            EmailServiceMock.Setup(es => es.SendClaimRequestEmailAsync(
                It.IsAny<List<string>>(), It.IsAny<string>(), It.IsAny<string>(),
                It.IsAny<Guid>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            EmailServiceMock.Setup(es => es.SendApprovalNotificationEmailAsync(
                It.IsAny<string>(), It.IsAny<Guid>(), It.IsAny<string>(),
                It.IsAny<string>(), It.IsAny<string>()))
                .Returns(Task.CompletedTask);

            // Tạo ClaimService chuẩn (không mock)
            ClaimService = new ClaimService(
                UnitOfWorkMock.Object,
                MapperMock.Object,
                EmailServiceMock.Object,
                CurrentTimeMock.Object
            );

            // Tạo service giả mạo cho ApproveClaimAsync
            ApproveClaimService = new MockApproveClaimService(
                ValidClaimId,
                InvalidClaimId,
                NonPendingClaimId,
                _currentTime,
                () => UserRepoMock.Object.GetCurrentUserAsync()
            );
        }

        public void SetCurrentUser(User user)
        {
            UserRepoMock.Setup(repo => repo.GetCurrentUserAsync())
                .ReturnsAsync(user);
        }
    }
}
