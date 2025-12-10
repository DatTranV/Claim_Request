using BusinessObjects;
using System.ComponentModel.DataAnnotations;

namespace DTOs.UserDTOs
{
    public class StaffCreateDTO
    {
      [Required(ErrorMessage = "Email is required")]
        [EmailAddress(ErrorMessage = "Invalid email format")]
        [StringLength(255, ErrorMessage = "Email cannot exceed 255 characters")]
        public string? Email { get; set; }
        
        [Required(ErrorMessage = "Please specify value for this field.")]
        [StringLength(100, ErrorMessage = "Full name cannot exceed 100 characters")]
        public string? FullName { get; set; }
        
        [Required(ErrorMessage = "Please specify value for this field.")]
        public Department Department { get; set; }
        
        [Required(ErrorMessage = "Please specify value for this field.")]
        public Rank Rank { get; set; }
        
        [Required(ErrorMessage = "Please specify value for this field.")]
        [Range(0, int.MaxValue, ErrorMessage = "Salary must be a positive number")]
        public int Salary { get; set; }
        
        [StringLength(100, ErrorMessage = "Title cannot exceed 100 characters")]
        public string? Title { get; set; }
        
        [StringLength(50, ErrorMessage = "Role name cannot exceed 50 characters")]
        public string? RoleName { get; set; }
    }
}
