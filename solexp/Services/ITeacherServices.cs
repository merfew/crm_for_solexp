using solexp.Model;

namespace solexp.Services
{
    public interface ITeacherService
    {
        // Расписание
        Task<IEnumerable<Lesson>> GetPersonalScheduleAsync(int teacherId);
        Task<IEnumerable<Lesson>> GetScheduleByDateRangeAsync(int teacherId, DateTime startDate, DateTime endDate);

        // История занятий
        Task<IEnumerable<Lesson>> GetLessonHistoryAsync(int teacherId);
        Task<Lesson?> GetLessonDetailsAsync(int lessonId);

        // Посещаемость
        Task<bool> MarkAttendanceAsync(int lessonId, int studentId, string attendanceStatus);
        Task<bool> MarkBulkAttendanceAsync(int lessonId, Dictionary<int, string> attendanceData);

        // Комментарии и домашнее задание
        Task<bool> AddHomeworkAsync(int lessonId, string homework);
        Task<bool> AddCommentAsync(int lessonId, string comment);
        Task<bool> UpdateLessonDescriptionAsync(int lessonId, string description);

        // Оценка домашнего задания
        Task<bool> GradeHomeworkAsync(int lessonId, int studentId, int homeworkPercent, int? score = null, string? feedback = null);

        // Личные данные
        Task<Teacher?> GetPersonalDataAsync(int teacherId);
        Task<Teacher?> UpdatePersonalDataAsync(int teacherId, Teacher updatedData);
        Task<bool> UpdatePhoneAsync(int teacherId, string phoneNumber);
    }
}
