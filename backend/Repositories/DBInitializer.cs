using BusinessObjects;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Repositories
{
    public static class DBInitializer
    {
        public static async Task Initialize(
            ClaimRequestDbContext context,
            UserManager<User> userManager)
        {

            #region Seed Roles

            if (!context.Roles.Any())
            {
                var roles = new List<Role>
                {
                    new Role { Name = "ADMIN", NormalizedName = "ADMIN" },
                    new Role { Name = "STAFF", NormalizedName = "STAFF" },
                    new Role { Name = "APPROVER", NormalizedName = "APPROVER" },
                    new Role { Name = "FINANCE", NormalizedName = "FINANCE" },
                };

                await context.AddRangeAsync(roles);
                await context.SaveChangesAsync();
            }

            #endregion Seed System Roles
            
            #region Seed Projects
            if (!context.Projects.Any())
            {
                var currentDate = DateTime.UtcNow.AddHours(7);
                var projects = new List<Project>
                {
                    new Project
                    {
                        ProjectName = "IT System Upgrade",
                        ProjectCode = "ISU",
                        Budget = 500000,
                        CreatedAt = currentDate,
                        StartDate = currentDate.AddDays(-30), // Bắt đầu 30 ngày trước
                        EndDate = currentDate.AddDays(60)     // Kết thúc sau 60 ngày
                    },
                    new Project
                    {
                        ProjectName = "HR Payroll System",
                        ProjectCode = "HPS",
                        Budget = 1500000,
                        CreatedAt = currentDate,
                        StartDate = currentDate.AddDays(-15), // Bắt đầu 15 ngày trước
                        EndDate = currentDate.AddDays(90)     // Kết thúc sau 90 ngày
                    },
                    new Project
                    {
                        ProjectName = "Finance Audit",
                        ProjectCode = "FA",
                        Budget = 6000000,
                        CreatedAt = currentDate,
                        StartDate = currentDate,              // Bắt đầu hôm nay
                        EndDate = currentDate.AddDays(120)    // Kết thúc sau 120 ngày
                    }
                };
                await context.Projects.AddRangeAsync(projects);
                await context.SaveChangesAsync();
            }
            #endregion

            #region Seed Users
            if (!context.Users.Any())
            {
                var admin = new User
                {
                    UserName = "admin",
                    Email = "admin@gmail.com",
                    FullName = "Admin",
                    PhoneNumber = "0123456789",
                    IsActive = true,
                    RoleName = "ADMIN",
                    CreatedAt = DateTime.UtcNow.AddHours(7)
                };
                await CreateUserAsync(userManager, admin, "123456", "ADMIN");

                var staff = new User
                {
                    UserName = "staff",
                    Email = "staff@staff.com",
                    FullName = "Staff User",
                    PhoneNumber = "0123456789",
                    RoleName = "STAFF",
                    Rank = Rank.Senior,
                    Department = Department.SoftwareDevelopment,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddHours(7)
                };
                await CreateUserAsync(userManager, staff, "123456", "STAFF");
               
                var finance = new User
                {
                    UserName = "finance",
                    Email = "finance@claimreq.com",
                    FullName = "Finance",
                    PhoneNumber = "0123456789",
                    Department = Department.Finance,
                    Rank = Rank.Junior,
                    RoleName = "FINANCE",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddHours(7)
                };
                await CreateUserAsync(userManager, finance, "123456", "FINANCE");

                var approver = new User
                {
                    UserName = "approver",
                    Email = "approver@claimreq.com",
                    FullName = "Approver",
                    PhoneNumber = "0123456789",
                    RoleName = "APPROVER",
                    Rank = Rank.Senior,
                    Department = Department.ProjectManagement,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow.AddHours(7)
                };
                await CreateUserAsync(userManager, approver, "123456", "APPROVER");

                var customers = new List<User>
                {
                    new User
                    {
                        UserName = "staf",
                        Email = "stafMaster@gmail.com",
                        FullName = "Staff Master",
                        PhoneNumber = "0123456789",
                        Rank = Rank.Fresher,
                        Title = "IT Lead",
                        Salary = 100000,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow.AddHours(7)
                    },
                    new User
                    {
                        UserName = "peter",
                        Email = "peter@gmail.com",
                        FullName = "Peter Hiller",
                        PhoneNumber = "0123456789",
                        Rank = Rank.Fresher,
                        Title = "IT Lead",
                        Salary = 100000,
                        RoleName = "STAFF",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow.AddHours(7)
                    },
                    new User
                    {
                        UserName = "kaka",
                        Email = "kaka@gmail.com",
                        FullName = "Kaka",
                        PhoneNumber = "0123456789",
                        RoleName = "STAFF",
                        Rank = Rank.Fresher,
                        Title = "Finance Manager",
                        Salary = 80000,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow.AddHours(7)
                    },
                    new User
                    {
                        UserName = "musk",
                        Email = "musk@gmail.com",
                        FullName = "Elusk Mon",
                        PhoneNumber = "0123456789",
                        Rank = Rank.Senior,
                        Title = "HR Assistant",
                        Salary = 50000,
                        RoleName = "STAFF",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow.AddHours(7)
                    },
                    new User
                    {
                        UserName = "gate",
                        Email = "gate@gmail.com",
                        FullName = "Bate Gill",
                        PhoneNumber = "0123456789",
                        Rank = Rank.Senior,
                        Title = "IT Lead",
                        Salary = 100000,
                        RoleName = "STAFF",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow.AddHours(7)
                    },
                    new User
                    {
                        UserName = "chung",
                        Email = "trunghc@gmail.com",
                        FullName = "chunghc",
                        PhoneNumber = "0123456789",
                        Rank = Rank.Intern,
                        Title = "IT Lead",
                        Salary = 100000,
                        RoleName = "STAFF",
                        Department = Department.SoftwareDevelopment,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow.AddHours(7)
                    }
                };
                foreach (var customerr in customers)
                {
                    await context.Users.AddAsync(customerr);
                }
                await context.SaveChangesAsync();
            }
            var allUsers = await context.Users.ToListAsync();
            foreach (var user in allUsers)
            {
                if (string.IsNullOrEmpty(user.SecurityStamp))
                {
                    await userManager.UpdateSecurityStampAsync(user);
                    Console.WriteLine($"Security stamp updated for user {user.UserName}");
                }
            }
            #endregion Seed Users


            #region Seed ProjectEnrollments
            if (!context.ProjectEnrollments.Any())
            {
                var itProject = await context.Projects.FirstOrDefaultAsync(p => p.ProjectName == "IT System Upgrade");
                var hrProject = await context.Projects.FirstOrDefaultAsync(p => p.ProjectName == "HR Payroll System");
                var financeProject = await context.Projects.FirstOrDefaultAsync(p => p.ProjectName == "Finance Audit");

                var admin = await context.Users.FirstOrDefaultAsync(u => u.UserName == "admin");
                var staff = await context.Users.FirstOrDefaultAsync(u => u.UserName == "staff");
                var finance = await context.Users.FirstOrDefaultAsync(u => u.UserName == "finance");
                var approver = await context.Users.FirstOrDefaultAsync(u => u.UserName == "approver");
                var peter = await context.Users.FirstOrDefaultAsync(u => u.UserName == "peter");
                var kaka = await context.Users.FirstOrDefaultAsync(u => u.UserName == "kaka");
                var musk = await context.Users.FirstOrDefaultAsync(u => u.UserName == "musk");
                var gate = await context.Users.FirstOrDefaultAsync(u => u.UserName == "gate");
                var chung = await context.Users.FirstOrDefaultAsync(u => u.UserName == "chung");
                if (itProject != null && hrProject != null && financeProject != null && admin != null && staff != null && finance != null && approver != null && peter != null && kaka != null && musk != null && gate != null && chung != null)
                {
                    var enrollments = new List<ProjectEnrollment>
                {
                new ProjectEnrollment { UserId = admin.Id, ProjectId = itProject.Id, ProjectRole = ProjectRole.ProjectManager, EnrolledDate = DateTime.UtcNow.AddHours(7), EnrollStatus = EnrollStatus.Active },
                new ProjectEnrollment { UserId = staff.Id, ProjectId = itProject.Id, ProjectRole = ProjectRole.QualityAssurance, EnrolledDate = DateTime.UtcNow.AddHours(7), EnrollStatus = EnrollStatus.Active },
                new ProjectEnrollment { UserId = peter.Id, ProjectId = itProject.Id, ProjectRole = ProjectRole.TechnicalLead, EnrolledDate = DateTime.UtcNow.AddHours(7), EnrollStatus = EnrollStatus.Active },
                new ProjectEnrollment { UserId = gate.Id, ProjectId = itProject.Id, ProjectRole = ProjectRole.TechnicalLead, EnrolledDate = DateTime.UtcNow.AddHours(7), EnrollStatus = EnrollStatus.Active },
                new ProjectEnrollment { UserId = chung.Id, ProjectId = itProject.Id, ProjectRole = ProjectRole.Developer, EnrolledDate = DateTime.UtcNow.AddHours(7), EnrollStatus = EnrollStatus.Active },
                new ProjectEnrollment { UserId = kaka.Id, ProjectId = itProject.Id, ProjectRole = ProjectRole.Tester, EnrolledDate = DateTime.UtcNow.AddHours(7), EnrollStatus = EnrollStatus.Active },

                new ProjectEnrollment { UserId = approver.Id, ProjectId = hrProject.Id, ProjectRole = ProjectRole.ProjectManager, EnrolledDate = DateTime.UtcNow.AddHours(7), EnrollStatus = EnrollStatus.Active },
                new ProjectEnrollment { UserId = musk.Id, ProjectId = hrProject.Id, ProjectRole = ProjectRole.QualityAssurance, EnrolledDate = DateTime.UtcNow.AddHours(7), EnrollStatus = EnrollStatus.Active },
                new ProjectEnrollment { UserId = gate.Id, ProjectId = hrProject.Id, ProjectRole = ProjectRole.BusinessAnalyst, EnrolledDate = DateTime.UtcNow.AddHours(7), EnrollStatus = EnrollStatus.Active },
                new ProjectEnrollment { UserId = peter.Id, ProjectId = hrProject.Id, ProjectRole = ProjectRole.Developer, EnrolledDate = DateTime.UtcNow.AddHours(7), EnrollStatus = EnrollStatus.Active },

                new ProjectEnrollment { UserId = finance.Id, ProjectId = financeProject.Id, ProjectRole = ProjectRole.ProjectManager, EnrolledDate = DateTime.UtcNow.AddHours(7), EnrollStatus = EnrollStatus.Active },
                new ProjectEnrollment { UserId = kaka.Id, ProjectId = financeProject.Id, ProjectRole = ProjectRole.QualityAssurance, EnrolledDate = DateTime.UtcNow.AddHours(7), EnrollStatus = EnrollStatus.Active },
                new ProjectEnrollment { UserId = chung.Id, ProjectId = financeProject.Id, ProjectRole = ProjectRole.TechnicalConsultancy, EnrolledDate = DateTime.UtcNow.AddHours(7), EnrollStatus = EnrollStatus.Active },
                new ProjectEnrollment { UserId = staff.Id, ProjectId = financeProject.Id, ProjectRole = ProjectRole.Tester, EnrolledDate = DateTime.UtcNow.AddHours(7), EnrollStatus = EnrollStatus.Active }
                };
                
                await context.ProjectEnrollments.AddRangeAsync(enrollments);
                await context.SaveChangesAsync();
                }
            }
            #endregion Seed ProjectEnrollments

            #region Seed ClaimRequests
            if (!context.ClaimRequests.Any())
            {
                var claimRequests = new List<ClaimRequest>
            {
new ClaimRequest
{
    CreatorId = (await context.Users.FirstOrDefaultAsync(u => u.UserName == "admin"))?.Id ?? Guid.Empty,
    ProjectId = (await context.Projects.FirstOrDefaultAsync(p => p.ProjectName == "IT System Upgrade"))?.Id ?? Guid.Empty,
    Status = ClaimStatus.PendingApproval,
    TotalWorkingHours = 40,
    TotalClaimAmount = 1000,
    Remark = "Initial claim for IT System Upgrade",
    CreatedAt = DateTime.UtcNow.AddHours(7)
},
new ClaimRequest
{
    CreatorId = (await context.Users.FirstOrDefaultAsync(u => u.UserName == "staf"))?.Id ?? Guid.Empty,
    ProjectId = (await context.Projects.FirstOrDefaultAsync(p => p.ProjectName == "HR Payroll System"))?.Id ?? Guid.Empty,
    Status = ClaimStatus.PendingApproval,
    TotalWorkingHours = 80,
    TotalClaimAmount = 2000,
    Remark = "Initial claim for HR Payroll System",
    CreatedAt = DateTime.UtcNow.AddHours(7)
},
new ClaimRequest
{
    CreatorId = (await context.Users.FirstOrDefaultAsync(u => u.UserName == "finance"))?.Id ?? Guid.Empty,
    ProjectId = (await context.Projects.FirstOrDefaultAsync(p => p.ProjectName == "Finance Audit"))?.Id ?? Guid.Empty,
    Status = ClaimStatus.PendingApproval,
    TotalWorkingHours = 60,
    TotalClaimAmount = 1500,
    Remark = "Initial claim for Finance Audit",
    CreatedAt = DateTime.UtcNow.AddHours(7)
}
            };
                await context.ClaimRequests.AddRangeAsync(claimRequests);
                await context.SaveChangesAsync();
            }
            #endregion

        }
        private static async Task CreateUserAsync(UserManager<User> userManager, User user, string password, string role)
        {
            var userExist = await userManager.FindByEmailAsync(user.Email!);
            if (userExist == null)
            {
                var result = await userManager.CreateAsync(user, password);
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(user, role);
                }
            }

        }
    }
}
