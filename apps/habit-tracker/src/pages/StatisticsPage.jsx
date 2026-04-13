import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Center, Container, Flex, Heading,
  HStack, Select, Spinner, Text, useColorModeValue, useToast, VStack,
} from '@chakra-ui/react';
import { DownloadIcon } from '@chakra-ui/icons';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { useAuth } from '@a920604a/auth';
import { getHabits } from '../utils/firebaseDb';
import HabitBarChart     from '../components/Statistics/HabitBarChart';
import PopularHabitsChart from '../components/Statistics/PopularHabitsChart';
import TrendLineChart    from '../components/Statistics/TrendLineChart';
import HeatmapChart      from '../components/Statistics/HeatmapChart';
import { exportHabitsToCSV, exportHabitsToPDF } from '../utils/exportUtils';

const CHART_VIEWS = [
  { key: 'heatmap',  label: '熱力圖' },
  { key: 'bar',      label: '打卡次數' },
  { key: 'popular',  label: '熱門習慣' },
  { key: 'trend',    label: '趨勢圖' },
];

export default function StatisticsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast    = useToast();

  const [habits,     setHabits]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [chartType,  setChartType]  = useState('heatmap');
  const [dateRange,  setDateRange]  = useState('30');
  const [startDate,  setStartDate]  = useState(null);
  const [endDate,    setEndDate]    = useState(null);

  const cardBg  = useColorModeValue('white',    'gray.800');
  const border  = useColorModeValue('gray.100', 'gray.700');
  const labelCl = useColorModeValue('gray.500', 'gray.400');
  const activeBg = useColorModeValue('green.500', 'green.400');

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    getHabits(user.uid)
      .then(setHabits)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const now = new Date();
  const filteredHabits = habits.map(h => ({
    ...h,
    records: (h.records || []).filter(dateStr => {
      const d = new Date(dateStr);
      if (startDate && endDate) return d >= startDate && d <= endDate;
      if (dateRange === 'all')  return true;
      return (now - d) / 86400000 <= parseInt(dateRange, 10);
    }),
  }));

  const rangeText = startDate && endDate
    ? `${startDate.toLocaleDateString()} ～ ${endDate.toLocaleDateString()}`
    : dateRange === 'all' ? '全部資料' : `最近 ${dateRange} 天`;

  const exportCSV = () => {
    exportHabitsToCSV(filteredHabits, rangeText);
    toast({ title: 'CSV 匯出成功', status: 'success', duration: 2000 });
  };
  const exportPDF = async () => {
    try {
      await exportHabitsToPDF(filteredHabits, rangeText, user.displayName || 'Anonymous');
      toast({ title: 'PDF 匯出成功', status: 'success', duration: 2000 });
    } catch {
      toast({ title: 'PDF 匯出失敗', status: 'error', duration: 3000 });
    }
  };

  if (loading) return <Center minH="60vh"><Spinner size="xl" color="green.400" thickness="4px" /></Center>;

  return (
    <Container maxW="2xl" py={8} px={{ base: 4, md: 8 }}>
      <VStack spacing={5} align="stretch">

        {/* ── Header ──────────────────────────────────────────── */}
        <Box>
          <Heading size="xl" fontWeight={800} color={useColorModeValue('green.500', 'green.300')}>
            📊 習慣統計
          </Heading>
          <Text color={labelCl} mt={1} fontSize="sm">{rangeText}</Text>
        </Box>

        {/* ── Controls card ───────────────────────────────────── */}
        <Box bg={cardBg} border="1px solid" borderColor={border} borderRadius="xl" p={5} shadow="sm">
          {/* Chart type segmented control */}
          <HStack spacing={0} border="1px solid" borderColor={border} borderRadius="xl"
            overflow="hidden" display="inline-flex" mb={4}>
            {CHART_VIEWS.map(({ key, label }) => {
              const active = chartType === key;
              return (
                <Button
                  key={key}
                  onClick={() => setChartType(key)}
                  bg={active ? activeBg : cardBg}
                  color={active ? 'white' : labelCl}
                  borderRadius={0}
                  borderRight="1px solid"
                  borderColor={border}
                  _last={{ borderRight: 'none' }}
                  _hover={{ bg: active ? activeBg : useColorModeValue('gray.50', 'gray.700') }}
                  px={4} h="36px" fontSize="sm" fontWeight={active ? 600 : 400}
                  transition="all 0.15s"
                >
                  {label}
                </Button>
              );
            })}
          </HStack>

          {/* Date range */}
          <Flex gap={3} flexWrap="wrap" align="center">
            <Select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              maxW="160px"
              borderRadius="lg"
              focusBorderColor="green.400"
              size="sm"
            >
              <option value="7">最近 7 天</option>
              <option value="30">最近 30 天</option>
              <option value="90">最近 90 天</option>
              <option value="all">全部資料</option>
            </Select>
            <HStack spacing={2}>
              <DatePicker selected={startDate} onChange={setStartDate} placeholderText="起始日期" dateFormat="yyyy-MM-dd" isClearable />
              <Text color={labelCl} fontSize="sm">～</Text>
              <DatePicker selected={endDate}   onChange={setEndDate}   placeholderText="結束日期" dateFormat="yyyy-MM-dd" isClearable />
            </HStack>
          </Flex>
        </Box>

        {/* ── Chart ───────────────────────────────────────────── */}
        {habits.length === 0 ? (
          <Center py={10}>
            <VStack spacing={2}>
              <Text fontSize="4xl">📭</Text>
              <Text color={labelCl}>尚無習慣資料，請先新增並打卡</Text>
            </VStack>
          </Center>
        ) : (
          <Box bg={cardBg} border="1px solid" borderColor={border} borderRadius="xl" p={5} shadow="sm">
            {chartType === 'bar'     && <HabitBarChart      habits={filteredHabits} />}
            {chartType === 'popular' && <PopularHabitsChart habits={filteredHabits} />}
            {chartType === 'trend'   && <TrendLineChart     habits={filteredHabits} />}
            {chartType === 'heatmap' && <HeatmapChart       habits={filteredHabits} />}
          </Box>
        )}

        {/* ── Export ──────────────────────────────────────────── */}
        <HStack spacing={3} justify="flex-end">
          <Button leftIcon={<DownloadIcon />} colorScheme="teal"   variant="outline" borderRadius="lg" onClick={exportCSV} size="sm">
            匯出 CSV
          </Button>
          <Button leftIcon={<DownloadIcon />} colorScheme="purple" variant="solid"   borderRadius="lg" onClick={exportPDF} size="sm">
            匯出 PDF
          </Button>
        </HStack>

      </VStack>
    </Container>
  );
}
