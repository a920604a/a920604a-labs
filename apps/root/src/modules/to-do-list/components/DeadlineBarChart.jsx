// components/DeadlineBarChart.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';

export default function DeadlineBarChart({ data }) {
  const bg = useColorModeValue('gray.50', 'gray.700');

  return (
    <Box p={6} bg={bg} rounded="md" boxShadow="md">
      <Text fontSize="lg" fontWeight="bold" mb={4}>📅 截止日任務數分布</Text>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#3182ce" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
