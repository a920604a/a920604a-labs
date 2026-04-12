import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { deleteHabit } from '../utils/firebaseDb';

const formatDateLocal = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

function HabitList({
  habits,
  selectedHabitId,
  setSelectedHabitId,
  selectedDate,
  isCheckedIn,
  onCheckIn,
  loading,
  onHabitDeleted,
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const cancelRef = useRef();
  const [habitToDelete, setHabitToDelete] = useState(null);
  const navigate = useNavigate();


  const openDeleteDialog = (habit) => {
    setHabitToDelete(habit);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (habitToDelete) {
      await deleteHabit(habitToDelete.id);
      onHabitDeleted(habitToDelete.id);
      setIsDialogOpen(false);
      setHabitToDelete(null);
    }
  };

  return (
    <Box>
      <Text fontSize="xl" mb={2}>選擇習慣：</Text>
      <VStack spacing={3} align="stretch">
        {habits.map((habit) => (
          <Box
            key={habit.id}
            p={3}
            borderWidth="1px"
            borderRadius="md"
            bg={habit.id === selectedHabitId ? 'blue.100' : 'gray.50'}
          >
            <HStack justify="space-between">
              <Text>{habit.name}</Text>
              <Button
                colorScheme="green"
                size="sm"
                onClick={() => onCheckIn(habit.id)}
                isDisabled={loading || isCheckedIn(habit)}
              >
                {isCheckedIn(habit)
                  ? '已打卡'
                  : (() => {
                      const today = new Date();
                      const selected = new Date(selectedDate);
                      today.setHours(0, 0, 0, 0);
                      selected.setHours(0, 0, 0, 0);
                      if (selected.getTime() > today.getTime()) return '無法打卡';
                      if (selected.getTime() === today.getTime()) return '打卡';
                      return '補打卡';
                    })()}
              </Button>
            </HStack>
            <HStack mt={2} spacing={2}>
              <Button
                size="xs"
                // onClick={() => setSelectedHabitId(habit.id)}
                onClick={() => navigate(`/calendar/${habit.id}`)}

                colorScheme="blue"
                variant="outline"
              >
                查看日曆
              </Button>
              <Button
                size="xs"
                colorScheme="red"
                variant="ghost"
                onClick={() => openDeleteDialog(habit)}
              >
                刪除
              </Button>
            </HStack>
          </Box>
        ))}
      </VStack>

      {/* 刪除確認彈跳視窗 */}
      <AlertDialog
        isOpen={isDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              確認刪除習慣
            </AlertDialogHeader>

            <AlertDialogBody>
              你確定要刪除「{habitToDelete?.name}」這個習慣嗎？此操作無法復原。
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDialogOpen(false)}>
                取消
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                確定刪除
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

export default HabitList;
