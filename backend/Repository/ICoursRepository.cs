using solexp.Model;

namespace solexp.Repository
{
    public interface ICoursRepository
    {
        Task<IEnumerable<Cours>> GetAllAsync();
        Task<Cours> GetByIdAsync(int id);
        Task<Cours> CreateAsync(Cours cours);
        Task<Cours> UpdateAsync(Cours cours);
        Task<bool> DeleteAsync(int id);
    }
}