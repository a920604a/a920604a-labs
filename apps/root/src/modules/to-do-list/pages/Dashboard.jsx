import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Text,
  Spinner,
  Center,
  useToast,
  Flex
} from '@chakra-ui/react';
import 'react-calendar/dist/Calendar.css';

import StatsView from '../components/StatsView';
import CalendarView from '../components/CalendarView';
import ListView from '../components/ListView';
import LayoutSwitcher from '../components/LayoutSwitcher';
import { getAllTodos} from '../utils/firebaseDb';
import { getFirebaseAuth } from '@a920604a/auth';
import {  onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '@a920604a/auth';

const tags = ['工作', '學習', '個人', '其他'];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [todos, setTodos] = useState([]);
  const [page, setPage] = useState('list'); // 預覽模式：list, stats, calendar
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const toast = useToast();

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const todos = await getAllTodos();
      setTodos(todos);
    } catch (err) {
      console.error('取得待辦清單失敗', err);
      toast({
        title: '讀取失敗',
        description: '無法取得待辦清單資料，請稍後再試。',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);


  // 登入狀態監聽
  useEffect(() => {
      const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (user) => {
          if (user) {
              setUserName(user.displayName || '親愛的用戶');
              await fetchTodos();
          } else {
              navigate('/');
          }
      });
      return () => unsubscribe();
  }, [user, navigate, fetchTodos]);


  const getNearDeadlineTodos = (todos) => {
  const today = new Date();
    return todos
      .filter((todo) => {
        if (!todo.deadline) return false;
        const deadline = new Date(todo.deadline);
        const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 5 && !todo.complete;
      })
      .sort((a, b) => {
        const aDays = Math.ceil((new Date(a.deadline) - today) / (1000 * 60 * 60 * 24));
        const bDays = Math.ceil((new Date(b.deadline) - today) / (1000 * 60 * 60 * 24));
        return aDays - bDays;
      });
  };

  const getDeadlineColor = (deadline) => {
    const today = new Date();
    const d = new Date(deadline);
    const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'red.500';
    if (diffDays <= 2) return 'orange.400';
    return 'yellow.500';
  };


  const nearDeadlineTodos = getNearDeadlineTodos(todos);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="teal.500" />
      </Center>
    );
  }

  return (
    <Box p={5} maxW="600px" mx="auto">
      {userName && (
        <Text fontSize="md" color="gray.600" mb={4}>
          歡迎回來，{userName}！
        </Text>
      )}

      {nearDeadlineTodos.map((todo) => (
        <Box
          key={todo.id}
          mb={2}
          p={3}
          borderLeft="4px solid"
          borderColor={getDeadlineColor(todo.deadline)}
          bg="white"
          borderRadius="md"
          shadow="sm"
        >
          <Text fontWeight="medium">{todo.title}</Text>
          <Flex justify="space-between" align="center">
            <Text fontSize="sm" color="gray.600">
              截止日期：{new Date(todo.deadline).toLocaleDateString()}
            </Text>
            <Text
              fontSize="sm"
              color={getDeadlineColor(todo.deadline)}
              fontWeight="bold"
            >
              {(() => {
                const days = Math.ceil((new Date(todo.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                if (days <= 0) return '🔥 今天到期';
                if (days <= 2) return '⚠️ 非常緊急';
                return '⏳ 即將到期';
              })()}
            </Text>
          </Flex>


        </Box>
      ))}


      <LayoutSwitcher page={page} setPage={setPage} />

      {page === 'list' && (<ListView todos={todos} tags={tags} />)}
      {page === 'stats' && <StatsView todos={todos} tags={tags} />}
      {page === 'calendar' && <CalendarView todos={todos} />}
    </Box>
  );
}
