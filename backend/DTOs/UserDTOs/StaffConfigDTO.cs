using BusinessObjects;
using System.ComponentModel.DataAnnotations;

namespace DTOs.UserDTOs;

public class StaffConfigDTO
{
    //public string? Id { get; set; }
    [Required(ErrorMessage = "Please specify value for this field.")]
    public string? FullName { get; set; }
    public string? UserName { get; set; }
    public string? Email { get; set; }
    [Required(ErrorMessage = "Please specify value for this field.")]
    public Department Department { get; set; }
    public string? PhoneNumber { get; set; }
    public string? RoleName { get; set; }
    [Required(ErrorMessage = "Please specify value for this field.")]
    public Rank Rank { get; set; }
    public string? Title { get; set; }
    [Required(ErrorMessage = "Please specify value for this field.")]
    public int Salary { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsDeleted { get; set; }
}