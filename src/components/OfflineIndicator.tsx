import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/translations';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { language } = useApp();
  const t = useTranslation(language);

  if (isOnline) return null;

  return (
    <aside
      id="offline-indicator-banner"
      aria-label="Offline status"
      className="fixed bottom-16 sm:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600/95 backdrop-blur-md px-4 py-2.5 text-xs font-medium text-white shadow-xl border border-amber-400/30 animate-pulse"
    >
      <WifiOff className="w-4 h-4 text-white" />
      <span>{t.offlineMode}</span>
    </aside>
  );
};
