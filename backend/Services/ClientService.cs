using solexp.Model;
using solexp.Repository;
using System.Net.WebSockets;

namespace solexp.Services
{
    public class ClientService : IClientService
    {
        private readonly ILessonRepository _lessonRepository;
        private readonly ILessonStudentRepository _lessonStudentRepository;
        private readonly IStudentRepository _studentRepository;
        private readonly IClientRepository _clientRepository;
        private readonly IAccountTransactionRepository _accountTransactionRepository;
        private readonly ICoursRepository _coursRepository;
        private readonly ITeacherRepository _teacherRepository;
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;

        public ClientService(
            ILessonRepository lessonRepository,
            ILessonStudentRepository lessonStudentRepository,
            IStudentRepository studentRepository,
            IClientRepository clientRepository,
            IAccountTransactionRepository accountTransactionRepository,
            ICoursRepository coursRepository,
            ITeacherRepository teacherRepository,
            IUserRepository userRepository,
            IPasswordHasher passwordHasher)
        {
            _lessonRepository = lessonRepository;
            _lessonStudentRepository = lessonStudentRepository;
            _studentRepository = studentRepository;
            _clientRepository = clientRepository;
            _accountTransactionRepository = accountTransactionRepository;
            _coursRepository = coursRepository;
            _teacherRepository = teacherRepository;
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
        }

        // ═══════════════════════════════════════════════════════════════
        // РАСПИСАНИЕ ЗАНЯТИЙ
        // ═══════════════════════════════════════════════════════════════

        public async Task<IEnumerable<Lesson>> GetScheduleAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
            var lessons = await _lessonRepository.GetAllAsync();

            if (startDate.HasValue)
                lessons = lessons.Where(l => l.lesson_date >= startDate.Value);

            if (endDate.HasValue)
                lessons = lessons.Where(l => l.lesson_date <= endDate.Value);

            return lessons.OrderBy(l => l.lesson_date);
        }

        public async Task<IEnumerable<Lesson>> GetScheduleAsync(int courseId)
        {
            var lessons = await _lessonRepository.GetByCourseIdAsync(courseId);
            return lessons
                //.Where(l => l.lesson_date >= DateTime.Now.Date)
                .OrderBy(l => l.lesson_date);
        }

        public async Task<IEnumerable<Lesson>> GetAvailableLessonsAsync(int courseId, DateTime? date = null)
        {
            var lessons = await _lessonRepository.GetByCourseIdAsync(courseId);
            var query = lessons.Where(l => l.lesson_date >= DateTime.Now.Date && l.status != "cancelled");

            if (date.HasValue)
                query = query.Where(l => l.lesson_date?.Date == date.Value.Date);

            return query.OrderBy(l => l.lesson_date);
        }

        // ═══════════════════════════════════════════════════════════════
        // ОНЛАЙН ЗАПИСЬ НА ЗАНЯТИЯ
        // ═══════════════════════════════════════════════════════════════

        public async Task<Lesson_student> EnrollStudentAsync(int clientId, int studentId, int lessonId)
        {
            // Проверяем, что ученик принадлежит клиенту
            var student = await _studentRepository.GetByIdAsync(studentId);
            if (student == null || student.id_client != clientId)
                throw new UnauthorizedAccessException("Ученик не найден или не принадлежит данному клиенту");

            // Проверяем существование занятия
            var lesson = await _lessonRepository.GetByIdAsync(lessonId);
            if (lesson == null)
                throw new KeyNotFoundException("Занятие не найдено");

            // Проверяем, что занятие в будущем
            if (lesson.lesson_date < DateTime.Now.Date)
                throw new InvalidOperationException("Нельзя записаться на прошедшее занятие");

            // Проверяем, не записан ли уже
            var existingRecords = await _lessonStudentRepository.GetByLessonIdAsync(lessonId);
            if (existingRecords.Any(r => r.id_student == studentId))
                throw new InvalidOperationException("Ученик уже записан на это занятие");

            var enrollment = new Lesson_student
            {
                id_lesson = lessonId,
                id_student = studentId,
                attendance_status = "enrolled",
                created_at = DateTime.UtcNow
            };

            return await _lessonStudentRepository.CreateAsync(enrollment);
        }

