using ksolexp.Model;
using Microsoft.EntityFrameworkCore;
using solexp.Model;

namespace solexp.Repository
{
    public class CoursRepository : ICoursRepository
    {
        private readonly AppDbContext _context;

        public CoursRepository(AppDbContext context)
        {
            _context = context;
        }

        // READ: Получить все курсы
        public async Task<IEnumerable<Cours>> GetAllAsync()
        {
            return await _context.Courses.ToListAsync();
        }

        // READ: Получить курс по ID
        public async Task<Cours> GetByIdAsync(int id)
        {
            return await _context.Courses
                .FirstOrDefaultAsync(c => c.id_cours == id);
        }

        // CREATE: Создать новый курс
        public async Task<Cours> CreateAsync(Cours cours)
        {
            _context.Courses.Add(cours);
            await _context.SaveChangesAsync();
            return cours;
        }

        // UPDATE: Обновить курс
        public async Task<Cours> UpdateAsync(Cours cours)
        {
            _context.Courses.Update(cours);
            await _context.SaveChangesAsync();
            return cours;
        }

        // DELETE: Удалить курс по ID
        public async Task<bool> DeleteAsync(int id)
        {
            var cours = await _context.Courses.FindAsync(id);
            if (cours == null)
                return false;

            _context.Courses.Remove(cours);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}