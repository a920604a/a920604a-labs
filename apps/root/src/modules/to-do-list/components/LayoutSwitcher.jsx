import { HStack, Button } from '@chakra-ui/react';

export default function LayoutSwitcher({ page, setPage }) {
  return (
    <HStack spacing={4} mb={6}>
      <Button colorScheme={page === 'list' ? 'blue' : 'gray'} onClick={() => setPage('list')}>
        清單
      </Button>
      <Button colorScheme={page === 'stats' ? 'blue' : 'gray'} onClick={() => setPage('stats')}>
        統計
      </Button>
      <Button colorScheme={page === 'calendar' ? 'blue' : 'gray'} onClick={() => setPage('calendar')}>
        日曆
      </Button>
    </HStack>
  );
}
