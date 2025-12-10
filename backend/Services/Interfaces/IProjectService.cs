using BusinessObjects;
using DTOs.ProjectDTOs;
using Repositories.Commons;
using Repositories.Helpers;

namespace Services.Interfaces;

public interface IProjectService
{
    Task<ApiResult<ProjectDetailsDTO>> CreateProjectAsync(ProjectCreateDTO projectModel);
    Task<ApiResult<List<ProjectDetailsDTO>>> GetProjectsAsync();
    Task<ApiResult<ProjectDetailsDTO?>> GetProjectByIdAsync(Guid id);
    Task<ApiResult<PagedList<Project>>> GetProjectsAsync(ProjectParams projectParam);
    Task<ApiResult<ProjectDetailsDTO>> UpdateProjectAsync(Guid id, ProjectUpdateDTO projectModel);
    Task<ApiResult<ProjectDetailsDTO>> DeleteProjectAsync(Guid id);
}
