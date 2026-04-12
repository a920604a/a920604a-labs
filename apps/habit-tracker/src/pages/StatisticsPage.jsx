import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Container,
  Heading,
  Text,
  Select,
  VStack,
  HStack,
  Box,
  useToast
} from '@chakra-ui/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useAuth } from '../contexts/AuthContext';  // 剛才建立的 Context
import { getHabits } from '../utils/firebaseDb';
import HabitBarChart from '../components/Statistics/HabitBarChart';
import PopularHabitsChart from '../components/Statistics/PopularHabitsChart';
import TrendLineChart from '../components/Statistics/TrendLineChart';
import HeatmapChart from '../components/Statistics/HeatmapChart';
import { exportHabitsToCSV, exportHabitsToPDF } from '../utils/exportUtils';
import TopBar from "../components/TopBar";

export default function StatisticsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('heatmap');
  const [dateRange, setDateRange] = useState('30');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const toast = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/login');  // 如果沒登入，強制跳登入頁
      return;
    }
    async function fetchHabits() {
      try {
        const data = await getHabits(user.uid);
        setHabits(data);
      } catch (error) {
        console.error('抓取習慣資料失敗', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHabits();
  }, [user, navigate]);

  const now = new Date();
  const filteredHabits = habits.map(h => {
    const records = h.records || [];
    const filteredRecords = records.filter(dateStr => {
      const d = new Date(dateStr);
      if (startDate && endDate) return d >= startDate && d <= endDate;
      if (dateRange === 'all') return true;
      const diffDays = (now - d) / (1000 * 60 * 60 * 24);
      return diffDays <= parseInt(dateRange, 10);
    });
    return { ...h, records: filteredRecords };
  });

  const getDisplayRangeLabel = () => {
    if (startDate && endDate) {
      return `自訂範圍：${startDate.toLocaleDateString()} ～ ${endDate.toLocaleDateString()}`;
    }
    if (dateRange === 'all') return '目前顯示：全部資料';
    return `目前顯示：最近 ${dateRange} 天統計`;
  };

  const rangeText = getDisplayRangeLabel();

  const exportCSV = () => {
    exportHabitsToCSV(filteredHabits, rangeText);
    toast({ title: 'CSV 匯出成功', status: 'success', duration: 2000 });
  };

  const exportPDF = async () => {
    try {
      await exportHabitsToPDF(filteredHabits, rangeText, user.displayName || 'Anonymous');
      toast({ title: 'PDF 匯出成功', status: 'success', duration: 2000 });
    } catch (error) {
      toast({ title: 'PDF 匯出失敗', status: 'error', duration: 3000 });
      console.error(error);
    }
  };

  if (loading) {
    return (
      <Container maxW="container.md" py={8}>
        <Text>載入中...</Text>
      </Container>
    );
  }

  if (habits.length === 0) {
    return (
      <Container maxW="container.md" py={8}>
        <Text>尚無習慣資料，請先新增並打卡。</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" py={8}>
      <TopBar 
        backButtonText="返回儀表板" 
        onBackClick={() => navigate('/dashboard')} 
      />

      <Heading mb={2}>習慣打卡統計</Heading>
      <Text mb={4} fontWeight="bold">{rangeText}</Text>

      <VStack align="stretch" spacing={4}>
        <Select value={chartType} onChange={e => setChartType(e.target.value)}>
          <option value="bar">打卡次數長條圖</option>
          <option value="popular">熱門習慣統計</option>
          <option value="trend">累積打卡趨勢圖</option>
          <option value="heatmap">打卡熱力圖</option>
        </Select>

        <HStack>
          <Select value={dateRange} onChange={e => setDateRange(e.target.value)}>
            <option value="7">最近 7 天</option>
            <option value="30">最近 30 天</option>
            <option value="90">最近 90 天</option>
            <option value="all">全部資料</option>
          </Select>
          <Box>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              placeholderText="起始日期"
              dateFormat="yyyy-MM-dd"
              isClearable
            />
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              placeholderText="結束日期"
              dateFormat="yyyy-MM-dd"
              isClearable
            />
          </Box>
        </HStack>

        <HStack spacing={4}>
          <Button colorScheme="green" onClick={exportCSV}>匯出 CSV</Button>
          <Button colorScheme="purple" onClick={exportPDF}>匯出 PDF</Button>
        </HStack>
      </VStack>

      <div style={{ marginTop: '1rem' }}>
        {chartType === 'bar' && <HabitBarChart habits={filteredHabits} />}
        {chartType === 'popular' && <PopularHabitsChart habits={filteredHabits} />}
        {chartType === 'trend' && <TrendLineChart habits={filteredHabits} />}
        {chartType === 'heatmap' && <HeatmapChart habits={filteredHabits} />}
      </div>
    </Container>
  );
}
