// src/pages/Courses/CoursesPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { adminApi } from '../../services/adminApi';
import { clientApi } from '../../services/clientApi';
import type { Course, CreateCourseDto } from '../../types/index';
import styles from './CoursesPage.module.css';

// === Иконки ===
const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const BookIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const LessonsIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const MoneyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// === Модальное окно ===
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>{title}</h3>
          <button className={styles.modalClose} onClick={onClose}>
            <CloseIcon className={styles.iconSmall} />
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
};

// === Главный компонент ===
export const CoursesPage: React.FC = () => {
  const { isAdmin, isClient } = useAuth();
  const isAdminView = isAdmin;

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Модалка
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Форма (camelCase для удобства на фронте)
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    countLesson: string;
    pricePerClass: string;
  }>({
    name: '',
    description: '',
    countLesson: '',
    pricePerClass: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Удаление
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
  setIsLoading(true);
  setError('');
  try {
    const token = localStorage.getItem('auth_token');
    const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
    console.log('=== DEBUG ===');
    console.log('Token exists:', !!token);
    console.log('User role:', user.role);
    console.log('Is admin view:', isAdminView);
    
    const apiCall = isAdminView ? adminApi.getCourse() : clientApi.getCourse();
    const { data } = await apiCall;
    setCourses(data);
  } catch (err: any) {
    console.error('Error:', err.message);
    setError(err.message || 'Ошибка загрузки курсов');
  } finally {
    setIsLoading(false);
  }
};

  const openCreateModal = () => {
    setEditingCourse(null);
    setFormData({
      name: '',
      description: '',
      countLesson: '',
      pricePerClass: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name || '',
      description: course.description || '',
      countLesson: course.count_lesson?.toString() || '',
      pricePerClass: course.price_per_class?.toString() || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Конвертируем в snake_case для бэкенда
    const dto: CreateCourseDto = {
      name: formData.name,
      description: formData.description || undefined,
      countLesson: formData.countLesson ? Number(formData.countLesson) : undefined,
      pricePerClass: formData.pricePerClass ? Number(formData.pricePerClass) : undefined,
    };

    try {
      if (editingCourse) {
        await adminApi.updateCourse(editingCourse.id_cours, dto);
      } else {
        await adminApi.createCourse(dto);
      }
      setIsModalOpen(false);
      await loadCourses();
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (courseId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот курс?')) return;

    setDeletingId(courseId);
    try {
      await adminApi.deleteCourse(courseId);
      await loadCourses();
    } catch (err: any) {
      setError(err.message || 'Ошибка удаления');
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (price?: number) => {
    if (price === undefined || price === null) return '—';
    return `${price.toLocaleString('ru-RU')} ₽`;
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loader}>Загрузка курсов...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Курсы</h1>
        {isAdminView && (
          <button className={styles.addBtn} onClick={openCreateModal}>
            <PlusIcon className={styles.btnIcon} />
            Добавить курс
          </button>
        )}
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span>!</span>
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {courses.length === 0 ? (
        <div className={styles.emptyState}>
          <BookIcon className={styles.emptyIcon} />
          <p>Нет доступных курсов</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {courses.map((course) => (
            <div key={course.id_cours} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.courseIcon}>
                  <BookIcon className={styles.icon} />
                </div>
                {isAdminView && (
                  <div className={styles.cardActions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => openEditModal(course)}
                      title="Редактировать"
                    >
                      <EditIcon className={styles.iconSmall} />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.danger}`}
                      onClick={() => handleDelete(course.id_cours)}
                      disabled={deletingId === course.id_cours}
                      title="Удалить"
                    >
                      {deletingId === course.id_cours ? (
                        <span className={styles.spinnerSmall} />
                      ) : (
                        <TrashIcon className={styles.iconSmall} />
                      )}
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.courseName}>{course.name || 'Без названия'}</h3>
                <p className={styles.courseDesc}>
                  {course.description || 'Описание отсутствует'}
                </p>

                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <LessonsIcon className={styles.statIcon} />
                    <span>{course.count_lesson || 0} занятий</span>
                  </div>
                  <div className={styles.stat}>
                    <MoneyIcon className={styles.statIcon} />
                    <span>{formatPrice(course.price_per_class)} / занятие</span>
                  </div>
                </div>

                <div className={styles.totalPrice}>
                  Итого:{' '}
                  <strong>
                    {formatPrice((course.count_lesson || 0) * (course.price_per_class || 0))}
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модалка (только для админа) */}
      {isAdminView && (
        
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingCourse ? 'Редактировать курс' : 'Добавить курс'}
        >
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Название *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={styles.input}
                placeholder="Например, Математика"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Описание</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={styles.textarea}
                placeholder="Краткое описание курса"
                rows={3}
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Количество занятий</label>
                <input
                  type="number"
                  min={1}
                  value={formData.countLesson}
                  onChange={(e) => setFormData({ ...formData, countLesson: e.target.value })}
                  className={styles.input}
                  placeholder="10"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Стоимость за занятие (₽)</label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={formData.pricePerClass}
                  onChange={(e) => setFormData({ ...formData, pricePerClass: e.target.value })}
                  className={styles.input}
                  placeholder="1500"
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                {isSubmitting ? 'Сохранение...' : editingCourse ? 'Сохранить' : 'Добавить'}
              </button>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setIsModalOpen(false)}
              >
                Отмена
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
