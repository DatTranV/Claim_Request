using BusinessObjects;

namespace DTOs.ProjectDTOs
{
    public class ProjectUpdateDTO
    {
        public string ProjectName { get; set; } = null!;
        public string? ProjectCode { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public ProjectStatus Status { get; set; }
        public int Budget { get; set; } 
    }
}
