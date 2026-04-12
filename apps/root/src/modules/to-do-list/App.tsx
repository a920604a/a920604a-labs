import { Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'

export default function ToDoListRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  )
}
