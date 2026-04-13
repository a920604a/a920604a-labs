import { useEffect, useState } from 'react'
import { Box, Flex, Text, useColorModeValue } from '@chakra-ui/react'

const quotes = [
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
  '離職不是終點，而是追求更好生活的開始。',
  '放下不合適的，才能擁抱真正屬於你的未來。',
  '每一次離開，都是對自己負責的勇氣。',
  '離職是給自己重新出發的禮物。',
  '不怕離職，因為你擁有重新選擇的權利。',
  '離開舒適區，才有機會遇見更好的自己。',
  '離職讓你更清楚人生想要什麼。',
  '放開過去，讓未來的光芒更加閃耀。',
  '離職是成長的必經之路，迎接新挑戰。',
  '離職的勇氣，是走向夢想的第一步。',
]

export default function DailyQuote() {
  const [quote, setQuote] = useState('')

  useEffect(() => {
    const today = new Date()
    const seed =
      today.getFullYear() * 10000 +
      (today.getMonth() + 1) * 100 +
      today.getDate()
    setQuote(quotes[seed % quotes.length])
  }, [])

  const bg        = useColorModeValue('orange.50',  'orange.900')
  const border    = useColorModeValue('orange.200', 'orange.700')
  const labelColor = useColorModeValue('orange.500', 'orange.300')
  const textColor = useColorModeValue('gray.700',   'gray.100')

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
        <Text
          fontSize="xs"
          fontWeight={700}
          color={labelColor}
          letterSpacing="widest"
          textTransform="uppercase"
        >
          每日箴言
        </Text>
      </Flex>
      <Text
        fontSize={{ base: 'md', md: 'lg' }}
        fontStyle="italic"
        fontWeight={500}
        color={textColor}
        lineHeight="tall"
      >
        「{quote}」
      </Text>
    </Box>
  )
}
