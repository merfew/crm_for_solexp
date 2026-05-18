import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,  // <-- ДОБАВЛЕНО
  Tooltip,
  Legend,
  Title
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { useEffect, useRef } from 'react';

// Регистрируем необходимые элементы
ChartJS.register(
  ArcElement,  // <-- ДОБАВЛЕНО
  Tooltip,
  Legend,
  Title
);

interface DoughnutChartProps {
  data: any;
  title?: string;
}

export const DoughnutChart = ({ data, title }: DoughnutChartProps) => {
  const chartRef = useRef<any>(null);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      title: {
        display: !!title,
        text: title || ''
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${percentage}%`;
          }
        }
      }
    }
  };

  // Вычисляем процент посещаемости для центра
  const attendanceRate = data?.datasets?.[0]?.data?.[0] || 0;
  const total = data?.datasets?.[0]?.data?.reduce((a: number, b: number) => a + b, 0) || 1;
  const percentage = ((attendanceRate / total) * 100).toFixed(0);

  return (
    <div style={{ position: 'relative', height: '300px' }}>
      <Doughnut ref={chartRef} data={data} options={options} />
      <div style={{
        position: 'absolute',
        top: '45%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        pointerEvents: 'none'
      }}>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
          {percentage}%
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>посещаемость</div>
      </div>
    </div>
  );
};