// src/pages/Clients/ClientsPage.tsx
import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/adminApi';
import type { ClientListItem,CreateStudentDto, ClientFullInfo, CreateClientDto } from '../../types/index';
import styles from './ClientsPage.module.css';
import { CustomDatePicker } from '../../components/common/CustomDatePicker/CustomDatePicker';
// === Иконки ===
const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PlusIconSmall: React.FC<{ className?: string }> = ({ className }) => (
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

const ClientIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
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

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const WalletIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
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
export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Поиск
  const [searchQuery, setSearchQuery] = useState('');

  // Раскрытие карточек + кэш полных данных
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [fullInfoCache, setFullInfoCache] = useState<Record<number, ClientFullInfo>>({});

  // Модалка клиента
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientListItem | null>(null);

  // Модалка студента
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentClientId, setStudentClientId] = useState<number | null>(null);
  const [studentForm, setStudentForm] = useState<CreateStudentDto>({
    fullName: '',
    birthDate: '',
  });
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  // Форма клиента
  const [formData, setFormData] = useState<CreateClientDto>({
    email: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    student: { fullName: '' },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Удаление
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = clients.filter(
      (c) =>
        c.fullName?.toLowerCase().includes(query) ||
        c.phoneNumber?.toLowerCase().includes(query)
    );
    setFilteredClients(filtered);
  }, [searchQuery, clients]);

  const loadClients = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { data } = await adminApi.getClients();
      console.log('Clients loaded:', data);
      setClients(data);
      setFilteredClients(data);
    } catch (err: any) {
      console.error('Error loading clients:', err);
      setError(err.message || 'Ошибка загрузки клиентов');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = async (clientId: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) {
        next.delete(clientId);
        return next;
      }
      next.add(clientId);
      return next;
    });

    // Загружаем полные данные если ещё не загружены
    if (!fullInfoCache[clientId]) {
      try {
        const { data } = await adminApi.getClientFullInfo(clientId);
        setFullInfoCache((prev) => ({ ...prev, [clientId]: data }));
      } catch (err: any) {
        console.error('Error loading client full info:', err);
      }
    }
  };

  const openCreateModal = () => {
    setEditingClient(null);
    setFormData({
      email: '',
      password: '',
      fullName: '',
      phoneNumber: '',
      student: { fullName: '' },
    });
    setIsModalOpen(true);
  };

  const openEditModal = (client: ClientListItem) => {
    setEditingClient(client);
    setFormData({
      email: '',
      password: '',
      fullName: client.fullName || '',
      phoneNumber: client.phoneNumber || '',
    });
    setIsModalOpen(true);
  };

  const openStudentModal = (clientId: number) => {
    setStudentClientId(clientId);
    setStudentForm({ fullName: '', birthDate: '' });
    setIsStudentModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingClient) {
        await adminApi.updateClient(editingClient.id, {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
        });
      } else {
        await adminApi.createClient(formData);
      }
      setIsModalOpen(false);
      await loadClients();
    } catch (err: any) {
      setError(err.message || 'Ошибка сохранения');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!studentClientId) return;

  setIsAddingStudent(true);
  try {
    // Преобразуем дату в ISO формат с временем
    const dto: CreateStudentDto = {
      fullName: studentForm.fullName,
      birthDate: studentForm.birthDate 
        ? new Date(studentForm.birthDate).toISOString() 
        : undefined,
    };

    await adminApi.createStudentForClient(studentClientId, dto);
    setIsStudentModalOpen(false);
    
    // Обновляем кэш полных данных для этого клиента
    const { data } = await adminApi.getClientFullInfo(studentClientId);
    setFullInfoCache((prev) => ({ ...prev, [studentClientId]: data }));
    
    // Обновляем счётчик студентов в списке
    setClients((prev) =>
      prev.map((c) =>
        c.id === studentClientId ? { ...c, studentsCount: c.studentsCount + 1 } : c
      )
    );
  } catch (err: any) {
    setError(err.message || 'Ошибка добавления студента');
  } finally {
    setIsAddingStudent(false);
  }
};

  const handleDelete = async (clientId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого клиента? Все связанные данные будут удалены.')) return;

    setDeletingId(clientId);
    try {
      await adminApi.deleteClient(clientId);
      await loadClients();
    } catch (err: any) {
      setError(err.message || 'Ошибка удаления');
    } finally {
      setDeletingId(null);
    }
  };

  const formatBalance = (balance: number) => {
    return `${balance.toLocaleString('ru-RU')} ₽`;
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loader}>Загрузка клиентов...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Клиенты</h1>
        <button className={styles.addBtn} onClick={openCreateModal}>
          <PlusIcon className={styles.btnIcon} />
          Добавить клиента
        </button>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span>!</span>
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Поиск */}
      <div className={styles.searchBox}>
        <SearchIcon className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Поиск по имени или телефону..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Список */}
      {filteredClients.length === 0 ? (
        <div className={styles.emptyState}>
          <ClientIcon className={styles.emptyIcon} />
          <p>{searchQuery ? 'Клиенты не найдены' : 'Нет зарегистрированных клиентов'}</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filteredClients.map((client) => {
            const isExpanded = expandedIds.has(client.id);
            const fullInfo = fullInfoCache[client.id];

            return (
              <div key={client.id} className={`${styles.clientCard} ${isExpanded ? styles.expanded : ''}`}>
                {/* Основная информация */}
                <div className={styles.clientMain}>
                  <div className={styles.clientLeft}>
                    <div className={styles.clientAvatar}>
                      <span>{client.fullName?.charAt(0) || '?'}</span>
                    </div>
                    <div className={styles.clientInfo}>
                      <h3 className={styles.clientName}>{client.fullName || 'Без имени'}</h3>
                      <div className={styles.clientMeta}>
                        <span>{client.phoneNumber || 'Телефон не указан'}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.clientRight}>
                    <div className={styles.statBadge}>
                      <WalletIcon className={styles.statIcon} />
                      <span className={styles.balance}>{formatBalance(client.balance)}</span>
                    </div>
                    <div className={styles.statBadge}>
                      <StudentIcon className={styles.statIcon} />
                      <span>{client.studentsCount} студентов</span>
                    </div>
                    <button
                      className={styles.expandBtn}
                      onClick={() => toggleExpand(client.id)}
                      title={isExpanded ? 'Свернуть' : 'Развернуть'}
                    >
                      {isExpanded ? (
                        <ChevronUpIcon className={styles.iconSmall} />
                      ) : (
                        <ChevronDownIcon className={styles.iconSmall} />
                      )}
                    </button>
                    <button
                      className={styles.actionBtn}
                      onClick={() => openEditModal(client)}
                      title="Редактировать"
                    >
                      <EditIcon className={styles.iconSmall} />
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.danger}`}
                      onClick={() => handleDelete(client.id)}
                      disabled={deletingId === client.id}
                      title="Удалить"
                    >
                      {deletingId === client.id ? (
                        <span className={styles.spinnerSmall} />
                      ) : (
                        <TrashIcon className={styles.iconSmall} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Раскрывающаяся часть — студенты из full-info */}
                {isExpanded && (
                  <div className={styles.clientDetails}>
                    <div className={styles.detailsHeader}>
                      <StudentIcon className={styles.detailsIcon} />
                      <h4>
                        Студенты (
                        {fullInfo ? fullInfo.students.length : '...'}
                        )
                      </h4>
                      <button
                        className={styles.addStudentBtn}
                        onClick={() => openStudentModal(client.id)}
                        title="Добавить студента"
                      >
                        <PlusIconSmall className={styles.btnIconSmall} />
                        Добавить
                      </button>
                    </div>

                    {!fullInfo ? (
                      <div className={styles.loadingDetails}>Загрузка...</div>
                    ) : fullInfo.students.length > 0 ? (
                      <div className={styles.studentsList}>
                        {fullInfo.students.map((student) => (
                          <div key={student.id_student} className={styles.studentCard}>
                            <div className={styles.studentAvatarSmall}>
                              <StudentIcon className={styles.studentAvatarIcon} />
                            </div>
                            <div className={styles.studentInfo}>
                              <span className={styles.studentName}>
                                {student.full_name || 'Без имени'}
                              </span>
                              <span className={styles.studentMeta}>
                                {student.birth_date
                                  ? `Дата рождения: ${new Date(student.birth_date).toLocaleDateString('ru-RU')}`
                                  : 'Дата рождения не указана'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.noStudents}>Нет привязанных студентов</p>
                    )}

                    {fullInfo && (
                      <div className={styles.detailsFooter}>
                        <span>
                          Баланс: <strong>{formatBalance(fullInfo.client.balance)}</strong>
                        </span>
                        <span>
                          Транзакций: <strong>{fullInfo.transactions.length}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Модалка клиента */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? 'Редактировать клиента' : 'Добавить клиента'}
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

          {!editingClient && (
            <>
              <div className={styles.formGroup}>
                <label>Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={styles.input}
                  placeholder="client@example.com"
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

          {!editingClient && (
            <div className={styles.formSection}>
              <h4>Студент (опционально)</h4>
              <div className={styles.formGroup}>
                <label>ФИО студента</label>
                <input
                  type="text"
                  value={formData.student?.fullName || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      student: { ...formData.student, fullName: e.target.value },
                    })
                  }
                  className={styles.input}
                  placeholder="Петров Петр Петрович"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Дата рождения</label>
                <CustomDatePicker
                value={formData.student?.birthDate || ''}
                onChange={(date) =>
                setFormData({
                    ...formData,
                    student: { ...formData.student, birthDate: date },
                    })
                }
                placeholder="Выберите дату рождения"
            />
              </div>
            </div>
          )}

          <div className={styles.formActions}>
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : editingClient ? 'Сохранить' : 'Добавить'}
            </button>
            <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
              Отмена
            </button>
          </div>
        </form>
      </Modal>

      {/* Модалка добавления студента */}
      <Modal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        title="Добавить студента"
      >
        <form onSubmit={handleAddStudent} className={styles.form}>
          <div className={styles.formGroup}>
            <label>ФИО студента *</label>
            <input
              type="text"
              required
              value={studentForm.fullName}
              onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
              className={styles.input}
              placeholder="Петров Петр Петрович"
            />
          </div>

          <div className={styles.formGroup}>
            {/* <label>Дата рождения</label> */}
            <CustomDatePicker
                label="Дата рождения"
                value={formData.student?.birthDate || ''}
                onChange={(date) =>
                setFormData({
                    ...formData,
                    student: { ...formData.student, birthDate: date },
                    })
                }
                placeholder="Выберите дату рождения"
            />
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.submitBtn} disabled={isAddingStudent}>
              {isAddingStudent ? 'Добавление...' : 'Добавить студента'}
            </button>
            <button type="button" className={styles.cancelBtn} onClick={() => setIsStudentModalOpen(false)}>
              Отмена
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};