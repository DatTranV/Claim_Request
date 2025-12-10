using BusinessObjects;

namespace DTOs.UserDTOs
{
    public class UserDetailsDTO
    {
         public Guid Id { get; set; }
        public string Email { get; set; } = null!;
        public string? UserName { get; set; }
        public string? FullName { get; set; }
        public string? RoleName { get; set; }
        public string? PhoneNumber { get; set; }
        public Department Department { get; set; }
        public Rank Rank { get; set; }
        public string? Title { get; set; }
        public int Salary { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsDeleted { get; set; }
        public bool? Enrolled { get; set; }
    }
}
