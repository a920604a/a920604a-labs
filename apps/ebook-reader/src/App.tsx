import { Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import ReaderPage from './pages/ReaderPage'

export default function EbookReaderRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="reader/:bookId" element={<ReaderPage />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  )
}
