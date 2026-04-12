import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@a920604a/auth'
import { LoginPage as SharedLoginPage } from '@a920604a/ui'
import Dashboard from './pages/Dashboard'
import ReaderPage from './pages/ReaderPage'

function AppRoutes() {
  const { user, loading, signInWithGoogle } = useAuth()

  if (loading) return null

  if (!user) {
    return (
      <SharedLoginPage
        appName="eBook Reader"
        description="上傳、管理並閱讀你的電子書，支援離線閱讀"
        onLogin={signInWithGoogle}
      />
    )
  }

  return (
    <Router basename="/ebook-reader">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reader/:bookId" element={<ReaderPage />} />
      </Routes>
    </Router>
  )
}

export default function App() {
  return <AppRoutes />
}
