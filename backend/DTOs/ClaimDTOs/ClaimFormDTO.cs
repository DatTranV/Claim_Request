using BusinessObjects;

namespace DTOs.ClaimDTOs
{
    public class ClaimFormDTO
    {
        public string? StaffName { get; set; }
        public string? Department { get; set; }
        public string? StaffId { get; set; }
        public int Salary { get; set; }
        public List<ProjectDropdownDTO>? Projects { get; set; }
    }
}
