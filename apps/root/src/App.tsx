import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { useAuth } from '@a920604a/auth'
import { LoginPage } from '@a920604a/ui'
import GlobalShell from './components/GlobalShell'
import HubPage from './pages/HubPage'
import ResignStampRoutes from './modules/resign-stamp/App'
import HabitTrackerRoutes from './modules/habit-tracker/App'
import ToDoListRoutes from './modules/to-do-list/App'
import EbookReaderRoutes from './modules/ebook-reader/App'

export default function App() {
  const { user, loading, signInWithGoogle, logout } = useAuth()

  if (loading) return null

  if (!user) {
    return (
      <LoginPage
        appName="a920604a Labs"
        description="集合四個工具：離職集章、習慣追蹤、待辦清單、電子書閱讀"
        onLogin={signInWithGoogle}
      />
    )
  }

  return (
    <BrowserRouter>
      <GlobalShell user={user} onLogout={logout}>
        <Routes>
          <Route path="/" element={<HubPage />} />
          <Route path="/resign-stamp/*" element={<ResignStampRoutes />} />
          <Route path="/habit-tracker/*" element={<HabitTrackerRoutes />} />
          <Route path="/to-do-list/*" element={<ToDoListRoutes />} />
          <Route path="/ebook-reader/*" element={<EbookReaderRoutes />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </GlobalShell>
    </BrowserRouter>
  )
}
