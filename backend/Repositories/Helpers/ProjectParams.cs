namespace Repositories.Helpers
{
    public class ProjectParams : PaginationParams
    {
        public string? SearchTerm { get; set; }

        //  [BindProperty(Name = "ProjectId")]
        public string? ProjectId { get; set; }

        //  [BindProperty(Name = "ProjectName")]
        public string? ProjectName { get; set; }

        public string? ProjectRole { get; set; }

        //  [BindProperty(Name = "Budget")]
        public int? Budget { get; set; }

       
    }
}
