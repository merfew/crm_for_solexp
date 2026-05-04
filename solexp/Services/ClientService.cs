using solexp.Model;
using solexp.Repository;

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

        public ClientService(
            ILessonRepository lessonRepository,
            ILessonStudentRepository lessonStudentRepository,
            IStudentRepository studentRepository,
            IClientRepository clientRepository,
            IAccountTransactionRepository accountTransactionRepository,
            ICoursRepository coursRepository,
            ITeacherRepository teacherRepository)
        {
            _lessonRepository = lessonRepository;
            _lessonStudentRepository = lessonStudentRepository;
            _studentRepository = studentRepository;
            _clientRepository = clientRepository;
            _accountTransactionRepository = accountTransactionRepository;
            _coursRepository = coursRepository;
            _teacherRepository = teacherRepository;
        }

        // ═══════════════════════════════════════════════════════════════
        // РАСПИСАНИЕ ЗАНЯТИЙ
        // ═══════════════════════════════════════════════════════════════

        public async Task<IEnumerable<Lesson>> GetScheduleAsync(int courseId)
        {
            var lessons = await _lessonRepository.GetByCourseIdAsync(courseId);
            return lessons
                .Where(l => l.lesson_date >= DateTime.Now.Date)
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

        public async Task<StudentProgressVisualizationDto> GetStudentProgressAsync(int studentId, int clientId)
        {
            // Проверяем принадлежность ученика клиенту
            var student = await _studentRepository.GetByIdAsync(studentId);
            if (student == null || student.id_client != clientId)
                throw new UnauthorizedAccessException("Ученик не найден или не принадлежит данному клиенту");

            var records = await _lessonStudentRepository.GetByStudentIdAsync(studentId);
            var lessons = new List<Lesson>();

            foreach (var record in records)
            {
                var lesson = await _lessonRepository.GetByIdAsync(record.id_lesson);
                if (lesson != null) lessons.Add(lesson);
            }

            var attended = records.Count(r => r.attendance_status == "present" || r.attendance_status == "late");
            var totalLessons = lessons.Count;
            var completedLessons = lessons.Count(l => l.lesson_date < DateTime.Now.Date);

            var avgHomework = records.Where(r => r.homework_percent.HasValue).Any()
                ? records.Where(r => r.homework_percent.HasValue).Average(r => r.homework_percent.Value)
                : 0;

            var avgScore = records.Where(r => r.score.HasValue).Any()
                ? records.Where(r => r.score.HasValue).Average(r => r.score.Value)
                : 0;

            // Определяем курс (берём из первого занятия)
            var courseName = "Не указан";
            if (lessons.Any())
            {
                var course = await _coursRepository.GetByIdAsync(lessons.First().id_course);
                if (course != null) courseName = course.name;
            }

            var lessonHistory = new List<LessonProgressItemDto>();
            foreach (var record in records.OrderByDescending(r => r.created_at))
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

        public async Task<IEnumerable<LessonPerformanceDto>> GetStudentPerformanceAsync(int studentId, int clientId)
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
                if (lesson == null) continue;

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

        public async Task<IEnumerable<AttendanceHistoryDto>> GetAttendanceHistoryAsync(int studentId, int clientId)
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
                if (lesson == null) continue;

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
    }
}
