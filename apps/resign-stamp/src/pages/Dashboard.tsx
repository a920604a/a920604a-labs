import {
  Box,
  Center,
  Container,
  Heading,
  Link,
  Spinner,
} from '@chakra-ui/react'
import { arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { PDFDocument, rgb } from 'pdf-lib'
import * as fontkit from 'fontkit'
import { useEffect, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth, getFirebaseFirestore } from '@a920604a/auth'
import { NavBar } from '@a920604a/ui'
import DailyQuote from '../components/DailyQuote'
import ProgressSection from '../components/ProgressSection'
import StampGrid from '../components/StampGrid'
import Toast from '../components/Toast'
import type { Stamp } from '../components/StampGrid'

const MAX_STAMPS = 100

const ACHIEVEMENTS = [
  { count: Math.floor(MAX_STAMPS * 0.25), label: `達成 ${Math.floor(MAX_STAMPS * 0.25)} 個章` },
  { count: Math.floor(MAX_STAMPS * 0.5), label: `達成 ${Math.floor(MAX_STAMPS * 0.5)} 個章` },
  { count: Math.floor(MAX_STAMPS * 0.75), label: `達成 ${Math.floor(MAX_STAMPS * 0.75)} 個章` },
  { count: MAX_STAMPS, label: `達成 ${MAX_STAMPS} 個章` },
]

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [stamps, setStamps] = useState<Stamp[]>([])
  const [loading, setLoading] = useState(true)
  const [unlockedAchievements, setUnlockedAchievements] = useState<number[]>([])
  const [toast, setToast] = useState<string | null>(null)

  const db = getFirebaseFirestore()
  const userDocRef = doc(db, 'users', user!.uid)

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
    setStamps((prev) => [...prev, newStamp])
    await updateDoc(userDocRef, { stamps: arrayUnion(newStamp) })
  }

  useEffect(() => {
    ACHIEVEMENTS.forEach(({ count, label }) => {
      if (stamps.length >= count && !unlockedAchievements.includes(count)) {
        setUnlockedAchievements((prev) => [...prev, count])
        setToast(`🎉 恭喜！${label} 🎉`)
        setTimeout(() => setToast(null), 3000)
      }
    })
  }, [stamps, unlockedAchievements])

  const generatePdf = async () => {
    const pdfDoc = await PDFDocument.create()
    pdfDoc.registerFontkit(fontkit)
    const page = pdfDoc.addPage([600, 750])
    const { height } = page.getSize()
    const fontUrl = import.meta.env.BASE_URL + 'fonts/NotoSansTC-Regular.ttf'
    const fontBytes = await fetch(fontUrl).then((r) => r.arrayBuffer())
    const customFont = await pdfDoc.embedFont(fontBytes)

    page.drawText('離職集章證明報告', { x: 50, y: height - 50, size: 24, font: customFont, color: rgb(0, 0.53, 0.24) })
    page.drawText(`姓名：${user!.displayName || 'Anonymous'}`, { x: 50, y: height - 80, size: 14, font: customFont })
    page.drawText(`已收集章數：${stamps.length} / ${MAX_STAMPS}`, { x: 50, y: height - 110, size: 14, font: customFont })
    page.drawText('章節內容：', { x: 50, y: height - 140, size: 14, font: customFont })

    let y = height - 170
    stamps.forEach((stamp, idx) => {
      page.drawText(`${idx + 1}. 編號 ${stamp.index}：${stamp.reason}`, { x: 60, y, size: 12, font: customFont, color: rgb(0, 0, 0) })
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
        <Spinner size="xl" color="brand.500" />
      </Center>
    )
  }

  const progress = Number(((stamps.length / MAX_STAMPS) * 100).toFixed(2))

  return (
    <>
      <NavBar appName="離職集章" user={user} onLogout={logout} />
      <Container maxW="5xl" py={8}>
        <Heading size="lg" color="brand.600" mb={6}>
          離職集章
        </Heading>

        <DailyQuote />
        <ProgressSection progress={progress} onExport={generatePdf} />
        <Toast message={toast} />

        <Box border="1px" borderColor="gray.300" rounded="lg" p={6} bg="gray.50" mt={4}>
          <StampGrid stamps={stamps} maxStamps={MAX_STAMPS} onStampAdd={handleAddStamp} />
        </Box>

        <Link as={RouterLink} to="/reasons" color="brand.600" mt={4} display="block">
          查看所有理由列表 →
        </Link>
      </Container>
    </>
  )
}
