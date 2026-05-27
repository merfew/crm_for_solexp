// src/pages/Calendar/CalendarPage.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { adminApi } from '../../services/adminApi';
import { clientApi } from '../../services/clientApi';
import { teacherApi } from '../../services/teacherApi';
import type { 
  Lesson, Course, Teacher, ClientStudent, 
  LessonStudent, LessonEnrollmentDto, CancelEnrollmentDto, 
  MarkAttendanceDto, GradeHomeworkDto,
  LessonDetailsDto, StudentAttendanceDto 
} from '../../types';
import styles from './CalendarPage.module.css';
import { CustomDatePicker } from '../../components/common/CustomDatePicker/CustomDatePicker';
import { CustomSelect } from '../../components/common/CustomSelect/CustomSelect';

// === Типы для записи на занятие ===
interface EnrollmentInfo {
  enrollmentId: number;
  studentId: number;
  studentName: string;
  lessonId: number;
  homeworkPercent?: number | null;
  score?: number | null;
  feedback?: string | null;
  attendanceStatus?: string | null;
}
// === Иконки ===
const ArrowIcon: React.FC<{ direction: 'left' | 'right' }> = ({ direction }) => (
  <span style={{ fontSize: 18 }}>{direction === 'left' ? '←' : '→'}</span>
);

const ClassroomIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 20h20" />
    <path d="M4 20V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14" />
    <path d="M12 20V10a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v10" />
    <circle cx="18" cy="16" r="1" />
    <circle cx="6" cy="16" r="1" />
  </svg>
);

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const CourseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const TeacherIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 10L12 5L22 10L12 15L2 10Z" />
    <path d="M6 12v4c0 1.5 2 3 6 3s6-1.5 6-3v-4" />
    <path d="M22 10v4" />
  </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const DeleteIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const StudentIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const DescriptionIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="21" y1="10" x2="3" y2="10" />
    <line x1="21" y1="6" x2="3" y2="6" />
    <line x1="21" y1="14" x2="3" y2="14" />
    <line x1="21" y1="18" x2="3" y2="18" />
  </svg>
);

const HomeworkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CalendarCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <polyline points="9 16 12 13 15 16" />
  </svg>
);

const CalendarXIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="9" y1="15" x2="15" y2="15" />
  </svg>
);

const UserPlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const UserMinusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="17" y1="11" x2="23" y2="11" />
  </svg>
);

const AlertIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

// === Константы ===
const HOURS = Array.from({ length: 9 }, (_, i) => i + 11); // 11–20

// Конвертация Date в строку для datetime-local в локальном времени
const toLocalDatetimeString = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// === Модальное окно ===
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{title}</h3>
          <button className={styles.modalClose} onClick={onClose}>
            <CloseIcon className={styles.iconSmall} />
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
};

// === Компонент детального просмотра занятия ===
interface LessonDetailModalProps {
  lesson: Lesson | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  courses: Course[];
  teachers: Teacher[];
}

const LessonDetailModal: React.FC<LessonDetailModalProps> = ({
  lesson,
  isOpen,
  onClose,
  onUpdate,
  courses,
  teachers,
}) => {
  const { user } = useAuth();
  
  // === Основные состояния ===
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // === Данные о студентах (из нового API) ===
  const [lessonDetails, setLessonDetails] = useState<LessonDetailsDto | null>(null);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // === Данные о студентах для администратора ===
  const [adminLessonDetails, setAdminLessonDetails] = useState<LessonDetailsDto | null>(null);
  const [isLoadingAdminStudents, setIsLoadingAdminStudents] = useState(false);
  
  // === Состояния для преподавателя ===
  const [editingStudentId, setEditingStudentId] = useState<number | null>(null);
  const [attendanceForm, setAttendanceForm] = useState<Record<number, string>>({});
  const [gradeForm, setGradeForm] = useState<Record<number, {
    homeworkPercent: number;
    score: number;
    feedback: string
  }>>({});
  const [isUpdatingAttendance, setIsUpdatingAttendance] = useState<number | null>(null);
  const [isUpdatingGrade, setIsUpdatingGrade] = useState<number | null>(null);
  const [teacherError, setTeacherError] = useState('');

  // === Редактирование статуса и ДЗ учителем ===
  const [isEditingLessonInfo, setIsEditingLessonInfo] = useState(false);
  const [lessonInfoForm, setLessonInfoForm] = useState({ status: '', homework: '' });
  const [isSavingLessonInfo, setIsSavingLessonInfo] = useState(false);

  // Отображаемые значения — обновляются оптимистически сразу после сохранения
  const [currentStatus, setCurrentStatus] = useState(lesson?.status ?? 'scheduled');
  const [currentHomework, setCurrentHomework] = useState(lesson?.homework ?? '');
  
  // === Состояния для записи клиента ===
  const [clientStudents, setClientStudents] = useState<ClientStudent[]>([]);
  const [enrollments, setEnrollments] = useState<EnrollmentInfo[]>([]);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isCancelling, setIsCancelling] = useState<number | null>(null);
  const [enrollError, setEnrollError] = useState('');
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedStudentToEnroll, setSelectedStudentToEnroll] = useState<number | ''>('');
  
  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const isClient = user?.role === 'client';

  // === ЗАГРУЗКА ДАННЫХ ===
  
  // Загрузка студентов через новое API для преподавателя
  useEffect(() => {
    if (isOpen && lesson && isTeacher) {
      loadLessonDetails();
    }
  }, [isOpen, lesson?.id_lesson, isTeacher]);

  // Загрузка студентов для администратора
  useEffect(() => {
    if (isOpen && lesson && isAdmin) {
      loadAdminLessonStudents();
    }
  }, [isOpen, lesson?.id_lesson, isAdmin]);

  // Загрузка данных для клиента
  useEffect(() => {
    if (isOpen && lesson && isClient) {
      loadClientEnrollmentData();
    }
  }, [isOpen, lesson, isClient]);

  // Сброс формы при открытии нового занятия
  useEffect(() => {
    if (lesson && isOpen) {
      resetForms();
    }
  }, [lesson, isOpen]);

  const resetForms = () => {
    const dateStr = lesson?.lesson_date
      ? toLocalDatetimeString(new Date(lesson.lesson_date))
      : '';
    setEditForm({
      title: lesson?.title || '',
      id_course: String(lesson?.id_course || ''),
      id_teacher: String(lesson?.id_teacher || ''),
      lesson_date: dateStr,
      classroom: lesson?.classroom || '',
      description: lesson?.description || '',
      homework: lesson?.homework || '',
      duration_minutes: lesson?.duration_min || 60,
      number_in_course: lesson?.number_in_course || 0,
      status: lesson?.status || 'scheduled',
    });
    setIsEditing(false);
    setEnrollError('');
    setTeacherError('');
    setShowEnrollModal(false);
    setSelectedStudentToEnroll('');
    setEditingStudentId(null);
    setIsEditingLessonInfo(false);
    setLessonInfoForm({
      status: lesson?.status || 'scheduled',
      homework: lesson?.homework || '',
    });
    setCurrentStatus(lesson?.status || 'scheduled');
    setCurrentHomework(lesson?.homework || '');
  };


  // Функция для получения текста статуса занятия
const getStatusText = (status?: string): string => {
  switch (status?.toLowerCase()) {
    case 'scheduled':
      return 'Запланировано';
    case 'completed':
      return 'Завершено';
    case 'cancelled':
      return 'Отменено';
    case 'in_progress':
      return 'В процессе';
    default:
      return status || 'Не указан';
  }
};

