import React from 'react';
import { Box, Button, Heading, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import ReminderSettings from '../components/ReminderSettings';
import HabitForm from '../components/HabitForm';
import HabitList from '../components/HabitList';
import CalendarView from '../components/CalendarView';
import DailyCheckinList from '../components/DailyCheckinList';
import AchievementBadge from '../components/AchievementBadge';
import TopBar from "../components/TopBar";


function Dashboard() {
  const navigate = useNavigate();
  const {
    loading,
    loadingUser,
    userId,
    newHabit,
    setNewHabit,
    selectedColor,
    setSelectedColor,
    addNewHabit,
    habits,
    setHabits,
    selectedHabitId,
    setSelectedHabitId,
    selectedDate,
    setSelectedDate,
    formatDateLocal,
    isFutureDate,
    checkIn,
    removeCheckIn,
    showBadge,
    setShowBadge,
    achievement,
    handleCheckIn,
    handleHabitDeleted
  } = useDashboard();

  if (loadingUser) return <Text>載入中...</Text>;
  if (!userId) return <Text>請先登入</Text>;

  return (
    <Box maxW="700px" mx="auto" p={5}>
      
      <TopBar 
        backButtonText="查看習慣統計" 
        onBackClick={() => navigate('/statistics')} 
      />

      <Heading mb={4}>我的習慣追蹤</Heading>

      <HabitForm
        newHabit={newHabit}
        setNewHabit={setNewHabit}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        onAdd={addNewHabit}
        loading={loading}
      />

      <ReminderSettings />

      <HabitList
        habits={habits}
        selectedHabitId={selectedHabitId}
        setSelectedHabitId={setSelectedHabitId}
        selectedDate={formatDateLocal(selectedDate)}
        isCheckedIn={(habit) =>
          habit.records.includes(formatDateLocal(selectedDate))
        }
        onCheckIn={handleCheckIn}
        loading={loading}
        onHabitDeleted={handleHabitDeleted}
      />

      <AchievementBadge
        isOpen={showBadge}
        onClose={() => setShowBadge(false)}
        achievement={achievement}
      />

      <CalendarView
        habits={habits}
        onDateClick={setSelectedDate}
        selectedDate={selectedDate}
      />

      <DailyCheckinList
        habits={habits}
        dateStr={formatDateLocal(selectedDate)}
        onCheckIn={checkIn}
        onRemoveCheckIn={removeCheckIn}
        loading={loading}
      />
    </Box>
  );
}

export default Dashboard;
