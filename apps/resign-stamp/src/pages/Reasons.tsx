import {
  Badge,
  Box,
  Button,
  Center,
  Container,
  Divider,
  Flex,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Spinner,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react'
import { SearchIcon, DownloadIcon, CopyIcon } from '@chakra-ui/icons'
import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, getFirebaseFirestore } from '@a920604a/auth'
import type { Stamp } from '../components/StampGrid'

export default function Reasons() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const [stamps,  setStamps]  = useState<Stamp[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy,  setSortBy]  = useState<'index' | 'timestamp'>('timestamp')
  const [search,  setSearch]  = useState('')

  const db = getFirebaseFirestore()

  useEffect(() => {
    const fetchData = async () => {
      const userDocRef = doc(db, 'users', user!.uid)
      const docSnap    = await getDoc(userDocRef)
      if (docSnap.exists()) setStamps(docSnap.data().stamps || [])
      setLoading(false)
    }
    fetchData()
  }, [user!.uid])

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleString('zh-TW', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })

  const filteredStamps = stamps
    .filter(s => s.reason.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sortBy === 'timestamp' ? b.timestamp - a.timestamp : a.index - b.index
    )

  const copyAllReasons = () => {
    const text = filteredStamps
      .map(s => `第 ${s.index} 章 ｜ ${formatDate(s.timestamp)}\n${s.reason}`)
      .join('\n\n')
    navigator.clipboard.writeText(text)
  }

  const downloadTxtFile = () => {
    const text = filteredStamps
      .map(s => `第 ${s.index} 章 ｜ ${formatDate(s.timestamp)}\n${s.reason}`)
      .join('\n\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'resignation_reasons.txt'
    link.click()
  }

  // ── colours ──────────────────────────────────────────────────────────────
  const cardBg      = useColorModeValue('white',     'gray.800')
  const cardBorder  = useColorModeValue('gray.100',  'gray.700')
  const metaColor   = useColorModeValue('gray.500',  'gray.400')
  const reasonColor = useColorModeValue('gray.700',  'gray.200')
  const emptyColor  = useColorModeValue('gray.400',  'gray.500')

  if (loading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="red.400" thickness="4px" />
      </Center>
    )
  }

  return (
    <Container maxW="3xl" py={8} px={{ base: 4, md: 8 }}>
      <VStack spacing={6} align="stretch">

        {/* ── Header ────────────────────────────────────────────── */}
        <Flex align="center" justify="space-between" flexWrap="wrap" gap={3}>
          <Box>
            <Heading size="lg" fontWeight={800} color={useColorModeValue('red.500', 'red.300')}>
              🗒️ 理由總覽
            </Heading>
            <Text fontSize="sm" color={metaColor} mt={1}>
              共 {stamps.length} 筆蓋章紀錄
            </Text>
          </Box>
          <Button variant="outline" size="sm" onClick={() => navigate(-1)} borderRadius="lg">
            ← 返回
          </Button>
        </Flex>

        {/* ── Filter bar ────────────────────────────────────────── */}
        <Flex
          gap={3}
          flexWrap="wrap"
          align="center"
          bg={cardBg}
          border="1px solid"
          borderColor={cardBorder}
          borderRadius="xl"
          p={4}
          shadow="sm"
        >
          <InputGroup maxW="260px" flex={1}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="搜尋理由關鍵字…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              borderRadius="lg"
              focusBorderColor="red.400"
            />
          </InputGroup>

          <Select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'index' | 'timestamp')}
            maxW="160px"
            borderRadius="lg"
            focusBorderColor="red.400"
          >
            <option value="timestamp">依時間（新→舊）</option>
            <option value="index">依章號排序</option>
          </Select>

          <HStack ml="auto" spacing={2}>
            <Button
              leftIcon={<CopyIcon />}
              size="sm"
              variant="outline"
              colorScheme="red"
              borderRadius="lg"
              onClick={copyAllReasons}
              isDisabled={filteredStamps.length === 0}
            >
              複製
            </Button>
            <Button
              leftIcon={<DownloadIcon />}
              size="sm"
              colorScheme="red"
              borderRadius="lg"
              onClick={downloadTxtFile}
              isDisabled={filteredStamps.length === 0}
            >
              匯出 .txt
            </Button>
          </HStack>
        </Flex>

        {/* ── List ──────────────────────────────────────────────── */}
        {filteredStamps.length === 0 ? (
          <Center py={16}>
            <VStack spacing={3}>
              <Text fontSize="4xl">📭</Text>
              <Text color={emptyColor} fontSize="md">
                {stamps.length === 0 ? '還沒有任何蓋章紀錄' : '找不到符合條件的理由'}
              </Text>
              {stamps.length === 0 && (
                <Button
                  size="sm"
                  colorScheme="red"
                  variant="outline"
                  borderRadius="lg"
                  onClick={() => navigate('/resign-stamp')}
                >
                  去蓋第一章 →
                </Button>
              )}
            </VStack>
          </Center>
        ) : (
          <VStack spacing={3} align="stretch">
            {filteredStamps.map((stamp, idx) => (
              <Box
                key={stamp.timestamp}
                bg={cardBg}
                border="1px solid"
                borderColor={cardBorder}
                borderLeft="4px solid"
                borderLeftColor="red.400"
                borderRadius="xl"
                p={5}
                shadow="sm"
                _hover={{ shadow: 'md', borderLeftColor: 'orange.400' }}
                transition="all 0.15s"
              >
                <Flex align="flex-start" justify="space-between" gap={3} flexWrap="wrap">
                  <HStack spacing={2} flexShrink={0}>
                    <Badge
                      colorScheme="red"
                      borderRadius="md"
                      px={2}
                      py={0.5}
                      fontSize="xs"
                    >
                      第 {stamp.index} 章
                    </Badge>
                    {idx === 0 && sortBy === 'timestamp' && (
                      <Badge colorScheme="orange" borderRadius="md" px={2} py={0.5} fontSize="xs">
                        最新
                      </Badge>
                    )}
                  </HStack>
                  <Text fontSize="xs" color={metaColor}>
                    🕐 {formatDate(stamp.timestamp)}
                  </Text>
                </Flex>

                <Divider my={3} />

                <Text
                  fontSize="md"
                  color={reasonColor}
                  lineHeight="tall"
                  whiteSpace="pre-wrap"
                >
                  {stamp.reason}
                </Text>
              </Box>
            ))}
          </VStack>
        )}

      </VStack>
    </Container>
  )
}
