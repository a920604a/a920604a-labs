import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function useDailyNotification(reminderTimes) {
    const notifiedTimesRef = useRef(new Set());

    useEffect(() => {
        if (!reminderTimes || reminderTimes.length === 0) return;

        const checkReminder = () => {
            const now = new Date();
            const current = now.toTimeString().slice(0, 5); // "HH:mm"

            if (reminderTimes.includes(current) && !notifiedTimesRef.current.has(current)) {
                toast.info(`⏰ 現在是 ${current}，別忘了打卡或執行習慣！`, {
                    position: "top-right",
                    autoClose: 5000,
                    pauseOnHover: true,
                    closeOnClick: true,
                    draggable: true,
                    progress: undefined,
                });

                // 播放聲音
                const audioUrl = import.meta.env.BASE_URL + "sound/reminder.mp3";
                const audio = new Audio(audioUrl);
                audio.play().catch(console.error);

                notifiedTimesRef.current.add(current);
            }

            // 每天凌晨重置通知紀錄
            if (current === "00:00") {
                notifiedTimesRef.current.clear();
            }
        };

        checkReminder();

        const interval = setInterval(checkReminder, 10 * 1000);
        return () => clearInterval(interval);
    }, [reminderTimes]);
}
