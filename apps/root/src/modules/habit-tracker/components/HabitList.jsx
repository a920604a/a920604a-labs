import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter,
  AlertDialogHeader, AlertDialogOverlay,
  Badge, Box, Button, Center, Flex, HStack, IconButton,
  Text, Tooltip, VStack, useColorModeValue,
} from '@chakra-ui/react';
import { FiCalendar, FiTrash2, FiCheckCircle, FiCircle } from 'react-icons/fi';
import { deleteHabit } from '../utils/firebaseDb';

/** Count consecutive days up to and including today */
function calcStreak(records = []) {
  if (!records.length) return 0;
  const fmt = (d) => {
    const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  let streak = 0;
  const cur = new Date();
  while (true) {
    if (records.includes(fmt(cur))) { streak++; cur.setDate(cur.getDate() - 1); }
    else break;
  }
  return streak;
}

export default function HabitList({ habits, selectedHabitId, setSelectedHabitId, selectedDate, isCheckedIn, onCheckIn, loading, onHabitDeleted }) {
  const [dialogOpen,    setDialogOpen]    = useState(false);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const cancelRef = useRef();
  const navigate  = useNavigate();

  const cardBg    = useColorModeValue('white',    'gray.800');
  const border    = useColorModeValue('gray.100', 'gray.700');
  const labelCl   = useColorModeValue('gray.500', 'gray.400');
  const emptyClr  = useColorModeValue('gray.400', 'gray.500');

  const openDialog = (habit) => { setHabitToDelete(habit); setDialogOpen(true); };
  const confirmDelete = async () => {
    if (habitToDelete) {
      await deleteHabit(habitToDelete.id);
      onHabitDeleted(habitToDelete.id);
      setDialogOpen(false);
      setHabitToDelete(null);
    }
  };

  const getCheckInLabel = (habit) => {
    if (isCheckedIn(habit)) return '✓ 已打卡';
    const today    = new Date(); today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate); selected.setHours(0, 0, 0, 0);
    if (selected > today) return '未來日期';
    if (selected.getTime() === today.getTime()) return '打卡';
    return '補打卡';
  };

  if (habits.length === 0) {
    return (
      <Center py={10}>
        <VStack spacing={2}>
          <Text fontSize="4xl">🌱</Text>
          <Text color={emptyClr} fontSize="sm">還沒有習慣，在上方新增第一個吧！</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <>
      <Box>
        <Text fontSize="xs" fontWeight={700} textTransform="uppercase" letterSpacing="wider" color={labelCl} mb={3}>
          我的習慣（{habits.length}）
        </Text>
        <VStack spacing={3} align="stretch">
          {habits.map((habit) => {
            const checked = isCheckedIn(habit);
            const streak  = calcStreak(habit.records || []);
            const label   = getCheckInLabel(habit);
            const isFuture = (() => {
              const today = new Date(); today.setHours(0, 0, 0, 0);
              const sel   = new Date(selectedDate); sel.setHours(0, 0, 0, 0);
              return sel > today;
            })();

            return (
              <Box
                key={habit.id}
                bg={cardBg}
                border="1px solid"
                borderColor={border}
                borderLeft="4px solid"
                borderLeftColor={habit.color || 'green.400'}
                borderRadius="xl"
                p={4}
                shadow="sm"
                _hover={{ shadow: 'md' }}
                transition="shadow 0.15s"
              >
                <Flex align="center" justify="space-between" gap={3} flexWrap="wrap">
                  {/* Left: name + streak */}
                  <Box flex={1} minW={0}>
                    <HStack spacing={2} mb={1}>
                      <Box w="10px" h="10px" borderRadius="full" bg={habit.color || 'green.400'} flexShrink={0} />
                      <Text fontWeight={700} fontSize="md" noOfLines={1}>{habit.name}</Text>
                    </HStack>
                    <HStack spacing={3}>
                      {streak > 0 && (
                        <Badge colorScheme="orange" borderRadius="md" fontSize="xs">
                          🔥 {streak} 天連續
                        </Badge>
                      )}
                      <Text fontSize="xs" color={labelCl}>
                        共打卡 {(habit.records || []).length} 次
                      </Text>
                    </HStack>
                  </Box>

                  {/* Right: check-in + actions */}
                  <HStack spacing={2} flexShrink={0}>
                    <Button
                      size="sm"
                      borderRadius="lg"
                      colorScheme={checked ? 'green' : 'gray'}
                      variant={checked ? 'solid' : 'outline'}
                      leftIcon={checked ? <FiCheckCircle /> : <FiCircle />}
                      onClick={() => onCheckIn(habit.id)}
                      isDisabled={loading || checked || isFuture}
                      minW="80px"
                    >
                      {label}
                    </Button>

                    <Tooltip label="查看日曆" placement="top" hasArrow openDelay={400}>
                      <IconButton
                        icon={<FiCalendar />}
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => navigate(`/habit-tracker/calendar/${habit.id}`)}
                        aria-label="查看日曆"
                      />
                    </Tooltip>

                    <Tooltip label="刪除習慣" placement="top" hasArrow openDelay={400}>
                      <IconButton
                        icon={<FiTrash2 />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => openDialog(habit)}
                        aria-label="刪除習慣"
                      />
                    </Tooltip>
                  </HStack>
                </Flex>
              </Box>
            );
          })}
        </VStack>
      </Box>

      <AlertDialog isOpen={dialogOpen} leastDestructiveRef={cancelRef} onClose={() => setDialogOpen(false)} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="2xl">
            <AlertDialogHeader fontSize="lg" fontWeight={700}>確認刪除習慣</AlertDialogHeader>
            <AlertDialogBody>
              確定要刪除「<strong>{habitToDelete?.name}</strong>」嗎？所有打卡紀錄將一併刪除，無法復原。
            </AlertDialogBody>
            <AlertDialogFooter gap={3}>
              <Button ref={cancelRef} onClick={() => setDialogOpen(false)} borderRadius="lg">取消</Button>
              <Button colorScheme="red" onClick={confirmDelete} borderRadius="lg">確定刪除</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
