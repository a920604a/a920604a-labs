// components/HabitCheckinList.jsx
import React from 'react';
import { Box, List, ListItem, Text } from '@chakra-ui/react';

const HabitCheckinList = ({ habits, formatted }) => {
  // const formatted = date.toISOString().slice(0, 10);

  const checkedHabits = habits.filter((habit) =>
    habit.records.includes(formatted)
  );

  if (checkedHabits.length === 0) {
    return <Text>該日尚無打卡紀錄。</Text>;
  }

  return (
    <Box mt={4}>
      <Text fontWeight="bold" mb={2}>
        {formatted} 已打卡習慣：
      </Text>
      <List spacing={1}>
        {checkedHabits.map((habit) => (
          <ListItem key={habit.id}>✅ {habit.name}</ListItem>
        ))}
      </List>
    </Box>
  );
};

export default HabitCheckinList;
