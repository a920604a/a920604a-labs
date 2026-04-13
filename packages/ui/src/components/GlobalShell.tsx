import {
  Avatar,
  Box,
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
import type { ReactNode } from 'react'

// ── Public types ──────────────────────────────────────────────────────────────

export interface SidebarSubItem {
  label: string
  path: string
}

export interface SidebarModule {
  /** Route path prefix, e.g. '/habit-tracker'. Use '/' for the home item. */
  path: string
  /** Display label shown in the sidebar */
  label: string
  /** Optional icon node (e.g. from react-icons or @chakra-ui/icons) */
  icon?: ReactNode
  /** Sub-pages shown indented below this module when it is active */
  subItems?: SidebarSubItem[]
  /** If true, path must match exactly (for the Home item) */
  exact?: boolean
}

export interface GlobalShellUser {
  displayName?: string | null
  photoURL?: string | null
  email?: string | null
}

export interface GlobalShellProps {
  user: GlobalShellUser | null
  onLogout: () => void
  /** All module items — the caller owns the nav config */
  modules: SidebarModule[]
  /** Brand name shown at the top of the sidebar */
  brandName?: string
  /** Optional custom logo node to replace the brand text */
  brandLogo?: ReactNode
  children: ReactNode
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TOPBAR_H = '56px'
const SIDEBAR_W = '240px'

// ── Component ─────────────────────────────────────────────────────────────────

export function GlobalShell({
  user,
  onLogout,
  modules,
  brandName = 'Labs',
  brandLogo,
  children,
}: GlobalShellProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { colorMode, toggleColorMode } = useColorMode()
  const { isOpen, onOpen, onClose } = useDisclosure()

  // ── Theme tokens — ALL hooks called at top level, never inside loops ────────
  const topbarBg       = useColorModeValue('rgba(255,255,255,0.88)', 'rgba(26,32,44,0.90)')
  const sidebarBg      = useColorModeValue('gray.50',  'gray.900')
  const borderColor    = useColorModeValue('gray.200', 'gray.700')
  const pageBg         = useColorModeValue('white',    'gray.900')
  const hoverBg        = useColorModeValue('gray.100', 'gray.700')
  const activeModuleBg = useColorModeValue('gray.200', 'gray.700')
  const activeSubBg    = useColorModeValue('blue.50',  'blue.900')
  const activeSubColor = useColorModeValue('blue.600', 'blue.200')
  const mutedColor     = useColorModeValue('gray.500', 'gray.400')
  const labelColor     = useColorModeValue('gray.700', 'gray.200')
  const brandColor     = useColorModeValue('gray.900', 'white')

  // ── Active helpers ─────────────────────────────────────────────────────────
  const isModuleActive = (m: SidebarModule) =>
    m.exact ? pathname === m.path : pathname.startsWith(m.path)

  const isSubActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  // ── Current page label (for topbar title) ─────────────────────────────────
  const activeModule = modules.find(isModuleActive)
  const activeSubItem = activeModule?.subItems?.find(s => isSubActive(s.path))
  const pageTitle = activeSubItem?.label ?? activeModule?.label ?? ''

  // ── Nav click: go to first sub-item or module path ─────────────────────────
  const handleModuleClick = (m: SidebarModule) => {
    navigate(m.subItems?.[0]?.path ?? m.path)
  }

  // ── Sidebar nav list ───────────────────────────────────────────────────────
  // Defined as JSX, not an inner component, to avoid hook ordering issues.
  const sidebarNav = (onNav?: () => void) => (
    <VStack align="stretch" spacing={0} px={2} pt={2}>
      {modules.map(m => {
        const active = isModuleActive(m)
        return (
          <Box key={m.path}>
            {/* Module row */}
            <Flex
              align="center"
              gap={2}
              px={3}
              py="7px"
              borderRadius="md"
              cursor="pointer"
              bg={active ? activeModuleBg : 'transparent'}
              _hover={{ bg: active ? activeModuleBg : hoverBg }}
              transition="background 0.12s"
              onClick={() => { handleModuleClick(m); onNav?.() }}
              role="button"
            >
              {m.icon && (
                <Box
                  flexShrink={0}
                  color={active ? labelColor : mutedColor}
                  fontSize="15px"
                  lineHeight={1}
                  mt="1px"
                >
                  {m.icon}
                </Box>
              )}
              <Text
                fontSize="14px"
                fontWeight={active ? 600 : 400}
                color={active ? labelColor : mutedColor}
                lineHeight="1.4"
                noOfLines={1}
              >
                {m.label}
              </Text>
            </Flex>

            {/* Sub-items — shown when module is active and has sub-pages */}
            {active && m.subItems && m.subItems.length > 0 && (
              <VStack align="stretch" spacing={0} mt="2px" mb="4px">
                {m.subItems.map(sub => {
                  const subActive = isSubActive(sub.path)
                  return (
                    <Flex
                      key={sub.path}
                      align="center"
                      pl={m.icon ? 9 : 6}
                      pr={3}
                      py="5px"
                      borderRadius="md"
                      cursor="pointer"
                      bg={subActive ? activeSubBg : 'transparent'}
                      _hover={{ bg: subActive ? activeSubBg : hoverBg }}
                      transition="background 0.12s"
                      onClick={() => { navigate(sub.path); onNav?.() }}
                      role="button"
                    >
                      <Text
                        fontSize="13px"
                        fontWeight={subActive ? 600 : 400}
                        color={subActive ? activeSubColor : mutedColor}
                        lineHeight="1.4"
                        noOfLines={1}
                      >
                        {sub.label}
                      </Text>
                    </Flex>
                  )
                })}
              </VStack>
            )}
          </Box>
        )
      })}
    </VStack>
  )

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box minH="100vh" bg={pageBg}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <Flex
        as="header"
        position="fixed"
        top={0} left={0} right={0}
        h={TOPBAR_H}
        bg={topbarBg}
        backdropFilter="saturate(180%) blur(12px)"
        borderBottom="1px solid"
        borderColor={borderColor}
        align="center"
        px={4}
        zIndex={100}
        gap={3}
      >
        {/* Hamburger — mobile only */}
        <IconButton
          aria-label="開啟選單"
          icon={<HamburgerIcon />}
          variant="ghost"
          size="sm"
          display={{ base: 'flex', md: 'none' }}
          onClick={onOpen}
          flexShrink={0}
        />

        {/* Mobile: brand name; desktop: current page title */}
        <Text
          fontSize="sm"
          fontWeight={600}
          color={labelColor}
          noOfLines={1}
          flex={{ base: 1, md: undefined }}
        >
          <Box as="span" display={{ base: 'inline', md: 'none' }}>
            {brandLogo ?? brandName}
          </Box>
          <Box as="span" display={{ base: 'none', md: 'inline' }}>
            {pageTitle}
          </Box>
        </Text>

        {/* Spacer — desktop */}
        <Box flex={1} display={{ base: 'none', md: 'block' }} />

        {/* Right controls */}
        <HStack spacing={1} flexShrink={0}>
          <Tooltip label={colorMode === 'light' ? '深色模式' : '淺色模式'} openDelay={500}>
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
            <MenuList minW="180px" shadow="lg" borderRadius="xl">
              <Box px={3} py={2}>
                <Text fontSize="sm" fontWeight={600} noOfLines={1}>
                  {user?.displayName}
                </Text>
                <Text fontSize="xs" color={mutedColor} noOfLines={1}>
                  {user?.email}
                </Text>
              </Box>
              <MenuDivider />
              <MenuItem
                onClick={onLogout}
                color="red.500"
                fontSize="sm"
                borderRadius="md"
              >
                登出
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {/* ── Mobile drawer ───────────────────────────────────────────────────── */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton top={3} right={3} />
          <DrawerHeader
            fontSize="sm"
            fontWeight={700}
            color={brandColor}
            pt={4}
            pb={3}
            px={5}
          >
            {brandLogo ?? brandName}
          </DrawerHeader>
          <DrawerBody px={2} pt={0} pb={4}>
            {sidebarNav(onClose)}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* ── Page layout ─────────────────────────────────────────────────────── */}
      <Flex pt={TOPBAR_H} minH="100vh">

        {/* Desktop sidebar — fixed, always visible */}
        <Box
          as="nav"
          w={SIDEBAR_W}
          flexShrink={0}
          position="fixed"
          top={TOPBAR_H}
          bottom={0}
          bg={sidebarBg}
          borderRight="1px solid"
          borderColor={borderColor}
          overflowY="auto"
          display={{ base: 'none', md: 'flex' }}
          flexDirection="column"
          pt={3}
          pb={4}
        >
          {/* Brand */}
          <Text
            fontSize="15px"
            fontWeight={700}
            color={brandColor}
            letterSpacing="-0.3px"
            px={5}
            mb={3}
            flexShrink={0}
            cursor="pointer"
            onClick={() => navigate('/')}
          >
            {brandLogo ?? brandName}
          </Text>

          {sidebarNav()}
        </Box>

        {/* Main content */}
        <Box
          flex={1}
          ml={{ base: 0, md: SIDEBAR_W }}
          minW={0}
          minH="100vh"
        >
          {children}
        </Box>
      </Flex>
    </Box>
  )
}
