using solexp.Model;
using solexp.Repository;

namespace solexp.Services
{
    public class AdminService : IAdminService
    {
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IAdminRepository _adminRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IConfiguration _configuration;

        // Ваши репозитории
        private readonly ITeacherRepository _teacherRepository;
        private readonly IClientRepository _clientRepository;
        private readonly IStudentRepository _studentRepository;
        private readonly ILessonRepository _lessonRepository;
        private readonly ILessonStudentRepository _lessonStudentRepository;
        private readonly ICoursRepository _coursRepository;
        private readonly IAccountTransactionRepository _accountTransactionRepository;

        public AdminService(
            IUserRepository userRepository,
            IRoleRepository roleRepository,
            IAdminRepository adminRepository,
            IPasswordHasher passwordHasher,
            IConfiguration configuration,
            ITeacherRepository teacherRepository,
            IClientRepository clientRepository,
            IStudentRepository studentRepository,
            ILessonRepository lessonRepository,
            ILessonStudentRepository lessonStudentRepository,
            ICoursRepository coursRepository,
            IAccountTransactionRepository accountTransactionRepository)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _adminRepository = adminRepository;
            _passwordHasher = passwordHasher;
            _configuration = configuration;
            _teacherRepository = teacherRepository;
            _clientRepository = clientRepository;
            _studentRepository = studentRepository;
            _lessonRepository = lessonRepository;
            _lessonStudentRepository = lessonStudentRepository;
            _coursRepository = coursRepository;
            _accountTransactionRepository = accountTransactionRepository;
        }

        // ========== ИНИЦИАЛИЗАЦИЯ ==========

        public async Task SeedSuperAdminAsync()
        {
            if (await _adminRepository.AnyAsync())
                return;

            var adminRole = await _roleRepository.GetByNameAsync("Admin");
            if (adminRole == null)
                throw new InvalidOperationException("Роль Admin не найдена");

            var superAdminEmail = _configuration["SuperAdmin:Email"] ?? "superadmin@example.com";
            var superAdminPassword = _configuration["SuperAdmin:Password"] ?? "SuperAdmin123!";

            if (await _userRepository.ExistsByEmailAsync(superAdminEmail))
                return;

            var user = new User
            {
                email = superAdminEmail,
                password = _passwordHasher.Generate(superAdminPassword),
                id_role = adminRole.id_role
            };

            await _userRepository.CreateAsync(user);

            await _adminRepository.CreateAsync(new Admin
            {
                id_user = user.id_user,
                full_name = "Super Administrator",
                phone_number = "+70000000000"
            });
        }

