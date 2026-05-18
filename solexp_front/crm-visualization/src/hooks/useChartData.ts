// import { useMemo } from 'react';
// import { 
//   mockProgress, 
//   mockStudents,  
//   mockLessons,
//   mockAttendance,
// } from '../mockData/mockData';
// import type { ChartData, StudentComparison  } from '../types';

// // Цвета
// const COLORS = {
//   score5: '#10B981',      // зелёный
//   score4: '#3B82F6',      // синий
//   score3: '#F59E0B',      // жёлтый
//   score2: '#EF4444',      // красный
//   score1: '#7C3AED',      // фиолетовый
//   attended: '#10B981',    // посетил
//   missed: '#EF4444',      // пропуск
//   unknown: '#9CA3AF',     // нет данных
//   homeworkDone: '#10B981',
//   homeworkNotDone: '#F59E0B',
//   noHomework: '#9CA3AF'
// };

// // === 1. ЛИНЕЙНЫЙ ГРАФИК: Оценки за уроки по датам ===
// export const useLessonScoresChart = (studentId: number, courseId: number): ChartData => {
//   return useMemo(() => {
//     const lessons = mockLessons
//       .filter(l => l.id_course === courseId)
//       .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
//     const attendance = mockAttendance.filter(a => a.id_student === studentId);
    
//     const scores = lessons.map(lesson => {
//       const record = attendance.find(a => a.id_lesson === lesson.id_lesson);
//       return record?.feedback_score ?? null; // null если нет оценки
//     });

//     // Точки для линии (пропускаем null для линии, но показываем на графике)
//     const lineData = scores.map(s => s === null ? undefined : s);

//     return {
//       labels: lessons.map(l => {
//         const date = new Date(l.date);
//         return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
//       }),
//       datasets: [
//         {
//           label: 'Оценка за урок',
//           data: lineData as number[],
//           borderColor: '#4F46E5',
//           backgroundColor: '#4F46E5',
//           borderWidth: 2,
//           tension: 0.3,
//           pointRadius: 6,
//           pointHoverRadius: 8,
//           spanGaps: false // не соединяем через пропуски
//         },
//         {
//           label: 'Точки оценок',
//           data: scores.map((s, i) => s !== null ? s : undefined) as number[],
//           backgroundColor: scores.map(s => {
//             if (s === 5) return COLORS.score5;
//             if (s === 4) return COLORS.score4;
//             if (s === 3) return COLORS.score3;
//             if (s === 2) return COLORS.score2;
//             return COLORS.score1;
//           }) as string[],
//           pointRadius: 8,
//           pointStyle: 'circle',
//           showLine: false // только точки
//         }
//       ]
//     };
//   }, [studentId, courseId]);
// };

// // === 2. КРУГОВАЯ ДИАГРАММА: Посещаемость ===
// export const useAttendanceDoughnutChart = (studentId: number, courseId: number): ChartData => {
//   return useMemo(() => {
//     const lessons = mockLessons.filter(l => l.id_course === courseId);
//     const attendance = mockAttendance.filter(a => a.id_student === studentId);
    
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

//     //const total = lessons.length;
//     const data = [attended, missed, unknown];
//     const labels = [
//       `Посещено (${attended})`,
//       `Пропущено (${missed})`,
//       `Нет данных (${unknown})`
//     ];

//     return {
//       labels,
//       datasets: [{
//         label: 'Посещаемость',
//         data,
//         backgroundColor: [COLORS.attended, COLORS.missed, COLORS.unknown],
//         borderWidth: 0,
//         hoverOffset: 4
//       }]
//     };
//   }, [studentId, courseId]);
// };

// // === Подготовка данных для сравнения студентов ===
// export const prepareStudentsComparison = (
//   courseId: number,
//   periodStart?: string,
//   periodEnd?: string
// ): StudentComparison[] => {
//   const students = mockStudents.filter(s => 
//     mockProgress.some(p => p.id_student === s.id_student && p.id_course === courseId)
//   );

