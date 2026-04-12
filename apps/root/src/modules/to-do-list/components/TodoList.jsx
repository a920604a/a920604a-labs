import React from 'react';
import {
  Box,
  Checkbox,
  HStack,
  Tag,
  TagLabel,
  Text,
  VStack,
  Select,
  IconButton,
  Tooltip,
  Icon,
} from '@chakra-ui/react';
import {
  FiEdit2,
  FiTrash2,
  FiClock,
  FiCalendar,
} from 'react-icons/fi';

const tagColorMap = {
  工作: 'red',
  學習: 'green',
  個人: 'blue',
  其他: 'gray',
};

export default function TodoList({
  todos,
  onToggle,
  onDelete,
  onEdit,
  onView,
  filter,
  setFilter,
  tags,
}) {
  const filteredTodos = todos
    .filter((todo) => filter === '全部' || todo.tag === filter)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const handleBoxClick = (e, todo) => {
    const target = e.target;
    if (
      target.closest('button') ||
      target.closest('input[type="checkbox"]') ||
      target.closest('label') ||
      target.closest('svg')
    ) {
      return;
    }
    onView(todo);
  };

  return (
    <VStack spacing={3} align="stretch">
      <Select value={filter} onChange={(e) => setFilter(e.target.value)} mb={3}>
        <option value="全部">全部</option>
        {tags.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </Select>

      {filteredTodos.map((todo) => (
        <Box
          key={todo.id}
          p={4}
          borderWidth={1}
          borderRadius="md"
          boxShadow="md"
          bg={todo.complete ? 'gray.100' : 'white'}
          _hover={{ bg: 'gray.50' }}
          cursor="pointer"
          onClick={(e) => handleBoxClick(e, todo)}
        >
          <HStack justify="space-between" mb={2}>
            <Text fontWeight="bold" fontSize="lg" noOfLines={1}>
              {todo.title}
            </Text>
            <HStack spacing={1}>
              <Checkbox
                isChecked={todo.complete}
                onClick={(e) => e.stopPropagation()}
                onChange={() => onToggle(todo.id)}
              />
              <Tooltip label="編輯">
                <IconButton
                  icon={<FiEdit2 />}
                  size="sm"
                  variant="ghost"
                  colorScheme="teal"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(todo);
                  }}
                  aria-label="編輯"
                />
              </Tooltip>
              <Tooltip label="刪除">
                <IconButton
                  icon={<FiTrash2 />}
                  size="sm"
                  variant="ghost"
                  colorScheme="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(todo.id);
                  }}
                  aria-label="刪除"
                />
              </Tooltip>
            </HStack>
          </HStack>

          <Text mb={2} whiteSpace="pre-wrap" color="gray.700" isTruncated>
            {todo.content || '（無內容）'}
          </Text>

          <HStack fontSize="sm" color="gray.500" spacing={4} mb={1}>
            <HStack spacing={1}>
              <Icon as={FiCalendar} />
              <Text>{new Date(todo.created_at).toLocaleString()}</Text>
            </HStack>
            <HStack spacing={1}>
              <Icon as={FiClock} />
              <Text>{todo.deadline ? new Date(todo.deadline).toLocaleDateString() : '無'}</Text>
            </HStack>
          </HStack>

          <Text fontSize="xs" color="gray.400" mb={1}>
            最後更新：{new Date(todo.updated_at).toLocaleString()}
          </Text>

          <Tag colorScheme={tagColorMap[todo.tag] || 'gray'}>
            <TagLabel>{todo.tag}</TagLabel>
          </Tag>
        </Box>
      ))}
    </VStack>
  );
}
