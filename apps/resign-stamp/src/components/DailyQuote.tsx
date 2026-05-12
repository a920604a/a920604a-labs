import { useEffect, useState } from 'react'
import { Box, Flex, Skeleton, Text, useColorModeValue } from '@chakra-ui/react'
import { getAuth } from 'firebase/auth'

const FALLBACK_QUOTES = [
  '離開是為了更好的開始。',
  '每一次結束都是新旅程的起點。',
  '勇敢踏出舒適圈，未來才會精彩。',
  '告別不代表放棄，而是迎接更多可能。',
  '離職，是對夢想的堅持。',
  '人生如章，蓋出屬於自己的篇章。',
  '轉身的背後，是更寬廣的天空。',
  '別忘了，勇氣就是最美的印章。',
  '新的機會，從這一刻開始。',
  '放下過去，擁抱未知。',
]

const RESIGN_API_URL = import.meta.env.VITE_RESIGN_API_URL || 'http://localhost:8788'

function getFallbackQuote(): string {
  const today = new Date()
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
  return FALLBACK_QUOTES[seed % FALLBACK_QUOTES.length]
}

export default function DailyQuote() {
  const [quote, setQuote] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const token = await getAuth().currentUser?.getIdToken()
        if (!token) throw new Error('no token')

        const today = new Date().toISOString().slice(0, 10)
        const res = await fetch(`${RESIGN_API_URL}/ai/daily-quote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ date: today }),
        })
        if (!res.ok) throw new Error(`status ${res.status}`)
        const data = await res.json() as { quote: string }
        setQuote(data.quote || getFallbackQuote())
      } catch (err) {
        console.log('[DailyQuote] fetch failed:', err)
        setQuote(getFallbackQuote())
      } finally {
        setLoading(false)
      }
    }
    fetchQuote()
  }, [])

  const bg         = useColorModeValue('orange.50',  'orange.900')
  const border     = useColorModeValue('orange.200', 'orange.700')
  const labelColor = useColorModeValue('orange.500', 'orange.300')
  const textColor  = useColorModeValue('gray.700',   'gray.100')

  return (
    <Box
      bg={bg}
      border="1px solid"
      borderColor={border}
      borderLeft="4px solid"
      borderLeftColor="orange.400"
      borderRadius="xl"
      px={6}
      py={5}
    >
      <Flex align="center" gap={2} mb={2}>
        <Text fontSize="lg">💬</Text>
        <Text fontSize="xs" fontWeight={700} color={labelColor} letterSpacing="widest" textTransform="uppercase">
          每日箴言
        </Text>
      </Flex>
      {loading ? (
        <Skeleton height="28px" borderRadius="md" />
      ) : (
        <Text fontSize={{ base: 'md', md: 'lg' }} fontStyle="italic" fontWeight={500} color={textColor} lineHeight="tall">
          「{quote}」
        </Text>
      )}
    </Box>
  )
}
