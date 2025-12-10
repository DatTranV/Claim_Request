using AutoMapper;
using BusinessObjects;
using DTOs.AuditTrailDTOs;
using DTOs.EmailSendingDTO;
using Microsoft.EntityFrameworkCore;
using Moq;
using Repositories;
using Repositories.Interfaces;
using Services.Gmail;
using Services.Services;
using System.Linq.Expressions;

namespace Test.ClaimTestFixture
{
    public class SubmitClaimTestFixture : IDisposable
    {
        public ClaimRequestDbContext Context { get; private set; }
        public IUnitOfWork UnitOfWork { get; }
        public IMapper Mapper { get; }
        public ClaimService ClaimService { get; }
        public Mock<IClaimRepository> ClaimRepoMock { get; private set; }
        public Mock<IUserRepository> UserRepoMock { get; private set; }
        public Mock<IAuditTrailRepository> AuditTrailRepoMock { get; private set; }
        public Mock<IProjectEnrollmentRepository> ProjectEnrollmentRepoMock { get; private set; }

        // QUAN TRỌNG: Tạo các ID và đối tượng public để dễ tham chiếu trong test
        public Guid CreatorId { get; private set; }
        public Guid OtherCreatorId { get; private set; }
        public Guid ProjectId { get; private set; }
        public Guid NoManagerProjectId { get; private set; }
        public Guid SuccessClaimId { get; private set; }
        public Guid WrongStatusClaimId { get; private set; }
        public Guid DifferentCreatorClaimId { get; private set; }
        public Guid NoManagerClaimId { get; private set; }
        
        private readonly DateTime _currentTime = DateTime.UtcNow;
        private User _currentUser;
        private User _otherUser;
        private Project _mainProject;
        private Project _noManagerProject;
        
        // Lưu trữ danh sách claim để mock repository trả về
        private Dictionary<Guid, ClaimRequest> _claimDict = new Dictionary<Guid, ClaimRequest>();

        public SubmitClaimTestFixture()
        {
            // Khởi tạo các ID cố định
            CreatorId = Guid.NewGuid();
            OtherCreatorId = Guid.NewGuid();
            ProjectId = Guid.NewGuid();
            NoManagerProjectId = Guid.NewGuid();
            SuccessClaimId = Guid.NewGuid();
            WrongStatusClaimId = Guid.NewGuid();
            DifferentCreatorClaimId = Guid.NewGuid();
            NoManagerClaimId = Guid.NewGuid();
            
            // Tạo database với tên duy nhất
            var databaseName = $"SubmitClaimTestDb_{Guid.NewGuid()}";
            var options = new DbContextOptionsBuilder<ClaimRequestDbContext>()
                .UseInMemoryDatabase(databaseName)
                .Options;
            
            Context = new ClaimRequestDbContext(options);
            
            // Khởi tạo và setup dữ liệu
            InitializeData();
            SetupMocks();
            
            var unitOfWorkMock = new Mock<IUnitOfWork>();
            unitOfWorkMock.Setup(u => u.ClaimRepository).Returns(ClaimRepoMock.Object);
            unitOfWorkMock.Setup(u => u.UserRepository).Returns(UserRepoMock.Object);
            unitOfWorkMock.Setup(u => u.AuditTrailRepository).Returns(AuditTrailRepoMock.Object);
            unitOfWorkMock.Setup(u => u.ProjectEnrollmentRepository).Returns(ProjectEnrollmentRepoMock.Object);
            unitOfWorkMock.Setup(u => u.SaveChangeAsync()).ReturnsAsync(1);
            UnitOfWork = unitOfWorkMock.Object;

            var mapperMock = new Mock<IMapper>();
            mapperMock.Setup(m => m.Map<AuditTrailResponse>(It.IsAny<AuditTrail>()))
                .Returns((AuditTrail audit) => new AuditTrailResponse
                {
                    ClaimId = audit.ClaimId,
                    ActionName = audit.UserAction.ToString(),
                    ActionBy = _currentUser.UserName,
                    ActionDate = _currentTime
                });

            Mapper = mapperMock.Object;

            var emailServiceMock = new Mock<IEmailService>();
            var currentTimeMock = new Mock<ICurrentTime>();
            ClaimService = new ClaimService(UnitOfWork, mapperMock.Object, null, currentTimeMock.Object);
        }

