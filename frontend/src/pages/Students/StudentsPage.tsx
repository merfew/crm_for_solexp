import React from 'react';
import styles from './StudentsPage.module.css';

export const StudentsPage: React.FC = () => (
  <div className={styles.page}>
    <div className={styles.placeholder}>
      <div className={styles.icon}>👥</div>
      <h2>Студенты</h2>
      <p>Раздел в разработке</p>
    </div>
  </div>
);