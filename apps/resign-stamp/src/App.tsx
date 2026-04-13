import { Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Reasons from './pages/Reasons'

export default function ResignStampRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="reasons" element={<Reasons />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  )
}
