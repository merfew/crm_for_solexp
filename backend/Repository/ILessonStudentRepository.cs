using solexp.Model;

namespace solexp.Repository
{
    public interface ILessonStudentRepository
    {
        // Basic CRUD
        Task<IEnumerable<Lesson_student>> GetAllAsync();
        Task<Lesson_student> GetByIdAsync(int id);
        Task<Lesson_student> CreateAsync(Lesson_student lessonStudent);
        Task<Lesson_student> UpdateAsync(Lesson_student lessonStudent);
        Task<bool> DeleteAsync(int id);

        // Search methods
        Task<IEnumerable<Lesson_student>> GetByLessonIdAsync(int lessonId);
        Task<IEnumerable<Lesson_student>> GetByStudentIdAsync(int studentId);
    }
}