import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import type { AdminProfileDto, UpdateAdminDataDto } from '../../types/index';
import { useAuth } from '../../hooks/useAuth';
import styles from './AdminProfilePage.module.css';

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

const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LockIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const Card: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({
  title, icon, children,
}) => (
  <div className={styles.card}>
    <div className={styles.cardHeader}>
      <div className={styles.cardIcon}>{icon}</div>
      <h2 className={styles.cardTitle}>{title}</h2>
    </div>
    <div className={styles.cardBody}>{children}</div>
  </div>
);

export const AdminProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AdminProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Редактирование профиля
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UpdateAdminDataDto>({ fullName: '', phoneNumber: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Изменение email
  const [isEmailEditing, setIsEmailEditing] = useState(false);
  const [emailForm, setEmailForm] = useState({ newEmail: '', currentPassword: '' });
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');

  // Изменение пароля
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data } = await adminApi.getProfile();
      setProfile(data);
      setEditForm({ fullName: data.fullName || '', phoneNumber: data.phoneNumber || '' });
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки профиля');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const dto: UpdateAdminDataDto = {};
      if (editForm.fullName !== (profile?.fullName || '')) dto.fullName = editForm.fullName;
      if (editForm.phoneNumber !== (profile?.phoneNumber || '')) dto.phoneNumber = editForm.phoneNumber;

      if (Object.keys(dto).length === 0) { setIsEditing(false); return; }

      const { data } = await adminApi.updateProfile(dto);
      setProfile(data);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({ fullName: profile?.fullName || '', phoneNumber: profile?.phoneNumber || '' });
    setIsEditing(false);
  };

  const handleUpdateEmail = async () => {
    setEmailError('');
    setEmailSuccess('');
    if (!emailForm.newEmail || !emailForm.currentPassword) {
      setEmailError('Заполните все поля');
      return;
    }
    setIsSavingEmail(true);
    try {
      await adminApi.updateEmail({ newEmail: emailForm.newEmail, currentPassword: emailForm.currentPassword });
      setEmailSuccess('Email успешно обновлён');
      setEmailForm({ newEmail: '', currentPassword: '' });
      setIsEmailEditing(false);
    } catch (err: any) {
      setEmailError(err.message || 'Ошибка обновления email');
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('Заполните все поля');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Новые пароли не совпадают');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Пароль должен содержать не менее 6 символов');
      return;
    }
    setIsSavingPassword(true);
    try {
      await adminApi.updatePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      setPasswordSuccess('Пароль успешно обновлён');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsPasswordEditing(false);
    } catch (err: any) {
      setPasswordError(err.message || 'Ошибка обновления пароля');
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loader}>Загрузка профиля...</div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className={styles.container}>
        <div className={styles.errorCard}>
          <span className={styles.errorIcon}>!</span>
          <p>{error}</p>
          <button className={styles.retryBtn} onClick={loadProfile}>Повторить</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Профиль администратора</h1>

      {error && (
        <div className={styles.errorBanner}>
          <span>{error}</span>
          <button onClick={() => setError('')} className={styles.closeBanner}>×</button>
        </div>
      )}

      <div className={styles.grid}>

        {/* === Личные данные === */}
        <Card title="Личные данные" icon={<UserIcon className={styles.icon} />}>
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
                    placeholder="Введите ФИО"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Телефон</label>
                  <input
                    type="tel"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    className={styles.input}
                    placeholder="Введите номер телефона"
                  />
                </div>
                <div className={styles.formActions}>
                  <button className={styles.saveBtn} onClick={handleSaveProfile} disabled={isSaving}>
                    <SaveIcon className={styles.btnIcon} />
                    {isSaving ? 'Сохранение...' : 'Сохранить'}
                  </button>
                  <button className={styles.cancelBtn} onClick={handleCancelEdit}>
                    <CancelIcon className={styles.btnIcon} /> Отмена
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>ФИО</span>
                  <span className={styles.infoValue}>{profile?.fullName || 'Не указано'}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Телефон</span>
                  <span className={styles.infoValue}>{profile?.phoneNumber || 'Не указан'}</span>
                </div>
                <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                  <EditIcon className={styles.btnIcon} /> Редактировать
                </button>
              </>
            )}
          </div>
        </Card>

        {/* === Безопасность === */}
        <Card title="Безопасность" icon={<LockIcon className={styles.icon} />}>
          <div className={styles.securitySection}>

            {/* Email */}
            <div className={styles.securityBlock}>
              <div className={styles.securityBlockHeader}>
                <div>
                  <span className={styles.securityLabel}>Email</span>
                  <span className={styles.securityValue}>{user?.email || profile?.email || '—'}</span>
                </div>
                {!isEmailEditing && (
                  <button className={styles.securityEditBtn} onClick={() => { setIsEmailEditing(true); setEmailError(''); setEmailSuccess(''); }}>
                    <EditIcon className={styles.btnIcon} /> Изменить
                  </button>
                )}
              </div>
              {emailSuccess && <p className={styles.successMsg}>{emailSuccess}</p>}
              {isEmailEditing && (
                <div className={styles.securityForm}>
                  {emailError && <p className={styles.fieldError}>{emailError}</p>}
                  <div className={styles.formGroup}>
                    <label>Новый email</label>
                    <input type="email" className={styles.input} value={emailForm.newEmail}
                      onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Текущий пароль</label>
                    <input type="password" className={styles.input} value={emailForm.currentPassword}
                      onChange={(e) => setEmailForm({ ...emailForm, currentPassword: e.target.value })} />
                  </div>
                  <div className={styles.formActions}>
                    <button className={styles.saveBtn} onClick={handleUpdateEmail} disabled={isSavingEmail}>
                      <SaveIcon className={styles.btnIcon} />
                      {isSavingEmail ? 'Сохранение...' : 'Сохранить'}
                    </button>
                    <button className={styles.cancelBtn} onClick={() => { setIsEmailEditing(false); setEmailForm({ newEmail: '', currentPassword: '' }); setEmailError(''); }}>
                      <CancelIcon className={styles.btnIcon} /> Отмена
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.securityDivider} />

            {/* Пароль */}
            <div className={styles.securityBlock}>
              <div className={styles.securityBlockHeader}>
                <div>
                  <span className={styles.securityLabel}>Пароль</span>
                  <span className={styles.securityValue}>••••••••</span>
                </div>
                {!isPasswordEditing && (
                  <button className={styles.securityEditBtn} onClick={() => { setIsPasswordEditing(true); setPasswordError(''); setPasswordSuccess(''); }}>
                    <EditIcon className={styles.btnIcon} /> Изменить
                  </button>
                )}
              </div>
              {passwordSuccess && <p className={styles.successMsg}>{passwordSuccess}</p>}
              {isPasswordEditing && (
                <div className={styles.securityForm}>
                  {passwordError && <p className={styles.fieldError}>{passwordError}</p>}
                  <div className={styles.formGroup}>
                    <label>Текущий пароль</label>
                    <input type="password" className={styles.input} value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Новый пароль</label>
                    <input type="password" className={styles.input} value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Повторите новый пароль</label>
                    <input type="password" className={styles.input} value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                  </div>
                  <div className={styles.formActions}>
                    <button className={styles.saveBtn} onClick={handleUpdatePassword} disabled={isSavingPassword}>
                      <SaveIcon className={styles.btnIcon} />
                      {isSavingPassword ? 'Сохранение...' : 'Сохранить'}
                    </button>
                    <button className={styles.cancelBtn} onClick={() => { setIsPasswordEditing(false); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); setPasswordError(''); }}>
                      <CancelIcon className={styles.btnIcon} /> Отмена
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </Card>

      </div>
    </div>
  );
};
