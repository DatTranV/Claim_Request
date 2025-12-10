using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DTOs.EmailSendingDTO

{
    public class SubmittedClaimEmailDTO
    {
       [Required(ErrorMessage = "PM name is required")]
        [StringLength(100, ErrorMessage = "PM name cannot exceed 100 characters")]
        public string PMName { get; set; }
        
        [Required(ErrorMessage = "PM email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [StringLength(255, ErrorMessage = "Email cannot exceed 255 characters")]
        public string PMMail { get; set; }
        
        [Required(ErrorMessage = "Project name is required")]
        [StringLength(100, ErrorMessage = "Project name cannot exceed 100 characters")]
        public string ProjectName { get; set; }
        
        [Required(ErrorMessage = "Staff ID is required")]
        public Guid StaffId { get; set; }
        
        [Required(ErrorMessage = "Staff name is required")]
        [StringLength(100, ErrorMessage = "Staff name cannot exceed 100 characters")]
        public string StaffName { get; set; }
        
        [Required(ErrorMessage = "Claim status is required")]
        [StringLength(50, ErrorMessage = "Claim status cannot exceed 50 characters")]
        public string ClaimStatus { get; set; }
    }
}