//   return students.map(student => {
//     let progress = mockProgress.filter(p => 
//       p.id_student === student.id_student && 
//       p.id_course === courseId
//     );

//     if (periodStart && periodEnd) {
//       progress = progress.filter(p => 
//         p.period_start >= periodStart && p.period_end <= periodEnd
//       );
//     }

//     // Берём последний период или агрегируем
//     const latest = progress.sort((a, b) => 
//       new Date(b.period_end).getTime() - new Date(a.period_end).getTime()
//     )[0];

//     return {
//       student_id: student.id_student,
//       student_name: student.full_name,
//       attendance_rate: latest?.attendance_rate || 0,
//       homeworks_rate: latest?.homework_rate || 0,
//       feedback_avg: latest?.avg_score_cumulative || 0,
//       lessons_count: latest?.lessons_total || 0
//     };
//   });
// };

// // === 3. СТОЛБЧАТАЯ С НАКОПЛЕНИЕМ: Домашние задания ===
// export const useHomeworkStackedChart = (studentId: number, courseId: number): ChartData => {
//   return useMemo(() => {
//     const lessons = mockLessons
//       .filter(l => l.id_course === courseId)
//       .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
//     const attendance = mockAttendance.filter(a => a.id_student === studentId);

//     const homeworkDone: number[] = [];
//     const homeworkNotDone: number[] = [];
//     const noHomework: number[] = [];

//     lessons.forEach(lesson => {
//       const record = attendance.find(a => a.id_lesson === lesson.id_lesson);
      
//       if (!record || !record.attended) {
//         // Не был на занятии — нет данных о ДЗ
//         noHomework.push(1);
//         homeworkDone.push(0);
//         homeworkNotDone.push(0);
//       } else if (record.homework_completed) {
//         // Был и сделал ДЗ
//         homeworkDone.push(1);
//         homeworkNotDone.push(0);
//         noHomework.push(0);
//       } else {
//         // Был, но не сделал ДЗ
//         homeworkDone.push(0);
//         homeworkNotDone.push(1);
//         noHomework.push(0);
//       }
//     });

//     return {
//       labels: lessons.map(l => {
//         const date = new Date(l.date);
//         return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
//       }),
//       datasets: [
//         {
//           label: '✓ Сдано',
//           data: homeworkDone,
//           backgroundColor: COLORS.homeworkDone,
//           stack: 'stack1'
//         },
//         {
//           label: '✗ Не сдано',
//           data: homeworkNotDone,
//           backgroundColor: COLORS.homeworkNotDone,
//           stack: 'stack1'
//         },
//         {
//           label: '○ Нет данных',
//           data: noHomework,
//           backgroundColor: COLORS.noHomework,
//           stack: 'stack1'
//         }
//       ]
//     };
//   }, [studentId, courseId]);
// };

// // === Дополнительно: сводка по ДЗ (круговая) ===
// export const useHomeworkSummaryChart = (studentId: number, courseId: number): ChartData => {
//   return useMemo(() => {
//     const lessons = mockLessons.filter(l => l.id_course === courseId);
//     const attendance = mockAttendance.filter(a => a.id_student === studentId);

//     let done = 0;
//     let notDone = 0;
//     let noData = 0;

//     lessons.forEach(lesson => {
//       const record = attendance.find(a => a.id_lesson === lesson.id_lesson);
      
//       if (!record || !record.attended) {
//         noData++;
//       } else if (record.homework_completed) {
//         done++;
//       } else {
//         notDone++;
//       }
//     });

//     return {
//       labels: ['Сдано', 'Не сдано', 'Нет данных'],
//       datasets: [{
//         data: [done, notDone, noData],
//         backgroundColor: [COLORS.homeworkDone, COLORS.homeworkNotDone, COLORS.noHomework],
//         borderWidth: 0
//       }]
//     };
//   }, [studentId, courseId]);
// };