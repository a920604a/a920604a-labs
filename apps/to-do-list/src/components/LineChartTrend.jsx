import React from 'react';
import {
  Box,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function LineChartTrend({ data, timeRange }) {
  return (
    <Box
      p={4}
      bg={useColorModeValue('gray.50', 'gray.700')}
      rounded="md"
      boxShadow="md"
      maxW="100%"
      overflowX="auto"
    >
      <Text
        fontSize="xl"
        fontWeight="bold"
        mb={2}
        textAlign="center"
      >
        新增任務趨勢 ({timeRange})
      </Text>

      <Box width="100%" height="250px">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#d69e2e"
              strokeWidth={3}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
