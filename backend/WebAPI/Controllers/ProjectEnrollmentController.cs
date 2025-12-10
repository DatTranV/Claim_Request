using BusinessObjects;
using DTOs.Enums;
using DTOs.ProjectEnrollmentDTO;
using DTOs.ProjectEnrollmentDTOs;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using WebAPI.Middlewares;

namespace WebAPI.Controllers;

[ApiController]
[Route("/api/v1/project-enrollments")]
[AuthorizationFilter(RoleEnums.ADMIN)]
public class ProjectEnrollmentController : ControllerBase
{
    private readonly IProjectEnrollmentService _service;

    public ProjectEnrollmentController(IProjectEnrollmentService service)
    {
        _service = service;
    }

    [HttpGet("get-by-project")]
    public async Task<IActionResult> GetEnrollmentByProjectId(Guid projectId)
    {
        var result = await _service.GetEnrollmentsByProjectIdAsync(projectId);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] ProjectEnrollmentCreateDTO enrollment)
    {
        var result = await _service.AddEnrollmentAsync(enrollment);
        return Ok(result);
    }
    [HttpPut("{id}")]
    public async Task<IActionResult> Put(Guid id, ProjectEnrollmentUpdateDTO enrollment)
    {
        var result = await _service.UpdateEnrollmentAsync(id, enrollment);
        return Ok(result);
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _service.DeleteEnrollmentAsync(id);
        return Ok(result);
    }
}