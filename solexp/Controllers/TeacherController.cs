using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using solexp.Model;
using solexp.Services;
using System.Security.Claims;

namespace solexp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Teacher")]
    public class TeacherController : ControllerBase
    {
        private readonly ITeacherService _teacherService;
        private readonly ILogger<TeacherController> _logger;

        public TeacherController(ITeacherService teacherService, ILogger<TeacherController> logger)
        {
            _teacherService = teacherService;
            _logger = logger;
        }

        // Получаем ID текущего преподавателя из токена/claims
        private int GetCurrentTeacherId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            //var userIdClaim = User.FindFirst("id_user")?.Value
            //    ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            //// Здесь нужна дополнительная логика получения teacherId по userId
            //// Временно предполагаем, что в токене хранится teacherId
            //return int.Parse(User.FindFirst("id_teacher")?.Value ?? "0");
        }

        [HttpGet("courses")]
        public async Task<IActionResult> GetAllCours()
        {
            var courses = await _teacherService.GetAllCoursesAsync();
            return Ok(courses);
        }


        [HttpGet("teachers")]
        public async Task<IActionResult> GetAllTeachers()
        {
            var teachers = await _teacherService.GetAllTeachersAsync();
            return Ok(teachers);
        }

        // ═══════════════════════════════════════════════════════════════
        // РАСПИСАНИЕ
        // ═══════════════════════════════════════════════════════════════

        /// <summary>
        /// Получить личное расписание преподавателя
        /// </summary>
        /// 



        [HttpGet("schedule")]
        public async Task<ActionResult<IEnumerable<Lesson>>> GetPersonalSchedule()
        {
            try
            {
                var teacherId = GetCurrentTeacherId();
                var schedule = await _teacherService.GetPersonalScheduleAsync(teacherId);
                return Ok(schedule);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении расписания");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        /// <summary>
        /// Получить расписание за период
        /// </summary>
        [HttpGet("schedule/range")]
        public async Task<ActionResult<IEnumerable<Lesson>>> GetScheduleByRange(
            [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                var schedule = await _teacherService.GetScheduleByDateRangeAsync(startDate, endDate);
                return Ok(schedule);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении расписания за период");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // ИСТОРИЯ ЗАНЯТИЙ
        // ═══════════════════════════════════════════════════════════════

        /// <summary>
        /// Получить историю проведённых занятий
        /// </summary>
        [HttpGet("history")]
        public async Task<ActionResult<IEnumerable<Lesson>>> GetLessonHistory()
        {
            try
            {
                var teacherId = GetCurrentTeacherId();
                var history = await _teacherService.GetLessonHistoryAsync(teacherId);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении истории занятий");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        ///// <summary>
        ///// Получить детали конкретного занятия
        ///// </summary>
        //[HttpGet("lessons/{lessonId}")]
        //public async Task<ActionResult<Lesson>> GetLessonDetails(int lessonId)
        //{
        //    try
        //    {
        //        var lesson = await _teacherService.GetLessonDetailsAsync(lessonId);
        //        if (lesson == null)
        //            return NotFound("Занятие не найдено");

        //        // Проверка, что это занятие текущего преподавателя
        //        var teacherId = GetCurrentTeacherId();
        //        if (lesson.id_teacher != teacherId)
        //            return Forbid("У вас нет доступа к этому занятию");

        //        return Ok(lesson);
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "Ошибка при получении деталей занятия");
        //        return StatusCode(500, "Внутренняя ошибка сервера");
        //    }
        //}

        // ═══════════════════════════════════════════════════════════════
        // ПОСЕЩАЕМОСТЬ
        // ═══════════════════════════════════════════════════════════════

        /// <summary>
        /// Отметить посещаемость одного ученика
        /// </summary>
        [HttpPost("lessons/{lessonId}/attendance")]
        public async Task<ActionResult> MarkAttendance(int lessonId, [FromBody] MarkAttendanceDto dto)
        {
            try
            {
                // Проверка доступа к занятию
                var lesson = await _teacherService.GetLessonDetailsAsync(lessonId);
                if (lesson == null) return NotFound("Занятие не найдено");

                var teacherId = GetCurrentTeacherId();
                if (lesson.id_teacher != teacherId)
                    return Forbid("У вас нет доступа к этому занятию");

                await _teacherService.MarkAttendanceAsync(lessonId, dto.StudentId, dto.AttendanceStatus);
                return Ok(new { message = "Посещаемость отмечена" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при отметке посещаемости");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        /// <summary>
        /// Массовая отметка посещаемости
        /// </summary>
        [HttpPost("lessons/{lessonId}/attendance/bulk")]
        public async Task<ActionResult> MarkBulkAttendance(int lessonId, [FromBody] BulkAttendanceDto dto)
        {
            try
            {
                var lesson = await _teacherService.GetLessonDetailsAsync(lessonId);
                if (lesson == null) return NotFound("Занятие не найдено");

                var teacherId = GetCurrentTeacherId();
                if (lesson.id_teacher != teacherId)
                    return Forbid("У вас нет доступа к этому занятию");

                await _teacherService.MarkBulkAttendanceAsync(lessonId, dto.AttendanceData);
                return Ok(new { message = "Посещаемость обновлена для всех учеников" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при массовой отметке посещаемости");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // ДОМАШНЕЕ ЗАДАНИЕ И КОММЕНТАРИИ
        // ═══════════════════════════════════════════════════════════════

        /// <summary>
        /// Добавить/обновить домашнее задание к занятию
        /// </summary>
        [HttpPut("lessons/{lessonId}/homework")]
        public async Task<ActionResult> AddHomework(int lessonId, [FromBody] string homework)
        {
            try
            {
                var lesson = await _teacherService.GetLessonDetailsAsync(lessonId);
                if (lesson == null) return NotFound("Занятие не найдено");

                var teacherId = GetCurrentTeacherId();
                if (lesson.id_teacher != teacherId)
                    return Forbid("У вас нет доступа к этому занятию");

                await _teacherService.AddHomeworkAsync(lessonId, homework);
                return Ok(new { message = "Домашнее задание добавлено" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при добавлении домашнего задания");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        /// <summary>
        /// Добавить комментарий к занятию
        /// </summary>
        [HttpPost("lessons/{lessonId}/comment")]
        public async Task<ActionResult> AddComment(int lessonId, [FromBody] string comment)
        {
            try
            {
                var lesson = await _teacherService.GetLessonDetailsAsync(lessonId);
                if (lesson == null) return NotFound("Занятие не найдено");

                var teacherId = GetCurrentTeacherId();
                if (lesson.id_teacher != teacherId)
                    return Forbid("У вас нет доступа к этому занятию");

                await _teacherService.AddCommentAsync(lessonId, comment);
                return Ok(new { message = "Комментарий добавлен" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при добавлении комментария");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        /// <summary>
        /// Обновить описание занятия
        /// </summary>
        [HttpPut("lessons/{lessonId}/description")]
        public async Task<ActionResult> UpdateDescription(int lessonId, [FromBody] string description)
        {
            try
            {
                var lesson = await _teacherService.GetLessonDetailsAsync(lessonId);
                if (lesson == null) return NotFound("Занятие не найдено");

                var teacherId = GetCurrentTeacherId();
                if (lesson.id_teacher != teacherId)
                    return Forbid("У вас нет доступа к этому занятию");

                await _teacherService.UpdateLessonDescriptionAsync(lessonId, description);
                return Ok(new { message = "Описание обновлено" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении описания");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // ОЦЕНКА ДОМАШНЕГО ЗАДАНИЯ
        // ═══════════════════════════════════════════════════════════════

        /// <summary>
        /// Проставить оценку за домашнее задание
        /// </summary>
        [HttpPost("lessons/{lessonId}/grade")]
        public async Task<ActionResult> GradeHomework(int lessonId, [FromBody] GradeHomeworkDto dto)
        {
            try
            {
                var lesson = await _teacherService.GetLessonDetailsAsync(lessonId);
                if (lesson == null) return NotFound("Занятие не найдено");

                var teacherId = GetCurrentTeacherId();
                if (lesson.id_teacher != teacherId)
                    return Forbid("У вас нет доступа к этому занятию");

                await _teacherService.GradeHomeworkAsync(
                    lessonId,
                    dto.StudentId,
                    dto.HomeworkPercent,
                    dto.Score,
                    dto.Feedback);

                return Ok(new { message = "Оценка сохранена" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при оценке домашнего задания");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        // ═══════════════════════════════════════════════════════════════
        // ЛИЧНЫЕ ДАННЫЕ
        // ═══════════════════════════════════════════════════════════════

        /// <summary>
        /// Получить личные данные преподавателя
        /// </summary>
        [HttpGet("profile")]
        public async Task<ActionResult<Teacher>> GetPersonalData()
        {
            try
            {
                var teacherId = GetCurrentTeacherId();
                var teacher = await _teacherService.GetPersonalDataAsync(teacherId);
                if (teacher == null)
                    return NotFound("Преподаватель не найден");

                return Ok(teacher);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении личных данных");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        /// <summary>
        /// Обновить личные данные
        /// </summary>
        [HttpPut("profile")]
        public async Task<ActionResult<Teacher>> UpdatePersonalData([FromBody] UpdateTeacherDataDto dto)
        {
            try
            {
                var teacherId = GetCurrentTeacherId();
                var updatedData = new Teacher
                {
                    full_name = dto.FullName,
                    specialization = dto.Specialization,
                    phone_number = dto.PhoneNumber
                };

                var result = await _teacherService.UpdatePersonalDataAsync(teacherId, updatedData);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении личных данных");
                return StatusCode(500, "Внутренняя ошибка сервера");
            }
        }

        /// <summary>
        /// Обновить только номер телефона
        /// </summary>
        [HttpPatch("profile/phone")]
        public async Task<ActionResult> UpdatePhone([FromBody] string phoneNumber)
        {
            try
            {
                var teacherId = GetCurrentTeacherId();
                await _teacherService.UpdatePhoneAsync(teacherId, phoneNumber);
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

        [HttpGet("lessons/{lessonId}")]
        public async Task<ActionResult<LessonDetailsDto>> GetLessonDetails(int lessonId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized("Пользователь не авторизован");

                // Получаем teacherId через UserService или репозиторий
                // var teacher = await _teacherRepository.GetByUserIdAsync(int.Parse(userIdClaim));

                var result = await _teacherService.GetLessonWithStudentsAsync(lessonId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
