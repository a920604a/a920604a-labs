// components/Statistics/HabitBarChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function HabitBarChart({ habits }) {
  const data = {
    labels: habits.map(habit => habit.name),
    datasets: [
      {
        label: '打卡次數',
        data: habits.map(habit => habit.records?.length || 0),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: '各習慣打卡次數統計' },
    },
    scales: {
      y: { beginAtZero: true, precision: 0 }
    }
  };

  return <Bar data={data} options={options} />;
}
