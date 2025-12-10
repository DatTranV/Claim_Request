using BusinessObjects;

namespace Repositories.Interfaces
{
    public interface IAuditTrailRepository : IGenericRepository<AuditTrail>
    {
        Task<AuditTrail> AddAuditTrailAsync(AuditTrail auditTrail);
    }
}
