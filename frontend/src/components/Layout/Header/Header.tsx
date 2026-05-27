// src/components/Layout/Header/Header.tsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import styles from './Header.module.css';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Дашборд',
  '/students': 'Студенты',
  '/lessons': 'Занятия',
  '/progress': 'Прогресс',
  '/analytics': 'Аналитика',
  '/calendar': 'Календарь',
  '/settings': 'Настройки',
};

export const Header: React.FC = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'CRM System';

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.breadcrumb}>Главная / {title}</p>
      </div>
      
      <div className={styles.right}>
        {/* <div className={styles.search}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input type="text" placeholder="Поиск..." className={styles.searchInput} />
        </div>
        
        <button className={styles.notificationBtn}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className={styles.notificationDot} />
        </button> */}
      </div>
    </header>
  );
};