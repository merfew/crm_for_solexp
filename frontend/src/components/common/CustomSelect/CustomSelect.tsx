import React, { useState, useRef, useEffect } from 'react';
import styles from './CustomSelect.module.css';

type OptionData = { value: string; label: string; disabled?: boolean };

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  variant?: 'sm';
};

const parseOptions = (children: React.ReactNode): OptionData[] => {
  const result: OptionData[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === 'option') {
      const p = child.props as { value?: unknown; children?: React.ReactNode; disabled?: boolean };
      result.push({
        value: String(p.value ?? ''),
        label: String(p.children ?? ''),
        disabled: Boolean(p.disabled),
      });
    }
  });
  return result;
};

export const CustomSelect: React.FC<Props> = ({
  className,
  variant,
  children,
  value,
  onChange,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const options = parseOptions(children);
  const selected = options.find(o => o.value === String(value ?? ''));

  const select = (v: string) => {
    onChange?.({ target: { value: v } } as React.ChangeEvent<HTMLSelectElement>);
    setIsOpen(false);
  };

  return (
    <div
      ref={ref}
      className={`${styles.wrapper} ${variant === 'sm' ? styles.sm : ''} ${className || ''}`}
    >
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.open : ''}`}
        onClick={() => !disabled && setIsOpen(v => !v)}
        disabled={disabled}
      >
        <span className={styles.label}>{selected?.label ?? ''}</span>
        <svg
          className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {options.map(opt => (
            <div
              key={opt.value}
              className={`${styles.option} ${opt.value === String(value ?? '') ? styles.optionActive : ''} ${opt.disabled ? styles.optionDisabled : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                if (!opt.disabled) select(opt.value);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
