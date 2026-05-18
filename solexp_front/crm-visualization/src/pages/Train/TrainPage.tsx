// import React, { useState, useEffect } from 'react';
// import { clientApi } from '../../services/clientApi';
// import type {StudentProgressDto} from '../../types/index';
// import { Train } from '../../components/Train/Train';

// export const TrainPage: React.FC = () => {
//   const [courseInfo, setCourseInfo] = useState({
//     totalLessons: 0,
//     completedLessons: 0,
//     currentLesson: 0,
//     lessonTitles: [] as string[],
//   });

//   const studentId = 2;

//   useEffect(() => {
//     const loadTrain = async () => {
//       try {
//         // Выдуманные данные для проверки
//         const mockProgress = {
//           data: {
//             totalLessons: 12,
//             completedLessons: 7,
//             currentLessonIndex: 7, // 7 уроков пройдено, следующий 8-й
//           }
//         };
        
//         // Раскомментируйте для реального API
//         // const progress = await clientApi.getStudentProgress(studentId);
//         // const data = progress.data;
        
//         setCourseInfo({
//           totalLessons: 6,
//           completedLessons: 4,
//           currentLesson: 5, // Следующий урок (completedLessons + 1)
//           lessonTitles: [
//             "Введение в платформу",
//             "Основы TypeScript",
//             "React компоненты",
//             "Управление состоянием",
//             "Работа с API",
//             "Маршрутизация"
//           ],
//         });
//       } catch (err) {
//         console.error('Ошибка загрузки прогресса:', err);
//         // Данные для отображения ошибки
//         setCourseInfo({
//           totalLessons: 10,
//           completedLessons: 3,
//           currentLesson: 4,
//           lessonTitles: [
//             "Урок 1: Знакомство",
//             "Урок 2: Основы",
//             "Урок 3: Практика",
//             "Урок 4: Продолжение",
//             "Урок 5: Сложные темы",
//             "Урок 6: Проект",
//             "Урок 7: Тестирование",
//             "Урок 8: Оптимизация",
//             "Урок 9: Финальное задание",
//             "Урок 10: Сертификация"
//           ],
//         });
//       }
//     };
    
//     loadTrain();
//   }, [studentId]);

//   return (
//     <div>
//       <Train
//         totalLessons={courseInfo.totalLessons}
//         completedLessons={courseInfo.completedLessons}
//         currentLesson={courseInfo.currentLesson}
//         lessonTitles={courseInfo.lessonTitles}
//       />
//     </div>
//   );
// };


import React, { useState, useEffect } from 'react';
import { clientApi } from '../../services/clientApi';
import type { StudentFullProgressDto } from '../../types/index';
import { Train } from '../../components/Train/Train';

export const TrainPage: React.FC = () => {
  const [courseInfo, setCourseInfo] = useState({
    totalLessons: 0,
    completedLessons: 0,
    currentLesson: 0,
    lessonTitles: [] as string[],
  });
  const [studentName, setStudentName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const studentId = 2;
  const courseId = 1;

  useEffect(() => {
    const loadTrainData = async () => {
      try {
        setLoading(true);
        
        const response = await clientApi.getStudentProgress(studentId, courseId);
        const progress: StudentFullProgressDto = response.data;
        
        const lessons = progress.lessonHistory || [];
        // Сортируем уроки по дате (если нет order_index)
        const sortedLessons = [...lessons].sort((a, b) => {
  const dateA = a.lessonDate ? new Date(a.lessonDate).getTime() : 0;
  const dateB = b.lessonDate ? new Date(b.lessonDate).getTime() : 0;
  return dateA - dateB;
});
        
        setCourseInfo({
          totalLessons: progress.totalLessons,
          completedLessons: progress.completedLessons,
          currentLesson: progress.completedLessons + 1, // Следующий урок
          // Исправление: фильтруем undefined и предоставляем fallback
          lessonTitles: sortedLessons.map(l => l.title || 'Без названия'),
        });
        
        setStudentName(progress.fullName);
        setCourseName(progress.courseName);
        setError(null);
        
      } catch (err) {
        console.error('Ошибка загрузки прогресса:', err);
        setError('Не удалось загрузить информацию о прогрессе');
        
        // Данные по умолчанию при ошибке
        setCourseInfo({
          totalLessons: 10,
          completedLessons: 0,
          currentLesson: 1,
          lessonTitles: Array.from({ length: 10 }, (_, i) => `Урок ${i + 1}`),
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadTrainData();
  }, [studentId]);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      {/* Опционально: показываем информацию о студенте и курсе */}
      {!error && (
        <div style={{ marginBottom: '15px' }}>
          <h2>{studentName}</h2>
          <p>Курс: {courseName}</p>
        </div>
      )}
      
      <Train
        totalLessons={courseInfo.totalLessons}
        completedLessons={courseInfo.completedLessons}
        currentLesson={courseInfo.currentLesson}
        lessonTitles={courseInfo.lessonTitles}
      />
    </div>
  );
};