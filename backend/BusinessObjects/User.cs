using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace BusinessObjects
{
    public enum Department
    {
        SoftwareDevelopment, 
        QualityAssurance, 
        DevOps,
        ProjectManagement,
        ScrumMaster,
        BusinessAnalysis,
        UIUXDesign,
        HumanResources,
        Finance, 
        TechLead,
        SoftwareArchitect,
        CustomerSupport,
        DataScience,
        Sales,
        Marketing,
        ITSupport,
    }

    public enum Rank
    {
        Intern,
        Fresher,
        Junior,
        Senior
    }
    
    public class User : IdentityUser<Guid>
    {
        public string? FullName { get; set; }
        public string? RoleName { get; set; }
        // --- staff
        public Department Department { get; set; }
        public Rank Rank { get; set; }
        public string? Title { get; set; }
        public int Salary { get; set; }
        //--- staff
        public DateTime CreatedAt { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public Guid? ModifiedBy { get; set; }
        public DateTime? DeletedAt { get; set; }
        public Guid? DeletedBy { get; set; }
        public bool? IsDeleted { get; set; } = false;
        public bool? IsActive { get; set; } = true;
        public virtual ICollection<Role>? Roles { get; set; }
        public virtual ICollection<ProjectEnrollment> ProjectEnrollments { get; set; } = new List<ProjectEnrollment>();
        public virtual ICollection<AuditTrail>? AuditTrails { get; set; }
        public virtual ICollection<ClaimRequest>? ClaimRequests { get; set; }
    }
}