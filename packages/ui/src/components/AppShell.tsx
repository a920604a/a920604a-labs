import { Box, Flex } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { NavBar } from './NavBar'

interface AppShellProps {
  children: ReactNode
  appName: string
}

export function AppShell({ children, appName }: AppShellProps) {
  return (
    <Flex direction="column" minH="100vh">
      <NavBar appName={appName} />
      <Box as="main" flex="1" p={4}>
        {children}
      </Box>
    </Flex>
  )
}
