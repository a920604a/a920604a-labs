import React from 'react';
import {
  Box,
  Text,
  List,
  ListItem,
  Badge,
  useColorModeValue,
  useBreakpointValue,
  Fade,
} from '@chakra-ui/react';

interface TodoItem {
  id: string;
  title: string;
  tag: string;
  updated_at: string | null;
}

interface CompletedTodoListProps {
  completedTodos: TodoItem[];
  visibleCount: number;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

export default function CompletedTodoList({
  completedTodos,
  visibleCount,
  onScroll,
}: CompletedTodoListProps) {
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');
  const scrollBarThumbColor = useColorModeValue('#a0aec0', '#718096');
  const bgColor = useColorModeValue('white', 'gray.800');
  const fontSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const paddingY = useBreakpointValue({ base: 2, md: 3 });

  return (
    <Box
      maxH="400px"
      maxW="600px"
      w="100%"
      overflowY="auto"
      onScroll={onScroll}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="md"
      p={4}
      bg={bgColor}
      boxShadow="sm"
      mx="auto"
      css={{
        '&::-webkit-scrollbar': { width: '8px' },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: scrollBarThumbColor,
          borderRadius: '24px',
        },
      }}
    >
      <Text
        fontSize="lg"
        fontWeight="bold"
        mb={4}
        borderBottom="1px solid"
        borderColor={borderColor}
        pb={2}
        textAlign="center"
      >
        ✅ 已完成任務列表
      </Text>

      {completedTodos.length === 0 ? (
        <Text color="gray.500" textAlign="center" mt={10}>
          無已完成任務
        </Text>
      ) : (
        <List spacing={4}>
          {completedTodos.slice(0, visibleCount).map((todo) => {
            const tag = todo.tag || '其他';
            const tagColorScheme = {
              工作: 'blue',
              生活: 'green',
              學習: 'purple',
              其他: 'gray',
            }[tag] || 'gray';

            return (
              <Fade in={true} key={todo.id}>
                <ListItem
                  borderBottom="1px solid"
                  borderColor={borderColor}
                  py={paddingY}
                  _hover={{ bg: hoverBgColor, cursor: 'pointer' }}
                  rounded="md"
                  transition="background-color 0.2s"
                  fontSize={fontSize}
                >
                  <Text fontWeight="semibold" fontSize={fontSize} mb={1}>
                    {todo.title}
                  </Text>
                  <Text fontSize="sm" color="gray.500" mb={1}>
                    完成時間:{' '}
                    {todo.updated_at
                      ? new Date(todo.updated_at).toLocaleString()
                      : '未知'}
                  </Text>
                  <Badge
                    colorScheme={tagColorScheme}
                    fontSize="0.8em"
                    px={2}
                    py={1}
                    rounded="full"
                  >
                    {tag}
                  </Badge>
                </ListItem>
              </Fade>
            );
          })}
        </List>
      )}
    </Box>
  );
}
