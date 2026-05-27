// src/components/CourseProgress/Train.tsx
import React, { useEffect, useRef, useState } from 'react';
import styles from './Train.module.css';

interface TrainProps {
  totalLessons: number;
  completedLessons: number;
  currentLesson?: number;
  lessonTitles?: string[];
  onLessonClick?: (lessonNumber: number) => void;
}

export const Train: React.FC<TrainProps> = ({
  totalLessons,
  completedLessons,
  currentLesson,
  lessonTitles = [],
  onLessonClick,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [trainPosition, setTrainPosition] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const safeCompleted = Math.min(completedLessons, totalLessons);
  const safeCurrent = currentLesson ? Math.min(currentLesson, totalLessons) : safeCompleted;

  // Вычисляем позицию локомотива
  useEffect(() => {
    if (!trackRef.current) return;

    const updatePosition = () => {
      const levelElements = trackRef.current?.querySelectorAll(`.${styles.levelDot}`);
      if (!levelElements || levelElements.length === 0) return;

      const targetIndex = Math.max(0, safeCurrent - 1);
      const targetElement = levelElements[targetIndex] as HTMLElement;
      
      if (targetElement) {
        const trackRect = trackRef.current?.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        
        if (trackRect && targetRect) {
          const raw = targetRect.left - trackRect.left + targetRect.width / 2;
          const half = 52; // половина ширины поезда (104 / 2)
          const minPosition = half + 40; // ← минимальный отступ слева (было просто half)
const clamped = Math.max(minPosition, Math.min(trackRect.width - half, raw));
setTrainPosition(clamped);
        }
      }
    };

    setIsAnimating(true);
    const timer = setTimeout(() => {
      updatePosition();
      setIsAnimating(false);
    }, 300);

    window.addEventListener('resize', updatePosition);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
    };
  }, [safeCurrent, totalLessons]);

  // Генерация уровней
  const renderLevels = () => {
    const levels = [];
    
    for (let i = 1; i <= totalLessons; i++) {
      const isCompleted = i <= safeCompleted;
      const isCurrent = i === safeCurrent;
      const isLocked = i > safeCompleted + 1;
      const hasTitle = lessonTitles[i - 1];

      levels.push(
        <div key={i} className={styles.levelWrapper}>
          {/* Соединительная линия слева (кроме первого) */}
          {i > 1 && (
            <div className={`
              ${styles.connectionLine}
              ${i - 1 < safeCompleted ? styles.lineCompleted : ''}
            `} />
          )}

          {/* Кружок уровня */}
          <div
            className={`
              ${styles.levelDot}
              ${isCompleted ? styles.levelCompleted : ''}
              ${isCurrent ? styles.levelCurrent : ''}
              ${isLocked ? styles.levelLocked : ''}
              ${onLessonClick && isCompleted ? styles.levelClickable : ''}
            `}
            onClick={() => {
              if (onLessonClick && isCompleted) {
                onLessonClick(i);
              }
            }}
            title={hasTitle || `Урок ${i}`}
          >
            <div className={styles.levelInner}>
              {isCompleted ? (
                <svg className={styles.checkIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <span className={styles.levelNumber}>{i}</span>
              )}
            </div>

            {/* Индикатор текущего урока */}
            {isCurrent && <div className={styles.currentPulse} />}

            {/* Подпись урока */}
            {hasTitle && (
              <div className={styles.levelTitle}>
                {hasTitle.length > 12 ? hasTitle.substring(0, 12) + '...' : hasTitle}
              </div>
            )}
          </div>
        </div>
      );
    }

    return levels;
  };

  return (
    <div className={styles.container}>
      {/* Заголовок */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h3 className={styles.title}>Прогресс курса</h3>
          <span className={styles.counter}>
            {safeCompleted}/{totalLessons} уроков
          </span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${(safeCompleted / totalLessons) * 100}%` }}
          />
        </div>
      </div>

      {/* Обертка для дорожки и поезда */}
      <div className={styles.trackWrapper}>
        {/* Дорожка с рельсами */}
        <div className={styles.track} ref={trackRef}>
          {/* Рельсы */}
          <div className={styles.rails}>
            <div className={styles.railTop} />
            <div className={styles.railTies} />
            <div className={styles.railBottom} />
          </div>

          {/* Уровни */}
          <div className={styles.levelsRow}>
            {renderLevels()}
          </div>
        </div>

        {/* Локомотив */}
        <div className={styles.trainWrapper} style={{ left: `${trainPosition}px` }}>
        <div
          className={`${styles.train} ${isAnimating ? styles.trainAnimated : ''}`}
          style={{ left: `${trainPosition - 52}px` }}
        >
          {/* Дым */}
          <span className={`${styles.trainSmoke} ${styles.smokeParticle}`} />
          <span className={`${styles.trainSmoke} ${styles.smokeParticle}`} />
          <span className={`${styles.trainSmoke} ${styles.smokeParticle}`} />

          <svg viewBox="0 0 104 88" width="104" height="88" style={{ overflow: 'visible' }}>
            {/* Тяги колёс */}
            <line x1="22" y1="70" x2="50" y2="72" stroke="#9a5210" strokeWidth="2" strokeLinecap="round" opacity="0.55"/>
            <line x1="50" y1="72" x2="78" y2="72" stroke="#9a5210" strokeWidth="2" strokeLinecap="round" opacity="0.55"/>
            {/* Платформа-основание */}
            <rect x="3" y="55" width="93" height="10" rx="4" fill="#f0d070"/>
            {/* Кабина */}
            <rect x="2" y="12" width="44" height="46" rx="4" fill="#e27921"/>
            {/* Крыша кабины */}
            <rect x="0" y="6" width="48" height="12" rx="5" fill="#c56a1a"/>
            {/* Окно — центрировано в кабине */}
            <rect x="11" y="22" width="26" height="26" rx="4" fill="#d4eedc"/>
            <rect x="13" y="24" width="22" height="9" rx="2" fill="rgba(255,255,255,0.38)"/>
            {/* Корпус котла */}
            <rect x="42" y="24" width="54" height="34" rx="8" fill="#f7b557"/>
            <rect x="45" y="26" width="48" height="8" rx="4" fill="rgba(255,255,255,0.18)"/>
            {/* Купол */}
            <ellipse cx="58" cy="23" rx="12" ry="7" fill="#e09f3e"/>
            {/* Труба */}
            <rect x="74" y="10" width="12" height="16" rx="3" fill="#c56a1a"/>
            <rect x="70" y="7" width="20" height="7" rx="3" fill="#9a5210"/>
            {/* Нос (передняя часть справа) */}
            <rect x="96" y="31" width="8" height="22" rx="4" fill="#e09f3e"/>
            {/* Сцепка (спереди справа) */}
            <rect x="96" y="59" width="8" height="5" rx="2" fill="#9a5210"/>
            {/* Большое колесо — у конца вагона (кабина), шаг 28px */}
            <g className={styles.wheelBig}>
              <circle cx="22" cy="70" r="13" fill="#e27921"/>
              <circle cx="22" cy="70" r="7" fill="#f7b557"/>
              <circle cx="22" cy="70" r="3" fill="#c56a1a"/>
              <line x1="22" y1="57" x2="22" y2="83" stroke="rgba(255,255,255,0.45)" strokeWidth="2"/>
              <line x1="9" y1="70" x2="35" y2="70" stroke="rgba(255,255,255,0.45)" strokeWidth="2"/>
            </g>
            {/* Малое колесо 1 — cx=50, шаг +28 */}
            <g className={styles.wheelSmall1}>
              <circle cx="50" cy="72" r="9" fill="#e27921"/>
              <circle cx="50" cy="72" r="5" fill="#f7b557"/>
              <circle cx="50" cy="72" r="2" fill="#c56a1a"/>
              <line x1="50" y1="63" x2="50" y2="81" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5"/>
            </g>
            {/* Малое колесо 2 — cx=78, шаг +28 */}
            <g className={styles.wheelSmall2}>
              <circle cx="78" cy="72" r="9" fill="#e27921"/>
              <circle cx="78" cy="72" r="5" fill="#f7b557"/>
              <circle cx="78" cy="72" r="2" fill="#c56a1a"/>
              <line x1="78" y1="63" x2="78" y2="81" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5"/>
            </g>
          </svg>
        </div>
      </div>
      </div>

      {/* Легенда */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={`${styles.legendDot} ${styles.legendCompleted}`} />
          <span>Пройдено</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendDot} ${styles.legendCurrent}`} />
          <span>Текущий</span>
        </div>
        <div className={styles.legendItem}>
          <div className={`${styles.legendDot} ${styles.legendLocked}`} />
          <span>Предстоит</span>
        </div>
      </div>
    </div>
  );
};