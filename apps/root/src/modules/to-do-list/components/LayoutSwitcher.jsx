import { Button, HStack, useColorModeValue } from '@chakra-ui/react';
import { CalendarIcon, InfoIcon } from '@chakra-ui/icons';
import { FiList, FiBarChart2, FiCalendar } from 'react-icons/fi';

const VIEWS = [
  { key: 'list',     label: '清單', Icon: FiList      },
  { key: 'stats',    label: '統計', Icon: FiBarChart2  },
  { key: 'calendar', label: '日曆', Icon: FiCalendar   },
];

export default function LayoutSwitcher({ page, setPage }) {
  const activeBg    = useColorModeValue('blue.500',   'blue.400');
  const inactiveBg  = useColorModeValue('white',      'gray.700');
  const activeText  = 'white';
  const inactiveText = useColorModeValue('gray.600',  'gray.300');
  const border      = useColorModeValue('gray.200',   'gray.600');

  return (
    <HStack
      spacing={0}
      border="1px solid"
      borderColor={border}
      borderRadius="xl"
      overflow="hidden"
      display="inline-flex"
      mb={6}
    >
      {VIEWS.map(({ key, label, Icon }) => {
        const active = page === key;
        return (
          <Button
            key={key}
            onClick={() => setPage(key)}
            bg={active ? activeBg : inactiveBg}
            color={active ? activeText : inactiveText}
            borderRadius={0}
            borderRight="1px solid"
            borderColor={border}
            _last={{ borderRight: 'none' }}
            _hover={{ bg: active ? activeBg : useColorModeValue('gray.50', 'gray.600') }}
            leftIcon={<Icon size="14px" />}
            px={5}
            py={2}
            h="38px"
            fontSize="sm"
            fontWeight={active ? 600 : 400}
            transition="all 0.15s"
          >
            {label}
          </Button>
        );
      })}
    </HStack>
  );
}
