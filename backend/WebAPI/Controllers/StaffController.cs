using DTOs.Enums;
using DTOs.UserDTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;
using WebAPI.Middlewares;

namespace WebAPI.Controllers;

[ApiController]
[Route("/api/v1/staff")]
[AuthorizationFilter(RoleEnums.ADMIN)]
public class StaffController : ControllerBase
{
    private readonly IUserService _userService;

    public StaffController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var result = await _userService.GetStaffAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id)
    {
        var result = await _userService.GetStaffByIdAsync(id);
        return Ok(result);
    }

    [HttpGet("not-in-project")]
    public async Task<IActionResult> GetStaffNotInProjectAsync(Guid projectId)
    {
        var result = await _userService.GetStaffNotInProjectAsync(projectId);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Post(StaffCreateDTO staffModel)
    {
        var result = await _userService.CreateNewUser(staffModel);
        return Ok(result);
    }
    
    [HttpPut("{id}")]
    public async Task<IActionResult> Put([FromRoute] Guid id, [FromBody] StaffConfigDTO staffModel)
    {
        var result = await _userService.UpdateStaffAsync(id, staffModel);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete([FromRoute] Guid id)
    {
        var result = await _userService.DeleteStaff(id);
        return Ok(result);
    }
}