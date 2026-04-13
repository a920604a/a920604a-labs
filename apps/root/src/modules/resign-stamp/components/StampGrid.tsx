import React, { useState } from 'react'
import { Box, Grid, Tooltip, useColorModeValue } from '@chakra-ui/react'
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

const StampGrid: React.FC<StampGridProps> = ({ stamps, maxStamps, onStampAdd }) => {
  const [modalOpen, setModalOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const emptyBg    = useColorModeValue('gray.100', 'gray.700')
  const emptyHover = useColorModeValue('gray.200', 'gray.600')
  const stampedBg  = useColorModeValue('green.400', 'green.500')

  const isStamped = (index: number) => stamps.some(s => s.index === index)

  const handleClick = (index: number) => {
    if (isStamped(index)) return
    setActiveIndex(index)
    setModalOpen(true)
  }

  const handleSubmit = (reason: string) => {
    if (activeIndex !== null) onStampAdd(activeIndex, reason)
    const audio = new Audio(import.meta.env.BASE_URL + 'audio/stamp.mp3')
    audio.play()
    setModalOpen(false)
    setActiveIndex(null)
  }

  return (
    <>
      <Grid templateColumns="repeat(10, 1fr)" gap={2}>
        {[...Array(maxStamps)].map((_, i) => {
          const index  = i + 1
          const stamped = isStamped(index)
          const stamp   = stamps.find(s => s.index === index)

          return (
            <Tooltip
              key={index}
              label={stamped ? stamp?.reason : `第 ${index} 章`}
              placement="top"
              hasArrow
              openDelay={200}
            >
              <Box
                as="button"
                h="40px"
                borderRadius="md"
                border="1px solid"
                borderColor={stamped ? 'green.400' : useColorModeValue('gray.200', 'gray.600')}
                bg={stamped ? stampedBg : emptyBg}
                color={stamped ? 'white' : useColorModeValue('gray.600', 'gray.300')}
                fontSize="xs"
                fontWeight={stamped ? 700 : 400}
                cursor={stamped ? 'default' : 'pointer'}
                _hover={stamped ? {} : { bg: emptyHover }}
                transition="all 0.15s"
                onClick={() => handleClick(index)}
                disabled={stamped}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {stamped ? '🔖' : index}
              </Box>
            </Tooltip>
          )
        })}
      </Grid>

      <ReasonModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  )
}

export default StampGrid
