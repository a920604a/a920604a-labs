// src/components/Achievements.tsx
import React from "react";

interface Achievement {
  count: number;
  label: string;
  color: string;
}

interface AchievementsProps {
  achievements: Achievement[];
  unlocked: number[];
}

const Achievements: React.FC<AchievementsProps> = ({ achievements, unlocked }) => {
  return (
    <section className="mb-6 flex flex-wrap gap-4 justify-center">
      {achievements.map(({ count, label, color }) => (
        <div
          key={count}
          className={`p-3 rounded-lg text-white font-bold ${color} ${
            unlocked.includes(count) ? "opacity-100" : "opacity-30 grayscale"
          }`}
          title={label}
        >
          🏆 {label}
        </div>
      ))}
    </section>
  );
};

export default Achievements;
