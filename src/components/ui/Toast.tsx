import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  messages: ToastMessage[];
  onRemove: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ messages, onRemove }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
      {messages.map(msg => (
        <div
          key={msg.id}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold max-w-xs text-center pointer-events-auto transition-all animate-pop ${
            msg.type === 'success'
              ? 'bg-emerald-600 text-white'
              : msg.type === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
          }`}
        >
          {msg.type === 'success' && <CheckCircle className="w-4 h-4 flex-none" />}
          {msg.type === 'error' && <AlertCircle className="w-4 h-4 flex-none" />}
          {msg.type === 'info' && <Info className="w-4 h-4 flex-none" />}
          <span>{msg.message}</span>
          <button
            onClick={() => onRemove(msg.id)}
            className="ml-1 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

// Hook to use toast
export function useToast() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastType = 'info', duration = 2500) => {
    const id = `toast-${Date.now()}`;
    setMessages(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== id));
    }, duration);
  };

  const removeToast = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  return { messages, addToast, removeToast };
}