        public async Task<bool> CancelEnrollmentAsync(int lessonId, int studentId, int clientId)
        {
            // Проверяем принадлежность ученика клиенту
            var student = await _studentRepository.GetByIdAsync(studentId);
            if (student == null || student.id_client != clientId)
                throw new UnauthorizedAccessException("Ученик не найден или не принадлежит данному клиенту");

            // Находим запись
            var records = await _lessonStudentRepository.GetByLessonIdAsync(lessonId);
            var record = records.FirstOrDefault(r => r.id_student == studentId);

            if (record == null)
                throw new KeyNotFoundException("Запись на занятие не найдена");

            // Проверяем, что занятие ещё не прошло
            var lesson = await _lessonRepository.GetByIdAsync(lessonId);
            if (lesson?.lesson_date < DateTime.Now.Date)
                throw new InvalidOperationException("Нельзя отменить запись на прошедшее занятие");

            await _lessonStudentRepository.DeleteAsync(record.id_lesson_student);
            return true;
        }

        public async Task<IEnumerable<Lesson_student>> GetStudentEnrollmentsAsync(int studentId, int clientId)
        {
            // Проверяем принадлежность
            var student = await _studentRepository.GetByIdAsync(studentId);
            if (student == null || student.id_client != clientId)
                throw new UnauthorizedAccessException("Ученик не найден или не принадлежит данному клиенту");

            return await _lessonStudentRepository.GetByStudentIdAsync(studentId);
        }

        // ═══════════════════════════════════════════════════════════════
        // ПОЛУЧЕНИЕ КУРСОВ
        // ═══════════════════════════════════════════════════════════════

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

        public async Task<IEnumerable<Cours>> GetCoursesAsync()
        {
            return await _coursRepository.GetAllAsync();
        }

        // ═══════════════════════════════════════════════════════════════
        // ПОЛУЧЕНИЕ СТУДЕНТОВ КЛИЕНТА
        // ═══════════════════════════════════════════════════════════════

        public async Task<IEnumerable<Student>> GetStudentsByClientIdAsync(int clientId)
        {
            return await _studentRepository.GetByClientIdAsync(clientId);
        }

        // ═══════════════════════════════════════════════════════════════
        // МОДУЛЬ ВИЗУАЛИЗАЦИИ ПРОГРЕССА
        // ═══════════════════════════════════════════════════════════════

