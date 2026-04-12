import { HashRouter as Router, Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '@a920604a/auth'
import { LoginPage } from '@a920604a/ui'
import Dashboard from './pages/Dashboard'
import Reasons from './pages/Reasons'

function App() {
  const { user, loading, signInWithGoogle } = useAuth()

  if (loading) return null

  if (!user) {
    return (
      <LoginPage
        appName="離職集章"
        description="記錄你的離職理由，累積集章，生成證明報告"
        onLogin={signInWithGoogle}
      />
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reasons" element={<Reasons />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
