// src/services/adminApi.ts
import { apiClient, formatDateParam } from './api';
import type {
  CreateTeacherDto, UpdateTeacherDto,
  CreateClientDto, UpdateClientDto,
  CreateCourseDto, UpdateCourseDto,
  CreateLessonDto, UpdateLessonDto,
  EnrollStudentDto, UpdateProgressDto, TopUpBalanceDto,
  Teacher, Course, ClientListItem, ClientFullInfo, Lesson, CreateStudentDto, AccountTransaction,
  Student
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

  // Courses
  getCourse: () => apiClient.get<Course[]>('/api/Admin/courses'),
  createCourse: (dto: CreateCourseDto) => apiClient.post('/api/Admin/courses', dto),
  updateCourse: (courseId: number, dto: UpdateCourseDto) => 
    apiClient.put(`/api/Admin/courses/${courseId}`, dto),
  deleteCourse: (courseId: number) => 
    apiClient.delete(`/api/Admin/courses/${courseId}`),

  // Lessons
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
};