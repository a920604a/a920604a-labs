import { Button, Center, Text, VStack, useColorModeValue } from '@chakra-ui/react'
import type { ReactNode } from 'react'

export interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: string
  ctaLabel?: string
  onCta?: () => void
}

export function EmptyState({ icon, title, description, ctaLabel, onCta }: EmptyStateProps) {
  const mutedColor = useColorModeValue('gray.500', 'gray.400')

  return (
    <Center py={16}>
      <VStack spacing={3} textAlign="center">
        <Text fontSize="4xl" lineHeight={1}>{icon}</Text>
        <Text fontWeight={700} fontSize="md" color={mutedColor}>{title}</Text>
        {description && (
          <Text fontSize="sm" color={mutedColor} maxW="280px">{description}</Text>
        )}
        {ctaLabel && onCta && (
          <Button size="sm" colorScheme="brand" borderRadius="lg" onClick={onCta} mt={1}>
            {ctaLabel}
          </Button>
        )}
      </VStack>
    </Center>
  )
}
