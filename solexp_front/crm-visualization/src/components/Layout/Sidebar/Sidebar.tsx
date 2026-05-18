// // src/components/Layout/Sidebar/Sidebar.tsx
// import React from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../../../hooks/useAuth';
// import { useLayout } from '../../../hooks/useLayout';
// import type { MenuItem } from '../../../types';
// import styles from './Sidebar.module.css';

// // SVG иконки (встроенные для независимости от библиотек)
// const icons: Record<string, React.FC<{ className?: string }>> = {
//   dashboard: ({ className }) => (
//     <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <rect x="3" y="3" width="7" height="7" rx="1" />
//       <rect x="14" y="3" width="7" height="7" rx="1" />
//       <rect x="3" y="14" width="7" height="7" rx="1" />
//       <rect x="14" y="14" width="7" height="7" rx="1" />
//     </svg>
//   ),
//   students: ({ className }) => (
//     <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
//       <circle cx="9" cy="7" r="4" />
//       <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
//       <path d="M16 3.13a4 4 0 0 1 0 7.75" />
//     </svg>
//   ),
//   lessons: ({ className }) => (
//     <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
//       <polyline points="14 2 14 8 20 8" />
//       <line x1="16" y1="13" x2="8" y2="13" />
//       <line x1="16" y1="17" x2="8" y2="17" />
//     </svg>
//   ),
//   progress: ({ className }) => (
//     <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
//       <polyline points="22 4 12 14.01 9 11.01" />
//     </svg>
//   ),
//   analytics: ({ className }) => (
//     <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <line x1="18" y1="20" x2="18" y2="10" />
//       <line x1="12" y1="20" x2="12" y2="4" />
//       <line x1="6" y1="20" x2="6" y2="14" />
//     </svg>
//   ),
//   calendar: ({ className }) => (
//     <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
//       <line x1="16" y1="2" x2="16" y2="6" />
//       <line x1="8" y1="2" x2="8" y2="6" />
//       <line x1="3" y1="10" x2="21" y2="10" />
//     </svg>
//   ),
//   settings: ({ className }) => (
//     <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <circle cx="12" cy="12" r="3" />
//       <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
//     </svg>
//   ),
//   logout: ({ className }) => (
//     <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
//       <polyline points="16 17 21 12 16 7" />
//       <line x1="21" y1="12" x2="9" y2="12" />
//     </svg>
//   ),
//   menu: ({ className }) => (
//     <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//       <line x1="3" y1="12" x2="21" y2="12" />
//       <line x1="3" y1="6" x2="21" y2="6" />
//       <line x1="3" y1="18" x2="21" y2="18" />
//     </svg>
//   ),
//   logo: ({ className }) => (
//     <svg className={className} viewBox="0 0 40 40" fill="none">
//       <rect width="40" height="40" rx="10" fill="url(#logoGradient)" />
//       <path d="M12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20" stroke="white" strokeWidth="3" strokeLinecap="round" />
//       <path d="M20 28C17.7909 28 16 26.2091 16 24C16 21.7909 17.7909 20 20 20C22.2091 20 24 21.7909 24 24" stroke="white" strokeWidth="3" strokeLinecap="round" />
//       <defs>
//         <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40">
//           <stop stopColor="#F7B557" />
//           <stop offset="1" stopColor="#E27921" />
//         </linearGradient>
//       </defs>
//     </svg>
//   ),
// };

// const menuItems: MenuItem[] = [
//   { id: 'dashboard', label: 'Дашборд', icon: 'dashboard', path: '/dashboard', roles: ['admin', 'manager', 'viewer'] },
//   { id: 'students', label: 'Студенты', icon: 'students', path: '/students', roles: ['admin', 'manager'] },
//   { id: 'lessons', label: 'Занятия', icon: 'lessons', path: '/lessons', roles: ['admin', 'manager', 'viewer'] },
//   { id: 'progress', label: 'Прогресс', icon: 'progress', path: '/progress', roles: ['admin', 'manager', 'viewer'] },
//   { id: 'analytics', label: 'Аналитика', icon: 'analytics', path: '/analytics', roles: ['admin', 'manager'] },
//   { id: 'calendar', label: 'Календарь', icon: 'calendar', path: '/calendar', roles: ['admin', 'manager', 'viewer'] },
//   { id: 'settings', label: 'Настройки', icon: 'settings', path: '/settings', roles: ['admin'] },
// ];

