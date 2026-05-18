// src/pages/ClientProfile/ClientProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { clientApi } from '../../services/clientApi';
import type {
  ClientProfileData,
  AccountTransaction,
  ClientStudent,
} from '../../types/index';
import styles from './ClientProfilePage.module.css';

// === Иконки (встроенные SVG) ===
const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const SaveIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CancelIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const WalletIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
  </svg>
);

const StudentIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const TransactionIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

// === Компоненты ===

const Card: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({
  title,
  icon,
  children,
}) => (
  <div className={styles.card}>
    <div className={styles.cardHeader}>
      <div className={styles.cardIcon}>{icon}</div>
      <h2 className={styles.cardTitle}>{title}</h2>
    </div>
    <div className={styles.cardBody}>{children}</div>
  </div>
);

export const ClientProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<ClientProfileData | null>(null);
  const [transactions, setTransactions] = useState<AccountTransaction[]>([]);
  const [students, setStudents] = useState<ClientStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Редактирование профиля
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ fullName: '', phoneNumber: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [profileRes, transactionsRes, studentsRes] = await Promise.all([
        clientApi.getProfile(),
        clientApi.getTransactions(),
        clientApi.getStudents(),
      ]);
      setProfile(profileRes.data);
      setTransactions(transactionsRes.data);
      setStudents(studentsRes.data);
      setEditForm({
        fullName: profileRes.data.full_name || '',
        phoneNumber: profileRes.data.phone_number || '',
      });
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { data } = await clientApi.updateProfile({
        fullName: editForm.fullName,
        phoneNumber: editForm.phoneNumber,
      });
      setProfile(data);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      fullName: profile?.full_name || '',
      phoneNumber: profile?.phone_number || '',
    });
    setIsEditing(false);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number, type?: string) => {
    const prefix = type?.toLowerCase() === 'debit' ? '-' : '+';
    return `${prefix}${amount.toLocaleString('ru-RU')} ₽`;
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loader}>Загрузка профиля...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorCard}>
          <span className={styles.errorIcon}>!</span>
          <p>{error}</p>
          <button className={styles.retryBtn} onClick={loadData}>
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Личный кабинет</h1>

      <div className={styles.grid}>
        {/* === Карточка профиля === */}
        <Card
          title="Профиль"
          icon={<EditIcon className={styles.icon} />}
        >
          <div className={styles.profileInfo}>
            {isEditing ? (
              <div className={styles.editForm}>
                <div className={styles.formGroup}>
                  <label>ФИО</label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Телефон</label>
                  <input
                    type="tel"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formActions}>
                  <button
                    className={styles.saveBtn}
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                  >
                    <SaveIcon className={styles.btnIcon} />
                    {isSaving ? 'Сохранение...' : 'Сохранить'}
                  </button>
                  <button className={styles.cancelBtn} onClick={handleCancelEdit}>
                    <CancelIcon className={styles.btnIcon} />
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>ФИО</span>
                  <span className={styles.infoValue}>{profile?.full_name || 'Не указано'}</span>
                </div>
                {/* <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Email</span>
                  <span className={styles.infoValue}>{profile?.id_user || '—'}</span>
                </div> */}
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Телефон</span>
                  <span className={styles.infoValue}>{profile?.phone_number || 'Не указан'}</span>
                </div>
                <button
                  className={styles.editBtn}
                  onClick={() => setIsEditing(true)}
                >
                  <EditIcon className={styles.btnIcon} />
                  Редактировать
                </button>
              </>
            )}
          </div>
        </Card>

        {/* === Карточка баланса === */}
        <Card title="Баланс" icon={<WalletIcon className={styles.icon} />}>
          <div className={styles.balanceSection}>
            <div className={styles.balanceAmount}>
              {profile?.balance?.toLocaleString('ru-RU') || '0'} ₽
            </div>
            <p className={styles.balanceLabel}>Текущий баланс</p>
          </div>
        </Card>

        {/* === Карточка студентов === */}
        <Card title="Мои студенты" icon={<StudentIcon className={styles.icon} />}>
          {students.length === 0 ? (
            <p className={styles.emptyText}>Нет зарегистрированных студентов</p>
          ) : (
            <ul className={styles.studentList}>
              {students.map((student) => (
                <li key={student.id_student} className={styles.studentItem}>
                  <div className={styles.studentAvatar}>
                    {student.full_name?.charAt(0) || '?'}
                  </div>
                  <div className={styles.studentInfo}>
                    <span className={styles.studentName}>{student.full_name || 'Без имени'}</span>
                    <span className={styles.studentDate}>
                      {student.birth_date
                        ? `Дата рождения: ${new Date(student.birth_date).toLocaleDateString('ru-RU')}`
                        : 'Дата рождения не указана'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* === Карточка транзакций === */}
        <Card
          title="История транзакций"
          icon={<TransactionIcon className={styles.icon} />}
        >
          {transactions.length === 0 ? (
            <p className={styles.emptyText}>История транзакций пуста</p>
          ) : (
            <div className={styles.transactionList}>
              {transactions.map((tx) => (
                <div key={tx.id_transaction} className={styles.transactionItem}>
                  <div className={styles.transactionMain}>
                    <span className={styles.transactionType}>{tx.type || 'Операция'}</span>
                    <span
                      className={`${styles.transactionAmount} ${
                        tx.type?.toLowerCase() === 'debit' ? styles.negative : styles.positive
                      }`}
                    >
                      {formatAmount(tx.amount, tx.type)}
                    </span>
                  </div>
                  <div className={styles.transactionMeta}>
                    <span>{formatDate(tx.transaction_date)}</span>
                    <span>{tx.payment_method || '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};