// src/components/Layout/MainLayout/MainLayout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useLayout } from '../../../hooks/useLayout';
import { Sidebar } from '../Sidebar/Sidebar';
import { Header } from '../Header/Header';
import styles from './MainLayout.module.css';

export const MainLayout: React.FC = () => {
  const { isSidebarOpen } = useLayout();

  return (
    <div className={styles.layout}>
      <Sidebar />
      
      <main className={`${styles.main} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <Header />
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};