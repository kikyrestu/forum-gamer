"use client";

export function Toast({ message, type = 'success' }) {
  return (
    <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-xl shadow-lg transform transition-all duration-500
      ${type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
      <p className="text-white">{message}</p>
    </div>
  );
} 