using solexp.Model;
namespace solexp.Repository
{
    public interface IAccountTransactionRepository
    {
        // Basic CRUD
        Task<IEnumerable<Account_transaction>> GetAllAsync();
        Task<Account_transaction> GetByIdAsync(int id);
        Task<Account_transaction> CreateAsync(Account_transaction accountTransactions);
        Task<Account_transaction> UpdateAsync(Account_transaction accountTransactions);
        Task<bool> DeleteAsync(int id);

        // Search methods
        Task<IEnumerable<Account_transaction>> GetByClientIdAsync(int clientId);
        Task<IEnumerable<Account_transaction>> GetByStudentIdAsync(int studentId);
    }
}
