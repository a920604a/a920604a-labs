import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge, Box, Button, Center, Container, Divider, Flex, FormControl,
  FormLabel, Grid, Heading, HStack, IconButton, Input, Modal,
  ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader,
  ModalOverlay, Progress, Select, SimpleGrid, Spinner, Stat, StatHelpText,
  StatLabel, StatNumber, Text, Tooltip, useColorModeValue, useDisclosure,
  useToast, VStack,
} from '@chakra-ui/react';
import { AddIcon, SearchIcon, DeleteIcon } from '@chakra-ui/icons';
import { FiBook, FiUpload } from 'react-icons/fi';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { v4 as uuidv4 } from 'uuid';

import { getBooksFromSupabase, uploadToSupabase, deleteFromSupabase, getReadingProgress } from '../components/BookManager';
import { clearIndexedDB, getAllBooksFromIndexedDB, saveBookToIndexedDB, deleteBookFromIndexedDB } from '../components/IndexedDB';
import { useAuth } from '@a920604a/auth';

ChartJS.register(ArcElement, ChartTooltip, Legend);

const CATEGORIES = ['科技', '小說', '教育', '自我提升', '歷史', '其他'];
const STATUS_COLOR = { 已閱讀: 'green', 正在讀: 'yellow', 未閱讀: 'red' };

function bookStatus(book) {
  if (book.lastPage > 0 && book.lastPage >= book.totalPages) return '已閱讀';
  if (book.lastPage > 0) return '正在讀';
  return '未閱讀';
}

const CHART_OPTIONS = {
  responsive: true,
  plugins: { legend: { position: 'bottom' } },
  maintainAspectRatio: true,
};

