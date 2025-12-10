using AutoMapper;
using BusinessObjects;
using DTOs.AuditTrailDTOs;
using DTOs.Enums;
using Moq;
using Repositories.Interfaces;
using Services.Gmail;
using Services.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace Test.ClaimTestFixture
{
    public class PaidClaimTestFixture
    {
        public Mock<IUnitOfWork> UnitOfWorkMock { get; }
        public Mock<IMapper> MapperMock { get; }
        public ClaimService ClaimService { get; }
        public Mock<IClaimRepository> ClaimRepoMock { get; private set; }
        public Mock<IUserRepository> UserRepoMock { get; private set; }
        public Mock<IAuditTrailRepository> AuditTrailRepoMock { get; private set; }
        public Mock<ICurrentTime> CurrentTimeMock { get; private set; }
        public Mock<IEmailService> EmailServiceMock { get; private set; }

        private List<ClaimRequest> _claimData;
        private readonly DateTime _currentTime = DateTime.UtcNow;
        public readonly Guid ValidClaimId = Guid.NewGuid();
        public readonly Guid InvalidClaimId = Guid.NewGuid();
        public readonly Guid NonApprovedClaimId = Guid.NewGuid();
        public readonly User FinanceUser;
        public readonly User StaffUser;
        public readonly User ApproverUser;
        public readonly ClaimRequest ValidClaim;
        public readonly ClaimRequest NonApprovedClaim;

        public PaidClaimTestFixture()
        {
            // Tạo users với các vai trò khác nhau
            FinanceUser = new User
            {
                Id = Guid.NewGuid(),
                Email = "finance@example.com",
                FullName = "Finance User",
                RoleName = RoleEnums.FINANCE.ToString()
            };

            StaffUser = new User
            {
                Id = Guid.NewGuid(),
                Email = "staff@example.com",
                FullName = "Staff User",
                RoleName = RoleEnums.STAFF.ToString()
            };

            ApproverUser = new User
            {
                Id = Guid.NewGuid(),
                Email = "approver@example.com",
                FullName = "Approver User",
                RoleName = RoleEnums.APPROVER.ToString()
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
                Status = ClaimStatus.Approved,
                CreatedAt = _currentTime,
                Project = project,
                Creator = creator,
                CreatorId = creatorId
            };
            // Tạo claim chưa được approved để test
            NonApprovedClaim = new ClaimRequest
            {
                Id = NonApprovedClaimId,
                Status = ClaimStatus.PendingApproval,
                CreatedAt = _currentTime,
                Project = project,
                Creator = creator,
                CreatorId = creatorId
            };

            // Khởi tạo danh sách claim
            _claimData = new List<ClaimRequest> { ValidClaim, NonApprovedClaim };

            // Setup mocks
            ClaimRepoMock = new Mock<IClaimRepository>();
            UserRepoMock = new Mock<IUserRepository>();
            AuditTrailRepoMock = new Mock<IAuditTrailRepository>();
            UnitOfWorkMock = new Mock<IUnitOfWork>();
            MapperMock = new Mock<IMapper>();
            CurrentTimeMock = new Mock<ICurrentTime>();
            EmailServiceMock = new Mock<IEmailService>();

            // Mặc định trả về Finance user
            UserRepoMock.Setup(repo => repo.GetCurrentUserAsync())
                .ReturnsAsync(FinanceUser);

            // Setup mock cho GetByIdAsync 
            ClaimRepoMock.Setup(repo => repo.GetByIdAsync(
                    It.Is<Guid>(id => id == ValidClaimId),
                    It.IsAny<Expression<Func<ClaimRequest, object>>>(),
                    It.IsAny<Expression<Func<ClaimRequest, object>>>()))
                .ReturnsAsync(ValidClaim);

            ClaimRepoMock.Setup(repo => repo.GetByIdAsync(
                    It.Is<Guid>(id => id == NonApprovedClaimId),
                    It.IsAny<Expression<Func<ClaimRequest, object>>>(),
                    It.IsAny<Expression<Func<ClaimRequest, object>>>()))
                .ReturnsAsync(NonApprovedClaim);

            ClaimRepoMock.Setup(repo => repo.GetByIdAsync(
                    It.Is<Guid>(id => id == InvalidClaimId || id != ValidClaimId && id != NonApprovedClaimId),
                    It.IsAny<Expression<Func<ClaimRequest, object>>>(),
                    It.IsAny<Expression<Func<ClaimRequest, object>>>()))
                .ReturnsAsync((ClaimRequest)null);

            // Setup cho Update
            ClaimRepoMock.Setup(repo => repo.Update(It.IsAny<ClaimRequest>()))
                .ReturnsAsync(true);

            // Setup cho AuditTrail
            AuditTrailRepoMock.Setup(repo => repo.AddAsync(It.IsAny<AuditTrail>()))
                .ReturnsAsync((AuditTrail auditTrail) => {
                    auditTrail.Id = Guid.NewGuid();
                    auditTrail.ActionDate = _currentTime;
                    auditTrail.User = FinanceUser;
                    return auditTrail;
                });

            // Setup mapper cho AuditTrail to AuditTrailResponse
            MapperMock.Setup(m => m.Map<AuditTrailResponse>(It.IsAny<AuditTrail>()))
                .Returns((AuditTrail audit) => new AuditTrailResponse
                {
                    ClaimId = audit.ClaimId,
                    ActionName = audit.UserAction.ToString(),
                    ActionBy = audit.User?.FullName ?? "Test User",
                    ActionDate = _currentTime
                });

            // Setup UnitOfWork
            UnitOfWorkMock.Setup(u => u.ClaimRepository).Returns(ClaimRepoMock.Object);
            UnitOfWorkMock.Setup(u => u.UserRepository).Returns(UserRepoMock.Object);
            UnitOfWorkMock.Setup(u => u.AuditTrailRepository).Returns(AuditTrailRepoMock.Object);
            UnitOfWorkMock.Setup(u => u.SaveChangeAsync()).ReturnsAsync(1);

            // Setup CurrentTime
            CurrentTimeMock.Setup(ct => ct.GetCurrentTime()).Returns(_currentTime);

            // Tạo ClaimService
            ClaimService = new ClaimService(
                UnitOfWorkMock.Object,
                MapperMock.Object,
                EmailServiceMock.Object,
                CurrentTimeMock.Object);
        }

        public void SetCurrentUser(User user)
        {
            UserRepoMock.Setup(repo => repo.GetCurrentUserAsync())
                .ReturnsAsync(user);
        }
    }
}
