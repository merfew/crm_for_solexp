// src/pages/Teachers/TeachersPage.tsx
import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import type { Teacher, CreateTeacherDto } from '../../types/index';
import styles from './TeachersPage.module.css';

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

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const TeacherIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

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

export const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<CreateTeacherDto>({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    specialization: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = teachers.filter(
      (t) =>
        t.fullName?.toLowerCase().includes(query) ||
        t.phoneNumber?.toLowerCase().includes(query) ||
        t.specialization?.toLowerCase().includes(query)
    );
    setFilteredTeachers(filtered);
  }, [searchQuery, teachers]);

  const loadTeachers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data } = await adminApi.getTeachers();
      console.log('Teachers loaded:', data); // ← для отладки
      setTeachers(data);
      setFilteredTeachers(data);
    } catch (err: any) {
      console.error('Error loading teachers:', err);
      setError(err.message || 'Ошибка загрузки педагогов');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingTeacher(null);
    setFormData({
      email: '',
      password: '',
      fullName: '',
      phoneNumber: '',
      specialization: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    console.log('Редактируем учителя:', teacher);
    setFormData({
      email: '',
      password: '',
      fullName: teacher.fullName || '',
      phoneNumber: teacher.phoneNumber || '',
      specialization: teacher.specialization || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingTeacher) {
        console.log('ID учителя:', editingTeacher.id);
        console.log('formData:', formData);
        await adminApi.updateTeacher(editingTeacher.id, formData);  // ← id, не id_teacher
      } else {
        await adminApi.createTeacher(formData);
      }
      setIsModalOpen(false);
      await loadTeachers();
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (teacherId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого педагога?')) return;

    setDeletingId(teacherId);
    try {
      await adminApi.deleteTeacher(teacherId);
      await loadTeachers();
    } catch (err: any) {
      setError(err.message || 'Ошибка удаления');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loader}>Загрузка педагогов...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Педагоги</h1>
        <button className={styles.addBtn} onClick={openCreateModal}>
          <PlusIcon className={styles.btnIcon} />
          Добавить педагога
        </button>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span>!</span>
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className={styles.searchBox}>
        <SearchIcon className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Поиск по имени, телефону или специализации..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {filteredTeachers.length === 0 ? (
        <div className={styles.emptyState}>
          <TeacherIcon className={styles.emptyIcon} />
          <p>{searchQuery ? 'Педагоги не найдены' : 'Нет зарегистрированных педагогов'}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredTeachers.map((teacher) => (
            <div key={teacher.id} className={styles.card}>  {/* ← id, не id_teacher */}
              <div className={styles.cardHeader}>
                <div className={styles.avatar}>
                  <span>{teacher.fullName?.charAt(0) || '?'}</span>  {/* ← fullName */}
                </div>
                <div className={styles.cardActions}>
                  <button
                    className={styles.actionBtn}
                    onClick={() => openEditModal(teacher)}
                    title="Редактировать"
                  >
                    <EditIcon className={styles.iconSmall} />
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.danger}`}
                    onClick={() => handleDelete(teacher.id)}
                    disabled={deletingId === teacher.id}
                    title="Удалить"
                  >
                    {deletingId === teacher.id ? (
                      <span className={styles.spinnerSmall} />
                    ) : (
                      <TrashIcon className={styles.iconSmall} />
                    )}
                  </button>
                </div>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.teacherName}>{teacher.fullName || 'Без имени'}</h3>
                
                <div className={styles.infoList}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Специализация</span>
                    <span className={styles.infoValue}>
                      {teacher.specialization || 'Не указана'}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Телефон</span>
                    <span className={styles.infoValue}>
                      {teacher.phoneNumber || 'Не указан'}  {/* ← phoneNumber */}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Занятий</span>
                    <span className={styles.infoValue}>
                      {teacher.totalLessonsCount} (предстоит: {teacher.upcomingLessonsCount})
                    </span>
                  </div>
                 
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTeacher ? 'Редактировать педагога' : 'Добавить педагога'}
      >
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>ФИО *</label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className={styles.input}
              placeholder="Иванов Иван Иванович"
            />
          </div>

          {!editingTeacher && (
            <>
              <div className={styles.formGroup}>
                <label>Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={styles.input}
                  placeholder="teacher@example.com"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Пароль *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={styles.input}
                  placeholder="Минимум 6 символов"
                />
              </div>
            </>
          )}

          <div className={styles.formGroup}>
            <label>Телефон</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className={styles.input}
              placeholder="+7 (999) 123-45-67"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Специализация</label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              className={styles.input}
              placeholder="Математика, программирование..."
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Сохранение...' : editingTeacher ? 'Сохранить' : 'Добавить'}
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
    </div>
  );
};