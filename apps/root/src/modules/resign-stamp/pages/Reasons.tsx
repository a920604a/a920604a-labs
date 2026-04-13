import {
  Box,
  Button,
  Container,
  HStack,
  Heading,
  Input,
  Select,
  Spinner,
  Text,
  VStack,
  Center,
} from '@chakra-ui/react'
import { doc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, getFirebaseFirestore } from '@a920604a/auth'
import type { Stamp } from '../components/StampGrid'

export default function Reasons() {
  const { user } = useAuth()
  const [stamps, setStamps] = useState<Stamp[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'index' | 'timestamp'>('timestamp')
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const db = getFirebaseFirestore()

  useEffect(() => {
    const fetchData = async () => {
      const userDocRef = doc(db, 'users', user!.uid)
      const docSnap = await getDoc(userDocRef)
      if (docSnap.exists()) {
        setStamps(docSnap.data().stamps || [])
      }
      setLoading(false)
    }
    fetchData()
  }, [user!.uid])

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleString('zh-TW')

  const filteredStamps = stamps
    .filter((s) => s.reason.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (sortBy === 'timestamp' ? a.timestamp - b.timestamp : a.index - b.index))

  const copyAllReasons = () => {
    const text = filteredStamps
      .map((s) => `第 ${s.index} 章 - ${formatDate(s.timestamp)}\n${s.reason}\n`)
      .join('\n')
    navigator.clipboard.writeText(text)
  }

  const downloadTxtFile = () => {
    const text = filteredStamps
      .map((s) => `第 ${s.index} 章 - ${formatDate(s.timestamp)}\n${s.reason}\n`)
      .join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'resignation_reasons.txt'
    link.click()
  }

  if (loading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    )
  }

  return (
    <Container maxW="4xl" py={8}>
        <HStack justify="space-between" mb={6}>
          <Heading size="lg" color="brand.600">
            🗒️ 蓋章理由總覽
          </Heading>
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            ← 返回
          </Button>
        </HStack>

        <HStack mb={6} flexWrap="wrap" gap={3}>
          <Input
            placeholder="搜尋理由..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            maxW="xs"
          />
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'index' | 'timestamp')}
            maxW="160px"
          >
            <option value="timestamp">依時間排序</option>
            <option value="index">依章號排序</option>
          </Select>
          <Button colorScheme="blue" size="sm" onClick={copyAllReasons}>
            複製理由
          </Button>
          <Button colorScheme="green" size="sm" onClick={downloadTxtFile}>
            匯出文字檔
          </Button>
        </HStack>

        {filteredStamps.length === 0 ? (
          <Text color="gray.500">找不到符合條件的理由。</Text>
        ) : (
          <VStack spacing={3} align="stretch">
            {filteredStamps.map((stamp) => (
              <Box
                key={stamp.timestamp}
                p={4}
                border="1px"
                borderColor="gray.200"
                rounded="md"
                bg="gray.50"
              >
                <Text fontWeight="bold" color="brand.600">
                  📌 第 {stamp.index} 章
                </Text>
                <Text mt={1}>{stamp.reason}</Text>
                <Text mt={1} fontSize="sm" color="orange.500">
                  {formatDate(stamp.timestamp)}
                </Text>
              </Box>
            ))}
          </VStack>
        )}
      </Container>
  )
}
