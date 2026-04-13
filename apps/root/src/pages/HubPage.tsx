import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@a920604a/auth'

const apps = [
  {
    name: '待辦清單',
    description: '管理每日任務，提升生產力',
    path: '/to-do-list',
    emoji: '📝',
    accent: 'blue.500',
    bg: 'blue.50',
  },
  {
    name: '習慣追蹤',
    description: '追蹤每日習慣，養成好習慣',
    path: '/habit-tracker',
    emoji: '✅',
    accent: 'green.500',
    bg: 'green.50',
  },
  {
    name: '電子書閱讀',
    description: '上傳、管理並閱讀你的電子書',
    path: '/ebook-reader',
    emoji: '📚',
    accent: 'purple.500',
    bg: 'purple.50',
  },
  {
    name: '離職集章',
    description: '記錄離職理由，累積集章，生成證明報告',
    path: '/resign-stamp',
    emoji: '🏮',
    accent: 'red.500',
    bg: 'red.50',
  },
]

export default function HubPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const pageBg  = useColorModeValue('gray.50', 'gray.950')
  const cardBg  = useColorModeValue('white', 'gray.800')
  const border  = useColorModeValue('gray.100', 'gray.700')
  const subText = useColorModeValue('gray.500', 'gray.400')

  return (
    <Box minH="100vh" bg={pageBg} py={12}>
      <Container maxW="container.md">
        <VStack spacing={10} align="stretch">

          {/* Greeting */}
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" color={subText}>歡迎回來</Text>
            <Heading size="xl" fontWeight={700} letterSpacing="-1px">
              {user?.displayName?.split(' ')[0] ?? '你好'} 👋
            </Heading>
            <Text color={subText}>今天要做什麼？</Text>
          </VStack>

          {/* App cards */}
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
            {apps.map(app => (
              <Box
                key={app.path}
                bg={cardBg}
                border="1px solid"
                borderColor={border}
                borderRadius="xl"
                p={6}
                cursor="pointer"
                role="button"
                tabIndex={0}
                _hover={{ borderColor: app.accent, shadow: 'md', transform: 'translateY(-2px)' }}
                _focus={{ outline: 'none', borderColor: app.accent, shadow: 'outline' }}
                transition="all 0.18s"
                onClick={() => navigate(app.path)}
                onKeyDown={e => e.key === 'Enter' && navigate(app.path)}
              >
                <VStack align="start" spacing={3}>
                  <Box
                    bg={useColorModeValue(app.bg, 'whiteAlpha.100')}
                    borderRadius="lg"
                    p={2}
                    display="inline-flex"
                  >
                    <Text fontSize="2xl" lineHeight={1}>{app.emoji}</Text>
                  </Box>
                  <Box>
                    <Text fontWeight={600} fontSize="md">{app.name}</Text>
                    <Text fontSize="sm" color={subText} mt={0.5}>{app.description}</Text>
                  </Box>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>

        </VStack>
      </Container>
    </Box>
  )
}
