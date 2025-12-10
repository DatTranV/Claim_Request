namespace BusinessObjects
{
    public enum ProjectStatus
    {
        New,
        InProgress,
        Completed,
        Cancelled,
        Archived
    }
    public class Project : BaseEntity
    {
        public string? ProjectCode { get; set; }
        public string? ProjectName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int Budget { get; set; }
        public ProjectStatus Status { get; set; }
        public bool IsActive { get; set; } = true;
        public virtual ICollection<ClaimRequest> ClaimRequests { get; set; } = [];
        public virtual ICollection<ProjectEnrollment> ProjectEnrollments { get; set; } = [];
    }
}
