// src/components/DailyQuote.tsx
import React, { useEffect, useState } from "react";

const quotes = [
  "離開是為了更好的開始。",
  "每一次結束都是新旅程的起點。",
  "勇敢踏出舒適圈，未來才會精彩。",
  "告別不代表放棄，而是迎接更多可能。",
  "離職，是對夢想的堅持。",
  "人生如章，蓋出屬於自己的篇章。",
  "轉身的背後，是更寬廣的天空。",
  "別忘了，勇氣就是最美的印章。",
  "新的機會，從這一刻開始。",
  "放下過去，擁抱未知。",
  // 新增離職勵志語錄
  "離職不是終點，而是追求更好生活的開始。",
  "放下不合適的，才能擁抱真正屬於你的未來。",
  "每一次離開，都是對自己負責的勇氣。",
  "離職是給自己重新出發的禮物。",
  "不怕離職，因為你擁有重新選擇的權利。",
  "離開舒適區，才有機會遇見更好的自己。",
  "離職讓你更清楚人生想要什麼。",
  "放開過去，讓未來的光芒更加閃耀。",
  "離職是成長的必經之路，迎接新挑戰。",
  "離職的勇氣，是走向夢想的第一步。",
];


const DailyQuote: React.FC = () => {
  const [dailyQuote, setDailyQuote] = useState("");

  useEffect(() => {
    const today = new Date();
    const daySeed =
      today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const index = daySeed % quotes.length;
    setDailyQuote(quotes[index]);
  }, []);

  return (
    <section className="mb-6 p-4 bg-yellow-50 rounded-md border border-yellow-300 text-yellow-800 font-semibold text-center text-lg">
      「{dailyQuote}」
    </section>
  );
};

export default DailyQuote;