// Функция для получения CSS класса статуса
const getStatusClass = (status?: string): string => {
  switch (status?.toLowerCase()) {
    case 'scheduled':
      return styles.statusScheduled;
    case 'completed':
      return styles.statusCompleted;
    case 'cancelled':
      return styles.statusCancelled;
    case 'in_progress':
      return styles.statusInProgress;
    default:
      return '';
  }
};
  const loadAdminLessonStudents = async () => {
    if (!lesson) return;
    setIsLoadingAdminStudents(true);
    try {
      const response = await adminApi.getLessonStudents(lesson.id_lesson);
      setAdminLessonDetails(response.data);
    } catch (err) {
      console.error('Ошибка загрузки студентов занятия:', err);
    } finally {
      setIsLoadingAdminStudents(false);
    }
  };

  /**
   * Загрузка деталей занятия через новое API
   */
  const loadLessonDetails = async () => {
    if (!lesson) return;
    
    setIsLoadingStudents(true);
    setTeacherError('');
    
    try {
      const response = await teacherApi.getLesson(lesson.id_lesson);
      const data = response.data;
      setLessonDetails(data);
      
      // Инициализируем формы на основе полученных данных
      if (data.students) {
        const initialAttendance: Record<number, string> = {};
        const initialGrades: Record<number, { 
          homeworkPercent: number; 
          score: number; 
          feedback: string 
        }> = {};
        
        data.students.forEach((student) => {
          initialAttendance[student.idStudent] = student.attendanceStatus || '';
          initialGrades[student.idStudent] = {
            homeworkPercent: student.homeworkPercent || 0,
            score: student.score || 0,
            feedback: student.feedback || '',
          };
        });
        
        setAttendanceForm(initialAttendance);
        setGradeForm(initialGrades);
      }
    } catch (err: any) {
      console.error('Ошибка загрузки данных занятия:', err);
      setTeacherError(err.message || 'Ошибка загрузки списка студентов');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // === РАБОТА С ПОСЕЩАЕМОСТЬЮ ===
  
  const handleAttendanceChange = (studentId: number, status: string) => {
    setAttendanceForm(prev => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAttendance = async (studentId: number) => {
    if (!lesson) return;
    
    const newStatus = attendanceForm[studentId];
    if (!newStatus) return;
    
    setIsUpdatingAttendance(studentId);
    setTeacherError('');
    
    try {
      await teacherApi.markAttendance(lesson.id_lesson, {
        studentId,
        attendanceStatus: newStatus,
      });
      
      // Оптимистичное обновление UI
      setLessonDetails(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          students: prev.students.map(s =>
            s.idStudent === studentId
              ? { ...s, attendanceStatus: newStatus }
              : s
          ),
        };
      });
      
      onUpdate();
    } catch (err: any) {
      console.error('Ошибка отметки посещаемости:', err);
      setTeacherError(err.message || 'Ошибка отметки посещаемости');
      // Откатываем изменения в форме
      await loadLessonDetails();
    } finally {
      setIsUpdatingAttendance(null);
    }
  };

  const handleBulkAttendance = async (status: string) => {
    if (!lesson || !lessonDetails?.students) return;
    
    setTeacherError('');
    
    // Отмечаем всех студентов, у которых статус не совпадает
    const studentsToUpdate = lessonDetails.students.filter(
      s => s.attendanceStatus !== status
    );
    
    for (const student of studentsToUpdate) {
      setAttendanceForm(prev => ({ ...prev, [student.idStudent]: status }));
      await handleMarkAttendance(student.idStudent);
    }
  };

  // === РЕДАКТИРОВАНИЕ СТАТУСА И ДЗ УЧИТЕЛЕМ ===

  const handleSaveLessonInfo = async () => {
    if (!lesson) return;
    setIsSavingLessonInfo(true);
    setTeacherError('');

    try {
      const statusChanged = lessonInfoForm.status !== currentStatus;
      const homeworkChanged = lessonInfoForm.homework !== currentHomework;

      if (statusChanged) await teacherApi.updateStatus(lesson.id_lesson, lessonInfoForm.status);
      if (homeworkChanged) await teacherApi.updateHomework(lesson.id_lesson, lessonInfoForm.homework);

      if (statusChanged) setCurrentStatus(lessonInfoForm.status);
      if (homeworkChanged) {
        setCurrentHomework(lessonInfoForm.homework);
        setLessonDetails(prev => prev ? { ...prev, homework: lessonInfoForm.homework } : prev);
      }
      setIsEditingLessonInfo(false);
      onUpdate();
    } catch (err: any) {
      setTeacherError(err.message || 'Ошибка сохранения');
    } finally {
      setIsSavingLessonInfo(false);
    }
  };

  // === РАБОТА С ОЦЕНКАМИ ===

  const handleGradeChange = (studentId: number, field: string, value: number | string) => {
    setGradeForm(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: field === 'feedback' ? value : Number(value),
      },
    }));
  };

  const handleSubmitGrade = async (studentId: number) => {
    if (!lesson) return;
    
    const grade = gradeForm[studentId];
    setIsUpdatingGrade(studentId);
    setTeacherError('');
    
    try {
      await teacherApi.gradeHomework(lesson.id_lesson, {
        studentId,
        homeworkPercent: grade.homeworkPercent,
        score: grade.score || undefined,
        feedback: grade.feedback || undefined,
      });
      
      // Оптимистичное обновление UI
      setLessonDetails(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          students: prev.students.map(s =>
            s.idStudent === studentId
              ? {
                  ...s,
                  homeworkPercent: grade.homeworkPercent || null,
                  score: grade.score || null,
                  feedback: grade.feedback || null,
                }
              : s
          ),
        };
      });
      
      setEditingStudentId(null);
      onUpdate();
    } catch (err: any) {
      console.error('Ошибка выставления оценки:', err);
      setTeacherError(err.message || 'Ошибка выставления оценки');
    } finally {
      setIsUpdatingGrade(null);
    }
  };

  // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
  
  const getAttendanceStatusText = (status?: string | null): string => {
    switch (status) {
      case 'present': return 'Присутствовал';
      case 'absent': return 'Отсутствовал';
      case 'late': return 'Опоздал';
      default: return 'Не отмечен';
    }
  };

  const getAttendanceStatusClass = (status?: string | null): string => {
    switch (status) {
      case 'present': return styles.statusPresent;
      case 'absent': return styles.statusAbsent;
      case 'late': return styles.statusLate;
      default: return styles.statusPending;
    }
  };

  // === ФУНКЦИИ ДЛЯ КЛИЕНТА (оптимизированные) ===
  
  const loadClientEnrollmentData = async () => {
    if (!lesson) return;
    setIsLoadingEnrollments(true);
    setEnrollError('');
    
    try {
      const studentsRes = await clientApi.getStudents();
      const students = studentsRes.data || [];
      setClientStudents(students);

      const allEnrollments: EnrollmentInfo[] = [];
      
      // Параллельная загрузка для ускорения
      const enrollmentPromises = students.map(async (student) => {
        try {
          const enrollRes = await clientApi.getStudentEnrollments(student.id_student);
          const studentEnrollments = enrollRes.data || [];
          
          return studentEnrollments
            .filter((e: LessonStudent) => e.id_lesson === lesson.id_lesson)
            .map((enrollment: LessonStudent) => ({
              enrollmentId: enrollment.id_lesson_student,
              studentId: student.id_student,
              studentName: student.full_name || `Студент #${student.id_student}`,
              lessonId: lesson.id_lesson,
              homeworkPercent: enrollment.homework_percent ?? null,
              score: enrollment.score ?? null,
              feedback: enrollment.feedback ?? null,
              attendanceStatus: enrollment.attendance_status ?? null,
            }));
        } catch {
          return [];
        }
      });
      
      const results = await Promise.all(enrollmentPromises);
      results.forEach(enrollments => allEnrollments.push(...enrollments));
      
      setEnrollments(allEnrollments);
    } catch (err: any) {
      console.error('Ошибка загрузки данных для записи:', err);
      setEnrollError(err.message || 'Ошибка загрузки данных');
    } finally {
      setIsLoadingEnrollments(false);
    }
  };

  const getStudentDisplayName = (student: ClientStudent): string => {
    return student.full_name || `Студент #${student.id_student}`;
  };

  const getEnrolledStudentIds = (): number[] => {
    return enrollments.map(e => e.studentId);
  };

  const handleEnroll = async () => {
    if (!lesson || !selectedStudentToEnroll) return;

    setIsEnrolling(true);
    setEnrollError('');
    
    try {
      const enrollDto: LessonEnrollmentDto = {
        studentId: Number(selectedStudentToEnroll),
        lessonId: lesson.id_lesson,
      };
      
      await clientApi.enroll(enrollDto);
      
      // Обновляем данные
      await loadClientEnrollmentData();
      setShowEnrollModal(false);
      setSelectedStudentToEnroll('');
      onUpdate();
    } catch (err: any) {
      console.error('Ошибка записи на занятие:', err);
      setEnrollError(err.message || 'Ошибка записи на занятие');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleCancelEnrollment = async (studentId: number) => {
    if (!lesson) return;

    const confirmed = window.confirm('Вы уверены, что хотите отменить запись студента на это занятие?');
    if (!confirmed) return;

    setIsCancelling(studentId);
    setEnrollError('');
    
    try {
      const cancelDto: CancelEnrollmentDto = {
        studentId: studentId,
        lessonId: lesson.id_lesson,
      };
      
      await clientApi.cancelEnrollment(cancelDto);
      
      // Обновляем данные
      await loadClientEnrollmentData();
      onUpdate();
    } catch (err: any) {
      console.error('Ошибка отмены записи:', err);
      setEnrollError(err.message || 'Ошибка отмены записи');
    } finally {
      setIsCancelling(null);
    }
  };

  const getAvailableStudentsForEnroll = (): ClientStudent[] => {
    const enrolledIds = getEnrolledStudentIds();
    return clientStudents.filter(s => !enrolledIds.includes(s.id_student));
  };

  const getTeacherName = (id: number) =>
    teachers.find((t) => t.id === id)?.fullName || `Преподаватель #${id}`;

  const getCourseName = (id: number) =>
    courses.find((c) => c.id_cours === id)?.name || `Курс #${id}`;

  const formatDateTime = (dateStr: string | undefined) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const [editForm, setEditForm] = useState({
    title: '',
    id_course: '',
    id_teacher: '',
    lesson_date: '',
    classroom: '',
    description: '',
    homework: '',
    duration_minutes: 60,
    number_in_course: 0,
    status: 'scheduled',
  });

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lesson || !isAdmin) return;

    setIsSubmitting(true);
    try {
      const lessonData = {
        title: editForm.title,
        lessonDate: editForm.lesson_date
          ? new Date(editForm.lesson_date).toISOString()
          : undefined,
        durationMinutes: Number(editForm.duration_minutes),
        numberInCourse: Number(editForm.number_in_course),
        classroom: editForm.classroom,
        description: editForm.description,
        homework: editForm.homework,
        status: editForm.status,
      };

      await adminApi.updateLesson(lesson.id_lesson, lessonData);
      setIsEditing(false);
      onUpdate();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Ошибка обновления занятия');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!lesson || !isAdmin) return;

    const confirmed = window.confirm(
      `Вы уверены, что хотите удалить занятие "${lesson.title}"?\n\nЭто действие нельзя отменить.`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await adminApi.deleteLesson(lesson.id_lesson);
      onClose();
      onUpdate();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Ошибка удаления занятия');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!lesson) return null;

  const homeworkValue = isTeacher
    ? (lessonDetails?.homework ?? currentHomework)
    : currentHomework;

  const isOwnLesson = isTeacher && user?.entityId === lesson.id_teacher;
  const isLessonCompleted = currentStatus?.toLowerCase() === 'completed';

  const enrolledStudents = clientStudents.filter(s => getEnrolledStudentIds().includes(s.id_student));
  const availableStudents = getAvailableStudentsForEnroll();

  return (
    <>
      <Modal isOpen={isOpen && !showEnrollModal} onClose={onClose} title={isEditing ? 'Редактирование занятия' : (lesson?.title || '')}>
        {isEditing && isAdmin ? (
          // === РЕЖИМ РЕДАКТИРОВАНИЯ (только админ) ===
          <form onSubmit={handleEditSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Название занятия *</label>
              <input
                type="text"
                required
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className={styles.input}
                placeholder="Введите название занятия"
              />
            </div>

            <div className={styles.formGroup}>
    <label>Статус занятия</label>
    <CustomSelect
      value={editForm.status}
      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
    >
      <option value="scheduled">Запланировано</option>
      <option value="in_progress">В процессе</option>
      <option value="completed">Завершено</option>
      <option value="cancelled">Отменено</option>
    </CustomSelect>
  </div>

            <div className={styles.formGroup}>
              <label>Курс</label>
              <CustomSelect
                value={editForm.id_course}
                onChange={(e) => setEditForm({ ...editForm, id_course: e.target.value })}
                disabled
              >
                <option value="">Выберите курс</option>
                {courses.map((course) => (
                  <option key={course.id_cours} value={course.id_cours}>
                    {course.name}
                  </option>
                ))}
              </CustomSelect>
              <small className={styles.fieldHint}>Курс нельзя изменить после создания</small>
            </div>

            <div className={styles.formGroup}>
              <label>Преподаватель</label>
              <CustomSelect
                value={editForm.id_teacher}
                onChange={(e) => setEditForm({ ...editForm, id_teacher: e.target.value })}
                disabled
              >
                <option value="">Выберите преподавателя</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.fullName}
                  </option>
                ))}
              </CustomSelect>
              <small className={styles.fieldHint}>Преподавателя нельзя изменить после создания</small>
            </div>

            <div className={styles.formGroup}>
  <label>Номер урока в курсе</label>
  <input
    type="text"
    required
    value={editForm.number_in_course}
    onChange={(e) => setEditForm({ 
      ...editForm, 
      number_in_course: e.target.value === '' ? 0 : Number(e.target.value) 
    })}
    className={styles.input}
    placeholder="Введите номер урока"
  />
</div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Дата и время *</label>
                <input
                  type="datetime-local"
                  required
                  value={editForm.lesson_date}
                  onChange={(e) => setEditForm({ ...editForm, lesson_date: e.target.value })}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Длительность (мин)</label>
                <CustomSelect
                  value={editForm.duration_minutes}
                  onChange={(e) => setEditForm({ ...editForm, duration_minutes: Number(e.target.value) })}
                >
                  <option value="30">30 минут</option>
                  <option value="45">45 минут</option>
                  <option value="60">60 минут</option>
                  <option value="90">90 минут</option>
                  <option value="120">120 минут</option>
                </CustomSelect>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Аудитория</label>
              <input
                type="text"
                value={editForm.classroom}
                onChange={(e) => setEditForm({ ...editForm, classroom: e.target.value })}
                className={styles.input}
                placeholder="Например: 101, Онлайн"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Описание</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className={styles.textarea}
                rows={3}
                placeholder="Описание занятия..."
              />
            </div>

            <div className={styles.formGroup}>
              <label>Домашнее задание</label>
              <textarea
                value={editForm.homework}
                onChange={(e) => setEditForm({ ...editForm, homework: e.target.value })}
                className={styles.textarea}
                rows={3}
                placeholder="Домашнее задание..."
              />
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting}
              >
                Отмена
              </button>
            </div>
          </form>
        ) : (
          // === РЕЖИМ ПРОСМОТРА ===
          <div className={styles.lessonDetail}>

            {/* Редактирование статуса и ДЗ — только для учителя своего занятия */}
            {isOwnLesson && (
              <div className={styles.lessonInfoEdit}>
                {isEditingLessonInfo ? (
                  <div className={styles.lessonInfoForm}>
                    <div className={styles.lessonInfoFormGroup}>
                      <label className={styles.lessonInfoLabel}>Статус занятия</label>
                      <CustomSelect
                        value={lessonInfoForm.status}
                        onChange={(e) => setLessonInfoForm(prev => ({ ...prev, status: e.target.value }))}
                      >
                        <option value="scheduled">Запланировано</option>
                        <option value="in_progress">В процессе</option>
                        <option value="completed">Завершено</option>
                        <option value="cancelled">Отменено</option>
                      </CustomSelect>
                    </div>
                    <div className={styles.lessonInfoFormGroup}>
                      <label className={styles.lessonInfoLabel}>Домашнее задание</label>
                      <textarea
                        value={lessonInfoForm.homework}
                        onChange={(e) => setLessonInfoForm(prev => ({ ...prev, homework: e.target.value }))}
                        className={styles.lessonInfoTextarea}
                        rows={3}
                        placeholder="Введите домашнее задание..."
                      />
                    </div>
                    <div className={styles.lessonInfoActions}>
                      <button
                        className={styles.lessonInfoSaveBtn}
                        onClick={handleSaveLessonInfo}
                        disabled={isSavingLessonInfo}
                      >
                        <CheckIcon className={styles.btnIconSmall} />
                        {isSavingLessonInfo ? 'Сохранение...' : 'Сохранить'}
                      </button>
                      <button
                        className={styles.lessonInfoCancelBtn}
                        onClick={() => {
                          setIsEditingLessonInfo(false);
                          setLessonInfoForm({ status: currentStatus, homework: currentHomework });
                        }}
                        disabled={isSavingLessonInfo}
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className={styles.lessonInfoEditBtn}
                    onClick={() => {
                      setLessonInfoForm({ status: currentStatus, homework: currentHomework });
                      setIsEditingLessonInfo(true);
                    }}
                  >
                    <EditIcon className={styles.btnIconSmall} />
                    Редактировать статус и ДЗ
                  </button>
                )}
              </div>
            )}

            {/* Основная информация */}
            <div className={styles.detailSection}>
              <div className={styles.detailRow}>
                <CourseIcon className={styles.detailIcon} />
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Курс</span>
                  <span className={styles.detailValue}>{getCourseName(lesson.id_course)}</span>
                </div>
              </div>

              <div className={styles.detailRow}>
                <CalendarCheckIcon className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Статус занятия</span>
                    <span className={`${styles.detailValue} ${getStatusClass(currentStatus)}`}>{getStatusText(currentStatus)}</span>
                </div>
              </div>

              <div className={styles.detailRow}>
                <TeacherIcon className={styles.detailIcon} />
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Преподаватель</span>
                  <span className={styles.detailValue}>{getTeacherName(lesson.id_teacher)}</span>
                </div>
              </div>

              <div className={styles.detailRow}>
                <CalendarCheckIcon className={styles.detailIcon} />
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Номер урока в курсе</span>
                  <span className={styles.detailValue}>{lesson.number_in_course || '—'}</span>
                </div>
              </div>

              <div className={styles.detailRow}>
                <ClockIcon className={styles.detailIcon} />
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Дата и время</span>
                  <span className={styles.detailValue}>{formatDateTime(lesson.lesson_date)}</span>
                </div>
              </div>

              <div className={styles.detailRow}>
                <ClockIcon className={styles.detailIcon} />
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Длительность</span>
                  <span className={styles.detailValue}>{lesson.duration_min || 60} минут</span>
                </div>
              </div>

              <div className={styles.detailRow}>
                <ClassroomIcon className={styles.detailIcon} />
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Аудитория</span>
                  <span className={styles.detailValue}>{lesson.classroom || '—'}</span>
                </div>
              </div>

              <div className={styles.detailRow}>
                <DescriptionIcon className={styles.detailIcon} />
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Описание</span>
                  <span className={`${styles.detailValue} ${!lesson.description ? styles.homeworkEmpty : ''}`}>
                    {lesson.description || 'Не указано'}
                  </span>
                </div>
              </div>

              <div className={styles.detailRow}>
                <HomeworkIcon className={styles.detailIcon} />
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>Домашнее задание</span>
                  <span className={`${styles.detailValue} ${!homeworkValue ? styles.homeworkEmpty : ''}`}>
                    {homeworkValue || 'Не задано'}
                  </span>
                </div>
              </div>
            </div>

            {/* === СЕКЦИЯ ДЛЯ ПРЕПОДАВАТЕЛЯ === */}
            {isTeacher && (
              <div className={styles.detailSection}>
                <div className={styles.detailSectionHeader}>
                  <h4 className={styles.detailSectionTitle}>
                    <StudentIcon className={styles.sectionIcon} />
                    {isOwnLesson ? 'Управление студентами' : 'Список студентов'}
                  </h4>
                  {lessonDetails && (
                    <div className={styles.studentsStats}>
                      <span className={styles.statsBadge}>
                        Всего: {lessonDetails.students.length}
                      </span>
                      <span className={styles.statsBadge}>
                        Присутствуют: {lessonDetails.students.filter(s => s.attendanceStatus === 'present').length}
                      </span>
                      {lessonDetails.students.filter(s => s.attendanceStatus === 'absent').length > 0 && (
                        <span className={styles.statsBadge}>
                          Отсутствуют: {lessonDetails.students.filter(s => s.attendanceStatus === 'absent').length}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {!isOwnLesson && (
                  <div className={styles.readOnlyNotice}>
                    <AlertIcon className={styles.readOnlyIcon} />
                    Вы можете только просматривать данные этого занятия
                  </div>
                )}

                {teacherError && (
                  <div className={styles.enrollError}>
                    <AlertIcon className={styles.enrollErrorIcon} />
                    {teacherError}
                  </div>
                )}

                {isLoadingStudents ? (
                  <div className={styles.studentsLoading}>Загрузка...</div>
                ) : !lessonDetails?.students?.length ? (
                  <div className={styles.studentsEmpty}>
                    <CalendarXIcon className={styles.emptyIcon} />
                    <p>На это занятие пока никто не записан</p>
                  </div>
                ) : (
                  <>
                    {/* Быстрые действия — только для своего занятия */}
                    {isOwnLesson && (
                      <div className={styles.bulkActions}>
                        <span className={styles.bulkActionsLabel}>Отметить всех:</span>
                        <button className={styles.bulkActionBtn} onClick={() => handleBulkAttendance('present')}>
                          <CheckIcon className={styles.btnIconSmall} />
                          Присутствуют
                        </button>
                        <button className={styles.bulkActionBtn} onClick={() => handleBulkAttendance('absent')}>
                          <XIcon className={styles.btnIconSmall} />
                          Отсутствуют
                        </button>
                      </div>
                    )}

                    {/* Список студентов */}
                    <div className={styles.teacherStudentsList}>
                      {lessonDetails.students.map((student) => (
                        <div key={student.idStudent} className={styles.teacherStudentCard}>
                          {/* Заголовок карточки */}
                          <div className={styles.teacherStudentHeader}>
                            <div className={styles.teacherStudentInfo}>
                              <div className={styles.studentAvatar}>
                                <StudentIcon className={styles.studentAvatarIcon} />
                              </div>
                              <div className={styles.studentDetails}>
                                <span className={styles.teacherStudentName}>
                                  {student.fullName || `Студент #${student.idStudent}`}
                                </span>
                                {student.birthDate && (
                                  <span className={styles.studentBirthDate}>
                                    {new Date(student.birthDate).toLocaleDateString('ru-RU')}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className={styles.teacherStudentStatusGroup}>
                              <span className={`${styles.attendanceBadge} ${getAttendanceStatusClass(student.attendanceStatus)}`}>
                                {getAttendanceStatusText(student.attendanceStatus)}
                              </span>
                              {(student.homeworkPercent != null || student.score != null) && (
                                <span className={styles.gradedBadge}>
                                  <CheckIcon className={styles.statusIconSmall} />
                                  Оценки выставлены
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Посещаемость */}
                          <div className={styles.teacherActionRow}>
                            <div className={styles.attendanceSection}>
                              <span className={styles.teacherActionLabel}>Посещаемость:</span>
                              {isOwnLesson ? (
                                <div className={styles.attendanceControls}>
                                  <CustomSelect
                                    value={attendanceForm[student.idStudent] || ''}
                                    onChange={(e) => handleAttendanceChange(student.idStudent, e.target.value)}
                                    className={styles.attendanceSelect}
                                    variant="sm"
                                  >
                                    <option value="">Не выбрано</option>
                                    <option value="present">Присутствовал</option>
                                    <option value="absent">Отсутствовал</option>
                                    <option value="late">Опоздал</option>
                                  </CustomSelect>
                                  <button
                                    className={styles.attendanceSaveBtn}
                                    onClick={() => handleMarkAttendance(student.idStudent)}
                                    disabled={
                                      isUpdatingAttendance === student.idStudent ||
                                      !attendanceForm[student.idStudent] ||
                                      attendanceForm[student.idStudent] === student.attendanceStatus
                                    }
                                  >
                                    {isUpdatingAttendance === student.idStudent
                                      ? '...'
                                      : <CheckIcon className={styles.btnIconSmall} />}
                                  </button>
                                </div>
                              ) : (
                                <span className={`${styles.attendanceBadge} ${getAttendanceStatusClass(student.attendanceStatus)}`}>
                                  {getAttendanceStatusText(student.attendanceStatus)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Оценки */}
                          <div className={styles.teacherActionRow}>
                            {isOwnLesson && editingStudentId === student.idStudent ? (
                              <div className={styles.gradeEditSection}>
                                <div className={styles.gradeInputsRow}>
                                  <div className={styles.gradeInputGroup}>
                                    <label className={styles.gradeLabel}>ДЗ (%)</label>
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      value={gradeForm[student.idStudent]?.homeworkPercent || 0}
                                      onChange={(e) => handleGradeChange(student.idStudent, 'homeworkPercent', e.target.value)}
                                      className={styles.gradeInput}
                                    />
                                  </div>
                                  <div className={styles.gradeInputGroup}>
                                    <label className={styles.gradeLabel}>Оценка</label>
                                    <input
                                      type="number"
                                      min="0"
                                      max="5"
                                      value={gradeForm[student.idStudent]?.score || 0}
                                      onChange={(e) => handleGradeChange(student.idStudent, 'score', e.target.value)}
                                      className={styles.gradeInput}
                                    />
                                  </div>
                                </div>
                                <div className={styles.gradeInputGroup}>
                                  <label className={styles.gradeLabel}>Комментарий</label>
                                  <textarea
                                    value={gradeForm[student.idStudent]?.feedback || ''}
                                    onChange={(e) => handleGradeChange(student.idStudent, 'feedback', e.target.value)}
                                    className={styles.gradeTextarea}
                                    rows={2}
                                    placeholder="Отзыв о работе..."
                                  />
                                </div>
                                <div className={styles.gradeActions}>
                                  <button
                                    className={styles.gradeSaveBtn}
                                    onClick={() => handleSubmitGrade(student.idStudent)}
                                    disabled={isUpdatingGrade === student.idStudent}
                                  >
                                    {isUpdatingGrade === student.idStudent ? 'Сохранение...' : 'Сохранить'}
                                  </button>
                                  <button
                                    className={styles.gradeCancelBtn}
                                    onClick={() => setEditingStudentId(null)}
                                    disabled={isUpdatingGrade === student.idStudent}
                                  >
                                    Отмена
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className={styles.gradeSummarySection}>
                                <div className={styles.gradeSummaryRow}>
                                  <span className={styles.teacherActionLabel}>Оценки:</span>
                                  <div className={styles.gradeSummaryValues}>
                                    {(student.homeworkPercent != null || student.score != null) ? (
                                      <>
                                        <span className={styles.gradeSummaryItem}>
                                          ДЗ: <strong>{student.homeworkPercent}%</strong>
                                        </span>
                                        {student.score != null && (
                                          <span className={styles.gradeSummaryItem}>
                                            Оценка: <strong>{student.score}</strong>
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      <span className={styles.gradeNotSet}>Не выставлены</span>
                                    )}
                                  </div>
                                  {isOwnLesson && (
                                    <button
                                      className={styles.gradeEditBtn}
                                      onClick={() => setEditingStudentId(student.idStudent)}
                                    >
                                      <EditIcon className={styles.btnIconSmall} />
                                      {(student.homeworkPercent != null || student.score != null) ? 'Изменить' : 'Выставить'}
                                    </button>
                                  )}
                                </div>
                                {student.feedback && (
                                  <div className={styles.gradeFeedback}>
                                    <span className={styles.feedbackLabel}>Комментарий:</span>
                                    <p className={styles.feedbackText}>{student.feedback}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* === ЗАПИСЬ НА ЗАНЯТИЕ (только для клиента) === */}
            {isClient && (
              <div className={styles.detailSection}>
                <h4 className={styles.detailSectionTitle}>
                  <CalendarCheckIcon className={styles.sectionIcon} />
                  Запись на занятие
                </h4>

                {enrollError && (
                  <div className={styles.enrollError}>
                    <AlertIcon className={styles.enrollErrorIcon} />
                    {enrollError}
                  </div>
                )}

                {isLoadingEnrollments ? (
                  <div className={styles.studentsLoading}>Загрузка данных...</div>
                ) : (
                  <>
                    {/* Список уже записанных студентов */}
                    {enrolledStudents.length > 0 && (
                      <div className={styles.enrolledSection}>
                        <p className={styles.enrolledTitle}>Записанные студенты:</p>
                        <div className={styles.enrolledList}>
                          {enrolledStudents.map((student) => {
                            const enrollment = enrollments.find(e => e.studentId === student.id_student);
                            const hasGrades = enrollment?.homeworkPercent != null || enrollment?.score != null;
                            return (
                            <div key={student.id_student} className={styles.enrolledStudentCard}>
                              <div className={styles.enrolledStudentInfo}>
                                <StudentIcon className={styles.enrolledStudentIcon} />
                                <span className={styles.enrolledStudentName}>
                                  {getStudentDisplayName(student)}
                                </span>
                                <span className={styles.enrolledBadge}>Записан</span>
                              </div>
                              <button
                                className={styles.cancelEnrollBtn}
                                onClick={() => handleCancelEnrollment(student.id_student)}
                                disabled={isCancelling === student.id_student}
                              >
                                <UserMinusIcon className={styles.btnIconSmall} />
                                {isCancelling === student.id_student ? 'Отмена...' : 'Отменить запись'}
                              </button>
                              {hasGrades && (
                                <div className={styles.studentHwStatus}>
                                  {enrollment?.homeworkPercent != null && (
                                    <span className={styles.hwStatusItem}>
                                      ДЗ: <strong>{enrollment.homeworkPercent}%</strong>
                                    </span>
                                  )}
                                  {enrollment?.score != null && (
                                    <span className={styles.hwStatusItem}>
                                      Оценка: <strong>{enrollment.score}</strong>
                                    </span>
                                  )}
                                  {enrollment?.feedback && (
                                    <span className={styles.hwFeedbackText}>
                                      {enrollment.feedback}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Занятие завершено — запись закрыта */}
                    {isLessonCompleted ? (
                      <div className={styles.completedNotice}>
                        <CalendarXIcon className={styles.completedNoticeIcon} />
                        Занятие завершено. Запись на него недоступна.
                      </div>
                    ) : (
                      <>
                        {/* Кнопка записи другого студента */}
                        {availableStudents.length > 0 && (
                          <div className={styles.enrollActionSection}>
                            {enrolledStudents.length > 0 ? (
                              <p className={styles.enrollHint}>Записать ещё одного студента:</p>
                            ) : (
                              <p className={styles.enrollHint}>Выберите студента для записи:</p>
                            )}
                            <button
                              className={styles.enrollTriggerBtn}
                              onClick={() => {
                                setShowEnrollModal(true);
                                setSelectedStudentToEnroll('');
                                setEnrollError('');
                              }}
                            >
                              <UserPlusIcon className={styles.btnIcon} />
                              {enrolledStudents.length > 0
                                ? 'Записать другого студента'
                                : 'Записаться на занятие'}
                            </button>
                          </div>
                        )}

                        {/* Все студенты уже записаны */}
                        {availableStudents.length === 0 && clientStudents.length > 0 && (
                          <div className={styles.allEnrolledNotice}>
                            <CheckIcon className={styles.allEnrolledIcon} />
                            Все ваши студенты уже записаны на это занятие
                          </div>
                        )}
                      </>
                    )}

                    {/* Нет студентов у клиента */}
                    {clientStudents.length === 0 && (
                      <div className={styles.noStudentsNotice}>
                        <AlertIcon className={styles.noStudentsIcon} />
                        У вас пока нет добавленных студентов. Обратитесь к администратору.
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* === СПИСОК СТУДЕНТОВ ДЛЯ АДМИНИСТРАТОРА === */}
            {isAdmin && (
              <div className={styles.detailSection}>
                <div className={styles.detailSectionHeader}>
                  <h4 className={styles.detailSectionTitle}>
                    <StudentIcon className={styles.sectionIcon} />
                    Записанные студенты
                  </h4>
                  {adminLessonDetails && (
                    <div className={styles.studentsStats}>
                      <span className={styles.statsBadge}>
                        Всего: {adminLessonDetails.students.length}
                      </span>
                      <span className={styles.statsBadge}>
                        Присутствуют: {adminLessonDetails.students.filter(s => s.attendanceStatus === 'present').length}
                      </span>
                      {adminLessonDetails.students.filter(s => s.attendanceStatus === 'absent').length > 0 && (
                        <span className={styles.statsBadge}>
                          Отсутствуют: {adminLessonDetails.students.filter(s => s.attendanceStatus === 'absent').length}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {isLoadingAdminStudents ? (
                  <div className={styles.studentsLoading}>Загрузка...</div>
                ) : !adminLessonDetails?.students?.length ? (
                  <div className={styles.studentsEmpty}>
                    <CalendarXIcon className={styles.emptyIcon} />
                    <p>На это занятие пока никто не записан</p>
                  </div>
                ) : (
                  <div className={styles.teacherStudentsList}>
                    {adminLessonDetails.students.map((student) => (
                      <div key={student.idStudent} className={styles.teacherStudentCard}>
                        <div className={styles.teacherStudentHeader}>
                          <div className={styles.teacherStudentInfo}>
                            <div className={styles.studentAvatar}>
                              <StudentIcon className={styles.studentAvatarIcon} />
                            </div>
                            <span className={styles.teacherStudentName}>
                              {student.fullName || `Студент #${student.idStudent}`}
                            </span>
                          </div>
                          <span className={`${styles.attendanceBadge} ${getAttendanceStatusClass(student.attendanceStatus)}`}>
                            {getAttendanceStatusText(student.attendanceStatus)}
                          </span>
                        </div>
                        {(student.homeworkPercent != null || student.score != null) && (
                          <div className={styles.gradeSummaryRow}>
                            <div className={styles.gradeSummaryValues}>
                              {student.homeworkPercent != null && (
                                <span className={styles.gradeSummaryItem}>
                                  ДЗ: <strong>{student.homeworkPercent}%</strong>
                                </span>
                              )}
                              {student.score != null && (
                                <span className={styles.gradeSummaryItem}>
                                  Оценка: <strong>{student.score}</strong>
                                </span>
                              )}
                            </div>
                            {student.feedback && (
                              <p className={styles.feedbackText}>{student.feedback}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Кнопки действий */}
            <div className={styles.detailActions}>
              {isAdmin && (
                <>
                  <button
                    className={styles.editBtn}
                    onClick={() => setIsEditing(true)}
                  >
                    <EditIcon className={styles.btnIcon} />
                    Редактировать
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <DeleteIcon className={styles.btnIcon} />
                    {isDeleting ? 'Удаление...' : 'Удалить занятие'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* === МОДАЛЬНОЕ ОКНО ВЫБОРА СТУДЕНТА ДЛЯ ЗАПИСИ === */}
      <Modal
        isOpen={showEnrollModal}
        onClose={() => {
          setShowEnrollModal(false);
          setSelectedStudentToEnroll('');
          setEnrollError('');
        }}
        title="Запись на занятие"
      >
        <div className={styles.enrollModalContent}>
          <p className={styles.enrollModalSubtitle}>
            Выберите студента, которого хотите записать на занятие <strong>"{lesson.title}"</strong>:
          </p>

          {enrollError && (
            <div className={styles.enrollError}>
              <AlertIcon className={styles.enrollErrorIcon} />
              {enrollError}
            </div>
          )}

          {availableStudents.length === 0 ? (
            <div className={styles.noStudentsNotice}>
              <AlertIcon className={styles.noStudentsIcon} />
              Нет доступных студентов для записи
            </div>
          ) : (
            <div className={styles.enrollStudentList}>
              {availableStudents.map((student) => (
                <div
                  key={student.id_student}
                  className={`${styles.enrollStudentItem} ${
                    selectedStudentToEnroll === student.id_student ? styles.enrollStudentItemSelected : ''
                  }`}
                  onClick={() => setSelectedStudentToEnroll(student.id_student)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedStudentToEnroll(student.id_student);
                    }
                  }}
                >
                  <div className={styles.enrollStudentRadio}>
                    {selectedStudentToEnroll === student.id_student ? (
                      <div className={styles.radioSelected}>
                        <CheckIcon className={styles.radioCheck} />
                      </div>
                    ) : (
                      <div className={styles.radioUnselected} />
                    )}
                  </div>
                  <StudentIcon className={styles.enrollStudentItemIcon} />
                  <span className={styles.enrollStudentItemName}>
                    {getStudentDisplayName(student)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className={styles.enrollModalActions}>
            <button
              className={styles.submitBtn}
              onClick={handleEnroll}
              disabled={!selectedStudentToEnroll || isEnrolling}
            >
              <CalendarCheckIcon className={styles.btnIconSmall} />
              {isEnrolling ? 'Запись...' : 'Записать на занятие'}
            </button>
            <button
              className={styles.cancelBtn}
              onClick={() => {
                setShowEnrollModal(false);
                setSelectedStudentToEnroll('');
                setEnrollError('');
              }}
              disabled={isEnrolling}
            >
              Отмена
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

// === Главный компонент ===
export const CalendarPage: React.FC = () => {
  const { user } = useAuth();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [currentWeek, setCurrentWeek] = useState(new Date());

  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<number | null>(null);

  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [isTeacherDropdownOpen, setIsTeacherDropdownOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Состояния для модального окна создания занятия
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: '',
    id_course: '',
    id_teacher: '',
    lesson_date: '',
    classroom: '',
    description: '',
    homework: '',
    duration_minutes: 60,
    number_in_course: 0,
  });

  // === Состояния для детального просмотра занятия ===
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // === WEEK RANGE ===
  const getWeekRange = (date: Date) => {
  const start = new Date(date);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  
  start.setDate(start.getDate() + diff);
  start.setHours(0, 0, 0, 0); // Начало понедельника 00:00:00

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999); // Конец воскресенья 23:59:59

  return { start, end };
};

  // === LOAD DATA ===
  useEffect(() => {
    loadAll();
  }, [currentWeek]);

  const loadAll = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { start, end } = getWeekRange(currentWeek);

      // Загружаем расписание в зависимости от роли
      let lessonsRes;
      if (user?.role === 'admin') {
        lessonsRes = await adminApi.getSchedule(start, end);
      } else if (user?.role === 'teacher') {
        lessonsRes = await teacherApi.getScheduleRange(start, end);
      } else if (user?.role === 'client') {
        lessonsRes = await clientApi.getScheduleRange(start, end);
      } else {
        lessonsRes = { data: [] };
      }

      const freshLessons = lessonsRes?.data || [];
      setLessons(freshLessons);

      // Обновляем selectedLesson свежими данными, чтобы модалка показывала актуальный статус
      if (isDetailModalOpen && selectedLesson) {
        const fresh = freshLessons.find(l => l.id_lesson === selectedLesson.id_lesson);
        if (fresh) setSelectedLesson(fresh);
      }

      // Загружаем справочники для ВСЕХ ролей
      if (user?.role === 'admin') {
        const [coursesRes, teachersRes] = await Promise.all([
          adminApi.getCourse(),
          adminApi.getTeachers(),
        ]);
        setCourses(coursesRes.data || []);
        setTeachers(teachersRes.data || []);
      } else if (user?.role === 'teacher') {
        const [coursesRes, teachersRes] = await Promise.all([
          teacherApi.getCourse(),
          teacherApi.getTeachers(),
        ]);
        setCourses(coursesRes.data || []);
        setTeachers(teachersRes.data || []);
      } else if (user?.role === 'client') {
        const [coursesRes, teachersRes] = await Promise.all([
          clientApi.getCourse(),
          clientApi.getTeachers(),
        ]);
        setCourses(coursesRes.data || []);
        setTeachers(teachersRes.data || []);
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ошибка загрузки календаря');
    } finally {
      setIsLoading(false);
    }
  };

  // === CREATE LESSON (только для админа) ===
  const handleCreateLesson = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const lessonData = {
      title: newLesson.title,
      courseId: Number(newLesson.id_course),
      teacherId: Number(newLesson.id_teacher),
      lessonDate: newLesson.lesson_date
        ? new Date(newLesson.lesson_date).toISOString()
        : new Date().toISOString(),
      classroom: newLesson.classroom,
      description: newLesson.description,
      homework: newLesson.homework,
      durationMinutes: Number(newLesson.duration_minutes),
      numberInCourse: Number(newLesson.number_in_course),
    };

    await adminApi.createLesson(lessonData);

    setIsLessonModalOpen(false);
    setNewLesson({
      title: '',
      id_course: '',
      id_teacher: '',
      lesson_date: '',
      classroom: '',
      description: '',
      homework: '',
      duration_minutes: 60,
      number_in_course: 0,
    });
    await loadAll();

  } catch (err: any) {
    console.error(err);
    setError(err.message || 'Ошибка создания занятия');
  } finally {
    setIsSubmitting(false);
  }
};

  // === OPEN LESSON DETAIL ===
  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsDetailModalOpen(true);
  };

  // === FILTER ===
  const filteredLessons = lessons.filter((lesson) => {
    return (
      (!selectedCourse || lesson.id_course === selectedCourse) &&
      (!selectedTeacher || lesson.id_teacher === selectedTeacher)
    );
  });

  // === HELPERS ===
  const getTeacherName = (id: number) =>
    teachers.find((t) => t.id === id)?.fullName || `Преподаватель #${id}`;

  const getCourseName = (id: number) =>
    courses.find((c) => c.id_cours === id)?.name || `Курс #${id}`;

  const getWeekDays = () => {
    const { start } = getWeekRange(currentWeek);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const days = getWeekDays();

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // === NAVIGATION ===
  const changeWeek = (delta: number) => {
    setCurrentWeek((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + delta);
      return newDate;
    });
  };

  const getSelectedCourseName = () => {
    if (!selectedCourse) return 'Все курсы';
    return courses.find(c => c.id_cours === selectedCourse)?.name || 'Курс';
  };

  const getSelectedTeacherName = () => {
    if (!selectedTeacher) return 'Все преподаватели';
    return teachers.find(t => t.id === selectedTeacher)?.fullName || 'Преподаватель';
  };

  // === RENDER ===
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loader}>Загрузка расписания...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.navSection}>
          <button onClick={() => changeWeek(-7)} className={styles.navBtn}>
            <ArrowIcon direction="left" />
          </button>

          <h2 className={styles.title}>
            {days[0].toLocaleDateString()} — {days[6].toLocaleDateString()}
          </h2>

          <button onClick={() => changeWeek(7)} className={styles.navBtn}>
            <ArrowIcon direction="right" />
          </button>
        </div>

        {/* ФИЛЬТРЫ И КНОПКА СОЗДАНИЯ */}
        <div className={styles.filtersSection}>
          {courses.length > 0 && (
            <div className={styles.filterWrapper}>
              <div
                className={styles.filterTrigger}
                onClick={() => {
                  setIsCourseDropdownOpen(!isCourseDropdownOpen);
                  setIsTeacherDropdownOpen(false);
                }}
              >
                <CourseIcon className={styles.filterIcon} />
                <span className={styles.filterText}>{getSelectedCourseName()}</span>
                {isCourseDropdownOpen ? (
                  <ChevronUpIcon className={styles.chevronIcon} />
                ) : (
                  <ChevronDownIcon className={styles.chevronIcon} />
                )}
              </div>

              {isCourseDropdownOpen && (
                <div className={styles.dropdown}>
                  <div
                    className={`${styles.dropdownItem} ${!selectedCourse ? styles.active : ''}`}
                    onClick={() => {
                      setSelectedCourse(null);
                      setIsCourseDropdownOpen(false);
                    }}
                  >
                    <span>Все курсы</span>
                  </div>
                  {courses.map((course) => (
                    <div
                      key={course.id_cours}
                      className={`${styles.dropdownItem} ${selectedCourse === course.id_cours ? styles.active : ''}`}
                      onClick={() => {
                        setSelectedCourse(course.id_cours);
                        setIsCourseDropdownOpen(false);
                      }}
                    >
                      <span>{course.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {teachers.length > 0 && (
            <div className={styles.filterWrapper}>
              <div
                className={styles.filterTrigger}
                onClick={() => {
                  setIsTeacherDropdownOpen(!isTeacherDropdownOpen);
                  setIsCourseDropdownOpen(false);
                }}
              >
                <TeacherIcon className={styles.filterIcon} />
                <span className={styles.filterText}>{getSelectedTeacherName()}</span>
                {isTeacherDropdownOpen ? (
                  <ChevronUpIcon className={styles.chevronIcon} />
                ) : (
                  <ChevronDownIcon className={styles.chevronIcon} />
                )}
              </div>

              {isTeacherDropdownOpen && (
                <div className={styles.dropdown}>
                  <div
                    className={`${styles.dropdownItem} ${!selectedTeacher ? styles.active : ''}`}
                    onClick={() => {
                      setSelectedTeacher(null);
                      setIsTeacherDropdownOpen(false);
                    }}
                  >
                    <span>Все преподаватели</span>
                  </div>
                  {teachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      className={`${styles.dropdownItem} ${selectedTeacher === teacher.id ? styles.active : ''}`}
                      onClick={() => {
                        setSelectedTeacher(teacher.id);
                        setIsTeacherDropdownOpen(false);
                      }}
                    >
                      <span>{teacher.fullName}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {user?.role === 'admin' && (
            <button
              className={styles.createLessonBtn}
              onClick={() => setIsLessonModalOpen(true)}
            >
              <PlusIcon className={styles.btnIcon} />
              Создать занятие
            </button>
          )}

          {(selectedCourse || selectedTeacher) && (
            <button
              className={styles.clearFiltersBtn}
              onClick={() => {
                setSelectedCourse(null);
                setSelectedTeacher(null);
              }}
              title="Сбросить все фильтры"
            >
              Сбросить ✕
            </button>
          )}
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* GRID */}
      <div className={styles.calendarWrapper}>
        <div className={styles.grid}>
          {/* HEADER */}
          <div className={styles.gridHeader}>
            <div></div>
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className={`${styles.dayHeader} ${isToday(day) ? styles.dayHeaderToday : ''}`}
              >
                <div className={styles.weekday}>
                  {day.toLocaleDateString('ru-RU', { weekday: 'short' })}
                </div>
                <div className={styles.dayNumber}>
                  {day.toLocaleDateString('ru-RU', { day: '2-digit' })}
                </div>
                {isToday(day) && <div className={styles.todayBadge}>Сегодня</div>}
              </div>
            ))}
          </div>

          {/* ROWS */}
          {HOURS.map((hour) => (
            <div key={hour} className={styles.row}>
              <div className={styles.time}>{hour}:00</div>

              {days.map((day) => {
                const lessonsInCell = filteredLessons.filter((l) => {
                  if (!l.lesson_date) return false;
                  const d = new Date(l.lesson_date);
                  return (
                    d.getFullYear() === day.getFullYear() &&
                    d.getMonth() === day.getMonth() &&
                    d.getDate() === day.getDate() &&
                    d.getHours() === hour
                  );
                });

                return (
                  <div
                    key={day.toISOString() + hour}
                    className={`${styles.cell} ${isToday(day) ? styles.cellToday : ''}`}
                  >
                    {lessonsInCell.map((lesson) => (
                      <div
                        key={lesson.id_lesson}
                        className={styles.lesson}
                        onClick={() => handleLessonClick(lesson)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleLessonClick(lesson);
                          }
                        }}
                      >
                        <div className={styles.lessonTitle}>
                          {lesson.title}
                        </div>
                        <div className={styles.lessonMeta}>
                          <CourseIcon className={styles.metaIcon} />
                          {getCourseName(lesson.id_course)}
                        </div>
                        <div className={styles.lessonMeta}>
                          <TeacherIcon className={styles.metaIcon} />
                          {getTeacherName(lesson.id_teacher)}
                        </div>
                        <div className={styles.lessonMeta}>
                          <ClassroomIcon className={styles.metaIcon} />
                          {lesson.classroom || '—'}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО СОЗДАНИЯ ЗАНЯТИЯ */}
{user?.role === 'admin' && (
  <Modal
    isOpen={isLessonModalOpen}
    onClose={() => setIsLessonModalOpen(false)}
    title="Создание нового занятия"
  >
    <form onSubmit={handleCreateLesson} className={styles.form}>
      <div className={styles.formGroup}>
        <label>Название занятия *</label>
        <input
          type="text"
          required
          value={newLesson.title}
          onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
          className={styles.input}
          placeholder="Введите название занятия"
        />
      </div>

      <div className={styles.formGroup}>
        <label>Курс *</label>
        <CustomSelect
          required
          value={newLesson.id_course}
          onChange={(e) => setNewLesson({ ...newLesson, id_course: e.target.value })}
        >
          <option value="">Выберите курс</option>
          {courses.map((course) => (
            <option key={course.id_cours} value={course.id_cours}>
              {course.name}
            </option>
          ))}
        </CustomSelect>
      </div>

      <div className={styles.formGroup}>
        <label>Преподаватель *</label>
        <CustomSelect
          required
          value={newLesson.id_teacher}
          onChange={(e) => setNewLesson({ ...newLesson, id_teacher: e.target.value })}
        >
          <option value="">Выберите преподавателя</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.fullName}
            </option>
          ))}
        </CustomSelect>
      </div>

      <div className={styles.formGroup}>
        <label>Номер урока в курсе</label>
        <input
          type="number"
          min="0"
          value={newLesson.number_in_course}
          onChange={(e) => {
            const value = e.target.value;
            if (value === '') {
              setNewLesson({ ...newLesson, number_in_course: 0 });
            } else {
              const numValue = parseInt(value, 10);
              if (!isNaN(numValue)) {
                setNewLesson({ ...newLesson, number_in_course: numValue });
              }
            }
          }}
          className={styles.input}
          placeholder="Введите номер урока"
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Дата *</label>
          <CustomDatePicker
            value={newLesson.lesson_date.split('T')[0] || ''}
            onChange={(date) => {
              const timePart = newLesson.lesson_date.split('T')[1] || '10:00';
              setNewLesson({
                ...newLesson,
                lesson_date: `${date}T${timePart}`
              });
            }}
            placeholder="Выберите дату"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Время *</label>
          <input
            type="time"
            value={newLesson.lesson_date.split('T')[1] || '10:00'}
            onChange={(e) => {
              const datePart = newLesson.lesson_date.split('T')[0] || new Date().toISOString().split('T')[0];
              setNewLesson({
                ...newLesson,
                lesson_date: `${datePart}T${e.target.value}`
              });
            }}
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Длительность (мин)</label>
        <CustomSelect
          value={newLesson.duration_minutes}
          onChange={(e) => setNewLesson({ ...newLesson, duration_minutes: Number(e.target.value) })}
        >
          <option value="30">30 минут</option>
          <option value="45">45 минут</option>
          <option value="60">60 минут</option>
          <option value="90">90 минут</option>
          <option value="120">120 минут</option>
        </CustomSelect>
      </div>

      <div className={styles.formGroup}>
        <label>Аудитория</label>
        <input
          type="text"
          value={newLesson.classroom}
          onChange={(e) => setNewLesson({ ...newLesson, classroom: e.target.value })}
          className={styles.input}
          placeholder="Например: 101, Онлайн"
        />
      </div>

      <div className={styles.formGroup}>
        <label>Описание</label>
        <textarea
          value={newLesson.description}
          onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
          className={styles.textarea}
          rows={3}
          placeholder="Описание занятия..."
        />
      </div>

      <div className={styles.formGroup}>
        <label>Домашнее задание</label>
        <textarea
          value={newLesson.homework}
          onChange={(e) => setNewLesson({ ...newLesson, homework: e.target.value })}
          className={styles.textarea}
          rows={3}
          placeholder="Домашнее задание..."
        />
      </div>

      <div className={styles.formActions}>
        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
          {isSubmitting ? 'Создание...' : 'Создать занятие'}
        </button>
        <button
          type="button"
          className={styles.cancelBtn}
          onClick={() => setIsLessonModalOpen(false)}
        >
          Отмена
        </button>
      </div>
    </form>
  </Modal>
)}

      {/* === МОДАЛЬНОЕ ОКНО ДЕТАЛЬНОГО ПРОСМОТРА ЗАНЯТИЯ === */}
      <LessonDetailModal
        lesson={selectedLesson}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedLesson(null);
        }}
        onUpdate={loadAll}
        courses={courses}
        teachers={teachers}
      />
    </div>
  );
};