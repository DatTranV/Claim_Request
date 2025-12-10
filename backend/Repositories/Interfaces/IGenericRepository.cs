using System.Linq.Expressions;

namespace Repositories.Interfaces
{
    public interface IGenericRepository<TEntity> where TEntity : class
    {
        Task<TEntity> AddAsync(TEntity entity);
        Task AddRangeAsync(List<TEntity> entities);
        public Task<List<TEntity>> GetAllAsync(Expression<Func<TEntity, bool>> predicate = null!, params Expression<Func<TEntity, object>>[] includes);
        IQueryable<TEntity> GetQueryable();
        Task<TEntity?> GetByIdAsync(Guid id, params Expression<Func<TEntity, object>>[] includes);
        Task<bool> Update(TEntity entity);
        Task<bool> Delete(TEntity entity);
        Task<bool> SoftRemoveRangeById(List<Guid> entitiesId);
        Task<bool> SoftRemoveRange(List<TEntity> entities);
        Task<bool> SoftRemove(TEntity entity);
        Task<List<TEntity>> GetAllHaveFilterAsync(Expression<Func<TEntity, bool>> predicate = null, params Expression<Func<TEntity, object>>[] includes);

    }
}
