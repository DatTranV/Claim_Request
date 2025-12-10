using Microsoft.EntityFrameworkCore.Storage;
using Repositories.Interfaces;
using Repositories.Repositories;

namespace Repositories
{

    public class UnitOfWork : IUnitOfWork
    {
        private readonly ClaimRequestDbContext _context;
        private readonly IUserRepository _userRepository;
        private readonly IClaimRepository _claimRepository;
        private readonly IClaimDetailRepository _claimDetailRepository;
        private readonly IAuditTrailRepository _auditTrailRepository;
        private readonly IProjectEnrollmentRepository _projectEnrollmentRepository;
        private readonly IProjectRepository _projectRepository;

        public UnitOfWork(ClaimRequestDbContext context,
            IUserRepository userRepository, IClaimRepository claimRepository,
            IClaimDetailRepository claimDetailRepository,
            IAuditTrailRepository auditTrailRepository,
            IProjectEnrollmentRepository projectEnrollmentRepository,
            IProjectRepository projectRepository
            )
        {
            _context = context;
            _userRepository = userRepository;
            _claimRepository = claimRepository;
            _claimDetailRepository = claimDetailRepository;
            _auditTrailRepository = auditTrailRepository;
            _projectEnrollmentRepository = projectEnrollmentRepository;
            _projectRepository = projectRepository;
        }

        public IUserRepository UserRepository => _userRepository;
        public IClaimRepository ClaimRepository => _claimRepository;
        public IClaimDetailRepository ClaimDetailRepository => _claimDetailRepository;
        public IAuditTrailRepository AuditTrailRepository => _auditTrailRepository;
        public IProjectEnrollmentRepository ProjectEnrollmentRepository => _projectEnrollmentRepository;
        public IProjectRepository ProjectRepository => _projectRepository;

        public void Dispose()
        {
            _context.Dispose();
        }

        public async Task<int> SaveChangeAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public async Task<IDbContextTransaction> BeginTransactionAsync()
        {
            return await _context.Database.BeginTransactionAsync();
        }
    }
}
