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
          const left = targetRect.left - trackRect.left + targetRect.width / 2;
          setTrainPosition(left);
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
          style={{ left: `${trainPosition}px` }}
        >
          {/* Дым */}
          <span className={`${styles.trainSmoke} ${styles.smokeParticle}`} />
          <span className={`${styles.trainSmoke} ${styles.smokeParticle}`} />
          <span className={`${styles.trainSmoke} ${styles.smokeParticle}`} />

          <div className={styles.trainWindow} />

          {/* Котел (передняя часть) */}
          <div className={styles.trainBoiler} />

          {/* Колеса */}
          <div className={styles.trainWheels}>
            <div className={styles.wheelSmall1} />
            <div className={styles.wheelSmall2} />
            <div className={styles.wheelBig} />
          </div>

          {/* Сцепка */}
          <div className={styles.trainCoupling} />

          {/* Кабина */}
          <div className={styles.trainCabin} />

          {/* Платформа-основание */}
          <div className={styles.trainPlatform} />
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