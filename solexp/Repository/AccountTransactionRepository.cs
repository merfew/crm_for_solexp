using ksolexp.Model;
using Microsoft.EntityFrameworkCore;
using solexp.Model;

namespace solexp.Repository
{
    public class AccountTransactionRepository: IAccountTransactionRepository
    {
        private readonly AppDbContext _context;

        public AccountTransactionRepository(AppDbContext context)
        {
            _context = context;
        }

        // READ: Получить все записи уроков-студентов
        public async Task<IEnumerable<Account_transaction>> GetAllAsync()
        {
            return await _context.AccountTransactions.ToListAsync();
        }

        // READ: Получить запись по ID
        public async Task<Account_transaction> GetByIdAsync(int id)
        {
            return await _context.AccountTransactions
                .FirstOrDefaultAsync(ls => ls.id_transaction == id);
        }

        // READ: Получить все записи по ID клиента
        public async Task<IEnumerable<Account_transaction>> GetByClientIdAsync(int clientId)
        {
            return await _context.AccountTransactions
                .Where(ls => ls.id_client == clientId)
                .ToListAsync();
        }

        // READ: Получить все записи по ID студента
        public async Task<IEnumerable<Account_transaction>> GetByStudentIdAsync(int studentId)
        {
            return await _context.AccountTransactions
                .Where(ls => ls.id_student == studentId)
                .ToListAsync();
        }

        // CREATE: Создать новую запись
        public async Task<Account_transaction> CreateAsync(Account_transaction accountTransactions)
        {
            _context.AccountTransactions.Add(accountTransactions);
            await _context.SaveChangesAsync();
            return accountTransactions;
        }

        // UPDATE: Обновить запись
        public async Task<Account_transaction> UpdateAsync(Account_transaction accountTransactions)
        {
            _context.AccountTransactions.Update(accountTransactions);
            await _context.SaveChangesAsync();
            return accountTransactions;
        }

        // DELETE: Удалить запись по ID
        public async Task<bool> DeleteAsync(int id)
        {
            var accountTransactions = await _context.AccountTransactions.FindAsync(id);
            if (accountTransactions == null)
                return false;

            _context.AccountTransactions.Remove(accountTransactions);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
