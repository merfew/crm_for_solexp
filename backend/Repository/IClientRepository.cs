using solexp.Model;

namespace solexp.Repository
{
    public interface IClientRepository
    {
        Task<Client> CreateAsync(Client client);
        Task<Client> GetByUserIdAsync(int userId);
        Task<Client> GetByIdAsync(int id);
        Task<IEnumerable<Client>> GetAllAsync();
        Task<IEnumerable<Student>> GetStudentsByClientIdAsync(int clientId);
        Task<Client> UpdateAsync(Client client);
        Task<bool> DeleteAsync(int id);
    }
}