// export const Sidebar: React.FC = () => {
//   const { user, logout } = useAuth();
//   const { isSidebarOpen, toggleSidebar } = useLayout();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const filteredItems = menuItems.filter((item) =>
//     user ? item.roles.includes(user.role) : false
//   );

//   const handleNavigate = (path: string) => {
//     navigate(path);
//   };

//   const LogoIcon = icons.logo;
//   const MenuIcon = icons.menu;

//   return (
//     <>
//       {/* Мобильная кнопка меню */}
//       <button className={styles.mobileToggle} onClick={toggleSidebar}>
//         <MenuIcon className={styles.mobileToggleIcon} />
//       </button>

//       {/* Overlay для мобильных */}
//       {isSidebarOpen && (
//         <div className={styles.overlay} onClick={toggleSidebar} />
//       )}

//       {/* Sidebar */}
//       <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : styles.closed}`}>
//         {/* Header */}
//         <div className={styles.header}>
//           <div className={styles.logo}>
//             <LogoIcon className={styles.logoIcon} />
//             {isSidebarOpen && <span className={styles.logoText}>CRM</span>}
//           </div>
//           <button className={styles.toggleBtn} onClick={toggleSidebar}>
//             <MenuIcon className={styles.toggleIcon} />
//           </button>
//         </div>

//         {/* Navigation */}
//         <nav className={styles.nav}>
//           {filteredItems.map((item) => {
//             const Icon = icons[item.icon];
//             const isActive = location.pathname === item.path;
            
//             return (
//               <button
//                 key={item.id}
//                 className={`${styles.navItem} ${isActive ? styles.active : ''}`}
//                 onClick={() => handleNavigate(item.path)}
//                 title={!isSidebarOpen ? item.label : undefined}
//               >
//                 <div className={styles.navIconWrapper}>
//                   <Icon className={styles.navIcon} />
//                   {item.badge && (
//                     <span className={styles.badge}>{item.badge}</span>
//                   )}
//                 </div>
//                 {isSidebarOpen && (
//                   <span className={styles.navLabel}>{item.label}</span>
//                 )}
//                 {isActive && isSidebarOpen && (
//                   <div className={styles.activeIndicator} />
//                 )}
//               </button>
//             );
//           })}
//         </nav>

//         {/* User Section */}
//         <div className={styles.userSection}>
//           <div className={styles.userInfo}>
//             <div className={styles.avatar}>
//               {user?.avatar ? (
//                 <img src={user.avatar} alt={user?.fullName} />
//               ) : (
//                 <span>{user?.fullName?.charAt(0) || '?'}</span>
//               )}
//             </div>
//             {isSidebarOpen && (
//               <div className={styles.userDetails}>
//                 <span className={styles.userName}>{user?.fullName}</span>
//                 <span className={styles.userRole}>
//                   {user?.role === 'admin' ? 'Администратор' : 
//                    user?.role === 'manager' ? 'Менеджер' : 'Наблюдатель'}
//                 </span>
//               </div>
//             )}
//           </div>
          
//           <button 
//             className={styles.logoutBtn} 
//             onClick={logout}
//             title={!isSidebarOpen ? 'Выйти' : undefined}
//           >
//             {/* {icons.logout({ className: styles.logoutIcon })} */}
//             {isSidebarOpen && <span>Выйти</span>}
//           </button>
//         </div>
//       </aside>
//     </>
//   );
// };

// src/components/Layout/Sidebar/Sidebar.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useLayout } from '../../../hooks/useLayout';
import type { MenuItem } from '../../../types/index'; // ← исправлен импорт
import styles from './Sidebar.module.css';

// SVG иконки (без изменений)
const icons: Record<string, React.FC<{ className?: string }>> = {
  dashboard: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  students: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  lessons: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  progress: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  analytics: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  calendar: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  teachers: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 10L12 5L22 10L12 15L2 10Z" />
      <path d="M6 12v4c0 1.5 2 3 6 3s6-1.5 6-3v-4" />
      <path d="M22 10v4" />
    </svg>
  ),
  settings: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  logout: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  menu: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  logo: ({ className }) => (
    <svg className={className} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="url(#logoGradient)" />
      <path d="M12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 28C17.7909 28 16 26.2091 16 24C16 21.7909 17.7909 20 20 20C22.2091 20 24 21.7909 24 24" stroke="white" strokeWidth="3" strokeLinecap="round" />
      <defs>
        <linearGradient id="logoGradient" x1="0" y1="0" x2="40" y2="40">
          <stop stopColor="#F7B557" />
          <stop offset="1" stopColor="#E27921" />
        </linearGradient>
      </defs>
    </svg>
  ),
};

