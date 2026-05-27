using ksolexp.Model;
using Microsoft.EntityFrameworkCore;
using solexp.Model;

namespace solexp.Repository
{
    public class StudentRepository: IStudentRepository
    {
        private readonly AppDbContext _context;

        public StudentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Student> CreateAsync(Student student)
        {
            _context.Students.Add(student);
            await _context.SaveChangesAsync();
            return student;
        }

        public async Task<Student> UpdateAsync(Student student)
        {
            _context.Students.Update(student);
            await _context.SaveChangesAsync();
            return student;
        }
        public async Task<IEnumerable<Student>> GetByClientIdAsync(int clientId)
        {
            return await _context.Students
                .Where(ls => ls.id_client == clientId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Student>> GetAllAsync()
        {
            return await _context.Students.ToListAsync();
        }

        public async Task<Student> GetByIdAsync(int id)
        {
            return await _context.Students
                .FirstOrDefaultAsync(t => t.id_student == id);
        }

        public async Task DeleteAsync(int studentId)
        {
            var student = await _context.Students.FindAsync(studentId);
            if (student != null)
            {
                _context.Students.Remove(student);
                await _context.SaveChangesAsync();
            }
        }
    }
}
