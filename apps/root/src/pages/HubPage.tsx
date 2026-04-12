import {
  Box,
  SimpleGrid,
  Heading,
  Text,
  VStack,
  Button,
  Container,
  useColorModeValue,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@a920604a/auth'

const apps = [
  {
    name: '離職集章',
    description: '記錄離職理由，累積集章，生成證明報告',
    path: '/resign-stamp',
    emoji: '🏮',
    colorScheme: 'red',
  },
  {
    name: '習慣追蹤',
    description: '追蹤每日習慣，養成好習慣',
    path: '/habit-tracker',
    emoji: '✅',
    colorScheme: 'green',
  },
  {
    name: '待辦清單',
    description: '管理每日任務，提升生產力',
    path: '/to-do-list',
    emoji: '📝',
    colorScheme: 'blue',
  },
  {
    name: '電子書閱讀',
    description: '上傳、管理並閱讀你的電子書',
    path: '/ebook-reader',
    emoji: '📚',
    colorScheme: 'purple',
  },
]

export default function HubPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const bg = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')

  return (
    <Box minH="100vh" bg={bg}>
      <Box
        as="header"
        px={6}
        py={4}
        bg={cardBg}
        borderBottomWidth="1px"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Heading size="md" color="brand.600">a920604a Labs</Heading>
        <VStack align="end" spacing={0}>
          <Text fontSize="sm" color="gray.500">{user?.displayName}</Text>
          <Button variant="ghost" size="xs" onClick={logout}>登出</Button>
        </VStack>
      </Box>

      <Container maxW="container.lg" py={12}>
        <VStack spacing={8} align="stretch">
          <Heading textAlign="center">選擇工具</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {apps.map((app) => (
              <Box
                key={app.path}
                bg={cardBg}
                borderRadius="xl"
                p={8}
                shadow="md"
                cursor="pointer"
                _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
                transition="all 0.2s"
                onClick={() => navigate(app.path)}
              >
                <VStack align="start" spacing={3}>
                  <Text fontSize="3xl">{app.emoji}</Text>
                  <Heading size="md">{app.name}</Heading>
                  <Text color="gray.500">{app.description}</Text>
                  <Button colorScheme={app.colorScheme} size="sm" variant="outline">
                    進入 →
                  </Button>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  )
}
