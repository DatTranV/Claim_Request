namespace Repositories.Helpers
{
    public class ClaimParams : PaginationParams
    {
        public string? SearchTerm { get; set; }

        public string? ProjectName { get; set; }

        public string? Status { get; set; }
    }
}
