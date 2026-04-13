import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { getFirebaseFirestore, getFirebaseAuth } from '@a920604a/auth'
import { v4 as uuidv4 } from 'uuid'

function getCurrentUserId() {
  const user = getFirebaseAuth().currentUser
  if (!user) {
    console.error('尚未登入')
    return null
  }
  return user.uid
}

function todosCollection() {
  return collection(getFirebaseFirestore(), 'todos')
}

function toTimestamp(time) {
  if (!time) return null
  if (typeof time === 'number' && !isNaN(time)) return time
  const date = new Date(time)
  return isNaN(date.getTime()) ? null : date.getTime()
}

function defaultDeadline() {
  return new Date(new Date().setFullYear(new Date().getFullYear() + 10)).getTime()
}

// 取得所有屬於當前使用者的 todos
export async function getAllTodos() {
  const userId = getCurrentUserId()
  if (!userId) return []

  const q = query(todosCollection(), where('userId', '==', userId), orderBy('created_at', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// 新增 todo
export async function addTodo(todo) {
  const userId = getCurrentUserId()
  if (!userId) return null

  const id = uuidv4()
  const deadline = todo.deadline
    ? (() => { const d = new Date(todo.deadline); return isNaN(d.getTime()) ? defaultDeadline() : d.getTime() })()
    : defaultDeadline()

  const docRef = doc(todosCollection(), id)
  await setDoc(docRef, {
    ...todo,
    id,
    userId,
    deadline,
    created_at: Date.now(),
    updated_at: Date.now(),
  })

  return id
}

// 更新 todo
export async function updateTodo(todo) {
  const userId = getCurrentUserId()
  if (!userId || !todo.id) return

  const docRef = doc(todosCollection(), todo.id)
  await updateDoc(docRef, {
    ...todo,
    updated_at: Date.now(),
    created_at: toTimestamp(todo.created_at) || Date.now(),
    deadline: toTimestamp(todo.deadline),
  })
}

// 刪除 todo
export async function deleteTodo(id) {
  const userId = getCurrentUserId()
  if (!userId) return

  const docRef = doc(todosCollection(), id)
  await deleteDoc(docRef)
}
