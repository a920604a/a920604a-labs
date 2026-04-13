import {
  Box,
  Flex,
  SimpleGrid,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react'

interface AchievementDef {
  count: number
  label: string
  emoji: string
  color: string      // Chakra colorScheme token
  description: string
}

const DEFS: AchievementDef[] = [
  {
    count: 25,
    label: '初心者',
    emoji: '🌱',
    color: 'yellow',
    description: '蓋滿 25 章，離職之路的第一步！',
  },
  {
    count: 50,
    label: '中堅派',
    emoji: '🌿',
    color: 'teal',
    description: '突破半程，你的耐心值得尊敬！',
  },
  {
    count: 75,
    label: '資深怨將',
    emoji: '🏅',
    color: 'blue',
    description: '75 章在身，離自由不遠了！',
  },
  {
    count: 100,
    label: '傳說離職者',
    emoji: '🏆',
    color: 'purple',
    description: '完成 100 章！你是傳說中的離職勇者！',
  },
]

interface AchievementsProps {
  stamps: number
  unlocked: number[]
}

export default function Achievements({ stamps, unlocked }: AchievementsProps) {
  const cardBg      = useColorModeValue('white',    'gray.800')
  const border      = useColorModeValue('gray.100', 'gray.700')
  const lockedBg    = useColorModeValue('gray.50',  'gray.750')
  const lockedBorder = useColorModeValue('gray.200', 'gray.600')
  const lockedText  = useColorModeValue('gray.400', 'gray.500')
  const labelColor  = useColorModeValue('gray.500', 'gray.400')

  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={border}
      borderRadius="xl"
      p={5}
      shadow="sm"
    >
      <Text
        fontSize="xs"
        fontWeight={700}
        color={labelColor}
        textTransform="uppercase"
        letterSpacing="wider"
        mb={4}
      >
        🎯 成就徽章
      </Text>

      <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={3}>
        {DEFS.map(({ count, label, emoji, color, description }) => {
          const isUnlocked = unlocked.includes(count) || stamps >= count
          const pct = Math.min(100, Math.round((stamps / count) * 100))

          return (
            <Tooltip
              key={count}
              label={isUnlocked ? `✅ ${description}` : `${description}（進度 ${pct}%）`}
              placement="top"
              hasArrow
              openDelay={200}
            >
              <Box
                border="2px solid"
                borderColor={isUnlocked ? `${color}.300` : lockedBorder}
                bg={isUnlocked ? `${color}.50` : lockedBg}
                borderRadius="xl"
                p={4}
                textAlign="center"
                opacity={isUnlocked ? 1 : 0.5}
                filter={isUnlocked ? 'none' : 'grayscale(70%)'}
                transition="all 0.2s"
                cursor="default"
                _dark={{
                  bg: isUnlocked ? `${color}.900` : 'gray.750',
                }}
              >
                <Text fontSize="2xl" mb={1}>
                  {emoji}
                </Text>
                <Text
                  fontSize="sm"
                  fontWeight={700}
                  color={isUnlocked ? `${color}.600` : lockedText}
                  _dark={{ color: isUnlocked ? `${color}.300` : 'gray.500' }}
                >
                  {label}
                </Text>
                <Text fontSize="xs" color={isUnlocked ? `${color}.500` : lockedText} mt={0.5}>
                  {count} 章
                </Text>
                {!isUnlocked && (
                  <Flex justify="center" mt={2}>
                    <Box
                      h="3px"
                      w="100%"
                      bg={lockedBorder}
                      borderRadius="full"
                      position="relative"
                      overflow="hidden"
                    >
                      <Box
                        h="100%"
                        w={`${pct}%`}
                        bg={`${color}.300`}
                        borderRadius="full"
                        transition="width 0.5s"
                      />
                    </Box>
                  </Flex>
                )}
              </Box>
            </Tooltip>
          )
        })}
      </SimpleGrid>
    </Box>
  )
}
