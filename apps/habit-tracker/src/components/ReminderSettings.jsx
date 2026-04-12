import React, { useEffect, useState } from "react";
import { getReminderSettings, saveReminderSettings } from "../utils/firebaseDb";
import { auth } from "../utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useDailyNotification } from "../hooks/useDailyNotification"; // ✅ 匯入 hook

function ReminderSettings() {
  const [userId, setUserId] = useState(null);
  const [reminderTimes, setReminderTimes] = useState([]);
  const [newTime, setNewTime] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const times = await getReminderSettings(user.uid);
        setReminderTimes(times);
      } else {
        setUserId(null);
        setReminderTimes([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ 套用推播與音效 hook
  useDailyNotification(reminderTimes);

  const addTime = async () => {
    if (!newTime) return;
    if (reminderTimes.includes(newTime)) {
      alert("時間已存在");
      return;
    }

    const updatedTimes = [...reminderTimes, newTime].sort();
    setReminderTimes(updatedTimes);
    setNewTime("");

    if (userId) {
      await saveReminderSettings(userId, updatedTimes);
    }
  };

  const removeTime = async (time) => {
    const updatedTimes = reminderTimes.filter((t) => t !== time);
    setReminderTimes(updatedTimes);

    if (userId) {
      await saveReminderSettings(userId, updatedTimes);
    }
  };

  if (loading) return <div>載入中...</div>;
  if (!userId) return <div>請先登入才能設定提醒時間</div>;

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <h2>提醒時間設定</h2>

      <div style={{ marginBottom: 10 }}>
        <input
          type="time"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
        />
        <button onClick={addTime} style={{ marginLeft: 10 }}>
          新增
        </button>
      </div>

      <ul>
        {reminderTimes.length === 0 && <li>尚無提醒時間</li>}
        {reminderTimes.map((time) => (
          <li key={time} style={{ marginBottom: 6 }}>
            {time}
            <button
              onClick={() => removeTime(time)}
              style={{ color: "red", marginLeft: 10 }}
            >
              刪除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReminderSettings;
