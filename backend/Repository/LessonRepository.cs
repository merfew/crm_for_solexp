using ksolexp.Model;
using Microsoft.EntityFrameworkCore;
using solexp.Model;

namespace solexp.Repository
{
    public class LessonRepository : ILessonRepository
    {
        private readonly AppDbContext _context;

        public LessonRepository(AppDbContext context)
        {
            _context = context;
        }

        // READ: Получить все уроки
        public async Task<IEnumerable<Lesson>> GetAllAsync()
        {
            return await _context.Lessons
                .OrderBy(l => l.id_lesson)
                .ToListAsync();
        }

        // READ: Получить урок по ID
        public async Task<Lesson> GetByIdAsync(int id)
        {
            return await _context.Lessons
                .FirstOrDefaultAsync(l => l.id_lesson == id);
        }

        // READ: Получить уроки по ID курса (если есть связь с курсом)
        public async Task<IEnumerable<Lesson>> GetByCourseIdAsync(int courseId)
        {
            return await _context.Lessons
                .Where(l => l.id_course == courseId) 
                .ToListAsync();
        }

        public async Task<IEnumerable<Lesson>> GetByTeacherIdAsync(int teacherId)
        {
            return await _context.Lessons
                .Where(l => l.id_teacher == teacherId)
                .ToListAsync();
        }

        // READ: Получить уроки по названию
        public async Task<IEnumerable<Lesson>> GetByTitleAsync(string title)
        {
            return await _context.Lessons
                .Where(l => l.title.ToLower().Contains(title.ToLower()))
                .ToListAsync();
        }

        // CREATE: Создать новый урок
        public async Task<Lesson> CreateAsync(Lesson lesson)
        {
            _context.Lessons.Add(lesson);
            await _context.SaveChangesAsync();
            return lesson;
        }

        // UPDATE: Обновить существующий урок
        public async Task<Lesson> UpdateAsync(Lesson lesson)
        {
            _context.Lessons.Update(lesson);
            await _context.SaveChangesAsync();
            return lesson;
        }

        // DELETE: Удалить урок по ID
        public async Task<bool> DeleteAsync(int id)
        {
            var lesson = await _context.Lessons.FindAsync(id);
            if (lesson == null)
                return false;

            _context.Lessons.Remove(lesson);
            await _context.SaveChangesAsync();
            return true;
        }

        // CHECK: Проверить существование урока по ID
        public async Task<bool> ExistsByIdAsync(int id)
        {
            return await _context.Lessons
                .AnyAsync(l => l.id_lesson == id);
        }

        // CHECK: Проверить существование урока по названию (опционально)
        public async Task<bool> ExistsByTitleAsync(string title)
        {
            return await _context.Lessons
                .AnyAsync(l => l.title.ToLower() == title.ToLower());
        }
    }
}