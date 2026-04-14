import {
  Box,
  Container,
  Flex,
  Grid,
  HStack,
  Icon,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@a920604a/auth'
import {
  MdFormatListBulleted,
  MdCheckCircleOutline,
  MdMenuBook,
  MdStarOutline,
  MdChevronRight,
} from 'react-icons/md'
import type { IconType } from 'react-icons'
import { features } from '../config/features'

// ── Module config ─────────────────────────────────────────────────────────────

interface AppConfig {
  name: string
  description: string
  path: string
  icon: IconType
  tint: string
  iconColor: string
  features: string[]
  enabled: boolean
}

const ALL_APPS: AppConfig[] = [
  {
    enabled: features.todoList,
    name: '待辦清單',
    description: '管理任務、設定截止日期、分類追蹤',
    path: '/to-do-list',
    icon: MdFormatListBulleted,
    tint: 'blue.50',
    iconColor: 'blue.500',
    features: ['截止日期提醒', '標籤分類', '列表 / 統計 / 日曆'],
  },
  {
    enabled: features.habitTracker,
    name: '習慣追蹤',
    description: '每日打卡、統計分析、養成好習慣',
    path: '/habit-tracker',
    icon: MdCheckCircleOutline,
    tint: 'green.50',
    iconColor: 'green.500',
    features: ['每日打卡', '連續天數統計', '成就徽章'],
  },
  {
    enabled: features.ebookReader,
    name: '電子書',
    description: '上傳 PDF、記錄進度、管理書庫',
    path: '/ebook-reader',
    icon: MdMenuBook,
    tint: 'purple.50',
    iconColor: 'purple.500',
    features: ['PDF 閱讀器', '進度自動同步', '分類書庫'],
  },
  {
    enabled: features.resignStamp,
    name: '離職集章',
    description: '記錄每個想離職的瞬間，蓋章為證',
    path: '/resign-stamp',
    icon: MdStarOutline,
    tint: 'orange.50',
    iconColor: 'orange.500',
    features: ['100 格集章板', '成就里程碑', '匯出 PDF 報告'],
  },
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
  return new Date().toLocaleDateString('zh-TW', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

// ── App card ──────────────────────────────────────────────────────────────────

function AppCard({ app }: { app: AppConfig }) {
  const navigate = useNavigate()
  const cardBg       = useColorModeValue('white',      'gray.800')
  const cardBorder   = useColorModeValue('gray.100',   'gray.700')
  const hoverBorder  = useColorModeValue(app.iconColor, app.iconColor)
  const titleColor   = useColorModeValue('gray.900',   'gray.50')
  const descColor    = useColorModeValue('gray.500',   'gray.400')
  const tagBg        = useColorModeValue('gray.50',    'gray.700')
  const tagColor     = useColorModeValue('gray.500',   'gray.400')
  const iconBg       = useColorModeValue(app.tint,     'whiteAlpha.100')
  const chevronColor = useColorModeValue('gray.300',   'gray.600')

  return (
    <Box
      as="article"
      role="button"
      tabIndex={0}
      bg={cardBg}
      border="1px solid"
      borderColor={cardBorder}
      borderRadius="2xl"
      p={5}
      cursor="pointer"
      transition="border-color 0.15s, box-shadow 0.15s, transform 0.15s"
      _hover={{
        borderColor: hoverBorder,
        shadow: 'md',
        transform: 'translateY(-1px)',
      }}
      _focus={{
        outline: 'none',
        borderColor: hoverBorder,
        shadow: 'outline',
      }}
      onClick={() => navigate(app.path)}
      onKeyDown={e => e.key === 'Enter' && navigate(app.path)}
    >
      <Flex gap={4} align="flex-start">

        {/* Icon */}
        <Box
          bg={iconBg}
          borderRadius="xl"
          p="10px"
          flexShrink={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={app.icon} boxSize={6} color={app.iconColor} />
        </Box>

        {/* Content */}
        <Box flex={1} minW={0}>
          <Flex align="center" justify="space-between" mb="2px">
            <Text
              fontSize="15px"
              fontWeight={600}
              color={titleColor}
              letterSpacing="-0.2px"
            >
              {app.name}
            </Text>
            <Icon as={MdChevronRight} color={chevronColor} boxSize={5} flexShrink={0} />
          </Flex>

          <Text fontSize="13px" color={descColor} lineHeight="1.5" mb={3}>
            {app.description}
          </Text>

          {/* Feature pills */}
          <HStack spacing={1} flexWrap="wrap">
            {app.features.map(f => (
              <Box
                key={f}
                bg={tagBg}
                borderRadius="full"
                px={2}
                py="2px"
              >
                <Text fontSize="11px" color={tagColor} fontWeight={500}>
                  {f}
                </Text>
              </Box>
            ))}
          </HStack>
        </Box>
      </Flex>
    </Box>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HubPage() {
  const { user } = useAuth()
  const pageBg    = useColorModeValue('gray.50',  'gray.950')
  const titleColor = useColorModeValue('gray.900', 'gray.50')
  const subColor   = useColorModeValue('gray.500', 'gray.400')
  const divider    = useColorModeValue('gray.100', 'gray.800')

  const firstName = user?.displayName?.split(' ')[0] ?? ''

  return (
    <Box minH="100vh" bg={pageBg}>
      <Container maxW="680px" py={{ base: 8, md: 12 }} px={{ base: 4, md: 6 }}>
        <VStack align="stretch" spacing={8}>

          {/* ── Header ──────────────────────────────────────────────────────── */}
          <Box>
            <Text fontSize="13px" color={subColor} mb="2px">
              {todayLabel()}
            </Text>
            <Text
              fontSize={{ base: '28px', md: '32px' }}
              fontWeight={700}
              color={titleColor}
              letterSpacing="-0.5px"
              lineHeight="1.2"
            >
              {greeting()}
              {firstName && `，${firstName}`}
            </Text>
          </Box>

          {/* ── Divider ─────────────────────────────────────────────────────── */}
          <Box h="1px" bg={divider} />

          {/* ── Section label ───────────────────────────────────────────────── */}
          <Box>
            <Text
              fontSize="11px"
              fontWeight={600}
              color={subColor}
              textTransform="uppercase"
              letterSpacing="0.08em"
              mb={3}
            >
              工具
            </Text>

            {/* ── App cards ───────────────────────────────────────────────── */}
            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }}
              gap={3}
            >
              {APPS.map(app => (
                <AppCard key={app.path} app={app} />
              ))}
            </Grid>
          </Box>

        </VStack>
      </Container>
    </Box>
  )
}
