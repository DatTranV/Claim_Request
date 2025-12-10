using AutoMapper;
using BusinessObjects;
using DTOs.Enums;
using DTOs.ProjectDTOs;
using MailKit;
using Repositories.Commons;
using Repositories.Helpers;
using Repositories.Interfaces;
using Services.Interfaces;
using System.Security;

namespace Services.Services;

public class ProjectService : IProjectService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentTime _currentTime;
    public ProjectService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ICurrentTime currentTime)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentTime = currentTime;
    }

    //public async Task<List<ProjectResponseDTO>> GetAllProjectsAsync()
    //{
    //    var projects = await _unitOfWork.ProjectRepository.GetAllAsync();
    //    if (projects == null) throw new KeyNotFoundException("Projects not found.");
    //    return _mapper.Map<List<ProjectResponseDTO>>(projects);
    //}

    public async Task<ApiResult<List<ProjectDetailsDTO>>> GetProjectsAsync()
    {
        var result = await _unitOfWork.ProjectRepository.GetAllAsync();
        return ApiResult<List<ProjectDetailsDTO>>.Succeed(
            _mapper.Map<List<ProjectDetailsDTO>>(result.OrderByDescending(audit => audit.CreatedAt)),
            "Get Project successfully!");
    }

    public async Task<ApiResult<PagedList<Project>>> GetProjectsAsync(ProjectParams projectParam)
    {
        var query = _unitOfWork.ProjectRepository.FilterAllField(projectParam).AsQueryable();
        var projects = await PagedList<Project>.ToPagedList(query, projectParam.PageNumber, projectParam.PageSize);
        return ApiResult<PagedList<Project>>.Succeed(projects, "Projects retrieved successfully.");
    }

    public async Task<ApiResult<ProjectDetailsDTO?>> GetProjectByIdAsync(Guid id)
    {
        try
        {
            ArgumentNullException.ThrowIfNull(id);
            var project = await _unitOfWork.ProjectRepository.GetByIdAsync(id);
            return ApiResult<ProjectDetailsDTO?>.Succeed(_mapper.Map<ProjectDetailsDTO>(project), "Project retrieved successfully.");
        }
        catch (Exception ex)
        {
            return ApiResult<ProjectDetailsDTO?>.Fail(ex);
        }
    }

    public async Task<ApiResult<ProjectDetailsDTO>> CreateProjectAsync(ProjectCreateDTO projectModel)
    {
        try
        {
            var user = await _unitOfWork.UserRepository.GetCurrentUserAsync();
            if (user is null) throw new UnauthorizedAccessException("401 - User is not signed in ");

            var project = _mapper.Map<Project>(projectModel);
            await _unitOfWork.ProjectRepository.AddAsync(project);
            await _unitOfWork.SaveChangeAsync();
            
            return ApiResult<ProjectDetailsDTO>.Succeed(_mapper.Map<ProjectDetailsDTO>(project), "Create project Successfully!");
        }
        catch (Exception ex)
        {
            return ApiResult<ProjectDetailsDTO>.Fail(ex);
        }
    }

    public async Task<ApiResult<ProjectDetailsDTO>> UpdateProjectAsync(Guid id, ProjectUpdateDTO projectModel)
    {
        try
        {
            if (id == Guid.Empty)
            {
                return ApiResult<ProjectDetailsDTO>.Error(null, $"Project Not Found with Id {id}");
            }

            var project = await _unitOfWork.ProjectRepository.GetByIdAsync(id);
            if (project == null) throw new KeyNotFoundException("Project not found.");

            _mapper.Map(projectModel, project);
            await _unitOfWork.ProjectRepository.Update(project);
            await _unitOfWork.SaveChangeAsync();

            return ApiResult<ProjectDetailsDTO>.Succeed(_mapper.Map<ProjectDetailsDTO>(project), "Update project Successfully!");
        }
        catch (Exception ex)
        {
            return ApiResult<ProjectDetailsDTO>.Fail(ex);
        }
    }

    public async Task<ApiResult<ProjectDetailsDTO>> DeleteProjectAsync(Guid id)
    {
        var currentUser = await _unitOfWork.UserRepository.GetCurrentUserAsync();
        if (currentUser.RoleName != RoleEnums.ADMIN.ToString())
        {
            throw new SecurityException();
        }
        var projectExits = await _unitOfWork.ProjectRepository.GetByIdAsync(id);
        ArgumentNullException.ThrowIfNull(projectExits);
        var isDeleted = await _unitOfWork.ProjectRepository.SoftRemove(projectExits);
        if (isDeleted)
        {
            await _unitOfWork.SaveChangeAsync();
            return ApiResult<ProjectDetailsDTO>.Succeed(_mapper.Map<ProjectDetailsDTO>(projectExits), "Delete project Successfully!");
            
        }
        return ApiResult<ProjectDetailsDTO>.Error(null, "Delete project failed!");
    }
}