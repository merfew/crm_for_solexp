// src/types/api.ts

// === Auth ===
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  roleName: string;
  name: string;
  phoneNumber: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  role: string;        // "Client" | "Teacher" | "Admin"
  name: string;
  userId: number;
}

export type UserRole = 'admin' | 'client' | 'teacher';

export interface User {
  id: number;          // nameidentifier из JWT
  email: string;
  fullName: string;
  role: UserRole;
  entityId?: number;   // userdata из JWT (id_client / id_teacher)
}

// === Entities ===
// export interface Teacher {
//   id_teacher: number;
//   id_user: number;
//   phone_number?: string;
//   full_name?: string;
//   specialization?: string;
// }
export interface Teacher {
  id: number;              // ← было id_teacher
  fullName: string;        // ← было full_name
  specialization: string | null;
  phoneNumber: string | null;  // ← было phone_number
  totalLessonsCount: number;
  upcomingLessonsCount: number;
}

export interface Client {
  id_client: number;
  id_user: number;
  phone_number?: string;
  full_name?: string;
  balance: number;
}

export interface Student {
  id_student: number;
  id_client: number;
  full_name?: string;
  birth_date?: string;
}

export interface Course {
  id_cours: number;
  name?: string;
  description?: string;
  count_lesson?: number;  
  price_per_class?: number; 
}

export interface Lesson {
  id_lesson: number;
  id_teacher: number;
  id_course: number;
  lesson_date?: string;
  duration_min?: number;
  number_in_course?: number;
  title?: string;
  description?: string;
  homework?: string;
  status?: string;
  classroom?: string;
}

export interface LessonStudent {
  id_lesson_student: number;
  id_lesson: number;
  id_student: number;
  attendance_status?: string;
  homework_percent?: number;
  score?: number;
  feedback?: string;
  created_at: string;
}

export interface AccountTransaction {
  id_transaction: number;
  id_client: number;
  id_student?: number;
  type?: string;
  amount: number;
  payment_method?: string;
  transaction_date?: string;
}

// === Admin DTOs ===
export interface CreateTeacherDto {
  email?: string;
  password?: string;
  fullName?: string;
  phoneNumber?: string;
  specialization?: string;
}
export interface UpdateTeacherDto extends CreateTeacherDto {}

export interface CreateClientDto {
  email?: string;
  password?: string;
  fullName?: string;
  phoneNumber?: string;
  student?: CreateStudentDto;
}

export interface UpdateClientDto {
  email?: string;
  password?: string;
  fullName?: string;
  phoneNumber?: string;
}

export interface CreateStudentDto {
  fullName?: string;
  birthDate?: string;
}

export interface CreateCourseDto {
  name: string;
  description?: string;
  countLesson?: number;
  pricePerClass?: number;
}

export interface UpdateCourseDto extends CreateCourseDto {}

export interface CreateLessonDto {
  teacherId: number;
  courseId: number;
  lessonDate: string;
  durationMinutes: number;
  numberInCourse: number;
  title?: string;
  description?: string;
  homework?: string;
  classroom?: string;
}

export interface UpdateLessonDto {
  lessonDate?: string;
  durationMinutes?: number;
  numberInCourse?: number;
  title?: string;
  description?: string;
  homework?: string;
  status?: string;
  classroom?: string;
}

export interface EnrollStudentDto {
  studentId: number;
}

export interface UpdateProgressDto {
  attendanceStatus?: string;
  homeworkPercent?: number;
  score?: number;
  feedback?: string;
}

export interface TopUpBalanceDto {
  amount: number;
  paymentMethod?: string;
}

// === Client DTOs ===
export interface LessonEnrollmentDto {
  studentId: number;
  lessonId: number;
}

export interface CancelEnrollmentDto {
  studentId: number;
  lessonId: number;
}

// export interface StudentProgressDto {
//   student: ClientStudent;
//   lessons?: LessonStudent[];
//   averageHomeworkPercent: number;
//   averageScore: number;
//   attendanceRate: number;
//   attendedLessons: number;
//   totalLessons: number;
//   completedLessons: number;
// }

export interface StudentFullProgressDto {
  idStudent: number;
  fullName: string;
  courseName: string;
  totalLessons: number;
  completedLessons: number;
  attendedLessons: number;
  attendanceRate: number;
  averageHomeworkPercent: number;
  averageScore: number;
  lessonHistory: LessonPerformanceDto[];
}

export interface LessonPerformanceDto {
  idLesson: number;
  title?: string;
  lessonDate?: string;
  homeworkPercent?: number;
  score?: number;
  teacherFeedback?: string;
  attendanceStatus?: string;
}

export interface AttendanceHistoryDto {
  idLesson: number;
  lessonTitle?: string;
  lessonDate?: string;
  attendanceStatus?: string;
  teacherName?: string;
  classroom?: string;
}

export interface UpdateClientDataDto {
  fullName?: string;
  phoneNumber?: string;
}

// === Teacher DTOs ===
export interface MarkAttendanceDto {
  studentId: number;
  attendanceStatus?: string;
}

export interface BulkAttendanceDto {
  attendanceData?: Record<string, string>;
}

export interface GradeHomeworkDto {
  studentId: number;
  homeworkPercent: number;
  score?: number;
  feedback?: string;
}

export interface UpdateTeacherDataDto {
  fullName?: string;
  specialization?: string | null;
  phoneNumber?: string;
}

export interface TeacherData {
  fullName?: string | null;
  specialization?: string | null;
  phoneNumber?: string | null;
  totalLessonsCount? : number;
  upcomingLessonsCount? : number;
}

// === API Error ===
export interface ApiError {
  message: string;
  statusCode?: number;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  roles: UserRole[];
  badge?: number;
}

// === Новые типы для Client Profile ===

export interface ClientProfileData {
  id_client: number;
  id_user: number;
  phone_number?: string;
  full_name?: string;
  balance: number;
}

export interface ClientStudent {
  id_student: number;
  id_client: number;
  full_name?: string;
  birth_date?: string;
}

export interface ClientProfileFormData {
  fullName?: string;
  phoneNumber?: string;
}

// === Client list item (from /api/Admin/clients) ===
export interface ClientListItem {
  id: number;
  fullName: string;
  phoneNumber: string | null;
  balance: number;
  studentsCount: number;
}

// === Client full info (from /api/Admin/clients/{id}/full-info) ===
export interface ClientFullInfo {
  client: {
    id_client: number;
    id_user: number;
    phone_number: string | null;
    full_name: string | null;
    balance: number;
  };
  students: Array<{
    id_student: number;
    id_client: number;
    full_name: string | null;
    birth_date: string | null;
  }>;
  transactions: AccountTransaction[];
  studentsProgress: any[];
  totalBalance: number;
}
export interface LessonDetailsDto {
  idLesson: number;
  title?: string;
  description?: string;
  lessonDate?: string;
  classroom?: string;
  homework?: string;
  status?: string;
  durationMin?: number;
  numberInCourse?: number;
  idCourse: number;
  courseName?: string;
  idTeacher: number;
  teacherName?: string;
  students: StudentAttendanceDto[];
  totalStudents: number;
  presentCount: number;
  absentCount: number;
}

export interface StudentAttendanceDto {
  idStudent: number;
  fullName?: string;
  birthDate?: string;
  attendanceStatus?: string | null;
  homeworkPercent?: number | null;
  score?: number | null;
  feedback?: string | null;
  enrollmentDate?: string;
}