import { useEffect, useState } from 'react';
import {
  Badge, Box, Button, Collapse, Divider, Flex, HStack,
  IconButton, Input, Text, Tooltip, useColorModeValue, useDisclosure, VStack,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, BellIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirebaseAuth } from '@a920604a/auth';
import { getReminderSettings, saveReminderSettings } from '../utils/firebaseDb';
import { useDailyNotification } from '../hooks/useDailyNotification';

export default function ReminderSettings() {
  const [userId,        setUserId]        = useState(null);
  const [reminderTimes, setReminderTimes] = useState([]);
  const [newTime,       setNewTime]       = useState('');
  const [loadingInit,   setLoadingInit]   = useState(true);
  const { isOpen, onToggle } = useDisclosure();

  const cardBg  = useColorModeValue('white',    'gray.800');
  const border  = useColorModeValue('gray.100', 'gray.700');
  const labelCl = useColorModeValue('gray.500', 'gray.400');
  const chipBg  = useColorModeValue('green.50', 'green.900');

  useDailyNotification(reminderTimes);

  useEffect(() => {
    const unsub = onAuthStateChanged(getFirebaseAuth(), async (user) => {
      if (user) {
        setUserId(user.uid);
        setReminderTimes(await getReminderSettings(user.uid));
      } else {
        setUserId(null);
        setReminderTimes([]);
      }
      setLoadingInit(false);
    });
    return () => unsub();
  }, []);

  const addTime = async () => {
    if (!newTime || reminderTimes.includes(newTime)) return;
    const updated = [...reminderTimes, newTime].sort();
    setReminderTimes(updated);
    setNewTime('');
    if (userId) await saveReminderSettings(userId, updated);
  };

  const removeTime = async (t) => {
    const updated = reminderTimes.filter(x => x !== t);
    setReminderTimes(updated);
    if (userId) await saveReminderSettings(userId, updated);
  };

  if (loadingInit) return null;

  return (
    <Box
      bg={cardBg}
      border="1px solid"
      borderColor={border}
      borderRadius="xl"
      overflow="hidden"
      shadow="sm"
    >
      {/* Header toggle */}
      <Flex
        align="center"
        justify="space-between"
        px={5}
        py={4}
        cursor="pointer"
        onClick={onToggle}
        _hover={{ bg: useColorModeValue('gray.50', 'gray.750') }}
        transition="background 0.15s"
      >
        <HStack spacing={2}>
          <BellIcon color="green.400" />
          <Text fontWeight={600} fontSize="sm">提醒設定</Text>
          {reminderTimes.length > 0 && (
            <Badge colorScheme="green" borderRadius="full" fontSize="xs">
              {reminderTimes.length} 個提醒
            </Badge>
          )}
        </HStack>
        {isOpen ? <ChevronUpIcon color={labelCl} /> : <ChevronDownIcon color={labelCl} />}
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <Divider />
        <Box px={5} py={4}>
          {/* Add time row */}
          <HStack spacing={3} mb={4}>
            <Input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              borderRadius="lg"
              focusBorderColor="green.400"
              maxW="140px"
            />
            <Button
              leftIcon={<AddIcon boxSize="10px" />}
              colorScheme="green"
              borderRadius="lg"
              onClick={addTime}
              isDisabled={!newTime}
              size="sm"
            >
              新增提醒
            </Button>
          </HStack>

          {reminderTimes.length === 0 ? (
            <Text fontSize="sm" color={labelCl}>尚未設定提醒時間</Text>
          ) : (
            <VStack spacing={2} align="stretch">
              {reminderTimes.map((t) => (
                <Flex key={t} align="center" justify="space-between"
                  bg={chipBg} borderRadius="lg" px={3} py={2}>
                  <HStack spacing={2}>
                    <BellIcon color="green.500" boxSize="12px" />
                    <Text fontSize="sm" fontWeight={600}>{t}</Text>
                  </HStack>
                  <Tooltip label="移除提醒" placement="top" hasArrow>
                    <IconButton
                      icon={<DeleteIcon />}
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => removeTime(t)}
                      aria-label="移除提醒"
                    />
                  </Tooltip>
                </Flex>
              ))}
            </VStack>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
