using solexp.Model;
using solexp.Repository;

namespace solexp.Services
{
    public class TeacherService : ITeacherService
    {
        private readonly ILessonRepository _lessonRepository;
        private readonly ILessonStudentRepository _lessonStudentRepository;
        private readonly ITeacherRepository _teacherRepository;
        private readonly IStudentRepository _studentRepository;
        private readonly IUserRepository _userRepository;
        private readonly ICoursRepository _coursRepository;

        public TeacherService(
            ILessonRepository lessonRepository,
            ILessonStudentRepository lessonStudentRepository,
            ITeacherRepository teacherRepository,
            IStudentRepository studentRepository,
            IUserRepository userRepository,
            ICoursRepository coursRepository)
        {
            _lessonRepository = lessonRepository;
            _lessonStudentRepository = lessonStudentRepository;
            _teacherRepository = teacherRepository;
            _studentRepository = studentRepository;
            _userRepository = userRepository;
            _coursRepository = coursRepository;
        }

        // ═══════════════════════════════════════════════════════════════
        // Курс Педагого
        // ═══════════════════════════════════════════════════════════════

        public async Task<IEnumerable<Cours>> GetAllCoursesAsync()
        {
            return await _coursRepository.GetAllAsync();
        }

        public async Task<IEnumerable<TeacherListItemDto>> GetAllTeachersAsync()
        {
            var teachers = await _teacherRepository.GetAllAsync();
            var result = new List<TeacherListItemDto>();

            foreach (var teacher in teachers)
            {
                var lessons = await _lessonRepository.GetByTeacherIdAsync(teacher.id_teacher);
                result.Add(new TeacherListItemDto
                {
                    Id = teacher.id_teacher,
                    FullName = teacher.full_name,
                    Specialization = teacher.specialization,
                    PhoneNumber = teacher.phone_number,
                    TotalLessonsCount = lessons.Count(),
                    UpcomingLessonsCount = lessons.Count(l => l.lesson_date >= DateTime.Now)
                });
            }

            return result;
        }

        // ═══════════════════════════════════════════════════════════════
        // РАСПИСАНИЕ
        // ═══════════════════════════════════════════════════════════════

        public async Task<IEnumerable<Lesson>> GetPersonalScheduleAsync(int teacherId)
        {
            var lessons = await _lessonRepository.GetByTeacherIdAsync(teacherId);
            return lessons
                .Where(l => l.lesson_date >= DateTime.Now.Date)
                .OrderBy(l => l.lesson_date);
        }

        public async Task<IEnumerable<Lesson>> GetScheduleByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            //var lessons = await _lessonRepository.GetByTeacherIdAsync(teacherId);
            var lessons = await _lessonRepository.GetAllAsync();
            return lessons
                .Where(l => l.lesson_date >= startDate && l.lesson_date <= endDate)
                .OrderBy(l => l.lesson_date);
        }

        // ═══════════════════════════════════════════════════════════════
        // ИСТОРИЯ ЗАНЯТИЙ
        // ═══════════════════════════════════════════════════════════════

        public async Task<IEnumerable<Lesson>> GetLessonHistoryAsync(int teacherId)
        {
            var lessons = await _lessonRepository.GetByTeacherIdAsync(teacherId);
            return lessons
                .Where(l => l.lesson_date < DateTime.Now.Date || l.status == "completed")
                .OrderByDescending(l => l.lesson_date);
        }

        public async Task<Lesson?> GetLessonDetailsAsync(int lessonId)
        {
            return await _lessonRepository.GetByIdAsync(lessonId);
        }

        // ═══════════════════════════════════════════════════════════════
        // ПОСЕЩАЕМОСТЬ
        // ═══════════════════════════════════════════════════════════════

        public async Task<bool> MarkAttendanceAsync(int lessonId, int studentId, string attendanceStatus)
        {
            var validStatuses = new[] { "present", "absent", "excused", "late" };
            if (!validStatuses.Contains(attendanceStatus.ToLower()))
                throw new ArgumentException("Недопустимый статус посещаемости");

            var lesson = await _lessonRepository.GetByIdAsync(lessonId);
            if (lesson == null)
                throw new KeyNotFoundException("Занятие не найдено");

            var records = await _lessonStudentRepository.GetByLessonIdAsync(lessonId);
            var record = records.FirstOrDefault(r => r.id_student == studentId);

            if (record != null)
            {
                record.attendance_status = attendanceStatus.ToLower();
                await _lessonStudentRepository.UpdateAsync(record);
            }
            else
            {
                var newRecord = new Lesson_student
                {
                    id_lesson = lessonId,
                    id_student = studentId,
                    attendance_status = attendanceStatus.ToLower(),
                    created_at = DateTime.UtcNow
                };
                await _lessonStudentRepository.CreateAsync(newRecord);
            }

            return true;
        }

        public async Task<bool> MarkBulkAttendanceAsync(int lessonId, Dictionary<int, string> attendanceData)
        {
            var lesson = await _lessonRepository.GetByIdAsync(lessonId);
            if (lesson == null)
                throw new KeyNotFoundException("Занятие не найдено");

            foreach (var (studentId, status) in attendanceData)
            {
                await MarkAttendanceAsync(lessonId, studentId, status);
            }

            return true;
        }

        // ═══════════════════════════════════════════════════════════════
        // КОММЕНТАРИИ И ДОМАШНЕЕ ЗАДАНИЕ
        // ═══════════════════════════════════════════════════════════════

        public async Task<bool> AddHomeworkAsync(int lessonId, string homework)
        {
            var lesson = await _lessonRepository.GetByIdAsync(lessonId);
            if (lesson == null)
                throw new KeyNotFoundException("Занятие не найдено");

            lesson.homework = homework;
            await _lessonRepository.UpdateAsync(lesson);
            return true;
        }

