
using BusinessObjects;

namespace DTOs.AuditTrailDTOs
{
    public class AuditTrailResponseV2
    {
        public Guid ClaimId { get; set; }
        public Guid? ActionBy { get; set; }
        public DateTime ActionDate { get; set; }
        public UserAction UserAction { get; set; }
        public string? FullName { get; set; }
        public string? LoggedNote { get; set; }
    }
}