export default function Dashboard() {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const toast     = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [books,           setBooks]          = useState([]);
  const [file,            setFile]           = useState(null);
  const [category,        setCategory]       = useState('');
  const [loading,         setLoading]        = useState(false);
  const [initializing,    setInitializing]   = useState(true);
  const [searchQuery,     setSearchQuery]    = useState('');
  const [categoryFilter,  setCategoryFilter] = useState('');

  const userId = user?.uid ?? null;

  // ── Colours ──────────────────────────────────────────────────────────────
  const cardBg    = useColorModeValue('white',     'gray.800');
  const border    = useColorModeValue('gray.100',  'gray.700');
  const labelCl   = useColorModeValue('gray.500',  'gray.400');
  const emptyBg   = useColorModeValue('gray.50',   'gray.750');

  // ── Load books ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    const init = async () => {
      setInitializing(true);
      if (!sessionStorage.getItem('ebook-initialized')) {
        await clearIndexedDB();
        sessionStorage.setItem('ebook-initialized', 'true');
      }
      const [localBooks, apiBooks] = await Promise.all([
        getAllBooksFromIndexedDB(),
        getBooksFromSupabase(userId),
      ]);
      const missing = apiBooks.filter(ab => !localBooks.some(lb => lb.id === ab.id));
      for (const b of missing) await saveBookToIndexedDB(b, userId);
      const all = [...localBooks, ...missing];
      for (const b of all) {
        const p = await getReadingProgress(b.id, userId);
        b.lastPage   = p.page_number || 0;
        b.totalPages = p.total_page  || 0;
      }
      setBooks(all);
      setInitializing(false);
    };
    init();
  }, [userId]);

  // ── Derived data ─────────────────────────────────────────────────────────
  const filteredBooks = books.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (categoryFilter ? b.category === categoryFilter : true)
  );

  const stats = {
    total:   books.length,
    read:    books.filter(b => bookStatus(b) === '已閱讀').length,
    reading: books.filter(b => bookStatus(b) === '正在讀').length,
    unread:  books.filter(b => bookStatus(b) === '未閱讀').length,
  };

  const categoryData = (() => {
    const counts = books.reduce((acc, b) => { acc[b.category] = (acc[b.category] || 0) + 1; return acc; }, {});
    return {
      labels: Object.keys(counts),
      datasets: [{ data: Object.values(counts), backgroundColor: ['#EF4444','#3B82F6','#22C55E','#8B5CF6','#F97316','#06B6D4'] }],
    };
  })();

  const statusData = {
    labels: ['已閱讀', '正在讀', '未閱讀'],
    datasets: [{ data: [stats.read, stats.reading, stats.unread], backgroundColor: ['#22C55E','#EAB308','#EF4444'] }],
  };

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleUpload = () => {
    if (!file || !category) {
      toast({ title: '請選擇檔案和分類', status: 'warning', duration: 2000, isClosable: true });
      return;
    }
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const newBook = { id: uuidv4(), name: file.name, category, data: e.target.result };
      const result = await uploadToSupabase(newBook, userId);
      if (!result) {
        toast({ title: '上傳失敗', status: 'error', duration: 2000, isClosable: true });
        setLoading(false);
        return;
      }
      await saveBookToIndexedDB({ ...newBook, file_url: result.file_url ?? '' }, userId, result.file_url ?? '');
      setBooks(await getAllBooksFromIndexedDB());
      setFile(null); setCategory(''); setLoading(false);
      toast({ title: '上傳成功！', status: 'success', duration: 3000, isClosable: true });
      onClose();
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (id, name) => {
    await deleteBookFromIndexedDB(id);
    if (userId) await deleteFromSupabase(id, userId);   // ← fixed: pass id not name
    setBooks(await getAllBooksFromIndexedDB());
    toast({ title: `已刪除《${name}》`, status: 'info', duration: 2000, isClosable: true });
  };

  if (initializing) {
    return <Center minH="100vh"><Spinner size="xl" color="purple.400" thickness="4px" /></Center>;
  }

  return (
    <Container maxW="5xl" py={8} px={{ base: 4, md: 8 }}>
      <VStack spacing={6} align="stretch">

        {/* ── Header ──────────────────────────────────────────── */}
        <Flex align="baseline" justify="space-between" flexWrap="wrap" gap={3}>
          <Box>
            <Heading size="xl" fontWeight={800} color={useColorModeValue('purple.500', 'purple.300')}>
              📚 電子書閱讀
            </Heading>
            <Text color={labelCl} mt={1} fontSize="sm">
              歡迎回來，{user?.displayName?.split(' ')[0]}！你有 {stats.reading} 本書正在閱讀中
            </Text>
          </Box>
          <Button
            leftIcon={<AddIcon boxSize="10px" />}
            colorScheme="purple"
            borderRadius="lg"
            onClick={onOpen}
          >
            上傳電子書
          </Button>
        </Flex>

        {/* ── Stats ───────────────────────────────────────────── */}
        <HStack
          bg={cardBg} border="1px solid" borderColor={border}
          borderRadius="xl" p={4} spacing={0} shadow="sm"
          divider={<Divider orientation="vertical" h="40px" />}
        >
          {[
            { label: '全部', value: stats.total,   color: 'purple.500' },
            { label: '已閱讀', value: stats.read,    color: 'green.500'  },
            { label: '正在讀', value: stats.reading, color: 'yellow.500' },
            { label: '未閱讀', value: stats.unread,  color: 'red.400'    },
          ].map(({ label, value, color }) => (
            <VStack key={label} flex={1} spacing={0} py={1}>
              <Text fontSize="xl" fontWeight={800} color={color}>{value}</Text>
              <Text fontSize="xs" color={labelCl}>{label}</Text>
            </VStack>
          ))}
        </HStack>

        {/* ── Search & Filter ─────────────────────────────────── */}
        <Flex gap={3} flexWrap="wrap">
          <Box flex={1} minW="180px" position="relative">
            <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" pointerEvents="none">
              <SearchIcon color="gray.400" />
            </Box>
            <Input
              pl={9}
              placeholder="搜尋書名…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              borderRadius="lg"
              focusBorderColor="purple.400"
            />
          </Box>
          <Select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            maxW="160px"
            borderRadius="lg"
            focusBorderColor="purple.400"
          >
            <option value="">所有分類</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </Flex>

        {/* ── Book grid ───────────────────────────────────────── */}
        {filteredBooks.length === 0 ? (
          <Center
            bg={emptyBg} border="1px solid" borderColor={border}
            borderRadius="xl" py={16} flexDirection="column" gap={3}
          >
            <FiBook size="48px" color={labelCl} />
            <Text color={labelCl}>
              {books.length === 0 ? '尚無書籍，點擊「上傳電子書」開始' : '找不到符合條件的書籍'}
            </Text>
          </Center>
        ) : (
          <Grid templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={4}>
            {filteredBooks.map((book) => {
              const status = bookStatus(book);
              const pct    = book.totalPages > 0 ? Math.round((book.lastPage / book.totalPages) * 100) : 0;
              return (
                <Box
                  key={book.id}
                  bg={cardBg}
                  border="1px solid"
                  borderColor={border}
                  borderRadius="xl"
                  overflow="hidden"
                  shadow="sm"
                  _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
                  transition="all 0.18s"
                  display="flex"
                  flexDirection="column"
                >
                  {/* Cover gradient */}
                  <Box
                    h="100px"
                    bgGradient={`linear(135deg, purple.400, purple.600)`}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="4xl">📖</Text>
                  </Box>

                  <Box p={4} flex={1} display="flex" flexDirection="column">
                    <HStack mb={2} spacing={2}>
                      <Badge colorScheme={STATUS_COLOR[status]} borderRadius="md" fontSize="xs">
                        {status}
                      </Badge>
                      <Badge colorScheme="purple" variant="outline" borderRadius="md" fontSize="xs">
                        {book.category}
                      </Badge>
                    </HStack>

                    <Text fontWeight={700} fontSize="sm" noOfLines={2} flex={1} mb={3}>
                      {book.name}
                    </Text>

                    {book.totalPages > 0 && (
                      <Box mb={3}>
                        <Flex justify="space-between" mb={1}>
                          <Text fontSize="xs" color={labelCl}>閱讀進度</Text>
                          <Text fontSize="xs" color={labelCl}>{pct}%</Text>
                        </Flex>
                        <Progress value={pct} colorScheme="purple" size="sm" borderRadius="full" />
                      </Box>
                    )}

                    <Flex gap={2}>
                      <Button
                        flex={1}
                        size="sm"
                        colorScheme="purple"
                        borderRadius="lg"
                        leftIcon={<FiBook />}
                        onClick={() => navigate(`/ebook-reader/reader/${book.id}`)}
                        isDisabled={!book.file_url}
                      >
                        {status === '未閱讀' ? '開始閱讀' : '繼續閱讀'}
                      </Button>
                      <Tooltip label="刪除" placement="top" hasArrow>
                        <IconButton
                          icon={<DeleteIcon />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          borderRadius="lg"
                          onClick={() => handleDelete(book.id, book.name)}
                          aria-label="刪除書籍"
                        />
                      </Tooltip>
                    </Flex>
                  </Box>
                </Box>
              );
            })}
          </Grid>
        )}

        {/* ── Charts ──────────────────────────────────────────── */}
        {books.length > 0 && (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            {[
              { title: '分類分佈', data: categoryData },
              { title: '閱讀狀態', data: statusData   },
            ].map(({ title, data }) => (
              <Box key={title} bg={cardBg} border="1px solid" borderColor={border} borderRadius="xl" p={5} shadow="sm">
                <Text fontSize="sm" fontWeight={700} mb={4} color={labelCl}
                  textTransform="uppercase" letterSpacing="wider">{title}</Text>
                <Box maxW="240px" mx="auto">
                  <Doughnut data={data} options={CHART_OPTIONS} />
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        )}

      </VStack>

      {/* ── Upload Modal ────────────────────────────────────────── */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="md" motionPreset="scale">
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader
            bgGradient="linear(to-r, purple.400, purple.600)"
            color="white" py={5} px={6} fontSize="lg" fontWeight={700}
          >
            <HStack spacing={2}>
              <FiUpload />
              <Text>上傳電子書</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" top={4} right={4} />
          <ModalBody pt={5} pb={2} px={6}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize="sm">選擇 PDF 檔案</FormLabel>
                <Input
                  type="file"
                  accept=".pdf"
                  onChange={e => setFile(e.target.files[0])}
                  borderRadius="lg"
                  focusBorderColor="purple.400"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel fontSize="sm">書籍分類</FormLabel>
                <Select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  placeholder="選擇分類"
                  borderRadius="lg"
                  focusBorderColor="purple.400"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter gap={3} pt={3} pb={5} px={6}>
            <Button variant="ghost" onClick={onClose} borderRadius="lg">取消</Button>
            <Button
              colorScheme="purple"
              onClick={handleUpload}
              isLoading={loading}
              isDisabled={!file || !category}
              borderRadius="lg"
              leftIcon={<FiUpload />}
            >
              上傳
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}
