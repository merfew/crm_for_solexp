import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { ChartOptions, Plugin } from 'chart.js';
import { useRef } from 'react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  data: any;
  title?: string;
}

// Gradient fill: amber → transparent
const gradientPlugin: Plugin<'line'> = {
  id: 'lineGradientFill',
  beforeDraw(chart) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
    gradient.addColorStop(0.6, 'rgba(245, 158, 11, 0.06)');
    gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
    if (chart.data.datasets[0]) {
      (chart.data.datasets[0] as any).backgroundColor = gradient;
    }
  },
};

export const LineChart = ({ data, title }: LineChartProps) => {
  const progressRef = useRef(0);
  const doneRef = useRef(false);

  // Stable plugin reference — clip canvas to a rect that expands left→right.
  // Once doneRef is true the clip is skipped so hover updates never retrigger it.
  const clipPlugin = useRef<Plugin<'line'>>({
    id: 'lineClipAnim',
    beforeDatasetsDraw(chart) {
      if (doneRef.current) return;
      const { ctx, chartArea } = chart;
      if (!chartArea) return;
      ctx.save();
      ctx.beginPath();
      ctx.rect(
        chartArea.left,
        chartArea.top - 24,
        (chartArea.right - chartArea.left + 16) * progressRef.current,
        chartArea.bottom - chartArea.top + 48
      );
      ctx.clip();
    },
    afterDatasetsDraw(chart) {
      if (doneRef.current) return;
      chart.ctx.restore();
    },
  }).current;

  const chartData = {
    ...data,
    datasets: data?.datasets?.map((ds: any) => ({
      ...ds,
      borderColor: '#F59E0B',
      borderWidth: 2.5,
      borderCapStyle: 'round' as const,
      borderJoinStyle: 'round' as const,
      pointBackgroundColor: '#F59E0B',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 8,
      pointHoverBackgroundColor: '#F59E0B',
      pointHoverBorderColor: '#ffffff',
      pointHoverBorderWidth: 2.5,
      fill: true,
      tension: 0.45,
      cubicInterpolationMode: 'monotone',
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      clip: false,
    })) ?? [],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 20, right: 12, bottom: 4, left: 4 },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      title: {
        display: !!title,
        text: title || '',
        color: '#374151',
        font: { size: 14, weight: 'bold' },
        padding: { bottom: 16 },
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#6B7280',
        titleFont: { size: 12 },
        bodyColor: '#F59E0B',
        bodyFont: { size: 14, weight: 'bold' },
        borderColor: 'rgba(245, 158, 11, 0.25)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        displayColors: false,
        callbacks: {
          label: (ctx) => ` Оценка: ${ctx.parsed.y}`,
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
          color: '#9CA3AF',
          font: { size: 12 },
          padding: 8,
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.12)',
        },
        border: { display: false } as any,
      },
      x: {
        title: {
          display: true,
          text: 'Дата занятия',
          color: '#9CA3AF',
          font: { size: 12 },
          padding: { top: 8 },
        },
        ticks: {
          color: '#9CA3AF',
          font: { size: 11 },
          maxRotation: 40,
        },
        grid: { display: false },
        border: { display: false } as any,
      },
    },
    transitions: {
      active: { animation: { duration: 0 } },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutCubic',
      onProgress(event: any) {
        if (doneRef.current) return;
        const steps = event.numSteps || 1;
        progressRef.current = event.currentStep / steps;
      },
      onComplete() {
        progressRef.current = 1;
        doneRef.current = true;
      },
    } as any,
  };

  return (
    <Line
      data={chartData}
      options={options}
      plugins={[gradientPlugin, clipPlugin]}
    />
  );
};
