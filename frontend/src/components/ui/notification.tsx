'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';

interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  onClose: () => void;
  onDontAskAgain?: () => void;
  dontAskAgainKey?: string;
}

export function Notification({ 
  type, 
  title, 
  message, 
  onClose, 
  onDontAskAgain,
  dontAskAgainKey 
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [dontAsk, setDontAsk] = useState(false);

  useEffect(() => {
    // Check if user previously chose "don't ask again"
    if (dontAskAgainKey) {
      const stored = localStorage.getItem(`dont_ask_${dontAskAgainKey}`);
      if (stored === 'true') {
        setIsVisible(false);
        onClose();
      }
    }
  }, [dontAskAgainKey, onClose]);

  const handleClose = () => {
    if (dontAsk && dontAskAgainKey) {
      localStorage.setItem(`dont_ask_${dontAskAgainKey}`, 'true');
      onDontAskAgain?.();
    }
    setIsVisible(false);
    onClose();
  };

  if (!isVisible) return null;

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md w-full animate-in slide-in-from-top-5 duration-300`}>
      <div className={`rounded-lg border p-4 shadow-lg ${bgColors[type]}`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {icons[type]}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{message}</p>
            
            {dontAskAgainKey && (
              <label className="flex items-center gap-2 mt-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dontAsk}
                  onChange={(e) => setDontAsk(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-xs text-gray-500">Don&apos;t ask again</span>
              </label>
            )}
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Notification Manager
interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  dontAskAgainKey?: string;
}

let notificationHandler: ((notification: NotificationState) => void) | null = null;

export function showNotification(notification: Omit<NotificationState, 'id'>) {
  if (notificationHandler) {
    notificationHandler({
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
    });
  }
}

export function NotificationContainer() {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  useEffect(() => {
    notificationHandler = (notification: NotificationState) => {
      setNotifications((prev) => [...prev, notification]);
    };
    return () => {
      notificationHandler = null;
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          dontAskAgainKey={notification.dontAskAgainKey}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}
