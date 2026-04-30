using solexp.Model;

namespace solexp.Services
{
    public interface IClientService
    {
        // Расписание
        Task<IEnumerable<Lesson>> GetScheduleAsync(int courseId);
        Task<IEnumerable<Lesson>> GetAvailableLessonsAsync(int courseId, DateTime? date = null);

        Task<IEnumerable<Student>> GetStudentsByClientIdAsync(int clientId);

        // Запись на занятия
        Task<Lesson_student> EnrollStudentAsync(int clientId, int studentId, int lessonId);
        Task<bool> CancelEnrollmentAsync(int lessonId, int studentId, int clientId);
        Task<IEnumerable<Lesson_student>> GetStudentEnrollmentsAsync(int studentId, int clientId);

        // Визуализация прогресса
        Task<StudentProgressVisualizationDto> GetStudentProgressAsync(int studentId, int clientId);
        Task<IEnumerable<LessonPerformanceDto>> GetStudentPerformanceAsync(int studentId, int clientId);

        // История посещений
        Task<IEnumerable<AttendanceHistoryDto>> GetAttendanceHistoryAsync(int studentId, int clientId);

        // История операций и баланс
        Task<decimal> GetCurrentBalanceAsync(int clientId);
        Task<IEnumerable<Account_transaction>> GetTransactionHistoryAsync(int clientId);

        // Личные данные
        Task<Client?> GetPersonalDataAsync(int clientId);
        Task<Client?> UpdatePersonalDataAsync(int clientId, Client updatedData);
        Task<bool> UpdatePhoneAsync(int clientId, string phoneNumber);
    }
}
