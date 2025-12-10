using Microsoft.EntityFrameworkCore.Storage;

namespace Repositories.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        public IUserRepository UserRepository { get; }
        public IClaimRepository ClaimRepository { get; }
        public IProjectEnrollmentRepository ProjectEnrollmentRepository { get; }
        public IProjectRepository ProjectRepository { get; }
        public IClaimDetailRepository ClaimDetailRepository { get; }
        public IAuditTrailRepository AuditTrailRepository { get; }

        Task<int> SaveChangeAsync();

        Task<IDbContextTransaction> BeginTransactionAsync();
    }
}
