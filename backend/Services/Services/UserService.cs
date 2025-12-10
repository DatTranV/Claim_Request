using AutoMapper;
using DTOs.Enums;
using DTOs.UserDTOs;
using Microsoft.Extensions.Configuration;
using Repositories.Commons;
using Repositories.Interfaces;
using Services.Interfaces;
using Repositories.Helpers;
using System.Security;

namespace Services.Services
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        public UserService(IUnitOfWork unitOfWork, IMapper mapper, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _configuration = configuration;
        }
        public async Task<ApiResult<object>> LoginAsync(UserLoginDTO user)
        {
            var result = await _unitOfWork.UserRepository.LoginByEmailAndPassword(user);
            if (result == null)
            {
                return ApiResult<object>.Error(user.Email, "Your login credentials don't match an account in our system.");
            }
            return ApiResult<object>.Succeed(result, "Login successfully");
        }

        public async Task<ApiResult<UserDetailsDTO>> CreateNewUser(StaffCreateDTO userModel)
        {
            var currentUser = await _unitOfWork.UserRepository.GetCurrentUserAsync();
            if (currentUser.RoleName != RoleEnums.ADMIN.ToString())
            {
                throw new SecurityException("You do not have permission to create a new user!");
            }
            ArgumentNullException.ThrowIfNull(userModel);
            var userExisting = await _unitOfWork.UserRepository.GetUserByEmailAsync(userModel.Email!);
            if (userExisting != null)
            {
                return new ApiResult<UserDetailsDTO>
                {
                    Data = null,
                    Message = "Email already Exits!",
                    IsSuccess = false
                };
            }

            if (!Enum.IsDefined(typeof(RoleEnums), userModel.RoleName))
            {
                return new ApiResult<UserDetailsDTO>
                {
                    Data = null,
                    Message = "Invalid Role",
                    IsSuccess = false,
                };
            }

            await _unitOfWork.UserRepository.AddUser(userModel, userModel.RoleName);
            await _unitOfWork.SaveChangeAsync();
            return new ApiResult<UserDetailsDTO>
            {
                Data = _mapper.Map<UserDetailsDTO>(userModel),
                Message = "Create new user successfully!",
                IsSuccess = true,
            };
        }

        public async Task<ApiResult<List<UserDetailsDTO>>> GetStaffAsync()
        {

            var query = await _unitOfWork.UserRepository.GetUsersAsync();
            var orderByDescending = query.OrderByDescending(audit => audit.CreatedAt);
            var staffList = _mapper.Map<List<UserDetailsDTO>>(orderByDescending);
            ArgumentNullException.ThrowIfNull(orderByDescending);

            return ApiResult<List<UserDetailsDTO>>.Succeed(staffList, "Get Staff list successfully!");
        }

        public async Task<ApiResult<PagedList<UserDetailsDTO>>> GetStaffAsyncV2()
        {
            var query = await _unitOfWork.UserRepository.GetUsersAsync();
            var staffList = _mapper.Map<PagedList<UserDetailsDTO>>(query);
            ArgumentNullException.ThrowIfNull(staffList);
            //var staffList = await query.Select(u => new StaffConfigDTO
            //{
            //    StaffName = u.FullName!,
            //    Department = u.Department.ToString(),
            //    Rank = u.Rank.ToString(),
            //    Title = u.Title,
            //    Salary = u.Salary
            //}).ToListAsync();

            return ApiResult<PagedList<UserDetailsDTO>>.Succeed(staffList, "Get Staff list successfully!");
        }

        public async Task<ApiResult<StaffConfigDTO>> GetStaffByIdAsync(Guid UserId)
        {
            var existingUser = await _unitOfWork.UserRepository.GetAccountDetailsAsync(UserId);

            ArgumentNullException.ThrowIfNull(existingUser, "This Staff is not existed!");
            var result = _mapper.Map<StaffConfigDTO>(existingUser);
            return ApiResult<StaffConfigDTO>.Succeed(result, "Get Staff Successfully!");
        }

        public async Task<ApiResult<UserDetailsDTO>> UpdateStaffAsync(Guid UserId, StaffConfigDTO staffModel)
        {
            try
            { 
                var existingStaff = await _unitOfWork.UserRepository.GetAccountDetailsAsync(UserId);
                if (existingStaff != null)
                {
                    existingStaff = _mapper.Map(staffModel, existingStaff);
                    var updateStaff = await _unitOfWork.UserRepository.UpdateStaffAsync(existingStaff);

                    if (updateStaff != null)
                    {
                        return ApiResult<UserDetailsDTO>.Succeed(_mapper.Map<UserDetailsDTO>(existingStaff),
                            "Staff updated successfully!");
                    }
                }
                return new ApiResult<UserDetailsDTO>
                {
                    Data = null,
                    Message = $"UserId: {UserId} not found!"
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                throw;
            }
        }

        public async Task<ApiResult<StaffConfigDTO>> DeleteStaff(Guid UserId)
        {
            if (UserId == Guid.Empty)
            {
                return new ApiResult<StaffConfigDTO>
                {
                    Data = null,
                    Message = $"Guid is empty"
                };
            }
            var user = await _unitOfWork.UserRepository.GetAccountDetailsAsync(UserId);
            if (user != null)
            {
                user = await _unitOfWork.UserRepository.SoftRemoveUserAsync(UserId);
                var result = await _unitOfWork.SaveChangeAsync();
                if (result > 0)
                {
                    return ApiResult<StaffConfigDTO>.Succeed(_mapper.Map<StaffConfigDTO>(user),
                        "Delete " + UserId + " Removed successfully");
                }
            }
            return ApiResult<StaffConfigDTO>.Error(null, $"UserId: {UserId} not found!");
        }

        public async Task<ApiResult<UserDetailsDTO>> GetCurrentUserAsync()
        {
            var result = await _unitOfWork.UserRepository.GetCurrentUserAsync();
            if (result != null)
            {
                var data = _mapper.Map<UserDetailsDTO>(result);
                return ApiResult<UserDetailsDTO>.Succeed(data, "This is current user");
            }
            return ApiResult<UserDetailsDTO>.Error(null, "User is not found due to error or expiration token");
        }

        public async Task<ApiResult<UserChangePasswordDTO>> ChangePasswordAsync(UserChangePasswordDTO changePassword)
        {

            if (changePassword == null)
            {
                return ApiResult<UserChangePasswordDTO>.Error(changePassword, "Change password failed!");
            }
            await _unitOfWork.UserRepository.ChangePasswordAsync(changePassword);
            var result = await _unitOfWork.SaveChangeAsync();
            return ApiResult<UserChangePasswordDTO>.Succeed(_mapper.Map<UserChangePasswordDTO>(changePassword), "Change password successfully!");
        }

        public async Task<ApiResult<List<UserDetailsDTO>>> GetStaffNotInProjectAsync(Guid projectId)
        {
            if (projectId == Guid.Empty)
            {
                throw new ArgumentNullException("ProjectId is empty!");
            }
            var usersNotInProject = await _unitOfWork.ProjectEnrollmentRepository.GetUsersNotInProjectAsync(projectId);
            var allUsers = await _unitOfWork.UserRepository.GetUsersAsync();
            var usersNotInProjectDTOs = _mapper.Map<List<UserDetailsDTO>>(usersNotInProject);
            foreach (var userDTO in usersNotInProjectDTOs)
            {
                userDTO.Enrolled = false;
            }
            var usersInProject = allUsers.Where(u => !usersNotInProject.Any(notInProject => notInProject.Id == u.Id)).ToList();

            var usersInProjectDTOs = _mapper.Map<List<UserDetailsDTO>>(usersInProject);
            foreach (var userDTO in usersInProjectDTOs)
            {
                userDTO.Enrolled = true;
            }
            // Combine both lists
            var staffList = usersNotInProjectDTOs.Concat(usersInProjectDTOs).ToList();
            ArgumentNullException.ThrowIfNull(staffList);
            return ApiResult<List<UserDetailsDTO>>.Succeed(staffList, "Get Staff list successfully!");
        }
    }
}
