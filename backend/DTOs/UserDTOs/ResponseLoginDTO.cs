namespace DTOs.UserDTOs
{
    public class ResponseLoginDTO
    {
        public bool Status { get; set; } = false;
        public string Message { get; set; } = "";
        public string JWT { get; set; } = "";
        public DateTime? Expired { get; set; }
        // public string? JWTRefreshToken { get; set; } = "";
        public Guid? UserId { get; set; }
    }
}
