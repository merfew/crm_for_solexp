// import type { 
//   Client, Student, Course, Lesson, LessonAttendance, StudentProgress 
// } from '../types';

// let globalIdCounter = 1;
// const generateId = () => globalIdCounter++;
// // === Клиенты и студенты (без изменений) ===
// export const mockClients: Client[] = [
//   { id_client: 1, full_name: 'Иванов Иван Петрович', phone: '+7-999-111-22-33', email: 'ivanov@example.com' },
//   { id_client: 2, full_name: 'Петрова Мария Сергеевна', phone: '+7-999-444-55-66', email: 'petrova@example.com' },
//   { id_client: 3, full_name: 'Сидоров Алексей Владимирович', phone: '+7-999-777-88-99', email: 'sidorov@example.com' },
// ];

// export const mockStudents: Student[] = [
//   { id_student: 1, id_client: 1, full_name: 'Иванов Артём', birth_date: '2015-03-15' },
//   { id_student: 2, id_client: 1, full_name: 'Иванова София', birth_date: '2017-07-22' },
//   { id_student: 3, id_client: 2, full_name: 'Петров Дмитрий', birth_date: '2014-11-08' },
//   { id_student: 4, id_client: 3, full_name: 'Сидорова Алиса', birth_date: '2016-05-30' },
//   { id_student: 5, id_client: 3, full_name: 'Сидоров Михаил', birth_date: '2018-09-12' },
// ];

// export const mockCourses: Course[] = [
//   { id_course: 1, name: 'Программирование на Scratch', description: 'Основы алгоритмики для детей 7-9 лет', count_lessons: 32 },
//   { id_course: 2, name: 'Python для начинающих', description: 'Первый текстовый язык программирования', count_lessons: 48 },
//   { id_course: 3, name: 'Создание игр в Roblox', description: 'Разработка игр и 3D-моделирование', count_lessons: 36 },
//   { id_course: 4, name: 'Web-дизайн', description: 'Создание сайтов в Tilda и Figma', count_lessons: 24 },
// ];

// // === Новые данные: Расписание занятий ===
// // Генерируем занятия для каждого курса (по 2 в неделю)
// export const mockLessons: Lesson[] = (() => {
//   const lessons: Lesson[] = [];
//   let id_counter = 1;

//   mockCourses.forEach(course => {
//     // Генерируем занятия с января по март 2026 (примерно 12-13 занятий)
//     const startDate = new Date('2026-01-13'); // Пн/Чт или Вт/Пт
    
//     for (let i = 0; i < Math.min(course.count_lessons, 13); i++) {
//       const lessonDate = new Date(startDate);
//       lessonDate.setDate(startDate.getDate() + (i * 3)); // каждые 3 дня ≈ 2 раза в неделю
      
//       lessons.push({
//         id_lesson: id_counter++,
//         id_course: course.id_course,
//         lesson_number: i + 1,
//         date: lessonDate.toISOString().split('T')[0],
//         topic: `${course.name} - Занятие ${i + 1}`
//       });
//     }
//   });
  
//   return lessons;
// })();

// // === Новые данные: Посещаемость по каждому занятию ===
// export const mockAttendance: LessonAttendance[] = [
//   // === Артём (id_student=1) на Scratch (id_course=1) ===
//   // Январь
//   { id_attendance: 1, id_lesson: 1, id_student: 1, attended: true, homework_completed: true, homework_percentage: 100, feedback_score: 4 },
//   { id_attendance: 2, id_lesson: 2, id_student: 1, attended: true, homework_completed: true, homework_percentage: 85, feedback_score: 5 },
//   { id_attendance: 3, id_lesson: 3, id_student: 1, attended: true, homework_completed: false, homework_percentage: 30, feedback_score: 4 },
//   { id_attendance: 4, id_lesson: 4, id_student: 1, attended: false, homework_completed: false, homework_percentage: 0, feedback_score: null },
//   { id_attendance: 5, id_lesson: 5, id_student: 1, attended: true, homework_completed: true, homework_percentage: 100, feedback_score: 5 },
//   { id_attendance: 6, id_lesson: 6, id_student: 1, attended: true, homework_completed: true, homework_percentage: 90, feedback_score: 5 },
//   { id_attendance: 7, id_lesson: 7, id_student: 1, attended: true, homework_completed: true, homework_percentage: 75, feedback_score: 4 },
//   { id_attendance: 8, id_lesson: 8, id_student: 1, attended: true, homework_completed: true, homework_percentage: 100, feedback_score: 5 },
//   { id_attendance: 9, id_lesson: 9, id_student: 1, attended: true, homework_completed: false, homework_percentage: 40, feedback_score: 4 },
//   { id_attendance: 10, id_lesson: 10, id_student: 1, attended: false, homework_completed: false, homework_percentage: 0, feedback_score: null },
//   { id_attendance: 11, id_lesson: 11, id_student: 1, attended: true, homework_completed: true, homework_percentage: 95, feedback_score: 4 },

