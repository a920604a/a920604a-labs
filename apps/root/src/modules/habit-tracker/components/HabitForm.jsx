// components/HabitForm.jsx
import React from 'react';
import { Flex, Input, Button, FormControl, FormLabel } from '@chakra-ui/react';

const HabitForm = ({ newHabit, setNewHabit, selectedColor, setSelectedColor, onAdd, loading }) => (
  <Flex mb={6} gap={3} align="center" flexWrap="wrap">
    <Input
      placeholder="新增習慣名稱"
      value={newHabit}
      onChange={(e) => setNewHabit(e.target.value)}
      flex="1"
      isDisabled={loading}
    />
    <FormControl w="auto">
      <FormLabel fontSize="sm" mb={1}>顏色</FormLabel>
      <Input
        type="color"
        value={selectedColor}
        onChange={(e) => setSelectedColor(e.target.value)}
        width="48px"
        height="38px"
        padding="0"
        border="none"
        bg="none"
        cursor="pointer"
        isDisabled={loading}
      />
    </FormControl>
    <Button colorScheme="green" onClick={onAdd} isLoading={loading}>
      新增習慣
    </Button>
  </Flex>
);

export default HabitForm;
