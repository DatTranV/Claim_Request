using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObjects
{
    public class ClaimDetail : BaseEntity
    {
        public Guid? ClaimId { get; set; }
        public virtual ClaimRequest? ClaimRequest { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public string? Remark { get; set; }
    }
}
