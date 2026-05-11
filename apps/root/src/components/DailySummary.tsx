import { Box, Flex, Skeleton, Text, useColorModeValue } from '@chakra-ui/react'
import { useDailySummary } from '../hooks/useDailySummary'

export function DailySummary() {
  const { summary, loading } = useDailySummary()
  const mutedColor = useColorModeValue('gray.500', 'gray.400')
  const textColor  = useColorModeValue('gray.700', 'gray.200')

  const rows = [
    {
      icon: '⚠️',
      text: summary.todoDueToday > 0
        ? `待辦 ${summary.todoDueToday} 項今日到期`
        : `${summary.todoIncomplete} 項未完成待辦`,
    },
    {
      icon: '🔥',
      text: summary.habitStreak > 0
        ? `連續 ${summary.habitStreak} 天打卡`
        : summary.habitUncheckedToday > 0
          ? `今日 ${summary.habitUncheckedToday} 項習慣未打卡`
          : '今日習慣全打卡！',
    },
    {
      icon: '🏮',
      text: `離職集章 ${summary.resignStampCount}/100`,
    },
  ]

  return (
    <Box py={2} px={1}>
      <Text fontSize="9px" fontWeight={700} color={mutedColor}
        textTransform="uppercase" letterSpacing="wider" mb={2}>
        今日摘要
      </Text>
      {rows.map((row, i) => (
        <Flex key={i} align="center" gap={2} py="3px">
          <Text fontSize="12px" lineHeight={1}>{row.icon}</Text>
          {loading
            ? <Skeleton h="10px" flex={1} borderRadius="sm" />
            : <Text fontSize="11px" color={textColor} noOfLines={1} flex={1}>{row.text}</Text>
          }
        </Flex>
      ))}
    </Box>
  )
}
