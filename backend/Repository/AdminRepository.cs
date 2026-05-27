using ksolexp.Model;
using Microsoft.EntityFrameworkCore;
using solexp.Model;

namespace solexp.Repository
{
    public class AdminRepository : IAdminRepository
    {
        private readonly AppDbContext _context;

        public AdminRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Admin> CreateAsync(Admin admin)
        {
            _context.Admins.Add(admin);
            await _context.SaveChangesAsync();
            return admin;
        }

        public async Task<Admin> GetByUserIdAsync(int userId)
        {
            return await _context.Admins
                .FirstOrDefaultAsync(a => a.id_user == userId);
        }

        public async Task<Admin?> GetByIdAsync(int adminId)
        {
            return await _context.Admins
                .FirstOrDefaultAsync(a => a.id_admin == adminId);
        }

        public async Task<Admin> UpdateAsync(Admin admin)
        {
            _context.Admins.Update(admin);
            await _context.SaveChangesAsync();
            return admin;
        }

        public async Task<bool> AnyAsync()
        {
            return await _context.Admins.AnyAsync();
        }
    }
}