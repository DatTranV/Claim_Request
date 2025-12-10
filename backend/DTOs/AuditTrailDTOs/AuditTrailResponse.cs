using BusinessObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs.AuditTrailDTOs
{
    public class AuditTrailResponse
    {
        public Guid ClaimId { get; set; }
        public string ActionName { get; set; }
        public string ActionBy { get; set; }
        public DateTime ActionDate { get; set; }
        public UserAction UserAction { get; set; }
        public string? FullName { get; set; }
        public string? LoggedNote { get; set; }

    }
}
