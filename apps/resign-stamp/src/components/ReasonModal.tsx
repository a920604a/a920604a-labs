import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Text,
  Textarea,
  useColorModeValue,
} from '@chakra-ui/react'
import { getAuth } from 'firebase/auth'

const MAX_CHARS = 200
const RESIGN_API_URL = import.meta.env.VITE_RESIGN_API_URL || 'http://localhost:8788'

interface ReasonModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reason: string) => void
  stampIndex?: number
  initialReason?: string
}

export default function ReasonModal({
  isOpen,
  onClose,
  onSubmit,
  stampIndex,
  initialReason = '',
}: ReasonModalProps) {
  const [reason, setReason]           = useState(initialReason)
  const [polished, setPolished]       = useState('')
  const [polishing, setPolishing]     = useState(false)
  const [showPolished, setShowPolished] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setReason(initialReason)
      setPolished('')
      setShowPolished(false)
    }
  }, [isOpen, initialReason])

  const handleClose = () => {
    setReason('')
    setPolished('')
    setShowPolished(false)
    onClose()
  }

  const handleSubmit = () => {
    if (reason.trim()) {
      onSubmit(reason.trim())
      setReason('')
      setPolished('')
      setShowPolished(false)
    }
  }

  const handlePolish = async () => {
    setShowPolished(true)
    setPolishing(true)
    setPolished('')
    try {
      const token = await getAuth().currentUser?.getIdToken()
      if (!token) throw new Error('no token')
      const res = await fetch(`${RESIGN_API_URL}/ai/polish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: reason.trim() }),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      const data = await res.json() as { polished: string }
      setPolished(data.polished ?? '')
    } catch {
      setPolished('')
      setShowPolished(false)
    } finally {
      setPolishing(false)
    }
  }

  const remaining        = MAX_CHARS - reason.length
  const countColorNormal = useColorModeValue('gray.400', 'gray.500')
  const countColor       = remaining < 20 ? 'red.400' : countColorNormal
  const cardBg           = useColorModeValue('orange.50', 'orange.900')
  const cardBorder       = useColorModeValue('orange.200', 'orange.700')

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md" motionPreset="scale">
      <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.500" />
      <ModalContent borderRadius="2xl" overflow="hidden">
        <ModalHeader
          bgGradient="linear(to-r, red.400, orange.400)"
          color="white"
          py={5}
          px={6}
          fontSize="lg"
          fontWeight={700}
        >
          🔖 蓋第 {stampIndex} 章
          <Text fontSize="sm" fontWeight={400} mt={1} opacity={0.9}>
            請記錄這次想離職的原因
          </Text>
        </ModalHeader>
        <ModalCloseButton color="white" top={4} right={4} />

        <ModalBody pt={5} pb={2} px={6}>
          <Textarea
            value={reason}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) setReason(e.target.value)
            }}
            placeholder="例如：老闆又在無理取鬧、加班沒有補償、薪水三年沒漲…"
            rows={5}
            resize="none"
            borderRadius="lg"
            focusBorderColor="red.400"
            fontSize="md"
            autoFocus
          />
          <Flex justify="space-between" mt={1} align="center">
            <Button
              size="xs"
              variant="ghost"
              colorScheme="orange"
              onClick={handlePolish}
              isDisabled={reason.trim().length === 0 || polishing}
              isLoading={polishing}
              loadingText="潤色中…"
            >
              ✨ AI 潤色
            </Button>
            <Text fontSize="xs" color={countColor}>
              {remaining} / {MAX_CHARS}
            </Text>
          </Flex>

          {showPolished && (
            <Box
              mt={3}
              p={4}
              bg={cardBg}
              border="1px solid"
              borderColor={cardBorder}
              borderLeft="3px solid"
              borderLeftColor="orange.400"
              borderRadius="lg"
            >
              <Text fontSize="xs" fontWeight={700} color="orange.500" mb={2} textTransform="uppercase" letterSpacing="wider">
                ✨ AI 建議
              </Text>
              {polishing ? (
                <>
                  <Skeleton height="16px" mb={2} />
                  <Skeleton height="16px" width="70%" />
                </>
              ) : (
                <>
                  <Text fontSize="sm" color={useColorModeValue('gray.700', 'gray.100')} lineHeight="tall" mb={3}>
                    {polished}
                  </Text>
                  <Flex justify="flex-end">
                    <Button
                      size="xs"
                      colorScheme="orange"
                      variant="outline"
                      borderRadius="md"
                      onClick={() => {
                        if (polished.length <= MAX_CHARS) setReason(polished)
                        setShowPolished(false)
                      }}
                    >
                      用這個 →
                    </Button>
                  </Flex>
                </>
              )}
            </Box>
          )}
        </ModalBody>

        <ModalFooter gap={3} pt={3} pb={5} px={6}>
          <Button variant="ghost" onClick={handleClose} borderRadius="lg">
            取消
          </Button>
          <Button
            colorScheme="red"
            onClick={handleSubmit}
            isDisabled={reason.trim().length === 0}
            borderRadius="lg"
            leftIcon={<>🔖</>}
            minW="110px"
          >
            蓋章確認
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