//   // === София (id_student=2) на Scratch ===
//   { id_attendance: 12, id_lesson: 1, id_student: 2, attended: true, homework_completed: true, homework_percentage: 100, feedback_score: 5 },
//   { id_attendance: 13, id_lesson: 2, id_student: 2, attended: true, homework_completed: true, homework_percentage: 100, feedback_score: 5 },
//   { id_attendance: 14, id_lesson: 3, id_student: 2, attended: true, homework_completed: true, homework_percentage: 100, feedback_score: 5 },
//   { id_attendance: 15, id_lesson: 4, id_student: 2, attended: true, homework_completed: true, homework_percentage: 90, feedback_score: 5 },
//   { id_attendance: 16, id_lesson: 5, id_student: 2, attended: true, homework_completed: true, homework_percentage: 100, feedback_score: 5 },
//   { id_attendance: 17, id_lesson: 6, id_student: 2, attended: true, homework_completed: true, homework_percentage: 95, feedback_score: 5 },
//   { id_attendance: 18, id_lesson: 7, id_student: 2, attended: false, homework_completed: false, homework_percentage: 0, feedback_score: null },
//   { id_attendance: 19, id_lesson: 8, id_student: 2, attended: true, homework_completed: true, homework_percentage: 80, feedback_score: 4 },

//   // === Дмитрий (id_student=3) на Python ===
//   { id_attendance: 20, id_lesson: 14, id_student: 3, attended: true, homework_completed: true, homework_percentage: 100, feedback_score: 4 },
//   { id_attendance: 21, id_lesson: 15, id_student: 3, attended: true, homework_completed: true, homework_percentage: 85, feedback_score: 4 },
//   { id_attendance: 22, id_lesson: 16, id_student: 3, attended: false, homework_completed: false, homework_percentage: 0, feedback_score: null },
//   { id_attendance: 23, id_lesson: 17, id_student: 3, attended: true, homework_completed: true, homework_percentage: 100, feedback_score: 5 },
//   { id_attendance: 24, id_lesson: 18, id_student: 3, attended: true, homework_completed: false, homework_percentage: 60, feedback_score: 4 },
//   { id_attendance: 25, id_lesson: 19, id_student: 3, attended: true, homework_completed: true, homework_percentage: 90, feedback_score: 4 },
//   { id_attendance: 26, id_lesson: 20, id_student: 3, attended: true, homework_completed: true, homework_percentage: 100, feedback_score: 5 },
//   { id_attendance: 27, id_lesson: 21, id_student: 3, attended: true, homework_completed: true, homework_percentage: 95, feedback_score: 5 },
//   { id_attendance: 28, id_lesson: 22, id_student: 3, attended: true, homework_completed: true, homework_percentage: 100, feedback_score: 5 },
//   { id_attendance: 29, id_lesson: 23, id_student: 3, attended: true, homework_completed: true, homework_percentage: 88, feedback_score: 5 },
//   { id_attendance: 30, id_lesson: 24, id_student: 3, attended: true, homework_completed: true, homework_percentage: 92, feedback_score: 5 },

//   // === Алиса (id_student=4) на Roblox ===
//   { id_attendance: 31, id_lesson: 26, id_student: 4, attended: false, homework_completed: false, homework_percentage: 0, feedback_score: null },
//   { id_attendance: 32, id_lesson: 27, id_student: 4, attended: false, homework_completed: false, homework_percentage: 0, feedback_score: null },
//   { id_attendance: 33, id_lesson: 28, id_student: 4, attended: true, homework_completed: false, homework_percentage: 45, feedback_score: 3 },
//   { id_attendance: 34, id_lesson: 29, id_student: 4, attended: true, homework_completed: true, homework_percentage: 80, feedback_score: 4 },
//   { id_attendance: 35, id_lesson: 30, id_student: 4, attended: true, homework_completed: false, homework_percentage: 50, feedback_score: 4 },
//   { id_attendance: 36, id_lesson: 31, id_student: 4, attended: true, homework_completed: true, homework_percentage: 90, feedback_score: 5 },
//   { id_attendance: 37, id_lesson: 32, id_student: 4, attended: true, homework_completed: true, homework_percentage: 85, feedback_score: 4 },
//   { id_attendance: 38, id_lesson: 33, id_student: 4, attended: true, homework_completed: true, homework_percentage: 75, feedback_score: 4 },

//   // === Михаил (id_student=5) на Web-дизайн ===
//   { id_attendance: 39, id_lesson: 38, id_student: 5, attended: true, homework_completed: true, homework_percentage: 100, feedback_score: 5 },
//   { id_attendance: 40, id_lesson: 39, id_student: 5, attended: true, homework_completed: true, homework_percentage: 100, feedback_score: 5 },
//   { id_attendance: 41, id_lesson: 40, id_student: 5, attended: true, homework_completed: true, homework_percentage: 95, feedback_score: 5 },
//   { id_attendance: 42, id_lesson: 41, id_student: 5, attended: true, homework_completed: true, homework_percentage: 100, feedback_score: 5 },
//   { id_attendance: 43, id_lesson: 42, id_student: 5, attended: true, homework_completed: true, homework_percentage: 98, feedback_score: 5 },
//   { id_attendance: 44, id_lesson: 43, id_student: 5, attended: true, homework_completed: true, homework_percentage: 100, feedback_score: 5 },
// ];

