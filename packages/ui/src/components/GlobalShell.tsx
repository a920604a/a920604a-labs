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
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react'
import { HamburgerIcon } from '@chakra-ui/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { useState, type ReactNode } from 'react'
import { useAppTheme } from '../ThemeProvider'
import { THEME_META, THEME_ORDER } from '../theme/themes'

// ── Public types ──────────────────────────────────────────────────────────────

export interface SidebarSubItem {
  label: string
  path: string
}

export interface SidebarModule {
  path: string
  label: string
  icon?: ReactNode
  subItems?: SidebarSubItem[]
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
  modules: SidebarModule[]
  brandName?: string
  brandLogo?: ReactNode
  insightsPanel?: ReactNode
  children: ReactNode
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TOPBAR_H    = '56px'
const SIDEBAR_W   = '240px'
const SIDEBAR_W_C = '52px'

// ── Component ─────────────────────────────────────────────────────────────────

export function GlobalShell({
  user,
  onLogout,
  modules,
  brandName = 'Labs',
  brandLogo,
  insightsPanel,
  children,
}: GlobalShellProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { themeName, setTheme } = useAppTheme()

  const [collapsed, setCollapsed] = useState<boolean>(
    () => localStorage.getItem('sidebar-collapsed') === '1'
  )

  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('sidebar-collapsed', next ? '1' : '0')
  }

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
  const toggleBtnBg    = useColorModeValue('white',    'gray.800')

  const isModuleActive = (m: SidebarModule) =>
    m.exact ? pathname === m.path : pathname.startsWith(m.path)
  const isSubActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/')

  const activeModule  = modules.find(isModuleActive)
  const activeSubItem = activeModule?.subItems?.find(s => isSubActive(s.path))
  const pageTitle     = activeSubItem?.label ?? activeModule?.label ?? ''

  const handleModuleClick = (m: SidebarModule) => {
    navigate(m.subItems?.[0]?.path ?? m.path)
  }

