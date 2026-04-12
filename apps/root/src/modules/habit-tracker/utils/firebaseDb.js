import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
} from 'firebase/firestore';
import { getFirebaseFirestore, getFirebaseAuth } from '@a920604a/auth';

// Firestore 實例
const db = getFirebaseFirestore();

// 取得 habits collection
const habitsCollection = collection(db, 'habits');

// 取得 Firebase Auth 實例
const auth = getFirebaseAuth();

// 取得目前登入使用者 ID
export function getCurrentUserId() {
    const user = auth.currentUser;
    return user ? user.uid : null;
}

export async function getHabits(userId) {
    const q = query(habitsCollection, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    const habits = [];
    snapshot.forEach(doc => {
        habits.push({ id: doc.id, ...doc.data() });
    });
    return habits;
}

export async function getHabitById(id) {
    const docRef = doc(habitsCollection, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    } else {
        return null;
    }
}

export async function addHabit(habit) {
    // habit 是一個物件，包含 userId, name, records 等欄位
    const docRef = doc(habitsCollection);  // 自動產生 ID
    await setDoc(docRef, habit);
    return docRef.id;
}

export async function updateHabit(id, updateData) {
    const docRef = doc(habitsCollection, id);
    await updateDoc(docRef, updateData);
}

export async function deleteHabit(id) {
    const docRef = doc(habitsCollection, id);
    await deleteDoc(docRef);
}

// ReminderSettings

// 取得提醒時間設定
export async function getReminderSettings(userId) {
    const docRef = doc(db, 'reminderSettings', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data().reminderTimes || [];
    } else {
        return [];
    }
}

// 儲存提醒時間設定（新增或更新）
export async function saveReminderSettings(userId, reminderTimes) {
    const docRef = doc(db, 'reminderSettings', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        await updateDoc(docRef, { reminderTimes });
    } else {
        await setDoc(docRef, { reminderTimes });
    }
}