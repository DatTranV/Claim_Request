using Xunit;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using BusinessObjects;
using DTOs.ClaimDTOs;
using Repositories;
using Services.Services;
using AutoMapper;
using Services.Gmail;
using NSubstitute;
using Repositories.Interfaces;
using FakeItEasy;



namespace Test
{

}
public class ClaimServiceTests
{
    private readonly DbContextOptions<ClaimRequestDbContext> _dbContextOptions;
    private readonly IUserRepository _userRepository;
    private readonly IClaimRepository _claimRepository;
    private readonly IClaimDetailRepository _claimDetailRepository;
    private readonly IAuditTrailRepository _auditTrailRepository;
    private readonly IProjectEnrollmentRepository _projectEnrollmentRepository;
    private readonly IProjectRepository _projectRepository;
    private readonly IMapper _mapper;
    private readonly DateTime _currentTime = DateTime.UtcNow;


    public ClaimServiceTests()
    {
        _dbContextOptions = new DbContextOptionsBuilder<ClaimRequestDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // Use unique DB for each test
            .Options;
        _userRepository = A.Fake<IUserRepository>();
        _claimRepository = A.Fake<IClaimRepository>();
        _claimDetailRepository = A.Fake<IClaimDetailRepository>();
        _auditTrailRepository = A.Fake<IAuditTrailRepository>();
        _projectEnrollmentRepository = A.Fake<IProjectEnrollmentRepository>();
        _projectRepository = A.Fake<IProjectRepository>();
        _mapper = A.Fake<IMapper>();
        _currentTimeService = A.Fake<ICurrentTime>();

    }

    private readonly ICurrentTime _currentTimeService;

    private (ClaimService claimService, ClaimRequestDbContext context) InitializeClaimService()
    {
        SQLitePCL.Batteries.Init();

        var options = new DbContextOptionsBuilder<ClaimRequestDbContext>()
            .UseSqlite("DataSource=:memory:")
            .Options;

        var context = new ClaimRequestDbContext(options);
        context.Database.OpenConnection();
        context.Database.EnsureCreated();

        var unitOfWork = new UnitOfWork(context, _userRepository, _claimRepository, _claimDetailRepository,
            _auditTrailRepository, _projectEnrollmentRepository, _projectRepository);

        var mockEmailService = Substitute.For<IEmailService>();
        var claimService = new ClaimService(unitOfWork, _mapper, mockEmailService, _currentTimeService);

        return (claimService, context); // Return both the service and context
    }


    [Fact]
    public async Task CreateNewClaim_ShouldCreateClaimSuccessfully()
    {
        // Arrange
        var (claimService, context) = InitializeClaimService();

        // Prepare data for ClaimCreateDTO
        var claimCreateDto = new ClaimCreateDTO
        {
            CreatorId = Guid.NewGuid(),
            ProjectId = Guid.NewGuid(),
            Status = "Draft",
            Remark = "Fack yu",
            //TotalWorkingHours = 0,
            //TotalClaimAmount = 0,
            ClaimDetails = new List<ClaimDetailDTO>
        {
            new ClaimDetailDTO {ClaimId=Guid.NewGuid(), FromDate = DateTime.Now, ToDate = DateTime.Now.AddHours(4) ,  Remark="Cmm"},
         }
        };


        var claimRequest = new ClaimRequest
        {
            Id = Guid.NewGuid(),
            Status = ClaimStatus.PendingApproval,
            CreatedAt = _currentTime,
            Project = new Project { ProjectName = "Empty Remark Test Project" },
            Creator = new User { FullName = "HiHi HaHa" },
            CreatorId = claimCreateDto.CreatorId,
        };

        A.CallTo(() => _mapper.Map<BusinessObjects.ClaimRequest>(claimCreateDto)).Returns(claimRequest);






        // Act
        var result = await claimService.CreateNewClaim(claimCreateDto);

        // Assert: Validate the result and database state
        result.Should().NotBeNull();

        result.IsSuccess.Should().BeTrue(); // Check if the operation was successful
        result.Data.Should().NotBeNull();


    }


    


    [Fact]
    public async Task CreateNewClaim_ShouldCreateClaimFail_WhenUserNull()
    {


        // Arrange
        var (claimService, context) = InitializeClaimService();


        // Prepare data for ClaimCreateDTO
        var claimCreateDto = new ClaimCreateDTO
        {
            CreatorId = Guid.NewGuid(),
            ProjectId = Guid.NewGuid(),
            Status = "Draft",
            Remark = "Fack yu",
            //TotalWorkingHours = 0,
            //TotalClaimAmount = 0,
            ClaimDetails = new List<ClaimDetailDTO>
        {
            new ClaimDetailDTO {ClaimId=Guid.NewGuid(), FromDate = DateTime.Now, ToDate = DateTime.Now.AddHours(4), Remark="Cmm"},
         }
        };



        // Mock current user retrieval to return null
        A.CallTo(() => _userRepository.GetCurrentUserAsync()).Returns(Task.FromResult((User)null));

        // Act
        var result = await claimService.CreateNewClaim(claimCreateDto);

        // Assert: Validate the result and database state
        result.IsSuccess.Should().BeFalse(); // Check if the operation was successful


    }


    [Fact]
    public async Task CreateNewClaim_ShouldCreateClaimFail__WhenTotalWorkingHoursIsNegative()
    {
        // Arrange
        var (claimService, context) = InitializeClaimService();


        // Prepare data for ClaimCreateDTO
        var claimCreateDto = new ClaimCreateDTO
        {
            CreatorId = Guid.NewGuid(),
            ProjectId = Guid.NewGuid(),
            Status = "Draft",
            Remark = "Fack yu",
            //TotalWorkingHours = 0,
            //TotalClaimAmount = 0,
            ClaimDetails = new List<ClaimDetailDTO>
        {
            new ClaimDetailDTO {ClaimId=Guid.NewGuid(), FromDate = DateTime.Now.AddHours(4), ToDate = DateTime.Now, Remark="Cmm"},
         }
        };

        // Act
        var result = await claimService.CreateNewClaim(claimCreateDto);

        // Assert: Validate the result and database state
        result.IsSuccess.Should().BeFalse(); // Check if the operation was successful
        result.Message.Should().Be("Total working hours cannot be negative");

    }

    [Fact]
    public async Task CreateClaim_ShouldReturnFailse_WhenProjectIsNull()
    {
        // Arrange
        var (claimService, context) = InitializeClaimService();

        // Prepare data for ClaimCreateDTO
        var claimCreateDto = new ClaimCreateDTO
        {
            CreatorId = Guid.NewGuid(),
            ProjectId = Guid.NewGuid(),
            Status = "Draft",
            Remark = "Fack yu",
            //TotalWorkingHours = 0,
            //TotalClaimAmount = 0,
            ClaimDetails = new List<ClaimDetailDTO>
        {
            new ClaimDetailDTO {ClaimId=Guid.NewGuid(), FromDate = DateTime.Now, ToDate = DateTime.Now.AddHours(4), Remark="Cmm"},
         }
        };


        A.CallTo(() => _projectRepository.GetByIdAsync(claimCreateDto.ProjectId)).Returns(Task.FromResult((Project)null));



        // Act
        var result = await claimService.CreateNewClaim(claimCreateDto);

        // Assert: Validate the result and database state
        result.IsSuccess.Should().BeFalse(); // Check if the operation was successful
        result.Message.Should().Be("Project does not exist");

    }

}
