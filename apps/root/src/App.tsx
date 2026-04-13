import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { useAuth } from '@a920604a/auth'
import { LoginPage, GlobalShell } from '@a920604a/ui'
import type { SidebarModule } from '@a920604a/ui'
import HubPage from './pages/HubPage'
import ToDoListRoutes from '@a920604a/to-do-list'
import HabitTrackerRoutes from '@a920604a/habit-tracker'
import EbookReaderRoutes from '@a920604a/ebook-reader'
import ResignStampRoutes from '@a920604a/resign-stamp'
import { MdFormatListBulleted, MdCheckCircleOutline, MdMenuBook, MdStarOutline } from 'react-icons/md'

// ── Navigation config ─────────────────────────────────────────────────────────
// Caller owns the nav config; GlobalShell is a generic shell with no hardcoded routes.

const MODULES: SidebarModule[] = [
  {
    path: '/',
    label: '首頁',
    exact: true,
  },
  {
    path: '/to-do-list',
    label: '待辦清單',
    icon: <MdFormatListBulleted />,
    subItems: [
      { label: '儀表板', path: '/to-do-list/dashboard' },
    ],
  },
  {
    path: '/habit-tracker',
    label: '習慣追蹤',
    icon: <MdCheckCircleOutline />,
    subItems: [
      { label: '儀表板',   path: '/habit-tracker/dashboard'  },
      { label: '統計分析', path: '/habit-tracker/statistics' },
    ],
  },
  {
    path: '/ebook-reader',
    label: '電子書',
    icon: <MdMenuBook />,
    subItems: [
      { label: '書庫', path: '/ebook-reader/dashboard' },
    ],
  },
  {
    path: '/resign-stamp',
    label: '離職集章',
    icon: <MdStarOutline />,
    subItems: [
      { label: '主頁',     path: '/resign-stamp/dashboard' },
      { label: '理由清單', path: '/resign-stamp/reasons'   },
    ],
  },
]

// ── App ───────────────────────────────────────────────────────────────────────

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
      <GlobalShell user={user} onLogout={logout} modules={MODULES} brandName="◈ Labs">
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
