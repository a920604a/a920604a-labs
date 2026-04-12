import React, { useState } from "react";

interface ReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  initialReason?: string;
}

const ReasonModal: React.FC<ReasonModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialReason = "",
}) => {
  const [reason, setReason] = useState(initialReason);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl mb-4">請輸入理由</h2>
        <textarea
          rows={4}
          className="w-full border rounded p-2 mb-4"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="輸入蓋章原因或備註..."
        />
        <div className="flex justify-end space-x-3">
          <button
            className="px-4 py-2 border rounded"
            onClick={() => {
              setReason("");
              onClose();
            }}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            disabled={reason.trim() === ""}
            onClick={() => {
              onSubmit(reason.trim());
              setReason("");
            }}
          >
            Stamp
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReasonModal;
