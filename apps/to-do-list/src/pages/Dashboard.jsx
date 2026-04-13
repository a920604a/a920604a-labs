import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Center, Container, Divider, Flex, Heading, HStack,
  Spinner, Text, useColorModeValue, VStack,
} from '@chakra-ui/react';
import { WarningTwoIcon } from '@chakra-ui/icons';
import { onAuthStateChanged } from 'firebase/auth';

import StatsView    from '../components/StatsView';
import CalendarView from '../components/CalendarView';
import ListView     from '../components/ListView';
import LayoutSwitcher from '../components/LayoutSwitcher';

import { getAllTodos }      from '../utils/firebaseDb';
import { getFirebaseAuth } from '@a920604a/auth';
import { useAuth }         from '@a920604a/auth';

const TAGS = ['工作', '學習', '個人', '其他'];

export default function Dashboard() {
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const [todos,     setTodos]    = useState([]);
  const [page,      setPage]     = useState('list');
  const [loading,   setLoading]  = useState(false);
  const [userName,  setUserName] = useState('');

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setTodos(await getAllTodos());
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (u) => {
      if (u) { setUserName(u.displayName || ''); await fetchTodos(); }
      else   { navigate('/'); }
    });
    return () => unsub();
  }, [user, navigate, fetchTodos]);

  // Near-deadline todos (next 5 days, incomplete)
  const alertTodos = todos.filter((t) => {
    if (t.complete || !t.deadline) return false;
    const diff = Math.ceil((new Date(t.deadline) - new Date()) / 86400000);
    return diff >= 0 && diff <= 5;
  }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  const cardBg    = useColorModeValue('white',     'gray.800');
  const border    = useColorModeValue('gray.100',  'gray.700');
  const subText   = useColorModeValue('gray.500',  'gray.400');
  const alertBg   = useColorModeValue('orange.50', 'orange.900');
  const alertBorder = useColorModeValue('orange.200', 'orange.700');

  if (loading && todos.length === 0) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="blue.400" thickness="4px" />
      </Center>
    );
  }

  return (
    <Container maxW="2xl" py={8} px={{ base: 4, md: 8 }}>
      <VStack spacing={6} align="stretch">

        {/* ── Header ──────────────────────────────────────────── */}
        <Box>
          <Heading size="xl" fontWeight={800} color={useColorModeValue('blue.500', 'blue.300')}>
            📝 待辦清單
          </Heading>
          {userName && (
            <Text color={subText} mt={1} fontSize="sm">
              歡迎回來，{userName}！今天有什麼要完成的？
            </Text>
          )}
        </Box>

        {/* ── Summary stats ───────────────────────────────────── */}
        <HStack
          bg={cardBg}
          border="1px solid"
          borderColor={border}
          borderRadius="xl"
          p={4}
          spacing={0}
          shadow="sm"
          divider={<Divider orientation="vertical" h="40px" />}
        >
          {[
            { label: '全部',   value: todos.length,                           color: 'blue.500'  },
            { label: '未完成', value: todos.filter(t => !t.complete).length,  color: 'orange.400'},
            { label: '已完成', value: todos.filter(t =>  t.complete).length,  color: 'green.500' },
            { label: '即將到期',value: alertTodos.length,                     color: 'red.400'   },
          ].map(({ label, value, color }) => (
            <VStack key={label} flex={1} spacing={0} py={1}>
              <Text fontSize="xl" fontWeight={800} color={color}>{value}</Text>
              <Text fontSize="xs" color={subText}>{label}</Text>
            </VStack>
          ))}
        </HStack>

        {/* ── Deadline alerts ─────────────────────────────────── */}
        {alertTodos.length > 0 && (
          <Box
            bg={alertBg}
            border="1px solid"
            borderColor={alertBorder}
            borderLeft="4px solid"
            borderLeftColor="orange.400"
            borderRadius="xl"
            p={4}
          >
            <HStack mb={3} spacing={2}>
              <WarningTwoIcon color="orange.400" />
              <Text fontWeight={700} fontSize="sm" color={useColorModeValue('orange.700', 'orange.200')}>
                即將到期（{alertTodos.length} 項）
              </Text>
            </HStack>
            <VStack spacing={2} align="stretch">
              {alertTodos.map((t) => {
                const diff = Math.ceil((new Date(t.deadline) - new Date()) / 86400000);
                return (
                  <Flex key={t.id} justify="space-between" align="center">
                    <Text fontSize="sm" fontWeight={500} noOfLines={1} flex={1}>
                      {t.title}
                    </Text>
                    <Text
                      fontSize="xs"
                      fontWeight={700}
                      color={diff === 0 ? 'red.500' : diff <= 2 ? 'orange.500' : 'yellow.600'}
                      ml={3}
                      flexShrink={0}
                    >
                      {diff === 0 ? '🔥 今天到期' : diff <= 2 ? `⚠️ ${diff} 天後` : `⏳ ${diff} 天後`}
                    </Text>
                  </Flex>
                );
              })}
            </VStack>
          </Box>
        )}

        {/* ── View switcher ───────────────────────────────────── */}
        <LayoutSwitcher page={page} setPage={setPage} />

        {/* ── Content ─────────────────────────────────────────── */}
        {page === 'list'     && <ListView todos={todos} tags={TAGS} />}
        {page === 'stats'    && <StatsView todos={todos} tags={TAGS} />}
        {page === 'calendar' && <CalendarView todos={todos} />}

      </VStack>
    </Container>
  );
}
