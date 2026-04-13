import { Box, Container, Divider, Heading, Text, useColorModeValue, VStack } from '@chakra-ui/react';
import { useDashboard } from '../hooks/useDashboard';
import ReminderSettings  from '../components/ReminderSettings';
import HabitForm         from '../components/HabitForm';
import HabitList         from '../components/HabitList';
import CalendarView      from '../components/CalendarView';
import DailyCheckinList  from '../components/DailyCheckinList';
import AchievementBadge  from '../components/AchievementBadge';

export default function Dashboard() {
  const {
    loading, loadingUser, userId,
    newHabit, setNewHabit,
    selectedColor, setSelectedColor,
    addNewHabit, habits, setHabits,
    selectedHabitId, setSelectedHabitId,
    selectedDate, setSelectedDate,
    formatDateLocal, isFutureDate,
    checkIn, removeCheckIn,
    showBadge, setShowBadge, achievement,
    handleCheckIn, handleHabitDeleted,
  } = useDashboard();

  const subText = useColorModeValue('gray.500', 'gray.400');

  if (loadingUser) return null;
  if (!userId)     return <Text p={8} color={subText}>請先登入</Text>;

  return (
    <Container maxW="2xl" py={8} px={{ base: 4, md: 8 }}>
      <VStack spacing={5} align="stretch">

        {/* ── Header ──────────────────────────────────────────── */}
        <Box>
          <Heading size="xl" fontWeight={800} color={useColorModeValue('green.500', 'green.300')}>
            ✅ 習慣追蹤
          </Heading>
          <Text color={subText} mt={1} fontSize="sm">
            堅持每天一小步，養成改變一生的好習慣
          </Text>
        </Box>

        {/* ── Add habit ───────────────────────────────────────── */}
        <HabitForm
          newHabit={newHabit}
          setNewHabit={setNewHabit}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          onAdd={addNewHabit}
          loading={loading}
        />

        {/* ── Reminder settings ───────────────────────────────── */}
        <ReminderSettings />

        {/* ── Habit list ──────────────────────────────────────── */}
        <HabitList
          habits={habits}
          selectedHabitId={selectedHabitId}
          setSelectedHabitId={setSelectedHabitId}
          selectedDate={formatDateLocal(selectedDate)}
          isCheckedIn={(h) => h.records.includes(formatDateLocal(selectedDate))}
          onCheckIn={handleCheckIn}
          loading={loading}
          onHabitDeleted={handleHabitDeleted}
        />

        {/* ── Calendar ────────────────────────────────────────── */}
        <Box>
          <Text
            fontSize="xs" fontWeight={700} textTransform="uppercase"
            letterSpacing="wider" color={subText} mb={3}
          >
            📅 打卡日曆
          </Text>
          <CalendarView
            habits={habits}
            onDateClick={setSelectedDate}
            selectedDate={selectedDate}
          />
        </Box>

        {/* ── Daily checkin list ──────────────────────────────── */}
        <DailyCheckinList
          habits={habits}
          dateStr={formatDateLocal(selectedDate)}
          onCheckIn={checkIn}
          onRemoveCheckIn={removeCheckIn}
          loading={loading}
        />

      </VStack>

      <AchievementBadge
        isOpen={showBadge}
        onClose={() => setShowBadge(false)}
        achievement={achievement}
      />
    </Container>
  );
}
