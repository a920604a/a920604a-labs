import { useEffect, useState } from 'react'
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'
import { getFirebaseFirestore, useAuth } from '@a920604a/auth'

export interface DailySummary {
  todoIncomplete: number
  todoDueToday: number
  habitStreak: number
  habitUncheckedToday: number
  resignStampCount: number
}

const EMPTY: DailySummary = {
  todoIncomplete: 0,
  todoDueToday: 0,
  habitStreak: 0,
  habitUncheckedToday: 0,
  resignStampCount: 0,
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function calcStreak(records: string[]): number {
  if (records.length === 0) return 0
  const unique = [...new Set(records)].sort().reverse()
  let streak = 0
  const cur = new Date(); cur.setHours(0, 0, 0, 0)
  for (const r of unique) {
    const d = new Date(r); d.setHours(0, 0, 0, 0)
    if (Math.round((cur.getTime() - d.getTime()) / 86400000) === streak) {
      streak++
      cur.setDate(cur.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export function useDailySummary() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<DailySummary>(EMPTY)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) return
    const uid = user.uid
    const db = getFirebaseFirestore()
    const today = todayStr()

    async function fetchData() {
      try {
        const [todosSnap, habitsSnap, resignSnap] = await Promise.all([
          getDocs(query(collection(db, 'todos'), where('userId', '==', uid))),
          getDocs(query(collection(db, 'habits'), where('userId', '==', uid))),
          getDoc(doc(db, 'users', uid)),
        ])

        const todos = todosSnap.docs.map(d => d.data())
        const todoIncomplete = todos.filter(t => !t.complete).length
        const todoDueToday = todos.filter(t => {
          if (t.complete || !t.deadline) return false
          const diff = Math.ceil((t.deadline - Date.now()) / 86400000)
          return diff >= 0 && diff <= 0
        }).length

        const habits = habitsSnap.docs.map(d => d.data())
        let habitStreak = 0
        let habitUncheckedToday = 0
        for (const h of habits) {
          const records: string[] = h.records ?? []
          const s = calcStreak(records)
          if (s > habitStreak) habitStreak = s
          if (!records.includes(today)) habitUncheckedToday++
        }

        const resignStampCount = (resignSnap.data()?.stamps as unknown[])?.length ?? 0

        setSummary({ todoIncomplete, todoDueToday, habitStreak, habitUncheckedToday, resignStampCount })
      } catch {
        // silent degradation
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.uid])

  return { summary, loading }
}
