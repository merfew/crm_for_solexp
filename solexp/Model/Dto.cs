using System.ComponentModel.DataAnnotations;

namespace solexp.Model
{
    // Models/DTOs/LoginDto.cs
    public class LoginDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }
    }

    // Models/DTOs/RegisterDto.cs
    public class RegisterDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [MinLength(6)]
        public string Password { get; set; }

        [Required]
        public string RoleName { get; set; } // "Client", "Teacher", "Admin"

        [Required]
        public string Name { get; set; }

        [Required]
        [Phone]
        public string PhoneNumber { get; set; }
    }

    // Models/DTOs/AuthResponseDto.cs
    public class AuthResponseDto
    {
        public string Token { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public string Name { get; set; }
    }

    // Models/DTOs/UserDto.cs
    public class UserDto
    {
        public int IdUser { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public string Name { get; set; }
        public string PhoneNumber { get; set; }
    }

        public class CreateTeacherDto
        {
            public string Email { get; set; }
            public string Password { get; set; }
            public string FullName { get; set; }
            public string PhoneNumber { get; set; }
            public string Specialization { get; set; }
        }

        public class UpdateTeacherDto
        {
            public string? Email { get; set; }
            public string? Password { get; set; }
            public string? FullName { get; set; }
            public string? PhoneNumber { get; set; }
            public string? Specialization { get; set; }
        }

        public class CreateClientDto
        {
            public string Email { get; set; }
            public string Password { get; set; }
            public string FullName { get; set; }
            public string PhoneNumber { get; set; }
            public CreateStudentDto? Student { get; set; }
        }

        public class CreateStudentDto
        {
            public string FullName { get; set; }
            public DateTime? BirthDate { get; set; }
        }

        public class UpdateClientDto
        {
            public string? Email { get; set; }
            public string? Password { get; set; }
            public string? FullName { get; set; }
            public string? PhoneNumber { get; set; }
        }

        public class CreateLessonDto
        {
            public int TeacherId { get; set; }
            public int CourseId { get; set; }
            public DateTime LessonDate { get; set; }
            public int DurationMinutes { get; set; }
            public string Title { get; set; }
            public string? Description { get; set; }
            public string? Homework { get; set; }
            public string? Classroom { get; set; }
        }

        public class UpdateLessonDto
        {
            public DateTime? LessonDate { get; set; }
            public int? DurationMinutes { get; set; }
            public string? Title { get; set; }
            public string? Description { get; set; }
            public string? Homework { get; set; }
            public string? Status { get; set; }
            public string? Classroom { get; set; }
        }

        public class CreateCourseDto
        {
            public string Name { get; set; }
            public string? Description { get; set; }
            public int? CountLesson { get; set; }
            public decimal? PricePerClass { get; set; }
        }

        public class UpdateCourseDto
        {
            public string? Name { get; set; }
            public string? Description { get; set; }
            public int? CountLesson { get; set; }
            public decimal? PricePerClass { get; set; }
        }

        public class UpdateProgressDto
        {
            public string? AttendanceStatus { get; set; }
            public int? HomeworkPercent { get; set; }
            public int? Score { get; set; }
            public string? Feedback { get; set; }
        }

        public class ClientFullInfoDto
        {
            public Client Client { get; set; }
            public IEnumerable<Student> Students { get; set; }
            public IEnumerable<Account_transaction> Transactions { get; set; }
            public IEnumerable<StudentProgressDto> StudentsProgress { get; set; }
            public decimal TotalBalance { get; set; }
        }

        public class StudentProgressDto
        {
            public Student Student { get; set; }
            public IEnumerable<Lesson_student> Lessons { get; set; }
            public int? AverageHomeworkPercent { get; set; }
            public int? AverageScore { get; set; }
            public double AttendanceRate { get; set; }
        }

        public class TeacherFullInfoDto
        {
            public Teacher Teacher { get; set; }
            public IEnumerable<Lesson> PastLessons { get; set; }
            public IEnumerable<Lesson> UpcomingLessons { get; set; }
            public IEnumerable<LessonStatsDto> LessonsWithStats { get; set; }
            public int TotalLessonsCount { get; set; }
        }

        public class LessonStatsDto
        {
            public Lesson Lesson { get; set; }
            public int StudentsCount { get; set; }
            public int PresentCount { get; set; }
            public int? AverageScore { get; set; }
        }

        public class ClientListItemDto
        {
            public int Id { get; set; }
            public string? FullName { get; set; }
            public string? PhoneNumber { get; set; }
            public decimal Balance { get; set; }
            public int StudentsCount { get; set; }
            //public decimal TotalSpent { get; set; }
        }

        public class TeacherListItemDto
        {
            public int Id { get; set; }
            public string? FullName { get; set; }
            public string? Specialization { get; set; }
            public string? PhoneNumber { get; set; }
            public int TotalLessonsCount { get; set; }
            public int UpcomingLessonsCount { get; set; }
        }
        public class EnrollStudentDto
        {
            public int StudentId { get; set; }
        }

        public class TopUpBalanceDto
        {
            public decimal Amount { get; set; }
            public string PaymentMethod { get; set; }
        }

    // DTO для отметки посещаемости
    public class MarkAttendanceDto
    {
        public int StudentId { get; set; }
        public string AttendanceStatus { get; set; } = string.Empty; // present, absent, excused, late
    }

    // DTO для массовой отметки посещаемости
    public class BulkAttendanceDto
    {
        public Dictionary<int, string> AttendanceData { get; set; } = new();
    }

    // DTO для оценки домашнего задания
    public class GradeHomeworkDto
    {
        public int StudentId { get; set; }
        public int HomeworkPercent { get; set; }
        public int? Score { get; set; }
        public string? Feedback { get; set; }
    }

    // DTO для обновления данных преподавателя
    public class UpdateTeacherDataDto
    {
        public string? FullName { get; set; }
        public string? Specialization { get; set; }
        public string? PhoneNumber { get; set; }
    }

    // DTO для фильтра расписания
    public class ScheduleFilterDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }

    // DTO для деталей занятия с учениками
    public class LessonDetailsDto
    {
        public int IdLesson { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateTime? LessonDate { get; set; }
        public string? Classroom { get; set; }
        public string? Homework { get; set; }
        public string? Status { get; set; }
        public List<StudentAttendanceDto> Students { get; set; } = new();
    }

    public class StudentAttendanceDto
    {
        public int IdStudent { get; set; }
        public string? FullName { get; set; }
        public string? AttendanceStatus { get; set; }
        public int? HomeworkPercent { get; set; }
        public int? Score { get; set; }
        public string? Feedback { get; set; }
    }
    // DTO для записи на занятие
    public class LessonEnrollmentDto
    {
        public int StudentId { get; set; }
        public int LessonId { get; set; }
    }

    // DTO для отмены записи
    public class CancelEnrollmentDto
    {
        public int StudentId { get; set; }
        public int LessonId { get; set; }
    }

    // DTO для прогресса ученика
    public class StudentProgressVisualizationDto
    {
        public int IdStudent { get; set; }
        public string? FullName { get; set; }
        public string? CourseName { get; set; }
        public int TotalLessons { get; set; }
        public int CompletedLessons { get; set; }
        public int AttendedLessons { get; set; }
        public double AttendanceRate { get; set; }
        public double AverageHomeworkPercent { get; set; }
        public double AverageScore { get; set; }
        public List<LessonProgressItemDto> LessonHistory { get; set; } = new();
    }

    public class LessonProgressItemDto
    {
        public int IdLesson { get; set; }
        public string? Title { get; set; }
        public DateTime? LessonDate { get; set; }
        public string? AttendanceStatus { get; set; }
        public int? HomeworkPercent { get; set; }
        public int? Score { get; set; }
        public string? Feedback { get; set; }
    }

    // DTO для успеваемости
    public class LessonPerformanceDto
    {
        public int IdLesson { get; set; }
        public string? Title { get; set; }
        public DateTime? LessonDate { get; set; }
        public int? HomeworkPercent { get; set; }
        public int? Score { get; set; }
        public string? TeacherFeedback { get; set; }
    }

    // DTO для истории посещений
    public class AttendanceHistoryDto
    {
        public int IdLesson { get; set; }
        public string? LessonTitle { get; set; }
        public DateTime? LessonDate { get; set; }
        public string? AttendanceStatus { get; set; }
        public string? TeacherName { get; set; }
        public string? Classroom { get; set; }
    }

    // DTO для обновления данных клиента
    public class UpdateClientDataDto
    {
        public string? FullName { get; set; }
        public string? PhoneNumber { get; set; }
    }
}
