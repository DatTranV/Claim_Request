using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using BusinessObjects;

namespace DTOs.ClaimDTOs
{
    public class ClaimToUpdateDTO
    {
        [Required(ErrorMessage = "ID is required")]
        public Guid Id { get; set; }
        
        [Required(ErrorMessage = "Creator ID is required")]
        public Guid CreatorId { get; set; }
        
        [Required(ErrorMessage = "Project ID is required")]
        public Guid ProjectId { get; set; }

        [Required(ErrorMessage = "Status is required")]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public ClaimStatus Status { get; set; }
        
        [Range(0, long.MaxValue, ErrorMessage = "Total working hours must be a positive number")]
        public long TotalWorkingHours { get; set; }
        
        [Range(0, long.MaxValue, ErrorMessage = "Total claim amount must be a positive number")]
        public long? TotalClaimAmount { get; set; }
        
        [StringLength(500, ErrorMessage = "Remark cannot exceed 500 characters")]
        public string? Remark { get; set; }
        
        [MinLength(1, ErrorMessage = "At least one claim detail is required")]
        public virtual List<ClaimDetailDTO> ClaimDetails { get; set; } = new List<ClaimDetailDTO>();
    }
}
