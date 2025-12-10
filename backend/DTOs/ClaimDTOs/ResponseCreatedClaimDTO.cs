using BusinessObjects;

namespace DTOs.ClaimDTOs
{
    public class ResponseCreatedClaimDTO
    {
        public Guid Id { get; set; }
        public ClaimStatus Status { get; set; }
        public Guid CreatorId { get; set; }
        public Guid ProjectId { get; set; }
        public long TotalWorkingHours { get; set; }
        public int TotalClaimAmount { get; set; }
        public string? Remark { get; set; }
        public List<ClaimDetailResponseDTO> ClaimDetails { get; set; } = [];
    }
}
