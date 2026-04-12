// components/DailyCheckinList.jsx
import React from 'react';
import { Box, Button, Flex, Text, Heading } from '@chakra-ui/react';

const DailyCheckinList = ({ habits, dateStr, onRemoveCheckIn, loading }) => {
  return (
    <Box my={6}>
      <Heading size="md" mb={3}>
        {dateStr} 打卡狀況
      </Heading>
      {habits.length === 0 && <Text>該日期沒有習慣資料</Text>}
      {habits.map((habit) => {
        const checkedIn = habit.records.includes(dateStr);
        return (
          <Flex
            key={habit.id}
            justify="space-between"
            align="center"
            bg="gray.50"
            p={3}
            borderRadius="md"
            mb={2}
            boxShadow="sm"
          >
            <Text>{habit.name}</Text>
            {checkedIn ? (
              <Button
                size="sm"
                colorScheme="red"
                onClick={() => onRemoveCheckIn(habit.id, dateStr)}
                isLoading={loading}
              >
                移除打卡
              </Button>
            ) : (
              <Text color="gray.400" fontSize="sm">未打卡</Text>
            )}
          </Flex>
        );
      })}
    </Box>
  );
};

export default DailyCheckinList;
