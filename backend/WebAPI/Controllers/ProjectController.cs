using AutoMapper;
using DTOs.Enums;
using DTOs.ProjectDTOs;
using Microsoft.AspNetCore.Mvc;
using Repositories.Helpers;
using Services.Interfaces;
using WebAPI.Middlewares;

namespace WebAPI.Controllers;

[ApiController]
[Route("api/v1/projects")]
[AuthorizationFilter(RoleEnums.ADMIN)]
public class ProjectController : ControllerBase
{
   private readonly IProjectService _projectService;
   private readonly IMapper _mapper;
   public ProjectController(IProjectService projectService, IMapper mapper)
   {
      _projectService = projectService;
      _mapper = mapper;
   }

   [HttpGet("paging")]
   public async Task<IActionResult> Get([FromQuery] ProjectParams projectParams)
   {
        var result = await _projectService.GetProjectsAsync(projectParams);
        return Ok(result);
   }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var result = await _projectService.GetProjectsAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
   public async Task<IActionResult> Get(Guid id)
   {
         var result = await _projectService.GetProjectByIdAsync(id);
         return Ok(result);
   }
   
   [HttpPost]
   public async Task<IActionResult> Post(ProjectCreateDTO project)
   {
        var result = await _projectService.CreateProjectAsync(project);
        return Ok(result);
   }

   [HttpPut("{id}")]
   public async Task<IActionResult> Put(Guid id, ProjectUpdateDTO project)
   {
         var result = await _projectService.UpdateProjectAsync(id, project);
         return Ok(result);
   }

   [HttpDelete("{id}")]
   public async Task<IActionResult> Delete(Guid id)
   {
      var result = await _projectService.DeleteProjectAsync(id);
      return Ok(result);
   }
}