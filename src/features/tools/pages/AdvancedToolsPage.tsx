import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';
import { tr } from '../../../utils/translations';
import { WholesalePriceTicker } from '../../../components/WholesalePriceTicker';
import { Dashboard } from '../../../components/Dashboard';
import { B2BDirectoryView } from '../../../components/B2BDirectoryView';
import { GmailManager } from '../../../components/GmailManager';
import { PlayStoreView } from '../../../components/PlayStoreView';
import {
  Wrench,
  TrendingUp,
  LineChart as LineChartIcon,
  Store,
  Mail,
  Smartphone,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

export type ToolSubTab = 'wholesale' | 'trends' | 'directory' | 'gmail' | 'playstore';

export const AdvancedToolsPage: React.FC = () => {
  const {
    language,
    activeTab,
    setActiveTab,
    setIsOfficialComplianceModalOpen,
  } = useApp();

  const [currentTool, setCurrentTool] = useState<ToolSubTab>(() => {
    if (activeTab === 'directory') return 'directory';
    if (activeTab === 'gmail') return 'gmail';
    if (activeTab === 'playstore') return 'playstore';
    return 'wholesale';
  });

  useEffect(() => {
    if (activeTab === 'directory') setCurrentTool('directory');
    else if (activeTab === 'gmail') setCurrentTool('gmail');
    else if (activeTab === 'playstore') setCurrentTool('playstore');
    else if (activeTab === 'wholesale') setCurrentTool('wholesale');
  }, [activeTab]);

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-6 space-y-6 animate-in fade-in duration-200 pb-20 md:pb-8">
      {/* Navigation retour & En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-xs">
        <div>
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-stone-900 transition mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{tr(language, 'Retour à mon tableau de bord', 'العودة للوحة القيادة', 'Back to Dashboard')}</span>
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-bold border border-stone-200 mb-1">
            <Wrench className="w-3.5 h-3.5 text-emerald-700" />
            <span>SERVICES COMPLÉMENTAIRES & OUTILS AVANCÉS</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {tr(language, 'Centre d’Outils & Utilitaires', 'مركز الأدوات والخدمات المتقدمة', 'Tools & Advanced Services')}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {tr(
              language,
              'Accédez aux mercuriales de gros, à l’annuaire des coopératives, à l’intégration Gmail et à l’application mobile.',
              'الاطلاع على أسعار الجملة، دليل التعاونيات، بريد جيميل وتطبيق أندرويد.',
              'Access wholesale tickers, B2B directory, Gmail sync, and Android app setup.'
            )}
          </p>
        </div>

        {/* Badges de Réassurance */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Réseau National Interconnecté</span>
          </span>
        </div>
      </div>

      {/* Onglets secondaires de navigation des outils */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-stone-200 scrollbar-none text-xs">
        <button
          type="button"
          onClick={() => setCurrentTool('wholesale')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
            currentTool === 'wholesale'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{tr(language, 'Cours du Jour & Mercuriale', 'بورصة أسعار الجملة', 'Daily Market Prices')}</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTool('trends')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
            currentTool === 'trends'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
          }`}
        >
          <LineChartIcon className="w-4 h-4" />
          <span>{tr(language, 'Graphiques & Tendances (Recharts)', 'رسوم بيانية ومؤشرات', 'Charts & Price Trends')}</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTool('directory')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
            currentTool === 'directory'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>{tr(language, 'Annuaire B2B Professionnel', 'دليل المهنيين والتعاونيات', 'B2B Directory')}</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTool('gmail')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
            currentTool === 'gmail'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>{tr(language, 'Messagerie Gmail Pro', 'بريد جيميل المهني', 'Gmail Pro Sync')}</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentTool('playstore')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
            currentTool === 'playstore'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>{tr(language, 'Application Mobile Android', 'تطبيق الهاتف أندرويد', 'Android Mobile App')}</span>
        </button>
      </div>

      {/* Contenu de l'outil sélectionné */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-4 sm:p-6 overflow-hidden">
        {currentTool === 'wholesale' && <WholesalePriceTicker />}
        {currentTool === 'trends' && <Dashboard />}
        {currentTool === 'directory' && (
          <B2BDirectoryView onOpenComplianceModal={() => setIsOfficialComplianceModalOpen(true)} />
        )}
        {currentTool === 'gmail' && <GmailManager />}
        {currentTool === 'playstore' && <PlayStoreView />}
      </div>
    </div>
  );
};
