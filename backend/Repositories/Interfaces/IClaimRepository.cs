using BusinessObjects;
using Repositories.Helpers;
using System.Linq.Expressions;


namespace Repositories.Interfaces
{
    public interface IClaimRepository : IGenericRepository<ClaimRequest>
    {

        Task<List<ClaimRequest>> GetAllClaimHaveFilterAsync(Expression<Func<ClaimRequest, bool>> predicate = null, params Expression<Func<ClaimRequest, object>>[] includes);
        public IQueryable<ClaimRequest> FilterAllField(ClaimParams query);
        Task<List<ClaimRequest>> GetPendingClaimsAsync();

    }
}
