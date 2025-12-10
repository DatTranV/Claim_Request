namespace DTOs.AuditTrailDTOs
{
    public class AuditTrailDTO
    {
        public Guid ClaimId { get; set; }
        public Guid ActionId { get; set; }
        public DateTime ActionDate { get; set; }
        public Guid? ActionBy { get; set; }
        public string? FullName { get; set; }
        public string? LoggedNote { get; set; }
    }
}
