import React from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@a920604a/auth'
import { LoginPage as SharedLoginPage } from '@a920604a/ui'
import Dashboard from './pages/Dashboard'
import StatisticsPage from './pages/StatisticsPage'
import HabitCalendar from './pages/HabitCalendar'
import { ToastContainer } from 'react-toastify'

function AppRoutes() {
  const { user, loading, signInWithGoogle } = useAuth()

  if (loading) return null

  if (!user) {
    return (
      <SharedLoginPage
        appName="習慣追蹤"
        description="追蹤你的每日習慣，養成好習慣"
        onLogin={signInWithGoogle}
      />
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/calendar/:habitId" element={<HabitCalendar />} />
      </Routes>
      <ToastContainer />
    </Router>
  )
}

export default function App() {
  return <AppRoutes />
}