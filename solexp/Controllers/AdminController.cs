using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using solexp.Model;
using solexp.Repository;
using solexp.Services;

namespace solexp.Controllers
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IAdminService _adminService;

        public AdminController(
            IUserRepository userRepository,
            IRoleRepository roleRepository,
            IAdminService adminService)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _adminService = adminService;
        }

        // ========== БАЗОВЫЕ МЕТОДЫ ==========

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userRepository.GetAllAsync();
            return Ok(users);
        }

        [HttpGet("roles")]
        [AllowAnonymous]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _roleRepository.GetAllAsync();
            return Ok(roles.Select(r => new { r.id_role, r.role_name }));
        }

        [HttpGet("check-admin/{userId}")]
        public async Task<IActionResult> CheckAdmin(int userId)
        {
            var isAdmin = await _adminService.IsAdminAsync(userId);
            return Ok(new { isAdmin });
        }

        // ========== УПРАВЛЕНИЕ ПЕДАГОГАМИ ==========

        [HttpPost("teachers")]
        public async Task<IActionResult> CreateTeacher([FromBody] CreateTeacherDto dto)
        {
            try
            {
                var teacher = await _adminService.CreateTeacherAccountAsync(dto);
                return Ok(new { message = "Педагог успешно создан", teacher });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPatch("teachers/{teacherId}")]
        public async Task<IActionResult> UpdateTeacher(int teacherId, [FromBody] UpdateTeacherDto dto)
        {
            try
            {
                await _adminService.UpdateTeacherAccountAsync(teacherId, dto);
                return Ok(new { message = "Данные педагога обновлены" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("teachers/{teacherId}")]
        public async Task<IActionResult> DeleteTeacher(int teacherId)
        {
            try
            {
                await _adminService.DeleteTeacherAccountAsync(teacherId);
                return Ok(new { message = "Педагог успешно удален" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("teachers")]
        public async Task<IActionResult> GetAllTeachers()
        {
            var teachers = await _adminService.GetAllTeachersAsync();
            return Ok(teachers);
        }

        [HttpGet("teachers/{teacherId}/full-info")]
        public async Task<IActionResult> GetTeacherFullInfo(int teacherId)
        {
            try
            {
                var info = await _adminService.GetTeacherFullInfoAsync(teacherId);
                return Ok(info);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        // ========== УПРАВЛЕНИЕ КЛИЕНТАМИ ==========

        [HttpPost("clients")]
        public async Task<IActionResult> CreateClient([FromBody] CreateClientDto dto)
        {
            try
            {
                var client = await _adminService.CreateClientAccountAsync(dto);
                return Ok(new { message = "Клиент успешно создан", client });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("clients/{clientId}")]
        public async Task<IActionResult> UpdateClient(int clientId, [FromBody] UpdateClientDto dto)
        {
            try
            {
                await _adminService.UpdateClientAccountAsync(clientId, dto);
                return Ok(new { message = "Данные клиента обновлены" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("clients/{clientId}")]
        public async Task<IActionResult> DeleteClient(int clientId)
        {
            try
            {
                await _adminService.DeleteClientAccountAsync(clientId);
                return Ok(new { message = "Клиент успешно удален" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("clients")]
        public async Task<IActionResult> GetAllClients()
        {
            var clients = await _adminService.GetAllClientsAsync();
            return Ok(clients);
        }

        [HttpGet("clients/{clientId}/full-info")]
        public async Task<IActionResult> GetClientFullInfo(int clientId)
        {
            try
            {
                var info = await _adminService.GetClientFullInfoAsync(clientId);
                return Ok(info);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }


        [HttpPost("clients/{clientId}/students")]
        public async Task<ActionResult<Student>> CreateStudentForClient(
        int clientId,
        [FromBody] CreateStudentDto dto)
        {
            try
            {

                // Создаем студента для указанного клиента
                var student = await _adminService.CreateStudentAsync(clientId, dto);

                return Ok(student);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // ========== УПРАВЛЕНИЕ КУРСАМИ ==========

        [HttpGet("courses")]
        public async Task<IActionResult> GetAllCours()
        {
            var courses = await _adminService.GetAllCoursesAsync();
            return Ok(courses);
        }

        [HttpPost("courses")]
        public async Task<IActionResult> CreateCourse([FromBody] CreateCourseDto dto)
        {
            try
            {
                var course = await _adminService.CreateCourseAsync(dto);
                return Ok(new { message = "Курс успешно создан", course });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("courses/{courseId}")]
        public async Task<IActionResult> UpdateCourse(int courseId, [FromBody] UpdateCourseDto dto)
        {
            try
            {
                await _adminService.UpdateCourseAsync(courseId, dto);
                return Ok(new { message = "Курс успешно обновлен" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("courses/{courseId}")]
        public async Task<IActionResult> DeleteCourse(int courseId)
        {
            try
            {
                await _adminService.DeleteCourseAsync(courseId);
                return Ok(new { message = "Курс успешно удален" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        //[HttpGet("courses")]
        //public async Task<IActionResult> GetAllCourses([FromQuery] bool includeInactive = false)
        //{
        //    var courses = await _adminService.GetAllCoursesAsync(includeInactive);
        //    return Ok(courses);
        //}

        // ========== УПРАВЛЕНИЕ РАСПИСАНИЕМ (ЗАНЯТИЯМИ) ==========

        [HttpPost("lessons")]
        public async Task<IActionResult> CreateLesson([FromBody] CreateLessonDto dto)
        {
            try
            {
                var lesson = await _adminService.CreateLessonAsync(dto);
                return Ok(new { message = "Занятие успешно создано", lesson });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("lessons/{lessonId}")]
        public async Task<IActionResult> UpdateLesson(int lessonId, [FromBody] UpdateLessonDto dto)
        {
            try
            {
                await _adminService.UpdateLessonAsync(lessonId, dto);
                return Ok(new { message = "Занятие успешно обновлено" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("lessons/{lessonId}")]
        public async Task<IActionResult> DeleteLesson(int lessonId)
        {
            try
            {
                await _adminService.DeleteLessonAsync(lessonId);
                return Ok(new { message = "Занятие успешно удалено" });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("schedule")]
        public async Task<IActionResult> GetSchedule([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var schedule = await _adminService.GetScheduleAsync(startDate, endDate);
            return Ok(schedule);
        }

        // ========== ЗАПИСЬ СТУДЕНТОВ И ПРОГРЕСС ==========

        [HttpPost("lessons/{lessonId}/enroll")]
        public async Task<IActionResult> EnrollStudent(int lessonId, [FromBody] EnrollStudentDto dto)
        {
            try
            {
                var enrollment = await _adminService.EnrollStudentToLessonAsync(lessonId, dto.StudentId);
                return Ok(new { message = "Студент успешно записан на занятие", enrollment });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPut("lesson-students/{lessonStudentId}/progress")]
        public async Task<IActionResult> UpdateStudentProgress(int lessonStudentId, [FromBody] UpdateProgressDto dto)
        {
            try
            {
                await _adminService.UpdateStudentProgressAsync(lessonStudentId, dto);
                return Ok(new { message = "Прогресс студента обновлен" });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        // ========== РАБОТА С БАЛАНСОМ ==========

        [HttpPost("clients/{clientId}/topup")]
        public async Task<IActionResult> TopUpBalance(int clientId, [FromBody] TopUpBalanceDto dto)
        {
            try
            {
                var transaction = await _adminService.TopUpBalanceAsync(clientId, dto.Amount, dto.PaymentMethod);
                return Ok(new { message = "Баланс успешно пополнен", transaction });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpGet("clients/{clientId}/transactions")]
        public async Task<IActionResult> GetClientTransactions(int clientId)
        {
            try
            {
                var transactions = await _adminService.GetClientTransactionsAsync(clientId);
                return Ok(transactions);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
        }

        // ========== СТАТИСТИКА И ОТЧЕТЫ ==========

        [HttpGet("statistics/dashboard")]
        public async Task<IActionResult> GetDashboardStatistics()
        {
            var stats = new
            {
                TotalTeachers = (await _adminService.GetAllTeachersAsync()).Count(),
                TotalClients = (await _adminService.GetAllClientsAsync()).Count(),
                TotalCourses = (await _adminService.GetAllCoursesAsync()).Count(),
                UpcomingLessons = (await _adminService.GetScheduleAsync(DateTime.Now, DateTime.Now.AddDays(7))).Count(),
                // Добавьте другие статистические данные по необходимости
            };
            return Ok(stats);
        }

        [HttpGet("reports/teacher-performance")]
        public async Task<IActionResult> GetTeacherPerformanceReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var teachers = await _adminService.GetAllTeachersAsync();
            var report = new List<object>();

            foreach (var teacher in teachers)
            {
                var fullInfo = await _adminService.GetTeacherFullInfoAsync(teacher.Id);
                report.Add(new
                {
                    Teacher = teacher,
                    TotalLessons = fullInfo.TotalLessonsCount,
                    CompletedLessons = fullInfo.PastLessons.Count(),
                    UpcomingLessons = fullInfo.UpcomingLessons.Count(),
                    AverageStudentsPerLesson = fullInfo.LessonsWithStats.Any() ?
                        fullInfo.LessonsWithStats.Average(l => l.StudentsCount) : 0
                });
            }

            return Ok(report);
        }

        [HttpGet("reports/financial")]
        public async Task<IActionResult> GetFinancialReport([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var clients = await _adminService.GetAllClientsAsync();
            var totalBalance = clients.Sum(c => c.Balance);
            var totalTopups = 0m;
            var totalSpent = 0m;

            foreach (var client in clients)
            {
                var transactions = await _adminService.GetClientTransactionsAsync(client.Id);
                totalTopups += transactions.Where(t => t.type == "Deposit").Sum(t => t.amount);
                totalSpent += transactions.Where(t => t.type == "LessonPayment").Sum(t => Math.Abs(t.amount));
            }

            return Ok(new
            {
                TotalBalance = totalBalance,
                TotalTopups = totalTopups,
                TotalSpent = totalSpent,
                ActiveClientsCount = clients.Count(c => c.Balance > 0)
            });
        }
    }
}