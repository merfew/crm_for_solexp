// src/components/StudentProgress/StudentProgressWithTrain.tsx
import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { clientApi } from '../../services/clientApi';
import { adminApi } from '../../services/adminApi';
import { useAuth } from '../../hooks/useAuth';
import type { Student, AttendanceHistoryDto, LessonPerformanceDto, StudentFullProgressDto, Course } from '../../types';
import { BarChart } from '../Charts/BarChart';
import { DoughnutChart } from '../Charts/DoughnutChart';
import { LineChart } from '../Charts/LineChart';
import { Card } from '../common/Card/Card';
import { LoadingSpinner } from '../common/LoadingSpinner/LoadingSpinner';
import { Train } from '../Train/Train';
import styles from './StudentProgress.module.css';

// Простые иконки SVG
const StudentIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CourseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

interface StudentProgressWithTrainProps {
  studentId?: number;
  courseId?: number;
}

export const StudentProgressWithTrain: React.FC<StudentProgressWithTrainProps> = ({
  studentId: propStudentId,
  courseId: propCourseId
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [students, setStudents] = useState<Array<{ id_student: number; full_name?: string | null }>>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(propStudentId || null);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(propCourseId || null);
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);

  const [progressData, setProgressData] = useState<StudentFullProgressDto | null>(null);
  const [performanceData, setPerformanceData] = useState<LessonPerformanceDto[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceHistoryDto[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Рефы для отслеживания кликов вне дропдаунов
  const studentDropdownRef = useRef<HTMLDivElement>(null);
  const courseDropdownRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // Закрытие дропдаунов при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target as Node)) {
        setIsStudentDropdownOpen(false);
      }
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target as Node)) {
        setIsCourseDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Загрузка списков
  useEffect(() => {
    loadStudents();
    loadCourses();
  }, []);

  // Загрузка данных при изменении студента или курса
  useEffect(() => {
    if (selectedStudentId && selectedCourseId) {
      loadStudentData(selectedStudentId, selectedCourseId);
    }
  }, [selectedStudentId, selectedCourseId]);

  const loadStudents = async () => {
    try {
      const response = isAdmin
        ? await adminApi.getAllStudents()
        : await clientApi.getStudents();
      const studentsData: Student[] = response.data || [];
      setStudents(studentsData);
      if (!propStudentId && studentsData.length > 0 && !selectedStudentId) {
        setSelectedStudentId(studentsData[0].id_student);
      }
    } catch (err: any) {
      console.error('Ошибка загрузки студентов:', err);
      setError('Ошибка загрузки списка студентов');
    }
  };

  const loadCourses = async () => {
    try {
      const response = isAdmin
        ? await adminApi.getCourse()
        : await clientApi.getCourse();
      const coursesData = response.data || [];
      setCourses(coursesData);
      if (!propCourseId && coursesData.length > 0 && !selectedCourseId) {
        setSelectedCourseId(coursesData[0].id_cours);
      }
    } catch (err: any) {
      console.error('Ошибка загрузки курсов:', err);
      setError('Ошибка загрузки списка курсов');
    }
  };

  const loadStudentData = async (studentId: number, courseId: number) => {
    setLoading(true);
    setError('');
    try {
      const [progress, performance, attendance] = await Promise.all([
        isAdmin
          ? adminApi.getStudentProgress(studentId, courseId)
          : clientApi.getStudentProgress(studentId, courseId),
        isAdmin
          ? adminApi.getStudentPerformance(studentId, courseId)
          : clientApi.getStudentPerformance(studentId, courseId),
        isAdmin
          ? adminApi.getStudentAttendance(studentId, courseId)
          : clientApi.getStudentAttendance(studentId, courseId),
      ]);
      setProgressData(progress.data);
      setPerformanceData(performance.data || []);
      setAttendanceData(attendance.data || []);
    } catch (err: any) {
      console.error('Ошибка загрузки данных студента:', err);
      setError(err.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const selectedStudent = students.find(s => s.id_student === selectedStudentId);
  const selectedCourse = courses.find(c => c.id_cours === selectedCourseId);

  const handleExport = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f8f9fa',
        logging: false,
      });
      const link = document.createElement('a');
      const studentName = (selectedStudent?.full_name ?? 'студент').replace(/\s+/g, '_');
      const courseName = (selectedCourse?.name ?? 'курс').replace(/\s+/g, '_');
      const date = new Date().toLocaleDateString('ru-RU').replace(/\./g, '-');
      link.download = `прогресс_${studentName}_${courseName}_${date}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } finally {
      setIsExporting(false);
    }
  };

  const handleStudentSelect = (studentId: number) => {
    setSelectedStudentId(studentId);
    setIsStudentDropdownOpen(false);
  };

  const handleCourseSelect = (courseId: number) => {
    setSelectedCourseId(courseId);
    setIsCourseDropdownOpen(false);
  };

  const prepareScoresData = () => {
    if (!performanceData.length) return null;

    const sortedData = [...performanceData].sort((a, b) => 
      new Date(a.lessonDate || '').getTime() - new Date(b.lessonDate || '').getTime()
    );

    return {
      labels: sortedData.map(p => {
        const date = new Date(p.lessonDate || '');
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
      }),
      datasets: [{
        label: 'Оценка',
        data: sortedData.map(p => p.score),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: '#F59E0B',
        fill: true,
      }]
    };
  };

  const prepareHomeworkData = () => {
    if (!performanceData.length) return null;

    const sortedData = [...performanceData].sort((a, b) => 
      new Date(a.lessonDate || '').getTime() - new Date(b.lessonDate || '').getTime()
    );

    const colors = sortedData.map(p => {
      const percent = p.homeworkPercent || 0;
      if (percent >= 90) return '#5EA020';
      if (percent >= 70) return '#85BE2A';
      if (percent >= 50) return '#FBBF24';
      if (percent >= 30) return '#F97316';
      return '#EF4444';
    });

    return {
      labels: sortedData.map(p => {
        const date = new Date(p.lessonDate || '');
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
      }),
      datasets: [{
        label: 'Выполнение ДЗ (%)',
        data: sortedData.map(p => p.homeworkPercent || 0),
        backgroundColor: colors,
        barPercentage: 0.6,
        categoryPercentage: 0.8,
      }]
    };
  };

  const prepareAttendanceData = () => {
    if (!progressData) return null;

    const attended = progressData.attendedLessons || 0;
    const total = progressData.totalLessons || 0;
    if (total === 0) return null;

    const absent = attendanceData.filter(
      r => r.attendanceStatus === 'absent'
    ).length;
    const planned = Math.max(0, total - attended - absent);

    return {
      labels: ['Посещено', 'Пропущено', 'Запланировано'],
      datasets: [{
        data: [attended, absent, planned],
        backgroundColor: ['#5EA020', '#EF4444', '#DFF2BA'],
        borderWidth: 0,
        hoverOffset: 6,
      }]
    };
  };

  // Подготовка данных для компонента Train
  const trainData = progressData ? {
    totalLessons: progressData.totalLessons,
    completedLessons: progressData.completedLessons,
    currentLesson: progressData.completedLessons + 1,
    lessonTitles: performanceData
      .sort((a, b) => new Date(a.lessonDate || '').getTime() - new Date(b.lessonDate || '').getTime())
      .map(l => l.title || 'Без названия'),
  } : null;

  if (loading) return <div className={styles.container}><LoadingSpinner /></div>;

  return (
    <div className={styles.container}>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>Прогресс студента</h2>
      </div>

      {/* Фильтры + кнопка экспорта в одну строку */}
      <div className={styles.controlsBar}>
        {/* Выбор студента */}
        <div className={styles.filterGroup} ref={studentDropdownRef}>
          <label className={styles.filterLabel}>Студент</label>
          <div
            className={styles.selectorTrigger}
            onClick={(e) => {
              e.stopPropagation();
              setIsStudentDropdownOpen(!isStudentDropdownOpen);
              setIsCourseDropdownOpen(false);
            }}
          >
            <StudentIcon className={styles.selectorIcon} />
            <span className={styles.selectorText}>
              {selectedStudent?.full_name || 'Выберите студента'}
            </span>
            <ChevronDownIcon className={`${styles.chevronIcon} ${isStudentDropdownOpen ? styles.chevronOpen : ''}`} />
          </div>

          {isStudentDropdownOpen && (
            <div className={styles.dropdown}>
              {students.length === 0 ? (
                <div className={styles.dropdownEmpty}>Нет доступных студентов</div>
              ) : (
                students.map(student => (
                  <div
                    key={student.id_student}
                    className={`${styles.dropdownItem} ${selectedStudentId === student.id_student ? styles.active : ''}`}
                    onClick={() => handleStudentSelect(student.id_student)}
                  >
                    <StudentIcon className={styles.dropdownIcon} />
                    <span>{student.full_name || `Студент #${student.id_student}`}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Выбор курса */}
        <div className={styles.filterGroup} ref={courseDropdownRef}>
          <label className={styles.filterLabel}>Курс</label>
          <div
            className={styles.selectorTrigger}
            onClick={(e) => {
              e.stopPropagation();
              setIsCourseDropdownOpen(!isCourseDropdownOpen);
              setIsStudentDropdownOpen(false);
            }}
          >
            <CourseIcon className={styles.selectorIcon} />
            <span className={styles.selectorText}>
              {selectedCourse?.name || 'Выберите курс'}
            </span>
            <ChevronDownIcon className={`${styles.chevronIcon} ${isCourseDropdownOpen ? styles.chevronOpen : ''}`} />
          </div>

          {isCourseDropdownOpen && (
            <div className={styles.dropdown}>
              {courses.length === 0 ? (
                <div className={styles.dropdownEmpty}>Нет доступных курсов</div>
              ) : (
                courses.map(course => (
                  <div
                    key={course.id_cours}
                    className={`${styles.dropdownItem} ${selectedCourseId === course.id_cours ? styles.active : ''}`}
                    onClick={() => handleCourseSelect(course.id_cours)}
                  >
                    <CourseIcon className={styles.dropdownIcon} />
                    <span>{course.name || `Курс #${course.id_cours}`}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {progressData && (
          <button
            className={styles.exportBtn}
            onClick={handleExport}
            disabled={isExporting}
            title="Экспортировать как изображение"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={styles.exportIcon}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {isExporting ? 'Экспорт...' : 'Экспорт PNG'}
          </button>
        )}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {progressData && (
        <div ref={reportRef} className={styles.report}>
          <div className={styles.reportHeader}>
            <span className={styles.reportMeta}>
              {selectedStudent?.full_name ?? '—'} · {selectedCourse?.name ?? '—'}
            </span>
            <span className={styles.reportDate}>
              {new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* Поезд прогресса */}
          {trainData && (
            <div className={styles.trainWrapper}>
              <Train
                totalLessons={trainData.totalLessons}
                completedLessons={trainData.completedLessons}
                currentLesson={trainData.currentLesson}
                lessonTitles={trainData.lessonTitles}
              />
            </div>
          )}

          {/* Основные метрики */}
          <div className={styles.metricsGrid}>
            <Card title="Посещаемость">
              <div className={styles.metricContent}>
                <div className={styles.metricValue}>
                  {progressData.attendanceRate?.toFixed(0) || 0}%
                </div>
                <div className={styles.metricSubtext}>
                  {progressData.attendedLessons || 0} из {progressData.totalLessons || 0} занятий
                </div>
              </div>
            </Card>

            <Card title="Домашние задания">
              <div className={styles.metricContent}>
                <div className={styles.metricValue}>
                  {progressData.averageHomeworkPercent?.toFixed(0) || 0}%
                </div>
                <div className={styles.metricSubtext}>
                  {progressData.completedLessons || 0} завершено
                </div>
              </div>
            </Card>

            <Card title="Средняя оценка">
              <div className={styles.metricContent}>
                <div className={styles.metricValue}>
                  {progressData.averageScore?.toFixed(1) || '0.0'}
                </div>
                <div className={styles.metricSubtext}>
                  за {progressData.totalLessons || 0} занятий
                </div>
              </div>
            </Card>
          </div>

          {/* Графики */}
          <div className={styles.chartsGrid}>
            {performanceData.length > 0 && (
              <Card title="Динамика оценок">
                <div className={styles.chartContainer}>
                  <LineChart data={prepareScoresData()} />
                </div>
              </Card>
            )}

            {prepareAttendanceData() && (
              <Card title="Посещаемость">
                <div className={styles.chartContainerSmall}>
                  <DoughnutChart
                    data={prepareAttendanceData()}
                    centerPercent={progressData?.attendanceRate}
                  />
                </div>
              </Card>
            )}
          </div>

          {/* Выполнение ДЗ и История посещений в одном ряду */}
          <div className={styles.chartsGrid}>
            {performanceData.length > 0 && (
              <Card title="Выполнение домашних заданий">
                <div className={styles.chartContainer}>
                  <BarChart data={prepareHomeworkData()} />
                </div>
              </Card>
            )}

            {attendanceData.length > 0 && (
              <Card title="История посещений">
                <div className={styles.attendanceHistory}>
                  {attendanceData.slice(0, 10).map((record, index) => (
                    <div key={index} className={styles.attendanceRecord}>
                      <div className={styles.recordDate}>
                        {new Date(record.lessonDate || '').toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </div>
                      <div className={styles.recordInfo}>
                        <span className={styles.recordTitle}>{record.lessonTitle}</span>
                        <span className={styles.recordTeacher}>{record.teacherName}</span>
                      </div>
                      <div className={`${styles.recordStatus} ${
                        record.attendanceStatus === 'present' ? styles.statusPresent :
                        record.attendanceStatus === 'absent' ? styles.statusAbsent :
                        styles.statusUnknown
                      }`}>
                        {record.attendanceStatus === 'present' ? '✓' :
                         record.attendanceStatus === 'absent' ? '✗' : '?'}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {!progressData && !loading && (
        <div className={styles.noData}>
          Выберите студента и курс для отображения данных
        </div>
      )}
    </div>
  );
};