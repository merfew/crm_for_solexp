using ksolexp.Model;
using Microsoft.EntityFrameworkCore;
using solexp.Model;

namespace solexp.Repository
{
    public class ClientRepository : IClientRepository
    {
        private readonly AppDbContext _context;

        public ClientRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Client> CreateAsync(Client client)
        {
            _context.Clients.Add(client);
            await _context.SaveChangesAsync();
            return client;
        }
        public async Task<IEnumerable<Client>> GetAllAsync()
        {
            return await _context.Clients.ToListAsync();
        }

        public async Task<Client> GetByUserIdAsync(int userId)
        {
            return await _context.Clients
                .FirstOrDefaultAsync(c => c.id_user == userId);
        }
        public async Task<Client> GetByIdAsync(int id)
        {
            return await _context.Clients
                .FirstOrDefaultAsync(r => r.id_client == id);
        }
        public async Task<IEnumerable<Student>> GetStudentsByClientIdAsync(int clientId)
        {
            return await _context.Students
                .Where(s => s.id_client == clientId)
                .ToListAsync();
        }
        public async Task<Client> UpdateAsync(Client client)
        {
            _context.Clients.Update(client);
            await _context.SaveChangesAsync();
            return client;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var client = await _context.Clients.FindAsync(id);
            if (client == null)
                return false;

            _context.Clients.Remove(client);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}