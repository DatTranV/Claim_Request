using DTOs.UserDTOs;
using Microsoft.AspNetCore.Mvc;
using Services.Interfaces;

namespace WebAPI.Controllers
{
    [Route("api/v1/users")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }


        [HttpPost("login")]
        public async Task<IActionResult> LoginAsync(UserLoginDTO user)
        {
            var result = await _userService.LoginAsync(user);
            return Ok(result);
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUserAsync()
        {
            var result = await _userService.GetCurrentUserAsync();
            if (result.IsSuccess || result.Data != null)
            {
                return Ok(result);
            }
            return Unauthorized(result);
        }

        [HttpPut("update-profile/{id}")]
        public async Task<IActionResult> UpdateAccount([FromRoute] Guid id,[FromBody] StaffConfigDTO updateModel)
        {
            var result = await _userService.UpdateStaffAsync(id, updateModel);
            return Ok(result);
        }


        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePasswordAsync([FromBody] UserChangePasswordDTO changePassword)
        {
            var result = await _userService.ChangePasswordAsync(changePassword);
            if (result.IsSuccess)
            {
                return Ok(result);
            }
            return BadRequest(result);
        }
    }
}
