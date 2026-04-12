import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getHabitById } from '../utils/firebaseDb';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Box, Button, Text, VStack, HStack, Badge } from '@chakra-ui/react';
import TopBar from "../components/TopBar";

function HabitCalendar() {
  const { habitId } = useParams();
  const navigate = useNavigate();
  const [habit, setHabit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (!habitId) return;
    setLoading(true);
    getHabitById(habitId)
      .then((data) => {
        if (!data.records) data.records = [];
        setHabit(data);
      })
      .finally(() => setLoading(false));
  }, [habitId]);

  const formatDateLocal = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // 判斷某日是否已打卡
  const tileClassName = ({ date, view }) => {
    if (view === 'month' && Array.isArray(habit?.records) && habit.records.includes(formatDateLocal(date))) {
      return 'checked-in-day';
    }
    return null;
  };

  // 計算本月打卡數
  const countThisMonthCheckIns = () => {
    if (!habit?.records) return 0;
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return habit.records.filter(d => d.startsWith(monthStr)).length;
  };

  const isCheckedIn = (date) => {
    return habit?.records.includes(formatDateLocal(date));
  };

  if (loading) return <Text>載入中...</Text>;
  if (!habit) return <Text>找不到該習慣</Text>;

  return (
    <Box p={6} maxW="600px" mx="auto" boxShadow="md" borderRadius="md" bg="gray.50">
      {/* <Button mb={4} onClick={() => navigate(-1)} colorScheme="blue" size="sm">← 返回</Button> */}
      <TopBar 
        backButtonText="返回儀表板" 
        onBackClick={() => navigate(-1)} 
      />

      <VStack align="start" spacing={3} mb={6}>
        <Text fontSize="3xl" fontWeight="bold">{habit.name} 的打卡日曆</Text>
        {habit.description && (
          <Text fontSize="md" color="gray.600">{habit.description}</Text>
        )}
        <HStack spacing={4}>
          <Badge colorScheme="green" fontSize="sm">本月打卡：{countThisMonthCheckIns()} 天</Badge>
          {selectedDate && (
            <Badge colorScheme={isCheckedIn(selectedDate) ? 'blue' : 'red'} fontSize="sm">
              {formatDateLocal(selectedDate)}：{isCheckedIn(selectedDate) ? '已打卡' : '未打卡'}
            </Badge>
          )}
        </HStack>
      </VStack>

      <Calendar
        tileClassName={tileClassName}
        onClickDay={setSelectedDate}
      />

      <style>{`
        .checked-in-day {
          background: #3182CE !important;
          color: white !important;
          border-radius: 50% !important;
        }
      `}</style>
    </Box>
  );
}

export default HabitCalendar;
