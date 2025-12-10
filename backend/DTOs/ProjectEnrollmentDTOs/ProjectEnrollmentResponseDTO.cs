using BusinessObjects;

namespace DTOs.ProjectEnrollmentDTOs
{
    public class ProjectEnrollmentResponseDTO
    {
        public Guid Id { get; set; }
        public List<Guid> UserId { get; set; } 
        public string FullName { get; set; }
        public string Email { get; set; }
        public string? DisplayName { get; set; }
        public Guid ProjectId { get; set; }
        public ProjectRole ProjectRole { get; set; }
        public EnrollStatus EnrolledStatus { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid CreatedBy { get; set; }
        public bool? IsDeleted { get; set; }
    }
}
