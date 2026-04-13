import { useEffect, useState } from 'react'
import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useColorModeValue,
} from '@chakra-ui/react'

const MAX_CHARS = 200

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
  const [reason, setReason] = useState(initialReason)

  useEffect(() => {
    if (isOpen) setReason(initialReason)
  }, [isOpen, initialReason])

  const handleClose = () => {
    setReason('')
    onClose()
  }

  const handleSubmit = () => {
    if (reason.trim()) {
      onSubmit(reason.trim())
      setReason('')
    }
  }

  const remaining = MAX_CHARS - reason.length
  const countColor = remaining < 20 ? 'red.400' : useColorModeValue('gray.400', 'gray.500')

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
          <Flex justify="flex-end" mt={1}>
            <Text fontSize="xs" color={countColor}>
              {remaining} / {MAX_CHARS}
            </Text>
          </Flex>
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
