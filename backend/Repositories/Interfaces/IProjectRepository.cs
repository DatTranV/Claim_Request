using BusinessObjects;
using Repositories.Helpers;

namespace Repositories.Interfaces
{
    public interface IProjectRepository : IGenericRepository<Project>
    {
        public IQueryable<Project> FilterAllField(ProjectParams projectParams);
        public IQueryable<Project> FilterAllField();

    }
}
