using System.ComponentModel.DataAnnotations;

namespace BusinessObjects
{
    public class BaseEntity
    {
        public Guid Id { get; set; } 
        public DateTime CreatedAt{ get; set; } 
        public Guid? CreatedBy { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public Guid? ModifiedBy { get; set; }
        public DateTime? DeletedAt { get; set; }
        public Guid? DeletedBy { get; set; }
        public bool? IsDeleted { get; set; } = false;
    }
}
