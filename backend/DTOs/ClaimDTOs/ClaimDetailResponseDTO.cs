namespace DTOs.ClaimDTOs
{
    public class ClaimDetailResponseDTO
    {
        public Guid Id { get; set; }
        public Guid? ClaimId { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public long TotalHours { get; set; }
        public string? Remark { get; set; }
    }
}
