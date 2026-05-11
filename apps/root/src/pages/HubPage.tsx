import { useCallback, useEffect, useState, type KeyboardEvent } from 'react'
import {
  Box, Button, Container, Flex, Grid, HStack, Icon, Input,
  Skeleton, Text, VStack, useColorModeValue, useToast,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@a920604a/auth'
import {
  MdFormatListBulleted, MdCheckCircleOutline, MdMenuBook, MdStarOutline, MdChevronRight,
} from 'react-icons/md'
import { AddIcon } from '@chakra-ui/icons'
import type { IconType } from 'react-icons'
import { collection, getDocs, query, where, doc, getDoc, addDoc } from 'firebase/firestore'
import { getFirebaseFirestore } from '@a920604a/auth'
import { features } from '../config/features'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ModuleStat {
  primary: string
  secondary: string
  loading: boolean
}

interface AppConfig {
  name: string
  path: string
  icon: IconType
  gradient: string
  enabled: boolean
}

// ── Module config ─────────────────────────────────────────────────────────────

const ALL_APPS: AppConfig[] = [
  { enabled: features.todoList,     name: '待辦清單', path: '/to-do-list',    icon: MdFormatListBulleted, gradient: 'linear(135deg, #3b82f6, #6366f1)' },
  { enabled: features.habitTracker, name: '習慣追蹤', path: '/habit-tracker', icon: MdCheckCircleOutline, gradient: 'linear(135deg, #22c55e, #16a34a)' },
  { enabled: features.ebookReader,  name: '電子書',   path: '/ebook-reader',  icon: MdMenuBook,           gradient: 'linear(135deg, #a855f7, #7c3aed)' },
  { enabled: features.resignStamp,  name: '離職集章', path: '/resign-stamp',  icon: MdStarOutline,        gradient: 'linear(135deg, #f59e0b, #d97706)' },
]
const APPS = ALL_APPS.filter(a => a.enabled)

// ── Helpers ───────────────────────────────────────────────────────────────────

function greeting(): string {
  const h = new Date().getHours()
  if (h < 5)  return '夜深了'
  if (h < 12) return '早安'
  if (h < 18) return '午安'
  return '晚安'
}

function todayLabel(): string {
  return new Date().toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'long' })
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ── Module card ───────────────────────────────────────────────────────────────

