using solexp.Model;

namespace solexp.Repository
{
    public interface IStudentRepository
    {
        Task<Student> CreateAsync(Student student);
        Task<Student> GetByIdAsync(int userId);
        Task<IEnumerable<Student>> GetAllAsync();
        Task<IEnumerable<Student>> GetByClientIdAsync(int clientId);
        Task<Student> UpdateAsync(Student student);
        Task DeleteAsync(int studentId);
    }
}