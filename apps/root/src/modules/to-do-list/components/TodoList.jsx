import {
  Badge,
  Box,
  Center,
  Checkbox,
  Divider,
  Flex,
  HStack,
  IconButton,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiEdit2, FiTrash2, FiClock, FiCalendar, FiEye } from 'react-icons/fi';

const TAG_SCHEME = { 工作: 'red', 學習: 'teal', 個人: 'blue', 其他: 'gray' };

function DeadlineBadge({ deadline }) {
  if (!deadline) return null;
  const d    = new Date(deadline);
  const diff = Math.ceil((d - new Date()) / 86400000);
  const color = diff < 0 ? 'red' : diff <= 2 ? 'orange' : diff <= 5 ? 'yellow' : 'gray';
  const label =
    diff < 0  ? `逾期 ${-diff} 天` :
    diff === 0 ? '今天到期' :
    `${diff} 天後到期`;
  return (
    <Badge colorScheme={color} borderRadius="md" fontSize="xs" px={2}>
      {label}
    </Badge>
  );
}

export default function TodoList({ todos, onToggle, onDelete, onEdit, onView, filter, setFilter, tags }) {
  const cardBg     = useColorModeValue('white',    'gray.800');
  const cardBorder = useColorModeValue('gray.100', 'gray.700');
  const metaColor  = useColorModeValue('gray.400', 'gray.500');
  const emptyColor = useColorModeValue('gray.400', 'gray.500');

  const handleBoxClick = (e, todo) => {
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('label') || e.target.closest('svg'))
      return;
    onView(todo);
  };

  if (todos.length === 0) {
    return (
      <Center py={14}>
        <VStack spacing={3}>
          <Text fontSize="5xl">📋</Text>
          <Text color={emptyColor} fontSize="md">沒有待辦事項</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <VStack spacing={3} align="stretch">
      {todos.map((todo) => {
        const tagColor = TAG_SCHEME[todo.tag] || 'gray';
        return (
          <Box
            key={todo.id}
            bg={cardBg}
            border="1px solid"
            borderColor={cardBorder}
            borderLeft="4px solid"
            borderLeftColor={todo.complete ? 'gray.300' : `${tagColor}.400`}
            borderRadius="xl"
            p={4}
            opacity={todo.complete ? 0.6 : 1}
            cursor="pointer"
            onClick={(e) => handleBoxClick(e, todo)}
            _hover={{ shadow: 'md', borderLeftColor: todo.complete ? 'gray.400' : `${tagColor}.500` }}
            transition="all 0.15s"
          >
            <Flex align="flex-start" gap={3}>
              {/* Checkbox */}
              <Checkbox
                isChecked={todo.complete}
                onChange={() => onToggle(todo.id)}
                onClick={(e) => e.stopPropagation()}
                mt={0.5}
                colorScheme="blue"
                size="lg"
                flexShrink={0}
              />

              {/* Content */}
              <Box flex={1} minW={0}>
                <Flex align="center" justify="space-between" gap={2} flexWrap="wrap">
                  <Text
                    fontWeight={700}
                    fontSize="md"
                    noOfLines={1}
                    textDecoration={todo.complete ? 'line-through' : 'none'}
                    color={todo.complete ? metaColor : undefined}
                  >
                    {todo.title}
                  </Text>
                  <HStack spacing={1} flexShrink={0}>
                    <DeadlineBadge deadline={todo.deadline} />
                    <Badge colorScheme={tagColor} borderRadius="md" fontSize="xs">
                      {todo.tag}
                    </Badge>
                  </HStack>
                </Flex>

                {todo.content && (
                  <Text fontSize="sm" color={metaColor} noOfLines={2} mt={1} lineHeight="tall">
                    {todo.content}
                  </Text>
                )}

                <Divider my={2} />

                <Flex align="center" justify="space-between">
                  <HStack spacing={4} fontSize="xs" color={metaColor}>
                    <HStack spacing={1}>
                      <FiCalendar size="11px" />
                      <Text>{new Date(todo.created_at).toLocaleDateString('zh-TW')}</Text>
                    </HStack>
                    {todo.deadline && (
                      <HStack spacing={1}>
                        <FiClock size="11px" />
                        <Text>{new Date(todo.deadline).toLocaleDateString('zh-TW')}</Text>
                      </HStack>
                    )}
                  </HStack>

                  <HStack spacing={0}>
                    <Tooltip label="詳情" placement="top" hasArrow openDelay={400}>
                      <IconButton
                        icon={<FiEye size="14px" />}
                        size="sm"
                        variant="ghost"
                        colorScheme="gray"
                        onClick={(e) => { e.stopPropagation(); onView(todo); }}
                        aria-label="詳情"
                      />
                    </Tooltip>
                    <Tooltip label="編輯" placement="top" hasArrow openDelay={400}>
                      <IconButton
                        icon={<FiEdit2 size="14px" />}
                        size="sm"
                        variant="ghost"
                        colorScheme="blue"
                        onClick={(e) => { e.stopPropagation(); onEdit(todo); }}
                        aria-label="編輯"
                      />
                    </Tooltip>
                    <Tooltip label="刪除" placement="top" hasArrow openDelay={400}>
                      <IconButton
                        icon={<FiTrash2 size="14px" />}
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={(e) => { e.stopPropagation(); onDelete(todo.id); }}
                        aria-label="刪除"
                      />
                    </Tooltip>
                  </HStack>
                </Flex>
              </Box>
            </Flex>
          </Box>
        );
      })}
    </VStack>
  );
}
