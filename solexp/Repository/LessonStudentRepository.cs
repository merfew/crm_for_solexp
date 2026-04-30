using ksolexp.Model;
using Microsoft.EntityFrameworkCore;
using solexp.Model;

namespace solexp.Repository
{
    public class LessonStudentRepository : ILessonStudentRepository
    {
        private readonly AppDbContext _context;

        public LessonStudentRepository(AppDbContext context)
        {
            _context = context;
        }

        // READ: Получить все записи уроков-студентов
        public async Task<IEnumerable<Lesson_student>> GetAllAsync()
        {
            return await _context.LessonStudents.ToListAsync();
        }

        // READ: Получить запись по ID
        public async Task<Lesson_student> GetByIdAsync(int id)
        {
            return await _context.LessonStudents
                .FirstOrDefaultAsync(ls => ls.id_lesson_student == id);
        }

        // READ: Получить все записи по ID урока
        public async Task<IEnumerable<Lesson_student>> GetByLessonIdAsync(int lessonId)
        {
            return await _context.LessonStudents
                .Where(ls => ls.id_lesson == lessonId)
                .ToListAsync();
        }

        // READ: Получить все записи по ID студента
        public async Task<IEnumerable<Lesson_student>> GetByStudentIdAsync(int studentId)
        {
            return await _context.LessonStudents
                .Where(ls => ls.id_student == studentId)
                .ToListAsync();
        }

        // CREATE: Создать новую запись
        public async Task<Lesson_student> CreateAsync(Lesson_student lessonStudent)
        {
            _context.LessonStudents.Add(lessonStudent);
            await _context.SaveChangesAsync();
            return lessonStudent;
        }

        // UPDATE: Обновить запись
        public async Task<Lesson_student> UpdateAsync(Lesson_student lessonStudent)
        {
            _context.LessonStudents.Update(lessonStudent);
            await _context.SaveChangesAsync();
            return lessonStudent;
        }

        // DELETE: Удалить запись по ID
        public async Task<bool> DeleteAsync(int id)
        {
            var lessonStudent = await _context.LessonStudents.FindAsync(id);
            if (lessonStudent == null)
                return false;

            _context.LessonStudents.Remove(lessonStudent);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}