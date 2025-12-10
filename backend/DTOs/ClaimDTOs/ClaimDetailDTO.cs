namespace DTOs.ClaimDTOs
{
    public class ClaimDetailDTO
    {
        public Guid? ClaimId { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public string? Remark { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid? CreatedBy { get; set; }
    }
}
