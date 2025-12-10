using BusinessObjects;

namespace DTOs.ClaimDTOs
{
    public class ClaimResponseDTO
    {
        public Guid Id { get; set; }
        public Guid CreatorId { get; set; }
        public string? StaffName { get; set; }
        public Guid ProjectId { get; set; }
        public string? ProjectName { get; set; }
        public DateTime StartDate { get; set; } 
        public DateTime EndDate { get; set; }  
        public string ProjectDuration => $"{StartDate:yyyy-MM-dd} - {EndDate:yyyy-MM-dd}";
        public long TotalWorkingHours { get; set; }
        public int TotalClaimAmount { get; set; }
        public string? Remark { get; set; }
        public DateTime CreatedAt { get; set; }
        public ClaimStatus Status { get; set; }
        public List<ClaimDetailResponseDTO> ClaimDetails { get; set; } = [];
    }
}
