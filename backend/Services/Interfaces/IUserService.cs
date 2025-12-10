using DTOs.UserDTOs;
using Repositories.Commons;
using Repositories.Helpers;

namespace Services.Interfaces
{
    public interface IUserService   
    {
      Task<ApiResult<object>> LoginAsync(UserLoginDTO User);
      Task<ApiResult<UserDetailsDTO>> CreateNewUser(StaffCreateDTO User);
      Task<ApiResult<List<UserDetailsDTO>>> GetStaffAsync();
      Task<ApiResult<PagedList<UserDetailsDTO>>> GetStaffAsyncV2();
      Task<ApiResult<StaffConfigDTO>> GetStaffByIdAsync(Guid UserId);
      Task<ApiResult<UserDetailsDTO>> UpdateStaffAsync(Guid UserId, StaffConfigDTO staffModel);
      Task<ApiResult<StaffConfigDTO>> DeleteStaff(Guid UserId);
      Task<ApiResult<UserDetailsDTO>> GetCurrentUserAsync();
      Task<ApiResult<UserChangePasswordDTO>> ChangePasswordAsync(UserChangePasswordDTO changePassword);
      Task<ApiResult<List<UserDetailsDTO>>> GetStaffNotInProjectAsync(Guid projectId);
    }
}
