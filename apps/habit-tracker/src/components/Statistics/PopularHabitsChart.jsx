// PopularHabitsChart.jsx
import React from 'react';
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function PopularHabitsChart({ habits }) {
  // 依打卡次數排序，取前5名
  const sorted = [...habits].sort((a, b) => (b.records?.length || 0) - (a.records?.length || 0));
  const top5 = sorted.slice(0, 5);

  const data = {
    labels: top5.map(h => h.name),
    datasets: [{
      label: '打卡次數',
      data: top5.map(h => h.records?.length || 0),
      backgroundColor: 'rgba(255, 99, 132, 0.6)',
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: '熱門習慣前五名' }
    },
    scales: {
      y: { beginAtZero: true, precision: 0 }
    }
  };

  return <Bar data={data} options={options} />;
}
