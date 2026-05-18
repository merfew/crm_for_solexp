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
import { useEffect, useRef } from 'react';

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

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const options: ChartOptions<'bar'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { 
      position: 'top',
      labels: { usePointStyle: true }
    },
    title: { display: !!title, text: title || '' },
    tooltip: {
      callbacks: {
        label: (context) => {
          const datasetLabel = context.dataset.label || '';
          const value = context.parsed.y;
          
          if (datasetLabel.includes('Выполнено') && value !== null) {
            const percent = Math.round(value * 100);
            let emoji = '✓';
            if (percent < 30) emoji = '❌';
            else if (percent < 50) emoji = '⚠️';
            else if (percent < 70) emoji = '📊';
            else if (percent < 90) emoji = '👍';
            return `${emoji} Выполнено: ${percent}%`;
          }
          if (datasetLabel.includes('задано')) {
            if (value === 1) return '📝 ДЗ задано';
            return '○ Нет данных';
          }
          return '';
        }
      }
    }
  },
  scales: {
  y: { 
    beginAtZero: true,
    max: 100,  // Изменили с 1.2 на 100
    stacked: false,
    ticks: {
      stepSize: 25,  // Изменили шаг
      callback: (value) => {
        return value + '%';  // Упростили форматирование
      }
    },
    title: { display: true, text: '% выполнения ДЗ' }
  }
}
};

  return <Bar ref={chartRef} data={data} options={options} />;
};