function ModuleCard({ app, stat }: { app: AppConfig; stat: ModuleStat }) {
  const navigate = useNavigate()
  return (
    <Box
      as="article"
      role="button"
      tabIndex={0}
      bgGradient={app.gradient}
      borderRadius="2xl"
      p={5}
      cursor="pointer"
      color="white"
      transition="transform 0.15s, box-shadow 0.15s"
      _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
      _focus={{ outline: 'none', shadow: 'outline' }}
      onClick={() => navigate(app.path)}
      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => e.key === 'Enter' && navigate(app.path)}
      minH="120px"
      display="flex"
      flexDirection="column"
      justify="space-between"
    >
      <Flex justify="space-between" align="flex-start">
        <Icon as={app.icon} boxSize={6} opacity={0.9} />
        <Icon as={MdChevronRight} boxSize={5} opacity={0.6} />
      </Flex>
      <Box>
        <Text fontSize="11px" fontWeight={600} opacity={0.75} mb={1}>{app.name}</Text>
        {stat.loading
          ? <Skeleton h="24px" w="60px" borderRadius="md" startColor="whiteAlpha.400" endColor="whiteAlpha.200" />
          : <Text fontSize="22px" fontWeight={800} lineHeight={1}>{stat.primary}</Text>
        }
        {stat.loading
          ? <Skeleton h="12px" w="80px" borderRadius="sm" mt={1} startColor="whiteAlpha.300" endColor="whiteAlpha.100" />
          : <Text fontSize="11px" opacity={0.75} mt={1}>{stat.secondary}</Text>
        }
      </Box>
    </Box>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HubPage() {
  const { user } = useAuth()
  const toast = useToast()
  const pageBg     = useColorModeValue('gray.50',  'gray.950')
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const subColor   = useColorModeValue('gray.500', 'gray.400')
  const divider    = useColorModeValue('gray.100', 'gray.800')
  const cardBg     = useColorModeValue('white',    'gray.800')
  const cardBorder = useColorModeValue('gray.100', 'gray.700')

  const firstName = user?.displayName?.split(' ')[0] ?? ''

  const defaultStats: Record<string, ModuleStat> = {
    '/to-do-list':    { primary: '—', secondary: '載入中…', loading: true },
    '/habit-tracker': { primary: '—', secondary: '載入中…', loading: true },
    '/ebook-reader':  { primary: '📚', secondary: '查看書庫', loading: false },
    '/resign-stamp':  { primary: '—', secondary: '載入中…', loading: true },
  }
  const [stats, setStats] = useState<Record<string, ModuleStat>>(defaultStats)
  const [quickTodo, setQuickTodo] = useState('')
  const [addingTodo, setAddingTodo] = useState(false)

  const fetchStats = useCallback(async () => {
    if (!user?.uid) return
    const uid = user.uid
    const db = getFirebaseFirestore()
    const today = todayStr()

    try {
      const [todosSnap, habitsSnap, resignSnap] = await Promise.all([
        getDocs(query(collection(db, 'todos'), where('userId', '==', uid))),
        getDocs(query(collection(db, 'habits'), where('userId', '==', uid))),
        getDoc(doc(db, 'users', uid)),
      ])

      const todos = todosSnap.docs.map(d => d.data())
      const incomplete = todos.filter(t => !t.complete).length
      const dueToday = todos.filter(t => {
        if (t.complete || !t.deadline) return false
        return Math.ceil((t.deadline - Date.now()) / 86400000) === 0
      }).length

      const habits = habitsSnap.docs.map(d => d.data())
      let maxStreak = 0
      let uncheckedToday = 0
      for (const h of habits) {
        const records: string[] = h.records ?? []
        if (!records.includes(today)) uncheckedToday++
        let streak = 0
        const cur = new Date(); cur.setHours(0, 0, 0, 0)
        for (const r of [...new Set(records)].sort().reverse()) {
          const d = new Date(r); d.setHours(0, 0, 0, 0)
          if (Math.round((cur.getTime() - d.getTime()) / 86400000) === streak) {
            streak++; cur.setDate(cur.getDate() - 1)
          } else break
        }
        if (streak > maxStreak) maxStreak = streak
      }

      const stamps: unknown[] = (resignSnap.data()?.stamps as unknown[]) ?? []

      setStats(prev => ({
        ...prev,
        '/to-do-list': {
          primary: String(incomplete),
          secondary: dueToday > 0 ? `⚠ ${dueToday} 項今日到期` : '全部進度中',
          loading: false,
        },
        '/habit-tracker': {
          primary: maxStreak > 0 ? `🔥 ${maxStreak}` : String(habits.length),
          secondary: maxStreak > 0 ? '天連續打卡' : `今日 ${uncheckedToday} 項未打卡`,
          loading: false,
        },
        '/resign-stamp': {
          primary: `${stamps.length}/100`,
          secondary: `距完成 ${100 - stamps.length} 格`,
          loading: false,
        },
      }))
    } catch {
      setStats(prev => {
        const next = { ...prev }
        for (const k of Object.keys(next)) {
          if (next[k].loading) next[k] = { primary: '—', secondary: '無法載入', loading: false }
        }
        return next
      })
    }
  }, [user?.uid])

  useEffect(() => { fetchStats() }, [fetchStats])

  const handleQuickAdd = async () => {
    const title = quickTodo.trim()
    if (!title || !user?.uid) return
    setAddingTodo(true)
    try {
      const db = getFirebaseFirestore()
      const deadline = new Date()
      deadline.setFullYear(deadline.getFullYear() + 10)
      await addDoc(collection(db, 'todos'), {
        title,
        userId: user.uid,
        complete: false,
        deadline: deadline.getTime(),
        created_at: Date.now(),
        updated_at: Date.now(),
      })
      setQuickTodo('')
      toast({ title: '已新增待辦', status: 'success', duration: 2000, isClosable: true })
      fetchStats()
    } catch {
      toast({ title: '新增失敗，請稍後再試', status: 'error', duration: 2000 })
    } finally {
      setAddingTodo(false)
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleQuickAdd()
  }

  return (
    <Box minH="100vh" bg={pageBg}>
      <Container maxW="680px" py={{ base: 8, md: 12 }} px={{ base: 4, md: 6 }}>
        <VStack align="stretch" spacing={8}>

          {/* Header */}
          <Box>
            <Text fontSize="13px" color={subColor} mb="2px">{todayLabel()}</Text>
            <Text
              fontSize={{ base: '28px', md: '32px' }}
              fontWeight={700}
              color={titleColor}
              letterSpacing="-0.5px"
              lineHeight="1.2"
            >
              {greeting()}{firstName && `，${firstName}`}
            </Text>
          </Box>

          <Box h="1px" bg={divider} />

          {/* Module cards */}
          <Box>
            <Text fontSize="11px" fontWeight={600} color={subColor}
              textTransform="uppercase" letterSpacing="0.08em" mb={3}>
              工具
            </Text>
            <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)' }} gap={3}>
              {APPS.map(app => (
                <ModuleCard
                  key={app.path}
                  app={app}
                  stat={stats[app.path] ?? { primary: '—', secondary: '', loading: false }}
                />
              ))}
            </Grid>
          </Box>

          {/* Quick add todo */}
          <Box
            bg={cardBg}
            border="1px solid"
            borderColor={cardBorder}
            borderRadius="xl"
            p={4}
            shadow="sm"
          >
            <Text fontSize="12px" fontWeight={600} color={subColor}
              textTransform="uppercase" letterSpacing="wider" mb={3}>
              快速新增待辦
            </Text>
            <HStack>
              <Input
                placeholder="輸入任務名稱… (Enter 送出)"
                value={quickTodo}
                onChange={e => setQuickTodo(e.target.value)}
                onKeyDown={onKeyDown}
                borderRadius="lg"
                focusBorderColor="brand.400"
                size="sm"
              />
              <Button
                leftIcon={<AddIcon boxSize="10px" />}
                colorScheme="brand"
                size="sm"
                borderRadius="lg"
                isLoading={addingTodo}
                isDisabled={!quickTodo.trim()}
                onClick={handleQuickAdd}
                flexShrink={0}
              >
                新增
              </Button>
            </HStack>
          </Box>

        </VStack>
      </Container>
    </Box>
  )
}
