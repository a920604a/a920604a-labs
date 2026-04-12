import React from 'react';
import {
  Box,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#3182ce', '#2f855a', '#d69e2e', '#dd6b20'];

export default function CategoryCharts({ data }) {
  return (
    <Box
      p={4}
      bg={useColorModeValue('gray.50', 'gray.700')}
      rounded="md"
      boxShadow="md"
      textAlign="center"
      maxW="100%"  // 讓父容器寬度最大可撐滿
      overflowX="auto" // 若真的太小也允許橫向捲動
    >
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        分類任務統計
      </Text>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <Box mt={8} width="100%" height="250px">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#3182ce" />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
