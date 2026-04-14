import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { useAuth } from '@a920604a/auth'
import { LoginPage, GlobalShell } from '@a920604a/ui'
import type { SidebarModule } from '@a920604a/ui'
import HubPage from './pages/HubPage'
import { features } from './config/features'
import { MdFormatListBulleted, MdCheckCircleOutline, MdMenuBook, MdStarOutline, MdHome } from 'react-icons/md'

// Lazy-load modules only when the feature is enabled
import ToDoListRoutes    from '@a920604a/to-do-list'
import HabitTrackerRoutes from '@a920604a/habit-tracker'
import EbookReaderRoutes from '@a920604a/ebook-reader'
import ResignStampRoutes from '@a920604a/resign-stamp'

// ── Navigation config ─────────────────────────────────────────────────────────
// Filter out disabled modules so they don't appear in the sidebar.

const ALL_MODULES: Array<SidebarModule & { enabled: boolean }> = [
  {
    enabled: true,
    path: '/',
    label: '首頁',
    icon: <MdHome />,
    exact: true,
  },
  {
    enabled: features.todoList,
    path: '/to-do-list',
    label: '待辦清單',
    icon: <MdFormatListBulleted />,
    subItems: [
      { label: '儀表板', path: '/to-do-list/dashboard' },
    ],
  },
  {
    enabled: features.habitTracker,
    path: '/habit-tracker',
    label: '習慣追蹤',
    icon: <MdCheckCircleOutline />,
    subItems: [
      { label: '儀表板',   path: '/habit-tracker/dashboard'  },
      { label: '統計分析', path: '/habit-tracker/statistics' },
    ],
  },
  {
    enabled: features.ebookReader,
    path: '/ebook-reader',
    label: '電子書',
    icon: <MdMenuBook />,
    subItems: [
      { label: '書庫', path: '/ebook-reader/dashboard' },
    ],
  },
  {
    enabled: features.resignStamp,
    path: '/resign-stamp',
    label: '離職集章',
    icon: <MdStarOutline />,
    subItems: [
      { label: '主頁',     path: '/resign-stamp/dashboard' },
      { label: '理由清單', path: '/resign-stamp/reasons'   },
    ],
  },
]

const MODULES: SidebarModule[] = ALL_MODULES
  .filter(m => m.enabled)
  .map(({ enabled: _enabled, ...m }) => m)

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
          {features.resignStamp  && <Route path="/resign-stamp/*"  element={<ResignStampRoutes />}  />}
          {features.habitTracker && <Route path="/habit-tracker/*" element={<HabitTrackerRoutes />} />}
          {features.todoList     && <Route path="/to-do-list/*"    element={<ToDoListRoutes />}     />}
          {features.ebookReader  && <Route path="/ebook-reader/*"  element={<EbookReaderRoutes />}  />}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </GlobalShell>
    </BrowserRouter>
  )
}
