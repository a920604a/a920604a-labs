// src/components/Toast.tsx
import React from "react";

interface ToastProps {
  message: string | null;
}

const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black bg-opacity-80 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out">
      {message}
    </div>
  );
};

export default Toast;
