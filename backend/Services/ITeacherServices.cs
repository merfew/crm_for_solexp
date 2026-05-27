using solexp.Model;

namespace solexp.Services
{
    public interface ITeacherService
    {
        Task<IEnumerable<Cours>> GetAllCoursesAsync();
        Task<IEnumerable<TeacherListItemDto>> GetAllTeachersAsync();
        
        // Расписание
        Task<IEnumerable<Lesson>> GetPersonalScheduleAsync(int teacherId);
        Task<IEnumerable<Lesson>> GetScheduleByDateRangeAsync(DateTime startDate, DateTime endDate);

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
        Task<bool> UpdateLessonStatusAsync(int lessonId, string status);

        // Оценка домашнего задания
        Task<bool> GradeHomeworkAsync(int lessonId, int studentId, int homeworkPercent, int? score = null, string? feedback = null);

        // Личные данные
        Task<TeacherListItemDto?> GetPersonalDataAsync(int teacherId);
        Task<Teacher?> UpdatePersonalDataAsync(int teacherId, Teacher updatedData);
        Task<bool> UpdatePhoneAsync(int teacherId, string phoneNumber);
        Task<bool> UpdateEmailAsync(int teacherId, string newEmail, string currentPassword);
        Task<bool> UpdatePasswordAsync(int teacherId, string currentPassword, string newPassword);

        Task<LessonDetailsDto> GetLessonWithStudentsAsync(int lessonId);
    }
}
