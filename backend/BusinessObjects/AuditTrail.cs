namespace BusinessObjects{

public enum UserAction
{
    Create,
    Update,
    Submit,
    Approve,
    Return,
    Reject,
    Paid,
    Cancel,
    Download
}

public class AuditTrail : BaseEntity
{
    public Guid ClaimId { get; set; }
    public UserAction UserAction { get; set; }
    public DateTime ActionDate { get; set; }
    public Guid? ActionBy { get; set; }
    public string? LoggedNote { get; set; }
    public virtual ClaimRequest? ClaimRequest { get; set; }
    public virtual User? User { get; set; }
}
}