// src/components/common/CustomDatePicker/CustomDatePicker.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from './CustomDatePicker.module.css';

interface CustomDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
}

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Выберите дату',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value);
    return new Date();
  });
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Закрытие при клике вне - используем mousedown вместо click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Проверяем, что клик был вне контейнера И вне портала с календарем
      if (
        containerRef.current && 
        !containerRef.current.contains(e.target as Node) &&
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      // Используем setTimeout чтобы избежать конфликта с текущим кликом
      const timer = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
      
      return () => {
        clearTimeout(timer);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Вычисляем позицию при открытии
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const pickerWidth = 320;
      
      // Проверяем, поместится ли справа
      let left = rect.left;
      if (left + pickerWidth > window.innerWidth - 16) {
        left = rect.right - pickerWidth;
      }
      if (left < 16) left = 16;

      // Проверяем, поместится ли снизу
      let top = rect.bottom + 8;
      const pickerHeight = 380; // примерная высота
      if (top + pickerHeight > window.innerHeight - 16) {
        top = rect.top - pickerHeight - 8;
      }

      setPickerPosition({ top, left });
    }
  }, [isOpen]);

  // Синхронизация viewDate с value при изменении value извне
  useEffect(() => {
    if (value) {
      setViewDate(new Date(value));
    }
  }, [value]);

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
  // Создаем дату в локальном часовом поясе
  const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
  
  // Форматируем дату вручную, избегая проблем с UTC
  const year = selected.getFullYear();
  const month = String(selected.getMonth() + 1).padStart(2, '0');
  const dayFormatted = String(selected.getDate()).padStart(2, '0');
  const isoDate = `${year}-${month}-${dayFormatted}`;
  
  onChange(isoDate);
  setIsOpen(false);
};
  
const handleToday = () => {
  const today = new Date();
  
  // Форматируем вручную для избежания проблем с часовым поясом
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const isoDate = `${year}-${month}-${day}`;
  
  onChange(isoDate);
  setViewDate(today);
  setIsOpen(false);
};

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const selectedDate = value ? new Date(value) : null;

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const renderPicker = () => (
    <div
      ref={pickerRef}
      className={styles.picker}
      style={{
        position: 'fixed',
        top: pickerPosition.top,
        left: pickerPosition.left,
      }}
      onClick={(e) => e.stopPropagation()} // Предотвращаем всплытие кликов из пикера
    >
      <div className={styles.header}>
        <button type="button" className={styles.navBtn} onClick={handlePrevMonth}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className={styles.monthYear}>
          {MONTHS[month]} {year}
        </span>
        <button type="button" className={styles.navBtn} onClick={handleNextMonth}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className={styles.weekdays}>
        {WEEKDAYS.map((day) => (
          <span key={day} className={styles.weekday}>{day}</span>
        ))}
      </div>

      <div className={styles.days}>
        {Array.from({ length: firstDay }, (_, i) => (
          <span key={`empty-${i}`} className={styles.emptyDay} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          return (
            <button
              key={day}
              type="button"
              className={`${styles.day} ${
                isSelected(day) ? styles.selected : ''
              } ${isToday(day) ? styles.today : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDateClick(day);
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.todayBtn} onClick={handleToday}>
          Сегодня
        </button>
        <button type="button" className={styles.clearBtn} onClick={handleClear}>
          Очистить
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.container} ref={containerRef}>
      {label && <label className={styles.label}>{label}</label>}
      
      <button
        type="button"
        ref={inputRef}
        className={`${styles.input} ${!value ? styles.placeholder : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{value ? formatDisplayDate(value) : placeholder}</span>
        <svg className={styles.calendarIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {isOpen && createPortal(renderPicker(), document.body)}
    </div>
  );
};