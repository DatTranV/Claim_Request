using BusinessObjects;

namespace DTOs.ClaimDTOs
{
    public class ProjectDropdownDTO
    {
        public Guid ProjectId { get; set; }
        public string? ProjectName { get; set; }
        public string? ProjectRole { get; set; } 
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string ProjectDuration => $"{StartDate:yyyy-MM-dd} - {EndDate:yyyy-MM-dd}";
    }
}
