import {
  Box,
  Button,
  Flex,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react'
import { DownloadIcon } from '@chakra-ui/icons'

interface ProgressSectionProps {
  progress: number   // 0–100
  stamps: number
  maxStamps: number
  onExport: () => void
}

const MILESTONES = [25, 50, 75, 100]

export default function ProgressSection({
  progress,
  stamps,
  maxStamps,
  onExport,
}: ProgressSectionProps) {
  const cardBg     = useColorModeValue('white',    'gray.800')
  const border     = useColorModeValue('gray.100', 'gray.700')
  const labelColor = useColorModeValue('gray.500', 'gray.400')
  const trackBg    = useColorModeValue('gray.100', 'gray.700')

  const barColor =
    progress >= 100 ? 'green' :
    progress >= 75  ? 'teal'  :
    progress >= 50  ? 'blue'  :
    progress >= 25  ? 'orange': 'red'

  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={border}
      borderRadius="xl"
      p={6}
      shadow="sm"
    >
      {/* ── Stats row ─────────────────────────────────────────────── */}
      <SimpleGrid columns={3} spacing={4} mb={6}>
        <Stat>
          <StatLabel color={labelColor} fontSize="xs" textTransform="uppercase" letterSpacing="wider">
            已蓋章
          </StatLabel>
          <StatNumber fontSize="3xl" fontWeight={800} color="green.500">
            {stamps}
          </StatNumber>
          <StatHelpText mb={0}>/ {maxStamps} 章</StatHelpText>
        </Stat>

        <Stat>
          <StatLabel color={labelColor} fontSize="xs" textTransform="uppercase" letterSpacing="wider">
            剩餘
          </StatLabel>
          <StatNumber fontSize="3xl" fontWeight={800} color="orange.400">
            {maxStamps - stamps}
          </StatNumber>
          <StatHelpText mb={0}>章未蓋</StatHelpText>
        </Stat>

        <Stat>
          <StatLabel color={labelColor} fontSize="xs" textTransform="uppercase" letterSpacing="wider">
            完成度
          </StatLabel>
          <StatNumber fontSize="3xl" fontWeight={800} color={`${barColor}.500`}>
            {progress}%
          </StatNumber>
          <StatHelpText mb={0}>集章進度</StatHelpText>
        </Stat>
      </SimpleGrid>

      {/* ── Progress bar ──────────────────────────────────────────── */}
      <Box position="relative" mb={2}>
        <Progress
          value={progress}
          colorScheme={barColor}
          borderRadius="full"
          size="lg"
          bg={trackBg}
          hasStripe={progress < 100}
          isAnimated={progress < 100}
        />

        {/* Milestone tick marks */}
        {MILESTONES.slice(0, -1).map((m) => (
          <Tooltip key={m} label={`${m} 章里程碑`} placement="top" hasArrow>
            <Box
              position="absolute"
              top="-6px"
              left={`${m}%`}
              transform="translateX(-50%)"
              w="2px"
              h="calc(100% + 12px)"
              bg={stamps >= m ? `${barColor}.600` : useColorModeValue('gray.300', 'gray.600')}
              cursor="pointer"
            />
          </Tooltip>
        ))}
      </Box>

      {/* Milestone labels */}
      <Flex justify="space-between" px={0} mb={5}>
        {MILESTONES.map((m) => (
          <Text
            key={m}
            fontSize="xs"
            color={stamps >= m ? `${barColor}.500` : labelColor}
            fontWeight={stamps >= m ? 700 : 400}
          >
            {m}
          </Text>
        ))}
      </Flex>

      {/* ── Export button ─────────────────────────────────────────── */}
      <Flex justify="flex-end">
        <Button
          leftIcon={<DownloadIcon />}
          colorScheme="red"
          variant="solid"
          onClick={onExport}
          size="md"
          borderRadius="lg"
          shadow="sm"
        >
          匯出離職證明 PDF
        </Button>
      </Flex>
    </Box>
  )
}
