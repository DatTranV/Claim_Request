using BusinessObjects;
using Microsoft.EntityFrameworkCore;
using Repositories.Helpers;
using Repositories.Interfaces;

namespace Repositories.Repositories
{
    public class ProjectRepository : GenericRepository<Project>, IProjectRepository
    {
        private readonly ClaimRequestDbContext _dbContext;
        private readonly ICurrentTime _timeService;

        public ProjectRepository(ClaimRequestDbContext context, ICurrentTime timeService, IClaimsService claimsService)
            : base(context, timeService, claimsService)
        {
            _dbContext = context;
            _timeService = timeService;
        }

        public IQueryable<Project> FilterAllField(ProjectParams projectParams)
        {
            var query = _dbContext.Projects;

            return query;
        }

        public IQueryable<Project> FilterAllField()
        {
            var query = _dbContext.Projects;
            return query;
        }
    }
}
