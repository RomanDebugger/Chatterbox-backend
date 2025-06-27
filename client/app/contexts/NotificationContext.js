'use client';
import { createContext, useContext, useEffect, useState, useRef } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio('/Notification_sound.mp3');
    audioRef.current.load();
  }, []);

  const notify = ({ title, body = '', playSound = true }) => {
    const id = Date.now();

    setToasts(prev => [...prev, { id, title, body }]);

    if (playSound && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="bg-slate-800 text-white px-4 py-3 rounded-lg border border-red-700 shadow-lg"
          >
            <div className="font-bold">{toast.title}</div>
            {toast.body && <div className="text-sm">{toast.body}</div>}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext);
