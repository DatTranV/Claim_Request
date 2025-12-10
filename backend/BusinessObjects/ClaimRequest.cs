namespace BusinessObjects
{
    public enum ClaimStatus
    {
        Draft,
        PendingApproval,
        Approved,
        Paid,
        Rejected,
        Cancelled
    }
    public class ClaimRequest : BaseEntity
    {
        public Guid CreatorId { get; set; }
        public virtual User? Creator { get; set; }
        public Guid ProjectId { get; set; }
        public virtual Project? Project { get; set; }
        public ClaimStatus Status { get; set; }
        public long TotalWorkingHours { get; set; }
        public int TotalClaimAmount { get; set; }
        public string? Remark { get; set; }
        public virtual ICollection<AuditTrail> AuditTrails { get; set; } = new List<AuditTrail>();
        public virtual ICollection<ClaimDetail> ClaimDetails { get; set; } = new List<ClaimDetail>();
    }
}
