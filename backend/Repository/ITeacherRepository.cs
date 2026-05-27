using solexp.Model;

namespace solexp.Repository
{
    public interface ITeacherRepository
    {
        Task<Teacher> CreateAsync(Teacher teacher);
        Task<IEnumerable<Teacher>> GetAllAsync();
        Task<Teacher> GetByUserIdAsync(int userId);
        Task<Teacher> GetByIdAsync(int userId);
        Task<Teacher> UpdateAsync(Teacher teacher);
        Task<bool> DeleteAsync(int id);
    }
}
