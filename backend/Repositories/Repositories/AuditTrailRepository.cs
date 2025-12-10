using BusinessObjects;
using Repositories.Interfaces;

namespace Repositories.Repositories
{
    public class AuditTrailRepository : GenericRepository<AuditTrail>, IAuditTrailRepository
    {
        private readonly ICurrentTime _timeService;

        public AuditTrailRepository(ClaimRequestDbContext context, ICurrentTime timeService, IClaimsService claimsService) : base(context, timeService, claimsService)
        {
            _timeService = timeService;
        }

        public async Task<AuditTrail> AddAuditTrailAsync(AuditTrail auditTrail)
        {
            auditTrail.ActionDate = _timeService.GetCurrentTime();
            auditTrail.CreatedAt = _timeService.GetCurrentTime();
            //auditTrail.LoggedNote = $"{Act}ed by {auditTrail.User.FullName?? "Unknown"} on {auditTrail.ActionDate}";
            return await AddAsync(auditTrail);
        }
    }
}
