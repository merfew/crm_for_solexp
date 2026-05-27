using solexp.Model;
namespace solexp.Repository
{
    public interface IAccountTransactionRepository
    {
        Task<IEnumerable<Account_transaction>> GetAllAsync();
        Task<Account_transaction?> GetByIdAsync(int id);
        Task<Account_transaction> CreateAsync(Account_transaction accountTransaction);
        Task<Account_transaction> UpdateAsync(Account_transaction accountTransaction);
        Task<bool> DeleteAsync(int id);

        Task<IEnumerable<Account_transaction>> GetByClientIdAsync(int clientId);
        Task<Account_transaction?> GetByLessonStudentIdAsync(int lessonStudentId);
    }
}
