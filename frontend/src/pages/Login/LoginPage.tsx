// src/pages/Login/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from './LoginPage.module.css';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, isAdmin, isClient, isTeacher } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const user = await login(email, password);
      
      // Редирект в зависимости от роли
      if (user.role === 'admin') {
        navigate('/calendar', { replace: true });
      } else if (user.role === 'teacher') {
        navigate('/calendar', { replace: true });
      } else if (user.role === 'client') {
        navigate('/calendar', { replace: true });
      } else {
        navigate('/calendar', { replace: true });
      }
    } catch (err: any) {
      // Axios ошибка уже обработана в apiClient interceptor,
      // но можно показать конкретное сообщение
      setError(err.message || 'Неверный email или пароль');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.background} />
      
      <div className={styles.card}>
        <div className={styles.decorativeCircle} />
        
        <div className={styles.header}>
          <h1 className={styles.title}>CRM System</h1>
          <p className={styles.subtitle}>Визуализация прогресса</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="client@example.com"
              required
              className={styles.input}
              autoComplete="email"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={styles.input}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className={styles.error}>
              <span className={styles.errorIcon}>!</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? (
              <span className={styles.spinner} />
            ) : (
              'Войти'
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p>Регистрация только администратором</p>
        </div>
      </div>
    </div>
  );
};