        public async Task<bool> IsAdminAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            var adminRole = await _roleRepository.GetByNameAsync("Admin");
            return user.id_role == adminRole?.id_role;
        }

        // ========== УПРАВЛЕНИЕ УЧЕТНЫМИ ЗАПИСЯМИ ПЕДАГОГОВ ==========

        public async Task<Teacher> CreateTeacherAccountAsync(CreateTeacherDto dto)
        {
            var teacherRole = await _roleRepository.GetByNameAsync("Teacher");
            if (teacherRole == null)
                throw new InvalidOperationException("Роль Teacher не найдена");

            if (await _userRepository.ExistsByEmailAsync(dto.Email))
                throw new InvalidOperationException("Пользователь с таким email уже существует");

            var user = new User
            {
                email = dto.Email,
                password = _passwordHasher.Generate(dto.Password),
                id_role = teacherRole.id_role
            };

            await _userRepository.CreateAsync(user);

            var teacher = new Teacher
            {
                id_user = user.id_user,
                full_name = dto.FullName,
                phone_number = dto.PhoneNumber,
                specialization = dto.Specialization
            };

            await _teacherRepository.CreateAsync(teacher);

            return teacher;
        }

        public async Task UpdateTeacherAccountAsync(int teacherId, UpdateTeacherDto dto)
        {
            var teacher = await _teacherRepository.GetByIdAsync(teacherId);
            if (teacher == null)
                throw new InvalidOperationException("Педагог не найден");

            var user = await _userRepository.GetByIdAsync(teacher.id_user);
            if (!string.IsNullOrEmpty(dto.Email))
                user.email = dto.Email;

            if (!string.IsNullOrEmpty(dto.Password))
                user.password = _passwordHasher.Generate(dto.Password);

            await _userRepository.UpdateAsync(user);

            teacher.full_name = dto.FullName ?? teacher.full_name;
            teacher.phone_number = dto.PhoneNumber ?? teacher.phone_number;
            teacher.specialization = dto.Specialization ?? teacher.specialization;

            await _teacherRepository.UpdateAsync(teacher);
        }

        public async Task DeleteTeacherAccountAsync(int teacherId)
        {
            var teacher = await _teacherRepository.GetByIdAsync(teacherId);
            if (teacher == null)
                throw new InvalidOperationException("Педагог не найден");

            // Проверяем, есть ли у педагога занятия
            var lessons = await _lessonRepository.GetByTeacherIdAsync(teacherId);
            if (lessons.Any())
                throw new InvalidOperationException("Нельзя удалить педагога, у которого есть занятия");

            await _userRepository.DeleteAsync(teacher.id_user);
            await _teacherRepository.DeleteAsync(teacherId);
        }

        // ========== УПРАВЛЕНИЕ УЧЕТНЫМИ ЗАПИСЯМИ КЛИЕНТОВ ==========

        public async Task<Client> CreateClientAccountAsync(CreateClientDto dto)
        {
            var clientRole = await _roleRepository.GetByNameAsync("Client");
            if (clientRole == null)
                throw new InvalidOperationException("Роль Client не найдена");

            if (await _userRepository.ExistsByEmailAsync(dto.Email))
                throw new InvalidOperationException("Пользователь с таким email уже существует");

            var user = new User
            {
                email = dto.Email,
                password = _passwordHasher.Generate(dto.Password),
                id_role = clientRole.id_role
            };

            await _userRepository.CreateAsync(user);

            var client = new Client
            {
                id_user = user.id_user,
                full_name = dto.FullName,
                phone_number = dto.PhoneNumber,
                balance = 0
            };

            await _clientRepository.CreateAsync(client);

            // Если указаны данные студента, создаем его
            if (dto.Student != null && !string.IsNullOrWhiteSpace(dto.Student.FullName) && dto.Student.BirthDate.HasValue)
            {
                var student = new Student
                {
                    id_client = client.id_client,
                    full_name = dto.Student.FullName,
                    birth_date = dto.Student.BirthDate
                };
                await _studentRepository.CreateAsync(student);
            }

            return client;
        }

        public async Task<Student> CreateStudentAsync(int clientId, CreateStudentDto dto)
        {
            var client = await _clientRepository.GetByIdAsync(clientId);
            if (client == null)
                throw new InvalidOperationException("Клиент не найден");
            var student = new Student
            {
                id_client = client.id_client,
                full_name = dto.FullName,
                birth_date = dto.BirthDate
            };
            var createdStudent = await _studentRepository.CreateAsync(student);
            return createdStudent;
        }

        public async Task<Student> UpdateStudentAsync(int studentId, UpdateStudentDto dto)
        {
            var student = await _studentRepository.GetByIdAsync(studentId);
            if (student == null)
                throw new KeyNotFoundException("Студент не найден");
            student.full_name = dto.FullName;
            student.birth_date = dto.BirthDate;
            return await _studentRepository.UpdateAsync(student);
        }

        public async Task DeleteStudentAsync(int studentId)
        {
            var student = await _studentRepository.GetByIdAsync(studentId);
            if (student == null)
                throw new KeyNotFoundException("Студент не найден");
            await _studentRepository.DeleteAsync(studentId);
        }

        public async Task<IEnumerable<Student>> GetAllStudentsAsync()
        {
            return await _studentRepository.GetAllAsync();
        }

        public async Task<StudentProgressVisualizationDto> GetStudentProgressForAdminAsync(int studentId, int courseId)
        {
            var student = await _studentRepository.GetByIdAsync(studentId);
            if (student == null)
                throw new KeyNotFoundException("Студент не найден");

            var records = await _lessonStudentRepository.GetByStudentIdAsync(studentId);
            var lessons = new List<Lesson>();

            foreach (var record in records)
            {
                var lesson = await _lessonRepository.GetByIdAsync(record.id_lesson);
                if (lesson != null && lesson.id_course == courseId)
                    lessons.Add(lesson);
            }

            var courseLessonIds = lessons.Select(l => l.id_lesson).ToHashSet();
            var courseRecords = records.Where(r => courseLessonIds.Contains(r.id_lesson)).ToList();

            var attended = courseRecords.Count(r => r.attendance_status == "present" || r.attendance_status == "late");
            var completedLessons = lessons.Count(l => l.status == "completed");

            var avgHomework = courseRecords.Where(r => r.homework_percent.HasValue).Any()
                ? courseRecords.Where(r => r.homework_percent.HasValue).Average(r => r.homework_percent.Value) : 0;
            var avgScore = courseRecords.Where(r => r.score.HasValue).Any()
                ? courseRecords.Where(r => r.score.HasValue).Average(r => r.score.Value) : 0;

            var totalLessons = 0;
            var courseName = "Не указан";
            var course = await _coursRepository.GetByIdAsync(courseId);
            if (course != null) { courseName = course.name; totalLessons = (int)course.count_lesson; }

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

        public async Task<IEnumerable<LessonPerformanceDto>> GetStudentPerformanceForAdminAsync(int studentId, int courseId)
        {
            var student = await _studentRepository.GetByIdAsync(studentId);
            if (student == null)
                throw new KeyNotFoundException("Студент не найден");

            var records = await _lessonStudentRepository.GetByStudentIdAsync(studentId);
            var result = new List<LessonPerformanceDto>();

            foreach (var record in records.OrderByDescending(r => r.created_at))
            {
                var lesson = await _lessonRepository.GetByIdAsync(record.id_lesson);
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

        public async Task<IEnumerable<AttendanceHistoryDto>> GetAttendanceHistoryForAdminAsync(int studentId, int courseId)
        {
            var student = await _studentRepository.GetByIdAsync(studentId);
            if (student == null)
                throw new KeyNotFoundException("Студент не найден");

            var records = await _lessonStudentRepository.GetByStudentIdAsync(studentId);
            var result = new List<AttendanceHistoryDto>();

            foreach (var record in records.OrderByDescending(r => r.created_at))
            {
                var lesson = await _lessonRepository.GetByIdAsync(record.id_lesson);
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

        public async Task UpdateClientAccountAsync(int clientId, UpdateClientDto dto)
        {
            var client = await _clientRepository.GetByIdAsync(clientId);
            if (client == null)
                throw new InvalidOperationException("Клиент не найден");

            var user = await _userRepository.GetByIdAsync(client.id_user);
            if (!string.IsNullOrEmpty(dto.Email))
                user.email = dto.Email;

            if (!string.IsNullOrEmpty(dto.Password))
                user.password = _passwordHasher.Generate(dto.Password);

            await _userRepository.UpdateAsync(user);

            client.full_name = dto.FullName ?? client.full_name;
            client.phone_number = dto.PhoneNumber ?? client.phone_number;

            await _clientRepository.UpdateAsync(client);
        }

        public async Task DeleteClientAccountAsync(int clientId)
        {
            var client = await _clientRepository.GetByIdAsync(clientId);
            if (client == null)
                throw new InvalidOperationException("Клиент не найден");

            // Проверяем, есть ли у клиента студенты
            var students = await _studentRepository.GetByClientIdAsync(clientId);
            if (students.Any())
                throw new InvalidOperationException("Нельзя удалить клиента, у которого есть студенты");

            await _userRepository.DeleteAsync(client.id_user);
            await _clientRepository.DeleteAsync(clientId);
        }

        // ========== ПРОСМОТР ИНФОРМАЦИИ ПО КЛИЕНТАМ ==========

        public async Task<ClientFullInfoDto> GetClientFullInfoAsync(int clientId)
        {
            var client = await _clientRepository.GetByIdAsync(clientId);
            if (client == null)
                throw new InvalidOperationException("Клиент не найден");

            var students = await _studentRepository.GetByClientIdAsync(clientId);
            var transactions = await _accountTransactionRepository.GetByClientIdAsync(clientId);

            // Получаем информацию о посещениях и прогрессе всех студентов клиента
            var allStudentsProgress = new List<StudentProgressDto>();
            foreach (var student in students)
            {
                var lessons = await _lessonStudentRepository.GetByStudentIdAsync(student.id_student);
                var progress = new StudentProgressDto
                {
                    Student = student,
                    Lessons = lessons,
                    AverageHomeworkPercent = lessons.Any() ? (int?)lessons.Average(l => l.homework_percent) : null,
                    AverageScore = lessons.Any() ? (int?)lessons.Average(l => l.score) : null,
                    AttendanceRate = lessons.Any() ?
                        (double)lessons.Count(l => l.attendance_status == "Present") / lessons.Count() * 100 : 0
                };
                allStudentsProgress.Add(progress);
            }

            return new ClientFullInfoDto
            {
                Client = client,
                Students = students,
                Transactions = transactions,
                StudentsProgress = allStudentsProgress,
                TotalBalance = client.balance
            };
        }

        public async Task<IEnumerable<ClientListItemDto>> GetAllClientsAsync()
        {
            var clients = await _clientRepository.GetAllAsync();
            var result = new List<ClientListItemDto>();

            foreach (var client in clients)
            {
                var students = await _studentRepository.GetByClientIdAsync(client.id_client);
                result.Add(new ClientListItemDto
                {
                    Id = client.id_client,
                    FullName = client.full_name,
                    PhoneNumber = client.phone_number,
                    Balance = client.balance,
                    StudentsCount = students.Count(),
                    //TotalSpent = await _accountTransactionRepository.GetTotalSpentByClientIdAsync(client.id_client)
                });
            }

            return result;
        }

        // ========== ПРОСМОТР ИНФОРМАЦИИ ПО ПЕДАГОГАМ ==========

        public async Task<TeacherFullInfoDto> GetTeacherFullInfoAsync(int teacherId)
        {
            var teacher = await _teacherRepository.GetByIdAsync(teacherId);
            if (teacher == null)
                throw new InvalidOperationException("Педагог не найден");

            var allLessons = await _lessonRepository.GetByTeacherIdAsync(teacherId);

            var pastLessons = allLessons.Where(l => l.lesson_date < DateTime.Now).ToList();
            var upcomingLessons = allLessons.Where(l => l.lesson_date >= DateTime.Now).ToList();

            // Получаем статистику по каждому занятию
            var lessonsWithStats = new List<LessonStatsDto>();
            foreach (var lesson in allLessons)
            {
                var students = await _lessonStudentRepository.GetByLessonIdAsync(lesson.id_lesson);
                lessonsWithStats.Add(new LessonStatsDto
                {
                    Lesson = lesson,
                    StudentsCount = students.Count(),
                    PresentCount = students.Count(s => s.attendance_status == "Present"),
                    AverageScore = students.Any() ? (int?)students.Average(s => s.score) : null
                });
            }

            return new TeacherFullInfoDto
            {
                Teacher = teacher,
                PastLessons = pastLessons,
                UpcomingLessons = upcomingLessons,
                LessonsWithStats = lessonsWithStats,
                TotalLessonsCount = allLessons.Count()
            };
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

        // ========== УПРАВЛЕНИЕ РАСПИСАНИЕМ (ЗАНЯТИЯМИ) ==========

        public async Task<Lesson> GetLessonAsync(int lessonId)
        {
            var lesson = await _lessonRepository.GetByIdAsync(lessonId);
            return lesson;
        }

        public async Task<LessonDetailsDto> GetLessonStudentsAsync(int lessonId)
        {
            var lesson = await _lessonRepository.GetByIdAsync(lessonId);
            if (lesson == null)
                throw new KeyNotFoundException("Занятие не найдено");

            var lessonStudents = await _lessonStudentRepository.GetByLessonIdAsync(lessonId);
            var studentList = new List<StudentAttendanceDto>();

            foreach (var ls in lessonStudents)
            {
                var student = await _studentRepository.GetByIdAsync(ls.id_student);
                studentList.Add(new StudentAttendanceDto
                {
                    IdStudent = ls.id_student,
                    FullName = student?.full_name ?? $"Студент #{ls.id_student}",
                    AttendanceStatus = ls.attendance_status,
                    HomeworkPercent = ls.homework_percent,
                    Score = ls.score,
                    Feedback = ls.feedback
                });
            }

            return new LessonDetailsDto
            {
                IdLesson = lesson.id_lesson,
                Title = lesson.title,
                Description = lesson.description,
                LessonDate = lesson.lesson_date,
                Classroom = lesson.classroom,
                Homework = lesson.homework,
                Status = lesson.status,
                Students = studentList
            };
        }

        public async Task<Lesson> CreateLessonAsync(CreateLessonDto dto)
        {
            var teacher = await _teacherRepository.GetByIdAsync(dto.TeacherId);
            if (teacher == null)
                throw new InvalidOperationException("Педагог не найден");

            var course = await _coursRepository.GetByIdAsync(dto.CourseId);
            if (course == null)
                throw new InvalidOperationException("Курс не найден");

            // Проверяем, нет ли пересечения по времени у педагога
            //var hasConflict = await _lessonRepository.CheckTeacherConflictAsync(
            //    dto.TeacherId, dto.LessonDate, dto.DurationMinutes);

            //if (hasConflict)
            //    throw new InvalidOperationException("У педагога уже есть занятие в это время");

            var lesson = new Lesson
            {
                id_teacher = dto.TeacherId,
                id_course = dto.CourseId,
                lesson_date = dto.LessonDate,
                duration_min = dto.DurationMinutes,
                number_in_course = dto.NumberInCourse,
                title = dto.Title,
                description = dto.Description,
                homework = dto.Homework,
                status = "Scheduled",
                classroom = dto.Classroom
            };

            await _lessonRepository.CreateAsync(lesson);

            return lesson;
        }

        public async Task UpdateLessonAsync(int lessonId, UpdateLessonDto dto)
        {
            var lesson = await _lessonRepository.GetByIdAsync(lessonId);
            if (lesson == null)
                throw new InvalidOperationException("Занятие не найдено");

            // Если меняется время, проверяем конфликты
            if (dto.LessonDate.HasValue || dto.DurationMinutes.HasValue)
            {
                var newDate = dto.LessonDate ?? lesson.lesson_date.Value;
                var newDuration = dto.DurationMinutes ?? lesson.duration_min.Value;

                //var hasConflict = await _lessonRepository.CheckTeacherConflictExcludingSelfAsync(
                //    lessonId, lesson.id_teacher, newDate, newDuration);

                //if (hasConflict)
                //    throw new InvalidOperationException("У педагога уже есть занятие в это время");
            }

            lesson.lesson_date = dto.LessonDate ?? lesson.lesson_date;
            lesson.duration_min = dto.DurationMinutes ?? lesson.duration_min;
            lesson.number_in_course = dto.NumberInCourse ?? lesson.number_in_course;
            lesson.title = dto.Title ?? lesson.title;
            lesson.description = dto.Description ?? lesson.description;
            lesson.homework = dto.Homework ?? lesson.homework;
            lesson.status = dto.Status ?? lesson.status;
            lesson.classroom = dto.Classroom ?? lesson.classroom;

            await _lessonRepository.UpdateAsync(lesson);
        }

        public async Task DeleteLessonAsync(int lessonId)
        {
            var lesson = await _lessonRepository.GetByIdAsync(lessonId);
            if (lesson == null)
                throw new InvalidOperationException("Занятие не найдено");

            // Проверяем, есть ли записи студентов на это занятие
            var students = await _lessonStudentRepository.GetByLessonIdAsync(lessonId);
            if (students.Any())
                throw new InvalidOperationException("Нельзя удалить занятие, на которое записаны студенты");

            await _lessonRepository.DeleteAsync(lessonId);
        }

        public async Task<IEnumerable<Lesson>> GetScheduleAsync(DateTime? startDate = null, DateTime? endDate = null)
        {
            var lessons = await _lessonRepository.GetAllAsync();

            if (startDate.HasValue)
                lessons = lessons.Where(l => l.lesson_date >= startDate.Value);

            if (endDate.HasValue)
                lessons = lessons.Where(l => l.lesson_date <= endDate.Value);

            return lessons.OrderBy(l => l.lesson_date);
        }

        // ========== УПРАВЛЕНИЕ КУРСАМИ ==========

        public async Task<Cours> CreateCourseAsync(CreateCourseDto dto)
        {
            var course = new Cours
            {
                name = dto.Name,
                description = dto.Description,
                count_lesson = dto.CountLesson,
                price_per_class = dto.PricePerClass
            };

            await _coursRepository.CreateAsync(course);

            return course;
        }

        public async Task UpdateCourseAsync(int courseId, UpdateCourseDto dto)
        {
            var course = await _coursRepository.GetByIdAsync(courseId);
            if (course == null)
                throw new InvalidOperationException("Курс не найден");

            course.name = dto.Name ?? course.name;
            course.description = dto.Description ?? course.description;
            course.count_lesson = dto.CountLesson ?? course.count_lesson;
            course.price_per_class = dto.PricePerClass ?? course.price_per_class;

            await _coursRepository.UpdateAsync(course);
        }

        public async Task DeleteCourseAsync(int courseId)
        {
            var course = await _coursRepository.GetByIdAsync(courseId);
            if (course == null)
                throw new InvalidOperationException("Курс не найден");

            // Проверяем, есть ли занятия по этому курсу
            var lessons = await _lessonRepository.GetByCourseIdAsync(courseId);
            if (lessons.Any())
                throw new InvalidOperationException("Нельзя удалить курс, по которому есть занятия");

            await _coursRepository.DeleteAsync(courseId);
        }

        public async Task<IEnumerable<Cours>> GetAllCoursesAsync()
        {
            return await _coursRepository.GetAllAsync();
        }

        // ========== ЗАПИСЬ СТУДЕНТОВ НА ЗАНЯТИЯ ==========

        public async Task<Lesson_student> EnrollStudentToLessonAsync(int lessonId, int studentId)
        {
            var lesson = await _lessonRepository.GetByIdAsync(lessonId);
            if (lesson == null)
                throw new InvalidOperationException("Занятие не найдено");

            var student = await _studentRepository.GetByIdAsync(studentId);
            if (student == null)
                throw new InvalidOperationException("Студент не найден");

            var lessonStudent = new Lesson_student
            {
                id_lesson = lessonId,
                id_student = studentId,
                attendance_status = "Pending",
                homework_percent = 0,
                score = 0,
                created_at = DateTime.UtcNow
            };

            await _lessonStudentRepository.CreateAsync(lessonStudent);

            return lessonStudent;
        }

        public async Task UpdateStudentProgressAsync(int lessonStudentId, UpdateProgressDto dto)
        {
            var lessonStudent = await _lessonStudentRepository.GetByIdAsync(lessonStudentId);
            if (lessonStudent == null)
                throw new InvalidOperationException("Запись на занятие не найдена");

            var previousStatus = lessonStudent.attendance_status;
            var newStatus = dto.AttendanceStatus ?? previousStatus;

            lessonStudent.attendance_status = dto.AttendanceStatus ?? lessonStudent.attendance_status;
            lessonStudent.homework_percent = dto.HomeworkPercent ?? lessonStudent.homework_percent;
            lessonStudent.score = dto.Score ?? lessonStudent.score;
            lessonStudent.feedback = dto.Feedback ?? lessonStudent.feedback;

            await _lessonStudentRepository.UpdateAsync(lessonStudent);

            // Списание при первой отметке "присутствовал"
            if (newStatus == "present" && previousStatus != "present")
            {
                var student = await _studentRepository.GetByIdAsync(lessonStudent.id_student);
                var client = student != null ? await _clientRepository.GetByIdAsync(student.id_client) : null;
                var lesson = await _lessonRepository.GetByIdAsync(lessonStudent.id_lesson);
                var course = lesson != null ? await _coursRepository.GetByIdAsync(lesson.id_course) : null;
                var price = course?.price_per_class ?? 0;

                if (client != null && price > 0)
                {
                    client.balance -= price;
                    await _clientRepository.UpdateAsync(client);

                    var lessonTitle = lesson?.title ?? $"Занятие №{lesson?.number_in_course}";
                    var dateStr = lesson?.lesson_date?.ToString("dd.MM.yyyy") ?? "—";

                    await _accountTransactionRepository.CreateAsync(new Account_transaction
                    {
                        id_client = client.id_client,
                        id_lesson_student = lessonStudentId,
                        type = "LessonDeduction",
                        amount = -price,
                        payment_method = "Auto",
                        description = $"{lessonTitle} от {dateStr}",
                        transaction_date = DateTime.UtcNow
                    });
                }
            }
            // Возврат при смене статуса с "присутствовал" на другой
            else if (previousStatus == "present" && newStatus != "present")
            {
                var existingTx = await _accountTransactionRepository.GetByLessonStudentIdAsync(lessonStudentId);
                if (existingTx != null)
                {
                    var student = await _studentRepository.GetByIdAsync(lessonStudent.id_student);
                    var client = student != null ? await _clientRepository.GetByIdAsync(student.id_client) : null;
                    if (client != null)
                    {
                        client.balance += Math.Abs(existingTx.amount);
                        await _clientRepository.UpdateAsync(client);
                    }
                    await _accountTransactionRepository.DeleteAsync(existingTx.id_transaction);
                }
            }
        }

        // ========== РАБОТА С БАЛАНСОМ ==========

        public async Task<Account_transaction> TopUpBalanceAsync(int clientId, decimal amount, string paymentMethod)
        {
            var client = await _clientRepository.GetByIdAsync(clientId);
            if (client == null)
                throw new InvalidOperationException("Клиент не найден");

            client.balance += amount;
            await _clientRepository.UpdateAsync(client);

            var transaction = new Account_transaction
            {
                id_client = clientId,
                type = "Deposit",
                amount = amount,
                payment_method = paymentMethod,
                description = "Пополнение баланса",
                transaction_date = DateTime.UtcNow
            };

            await _accountTransactionRepository.CreateAsync(transaction);

            return transaction;
        }

        public async Task<IEnumerable<Account_transaction>> GetClientTransactionsAsync(int clientId)
        {
            return await _accountTransactionRepository.GetByClientIdAsync(clientId);
        }

        public async Task<AdminProfileDto> GetAdminProfileAsync(int adminId)
        {
            var admin = await _adminRepository.GetByIdAsync(adminId);
            if (admin == null)
                throw new KeyNotFoundException("Администратор не найден");

            var user = await _userRepository.GetByIdAsync(admin.id_user);

            return new AdminProfileDto
            {
                IdAdmin = admin.id_admin,
                FullName = admin.full_name,
                PhoneNumber = admin.phone_number,
                Email = user?.email
            };
        }

        public async Task<AdminProfileDto> UpdateAdminProfileAsync(int adminId, UpdateAdminDataDto dto)
        {
            var admin = await _adminRepository.GetByIdAsync(adminId);
            if (admin == null)
                throw new KeyNotFoundException("Администратор не найден");

            admin.full_name = dto.FullName ?? admin.full_name;
            admin.phone_number = dto.PhoneNumber ?? admin.phone_number;
            await _adminRepository.UpdateAsync(admin);

            var user = await _userRepository.GetByIdAsync(admin.id_user);
            return new AdminProfileDto
            {
                IdAdmin = admin.id_admin,
                FullName = admin.full_name,
                PhoneNumber = admin.phone_number,
                Email = user?.email
            };
        }

        public async Task<bool> UpdateAdminEmailAsync(int adminId, string newEmail, string currentPassword)
        {
            var admin = await _adminRepository.GetByIdAsync(adminId);
            if (admin == null)
                throw new KeyNotFoundException("Администратор не найден");

            var user = await _userRepository.GetByIdAsync(admin.id_user);
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

        public async Task<bool> UpdateAdminPasswordAsync(int adminId, string currentPassword, string newPassword)
        {
            var admin = await _adminRepository.GetByIdAsync(adminId);
            if (admin == null)
                throw new KeyNotFoundException("Администратор не найден");

            var user = await _userRepository.GetByIdAsync(admin.id_user);
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