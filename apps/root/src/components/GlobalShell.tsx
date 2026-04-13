import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  VStack,
  useColorMode,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { HamburgerIcon, MoonIcon, SunIcon } from '@chakra-ui/icons'
import { useLocation, useNavigate } from 'react-router-dom'

// ── Module tabs ───────────────────────────────────────────────────────────────

const MODULES = [
  { path: '/',              label: '首頁',     exact: true },
  { path: '/to-do-list',   label: '待辦清單'              },
  { path: '/habit-tracker',label: '習慣追蹤'              },
  { path: '/ebook-reader', label: '電子書'                },
  { path: '/resign-stamp', label: '離職集章'              },
] as const

// ── Sidebar items (modules that have sub-pages) ───────────────────────────────

const SIDEBAR_CONFIG: Record<string, { label: string; path: string }[]> = {
  '/habit-tracker': [
    { label: '儀表板',   path: '/habit-tracker'            },
    { label: '統計分析', path: '/habit-tracker/statistics' },
  ],
  '/resign-stamp': [
    { label: '集章主頁', path: '/resign-stamp'         },
    { label: '理由清單', path: '/resign-stamp/reasons' },
  ],
}

const TOPBAR_H = '60px'
const SIDEBAR_W = '200px'

// ── Types ─────────────────────────────────────────────────────────────────────

interface User {
  displayName?: string | null
  photoURL?: string | null
  email?: string | null
}

