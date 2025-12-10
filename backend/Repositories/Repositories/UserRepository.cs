using System.IdentityModel.Tokens.Jwt;
using System.Linq.Expressions;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using BusinessObjects;
using DTOs.UserDTOs;
using Repositories.Interfaces;
using Microsoft.IdentityModel.Tokens;

namespace Repositories.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ClaimRequestDbContext _context;
        private readonly ICurrentTime _timeService;
        private readonly IConfiguration _configuration;
        private readonly IClaimsService _claimsService;
        private readonly DbSet<User> _dbSet;

        // identity collection
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<Role> _roleManager;
        private readonly SignInManager<User> _signInManager;

        public UserRepository(ClaimRequestDbContext context,
            ICurrentTime timeService,
            IConfiguration configuration,
            IClaimsService claimsService,
            UserManager<User> userManager,
            RoleManager<Role> roleManager,
            SignInManager<User> signInManager)
        {
            _context = context;
            _timeService = timeService;
            _configuration = configuration;
            _claimsService = claimsService;
            _userManager = userManager;
            _roleManager = roleManager;
            _signInManager = signInManager;
            _dbSet = _context.Set<User>();
        }

        public async Task<User> AddUser(StaffCreateDTO newUser, string role)
        {
            try
            {
                var userExist = await _userManager.FindByEmailAsync(newUser.Email);
                if (userExist != null)
                {
                    return null!;
                }
                var user = new User
                {
                    Email = newUser.Email,
                    UserName = newUser.Email,
                    FullName = newUser.FullName,
                    Department = newUser.Department, 
                    Salary = newUser.Salary,
                    Rank = newUser.Rank,
                    RoleName = role,
                    IsDeleted = false,
                    IsActive = true,
                    CreatedBy = _claimsService.GetCurrentUserId,
                    CreatedAt = _timeService.GetCurrentTime()
                };

                var result = await _userManager.CreateAsync(user, "123456@@");
                if (result.Succeeded)
                {
                    Console.WriteLine($"New user ID: {user.Id}");

                    var roleExists = await _roleManager.RoleExistsAsync(role);
                    if (!roleExists)
                    {
                        var newRole = new Role();
                        newRole.Name = role;

                        await _roleManager.CreateAsync(newRole);
                    }

                    if (roleExists)
                    {
                        await _userManager.AddToRoleAsync(user, role);
                    }

                    return user;
                }
                else
                {
                    StringBuilder errorValue = new StringBuilder();
                    foreach (var item in result.Errors)
                    {
                        errorValue.Append($"{item.Description}");
                    }
                    throw new Exception(errorValue.ToString());
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public async Task<List<Role>> GetAllRoleAsync()
        {
            try
            {
                // get all users
                var roles = await _roleManager.Roles.ToListAsync();
                return roles;
            }
            catch (Exception)
            {
                throw new Exception();
            }
        }

        public async Task<List<string>> GetRoleName(User User)
        {
            var result = await _userManager.GetRolesAsync(User);

            return result.ToList();
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            var result = await _userManager.FindByEmailAsync(email);
            return result ?? null!;
        }

        public async Task<User> GetUserByIdAsync(Guid id)
        {
            var result = await _userManager.FindByIdAsync(id.ToString());
            return result ?? null!;
        }

        public async Task<List<User>> GetUsersAsync(Expression<Func<User, bool>>? predicate = null, params Expression<Func<User, object>>[] includes)
        {
            IQueryable<User> query = _userManager.Users;
            if (predicate != null)
            {
                query = query.Where(predicate);
            }
            foreach (var include in includes)
            {
                query = query.Include(include);
            }

            return await query.ToListAsync();
        }

        public async Task<ResponseLoginDTO> LoginByEmailAndPassword(UserLoginDTO user)
        {
            var userExist = await _userManager.FindByEmailAsync(user.Email);
            ArgumentNullException.ThrowIfNullOrEmpty(user.Email, "This email does not exist, please sign up for an account.");

            var result = await _signInManager.CheckPasswordSignInAsync(userExist, user.Password, false);

            if (result.Succeeded)
            {
                var roles = await _userManager.GetRolesAsync(userExist);

                var authClaims = new List<Claim> // add User vào claim
                {
                    new Claim("uid", userExist.Id.ToString()),
                };

                authClaims.AddRange(roles.Select(role => new Claim("role", role)));

                await _userManager.UpdateAsync(userExist); //update 2 jwt
                //generate token
                var (accessToken, expiresAt) = GenerateToken(authClaims);
                return (new ResponseLoginDTO
                {
                    Status = true,
                    Message = "Login successfully",
                    JWT = accessToken,
                    Expired = expiresAt,
                    UserId = userExist.Id,
                });
            }
            else
            {
                return (new ResponseLoginDTO
                {
                    Status = false,
                    Message = "Your login credentials don't match an account in our system."
                });
            }
        }

        private (string accessToken, DateTime expiresAt) GenerateToken(List<Claim> claims)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiresAt = DateTime.UtcNow.AddMinutes(int.Parse(_configuration["jwt:ExpirationInMinutes"]!));
            var token = new JwtSecurityToken(
                claims: claims,
                expires: expiresAt,
                audience: _configuration["Jwt:Audience"],
                issuer: _configuration["Jwt:Issuer"],
                signingCredentials: creds
            );

            var accessToken = new JwtSecurityTokenHandler().WriteToken(token);

            return (accessToken, expiresAt);
        }

        public Task<bool> UpdateUserRoleAsync(Guid userId, string newRole)
        {
            throw new NotImplementedException();
        }

        public async Task<User> GetCurrentUserAsync()
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == _claimsService.GetCurrentUserId);
            return user ?? null!;
        }

        public IQueryable<User> GetQueryable()
        {
            return _userManager.Users;
        }

        public async Task<User> GetAccountDetailsAsync(Guid userId)
        {
            var accounts = await _userManager.Users.ToListAsync();
            var account = await _context.Users.FirstOrDefaultAsync(a => a.Id == userId);
            return account ?? null!;
        }

        public async Task<User> UpdateStaffAsync(User user)
        {
            try
            {
                user.ModifiedAt = _timeService.GetCurrentTime();
                user.ModifiedBy = _claimsService.GetCurrentUserId;
                var result = await _userManager.UpdateAsync(user);
                if (result.Succeeded)
                {
                    return user;
                }
                else
                {
                    StringBuilder errorValue = new StringBuilder();
                    foreach (var item in result.Errors)
                    {
                        errorValue.Append($"{item.Description}");
                    }

                    throw new Exception(errorValue.ToString()); //  GlobalEx midw
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                throw;
            }
        }

        public async Task<User> SoftRemoveUserAsync(Guid id)
        {
            try
            {
                var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == id);
                if (user == null)
                {
                    throw new Exception("This user is not existed");
                }
                    user.IsDeleted = true;
                    user.DeletedAt = _timeService.GetCurrentTime();
                    user.DeletedBy = _claimsService.GetCurrentUserId;
                    _context.Entry(user).State = EntityState.Modified;
                    return user;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                throw;
            }
        }

        public async Task<User> ChangePasswordAsync(UserChangePasswordDTO usercredentials)
        {
            var user = await _userManager.FindByIdAsync(_claimsService.GetCurrentUserId.ToString());

            var result =  await _userManager.ChangePasswordAsync(user, usercredentials.OldPassword, usercredentials.NewPassword);
       
            return result.Succeeded ? user : null!;
        }
    }
}
