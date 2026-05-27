using ksolexp.Model;
using Microsoft.EntityFrameworkCore;
using solexp.Model;

namespace solexp.Repository
{
    public class AccountTransactionRepository : IAccountTransactionRepository
    {
        private readonly AppDbContext _context;

        public AccountTransactionRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Account_transaction>> GetAllAsync()
        {
            return await _context.AccountTransactions.ToListAsync();
        }

        public async Task<Account_transaction?> GetByIdAsync(int id)
        {
            return await _context.AccountTransactions
                .FirstOrDefaultAsync(t => t.id_transaction == id);
        }

        public async Task<IEnumerable<Account_transaction>> GetByClientIdAsync(int clientId)
        {
            return await _context.AccountTransactions
                .Where(t => t.id_client == clientId)
                .OrderByDescending(t => t.transaction_date)
                .ToListAsync();
        }

        public async Task<Account_transaction?> GetByLessonStudentIdAsync(int lessonStudentId)
        {
            return await _context.AccountTransactions
                .FirstOrDefaultAsync(t => t.id_lesson_student == lessonStudentId);
        }

        public async Task<Account_transaction> CreateAsync(Account_transaction accountTransaction)
        {
            _context.AccountTransactions.Add(accountTransaction);
            await _context.SaveChangesAsync();
            return accountTransaction;
        }

        public async Task<Account_transaction> UpdateAsync(Account_transaction accountTransaction)
        {
            _context.AccountTransactions.Update(accountTransaction);
            await _context.SaveChangesAsync();
            return accountTransaction;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.AccountTransactions.FindAsync(id);
            if (entity == null) return false;

            _context.AccountTransactions.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
