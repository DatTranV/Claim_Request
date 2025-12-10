using BusinessObjects;

namespace DTOs.UserDTOs
{
    public class ResponseUserDTO
    {
        public Guid Id { get; set; }
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public string? RoleName { get; set; }
        // --- staff
        public Department Department { get; set; }
        public Rank Rank { get; set; }
        public string? Title { get; set; }
        public int Salary { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public Guid? ModifiedBy { get; set; }
        public DateTime? DeletedAt { get; set; }
        public Guid? DeletedBy { get; set; }
        public bool? IsDeleted { get; set; }
        public bool? IsActive { get; set; }
    }
}
