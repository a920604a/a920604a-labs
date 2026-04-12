import React, { useState } from 'react';
import { VStack, Box, Text, useColorModeValue } from '@chakra-ui/react';

import TimeRangeSelector from './TimeRangeSelector';
import CategoryCharts from './CategoryCharts';
import LineChartTrend from './LineChartTrend';
import CompletionRateChart from './CompletionRateChart';
import CompletedTodoList from './CompletedTodoList';  // 引入新元件

import useStatsView from '../hooks/useStatsView';

export default function StatsView({ todos, tags }) {
  const [timeRange, setTimeRange] = useState('本週');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const {
    filteredTodos,
    startDate,
    endDateState,
    data,
    completedCount,
    alertCount,
    soonDeadlineTodos,
    overdueTodos,
    lineData,
  } = useStatsView(todos, tags, timeRange, customStart, customEnd);

  const bgCard = useColorModeValue('gray.50', 'gray.700');
  const btnActive = useColorModeValue('blue.500', 'blue.300');
  const btnInactive = useColorModeValue('gray.300', 'gray.600');
  const [visibleCount, setVisibleCount] = React.useState(20);

  const completedTodos = filteredTodos.filter(t => t.complete);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < 50) {
      // 距離底部小於50px時載入更多
      setVisibleCount((count) => Math.min(count + 20, completedTodos.length));
    }
  };
  return (
    <VStack spacing={8} align="stretch" maxW="900px" mx="auto" px={6} py={6}>
      <Box p={6} bg={bgCard} rounded="md" boxShadow="md" textAlign="center">
        <Text fontSize="2xl" fontWeight="bold" mb={3}>
          任務總覽 ({timeRange})
        </Text>
        <Text fontSize="md" mb={1}>總任務數：{filteredTodos.length}</Text>
        <Text fontSize="md" mb={3}>已完成任務數：{completedCount}</Text>
        <Text fontSize="md" color="teal.500">🔔 提醒任務：{alertCount} / {filteredTodos.length}</Text>
        <Text fontSize="md" color="orange.500">⚠️ 即將到期任務：{soonDeadlineTodos.length}</Text>
        <Text fontSize="md" color="red.500">❗ 逾期未完成任務：{overdueTodos.length}</Text>

        {startDate && endDateState && (
          <Text fontSize="sm" color="gray.500" mt={2}>
            資料範圍：{startDate.toLocaleDateString()} ~ {endDateState.toLocaleDateString()}
          </Text>
        )}
      </Box>

      <Box p={6} bg={bgCard} rounded="md" boxShadow="md">
        <TimeRangeSelector
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          customStart={customStart}
          setCustomStart={setCustomStart}
          customEnd={customEnd}
          setCustomEnd={setCustomEnd}
          btnActive={btnActive}
          btnInactive={btnInactive}
        />
        <CategoryCharts data={data} />
      </Box>

      <CompletionRateChart completedCount={completedCount} totalCount={filteredTodos.length} />
      <LineChartTrend data={lineData} timeRange={timeRange} />
 
      
      <CompletedTodoList
        completedTodos={completedTodos || []}
        visibleCount={visibleCount}
        onScroll={handleScroll}
      />

    </VStack>
  );
}
