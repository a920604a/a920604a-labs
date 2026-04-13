import {
  Box,
  Button,
  Flex,
  HStack,
  Input,
  Text,
  Tooltip,
  useColorModeValue,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E',
  '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899',
];

export default function HabitForm({ newHabit, setNewHabit, selectedColor, setSelectedColor, onAdd, loading }) {
  const cardBg  = useColorModeValue('white',    'gray.800');
  const border  = useColorModeValue('gray.100', 'gray.700');
  const labelCl = useColorModeValue('gray.500', 'gray.400');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && newHabit.trim()) onAdd();
  };

  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={border}
      borderRadius="xl"
      p={5}
      shadow="sm"
    >
      <Text
        fontSize="xs"
        fontWeight={700}
        textTransform="uppercase"
        letterSpacing="wider"
        color={labelCl}
        mb={4}
      >
        ➕ 新增習慣
      </Text>

      {/* Color presets */}
      <Wrap spacing={2} mb={4}>
        {PRESET_COLORS.map((c) => (
          <WrapItem key={c}>
            <Tooltip label={c} placement="top" hasArrow openDelay={400}>
              <Box
                as="button"
                w="24px"
                h="24px"
                borderRadius="full"
                bg={c}
                border="2px solid"
                borderColor={selectedColor === c ? 'gray.800' : 'transparent'}
                _dark={{ borderColor: selectedColor === c ? 'white' : 'transparent' }}
                onClick={() => setSelectedColor(c)}
                transition="transform 0.1s"
                _hover={{ transform: 'scale(1.2)' }}
                aria-label={`選擇顏色 ${c}`}
              />
            </Tooltip>
          </WrapItem>
        ))}
        {/* Custom color picker */}
        <WrapItem>
          <Tooltip label="自訂顏色" placement="top" hasArrow openDelay={400}>
            <Box
              as="input"
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              w="24px"
              h="24px"
              borderRadius="full"
              border="none"
              cursor="pointer"
              p={0}
              aria-label="自訂顏色"
            />
          </Tooltip>
        </WrapItem>
      </Wrap>

      {/* Input row */}
      <HStack spacing={3}>
        <Box
          w="10px"
          h="10px"
          borderRadius="full"
          bg={selectedColor}
          flexShrink={0}
        />
        <Input
          placeholder="輸入習慣名稱（按 Enter 新增）"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyDown={handleKeyDown}
          borderRadius="lg"
          focusBorderColor="green.400"
          isDisabled={loading}
          flex={1}
        />
        <Button
          leftIcon={<AddIcon boxSize="10px" />}
          colorScheme="green"
          borderRadius="lg"
          onClick={onAdd}
          isLoading={loading}
          isDisabled={!newHabit.trim()}
          flexShrink={0}
        >
          新增
        </Button>
      </HStack>
    </Box>
  );
}