interface GlobalShellProps {
  user: User | null
  onLogout: () => void
  children: React.ReactNode
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function GlobalShell({ user, onLogout, children }: GlobalShellProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { colorMode, toggleColorMode } = useColorMode()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const bg          = useColorModeValue('white',    'gray.900')
  const sidebarBg   = useColorModeValue('gray.50',  'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg     = useColorModeValue('gray.100', 'gray.700')
  const activeBg    = useColorModeValue('blue.50',  'blue.900')
  const activeColor = useColorModeValue('blue.600', 'blue.200')
  const textColor   = useColorModeValue('gray.600', 'gray.300')
  const logoColor   = useColorModeValue('gray.800', 'white')

  // Active module (path-prefix match, '/' is exact)
  const activeModule = MODULES.find(m =>
    ('exact' in m && m.exact) ? pathname === m.path : pathname.startsWith(m.path)
  ) ?? MODULES[0]

  const sidebarItems = SIDEBAR_CONFIG[activeModule.path] ?? []
  const hasSidebar   = sidebarItems.length > 0

  const isTabActive  = (m: typeof MODULES[number]) =>
    ('exact' in m && m.exact) ? pathname === m.path : pathname.startsWith(m.path)

  const isSideActive = (path: string) => pathname === path

  // ── Shared nav item renderers ──────────────────────────────────────────────

  const TabButton = ({ m }: { m: typeof MODULES[number] }) => {
    const active = isTabActive(m)
    return (
      <Button
        variant="unstyled"
        h={TOPBAR_H}
        px={4}
        borderRadius={0}
        fontSize="sm"
        fontWeight={active ? 600 : 400}
        color={active ? activeColor : textColor}
        borderBottom="2px solid"
        borderColor={active ? 'blue.500' : 'transparent'}
        _hover={{ color: activeColor, bg: hoverBg }}
        transition="all 0.15s"
        onClick={() => navigate(m.path)}
      >
        {m.label}
      </Button>
    )
  }

  const SideItem = ({ item, onNav }: { item: { label: string; path: string }; onNav?: () => void }) => {
    const active = isSideActive(item.path)
    return (
      <Button
        variant="ghost"
        justifyContent="flex-start"
        size="sm"
        fontWeight={active ? 600 : 400}
        color={active ? activeColor : textColor}
        bg={active ? activeBg : undefined}
        borderRadius="md"
        _hover={{ bg: active ? activeBg : hoverBg }}
        onClick={() => { navigate(item.path); onNav?.() }}
      >
        {item.label}
      </Button>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Box minH="100vh">

      {/* ── Top App Bar ───────────────────────────────────────────────────── */}
      <Flex
        as="header"
        position="fixed"
        top={0} left={0} right={0}
        h={TOPBAR_H}
        bg={bg}
        borderBottom="1px" borderColor={borderColor}
        align="center"
        px={4}
        zIndex={100}
        gap={2}
        boxShadow="sm"
      >
        {/* Hamburger — mobile only */}
        <IconButton
          aria-label="開啟選單"
          icon={<HamburgerIcon />}
          variant="ghost"
          size="sm"
          display={{ base: 'flex', md: 'none' }}
          onClick={onOpen}
        />

        {/* Logo */}
        <Text
          fontWeight={700}
          fontSize="lg"
          letterSpacing="-0.5px"
          color={logoColor}
          cursor="pointer"
          mr={2}
          flexShrink={0}
          onClick={() => navigate('/')}
        >
          ◈ Labs
        </Text>

        {/* Module tabs — desktop */}
        <HStack spacing={0} flex={1} h={TOPBAR_H} display={{ base: 'none', md: 'flex' }}>
          {MODULES.map(m => <TabButton key={m.path} m={m} />)}
        </HStack>

        {/* Right actions */}
        <HStack spacing={1} ml="auto" flexShrink={0}>
          <Tooltip label={colorMode === 'light' ? '深色模式' : '淺色模式'} openDelay={400}>
            <IconButton
              aria-label="切換主題"
              icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              variant="ghost"
              size="sm"
              onClick={toggleColorMode}
            />
          </Tooltip>

          <Menu>
            <MenuButton>
              <Avatar
                size="sm"
                name={user?.displayName ?? undefined}
                src={user?.photoURL ?? undefined}
                cursor="pointer"
              />
            </MenuButton>
            <MenuList minW="180px" shadow="lg">
              <Box px={3} py={2}>
                <Text fontSize="sm" fontWeight={600} noOfLines={1}>
                  {user?.displayName}
                </Text>
                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                  {user?.email}
                </Text>
              </Box>
              <MenuDivider />
              <MenuItem onClick={onLogout} color="red.500" fontSize="sm">
                登出
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {/* ── Mobile Drawer ─────────────────────────────────────────────────── */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader fontSize="md" fontWeight={700} pb={2}>◈ Labs</DrawerHeader>
          <DrawerBody px={2} pt={0}>
            <VStack align="stretch" spacing={0}>
              {MODULES.map(m => {
                const active = isTabActive(m)
                return (
                  <Button
                    key={m.path}
                    variant="ghost"
                    justifyContent="flex-start"
                    fontWeight={active ? 600 : 400}
                    color={active ? activeColor : textColor}
                    bg={active ? activeBg : undefined}
                    borderRadius="md"
                    onClick={() => { navigate(m.path); onClose() }}
                  >
                    {m.label}
                  </Button>
                )
              })}

              {hasSidebar && (
                <>
                  <Divider my={2} />
                  <Text fontSize="xs" color="gray.400" px={2} mb={1} fontWeight={600} textTransform="uppercase" letterSpacing="wider">
                    {activeModule.label}
                  </Text>
                  {sidebarItems.map(item => (
                    <SideItem key={item.path} item={item} onNav={onClose} />
                  ))}
                </>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* ── Body ──────────────────────────────────────────────────────────── */}
      <Flex pt={TOPBAR_H} minH="100vh">

        {/* Sidebar — desktop, only when module has sub-pages */}
        {hasSidebar && (
          <Box
            as="nav"
            w={SIDEBAR_W}
            flexShrink={0}
            position="fixed"
            top={TOPBAR_H}
            bottom={0}
            bg={sidebarBg}
            borderRight="1px" borderColor={borderColor}
            pt={5} px={2}
            overflowY="auto"
            display={{ base: 'none', md: 'block' }}
          >
            <Text
              fontSize="xs"
              fontWeight={600}
              color="gray.400"
              px={2}
              mb={2}
              textTransform="uppercase"
              letterSpacing="wider"
            >
              {activeModule.label}
            </Text>
            <VStack align="stretch" spacing={1}>
              {sidebarItems.map(item => (
                <SideItem key={item.path} item={item} />
              ))}
            </VStack>
          </Box>
        )}

        {/* Main content */}
        <Box
          flex={1}
          ml={{ base: 0, md: hasSidebar ? SIDEBAR_W : 0 }}
          minW={0}
        >
          {children}
        </Box>
      </Flex>
    </Box>
  )
}
