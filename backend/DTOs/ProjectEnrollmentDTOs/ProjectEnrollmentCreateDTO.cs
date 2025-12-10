using BusinessObjects;

namespace DTOs.ProjectEnrollmentDTO
{
    public class ProjectEnrollmentCreateDTO
    {
        public Guid ProjectId { get; set; }
        public List<Guid> UserId { get; set; }
        public string? DisplayName { get; set; }
        public ProjectRole ProjectRole { get; set; }
    }
}
