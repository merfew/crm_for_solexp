using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using solexp.Model;
using solexp.Services;
using System.Security.Claims;

namespace solexp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Client")]
    public class ClientController : ControllerBase
    {
        private readonly IClientService _clientService;
        private readonly ILogger<ClientController> _logger;

        public ClientController(IClientService clientService, ILogger<ClientController> logger)
        {
            _clientService = clientService;
            _logger = logger;
        }

        private int GetCurrentClientId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
        }

        [HttpGet("courses")]
        public async Task<IActionResult> GetAllCours()
        {
            var courses = await _clientService.GetCoursesAsync();
            return Ok(courses);
        }

        [HttpGet("teachers")]
        public async Task<IActionResult> GetAllTeachers()
        {
            var teachers = await _clientService.GetAllTeachersAsync();
            return Ok(teachers);
        }

        // ═══════════════════════════════════════════════════════════════
        // РАСПИСАНИЕ
        // ═══════════════════════════════════════════════════════════════

        [HttpGet("schedule")]
        public async Task<IActionResult> GetSchedule([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var schedule = await _clientService.GetScheduleAsync(startDate, endDate);
            return Ok(schedule);
        }

        [HttpGet("schedule/{courseId}")]
        public async Task<ActionResult<IEnumerable<Lesson>>> GetSchedule(int courseId)
        {
            try
            {
                var schedule = await _clientService.GetScheduleAsync(courseId);
                return Ok(schedule);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении расписания");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        [HttpGet("schedule/{courseId}/available")]
        public async Task<ActionResult<IEnumerable<Lesson>>> GetAvailableLessons(
            int courseId, [FromQuery] DateTime? date)
        {
            try
            {
                var lessons = await _clientService.GetAvailableLessonsAsync(courseId, date);
                return Ok(lessons);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении доступных занятий");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // ЗАПИСЬ НА ЗАНЯТИЯ
        // ═══════════════════════════════════════════════════════════════

        [HttpPost("enroll")]
        public async Task<ActionResult<Lesson_student>> EnrollStudent([FromBody] LessonEnrollmentDto dto)
        {
            try
            {
                var clientId = GetCurrentClientId();
                var enrollment = await _clientService.EnrollStudentAsync(clientId, dto.StudentId, dto.LessonId);
                return CreatedAtAction(
                    nameof(GetStudentEnrollments),
                    new { studentId = dto.StudentId },
                    enrollment);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при записи на занятие");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        [HttpDelete("enroll")]
        public async Task<ActionResult> CancelEnrollment([FromBody] CancelEnrollmentDto dto)
        {
            try
            {
                var clientId = GetCurrentClientId();
                await _clientService.CancelEnrollmentAsync(dto.LessonId, dto.StudentId, clientId);
                return Ok(new { message = "Запись отменена" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при отмене записи");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        [HttpGet("students")]
        public async Task<ActionResult<IEnumerable<Student>>> GetMyStudents()
        {
            try
            {
                var clientId = GetCurrentClientId();
                var students = await _clientService.GetStudentsByClientIdAsync(clientId);
                return Ok(students);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении списка студентов");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        [HttpGet("students/{studentId}/enrollments")]
        public async Task<ActionResult<IEnumerable<Lesson_student>>> GetStudentEnrollments(int studentId)
        {
            try
            {
                var clientId = GetCurrentClientId();
                var enrollments = await _clientService.GetStudentEnrollmentsAsync(studentId, clientId);
                return Ok(enrollments);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении записей");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // ВИЗУАЛИЗАЦИЯ ПРОГРЕССА
        // ═══════════════════════════════════════════════════════════════

        [HttpGet("students/{studentId}/progress")]
        public async Task<ActionResult<StudentProgressDto>> GetStudentProgress(int studentId, int courseId)
        {
            try
            {
                var clientId = GetCurrentClientId();
                var progress = await _clientService.GetStudentProgressAsync(studentId, clientId, courseId);
                return Ok(progress);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении прогресса");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        [HttpGet("students/{studentId}/performance")]
        public async Task<ActionResult<IEnumerable<LessonPerformanceDto>>> GetStudentPerformance(int studentId, int courseId)
        {
            try
            {
                var clientId = GetCurrentClientId();
                var performance = await _clientService.GetStudentPerformanceAsync(studentId, clientId, courseId);
                return Ok(performance);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении успеваемости");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // ИСТОРИЯ ПОСЕЩЕНИЙ
        // ═══════════════════════════════════════════════════════════════

        [HttpGet("students/{studentId}/attendance")]
        public async Task<ActionResult<IEnumerable<AttendanceHistoryDto>>> GetAttendanceHistory(int studentId, int courseId)
        {
            try
            {
                var clientId = GetCurrentClientId();
                var history = await _clientService.GetAttendanceHistoryAsync(studentId, clientId, courseId);
                return Ok(history);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении истории посещений");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // БАЛАНС И ОПЕРАЦИИ
        // ═══════════════════════════════════════════════════════════════

        [HttpGet("balance")]
        public async Task<ActionResult<object>> GetCurrentBalance()
        {
            try
            {
                var clientId = GetCurrentClientId();
                _logger.LogInformation($"Ищем клиента с ID: {clientId}");
                var balance = await _clientService.GetCurrentBalanceAsync(clientId);
                return Ok(new { balance });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении баланса");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        [HttpGet("transactions")]
        public async Task<ActionResult<IEnumerable<Account_transaction>>> GetTransactionHistory()
        {
            try
            {
                var clientId = GetCurrentClientId();
                _logger.LogInformation($"Ищем клиента с ID: {clientId}");
                var transactions = await _clientService.GetTransactionHistoryAsync(clientId);
                return Ok(transactions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении истории операций");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // ЛИЧНЫЕ ДАННЫЕ
        // ═══════════════════════════════════════════════════════════════

        [HttpGet("profile")]
        public async Task<ActionResult<Client>> GetPersonalData()
        {
            try
            {
                var clientId = GetCurrentClientId();
                //_logger.LogInformation($"Ищем клиента с ID: {clientId}");
                var client = await _clientService.GetPersonalDataAsync(clientId);
                if (client == null) return NotFound("Клиент не найден");
                return Ok(client);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении профиля");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        [HttpPut("profile")]
        public async Task<ActionResult<Client>> UpdatePersonalData([FromBody] UpdateClientDataDto dto)
        {
            try
            {
                var clientId = GetCurrentClientId();
                var updatedData = new Client
                {
                    full_name = dto.FullName,
                    phone_number = dto.PhoneNumber
                };
                var result = await _clientService.UpdatePersonalDataAsync(clientId, updatedData);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении профиля");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        [HttpPatch("profile/phone")]
        public async Task<ActionResult> UpdatePhone([FromBody] string phoneNumber)
        {
            try
            {
                var clientId = GetCurrentClientId();
                await _clientService.UpdatePhoneAsync(clientId, phoneNumber);
                return Ok(new { message = "Номер телефона обновлён" });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении телефона");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        [HttpPatch("profile/email")]
        public async Task<ActionResult> UpdateEmail([FromBody] UpdateEmailDto dto)
        {
            try
            {
                var clientId = GetCurrentClientId();
                await _clientService.UpdateEmailAsync(clientId, dto.NewEmail, dto.CurrentPassword);
                return Ok(new { message = "Email успешно обновлён" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении email");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        [HttpPatch("profile/password")]
        public async Task<ActionResult> UpdatePassword([FromBody] UpdatePasswordDto dto)
        {
            try
            {
                var clientId = GetCurrentClientId();
                await _clientService.UpdatePasswordAsync(clientId, dto.CurrentPassword, dto.NewPassword);
                return Ok(new { message = "Пароль успешно обновлён" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении пароля");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }
    }
}
