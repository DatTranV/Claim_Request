using System.ComponentModel.DataAnnotations;

namespace DTOs.ClaimDTOs
{
    public class ClaimCreateDTO
    {
        [Required(ErrorMessage = "Creator ID is required")]
        public Guid CreatorId { get; set; }
        
        [Required(ErrorMessage = "Project ID is required")]
        public Guid ProjectId { get; set; }
        
        [StringLength(50, ErrorMessage = "Status cannot exceed 50 characters")]
        public string? Status { get; set; }
        
        [StringLength(500, ErrorMessage = "Remark cannot exceed 500 characters")]
        public string? Remark { get; set; }
        
        [MinLength(1, ErrorMessage = "At least one claim detail is required")]
        public virtual ICollection<ClaimDetailDTO> ClaimDetails { get; set; } = new List<ClaimDetailDTO>();
    }
}
