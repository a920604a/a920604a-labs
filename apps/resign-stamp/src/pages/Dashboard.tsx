import {
  Box,
  Button,
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
import { getAuth } from 'firebase/auth'
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

const RESIGN_API_URL = import.meta.env.VITE_RESIGN_API_URL || 'http://localhost:8788'

const MAX_STAMPS = 100

const MILESTONE_COUNTS = [25, 50, 75, 100]

export default function Dashboard() {
  const { user } = useAuth()
  const toast = useToast()
  const [stamps, setStamps] = useState<Stamp[]>([])
  const [loading, setLoading] = useState(true)
  const [unlockedAchievements, setUnlockedAchievements] = useState<number[]>([])
  const [aiReport, setAiReport]   = useState('')
  const [analyzing, setAnalyzing] = useState(false)

  const db = getFirebaseFirestore()
  const userDocRef = doc(db, 'users', user!.uid)

  const cardBg         = useColorModeValue('white',      'gray.800')
  const border         = useColorModeValue('gray.100',   'gray.700')
  const aiCardBg       = useColorModeValue('orange.50',  'orange.900')
  const aiCardBorder   = useColorModeValue('orange.200', 'orange.700')
  const aiLabelColor   = useColorModeValue('orange.500', 'orange.300')
  const aiReportColor  = useColorModeValue('gray.700',   'gray.100')

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

  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      const token = await getAuth().currentUser?.getIdToken()
      if (!token) throw new Error('no token')
      const res = await fetch(`${RESIGN_API_URL}/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stamps }),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      const data = await res.json() as { report: string }
      setAiReport(data.report ?? '')
    } catch {
      toast({ title: '分析失敗，請稍後再試', status: 'error', duration: 3000, isClosable: true })
    } finally {
      setAnalyzing(false)
    }
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
    let page = pdfDoc.addPage([600, 750])
    const { height } = page.getSize()

    const FONT_CDN = 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-tc@5/files/noto-sans-tc-chinese-traditional-400-normal.woff2'
    let fontBytes: ArrayBuffer
    try {
      const res = await fetch(FONT_CDN)
      if (!res.ok) throw new Error(`Font CDN ${res.status}`)
      fontBytes = await res.arrayBuffer()
    } catch (err) {
      toast({ title: '字體載入失敗，無法匯出 PDF', description: String(err), status: 'error', duration: 4000, isClosable: true })
      return
    }
    const customFont = await pdfDoc.embedFont(fontBytes)

    let startY = height - 50

    if (aiReport) {
      page.drawText('AI 離職故事分析', { x: 50, y: startY, size: 14, font: customFont, color: rgb(0.8, 0.3, 0) })
      startY -= 25
      let line = ''
      const maxWidth = 70
      for (const char of aiReport) {
        line += char
        if (line.length >= maxWidth) {
          page.drawText(line, { x: 50, y: startY, size: 11, font: customFont })
          startY -= 18
          line = ''
        }
      }
      if (line) {
        page.drawText(line, { x: 50, y: startY, size: 11, font: customFont })
        startY -= 30
      }
    }

    page.drawText('離職集章證明報告', { x: 50, y: startY, size: 24, font: customFont, color: rgb(0, 0.53, 0.24) })
    page.drawText(`姓名：${user!.displayName || 'Anonymous'}`, { x: 50, y: startY - 30, size: 14, font: customFont })
    page.drawText(`已收集章數：${stamps.length} / ${MAX_STAMPS}`, { x: 50, y: startY - 60, size: 14, font: customFont })
    page.drawText('章節內容：', { x: 50, y: startY - 90, size: 14, font: customFont })

    let y = startY - 120
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

        {/* ── AI 分析 ─────────────────────────────────────────── */}
        <Box>
          <Button
            onClick={handleAnalyze}
            isLoading={analyzing}
            loadingText="分析中…"
            isDisabled={stamps.length === 0}
            colorScheme="orange"
            variant="outline"
            size="sm"
            borderRadius="lg"
            leftIcon={<Text>✨</Text>}
          >
            AI 分析我的離職故事
          </Button>

          {aiReport && (
            <Box
              mt={3}
              bg={aiCardBg}
              border="1px solid"
              borderColor={aiCardBorder}
              borderLeft="4px solid"
              borderLeftColor="orange.400"
              borderRadius="xl"
              px={6}
              py={5}
            >
              <Flex align="center" gap={2} mb={2}>
                <Text fontSize="lg">🧠</Text>
                <Text fontSize="xs" fontWeight={700} color={aiLabelColor}
                  letterSpacing="widest" textTransform="uppercase">
                  AI 離職故事分析
                </Text>
              </Flex>
              <Text fontSize="md" color={aiReportColor} lineHeight="tall">
                {aiReport}
              </Text>
            </Box>
          )}
        </Box>

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
