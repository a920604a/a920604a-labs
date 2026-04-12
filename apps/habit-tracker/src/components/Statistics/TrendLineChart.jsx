import React from 'react';
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
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function TrendLineChart({ habits }) {
  if (!habits.length) {
    return <div>無資料顯示</div>;
  }

  // 取得所有習慣的所有日期，合併成一個唯一且排序過的日期陣列
  const allDatesSet = new Set();
  habits.forEach(habit => {
    habit.records?.forEach(date => allDatesSet.add(date));
  });
  const allDates = Array.from(allDatesSet).sort((a, b) => new Date(a) - new Date(b));

  // 針對每個習慣，計算在所有日期上的累積打卡次數
  const datasets = habits.map(habit => {
    // 將該習慣的日期排序
    const sortedHabitDates = [...habit.records].sort((a, b) => new Date(a) - new Date(b));

    // 計算累積次數在 allDates 上的對應值
    let cumCount = 0;
    let habitDateIdx = 0;

    const data = allDates.map(date => {
      if (habitDateIdx < sortedHabitDates.length && date === sortedHabitDates[habitDateIdx]) {
        cumCount++;
        habitDateIdx++;
      }
      return cumCount;
    });

    return {
      label: habit.name,
      data,
      borderColor: habit.color || `hsl(${Math.random() * 360}, 70%, 60%)`,
      backgroundColor: habit.color || `hsl(${Math.random() * 360}, 70%, 60%)`,
      fill: false,
      tension: 0.2,
      pointRadius: 3,
      pointHoverRadius: 5,
    };
  });

  const data = {
    labels: allDates,
    datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      title: { display: true, text: '多習慣打卡趨勢圖' },
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: context => `${context.dataset.label}: ${context.parsed.y} 次`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        precision: 0,
        title: { display: true, text: '累積打卡次數' },
      },
      x: {
        title: { display: true, text: '日期' },
      },
    },
  };

  return <Line data={data} options={options} />;
}
