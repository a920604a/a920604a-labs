import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Box, Text, useColorModeValue, useBreakpointValue } from '@chakra-ui/react';

const COLORS = ['#38A169', '#E53E3E']; // 綠色: 已完成, 紅色: 未完成

export default function CompletionRateChart({ completedCount, totalCount }) {
  const bg = useColorModeValue('gray.50', 'gray.700');

  // 根據斷點調整 radius
  const outerRadius = useBreakpointValue({ base: 60, sm: 80, md: 100 });

  const data = [
    { name: '已完成', value: completedCount },
    { name: '未完成', value: totalCount - completedCount },
  ];

  return (
    <Box p={6} bg={bg} rounded="md" boxShadow="md" maxW="400px" w="100%" mx="auto">
      <Text fontSize="lg" fontWeight="bold" mb={4} textAlign="center">
        ✅ 完成率圖表
      </Text>
      <ResponsiveContainer width="100%" height={outerRadius * 2 + 50}>
        <PieChart>
          <Pie
            dataKey="value"
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={outerRadius}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
}