        public async Task<bool> AddCommentAsync(int lessonId, string comment)
        {
            var lesson = await _lessonRepository.GetByIdAsync(lessonId);
            if (lesson == null)
                throw new KeyNotFoundException("Занятие не найдено");

            // Добавляем комментарий к описанию или создаём отдельное поле
            // Вариант 1: добавляем к существующему описанию
            var timestamp = DateTime.Now.ToString("dd.MM.yyyy HH:mm");
            var commentBlock = $"\n\n[Комментарий {timestamp}]: {comment}";
            lesson.description = (lesson.description ?? "") + commentBlock;

            await _lessonRepository.UpdateAsync(lesson);
            return true;
        }

        public async Task<bool> UpdateLessonDescriptionAsync(int lessonId, string description)
        {
            var lesson = await _lessonRepository.GetByIdAsync(lessonId);
            if (lesson == null)
                throw new KeyNotFoundException("Занятие не найдено");

            lesson.description = description;
            await _lessonRepository.UpdateAsync(lesson);
            return true;
        }

        // ═══════════════════════════════════════════════════════════════
        // ОЦЕНКА ДОМАШНЕГО ЗАДАНИЯ
        // ═══════════════════════════════════════════════════════════════

        public async Task<bool> GradeHomeworkAsync(
            int lessonId, int studentId, int homeworkPercent, int? score = null, string? feedback = null)
        {
            if (homeworkPercent < 0 || homeworkPercent > 100)
                throw new ArgumentException("Процент выполнения должен быть от 0 до 100");

            var lesson = await _lessonRepository.GetByIdAsync(lessonId);
            if (lesson == null)
                throw new KeyNotFoundException("Занятие не найдено");

            var records = await _lessonStudentRepository.GetByLessonIdAsync(lessonId);
            var record = records.FirstOrDefault(r => r.id_student == studentId);

            if (record != null)
            {
                record.homework_percent = homeworkPercent;
                if (score.HasValue) record.score = score.Value;
                if (feedback != null) record.feedback = feedback;
                await _lessonStudentRepository.UpdateAsync(record);
            }
            else
            {
                var newRecord = new Lesson_student
                {
                    id_lesson = lessonId,
                    id_student = studentId,
                    homework_percent = homeworkPercent,
                    score = score,
                    feedback = feedback,
                    attendance_status = "present", // по умолчанию
                    created_at = DateTime.UtcNow
                };
                await _lessonStudentRepository.CreateAsync(newRecord);
            }

            return true;
        }

        // ═══════════════════════════════════════════════════════════════
        // ЛИЧНЫЕ ДАННЫЕ
        // ═══════════════════════════════════════════════════════════════

        public async Task<TeacherListItemDto?> GetPersonalDataAsync(int teacherId)
        {
            //return await _teacherRepository.GetByIdAsync(teacherId);
            var teacher = await _teacherRepository.GetByIdAsync(teacherId);
            var lessons = await _lessonRepository.GetByTeacherIdAsync(teacherId);
            return new TeacherListItemDto
            {
                Id = teacher.id_teacher,
                FullName = teacher.full_name,
                Specialization = teacher.specialization,
                PhoneNumber = teacher.phone_number,
                TotalLessonsCount = lessons.Count(),
                UpcomingLessonsCount = lessons.Count(l => l.lesson_date >= DateTime.Now)
            };
        }

        public async Task<Teacher?> UpdatePersonalDataAsync(int teacherId, Teacher updatedData)
        {
            var teacher = await _teacherRepository.GetByIdAsync(teacherId);
            if (teacher == null)
                throw new KeyNotFoundException("Преподаватель не найден");

            // Обновляем только разрешённые поля
            teacher.full_name = updatedData.full_name ?? teacher.full_name;
            teacher.specialization = updatedData.specialization ?? teacher.specialization;
            teacher.phone_number = updatedData.phone_number ?? teacher.phone_number;

            return await _teacherRepository.UpdateAsync(teacher);
        }

        public async Task<bool> UpdatePhoneAsync(int teacherId, string phoneNumber)
        {
            var teacher = await _teacherRepository.GetByIdAsync(teacherId);
            if (teacher == null)
                throw new KeyNotFoundException("Преподаватель не найден");

            teacher.phone_number = phoneNumber;
            await _teacherRepository.UpdateAsync(teacher);
            return true;
        }

        /// <summary>
        /// Получить детальную информацию о занятии со списком студентов и их именами
        /// </summary>
        public async Task<LessonDetailsDto> GetLessonWithStudentsAsync(int lessonId)
        {
            var lesson = await _lessonRepository.GetByIdAsync(lessonId);
            if (lesson == null)
                throw new KeyNotFoundException("Занятие не найдено");

            var lessonStudents = await _lessonStudentRepository.GetByLessonIdAsync(lessonId);

            var studentAttendanceList = new List<StudentAttendanceDto>();

            foreach (var ls in lessonStudents)
            {
                var student = await _studentRepository.GetByIdAsync(ls.id_student);

                studentAttendanceList.Add(new StudentAttendanceDto
                {
                    IdStudent = ls.id_student,
                    FullName = student?.full_name ?? $"Студент #{ls.id_student}",
                    AttendanceStatus = ls.attendance_status,
                    HomeworkPercent = ls.homework_percent,
                    Score = ls.score,
                    Feedback = ls.feedback
                });
            }

            var result = new LessonDetailsDto
            {
                IdLesson = lesson.id_lesson,
                Title = lesson.title,
                Description = lesson.description,
                LessonDate = lesson.lesson_date,
                Classroom = lesson.classroom,
                Homework = lesson.homework,
                Status = lesson.status,
                Students = studentAttendanceList
            };

            return result;
        }
    }
}
