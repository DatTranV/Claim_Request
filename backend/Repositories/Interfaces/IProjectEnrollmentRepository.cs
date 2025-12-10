using BusinessObjects;

namespace Repositories.Interfaces
{
    public interface IProjectEnrollmentRepository : IGenericRepository<ProjectEnrollment>
    {
        Task<ProjectEnrollment> GetProjectEnrolmentByProjectAndProjectRoleAsync(Guid projectId, ProjectRole propjectRole);
        Task<bool> AnyAsync(Guid projectId, Guid userId);
        Task<List<User>> GetUsersNotInProjectAsync(Guid projectId);

    }
}
