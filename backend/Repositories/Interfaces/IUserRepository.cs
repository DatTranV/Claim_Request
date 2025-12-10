using System.Linq.Expressions;
using BusinessObjects;
using DTOs.UserDTOs;

namespace Repositories.Interfaces
{
    public interface IUserRepository
    {
        Task<User> AddUser(StaffCreateDTO newUser, string role);
        Task<List<string>> GetRoleName(User user);
        Task<List<Role>> GetAllRoleAsync();
        Task<User> GetUserByIdAsync(Guid id);
        Task<User> GetUserByEmailAsync(string email);
        Task<List<User>> GetUsersAsync(Expression<Func<User, bool>> predicate = null!, params Expression<Func<User, object>>[] includes);
        Task<ResponseLoginDTO> LoginByEmailAndPassword(UserLoginDTO user);
        Task<bool> UpdateUserRoleAsync(Guid userId, string newRole);
        IQueryable<User> GetQueryable();
        Task<User> GetCurrentUserAsync();
        Task<User> UpdateStaffAsync(User user);
        Task<User> GetAccountDetailsAsync(Guid userId);
        Task<User> SoftRemoveUserAsync(Guid userId);
        Task<User> ChangePasswordAsync(UserChangePasswordDTO usercredentials);
    }
}
