import React from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@a920604a/auth'
import { LoginPage as SharedLoginPage } from '@a920604a/ui'
import Dashboard from './pages/Dashboard'

function AppRoutes() {
  const { user, loading, signInWithGoogle } = useAuth()

  if (loading) return null

  if (!user) {
    return (
      <SharedLoginPage
        appName="待辦清單"
        description="管理你的每日任務，提升生產力"
        onLogin={signInWithGoogle}
      />
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default function App() {
  return <AppRoutes />
}
