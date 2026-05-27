// import { useState, useEffect } from 'react';
// import type { DashboardFilters, Course, Student, StudentComparison } from '../../types';
// import { apiService } from '../../services/api';
// import { FiltersPanel } from '../Filters/FiltersPanel';
// import { LineChart } from '../Charts/LineChart';
// import { DoughnutChart } from '../Charts/DoughnutChart';
// import { BarChart } from '../Charts/BarChart';
// //import { StudentsComparison } from '../Charts/StudentsComparison';
// import { Card } from '../common/Card/Card';
// import { LoadingSpinner } from '../common/LoadingSpinner/LoadingSpinner';
// import styles from './Dashboard.module.css';
// import { TiStarFullOutline, TiChartBar } from "react-icons/ti";
// import { LuNotebookText } from "react-icons/lu";
// import { FaPercent } from "react-icons/fa";



// export const Dashboard = () => {
//   const [filters, setFilters] = useState<DashboardFilters>({
//     dateRange: { start: '2026-01-01', end: '2026-03-31' },
//     courseId: null,
//     studentId: null,
//     clientId: null,
//   });

//   const [courses, setCourses] = useState<Course[]>([]);
//   const [students, setStudents] = useState<Student[]>([]);
//   const [comparisonData, setComparisonData] = useState<StudentComparison[] | null>(null);
  
//   // Данные для графиков отдельного студента
//   const [scoresData, setScoresData] = useState<any>(null);
//   const [attendanceData, setAttendanceData] = useState<any>(null);
//   const [homeworkData, setHomeworkData] = useState<any>(null);
  
//   const [loading, setLoading] = useState(false);

//   const [courseStats, setCourseStats] = useState<any | null>(null);

//   // Загрузка курсов
//   useEffect(() => {
//     apiService.getCourses().then(setCourses);
//   }, []);

//   // Загрузка студентов при выборе родителя
//   useEffect(() => {
//     if (filters.clientId) {
//       apiService.getStudentsByClient(filters.clientId).then(setStudents);
//     } else {
//       setStudents([]);
//     }
//   }, [filters.clientId]);

//   // Загрузка всех данных при изменении фильтров
// // Загрузка всех данных при изменении фильтров
// useEffect(() => {
//   const loadData = async () => {
//     setLoading(true);
//     try {
//       // 1. Сравнение студентов по курсу (все студенты, если выбран курс)
//       if (filters.courseId) {
//         const comparison = await apiService.getStudentsComparison(
//           filters.courseId,
//           filters.dateRange.start,
//           filters.dateRange.end
//         );
//         setComparisonData(comparison);
//       } else {
//         setComparisonData(null);
//       }

//       // 2. Детальные данные для графиков И статистика студента
//       if (filters.studentId && filters.courseId) {
//         const [attendance, lessons, studentStats] = await Promise.all([
//           apiService.getStudentAttendance(filters.studentId, filters.courseId),
//           apiService.getCourseLessons(filters.courseId),
//           apiService.getStudentCourseStats(  // <-- НОВЫЙ МЕТОД
//             filters.studentId,
//             filters.courseId,
//             filters.dateRange.start,
//             filters.dateRange.end
//           )
//         ]);
        
//         setScoresData(prepareScoresData(attendance, lessons));
//         setAttendanceData(prepareAttendanceData(attendance, lessons));
//         setHomeworkData(prepareHomeworkData(attendance, lessons));
//         setCourseStats(studentStats); // <-- статистика только выбранного студента
//       } else {
//         setScoresData(null);
//         setAttendanceData(null);
//         setHomeworkData(null);
//         setCourseStats(null);
//       }
//     } catch (error) {
//       console.error('Error loading data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   loadData();
// }, [filters.studentId, filters.courseId, filters.clientId, filters.dateRange.start, filters.dateRange.end]);

//   // Вспомогательная функция: оценки за занятия
//   const prepareScoresData = (attendance: any[], lessons: any[]) => {
//     if (!lessons.length || !attendance.length) return null;

//     const sortedLessons = [...lessons].sort((a, b) => 
//       new Date(a.date).getTime() - new Date(b.date).getTime()
//     );

//     const scores = sortedLessons.map(lesson => {
//       const record = attendance.find(a => a.id_lesson === lesson.id_lesson);
//       return record?.feedback_score ?? null;
//     });

//     const lineData = scores.map(s => s === null ? undefined : s);

//     return {
//       labels: sortedLessons.map(l => {
//         const date = new Date(l.date);
//         return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
//       }),
//       datasets: [
//         {
//           label: 'Оценка за урок',
//           data: lineData.filter((v): v is number => v !== undefined),
//           borderColor: '#F59E0B',
//           backgroundColor: '#F59E0B',
//           borderWidth: 2,
//           tension: 0.3,
//           pointRadius: 6,
//           pointHoverRadius: 8,
//         },
//         {
//           label: 'Точки оценок',
//           data: scores.map((s, i) => s !== null ? s : undefined).filter((v): v is number => v !== undefined),
//           // backgroundColor: scores.map(s => {
//           //   if (s === 5) return '#10B981';
//           //   if (s === 4) return '#3B82F6';
//           //   if (s === 3) return '#4F46E5';
//           //   if (s === 2) return '#EF4444';
//           //   return '#7C3AED';
//           // }).filter((_, i) => scores[i] !== null),
//           pointRadius: 8,
//           showLine: false
//         }
//       ]
//     };
//   };

//   // Вспомогательная функция: посещаемость (круговая)
//   const prepareAttendanceData = (attendance: any[], lessons: any[]) => {
//     if (!lessons.length) return null;

