using solexp.Model;

namespace solexp.Repository
{
    public interface ILessonRepository
    {
        // READ
        Task<IEnumerable<Lesson>> GetAllAsync();
        Task<Lesson> GetByIdAsync(int id);
        Task<IEnumerable<Lesson>> GetByCourseIdAsync(int courseId);
        Task<IEnumerable<Lesson>> GetByTeacherIdAsync(int teacherId);
        Task<IEnumerable<Lesson>> GetByTitleAsync(string title);

        // CREATE
        Task<Lesson> CreateAsync(Lesson lesson);

        // UPDATE
        Task<Lesson> UpdateAsync(Lesson lesson);

        // DELETE
        Task<bool> DeleteAsync(int id);

        // CHECK
        Task<bool> ExistsByIdAsync(int id);
        Task<bool> ExistsByTitleAsync(string title);
    }
}