using BusinessObjects;


namespace Repositories.Interfaces
{
    public interface IClaimDetailRepository : IGenericRepository<ClaimDetail>
    {
        Task<ClaimDetail> AddClaimDetailAsync(ClaimDetail claimDetail);
        Task<List<ClaimDetail>> GetClaimDetailsByClaimIdAsync(Guid claimId);
    }
}
