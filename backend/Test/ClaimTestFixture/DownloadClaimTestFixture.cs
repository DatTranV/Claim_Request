using AutoMapper;
using BusinessObjects;
using Microsoft.EntityFrameworkCore;
using Moq;
using Repositories;
using Repositories.Interfaces;
using Services.Gmail;
using Services.Services;
using System.Linq.Expressions;

namespace Test.ClaimTestFixture
{
    public class DownloadClaimTestFixture : IDisposable
    {
        public ClaimRequestDbContext Context { get; }
        public IUnitOfWork UnitOfWork { get; }
        public IMapper Mapper { get; }
        public ClaimService ClaimService { get; }

        private List<ClaimRequest> claimData;

        public DownloadClaimTestFixture()
        {
            var options = new DbContextOptionsBuilder<ClaimRequestDbContext>()
                .UseInMemoryDatabase(databaseName: "DownloadClaimTestDb")
                .Options;
            Context = new ClaimRequestDbContext(options);

            claimData = new List<ClaimRequest>();
            SeedDatabase();

            var claimRepoMock = new Mock<IClaimRepository>();
            claimRepoMock.Setup(repo => repo.GetAllAsync(
                It.IsAny<Expression<Func<ClaimRequest, bool>>>(),
                It.IsAny<Expression<Func<ClaimRequest, object>>[]>()
            )).ReturnsAsync(
                (Expression<Func<ClaimRequest, bool>> filter, Expression<Func<ClaimRequest, object>>[] includes) =>
                {
                    return claimData.Where(filter.Compile()).ToList();
                });

            var unitOfWorkMock = new Mock<IUnitOfWork>();
            unitOfWorkMock.Setup(u => u.ClaimRepository).Returns(claimRepoMock.Object);
            UnitOfWork = unitOfWorkMock.Object;

            var mapperMock = new Mock<IMapper>();
            var emailServiceMock = new Mock<IEmailService>();
            var currentTimeMock = new Mock<ICurrentTime>();
            ClaimService = new ClaimService(UnitOfWork, mapperMock.Object, emailServiceMock.Object, currentTimeMock.Object);
        }

        private void SeedDatabase()
        {
            claimData.AddRange(new List<ClaimRequest>
                {
                    new ClaimRequest()
                    {
                        Id = Guid.NewGuid(),
                        Status = ClaimStatus.Paid,
                        CreatedAt = DateTime.UtcNow,
                        Project = new Project { ProjectName = "Paid Project" },
                        Creator = new User { Email = "paid@example.com", FullName = "Paid User" }
                    },
                    new ClaimRequest()
                    {
                        Id = Guid.NewGuid(),
                        Status = ClaimStatus.PendingApproval,
                        CreatedAt = DateTime.UtcNow,
                        Project = new Project { ProjectName = "Approval Project" },
                        Creator = new User { Email = "approval@example.com", FullName = "Approval User" }
                    },
                    new ClaimRequest()
                    {
                        Id = Guid.NewGuid(),
                        Status = ClaimStatus.Paid,
                        CreatedAt = DateTime.UtcNow.AddMonths(-2),
                        Project = new Project { ProjectName = "Old Paid Project" },
                        Creator = new User { Email = "oldpaid@example.com", FullName = "Old Paid User" }
                    },
                    new ClaimRequest()
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