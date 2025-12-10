using BusinessObjects;
using System.ComponentModel.DataAnnotations;

namespace DTOs.ProjectDTOs
{
    public class ProjectCreateDTO : IValidatableObject
    {
        [Required(ErrorMessage = "Project name is required")]
        public string? ProjectName { get; set; }

        [Required(ErrorMessage = "Project code is required")]
        [StringLength(20, ErrorMessage = "Project code must not over 20 chars")]
        public string? ProjectCode { get; set; }

        [Required(ErrorMessage = "Start Date is required")]
        public DateTime StartDate { get; set; }

        [Required(ErrorMessage = "End Date is required")]
        public DateTime EndDate { get; set; }

        public ProjectStatus Status;

        [Range(1, int.MaxValue, ErrorMessage = "Budget must be greater than 0")]
        public int Budget { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (StartDate >= EndDate)
            {
                yield return new ValidationResult(
                    "Start date must be less than end date",
                    new[] { nameof(StartDate), nameof(EndDate) });
            }
        }
    }
}
