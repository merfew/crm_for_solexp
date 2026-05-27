// src/services/adminApi.ts
import { apiClient, formatDateParam } from './api';
import type {
  CreateTeacherDto, UpdateTeacherDto,
  CreateClientDto, UpdateClientDto,
  CreateCourseDto, UpdateCourseDto,
  CreateLessonDto, UpdateLessonDto,
  EnrollStudentDto, UpdateProgressDto, TopUpBalanceDto,
  Teacher, Course, ClientListItem, ClientFullInfo, Lesson, CreateStudentDto, UpdateStudentDto, AccountTransaction,
  Student, StudentFullProgressDto, LessonPerformanceDto, AttendanceHistoryDto,
  AdminProfileDto, UpdateAdminDataDto, UpdateEmailDto, UpdatePasswordDto,
  LessonDetailsDto
} from '../types/index';

export const adminApi = {
  // Users & Roles
  getUsers: () => apiClient.get('/api/Admin/users'),
  getRoles: () => apiClient.get('/api/Admin/roles'),
  checkAdmin: (userId: number) => apiClient.get(`/api/Admin/check-admin/${userId}`),

  // Teachers
  getTeachers: () => apiClient.get<Teacher[]>('/api/Admin/teachers'),
  createTeacher: (dto: CreateTeacherDto) => apiClient.post('/api/Admin/teachers', dto),
  updateTeacher: (teacherId: number, dto: UpdateTeacherDto) => 
    apiClient.patch(`/api/Admin/teachers/${teacherId}`, dto),
  deleteTeacher: (teacherId: number) => 
    apiClient.delete(`/api/Admin/teachers/${teacherId}`),
  getTeacherFullInfo: (teacherId: number) => 
    apiClient.get(`/api/Admin/teachers/${teacherId}/full-info`),

  // Clients
getClients: () => apiClient.get<ClientListItem[]>('/api/Admin/clients'),
getClientFullInfo: (clientId: number) => 
  apiClient.get<ClientFullInfo>(`/api/Admin/clients/${clientId}/full-info`),
createClient: (dto: CreateClientDto) => apiClient.post('/api/Admin/clients', dto),
updateClient: (clientId: number, dto: UpdateClientDto) => 
  apiClient.put(`/api/Admin/clients/${clientId}`, dto),
deleteClient: (clientId: number) => 
  apiClient.delete(`/api/Admin/clients/${clientId}`),
createStudentForClient: (clientId: number, dto: CreateStudentDto) =>
  apiClient.post<Student>(`/api/Admin/clients/${clientId}/students`, dto),
updateStudent: (studentId: number, dto: UpdateStudentDto) =>
  apiClient.put<Student>(`/api/Admin/students/${studentId}`, dto),
deleteStudent: (studentId: number) =>
  apiClient.delete(`/api/Admin/students/${studentId}`),
getAllStudents: () =>
  apiClient.get<Student[]>('/api/Admin/students'),
getStudentProgress: (studentId: number, courseId: number) =>
  apiClient.get<StudentFullProgressDto>(`/api/Admin/students/${studentId}/progress`, { params: { courseId } }),
getStudentPerformance: (studentId: number, courseId: number) =>
  apiClient.get<LessonPerformanceDto[]>(`/api/Admin/students/${studentId}/performance`, { params: { courseId } }),
getStudentAttendance: (studentId: number, courseId: number) =>
  apiClient.get<AttendanceHistoryDto[]>(`/api/Admin/students/${studentId}/attendance`, { params: { courseId } }),

  // Courses
  getCourse: () => apiClient.get<Course[]>('/api/Admin/courses'),
  createCourse: (dto: CreateCourseDto) => apiClient.post('/api/Admin/courses', dto),
  updateCourse: (courseId: number, dto: UpdateCourseDto) => 
    apiClient.put(`/api/Admin/courses/${courseId}`, dto),
  deleteCourse: (courseId: number) => 
    apiClient.delete(`/api/Admin/courses/${courseId}`),

  // Lessons
  getLessonStudents: (lessonId: number) =>
    apiClient.get<LessonDetailsDto>(`/api/Admin/lessons/${lessonId}/students`),
  createLesson: (dto: CreateLessonDto) => apiClient.post('/api/Admin/lessons', dto),
  updateLesson: (lessonId: number, dto: UpdateLessonDto) => 
    apiClient.patch(`/api/Admin/lessons/${lessonId}`, dto),
  deleteLesson: (lessonId: number) => 
    apiClient.delete(`/api/Admin/lessons/${lessonId}`),

  // Schedule
  getSchedule: (startDate?: Date | string, endDate?: Date | string) => 
    apiClient.get<Lesson[]>('/api/Admin/schedule', {
      params: {
        startDate: formatDateParam(startDate),
        endDate: formatDateParam(endDate),
      },
    }),

  // Enrollments & Progress
  enrollStudent: (lessonId: number, dto: EnrollStudentDto) => 
    apiClient.post(`/api/Admin/lessons/${lessonId}/enroll`, dto),
  updateProgress: (lessonStudentId: number, dto: UpdateProgressDto) => 
    apiClient.put(`/api/Admin/lesson-students/${lessonStudentId}/progress`, dto),

  // Balance & Transactions
  topUpBalance: (clientId: number, dto: TopUpBalanceDto) => 
    apiClient.post(`/api/Admin/clients/${clientId}/topup`, dto),
  getClientTransactions: (clientId: number) => 
    apiClient.get<AccountTransaction[]>(`/api/Admin/clients/${clientId}/transactions`),

  // Statistics & Reports
  getDashboardStats: () => apiClient.get('/api/Admin/statistics/dashboard'),
  getTeacherPerformanceReport: (startDate?: Date | string, endDate?: Date | string) => 
    apiClient.get('/api/Admin/reports/teacher-performance', {
      params: {
        startDate: formatDateParam(startDate),
        endDate: formatDateParam(endDate),
      },
    }),
  getFinancialReport: (startDate?: Date | string, endDate?: Date | string) => 
    apiClient.get('/api/Admin/reports/financial', {
      params: {
        startDate: formatDateParam(startDate),
        endDate: formatDateParam(endDate),
      },
    }),

  // Профиль администратора
  getProfile: () => apiClient.get<AdminProfileDto>('/api/Admin/profile'),
  updateProfile: (dto: UpdateAdminDataDto) => apiClient.put<AdminProfileDto>('/api/Admin/profile', dto),
  updateEmail: (dto: UpdateEmailDto) => apiClient.patch('/api/Admin/profile/email', dto),
  updatePassword: (dto: UpdatePasswordDto) => apiClient.patch('/api/Admin/profile/password', dto),
};