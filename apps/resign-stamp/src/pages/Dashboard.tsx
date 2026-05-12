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
  const [pdfReport, setPdfReport] = useState<{ causes: string; values: string; advice: string } | null>(null)
  const [generatingPdf, setGeneratingPdf] = useState(false)

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

  const handleExport = async () => {
    setGeneratingPdf(true)
    try {
      let report = pdfReport
      if (!report) {
        const token = await getAuth().currentUser?.getIdToken()
        if (!token) throw new Error('no token')
        const res = await fetch(`${RESIGN_API_URL}/ai/pdf-report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ stamps, userName: user!.displayName || 'Anonymous' }),
        })
        if (!res.ok) throw new Error(`status ${res.status}`)
        report = await res.json() as { causes: string; values: string; advice: string }
        setPdfReport(report)
      }
      await generatePdf(report)
    } catch (err) {
      console.log('[handleExport] failed:', err, 'RESIGN_API_URL:', RESIGN_API_URL)
      toast({ title: 'PDF 分析失敗，請稍後再試', status: 'error', duration: 3000, isClosable: true })
    } finally {
      setGeneratingPdf(false)
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

  const generatePdf = async (report: { causes: string; values: string; advice: string }) => {
    const pdfDoc = await PDFDocument.create()
    pdfDoc.registerFontkit(fontkit)
    const page = pdfDoc.addPage([595, 842])

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
    const font = await pdfDoc.embedFont(fontBytes)

    const W = 595
    const H = 842
    const MARGIN = 40
    const white     = rgb(1, 1, 1)
    const darkRed   = rgb(0.6, 0.1, 0.1)
    const lightGray = rgb(0.96, 0.96, 0.96)
    const sepGray   = rgb(0.85, 0.85, 0.85)
    const dark      = rgb(0.15, 0.15, 0.15)
    const mid       = rgb(0.45, 0.45, 0.45)

    // ── Block 1: Header ──────────────────────────────────────
    const headerH = 100
    const headerY = H - headerH
    page.drawRectangle({ x: 0, y: headerY, width: W, height: headerH, color: darkRed })
    page.drawText('離職集章證明', {
      x: MARGIN, y: headerY + 55, size: 24, font, color: white,
    })
    page.drawText(user!.displayName || 'Anonymous', {
      x: MARGIN, y: headerY + 22, size: 12, font, color: rgb(0.95, 0.85, 0.85),
    })
    const today = new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
    page.drawText(today, {
      x: W - MARGIN - 90, y: headerY + 22, size: 12, font, color: rgb(0.95, 0.85, 0.85),
    })

    // ── Block 2: Stats card ───────────────────────────────────
    const statsCardH = 60
    const statsCardY = headerY - 16 - statsCardH
    page.drawRectangle({ x: MARGIN, y: statsCardY, width: W - MARGIN * 2, height: statsCardH, color: lightGray })
    page.drawText(String(stamps.length), {
      x: MARGIN + 20, y: statsCardY + 30, size: 28, font, color: darkRed,
    })
    page.drawText('章', { x: MARGIN + 65, y: statsCardY + 30, size: 14, font, color: dark })
    page.drawText('已集章數', { x: MARGIN + 20, y: statsCardY + 10, size: 9, font, color: mid })
    const pct = ((stamps.length / MAX_STAMPS) * 100).toFixed(1)
    page.drawText(`${pct}%`, {
      x: W / 2 + 20, y: statsCardY + 30, size: 28, font, color: darkRed,
    })
    page.drawText('完成度', { x: W / 2 + 20, y: statsCardY + 10, size: 9, font, color: mid })

    // ── Block 3: Vertical sections ───────────────────────────
    const CHARS_PER_LINE = 36
    const LINE_H = 18
    const TEXT_SIZE = 10
    const LABEL_H = 26
    const SECTION_GAP = 14
    const TEXT_PAD = 10

    const drawSection = (label: string, text: unknown, topY: number): number => {
      const safeText = typeof text === 'string' && text ? text : ''
      // Label bar — light warm background + dark red text for reliable contrast
      page.drawRectangle({ x: MARGIN, y: topY - LABEL_H, width: W - MARGIN * 2, height: LABEL_H, color: rgb(0.94, 0.88, 0.88) })
      page.drawLine({ start: { x: MARGIN, y: topY - LABEL_H }, end: { x: W - MARGIN, y: topY - LABEL_H }, thickness: 1.5, color: darkRed })
      page.drawText(label, { x: MARGIN + TEXT_PAD, y: topY - LABEL_H + 7, size: 11, font, color: darkRed })
      // Text
      let y = topY - LABEL_H - 16
      let line = ''
      for (const char of safeText) {
        line += char
        if (line.length >= CHARS_PER_LINE) {
          page.drawText(line, { x: MARGIN + TEXT_PAD, y, size: TEXT_SIZE, font, color: dark })
          y -= LINE_H
          line = ''
        }
      }
      if (line) {
        page.drawText(line, { x: MARGIN + TEXT_PAD, y, size: TEXT_SIZE, font, color: dark })
        y -= LINE_H
      }
      return y - SECTION_GAP
    }

    let sectionY = statsCardY - 18
    sectionY = drawSection('離職根因', report.causes, sectionY)
    sectionY = drawSection('你真正重視的', report.values, sectionY)
    drawSection('求職方向', report.advice, sectionY)

    // ── Footer ────────────────────────────────────────────────
    page.drawLine({ start: { x: MARGIN, y: 48 }, end: { x: W - MARGIN, y: 48 }, thickness: 0.5, color: sepGray })
    page.drawText('由 CF Workers AI 生成', { x: MARGIN, y: 32, size: 8, font, color: mid })

    const blob = new Blob([(await pdfDoc.save()).buffer as ArrayBuffer], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'resignation_certificate.pdf'
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
          onExport={handleExport}
          isExporting={generatingPdf}
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