//     let attended = 0;
//     let missed = 0;
//     let unknown = 0;

//     lessons.forEach(lesson => {
//       const record = attendance.find(a => a.id_lesson === lesson.id_lesson);
//       if (!record) {
//         unknown++;
//       } else if (record.attended) {
//         attended++;
//       } else {
//         missed++;
//       }
//     });

//     return {
//       labels: [`Посещено (${attended})`, `Пропущено (${missed})`, `Нет данных (${unknown})`],
//       datasets: [{
//         label: 'Посещаемость',
//         data: [attended, missed, unknown],
//         backgroundColor: ['#10B981', '#EF4444', '#9CA3AF'],
//         borderWidth: 0,
//         hoverOffset: 4
//       }]
//     };
//   };

//   // Вспомогательная функция: домашние задания (stacked bar)
// const prepareHomeworkData = (attendance: any[], lessons: any[]) => {
//   if (!lessons.length) return null;

//   const sortedLessons = [...lessons].sort((a, b) => 
//     new Date(a.date).getTime() - new Date(b.date).getTime()
//   );

//   const completionPercent: (number | null)[] = [];

//   sortedLessons.forEach(lesson => {
//     const record = attendance.find(a => a.id_lesson === lesson.id_lesson);
    
//     if (!record || !record.attended) {
//       // Не был на занятии - нет данных
//       completionPercent.push(null);
//     } else {
//       // Процент выполнения (0-1)
//       const percent = record.homework_percentage !== undefined 
//         ? record.homework_percentage / 100 
//         : (record.homework_completed ? 1 : 0);
      
//       completionPercent.push(percent);
//     }
//   });

//   // Цвета по проценту
//   const completionColors = completionPercent.map(p => {
//     if (p === null) return 'transparent';
//     if (p >= 0.9) return '#10B981'; // зелёный (90-100%)
//     if (p >= 0.7) return '#34D399'; // светло-зелёный (70-89%)
//     if (p >= 0.5) return '#FBBF24'; // жёлтый (50-69%)
//     if (p >= 0.3) return '#F97316'; // оранжевый (30-49%)
//     return '#EF4444'; // красный (0-29%)
//   });

//   return {
//     labels: sortedLessons.map(l => {
//       const date = new Date(l.date);
//       return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
//     }),
//     datasets: [
//       {
//         label: 'Выполнение ДЗ (%)',
//         data: completionPercent,
//         backgroundColor: completionColors,
//         barPercentage: 0.7,
//         categoryPercentage: 0.8
//       }
//     ]
//   };
// };

//   const selectedStudent = students.find(s => s.id_student === filters.studentId);

//   // Отладка: проверьте в консоли
//   console.log('Filters:', filters);
//   console.log('ScoresData:', scoresData);
//   console.log('AttendanceData:', attendanceData);
//   console.log('HomeworkData:', homeworkData);

//   return (
//     <div className={styles.dashboard}>
//       <h1 className={styles.title}> <TiChartBar  color="#F97316" size="20" /> Дашборд образовательного центра</h1>
      
//       <FiltersPanel 
//         filters={filters} 
//         onFiltersChange={setFilters} 
//         courses={courses}
//         students={students}
//       />
      
//       {loading && <LoadingSpinner />}
      
//       {!loading && (
//         <div className={styles.chartsGrid}>
//           {/* График оценок */}
//           {scoresData && selectedStudent && (
//             <Card title={`Оценки: ${selectedStudent.full_name}`}>
//               <div className={styles.chartContainer}>
//                 <LineChart data={scoresData} title="Оценки по датам занятий" />
//               </div>
//             </Card>
//           )}
          
//           {/* Посещаемость и ДЗ */}
//           <div className={styles.chartsRow}>
//             {attendanceData && selectedStudent && (
//               <Card title="Посещаемость">
//                 <div className={styles.chartContainerSmall}>
//                   <DoughnutChart data={attendanceData} title="" />
//                 </div>
//               </Card>
//             )}
//             {homeworkData && selectedStudent && (
//               <Card title="Домашние задания">
//                 <div className={styles.chartContainer}>
//                   <BarChart data={homeworkData} title="" />
//                 </div>
//               </Card>
//             )}
//           </div>

// {courseStats && selectedStudent && (
//   <Card title={`Статистика: ${selectedStudent.full_name}`}>
//     <div className={styles.statsGrid}>
//       <div className={styles.statCard}>
//         <div className={styles.statValue}>
//           {courseStats.avg_attendance?.toFixed(1) || 0} <FaPercent size='20' color="#10B981"/>
//         </div>
//         <div className={styles.statLabel}>
//           Посещаемость ({courseStats.attended_lessons}/{courseStats.total_lessons} занятий)
//         </div>
//       </div>
//       <div className={styles.statCard}>
//         <div className={styles.statValue}>
//           {courseStats.avg_homework_completion?.toFixed(1) || 0} <FaPercent size='20' color="#10B981"/>
//         </div>
//         <div  className={styles.statLabel}>Выполнение ДЗ</div>
//       </div>
//       <div className={styles.statCard}>
//         <div className={styles.statValue}>
//           {courseStats.avg_feedback?.toFixed(1) || 0} <TiStarFullOutline color="#FFD700"/>
//         </div>
//         <div className={styles.statLabel}>Средняя оценка</div>
//       </div>
//     </div>
//   </Card>
// )}
//           {/* Сообщение если нет данных */}
//           {!scoresData && !comparisonData && (
//             <div className={styles.noData}>
//               <p>Выберите студента и курс для отображения данных</p>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };