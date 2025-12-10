using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BusinessObjects;
using Microsoft.EntityFrameworkCore;
using Repositories.Interfaces;

namespace Repositories.Repositories
{
    public class ProjectEnrollmentRepository(
            ClaimRequestDbContext context,
            ICurrentTime timeService,
            IClaimsService claimsService
            ) : GenericRepository<ProjectEnrollment>(context, timeService, claimsService),
                IProjectEnrollmentRepository
    {
        private readonly ClaimRequestDbContext _context = context;

        public async Task<bool> AnyAsync(Guid projectId, Guid userId)
        {
            return await _context.ProjectEnrollments
                    .AnyAsync(pe => pe.ProjectId == projectId && pe.UserId == userId);
        }

        public async Task<ProjectEnrollment> GetProjectEnrolmentByProjectAndProjectRoleAsync(Guid projectId, ProjectRole propjectRole)
        {
            return await _context.ProjectEnrollments
                .Include(pe => pe.User)
                .FirstOrDefaultAsync(pe => pe.ProjectId == projectId && pe.ProjectRole == propjectRole);
        }

        public async Task<List<User>> GetUsersNotInProjectAsync(Guid projectId)
        {
            var usersInProject = await _context.ProjectEnrollments
             .Where(pe => pe.ProjectId == projectId)
             .Select(pe => pe.UserId)
             .ToListAsync();

            return await _context.Users
                .Where(u => !usersInProject.Contains(u.Id))
                .ToListAsync();
        }
    }
}