  const sidebarNav = (onNav?: () => void) => (
    <VStack align="stretch" spacing={0} px={collapsed ? 1 : 2} pt={2}>
      {modules.map(m => {
        const active = isModuleActive(m)
        const row = (
          <Flex
            align="center"
            gap={collapsed ? 0 : 2}
            px={collapsed ? 0 : 3}
            py="7px"
            borderRadius="md"
            cursor="pointer"
            bg={active ? activeModuleBg : 'transparent'}
            _hover={{ bg: active ? activeModuleBg : hoverBg }}
            transition="background 0.12s"
            onClick={() => { handleModuleClick(m); onNav?.() }}
            role="button"
            justify={collapsed ? 'center' : 'flex-start'}
          >
            {m.icon && (
              <Box
                flexShrink={0}
                color={active ? labelColor : mutedColor}
                fontSize="18px"
                lineHeight={1}
              >
                {m.icon}
              </Box>
            )}
            {!collapsed && (
              <Text
                fontSize="14px"
                fontWeight={active ? 600 : 400}
                color={active ? labelColor : mutedColor}
                lineHeight="1.4"
                noOfLines={1}
              >
                {m.label}
              </Text>
            )}
          </Flex>
        )

        return (
          <Box key={m.path}>
            {collapsed
              ? <Tooltip label={m.label} placement="right" openDelay={100}>{row}</Tooltip>
              : row
            }
            {!collapsed && active && m.subItems && m.subItems.length > 0 && (
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

  const sidebarW = collapsed ? SIDEBAR_W_C : SIDEBAR_W

  return (
    <Box minH="100vh" bg={pageBg}>
      {/* Top bar */}
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
        <IconButton
          aria-label="開啟選單"
          icon={<HamburgerIcon />}
          variant="ghost"
          size="sm"
          display={{ base: 'flex', md: 'none' }}
          onClick={onOpen}
          flexShrink={0}
        />
        <Text
          fontSize="sm"
          fontWeight={600}
          color={labelColor}
          noOfLines={1}
          flex={{ base: 1, md: undefined }}
        >
          <Box as="span" display={{ base: 'inline', md: 'none' }}>{brandLogo ?? brandName}</Box>
          <Box as="span" display={{ base: 'none', md: 'inline' }}>{pageTitle}</Box>
        </Text>
        <Box flex={1} display={{ base: 'none', md: 'block' }} />
        <HStack spacing={1} flexShrink={0}>
          <Menu>
            <MenuButton>
              <Avatar
                size="sm"
                name={user?.displayName ?? undefined}
                src={user?.photoURL ?? undefined}
                cursor="pointer"
              />
            </MenuButton>
            <MenuList minW="200px" shadow="lg" borderRadius="xl">
              <Box px={3} py={2}>
                <Text fontSize="sm" fontWeight={600} noOfLines={1}>{user?.displayName}</Text>
                <Text fontSize="xs" color={mutedColor} noOfLines={1}>{user?.email}</Text>
              </Box>
              <MenuDivider />
              {/* Theme picker */}
              <Box px={3} pb={2}>
                <Text fontSize="10px" fontWeight={600} color={mutedColor}
                  textTransform="uppercase" letterSpacing="wider" mb={2}>
                  主題
                </Text>
                <HStack spacing={2} flexWrap="wrap">
                  {THEME_ORDER.map(name => {
                    const meta = THEME_META[name]
                    const active = themeName === name
                    return (
                      <Tooltip key={name} label={meta.label} openDelay={300}>
                        <Box
                          as="button"
                          w="20px" h="20px"
                          borderRadius="full"
                          bg={meta.swatch}
                          border="2px solid"
                          borderColor={active ? labelColor : 'transparent'}
                          outline={active ? '1px solid' : 'none'}
                          outlineColor={active ? meta.swatch : 'transparent'}
                          outlineOffset="2px"
                          cursor="pointer"
                          onClick={() => setTheme(name)}
                          transition="transform 0.1s"
                          _hover={{ transform: 'scale(1.15)' }}
                          aria-label={`切換至 ${meta.label} 主題`}
                          aria-pressed={active}
                        />
                      </Tooltip>
                    )
                  })}
                </HStack>
              </Box>
              <MenuDivider />
              <MenuItem onClick={onLogout} color="red.500" fontSize="sm" borderRadius="md">
                登出
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {/* Mobile drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton top={3} right={3} />
          <DrawerHeader fontSize="sm" fontWeight={700} color={brandColor} pt={4} pb={3} px={5}>
            {brandLogo ?? brandName}
          </DrawerHeader>
          <DrawerBody px={2} pt={0} pb={4}>
            {sidebarNav(onClose)}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Page layout */}
      <Flex pt={TOPBAR_H} minH="100vh">
        {/* Desktop sidebar */}
        <Box
          as="nav"
          w={sidebarW}
          flexShrink={0}
          position="fixed"
          top={TOPBAR_H}
          bottom={0}
          bg={sidebarBg}
          borderRight="1px solid"
          borderColor={borderColor}
          overflowY="auto"
          overflowX="hidden"
          display={{ base: 'none', md: 'flex' }}
          flexDirection="column"
          pt={3}
          pb={4}
          transition="width 0.2s ease"
        >
          {!collapsed && (
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
              noOfLines={1}
            >
              {brandLogo ?? brandName}
            </Text>
          )}
          {sidebarNav()}
          {!collapsed && insightsPanel && (
            <Box mt="auto" px={2} pt={2} borderTop="1px solid" borderColor={borderColor}>
              {insightsPanel}
            </Box>
          )}
          {/* Collapse toggle */}
          <Box
            position="relative"
            mt={collapsed ? 'auto' : 2}
            display="flex"
            justifyContent="center"
            pb={2}
          >
            <Tooltip label={collapsed ? '展開選單' : '收合選單'} placement="right" openDelay={300}>
              <Box
                as="button"
                w="24px" h="24px"
                borderRadius="full"
                bg={toggleBtnBg}
                border="1px solid"
                borderColor={borderColor}
                boxShadow="sm"
                display="flex"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                onClick={toggleCollapsed}
                aria-label={collapsed ? '展開選單' : '收合選單'}
                fontSize="12px"
                color={mutedColor}
                _hover={{ bg: hoverBg }}
                transition="background 0.12s"
              >
                {collapsed ? '›' : '‹'}
              </Box>
            </Tooltip>
          </Box>
        </Box>

        {/* Main content */}
        <Box
          flex={1}
          ml={{ base: 0, md: sidebarW }}
          minW={0}
          minH="100vh"
          transition="margin-left 0.2s ease"
        >
          {children}
        </Box>
      </Flex>
    </Box>
  )
}
