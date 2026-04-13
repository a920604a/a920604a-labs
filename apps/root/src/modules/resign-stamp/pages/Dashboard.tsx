import {
  Box,
  Center,
  Container,
  Divider,
  Flex,
  Heading,
  Link,
  Spinner,
  Text,
  useColorModeValue,
  useToast,
  VStack,
} from '@chakra-ui/react'
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { PDFDocument, rgb } from 'pdf-lib'
import * as fontkit from 'fontkit'
import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth, getFirebaseFirestore } from '@a920604a/auth'
import Achievements from '../components/Achievements'
import DailyQuote from '../components/DailyQuote'
import ProgressSection from '../components/ProgressSection'
import StampGrid from '../components/StampGrid'
import type { Stamp } from '../components/StampGrid'

const MAX_STAMPS = 100

const MILESTONE_COUNTS = [25, 50, 75, 100]

export default function Dashboard() {
  const { user } = useAuth()
  const toast = useToast()
  const [stamps, setStamps] = useState<Stamp[]>([])
  const [loading, setLoading] = useState(true)
  const [unlockedAchievements, setUnlockedAchievements] = useState<number[]>([])

  const db = getFirebaseFirestore()
  const userDocRef = doc(db, 'users', user!.uid)

  const cardBg = useColorModeValue('white',    'gray.800')
  const border = useColorModeValue('gray.100', 'gray.700')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const docSnap = await getDoc(userDocRef)
      if (docSnap.exists()) {
        setStamps(docSnap.data().stamps || [])
      } else {
        await setDoc(userDocRef, { stamps: [] })
      }
      setLoading(false)
    }
    fetchData()
  }, [user!.uid])

  const handleAddStamp = async (index: number, reason: string) => {
    const newStamp: Stamp = { index, reason, timestamp: Date.now() }
    setStamps(prev => [...prev, newStamp])
    await updateDoc(userDocRef, { stamps: arrayUnion(newStamp) })
  }

  // Achievement unlock notifications
  useEffect(() => {
    MILESTONE_COUNTS.forEach(count => {
      if (stamps.length >= count && !unlockedAchievements.includes(count)) {
        setUnlockedAchievements(prev => [...prev, count])
        toast({
          title: '🎉 成就解鎖！',
          description: `恭喜達成 ${count} 章！`,
          status: 'success',
          duration: 4000,
          isClosable: true,
          position: 'bottom',
        })
      }
    })
  }, [stamps, unlockedAchievements])

  const generatePdf = async () => {
    const pdfDoc = await PDFDocument.create()
    pdfDoc.registerFontkit(fontkit)
    const page = pdfDoc.addPage([600, 750])
    const { height } = page.getSize()
    const fontUrl   = import.meta.env.BASE_URL + 'fonts/NotoSansTC-Regular.ttf'
    const fontBytes = await fetch(fontUrl).then(r => r.arrayBuffer())
    const customFont = await pdfDoc.embedFont(fontBytes)

    page.drawText('離職集章證明報告', { x: 50, y: height - 50,  size: 24, font: customFont, color: rgb(0, 0.53, 0.24) })
    page.drawText(`姓名：${user!.displayName || 'Anonymous'}`, { x: 50, y: height - 80,  size: 14, font: customFont })
    page.drawText(`已收集章數：${stamps.length} / ${MAX_STAMPS}`,    { x: 50, y: height - 110, size: 14, font: customFont })
    page.drawText('章節內容：', { x: 50, y: height - 140, size: 14, font: customFont })

    let y = height - 170
    stamps.forEach((stamp, idx) => {
      page.drawText(
        `${idx + 1}. 編號 ${stamp.index}：${stamp.reason}`,
        { x: 60, y, size: 12, font: customFont, color: rgb(0, 0, 0) }
      )
      y -= 20
    })

    const blob = new Blob([await pdfDoc.save()], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'resignation_stamp_report.pdf'
    link.click()
  }

  if (loading) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" color="red.400" thickness="4px" />
      </Center>
    )
  }

  const progress = Number(((stamps.length / MAX_STAMPS) * 100).toFixed(2))

  return (
    <Container maxW="5xl" py={8} px={{ base: 4, md: 8 }}>
      <VStack spacing={6} align="stretch">

        {/* ── Header ──────────────────────────────────────────────── */}
        <Flex align="baseline" justify="space-between" flexWrap="wrap" gap={2}>
          <Box>
            <Heading size="xl" fontWeight={800} color={useColorModeValue('red.500', 'red.300')}>
              🏮 離職集章
            </Heading>
            <Text fontSize="sm" color={useColorModeValue('gray.500', 'gray.400')} mt={1}>
              記錄每一個想離職的瞬間，累積成屬於你的離職故事
            </Text>
          </Box>
          <Link
            as={RouterLink}
            to="/resign-stamp/reasons"
            fontSize="sm"
            color="red.400"
            fontWeight={600}
            _hover={{ textDecoration: 'none', color: 'red.500' }}
          >
            查看所有理由 →
          </Link>
        </Flex>

        {/* ── Daily Quote ─────────────────────────────────────────── */}
        <DailyQuote />

        {/* ── Progress + Stats ────────────────────────────────────── */}
        <ProgressSection
          progress={progress}
          stamps={stamps.length}
          maxStamps={MAX_STAMPS}
          onExport={generatePdf}
        />

        {/* ── Achievements ────────────────────────────────────────── */}
        <Achievements stamps={stamps.length} unlocked={unlockedAchievements} />

        {/* ── Stamp Grid ──────────────────────────────────────────── */}
        <Box
          bg={cardBg}
          border="1px solid"
          borderColor={border}
          borderRadius="xl"
          p={{ base: 4, md: 6 }}
          shadow="sm"
        >
          <Flex align="center" justify="space-between" mb={4}>
            <Text fontWeight={700} fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')}
              textTransform="uppercase" letterSpacing="wider">
              📋 集章板
            </Text>
            <Text fontSize="xs" color={useColorModeValue('gray.400', 'gray.500')}>
              點擊空格蓋章
            </Text>
          </Flex>

          <Divider mb={4} />

          <StampGrid stamps={stamps} maxStamps={MAX_STAMPS} onStampAdd={handleAddStamp} />

          {stamps.length > 0 && (
            <Text fontSize="xs" color={useColorModeValue('gray.400', 'gray.500')} mt={4} textAlign="center">
              🔖 = 已蓋章（懸停查看理由）
            </Text>
          )}
        </Box>

      </VStack>
    </Container>
  )
}
