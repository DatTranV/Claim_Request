using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObjects
{
    public enum ProjectRole
    {
        ProjectManager,
        Developer,
        Tester,
        BusinessAnalyst,
        QualityAssurance,
        TechnicalLead,
        TechnicalConsultancy
    }
    public enum EnrollStatus
    {
        Active,
        Inactive,
    }
    public class ProjectEnrollment : BaseEntity
    {
        public Guid UserId { get; set; }
        public virtual User? User { get; set; }
        public string? DisplayName { get; set; }
        public Guid ProjectId { get; set; }
        public virtual Project? Project { get; set; }
        public ProjectRole ProjectRole { get; set; }
        public DateTime EnrolledDate { get; set; }
        public EnrollStatus EnrollStatus { get; set; }
    }
}
