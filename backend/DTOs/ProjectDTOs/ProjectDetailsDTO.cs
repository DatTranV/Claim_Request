using BusinessObjects;

namespace DTOs.ProjectDTOs
{
    public class ProjectDetailsDTO
    {
        public Guid Id { get; set; }
        public string? ProjectCode { get; set; }
        public string? ProjectName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int Budget { get; set; }
        public ProjectStatus Status { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
    }
}