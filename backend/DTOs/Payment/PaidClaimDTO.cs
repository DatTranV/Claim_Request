using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs.Payment
{
    public class PaidClaimDTO
    {
        public Guid CLaimId { get; set; }
        public string remark { get; set; }
        public DateTime CurrentDateTime { get; set; } // Added StartDate property
        public string Status { get; set; } // Added EndDate property

    }
}
