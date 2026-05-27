using solexp.Model;

namespace solexp.Repository
{
    public interface IAdminRepository
    {
        Task<Admin> CreateAsync(Admin admin);
        Task<Admin> GetByUserIdAsync(int userId);
        Task<Admin?> GetByIdAsync(int adminId);
        Task<Admin> UpdateAsync(Admin admin);
        Task<bool> AnyAsync();
    }
}
