using System.ComponentModel.DataAnnotations;

namespace DTOs.ClaimDTOs
{
    public class ClaimListDTO
    {
        [Required(ErrorMessage = "ClaimId is required")]
        public List<Guid> ClaimId { get; set; }
    }
}
