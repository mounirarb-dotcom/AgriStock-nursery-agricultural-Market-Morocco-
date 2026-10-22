import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { tr } from '../../utils/translations';
import { AppLogo } from '../AppLogo';
import { RoleSelector } from './RoleSelector';
import { VoiceSearchButton } from '../VoiceSearchButton';
import {
  Menu,
  X,
  Search,
  Bell,
  User,
  Shield,
  ShieldCheck,
  Lock,
  Unlock,
  Languages,
  HelpCircle,
} from 'lucide-react';

interface TopBarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const {
    language,
    setLanguage,
    activeTab,
    setActiveTab,
    userProfile,
    unreadNotificationsCount,
    openNotificationSettings,
    setIsProfileModalOpen,
    setIsLoginModalOpen,
    isSessionUnlocked,
    lockSession,
    setIsStockAuthModalOpen,
    setStockAuthModalMode,
  } = useApp();

  const [headerSearch, setHeaderSearch] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      setActiveTab('market');
    }
  };

  const cycleLanguage = () => {
    const order: ('fr' | 'ar' | 'en')[] = ['fr', 'ar', 'en'];
    const idx = order.indexOf(language);
    const next = order[(idx + 1) % order.length];
    setLanguage(next);
  };

  const isAuthenticated = Boolean(userProfile && userProfile.displayName);

  return (
    <header className="bg-[#0b1f14] text-white border-b border-[#1b3d2c] sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          {/* 1. Gauche : Sidebar toggle (sur Desktop/Tablet) + Logo */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 hover:text-white transition cursor-pointer"
                aria-label={isSidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              >
                {isSidebarOpen ? <X className="w-5 h-5 text-emerald-300" /> : <Menu className="w-5 h-5 text-emerald-300" />}
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2 cursor-pointer focus:outline-hidden"
              aria-label="AgriStock Maroc - Accueil"
            >
              <AppLogo />
            </button>
          </div>

          {/* 2. Centre : Recherche rapide & Vocale (Desktop / Tablette) */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder={tr(
                  language,
                  'Rechercher fruits, légumes, plants ONSSA, cheptel...',
                  'ابحث عن فواكه، خضر، شتائل، مواشي...',
                  'Search produce, nursery saplings, livestock...'
                )}
                className="w-full bg-[#152e20] border border-[#234833] focus:border-emerald-500 rounded-full pl-9 pr-12 py-1.5 text-xs sm:text-sm text-stone-100 placeholder-stone-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-400 transition"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                <VoiceSearchButton />
              </div>
            </form>
          </div>

          {/* 3. Droite : Rôle Actif + Notifs + Langue + Profil */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Sélecteur de rôle interactif */}
            <RoleSelector />

            {/* Notifications */}
            <button
              type="button"
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 hover:text-white transition cursor-pointer"
              title={tr(language, 'Centre de notifications & alertes', 'مركز التنبيهات', 'Notifications')}
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Sélecteur de Langue */}
            <button
              type="button"
              onClick={cycleLanguage}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 hover:text-white text-xs font-semibold uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
              title="Changer de langue (FR / AR / EN)"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-300" />
              <span>{language}</span>
            </button>

            {/* Profil Utilisateur / Connexion */}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white transition cursor-pointer border border-white/10"
                aria-label="Mon profil"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {userProfile.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden xl:inline text-xs font-medium max-w-[100px] truncate">
                  {userProfile.displayName.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
              >
                {tr(language, 'Connexion', 'دخول', 'Login')}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
