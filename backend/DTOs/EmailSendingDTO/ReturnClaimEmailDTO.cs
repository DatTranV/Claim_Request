using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs.EmailSendingDTO
{
    public class ReturnClaimEmailDTO
    {
         [Required(ErrorMessage = "Project name is required")]
        [StringLength(100, ErrorMessage = "Project name cannot exceed 100 characters")]
        public string ProjectName { get; set; }
        
        [Required(ErrorMessage = "Staff ID is required")]
        public Guid StaffId { get; set; }
        
        [Required(ErrorMessage = "Staff name is required")]
        [StringLength(100, ErrorMessage = "Staff name cannot exceed 100 characters")]
        public string StaffName { get; set; }
        
        [Required(ErrorMessage = "Staff email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [StringLength(255, ErrorMessage = "Email cannot exceed 255 characters")]
        public string StaffEmail { get; set; }
    }
}
