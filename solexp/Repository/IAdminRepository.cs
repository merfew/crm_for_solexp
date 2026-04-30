using solexp.Model;

namespace solexp.Repository
{
    public interface IAdminRepository
    {
        Task<Admin> CreateAsync(Admin admin);
        Task<Admin> GetByUserIdAsync(int userId);
        Task<bool> AnyAsync(); 
    }
}
