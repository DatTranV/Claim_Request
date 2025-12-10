using AutoMapper;
using BusinessObjects;
using DTOs.AuditTrailDTOs;
using DTOs.ClaimDTOs;
using Microsoft.EntityFrameworkCore;
using Moq;
using Repositories;
using Repositories.Interfaces;
using Services.Gmail;
using Services.Services;
using System.Linq.Expressions;

namespace Test.ClaimTestFixture
{
    public class UpdateClaimTestFixture : IDisposable
    {
        public ClaimRequestDbContext Context { get; private set; }
        public IUnitOfWork UnitOfWork { get; }
        public IMapper Mapper { get; }
        public ClaimService ClaimService { get; }
        public Mock<IClaimRepository> ClaimRepoMock { get; private set; }
        public Mock<IUserRepository> UserRepoMock { get; private set; }
        public Mock<IAuditTrailRepository> AuditTrailRepoMock { get; private set; }
        public Mock<IClaimDetailRepository> ClaimDetailRepoMock { get; private set; }

        // Public ID để sử dụng trong test
        public Guid CreatorId { get; private set; }
        public Guid OtherCreatorId { get; private set; }
        public Guid ProjectId { get; private set; }
        public Guid ValidClaimId { get; private set; }
        public Guid NonDraftClaimId { get; private set; }
        public Guid DifferentCreatorClaimId { get; private set; }

        private readonly DateTime _currentTime = DateTime.UtcNow;
        private User _currentUser;
        private User _otherUser;
        private Project _project;
        private Dictionary<Guid, ClaimRequest> _claimDict = new Dictionary<Guid, ClaimRequest>();

