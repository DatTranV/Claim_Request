using AutoMapper;
using BusinessObjects;
using DTOs.AuditTrailDTOs;
using Microsoft.EntityFrameworkCore;
using Moq;
using Repositories;
using Repositories.Interfaces;
using Services.Gmail;
using Services.Services;
using System.Linq.Expressions;

namespace Test.ClaimTestFixture
{
    public class ReturnClaimTestFixture : IDisposable
    {
        public ClaimRequestDbContext Context { get; }
        public IUnitOfWork UnitOfWork { get; }
        public IMapper Mapper { get; }
        public ClaimService ClaimService { get; }
        public Mock<IClaimRepository> ClaimRepoMock { get; private set; }
        public Mock<IUserRepository> UserRepoMock { get; private set; }
        public Mock<IAuditTrailRepository> AuditTrailRepoMock { get; private set; }
        public Mock<ICurrentTime> CurrentTimeMock { get; private set; }

        private List<ClaimRequest> claimData;
        private readonly DateTime _currentTime = DateTime.UtcNow;

        public ReturnClaimTestFixture()
        {
            var options = new DbContextOptionsBuilder<ClaimRequestDbContext>()
                .UseInMemoryDatabase(databaseName: "ReturnClaimTestDb")
                .Options;
            Context = new ClaimRequestDbContext(options);

            claimData = new List<ClaimRequest>();
            SeedDatabase();

            // Setup mocks
            SetupMocks();

            var unitOfWorkMock = new Mock<IUnitOfWork>();
            unitOfWorkMock.Setup(u => u.ClaimRepository).Returns(ClaimRepoMock.Object);
            unitOfWorkMock.Setup(u => u.UserRepository).Returns(UserRepoMock.Object);
            unitOfWorkMock.Setup(u => u.AuditTrailRepository).Returns(AuditTrailRepoMock.Object);
            unitOfWorkMock.Setup(u => u.SaveChangeAsync()).ReturnsAsync(1);
            UnitOfWork = unitOfWorkMock.Object;

            var mapperMock = new Mock<IMapper>();
            // Setup mapper for AuditTrail to AuditTrailResponse
            mapperMock.Setup(m => m.Map<AuditTrailResponse>(It.IsAny<AuditTrail>()))
                .Returns((AuditTrail audit) => new AuditTrailResponse
                {
                    ClaimId = audit.ClaimId,
                    ActionName = audit.UserAction.ToString(),
                    ActionBy = audit.User?.FullName ?? "Test User",
                    ActionDate = _currentTime
                });

            Mapper = mapperMock.Object;

            var emailServiceMock = new Mock<IEmailService>();
            var currentTimeMock = new Mock<ICurrentTime>();
            ClaimService = new ClaimService(UnitOfWork, mapperMock.Object, null, currentTimeMock.Object);
        }

        private void SetupMocks()
        {
            ClaimRepoMock = new Mock<IClaimRepository>();
            UserRepoMock = new Mock<IUserRepository>();
            AuditTrailRepoMock = new Mock<IAuditTrailRepository>();

            var currentUser = new User
            {
                Id = Guid.NewGuid(),
                Email = "test@example.com",
                FullName = "Test User",
                RoleName = "APPROVER"
            };

            // Setup claim repository
            ClaimRepoMock.Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<Expression<Func<ClaimRequest, object>>[]>()))
                .ReturnsAsync((Guid id, Expression<Func<ClaimRequest, object>>[] includes) =>
                {
                    return claimData.FirstOrDefault(c => c.Id == id);
                });

            ClaimRepoMock.Setup(repo => repo.Update(It.IsAny<ClaimRequest>()))
                .ReturnsAsync(true);

            // Setup user repository
            UserRepoMock.Setup(repo => repo.GetCurrentUserAsync())
                .ReturnsAsync(currentUser);

            // Setup audit trail repository with proper ActionDate
            AuditTrailRepoMock.Setup(repo => repo.AddAsync(It.IsAny<AuditTrail>()))
                .ReturnsAsync((AuditTrail auditTrail) =>
                {
                    auditTrail.ActionDate = _currentTime;
                    auditTrail.User = currentUser;
                    return auditTrail;
                });

            AuditTrailRepoMock.Setup(repo => repo.AddAuditTrailAsync(It.IsAny<AuditTrail>()))
                .ReturnsAsync((AuditTrail auditTrail) =>
                {
                    auditTrail.ActionDate = _currentTime;
                    auditTrail.User = currentUser;
                    return auditTrail;
                });
        }

        private void SeedDatabase()
        {
            var creator1Id = Guid.NewGuid();
            var creator2Id = Guid.NewGuid();

            claimData.AddRange(new List<ClaimRequest>
                {
                    // Claim for success test case
                    new ClaimRequest
                    {
                        Id = Guid.NewGuid(),
                        Status = ClaimStatus.PendingApproval,
                        CreatedAt = _currentTime,
                        Project = new Project { ProjectName = "Success Test Project" },
                        Creator = new User
                        {
                            Id = creator1Id,
                            Email = "success@example.com",
                            FullName = "Success Test User"
                        },
                        CreatorId = creator1Id
                    },
                    // Separate claim for empty remark test case
                    new ClaimRequest
                    {
                        Id = Guid.NewGuid(),
                        Status = ClaimStatus.PendingApproval,
                        CreatedAt = _currentTime,
                        Project = new Project { ProjectName = "Empty Remark Test Project" },
                        Creator = new User
                        {
                            Id = creator2Id,
                            Email = "empty@example.com",
                            FullName = "Empty Remark Test User"
                        },
                        CreatorId = creator2Id
                    },
                    // Claim for draft status test
                    new ClaimRequest
                    {
                        Id = Guid.NewGuid(),
                        Status = ClaimStatus.Draft,
                        Project = new Project { ProjectName = "Draft Project" },
                        Creator = new User { Email = "draft@example.com", FullName = "Draft User" }
                    }
                });
            Context.ClaimRequests.AddRange(claimData);
            Context.SaveChanges();
        }

        public void Dispose()
        {
            Context.Database.EnsureDeleted();
            Context.Dispose();
        }
    }
}
