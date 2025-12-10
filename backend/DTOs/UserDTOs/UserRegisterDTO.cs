using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace DTOs.UserDTOs
{
    public class UserRegisterDTO
    {
        public string Email { get; set; } = "";

        [Required(ErrorMessage = "Password is required!")]
        [DataType(DataType.Password)]
        [StringLength(20, MinimumLength = 5, ErrorMessage = "Password must be 5-20 Character")]
        [PasswordPropertyText]
        public string Password { get; set; } = "";

        [Required(ErrorMessage = "Full Name is required!")]
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }

    }
}