        public async Task<StudentProgressVisualizationDto> GetStudentProgressAsync(int studentId, int clientId, int courseId)
        {
            // Проверяем принадлежность ученика клиенту
            var student = await _studentRepository.GetByIdAsync(studentId);
            if (student == null || student.id_client != clientId)
                throw new UnauthorizedAccessException("Ученик не найден или не принадлежит данному клиенту");

            // Получаем все записи студента
            var records = await _lessonStudentRepository.GetByStudentIdAsync(studentId);
            var lessons = new List<Lesson>();

            // Собираем уроки и фильтруем по курсу
            foreach (var record in records)
            {
                var lesson = await _lessonRepository.GetByIdAsync(record.id_lesson);
                if (lesson != null && lesson.id_course == courseId)
                {
                    lessons.Add(lesson);
                }
            }

            // Фильтруем records - оставляем только те, которые относятся к урокам из нужного курса
            var courseLessonIds = lessons.Select(l => l.id_lesson).ToHashSet();
            var courseRecords = records.Where(r => courseLessonIds.Contains(r.id_lesson)).ToList();

            // Считаем статистику только по урокам курса
            var attended = courseRecords.Count(r => r.attendance_status == "present" || r.attendance_status == "late");
            var completedLessons = lessons.Count(l => l.status == "completed");

            var avgHomework = courseRecords.Where(r => r.homework_percent.HasValue).Any()
                ? courseRecords.Where(r => r.homework_percent.HasValue).Average(r => r.homework_percent.Value)
                : 0;

            var avgScore = courseRecords.Where(r => r.score.HasValue).Any()
                ? courseRecords.Where(r => r.score.HasValue).Average(r => r.score.Value)
                : 0;

            // Получаем информацию о курсе
            var courseName = "Не указан";
            var totalLessons = 0;
            var course = await _coursRepository.GetByIdAsync(courseId);
            if (course != null)
            {
                courseName = course.name;
                totalLessons = (int)course.count_lesson;
            }

            // Формируем историю уроков только по курсу
            var lessonHistory = new List<LessonProgressItemDto>();
            foreach (var record in courseRecords.OrderByDescending(r => r.created_at))
            {
                var lesson = lessons.FirstOrDefault(l => l.id_lesson == record.id_lesson);
                lessonHistory.Add(new LessonProgressItemDto
                {
                    IdLesson = record.id_lesson,
                    Title = lesson?.title,
                    LessonDate = lesson?.lesson_date,
                    AttendanceStatus = record.attendance_status,
                    HomeworkPercent = record.homework_percent,
                    Score = record.score,
                    Feedback = record.feedback
                });
            }

            return new StudentProgressVisualizationDto
            {
                IdStudent = studentId,
                FullName = student.full_name,
                CourseName = courseName,
                TotalLessons = totalLessons,
                CompletedLessons = completedLessons,
                AttendedLessons = attended,
                AttendanceRate = totalLessons > 0 ? (double)attended / totalLessons * 100 : 0,
                AverageHomeworkPercent = avgHomework,
                AverageScore = avgScore,
                LessonHistory = lessonHistory
            };
        }

        public async Task<IEnumerable<LessonPerformanceDto>> GetStudentPerformanceAsync(int studentId, int clientId, int courseId)
        {
            // Проверяем принадлежность
            var student = await _studentRepository.GetByIdAsync(studentId);
            if (student == null || student.id_client != clientId)
                throw new UnauthorizedAccessException("Ученик не найден или не принадлежит данному клиенту");

            var records = await _lessonStudentRepository.GetByStudentIdAsync(studentId);
            var result = new List<LessonPerformanceDto>();

            foreach (var record in records.OrderByDescending(r => r.created_at))
            {
                var lesson = await _lessonRepository.GetByIdAsync(record.id_lesson);
                // Фильтруем только уроки из указанного курса
                if (lesson == null || lesson.id_course != courseId) continue;

                result.Add(new LessonPerformanceDto
                {
                    IdLesson = record.id_lesson,
                    Title = lesson.title,
                    LessonDate = lesson.lesson_date,
                    HomeworkPercent = record.homework_percent,
                    Score = record.score,
                    TeacherFeedback = record.feedback
                });
            }

            return result;
        }

        // ═══════════════════════════════════════════════════════════════
        // ИСТОРИЯ ПОСЕЩЕНИЙ
        // ═══════════════════════════════════════════════════════════════

        public async Task<IEnumerable<AttendanceHistoryDto>> GetAttendanceHistoryAsync(int studentId, int clientId, int courseId)
        {
            // Проверяем принадлежность
            var student = await _studentRepository.GetByIdAsync(studentId);
            if (student == null || student.id_client != clientId)
                throw new UnauthorizedAccessException("Ученик не найден или не принадлежит данному клиенту");

            var records = await _lessonStudentRepository.GetByStudentIdAsync(studentId);
            var result = new List<AttendanceHistoryDto>();

            foreach (var record in records.OrderByDescending(r => r.created_at))
            {
                var lesson = await _lessonRepository.GetByIdAsync(record.id_lesson);
                // Фильтруем только уроки из указанного курса
                if (lesson == null || lesson.id_course != courseId) continue;

                var teacher = await _teacherRepository.GetByIdAsync(lesson.id_teacher);

                result.Add(new AttendanceHistoryDto
                {
                    IdLesson = record.id_lesson,
                    LessonTitle = lesson.title,
                    LessonDate = lesson.lesson_date,
                    AttendanceStatus = record.attendance_status,
                    TeacherName = teacher?.full_name,
                    Classroom = lesson.classroom
                });
            }

            return result;
        }

