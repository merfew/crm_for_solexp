// src/services/clientApi.ts
import { apiClient, formatDateParam } from './api';
import type {
  Lesson, LessonStudent, StudentFullProgressDto, LessonPerformanceDto,
  AttendanceHistoryDto, AccountTransaction, Client, ClientStudent,
  LessonEnrollmentDto, CancelEnrollmentDto, UpdateClientDataDto, Course, Teacher
} from '../types/index';

export const clientApi = {

  getTeachers: () => apiClient.get<Teacher[]>('/api/Client/teachers'),

  getScheduleRange: (startDate?: Date | string, endDate?: Date | string) => 
    apiClient.get<Lesson[]>('/api/Client/schedule', {
      params: {
        startDate: formatDateParam(startDate),
        endDate: formatDateParam(endDate),
      },
    }),

  getSchedule: (courseId: number) => 
    apiClient.get<Lesson[]>(`/api/Client/schedule/${courseId}`),
  
  getAvailableLessons: (courseId: number, date?: Date | string) => 
    apiClient.get<Lesson[]>(`/api/Client/schedule/${courseId}/available`, {
      params: { date: formatDateParam(date) },
    }),

  enroll: (dto: LessonEnrollmentDto) => 
    apiClient.post<LessonStudent>('/api/Client/enroll', dto),
  
  cancelEnrollment: (dto: CancelEnrollmentDto) => 
    apiClient.delete('/api/Client/enroll', { data: dto }),

  getCourse: () => apiClient.get<Course[]>('/api/Client/courses'),

  getStudentEnrollments: (studentId: number) => 
    apiClient.get<LessonStudent[]>(`/api/Client/students/${studentId}/enrollments`),
  
  getStudentProgress: (studentId: number, courseId: number) => 
    apiClient.get<StudentFullProgressDto>(`/api/Client/students/${studentId}/progress`, {
      params: { courseId: courseId },
    }),
  
  getStudentPerformance: (studentId: number, courseId: number) => 
    apiClient.get<LessonPerformanceDto[]>(`/api/Client/students/${studentId}/performance`, {
      params: { courseId: courseId },
    }),
  
  getStudentAttendance: (studentId: number, courseId: number) => 
    apiClient.get<AttendanceHistoryDto[]>(`/api/Client/students/${studentId}/attendance`, {
      params: { courseId: courseId },
    }),

  getBalance: () => apiClient.get<number>('/api/Client/balance'),
  getTransactions: () => apiClient.get<AccountTransaction[]>('/api/Client/transactions'),

  getStudents: () => apiClient.get<ClientStudent[]>('/api/Client/students'),

  getProfile: () => apiClient.get<Client>('/api/Client/profile'),
  updateProfile: (dto: UpdateClientDataDto) => 
    apiClient.put<Client>('/api/Client/profile', dto),
  updatePhone: (phone: string) => 
    apiClient.patch('/api/Client/profile/phone', JSON.stringify(phone), {
      headers: { 'Content-Type': 'application/json' },
    }),
};