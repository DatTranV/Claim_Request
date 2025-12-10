using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;

namespace BusinessObjects
{
    public class Role : IdentityRole<Guid>
    {
    }
}
