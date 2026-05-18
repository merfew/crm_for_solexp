// import type { DashboardFilters, Course, Client, Student } from '../../types';
// import { apiService } from '../../services/api';
// import { useState, useEffect } from 'react';
// import styles from './FiltersPanel.module.css';

// interface FiltersPanelProps {
//   filters: DashboardFilters;
//   onFiltersChange: (filters: DashboardFilters) => void;
//   courses: Course[];
//   students?: Student[];
// }

// export const FiltersPanel = ({ filters, onFiltersChange, courses, students = [] }: FiltersPanelProps) => {
//   const [clients, setClients] = useState<Client[]>([]);

//   useEffect(() => {
//     apiService.getClients().then(setClients);
//   }, []);

//   const handleClientChange = (clientId: string) => {
//     const newFilters = {
//       ...filters,
//       clientId: clientId ? parseInt(clientId) : null,
//       studentId: null
//     };
//     onFiltersChange(newFilters);
//   };

//   return (
//     <div className={styles.filtersPanel}>
//       <div className={styles.filterGroup}>
//         <label>Родитель:</label>
//         <select 
//           value={filters.clientId || ''} 
//           onChange={(e) => handleClientChange(e.target.value)}
//         >
//           <option value="">Все родители</option>
//           {clients.map(client => (
//             <option key={client.id_client} value={client.id_client}>
//               {client.full_name}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className={styles.filterGroup}>
//         <label>Студент:</label>
//         <select 
//           value={filters.studentId || ''} 
//           onChange={(e) => onFiltersChange({ 
//             ...filters, 
//             studentId: e.target.value ? parseInt(e.target.value) : null 
//           })}
//           disabled={!filters.clientId}
//         >
//           <option value="">Выберите студента</option>
//           {students.map(student => (
//             <option key={student.id_student} value={student.id_student}>
//               {student.full_name} ({new Date(student.birth_date).getFullYear()} г.)
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className={styles.filterGroup}>
//         <label>Курс:</label>
//         <select 
//           value={filters.courseId || ''} 
//           onChange={(e) => onFiltersChange({ 
//             ...filters, 
//             courseId: e.target.value ? parseInt(e.target.value) : null 
//           })}
//         >
//           <option value="">Все курсы</option>
//           {courses.map(course => (
//             <option key={course.id_course} value={course.id_course}>
//               {course.name} ({course.count_lessons} занятий)
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className={styles.filterGroup}>
//         <label>Период:</label>
//         <input 
//           type="month" 
//           value={filters.dateRange.start.substring(0, 7)} 
//           onChange={(e) => onFiltersChange({ 
//             ...filters, 
//             dateRange: { ...filters.dateRange, start: `${e.target.value}-01` }
//           })}
//         />
//         <span>—</span>
//         <input 
//           type="month" 
//           value={filters.dateRange.end.substring(0, 7)} 
//           onChange={(e) => onFiltersChange({ 
//             ...filters, 
//             dateRange: { ...filters.dateRange, end: `${e.target.value}-28` }
//           })}
//         />
//       </div>
//     </div>
//   );
// };