// // === Функция для расчёта накопительного прогресса ===
// export const calculateProgress = (
//   studentId: number, 
//   courseId: number,
//   periodStart: string,
//   periodEnd: string
// ): StudentProgress => {
//   // Получаем занятия курса в периоде
//   const courseLessons = mockLessons.filter(
//     l => l.id_course === courseId && 
//          l.date >= periodStart && 
//          l.date <= periodEnd
//   );
  
//   // Получаем посещаемость студента на этих занятиях
//   const attendanceRecords = mockAttendance.filter(
//     a => a.id_student === studentId &&
//          courseLessons.some(l => l.id_lesson === a.id_lesson)
//   );

//   //const lessonsMap = new Map(courseLessons.map(l => [l.id_lesson, l]));
  
//   let attendedCount = 0;
//   let homeworkTotal = 0;
//   let homeworkCompleted = 0;
//   let totalScore = 0;
//   let scoredLessons = 0;

//   attendanceRecords.forEach(record => {
//     if (record.attended) attendedCount++;
//     if (record.homework_completed) homeworkCompleted++;
//     homeworkTotal++; // ДЗ считаем для всех занятий в периоде
    
//     if (record.feedback_score !== null) {
//       totalScore += record.feedback_score;
//       scoredLessons++;
//     }
//   });

//   const lessonsTotal = courseLessons.length;
  
//   return {
//     id_progress: generateId(),
//     id_student: studentId,
//     id_course: courseId,
//     period_start: periodStart,
//     period_end: periodEnd,
//     lessons_total: lessonsTotal,
//     lessons_attended: attendedCount,
//     attendance_rate: lessonsTotal > 0 ? Math.round((attendedCount / lessonsTotal) * 100 * 10) / 10 : 0,
//     homeworks_total: homeworkTotal,
//     homeworks_completed: homeworkCompleted,
//     homework_rate: homeworkTotal > 0 ? Math.round((homeworkCompleted / homeworkTotal) * 100 * 10) / 10 : 0,
//     avg_score_cumulative: scoredLessons > 0 ? Math.round((totalScore / scoredLessons) * 100) / 100 : 0,
//     lessons_with_scores: scoredLessons
//   };
// };

// // === Предварительно рассчитанный прогресс по месяцам ===
// export const mockProgress: StudentProgress[] = [
//   // Артём - Scratch
//   calculateProgress(1, 1, '2026-01-01', '2026-01-31'),
//   calculateProgress(1, 1, '2026-02-01', '2026-02-28'),
//   calculateProgress(1, 1, '2026-03-01', '2026-03-31'),
  
//   // София - Scratch
//   calculateProgress(2, 1, '2026-01-01', '2026-01-31'),
//   calculateProgress(2, 1, '2026-02-01', '2026-02-28'),
  
//   // Дмитрий - Python
//   calculateProgress(3, 2, '2026-01-01', '2026-01-31'),
//   calculateProgress(3, 2, '2026-02-01', '2026-02-28'),
//   calculateProgress(3, 2, '2026-03-01', '2026-03-31'),
  
//   // Алиса - Roblox
//   calculateProgress(4, 3, '2026-01-01', '2026-01-31'),
//   calculateProgress(4, 3, '2026-02-01', '2026-02-28'),
  
//   // Михаил - Web-дизайн
//   calculateProgress(5, 4, '2026-02-01', '2026-02-28'),
// ];

// // === API функции ===
// export const getProgressByStudent = (studentId: number): StudentProgress[] => {
//   return mockProgress.filter(p => p.id_student === studentId);
// };

// export const getProgressByCourse = (courseId: number): StudentProgress[] => {
//   return mockProgress.filter(p => p.id_course === courseId);
// };

// export const getStudentsByClient = (clientId: number) => {
//   return mockStudents.filter(s => s.id_client === clientId);
// };

// export const getCourseInfo = (courseId: number) => {
//   return mockCourses.find(c => c.id_course === courseId);
// };

// // Новые функции для детальных данных
// export const getStudentAttendance = (studentId: number, courseId?: number): LessonAttendance[] => {
//   let records = mockAttendance.filter(a => a.id_student === studentId);
//   if (courseId) {
//     const courseLessonIds = new Set(mockLessons.filter(l => l.id_course === courseId).map(l => l.id_lesson));
//     records = records.filter(a => courseLessonIds.has(a.id_lesson));
//   }
//   return records;
// };

// export const getLessonDetails = (lessonId: number): Lesson | undefined => {
//   return mockLessons.find(l => l.id_lesson === lessonId);
// };

// export const getCourseLessons = (courseId: number): Lesson[] => {
//   return mockLessons.filter(l => l.id_course === courseId);
// };