        public UpdateClaimTestFixture()
        {
            // Khởi tạo các ID cố định
            CreatorId = Guid.NewGuid();
            OtherCreatorId = Guid.NewGuid();
            ProjectId = Guid.NewGuid();
            ValidClaimId = Guid.NewGuid();
            NonDraftClaimId = Guid.NewGuid();
            DifferentCreatorClaimId = Guid.NewGuid();

            // Tạo database với tên duy nhất
            var databaseName = $"UpdateClaimTestDb_{Guid.NewGuid()}";
            var options = new DbContextOptionsBuilder<ClaimRequestDbContext>()
                .UseInMemoryDatabase(databaseName)
                .Options;

            Context = new ClaimRequestDbContext(options);

            // Khởi tạo và setup dữ liệu
            InitializeData();
            
            // Khởi tạo mocks
            ClaimRepoMock = new Mock<IClaimRepository>();
            UserRepoMock = new Mock<IUserRepository>();
            AuditTrailRepoMock = new Mock<IAuditTrailRepository>();
            ClaimDetailRepoMock = new Mock<IClaimDetailRepository>();
            
            // Setup mocks
            SetupMocks();

            // Cấu hình UnitOfWork
            var unitOfWorkMock = new Mock<IUnitOfWork>();
            unitOfWorkMock.Setup(u => u.ClaimRepository).Returns(ClaimRepoMock.Object);
            unitOfWorkMock.Setup(u => u.UserRepository).Returns(UserRepoMock.Object);
            unitOfWorkMock.Setup(u => u.AuditTrailRepository).Returns(AuditTrailRepoMock.Object);
            unitOfWorkMock.Setup(u => u.ClaimDetailRepository).Returns(ClaimDetailRepoMock.Object);
            
            // Thêm mock cho transaction
            var transactionMock = new Mock<Microsoft.EntityFrameworkCore.Storage.IDbContextTransaction>();
            unitOfWorkMock.Setup(u => u.BeginTransactionAsync()).ReturnsAsync(transactionMock.Object);
            
            // Đảm bảo SaveChangeAsync trả về thành công
            unitOfWorkMock.Setup(u => u.SaveChangeAsync()).ReturnsAsync(1);
            
            UnitOfWork = unitOfWorkMock.Object;

            var mapperMock = new Mock<IMapper>();
            
            // Setup mapper cho AuditTrail -> AuditTrailResponse
            mapperMock.Setup(m => m.Map<AuditTrailResponse>(It.IsAny<AuditTrail>()))
                .Returns((AuditTrail audit) => new AuditTrailResponse
                {
                    ClaimId = audit.ClaimId,
                    ActionName = audit.UserAction.ToString(),
                    ActionBy = _currentUser.FullName,
                    ActionDate = _currentTime
                });
                
            // Setup mapper cho ClaimToUpdateDTO -> ClaimRequest
            mapperMock.Setup(m => m.Map<ClaimRequest>(It.IsAny<ClaimToUpdateDTO>()))
                .Returns((ClaimToUpdateDTO dto) => 
                {
                    if (!_claimDict.ContainsKey(dto.Id))
                        return null;
                        
                    var claim = _claimDict[dto.Id];
                    claim.ProjectId = dto.ProjectId;
                    claim.TotalClaimAmount = (int)(dto.TotalClaimAmount ?? 0);
                    claim.Remark = dto.Remark;
                    return claim;
                });
                
            // Setup mapper cho ClaimDetailDTO -> ClaimDetail
            mapperMock.Setup(m => m.Map<ClaimDetail>(It.IsAny<ClaimDetailDTO>()))
                .Returns((ClaimDetailDTO dto) => new ClaimDetail
                {
                    Id = Guid.NewGuid(),
                    FromDate = dto.FromDate,
                    ToDate = dto.ToDate,
                    Remark = dto.Remark
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
                RoleName = "STAFF",
                Salary = 3000 // Cần cho tính toán TotalClaimAmount
            };

            _otherUser = new User
            {
                Id = OtherCreatorId,
                Email = "other@example.com",
                UserName = "Other User",
                FullName = "Other User",
                RoleName = "STAFF"
            };

            // Tạo Project
            _project = new Project
            {
                Id = ProjectId,
                ProjectName = "Test Project"
            };

            // Thêm vào database context
            Context.Users.Add(_currentUser);
            Context.Users.Add(_otherUser);
            Context.Projects.Add(_project);
            Context.SaveChanges();

            // Tạo các ClaimRequest với ClaimDetails là danh sách rỗng (nhưng không null)
            var validClaim = new ClaimRequest
            {
                Id = ValidClaimId,
                Status = ClaimStatus.Draft,
                CreatedAt = _currentTime,
                ProjectId = ProjectId,
                CreatorId = CreatorId,
                Project = _project,
                Creator = _currentUser,
                TotalWorkingHours = 40,
                TotalClaimAmount = 625, // (40 * 3000) / 192
                ClaimDetails = new List<ClaimDetail>()
            };

            var nonDraftClaim = new ClaimRequest
            {
                Id = NonDraftClaimId,
                Status = ClaimStatus.PendingApproval,
                CreatedAt = _currentTime,
                ProjectId = ProjectId,
                CreatorId = CreatorId,
                Project = _project,
                Creator = _currentUser,
                ClaimDetails = new List<ClaimDetail>()
            };

            var differentCreatorClaim = new ClaimRequest
            {
                Id = DifferentCreatorClaimId,
                Status = ClaimStatus.Draft,
                CreatedAt = _currentTime,
                ProjectId = ProjectId,
                CreatorId = OtherCreatorId,
                Project = _project,
                Creator = _otherUser,
                ClaimDetails = new List<ClaimDetail>()
            };

            // Thêm vào database
            Context.ClaimRequests.Add(validClaim);
            Context.ClaimRequests.Add(nonDraftClaim);
            Context.ClaimRequests.Add(differentCreatorClaim);
            Context.SaveChanges();

            // Thêm vào dictionary để mock repository
            _claimDict[ValidClaimId] = validClaim;
            _claimDict[NonDraftClaimId] = nonDraftClaim;
            _claimDict[DifferentCreatorClaimId] = differentCreatorClaim;
        }

        private void SetupMocks()
        {
            ClaimRepoMock = new Mock<IClaimRepository>();
            UserRepoMock = new Mock<IUserRepository>();
            AuditTrailRepoMock = new Mock<IAuditTrailRepository>();
            ClaimDetailRepoMock = new Mock<IClaimDetailRepository>();

            // Setup Claim Repository
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

            // Setup ClaimDetail Repository
            ClaimDetailRepoMock.Setup(repo => repo.GetClaimDetailsByClaimIdAsync(It.IsAny<Guid>()))
                .ReturnsAsync((Guid claimId) => 
                {
                    if (_claimDict.ContainsKey(claimId))
                    {
                        return _claimDict[claimId].ClaimDetails.ToList();
                    }
                    return new List<ClaimDetail>();
                });
                
            ClaimDetailRepoMock.Setup(repo => repo.Delete(It.IsAny<ClaimDetail>()))
                .ReturnsAsync(true);

            ClaimDetailRepoMock.Setup(repo => repo.AddAsync(It.IsAny<ClaimDetail>()))
                .ReturnsAsync((ClaimDetail detail) => 
                {
                    detail.Id = Guid.NewGuid();
                    if (detail.ClaimId.HasValue && _claimDict.ContainsKey(detail.ClaimId.Value))
                    {
                        _claimDict[detail.ClaimId.Value].ClaimDetails.Add(detail);
                    }
                    return detail;
                });

            // Setup Audit Trail Repository
            AuditTrailRepoMock.Setup(repo => repo.AddAuditTrailAsync(It.IsAny<AuditTrail>()))
                .ReturnsAsync((AuditTrail auditTrail) =>
                {
                    auditTrail.ActionDate = _currentTime;
                    auditTrail.User = _currentUser;
                    auditTrail.Id = Guid.NewGuid();
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