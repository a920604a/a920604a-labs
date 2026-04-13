import { Navigate, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Dashboard from './pages/Dashboard'
import StatisticsPage from './pages/StatisticsPage'
import HabitCalendar from './pages/HabitCalendar'

export default function HabitTrackerRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="statistics" element={<StatisticsPage />} />
        <Route path="calendar/:habitId" element={<HabitCalendar />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
      <ToastContainer />
    </>
  )
}
