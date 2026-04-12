import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import {
    getHabits,
    addHabit,
    updateHabit,
    deleteHabit // 假設你有刪除習慣的 API
} from '../utils/firebaseDb';
import { auth } from '../utils/firebase';
import {
    checkConsecutiveDays,
    checkWeeklyCount
} from '../utils/achievementUtils';

export function useDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [userId, setUserId] = useState(null);
    const [habits, setHabits] = useState([]);
    const [newHabit, setNewHabit] = useState('');
    const [selectedHabitId, setSelectedHabitId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [loadingUser, setLoadingUser] = useState(true);
    const [selectedColor, setSelectedColor] = useState('#3182CE');

    const [achievement, setAchievement] = useState(null);
    const [showBadge, setShowBadge] = useState(false);

    const formatDateLocal = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const isFutureDate = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date > today;
    };

    const evaluateAchievements = (habit) => {
        const count = habit.records.length;

        if (checkConsecutiveDays(habit.records, 14)) {
            setAchievement('連續 14 天打卡！你真的太猛了！🏅');
            setShowBadge(true);
        } else if (checkConsecutiveDays(habit.records, 7)) {
            setAchievement('連續 7 天打卡達成一週不間斷！🎯');
            setShowBadge(true);
        } else if (checkConsecutiveDays(habit.records, 5)) {
            setAchievement('連續 5 天打卡成功！連續力就是你的超能力 💪');
            setShowBadge(true);
        } else if (checkWeeklyCount(habit.records, 14)) {
            setAchievement('一週內打卡 14 次！太強了吧，有在睡覺嗎？😆');
            setShowBadge(true);
        } else if (checkWeeklyCount(habit.records, 7)) {
            setAchievement('一週內完成 7 次打卡！你是時間管理大師！⏰');
            setShowBadge(true);
        } else if (checkWeeklyCount(habit.records, 5)) {
            setAchievement('一週內完成 5 次打卡！持續前進中 🚀');
            setShowBadge(true);
        } else if (count >= 50) {
            setAchievement('50 次打卡達成！你是習慣養成大師！🏆');
            setShowBadge(true);
        } else if (count >= 25) {
            setAchievement('你已完成 25 次打卡！目標近在咫尺，繼續努力！');
            setShowBadge(true);
        } else if (count >= 1) {
            setAchievement('你已完成 1 次打卡，持之以恆是成功的開始！');
            setShowBadge(true);
        }
    };

    const checkIn = async (habitId, dateStr) => {
        if (!userId) return;
        setLoading(true);
        try {
            const habit = habits.find(h => h.id === habitId);
            if (!habit) throw new Error('找不到該習慣');
            const updatedRecords = habit.records.includes(dateStr)
                ? habit.records
                : [...habit.records, dateStr];

            await updateHabit(habitId, { records: updatedRecords });

            const updatedHabits = habits.map(h =>
                h.id === habitId ? { ...h, records: updatedRecords } : h
            );
            setHabits(updatedHabits);

            evaluateAchievements({ ...habit, records: updatedRecords });
        } catch (error) {
            console.error('打卡失敗:', error);
            alert('打卡失敗，請稍後再試');
        }
        setLoading(false);
    };

    const removeCheckIn = async (habitId, dateStr) => {
        if (!userId) return;
        setLoading(true);
        try {
            const habit = habits.find(h => h.id === habitId);
            if (!habit) return;

            const updatedRecords = habit.records.filter(r => r !== dateStr);
            await updateHabit(habitId, { records: updatedRecords });

            const updatedHabits = habits.map(h =>
                h.id === habitId ? { ...h, records: updatedRecords } : h
            );
            setHabits(updatedHabits);
        } catch (error) {
            console.error('移除打卡失敗:', error);
        }
        setLoading(false);
    };

    const addNewHabit = async () => {
        if (!newHabit.trim() || !userId) return;
        setLoading(true);
        try {
            const habitData = {
                userId,
                name: newHabit.trim(),
                records: [],
                color: selectedColor
            };
            const id = await addHabit(habitData);
            const updated = [...habits, { id, ...habitData }];
            setHabits(updated);
            setNewHabit('');
            setSelectedHabitId(id);
        } catch (error) {
            console.error('新增習慣失敗:', error);
        }
        setLoading(false);
    };

    // 新增 handleCheckIn：整合前面 checkIn 與邏輯判斷
    const handleCheckIn = (habitId) => {
        if (isFutureDate(selectedDate)) {
            alert('無法對未來日期打卡');
            return;
        }

        const habit = habits.find(h => h.id === habitId);
        const dateStr = formatDateLocal(selectedDate);

        if (habit?.records.includes(dateStr)) {
            alert('該日期已打卡，無法重複打卡');
            return;
        }

        checkIn(habitId, dateStr);
    };

    // 新增 handleHabitDeleted，並操作 Firebase
    const handleHabitDeleted = async (deletedId) => {
        if (!userId) return;
        setLoading(true);
        try {
            // 假設你有刪除習慣的 api
            await deleteHabit(deletedId);

            const newHabits = habits.filter(h => h.id !== deletedId);
            setHabits(newHabits);
            setSelectedHabitId(newHabits.length > 0 ? newHabits[0].id : null);
        } catch (error) {
            console.error('刪除習慣失敗:', error);
            alert('刪除失敗，請稍後再試');
        }
        setLoading(false);
    };

    // 登入狀態監聽
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                setUserId(null);
                navigate('/');
            }
            setLoadingUser(false);
        });
        return () => unsubscribe();
    }, [user, navigate]);

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        getHabits(userId)
            .then((data) => {
                setHabits(data);
                if (data.length > 0) setSelectedHabitId(data[0].id);
            })
            .finally(() => setLoading(false));
    }, [userId]);

    return {
        loading,
        loadingUser,
        userId,
        newHabit,
        setNewHabit,
        selectedColor,
        setSelectedColor,
        addNewHabit,
        habits,
        setHabits,
        selectedHabitId,
        setSelectedHabitId,
        selectedDate,
        setSelectedDate,
        formatDateLocal,
        isFutureDate,
        checkIn,
        removeCheckIn,
        showBadge,
        setShowBadge,
        achievement,
        handleCheckIn,
        handleHabitDeleted
    };
}
