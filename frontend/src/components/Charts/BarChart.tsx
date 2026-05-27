import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { useEffect, useRef, useState } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  data: any;
  title?: string;
}

export const BarChart = ({ data, title }: BarChartProps) => {
  const chartRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Уничтожаем экземпляр чарта при размонтировании
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  // Монтируем чарт только когда элемент входит в viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 900,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: {
        position: 'top',
        labels: { usePointStyle: true },
      },
      title: { display: !!title, text: title || '' },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#374151',
        titleFont: { size: 14, weight: 'bold' },
        bodyColor: '#6B7280',
        bodyFont: { size: 12 },
        borderColor: 'rgba(107, 114, 128, 0.2)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        displayColors: false,
        callbacks: {
          title: (contexts) => {
            const ctx = contexts[0];
            if (!ctx) return '';
            const percent = Math.round(ctx.parsed.y ?? 0);
            let level = 'Отлично';
            if (percent === 0) return 'Нет данных';
            if (percent < 30) level = 'Очень слабо';
            else if (percent < 50) level = 'Слабо';
            else if (percent < 70) level = 'Удовлетворительно';
            else if (percent < 90) level = 'Хорошо';
            return `${percent}% — ${level}`;
          },
          label: () => 'Выполнение домашнего задания',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        stacked: false,
        ticks: {
          stepSize: 25,
          callback: (value) => value + '%',
        },
        title: { display: true, text: '% выполнения ДЗ' },
      },
    },
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', opacity: isVisible ? 1 : 0, transition: 'opacity 0.4s ease' }}>
      {isVisible && <Bar ref={chartRef} data={data} options={options} />}
    </div>
  );
};