        private void InitializeData()
        {
            // Tạo các User
            _currentUser = new User
            {
                Id = CreatorId,
                Email = "creator@example.com",
                UserName = "Creator User",
                FullName = "Creator User",
                RoleName = "STAFF"
            };
            
            _otherUser = new User
            {
                Id = OtherCreatorId,
                Email = "other@example.com",
                UserName = "Other User",
                FullName = "Other User",
                RoleName = "STAFF"
            };
            
            // Tạo các Project
            _mainProject = new Project
            {
                Id = ProjectId,
                ProjectName = "Success Project"
            };
            
            _noManagerProject = new Project
            {
                Id = NoManagerProjectId,
                ProjectName = "No Manager Project"
            };
            
            // Thêm vào database context
            Context.Users.Add(_currentUser);
            Context.Users.Add(_otherUser);
            Context.Projects.Add(_mainProject);
            Context.Projects.Add(_noManagerProject);
            Context.SaveChanges();
            
            // Tạo các ClaimRequest với đầy đủ quan hệ
            var successClaim = new ClaimRequest
            {
                Id = SuccessClaimId,
                Status = ClaimStatus.Draft,
                CreatedAt = _currentTime,
                ProjectId = ProjectId,
                CreatorId = CreatorId,
                Project = _mainProject,
                Creator = _currentUser
            };
            
            var wrongStatusClaim = new ClaimRequest
            {
                Id = WrongStatusClaimId,
                Status = ClaimStatus.PendingApproval,
                CreatedAt = _currentTime,
                ProjectId = ProjectId,
                CreatorId = CreatorId,
                Project = _mainProject,
                Creator = _currentUser
            };
            
            var differentCreatorClaim = new ClaimRequest
            {
                Id = DifferentCreatorClaimId,
                Status = ClaimStatus.Draft,
                CreatedAt = _currentTime,
                ProjectId = ProjectId,
                CreatorId = OtherCreatorId,
                Project = _mainProject,
                Creator = _otherUser
            };
            
            var noManagerClaim = new ClaimRequest
            {
                Id = NoManagerClaimId,
                Status = ClaimStatus.Draft,
                CreatedAt = _currentTime,
                ProjectId = NoManagerProjectId,
                CreatorId = CreatorId,
                Project = _noManagerProject,
                Creator = _currentUser
            };
            
            // Thêm vào database
            Context.ClaimRequests.Add(successClaim);
            Context.ClaimRequests.Add(wrongStatusClaim);
            Context.ClaimRequests.Add(differentCreatorClaim);
            Context.ClaimRequests.Add(noManagerClaim);
            Context.SaveChanges();
            
            // Thêm vào dictionary để mock repository
            _claimDict[SuccessClaimId] = successClaim;
            _claimDict[WrongStatusClaimId] = wrongStatusClaim;
            _claimDict[DifferentCreatorClaimId] = differentCreatorClaim;
            _claimDict[NoManagerClaimId] = noManagerClaim;
        }

        private void SetupMocks()
        {
            ClaimRepoMock = new Mock<IClaimRepository>();
            UserRepoMock = new Mock<IUserRepository>();
            AuditTrailRepoMock = new Mock<IAuditTrailRepository>();
            ProjectEnrollmentRepoMock = new Mock<IProjectEnrollmentRepository>();
            
            // Mock cho Project Manager
            var projectManager = new User
            {
                Id = Guid.NewGuid(),
                Email = "pm@example.com",
                UserName = "Project Manager",
                FullName = "Project Manager",
                RoleName = "APPROVER"
            };
            
            var projectEnrollment = new ProjectEnrollment
            {
                Id = Guid.NewGuid(),
                ProjectId = ProjectId,
                UserId = projectManager.Id,
                ProjectRole = ProjectRole.ProjectManager,
                User = projectManager
            };

            // Setup Claim Repository để trả về claim từ dictionary
            ClaimRepoMock.Setup(repo => repo.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<Expression<Func<ClaimRequest, object>>[]>()))
                .ReturnsAsync((Guid id, Expression<Func<ClaimRequest, object>>[] includes) =>
                {
                    return _claimDict.ContainsKey(id) ? _claimDict[id] : null;
                });
            
            ClaimRepoMock.Setup(repo => repo.Update(It.IsAny<ClaimRequest>()))
                .ReturnsAsync(true);

            // Setup User Repository
            UserRepoMock.Setup(repo => repo.GetCurrentUserAsync())
                .ReturnsAsync(_currentUser);

            // Setup Project Enrollment Repository
            ProjectEnrollmentRepoMock.Setup(repo => repo.GetProjectEnrolmentByProjectAndProjectRoleAsync(
                    It.Is<Guid>(id => id == ProjectId), It.Is<ProjectRole>(pr => pr == ProjectRole.ProjectManager)))
                .ReturnsAsync(projectEnrollment);
            
            ProjectEnrollmentRepoMock.Setup(repo => repo.GetProjectEnrolmentByProjectAndProjectRoleAsync(
                    It.Is<Guid>(id => id == NoManagerProjectId), It.IsAny<ProjectRole>()))
                .ReturnsAsync((ProjectEnrollment)null);

            // Setup Audit Trail Repository
            AuditTrailRepoMock.Setup(repo => repo.AddAuditTrailAsync(It.IsAny<AuditTrail>()))
                .ReturnsAsync((AuditTrail auditTrail) =>
                {
                    auditTrail.ActionDate = _currentTime;
                    auditTrail.User = _currentUser;
                    return auditTrail;
                });
        }

        public void Dispose()
        {
            Context.Database.EnsureDeleted();
            Context.Dispose();
        }
    }
} 