        // ═══════════════════════════════════════════════════════════════
        // ИСТОРИЯ ОПЕРАЦИЙ И ТЕКУЩИЙ БАЛАНС
        // ═══════════════════════════════════════════════════════════════

        public async Task<decimal> GetCurrentBalanceAsync(int clientId)
        {
            // Считаем баланс из всех транзакций клиента
            var transactions = await _accountTransactionRepository.GetByClientIdAsync(clientId);

            decimal balance = 0;
            foreach (var transaction in transactions)
            {
                // Предполагаем, что тип "payment" — пополнение, "charge" — списание
                if (transaction.type?.ToLower() == "payment" || transaction.type?.ToLower() == "deposit")
                    balance += transaction.amount;
                else if (transaction.type?.ToLower() == "charge" || transaction.type?.ToLower() == "withdrawal")
                    balance -= transaction.amount;
            }

            return balance;
        }

        public async Task<IEnumerable<Account_transaction>> GetTransactionHistoryAsync(int clientId)
        {
            var transactions = await _accountTransactionRepository.GetByClientIdAsync(clientId);
            return transactions.OrderByDescending(t => t.transaction_date);
        }

        // ═══════════════════════════════════════════════════════════════
        // ЛИЧНЫЕ ДАННЫЕ
        // ═══════════════════════════════════════════════════════════════

        public async Task<Client?> GetPersonalDataAsync(int clientId)
        {
            return await _clientRepository.GetByIdAsync(clientId);
        }

        public async Task<Client?> UpdatePersonalDataAsync(int clientId, Client updatedData)
        {
            var client = await _clientRepository.GetByIdAsync(clientId);
            if (client == null)
                throw new KeyNotFoundException("Клиент не найден");

            client.full_name = updatedData.full_name ?? client.full_name;
            client.phone_number = updatedData.phone_number ?? client.phone_number;

            return await _clientRepository.UpdateAsync(client);
        }

        public async Task<bool> UpdatePhoneAsync(int clientId, string phoneNumber)
        {
            var client = await _clientRepository.GetByIdAsync(clientId);
            if (client == null)
                throw new KeyNotFoundException("Клиент не найден");

            client.phone_number = phoneNumber;
            await _clientRepository.UpdateAsync(client);
            return true;
        }

        public async Task<bool> UpdateEmailAsync(int clientId, string newEmail, string currentPassword)
        {
            var client = await _clientRepository.GetByIdAsync(clientId);
            if (client == null)
                throw new KeyNotFoundException("Клиент не найден");

            var user = await _userRepository.GetByIdAsync(client.id_user);
            if (user == null)
                throw new KeyNotFoundException("Пользователь не найден");

            if (!_passwordHasher.Verify(currentPassword, user.password))
                throw new UnauthorizedAccessException("Неверный пароль");

            if (await _userRepository.ExistsByEmailAsync(newEmail))
                throw new InvalidOperationException("Этот email уже используется");

            user.email = newEmail;
            await _userRepository.UpdateAsync(user);
            return true;
        }

        public async Task<bool> UpdatePasswordAsync(int clientId, string currentPassword, string newPassword)
        {
            var client = await _clientRepository.GetByIdAsync(clientId);
            if (client == null)
                throw new KeyNotFoundException("Клиент не найден");

            var user = await _userRepository.GetByIdAsync(client.id_user);
            if (user == null)
                throw new KeyNotFoundException("Пользователь не найден");

            if (!_passwordHasher.Verify(currentPassword, user.password))
                throw new UnauthorizedAccessException("Неверный текущий пароль");

            user.password = _passwordHasher.Generate(newPassword);
            await _userRepository.UpdateAsync(user);
            return true;
        }
    }
}
