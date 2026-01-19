'use client';

import { CheckCircle, XCircle, X } from 'lucide-react';
import { useAgentCall } from '@/lib/contexts/agent-call-context';

interface ToastNotificationProps {
  className?: string;
}

export function ToastNotification({ className = '' }: ToastNotificationProps) {
  const { state, clearToast } = useAgentCall();
  const { toast } = state;

  if (!toast) return null;

  const isSuccess = toast.type === 'success';

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-50
        flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg
        ${isSuccess ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}
        animate-in slide-in-from-right-5 duration-300
        ${className}
      `}
    >
      {isSuccess ? (
        <CheckCircle className="w-5 h-5 text-green-500" />
      ) : (
        <XCircle className="w-5 h-5 text-red-500" />
      )}
      <p className={`text-sm font-medium ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
        {toast.message}
      </p>
      <button
        onClick={clearToast}
        className={`p-1 rounded-lg transition-colors ${
          isSuccess ? 'hover:bg-green-100' : 'hover:bg-red-100'
        }`}
      >
        <X className={`w-4 h-4 ${isSuccess ? 'text-green-500' : 'text-red-500'}`} />
      </button>
    </div>
  );
}

export default ToastNotification;
