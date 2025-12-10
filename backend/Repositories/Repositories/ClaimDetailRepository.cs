using BusinessObjects;
using Microsoft.EntityFrameworkCore;
using Repositories.Interfaces;

namespace Repositories.Repositories
{
    public class ClaimDetailRepository : GenericRepository<ClaimDetail>, IClaimDetailRepository
    {
        private ClaimRequestDbContext _context;
        public ClaimDetailRepository(
            ClaimRequestDbContext context,
            ICurrentTime timeService,
            IClaimsService claimsService
            ) : base(context, timeService, claimsService)
        {
            _context = context;
        }

        public async Task<ClaimDetail> AddClaimDetailAsync(ClaimDetail claimDetail)
        {
            return await AddAsync(claimDetail);
        }

        public async Task<List<ClaimDetail>> GetClaimDetailsByClaimIdAsync(Guid claimId)
        {
            return await _context.ClaimDetails.Where(cd => cd.ClaimId == claimId).ToListAsync();
        }
    }
}
