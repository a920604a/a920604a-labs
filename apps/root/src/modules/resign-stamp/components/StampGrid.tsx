// src/components/StampGrid.tsx
import React, { useState } from "react";
import ReasonModal from "./ReasonModal";

export interface Stamp {
  index: number;
  reason: string;
  timestamp: number;
}

interface StampGridProps {
  stamps: Stamp[];
  maxStamps: number;
  onStampAdd: (index: number, reason: string) => void;
}

const StampGrid: React.FC<StampGridProps> = ({ stamps, maxStamps, onStampAdd }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const isStamped = (index: number) => stamps.some(s => s.index === index);

  const handleClick = (index: number) => {
    if (isStamped(index)) return; // 已蓋章不可重複
    setActiveIndex(index);
    setModalOpen(true);
  };

  const handleSubmit = (reason: string) => {
    if (activeIndex !== null) {
      onStampAdd(activeIndex, reason);
    }
    const audioUrl = import.meta.env.BASE_URL + "audio/stamp.mp3";
    const audio = new Audio(audioUrl);
    audio.play();
    
    setModalOpen(false);
    setActiveIndex(null);
  };

  return (
    <>
      <div className="grid grid-cols-10 gap-2 max-w-xl mx-auto mt-6">
        {[...Array(maxStamps)].map((_, i) => {
          const index = i + 1;
          const stamped = isStamped(index);
          return (
            <button
              key={index}
              className={`h-10 rounded border flex items-center justify-center text-sm
                ${stamped ? "bg-green-500 text-white cursor-default" : "bg-gray-200 hover:bg-gray-300"}`}
              onClick={() => handleClick(index)}
              disabled={stamped}
              title={stamped ? "Stamped" : `${index}-th stamp`}
            >
              {index}
            </button>
          );
        })}
      </div>

      <ReasonModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default StampGrid;
