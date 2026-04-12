import React, { useState, useMemo } from 'react';
import {
  Box,
  Text,
  VStack,
  Heading,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function CalendarView({ todos }) {
  const [selectedDate, setSelectedDate] = useState(null);

  // 將 todos 依 deadline 分組
  const todosByDate = useMemo(() => {
    return todos.reduce((acc, todo) => {
      if (!todo.deadline) return acc;
      const dateKey = new Date(todo.deadline).toDateString();
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(todo);
      return acc;
    }, {});
  }, [todos]);

  // 點擊日期時處理選取
  const handleDateClick = (date) => {
    setSelectedDate(date.toDateString());
  };

  // Chakra 樣式用色
  const highlightBg = useColorModeValue('teal.100', 'teal.700');

  return (
    <Box>
      {/* 日曆主體 */}
      <Calendar
        onClickDay={handleDateClick}
        tileContent={({ date }) => {
          const dateKey = date.toDateString();
          const dayTodos = todosByDate[dateKey];

          return dayTodos ? (
            <Box>
              {dayTodos.slice(0, 2).map((todo) => (
                <Text
                  key={todo.id}
                  fontSize="xs"
                  noOfLines={1}
                  bg="blue.100"
                  m="1"
                  p="1"
                  borderRadius="md"
                >
                  {todo.title}
                </Text>
              ))}
              {dayTodos.length > 2 && (
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  +{dayTodos.length - 2} more
                </Text>
              )}
            </Box>
          ) : null;
        }}
        tileClassName={({ date }) =>
          date.toDateString() === selectedDate ? 'selected-day' : ''
        }
      />

      {/* 顯示當日任務清單 */}
      {selectedDate && todosByDate[selectedDate] && (
        <Box mt={6} p={4} borderWidth="1px" borderRadius="md">
          <Heading as="h3" size="md" mb={3}>
            {selectedDate} 的任務
          </Heading>
          <Divider mb={3} />
          <VStack align="start" spacing={2}>
            {todosByDate[selectedDate].map((todo) => (
              <Box
                key={todo.id}
                p={2}
                bg="gray.100"
                borderRadius="md"
                w="100%"
              >
                <Text fontWeight="bold">{todo.title}</Text>
                <Text fontSize="sm" color="gray.600">
                  {todo.content}
                </Text>
              </Box>
            ))}
          </VStack>
        </Box>
      )}

      {/* 自訂樣式 */}
      <style>
        {`
          .react-calendar__tile.selected-day {
            background: ${highlightBg} !important;
            transform: scale(1.1);
            z-index: 1;
            border-radius: 8px;
            box-shadow: 0 0 5px rgba(0,0,0,0.2);
          }
        `}
      </style>
    </Box>
  );
}
