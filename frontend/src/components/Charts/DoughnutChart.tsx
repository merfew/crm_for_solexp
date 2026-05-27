import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { useEffect, useRef } from 'react';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface DoughnutChartProps {
  data: any;
  title?: string;
  centerPercent?: number;
}

export const DoughnutChart = ({ data, title, centerPercent }: DoughnutChartProps) => {
  const chartRef = useRef<any>(null);

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
    cutout: '62%',
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 900,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 18,
          font: { size: 13 },
          filter: (item) => {
            const idx = item.index ?? -1;
            if (idx < 0) return true;
            const val = data?.datasets?.[0]?.data?.[idx];
            return val != null && val > 0;
          },
        },
      },
      title: {
        display: !!title,
        text: title || '',
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#6B7280',
        titleFont: { size: 12 },
        bodyColor: '#374151',
        bodyFont: { size: 13, weight: 'bold' },
        borderColor: 'rgba(107, 114, 128, 0.2)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const value = context.parsed;
            const total: number = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${context.label}: ${value} (${pct}%)`;
          },
        },
      },
    },
  };

  // Процент посещаемости — данные[0] / сумма всех
  const attended = data?.datasets?.[0]?.data?.[0] ?? 0;
  const total: number =
    data?.datasets?.[0]?.data?.reduce((a: number, b: number) => a + b, 0) || 1;
  const pct =
    centerPercent !== undefined
      ? centerPercent.toFixed(0)
      : ((attended / total) * 100).toFixed(0);

  return (
    <div style={{ position: 'relative', height: '300px' }}>
      <Doughnut ref={chartRef} data={data} options={options} />
      <div
        style={{
          position: 'absolute',
          top: '43%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
          animation: 'fadeInCenter 0.6s ease 0.5s both',
        }}
      >
        <div style={{ fontSize: '26px', fontWeight: '700', color: '#1a1a2e', lineHeight: 1 }}>
          {pct}%
        </div>
        <div style={{ fontSize: '11px', color: '#888', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          посещаемость
        </div>
      </div>
      <style>{`
        @keyframes fadeInCenter {
          from { opacity: 0; transform: translate(-50%, -44%) scale(0.85); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
};
