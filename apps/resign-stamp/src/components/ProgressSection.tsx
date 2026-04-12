// src/components/ProgressSection.tsx
import React from "react";
import ProgressBar from "@ramonak/react-progress-bar";

interface ProgressSectionProps {
  progress: number;
  onExport: () => void;
}

const ProgressSection: React.FC<ProgressSectionProps> = ({ progress, onExport }) => {
  return (
    <>
      <section className="mb-8 p-4 bg-green-50 rounded-md shadow-inner">
        <ProgressBar
          completed={progress}
          maxCompleted={100}
          bgColor="#4caf50"
          height="28px"
          labelAlignment="center"
          labelColor="#fff"
          baseBgColor="#d1fae5"
          isLabelVisible={true}
          className="rounded"
        />
      </section>
      <section className="mb-10 flex justify-end">
        <button
          onClick={onExport}
          className="px-5 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow"
        >
          匯出報告
        </button>
      </section>
    </>
  );
};

export default ProgressSection;
