import React from 'react';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/translations';
import {
  Settings,
  Languages,
  Bell,
  Lock,
  ShieldCheck,
  BookOpen,
  Info,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    language,
    setLanguage,
    notificationSettings,
    updateNotificationSettings,
    openUserManual,
    isSessionUnlocked,
    lockSession,
  } = useApp();

  return (
    <div className="max-w-3xl mx-auto py-4 sm:py-6 px-3 sm:px-6 space-y-6 animate-in fade-in duration-200 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-bold mb-2">
          <Settings className="w-3.5 h-3.5 text-stone-600" />
          <span>PARAMÈTRES DU COMPTE</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-stone-900">
          {tr(language, 'Préférences & Sécurité', 'الإعدادات والأمان', 'Settings & Security')}
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          {tr(language, 'Personnalisez vos canaux d’alerte, la langue d’affichage et la protection de vos données.', 'تخصيص الإشعارات ولغة الواجهة وإعدادات الخصوصية والأمان.', 'Customize alerts, display language, and account security.')}
        </p>
      </div>

      {/* 1. Langue d'affichage */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
          <Languages className="w-4 h-4 text-emerald-600" />
          <span>{tr(language, 'Langue de la plateforme', 'لغة المنصة', 'Platform Language')}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          {[
            { code: 'fr' as const, label: 'Français (Défaut)' },
            { code: 'ar' as const, label: 'العربية (المغرب)' },
            { code: 'en' as const, label: 'English (UK)' },
          ].map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setLanguage(l.code)}
              className={`p-3 rounded-xl border font-bold transition cursor-pointer text-center ${
                language === l.code
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs'
                  : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Notifications & Alertes */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
          <Bell className="w-4 h-4 text-amber-600" />
          <span>{tr(language, 'Canaux d’alertes & notifications', 'قنوات التنبيه والإشعارات', 'Alert Channels')}</span>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100 cursor-pointer">
            <div>
              <span className="font-bold text-stone-900 block">Bannières Toasts instantanées</span>
              <span className="text-stone-500 text-[11px]">Afficher les baisses de prix et nouveaux lots à l’écran</span>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.inAppToastEnabled}
              onChange={(e) => updateNotificationSettings({ inAppToastEnabled: e.target.checked })}
              className="w-4 h-4 rounded-md text-emerald-600 focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100 cursor-pointer">
            <div>
              <span className="font-bold text-stone-900 block">Alertes de baisse de prix de gros</span>
              <span className="text-stone-500 text-[11px]">Notifier dès qu’une mercuriale baisse de plus de 10%</span>
            </div>
            <input
              type="checkbox"
              checked={notificationSettings.priceDropAlerts}
              onChange={(e) => updateNotificationSettings({ priceDropAlerts: e.target.checked })}
              className="w-4 h-4 rounded-md text-emerald-600 focus:ring-emerald-500"
            />
          </label>
        </div>
      </div>

      {/* 3. Sécurité & Verrouillage */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
          <Lock className="w-4 h-4 text-purple-600" />
          <span>{tr(language, 'Sécurité des transactions & Sessions', 'أمان المعاملات والجلسة', 'Security & Session')}</span>
        </div>

        <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-200 text-xs text-purple-950 flex items-center justify-between">
          <div>
            <span className="font-bold block">Protection des stocks et du paiement séquestre</span>
            <span className="text-[11px] text-purple-800">
              Statut de la session : {isSessionUnlocked ? '🟢 Déverrouillée' : '🔒 Verrouillée'}
            </span>
          </div>

          {isSessionUnlocked && (
            <button
              type="button"
              onClick={lockSession}
              className="px-3 py-1.5 rounded-lg bg-purple-700 text-white font-bold text-xs"
            >
              Verrouiller
            </button>
          )}
        </div>
      </div>

      {/* 4. Aide & Guide Utilisateur */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-stone-600" />
          <div className="text-xs">
            <span className="font-bold text-stone-900 block">Manuel d’utilisation & Démo interactive</span>
            <span className="text-stone-500">Consulter les guides sur le séquestre et les passeports ONSSA</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => openUserManual()}
          className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition cursor-pointer"
        >
          Ouvrir le guide
        </button>
      </div>
    </div>
  );
};
