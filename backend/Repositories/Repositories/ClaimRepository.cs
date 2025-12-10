using BusinessObjects;
using Microsoft.EntityFrameworkCore;
using Repositories.Helpers;
using Repositories.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Repositories.Repositories
{
    public class ClaimRepository : GenericRepository<ClaimRequest>, IClaimRepository
    {
        private readonly ClaimRequestDbContext _context;
        public ClaimRepository(
            ClaimRequestDbContext context,
            ICurrentTime timeService, 
            IClaimsService claimsService
            ) : base(context, timeService, claimsService)
        {
            _context = context;
        }

        public IQueryable<ClaimRequest> FilterAllField(ClaimParams claimParam)
        {
            var query = _context.ClaimRequests;

            return query;
        }

        public Task<ClaimRequest> GetAllClaimAsync()
        {
            throw new NotImplementedException();
        }

        public async Task<ClaimRequest> GetClaimByIdAsync(Guid id)
        {
            return await GetByIdAsync(id, c => c.Creator, c => c.Project);
        }

        public async Task<List<ClaimRequest>> GetPendingClaimsAsync()
        {
            return await _context.ClaimRequests
                .Where(o => o.Status == ClaimStatus.PendingApproval)
                .ToListAsync();
        }

        public async Task<List<ClaimRequest>> GetAllClaimHaveFilterAsync(Expression<Func<ClaimRequest, bool>> predicate, params Expression<Func<ClaimRequest, object>>[] includes)
        {
            return await GetAllHaveFilterAsync(predicate, includes);
        }


    }
}