// ← Исправлены роли под реальные (admin/client/teacher)
const menuItems: MenuItem[] = [
  // { id: 'dashboard', label: 'Дашборд', icon: 'dashboard', path: '/dashboard', roles: ['admin'] },
  // { id: 'students', label: 'Студенты', icon: 'students', path: '/students', roles: ['admin'] },
  // { id: 'lessons', label: 'Занятия', icon: 'lessons', path: '/lessons', roles: ['admin', 'teacher'] },
  { id: 'progress', label: 'Прогресс', icon: 'progress', path: '/progress', roles: ['client'] },
  // { id: 'analytics', label: 'Аналитика', icon: 'analytics', path: '/analytics', roles: ['admin'] },
  { id: 'calendar', label: 'Календарь', icon: 'calendar', path: '/calendar', roles: ['admin', 'teacher', 'client'] },
  { id: 'teachers', label: 'Педагоги', icon: 'teachers', path: '/teachers', roles: ['admin'] }, 
  { id: 'profile', label: 'Профиль', icon: 'students', path: '/profile', roles: ['client'] },
  { id: 'profileteacher', label: 'Профиль', icon: 'students', path: '/profileteacher', roles: ['teacher'] },
  { id: 'clients', label: 'Клиенты', icon: 'students', path: '/clients', roles: ['admin'] },
  { id: 'courses', label: 'Курсы', icon: 'lessons', path: '/courses', roles: ['admin','client'] },
];

// ← Маппинг ролей на русские названия
const roleLabels: Record<string, string> = {
  admin: 'Администратор',
  client: 'Клиент',
  teacher: 'Преподаватель',
};

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { isSidebarOpen, toggleSidebar } = useLayout();
  const navigate = useNavigate();
  const location = useLocation();

  const filteredItems = menuItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const LogoIcon = icons.logo;
  const MenuIcon = icons.menu;
  const LogoutIcon = icons.logout;

  return (
    <>
      {/* Мобильная кнопка меню */}
      <button className={styles.mobileToggle} onClick={toggleSidebar}>
        <MenuIcon className={styles.mobileToggleIcon} />
      </button>

      {/* Overlay для мобильных */}
      {isSidebarOpen && (
        <div className={styles.overlay} onClick={toggleSidebar} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : styles.closed}`}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <LogoIcon className={styles.logoIcon} />
            {isSidebarOpen && <span className={styles.logoText}>CRM</span>}
          </div>
          <button className={styles.toggleBtn} onClick={toggleSidebar}>
            <MenuIcon className={styles.toggleIcon} />
          </button>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          {filteredItems.map((item) => {
            const Icon = icons[item.icon];
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.id}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                onClick={() => handleNavigate(item.path)}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <div className={styles.navIconWrapper}>
                  <Icon className={styles.navIcon} />
                  {item.badge && (
                    <span className={styles.badge}>{item.badge}</span>
                  )}
                </div>
                {isSidebarOpen && (
                  <span className={styles.navLabel}>{item.label}</span>
                )}
                {isActive && isSidebarOpen && (
                  <div className={styles.activeIndicator} />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Section */}
        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {/* ← Убрана проверка avatar, используем инициалы */}
              <span>{user?.fullName?.charAt(0) || '?'}</span>
            </div>
            {isSidebarOpen && (
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user?.fullName}</span>
                <span className={styles.userRole}>
                  {/* ← Исправлено: маппинг ролей, убрана проверка 'manager' */}
                  {user ? roleLabels[user.role] || user.role : 'Гость'}
                </span>
              </div>
            )}
          </div>
          
          <button 
            className={styles.logoutBtn} 
            onClick={logout}
            title={!isSidebarOpen ? 'Выйти' : undefined}
          >
            <LogoutIcon className={styles.logoutIcon} />
            {isSidebarOpen && <span>Выйти</span>}
          </button>
        </div>
      </aside>
    </>
  );
};