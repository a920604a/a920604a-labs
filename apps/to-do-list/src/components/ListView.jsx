import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  useToast,
  Wrap,
  WrapItem,
  Badge,
} from '@chakra-ui/react';
import { AddIcon, SearchIcon } from '@chakra-ui/icons';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

import TodoForm from './TodoForm';
import TodoList from './TodoList';
import { usePagination } from '../hooks/usePagination';
import { addTodo, updateTodo, deleteTodo, getAllTodos } from '../utils/firebaseDb';

const TAG_SCHEME = { 工作: 'red', 學習: 'teal', 個人: 'blue', 其他: 'gray', 全部: 'gray' };

export default function ListView({ initialTodos = [], tags }) {
  const [todos,       setTodos]       = useState(initialTodos);
  const [filter,      setFilter]      = useState('全部');
  const [searchTerm,  setSearchTerm]  = useState('');
  const [sortBy,      setSortBy]      = useState('deadline');
  const [asc,         setAsc]         = useState(true);
  const [loading,     setLoading]     = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [viewingTodo, setViewingTodo] = useState(null);
  const toast = useToast();

  const { isOpen: isAddOpen,  onOpen: onAddOpen,  onClose: onAddClose  } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  const cardBg  = useColorModeValue('white',    'gray.800');
  const border  = useColorModeValue('gray.100', 'gray.700');
  const metaClr = useColorModeValue('gray.500', 'gray.400');

  const parseTime = (val) => {
    if (!val) return Infinity;
    if (val.toDate) return val.toDate().getTime();
    if (typeof val === 'string') return new Date(val).getTime();
    if (typeof val === 'number') return val;
    return Infinity;
  };

  useEffect(() => {
    async function fetchTodos() {
      setLoading(true);
      try {
        setTodos(await getAllTodos());
      } catch {
        toast({ title: '讀取失敗', status: 'error', duration: 3000, isClosable: true });
      } finally {
        setLoading(false);
      }
    }
    fetchTodos();
  }, []);

  const filteredTodos = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return [...todos]
      .filter(t => !t.complete &&
        (filter === '全部' || t.tag === filter) &&
        (t.title?.toLowerCase().includes(q) || t.content?.toLowerCase().includes(q))
      )
      .sort((a, b) => {
        const at = parseTime(a[sortBy]), bt = parseTime(b[sortBy]);
        return at === bt ? a.id.localeCompare(b.id) : asc ? at - bt : bt - at;
      });
  }, [todos, searchTerm, filter, sortBy, asc]);

  const { currentData, page, maxPage, next, prev } = usePagination(filteredTodos, 5);

  const refresh = async () => { setTodos(await getAllTodos()); };

  const handleAdd = async (newTodo) => {
    setLoading(true);
    try { await addTodo(newTodo); await refresh(); toast({ title: '新增成功', status: 'success', duration: 2000, isClosable: true }); onAddClose(); }
    catch { toast({ title: '新增失敗', status: 'error', duration: 3000, isClosable: true }); }
    finally { setLoading(false); }
  };

  const handleUpdate = async (updated) => {
    setLoading(true);
    try { await updateTodo(updated); await refresh(); toast({ title: '更新成功', status: 'success', duration: 2000, isClosable: true }); setEditingTodo(null); onEditClose(); }
    catch { toast({ title: '更新失敗', status: 'error', duration: 3000, isClosable: true }); }
    finally { setLoading(false); }
  };

  const handleToggle = async (id) => {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    try { await updateTodo({ ...todo, complete: !todo.complete }); await refresh(); }
    catch { toast({ title: '更新失敗', status: 'error', duration: 2000, isClosable: true }); }
  };

  const handleDelete = async (id) => {
    try { await deleteTodo(id); await refresh(); toast({ title: '已刪除', status: 'info', duration: 2000, isClosable: true }); }
    catch { toast({ title: '刪除失敗', status: 'error', duration: 3000, isClosable: true }); }
  };

  const handleEdit = (todo) => { setEditingTodo(todo); onEditOpen(); };
  const handleView = (todo) => { setViewingTodo(todo); onViewOpen(); };

  const allTags = ['全部', ...tags];

  return (
    <>
      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <Box
        bg={cardBg}
        border="1px solid"
        borderColor={border}
        borderRadius="xl"
        p={4}
        mb={4}
        shadow="sm"
      >
        <Flex gap={3} flexWrap="wrap" align="center">
          <Button
            leftIcon={<AddIcon boxSize="10px" />}
            colorScheme="blue"
            borderRadius="lg"
            onClick={onAddOpen}
            isLoading={loading}
            flexShrink={0}
          >
            新增待辦
          </Button>

          <InputGroup flex={1} minW="180px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="搜尋標題或內容…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              borderRadius="lg"
              focusBorderColor="blue.400"
            />
          </InputGroup>

          <HStack spacing={2} flexShrink={0}>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              maxW="140px"
              borderRadius="lg"
              size="md"
              focusBorderColor="blue.400"
            >
              <option value="deadline">截止日期</option>
              <option value="created_at">建立時間</option>
              <option value="updated_at">更新時間</option>
            </Select>
            <Tooltip label={asc ? '由舊到新' : '由新到舊'} placement="top" hasArrow>
              <IconButton
                icon={asc ? <FiArrowUp /> : <FiArrowDown />}
                onClick={() => setAsc(p => !p)}
                variant="outline"
                borderRadius="lg"
                aria-label="切換排序"
              />
            </Tooltip>
          </HStack>
        </Flex>

        {/* Tag filter chips */}
        <Wrap spacing={2} mt={3}>
          {allTags.map(tag => (
            <WrapItem key={tag}>
              <Badge
                as="button"
                onClick={() => setFilter(tag)}
                colorScheme={filter === tag ? TAG_SCHEME[tag] || 'blue' : 'gray'}
                variant={filter === tag ? 'solid' : 'outline'}
                borderRadius="full"
                px={3}
                py={1}
                fontSize="xs"
                cursor="pointer"
                transition="all 0.15s"
                _hover={{ opacity: 0.8 }}
              >
                {tag}
              </Badge>
            </WrapItem>
          ))}
        </Wrap>
      </Box>

      {/* ── Todo items ──────────────────────────────────────────── */}
      <TodoList
        todos={currentData}
        onToggle={handleToggle}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onView={handleView}
        filter={filter}
        setFilter={setFilter}
        tags={tags}
      />

      {/* ── Pagination ──────────────────────────────────────────── */}
      {maxPage > 1 && (
        <Flex justify="center" align="center" gap={3} mt={5}>
          <Button
            onClick={prev}
            isDisabled={page === 1}
            variant="outline"
            size="sm"
            borderRadius="lg"
          >
            ← 上一頁
          </Button>
          <Text fontSize="sm" color={metaClr}>
            第 {page} / {maxPage} 頁
          </Text>
          <Button
            onClick={next}
            isDisabled={page === maxPage}
            variant="outline"
            size="sm"
            borderRadius="lg"
          >
            下一頁 →
          </Button>
        </Flex>
      )}

      {/* ── Modals ──────────────────────────────────────────────── */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} isCentered size="lg" motionPreset="scale">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader borderBottom="1px solid" borderColor={border} pb={4}>
            ✏️ 新增待辦
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pt={5} pb={6}>
            <TodoForm onAdd={handleAdd} tags={tags} isLoading={loading} />
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isEditOpen} onClose={() => { setEditingTodo(null); onEditClose(); }} isCentered size="lg" motionPreset="scale">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader borderBottom="1px solid" borderColor={border} pb={4}>
            ✏️ 編輯待辦
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pt={5} pb={6}>
            {editingTodo && (
              <TodoForm
                initialValues={editingTodo}
                onUpdate={handleUpdate}
                onCancel={() => { setEditingTodo(null); onEditClose(); }}
                tags={tags}
                isLoading={loading}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal isOpen={isViewOpen} onClose={() => { setViewingTodo(null); onViewClose(); }} isCentered size="lg" motionPreset="scale">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader borderBottom="1px solid" borderColor={border} pb={4}>
            📄 待辦詳情
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pt={5} pb={6}>
            {viewingTodo
              ? <TodoForm initialValues={viewingTodo} tags={tags} readOnly />
              : <Text color={metaClr}>載入中…</Text>
            }
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
