using solexp.Model;

namespace solexp.Repository
{
    public interface IUserRepository
    {
        Task<User> GetByEmailAsync(string email);
        Task<IEnumerable<User>> GetAllAsync();
        Task<User> GetByIdAsync(int id);
        Task<User> CreateAsync(User user);
        Task<bool> ExistsByEmailAsync(string email);
        Task<User> UpdateAsync(User user);
        Task<bool> DeleteAsync(int id);
    }
}
