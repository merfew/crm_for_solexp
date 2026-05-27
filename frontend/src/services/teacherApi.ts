// src/services/teacherApi.ts
import { apiClient, formatDateParam } from './api';
import type {
  Lesson, Teacher, Course, UpdateTeacherDataDto, TeacherData,
  MarkAttendanceDto, BulkAttendanceDto, GradeHomeworkDto, LessonDetailsDto,
  UpdateEmailDto, UpdatePasswordDto
} from '../types/index';

export const teacherApi = {
  getTeachers: () => apiClient.get<Teacher[]>('/api/Teacher/teachers'),
  
  getCourse: () => apiClient.get<Course[]>('/api/Teacher/courses'),

  getSchedule: () => apiClient.get<Lesson[]>('/api/Teacher/schedule'),
  
  getScheduleRange: (startDate?: Date | string, endDate?: Date | string) => 
    apiClient.get<Lesson[]>('/api/Teacher/schedule/range', {
      params: {
        startDate: formatDateParam(startDate),
        endDate: formatDateParam(endDate),
      },
    }),
  
  getHistory: () => apiClient.get<Lesson[]>('/api/Teacher/history'),

  getLesson: (lessonId: number) => 
    apiClient.get<LessonDetailsDto>(`/api/Teacher/lessons/${lessonId}`),

  markAttendance: (lessonId: number, dto: MarkAttendanceDto) => 
    apiClient.post(`/api/Teacher/lessons/${lessonId}/attendance`, dto),
  
  markBulkAttendance: (lessonId: number, dto: BulkAttendanceDto) => 
    apiClient.post(`/api/Teacher/lessons/${lessonId}/attendance/bulk`, dto),

  updateHomework: (lessonId: number, homework: string) =>
    apiClient.put(`/api/Teacher/lessons/${lessonId}/homework`, JSON.stringify(homework), {
      headers: { 'Content-Type': 'application/json' },
    }),

  updateStatus: (lessonId: number, status: string) =>
    apiClient.put(`/api/Teacher/lessons/${lessonId}/status`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' },
    }),
  
  addComment: (lessonId: number, comment: string) => 
    apiClient.post(`/api/Teacher/lessons/${lessonId}/comment`, JSON.stringify(comment), {
      headers: { 'Content-Type': 'application/json' },
    }),
  
  updateDescription: (lessonId: number, description: string) => 
    apiClient.put(`/api/Teacher/lessons/${lessonId}/description`, JSON.stringify(description), {
      headers: { 'Content-Type': 'application/json' },
    }),

  gradeHomework: (lessonId: number, dto: GradeHomeworkDto) => 
    apiClient.post(`/api/Teacher/lessons/${lessonId}/grade`, dto),

  getProfile: () => apiClient.get<TeacherData>('/api/Teacher/profile'),
  
  updateProfile: (dto: UpdateTeacherDataDto) => 
    apiClient.put<Teacher>('/api/Teacher/profile', dto),
  
  updatePhone: (phone: string) =>
    apiClient.patch('/api/Teacher/profile/phone', JSON.stringify(phone), {
      headers: { 'Content-Type': 'application/json' },
    }),

  updateEmail: (dto: UpdateEmailDto) =>
    apiClient.patch('/api/Teacher/profile/email', dto),

  updatePassword: (dto: UpdatePasswordDto) =>
    apiClient.patch('/api/Teacher/profile/password', dto),
};