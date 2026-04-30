using solexp.Model;

namespace solexp.Repository
{
    public interface IRoleRepository
    {
        Task<Role> GetByNameAsync(string name);
        Task<Role> GetByIdAsync(int id);
        Task<IEnumerable<Role>> GetAllAsync();
    }
}
