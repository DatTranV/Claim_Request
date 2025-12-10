using BusinessObjects;
using Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace Repositories.Repositories
{
    public class GenericRepository<TEntity> : IGenericRepository<TEntity> where TEntity : BaseEntity
    {
        private readonly DbSet<TEntity> _dbSet;
        private readonly ClaimRequestDbContext _dbContext;
        private readonly ICurrentTime _timeService;
        private readonly IClaimsService _claimsService;

        public GenericRepository(
            ClaimRequestDbContext context,
            ICurrentTime timeService,
            IClaimsService claimsService
            )
        {
            _dbSet = context.Set<TEntity>();
            _dbContext = context;
            _timeService = timeService;
            _claimsService = claimsService;
        }

        public async Task<TEntity> AddAsync(TEntity entity)
        {
            try
            {
                entity.CreatedAt = _timeService.GetCurrentTime();
                entity.CreatedBy = _claimsService.GetCurrentUserId;
                var result = await _dbSet.AddAsync(entity);
                return result.Entity;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task AddRangeAsync(List<TEntity> entities)
        {
            foreach (var entity in entities)
            {
                entity.CreatedAt = _timeService.GetCurrentTime();
                entity.CreatedBy = _claimsService.GetCurrentUserId;
            }
            await _dbSet.AddRangeAsync(entities);
        }

        public async Task<bool> Delete(TEntity entity)
        {
            try
            {
                _dbSet.Remove(entity);
                return Task.FromResult(true).Result;
            }
            catch
            {
                return Task.FromResult(false).Result;
            }
        }

        public Task<List<TEntity>> GetAllAsync(Expression<Func<TEntity, bool>> predicate = null, params Expression<Func<TEntity, object>>[] includes)
        {
            IQueryable<TEntity> query = _dbSet;
            if (predicate != null)
            {
                query = query.Where(predicate);
            }
            foreach (var include in includes)
            {
                query = query.Include(include);
            }

            return query.ToListAsync();
        }

        public Task<List<TEntity>> GetAllHaveFilterAsync(Expression<Func<TEntity, bool>>? predicate = null, params Expression<Func<TEntity, object>>[] includes)
        {
            IQueryable<TEntity> query = _dbSet;
            if (predicate != null)
            {
                query = query.Where(predicate);
            }
            foreach (var include in includes)
            {
                query = query.Include(include);
            }

            // Khúc này là để lọc, thích lọc theo bất kì attribute nào của bất kì entity nào cũng được nha ae 
            if (predicate != null)
            {
                query = query.Where(predicate);
            }

            return query.ToListAsync();
        }

        public async Task<TEntity?> GetByIdAsync(Guid id, 
            params Expression<Func<TEntity, object>>[] includes)
        {
            IQueryable<TEntity> query = _dbSet;
            foreach (var include in includes)
            {
                query = query.Include(include);
            }
            var result = await query.FirstOrDefaultAsync(x => x.Id == id);
            return result;
        }

        public IQueryable<TEntity> GetQueryable()
        {
            return _dbSet;
        }

        public async Task<bool> SoftRemove(TEntity entity)
        {
            entity.IsDeleted = true;
            entity.DeletedAt = _timeService.GetCurrentTime();
            entity.DeletedBy = _claimsService.GetCurrentUserId;
            _dbSet.Update(entity);
            // await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SoftRemoveRange(List<TEntity> entities)
        {
            foreach (var entity in entities)
            {
                entity.IsDeleted = true;
                entity.DeletedAt = _timeService.GetCurrentTime();
                entity.DeletedBy = _claimsService.GetCurrentUserId;
            }
            _dbSet.UpdateRange(entities);
            //  await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SoftRemoveRangeById(List<Guid> entitiesId)
        {
            var entities = await _dbSet.Where(e => entitiesId.Contains(e.Id)).ToListAsync();

            foreach (var entity in entities)
            {
                entity.IsDeleted = true;
                entity.DeletedAt = _timeService.GetCurrentTime();
                entity.DeletedBy = _claimsService.GetCurrentUserId;
            }
            _dbContext.UpdateRange(entities);
            return true;
        }

        public async Task<bool> Update(TEntity entity)
        {
            entity.ModifiedAt = _timeService.GetCurrentTime();
            entity.ModifiedBy = _claimsService.GetCurrentUserId;
            _dbSet.Update(entity);
            return true;
        }
        public async Task<bool> UpdateRange(List<TEntity> entities)
        {
            foreach (var entity in entities)
            {
                entity.ModifiedAt = _timeService.GetCurrentTime();
                entity.ModifiedBy = _claimsService.GetCurrentUserId;
            }
            _dbSet.UpdateRange(entities);
            return true;
        }
    }
}
