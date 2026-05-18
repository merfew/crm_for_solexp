using solexp.Model;

namespace solexp.Services
{
    public interface IAdminService
    {
        // Инициализация
        Task SeedSuperAdminAsync();
        Task<bool> IsAdminAsync(int userId);

        // Управление педагогами
        Task<Teacher> CreateTeacherAccountAsync(CreateTeacherDto dto);
        Task UpdateTeacherAccountAsync(int teacherId, UpdateTeacherDto dto);
        Task DeleteTeacherAccountAsync(int teacherId);

        // Управление клиентами
        Task<Client> CreateClientAccountAsync(CreateClientDto dto);
        Task UpdateClientAccountAsync(int clientId, UpdateClientDto dto);
        Task DeleteClientAccountAsync(int clientId);

        Task<Student> CreateStudentAsync(int clientId, CreateStudentDto dto);

        // Просмотр информации
        Task<ClientFullInfoDto> GetClientFullInfoAsync(int clientId);
        Task<TeacherFullInfoDto> GetTeacherFullInfoAsync(int teacherId);
        Task<IEnumerable<ClientListItemDto>> GetAllClientsAsync();
        Task<IEnumerable<TeacherListItemDto>> GetAllTeachersAsync();

        // Управление расписанием (занятиями)
        Task<Lesson> GetLessonAsync(int lessonId);
        Task<Lesson> CreateLessonAsync(CreateLessonDto dto);
        Task UpdateLessonAsync(int lessonId, UpdateLessonDto dto);
        Task DeleteLessonAsync(int lessonId);
        Task<IEnumerable<Lesson>> GetScheduleAsync(DateTime? startDate = null, DateTime? endDate = null);

        // Управление курсами
        Task<Cours> CreateCourseAsync(CreateCourseDto dto);
        Task UpdateCourseAsync(int courseId, UpdateCourseDto dto);
        Task DeleteCourseAsync(int courseId);
        Task<IEnumerable<Cours>> GetAllCoursesAsync();

        // Запись студентов и прогресс
        Task<Lesson_student> EnrollStudentToLessonAsync(int lessonId, int studentId);
        Task UpdateStudentProgressAsync(int lessonStudentId, UpdateProgressDto dto);

        // Работа с балансом
        Task<Account_transaction> TopUpBalanceAsync(int clientId, decimal amount, string paymentMethod);
        Task<IEnumerable<Account_transaction>> GetClientTransactionsAsync(int clientId);
    }
}