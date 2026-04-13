import { useState } from 'react'
import {
  Box,
  Grid,
  Text,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react'
import ReasonModal from './ReasonModal'

export interface Stamp {
  index: number
  reason: string
  timestamp: number
}

interface StampGridProps {
  stamps: Stamp[]
  maxStamps: number
  onStampAdd: (index: number, reason: string) => void
}

/** Returns how fresh the stamp is: 0 (oldest) → 1 (newest) */
function freshness(stamp: Stamp, allStamps: Stamp[]): number {
  if (allStamps.length <= 1) return 1
  const min = Math.min(...allStamps.map(s => s.timestamp))
  const max = Math.max(...allStamps.map(s => s.timestamp))
  if (max === min) return 1
  return (stamp.timestamp - min) / (max - min)
}

export default function StampGrid({ stamps, maxStamps, onStampAdd }: StampGridProps) {
  const [modalOpen,   setModalOpen]   = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const emptyBg    = useColorModeValue('gray.100', 'gray.700')
  const emptyHover = useColorModeValue('gray.200', 'gray.600')
  const emptyText  = useColorModeValue('gray.500', 'gray.400')
  const emptyBorder = useColorModeValue('gray.200', 'gray.600')

  const handleClick = (index: number) => {
    if (stamps.some(s => s.index === index)) return
    setActiveIndex(index)
    setModalOpen(true)
  }

  const handleSubmit = (reason: string) => {
    if (activeIndex !== null) onStampAdd(activeIndex, reason)
    try {
      const audio = new Audio(import.meta.env.BASE_URL + 'audio/stamp.mp3')
      audio.play()
    } catch { /* ignore missing audio */ }
    setModalOpen(false)
    setActiveIndex(null)
  }

  return (
    <>
      <Grid templateColumns="repeat(10, 1fr)" gap={{ base: 1.5, md: 2 }}>
        {Array.from({ length: maxStamps }, (_, i) => {
          const index   = i + 1
          const stamp   = stamps.find(s => s.index === index)
          const stamped = !!stamp
          const fresh   = stamp ? freshness(stamp, stamps) : 0

          // Fresh stamps are brighter green; older ones slightly muted
          const greenL  = Math.round(35 + fresh * 15)  // 35–50
          const stampBg = stamped
            ? `hsl(142, 70%, ${greenL}%)`
            : undefined

          return (
            <Tooltip
              key={index}
              label={
                stamped
                  ? `第 ${index} 章\n${stamp.reason.slice(0, 40)}${stamp.reason.length > 40 ? '…' : ''}`
                  : `蓋第 ${index} 章`
              }
              placement="top"
              hasArrow
              openDelay={250}
              whiteSpace="pre-line"
            >
              <Box
                as="button"
                h={{ base: '32px', md: '40px' }}
                borderRadius="md"
                border="1px solid"
                borderColor={stamped ? 'green.400' : emptyBorder}
                bg={stamped ? stampBg : emptyBg}
                color={stamped ? 'white' : emptyText}
                fontSize={{ base: '9px', md: 'xs' }}
                fontWeight={stamped ? 700 : 400}
                cursor={stamped ? 'default' : 'pointer'}
                _hover={stamped ? {} : { bg: emptyHover, borderColor: 'red.300' }}
                _active={stamped ? {} : { transform: 'scale(0.92)' }}
                transition="all 0.15s"
                onClick={() => handleClick(index)}
                disabled={stamped}
                display="flex"
                alignItems="center"
                justifyContent="center"
                title={stamped ? stamp.reason : undefined}
              >
                {stamped ? (
                  <Text fontSize={{ base: '12px', md: '14px' }} lineHeight={1}>🔖</Text>
                ) : (
                  <Text>{index}</Text>
                )}
              </Box>
            </Tooltip>
          )
        })}
      </Grid>

      <ReasonModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setActiveIndex(null) }}
        onSubmit={handleSubmit}
        stampIndex={activeIndex ?? undefined}
      />
    </>
  )
}
