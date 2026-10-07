import React from 'react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import {
  ShieldCheck,
  Truck,
  Scale,
  Sparkles,
  TrendingUp,
  MapPin,
  ArrowRight,
  Store,
  Sprout,
  DollarSign,
  PhoneCall,
  UserCheck,
} from 'lucide-react';

export const HeaderLanding: React.FC = () => {
  const {
    language,
    setActiveTab,
    setIsRegistrationModalOpen,
    setIsLoginModalOpen,
    userProfile,
  } = useApp();

  return (
    <header className="w-full bg-[#0a1e14] text-white border-b border-[#18442d] text-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Badge & Proposition de valeur principale */}
        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-none py-0.5">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[11px] border border-emerald-500/30 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{tr(language, 'Bourse Agricole Directe', 'بورصة فلاحية حية', 'Live Agricultural Market')}</span>
          </span>

          <span className="hidden sm:inline-block text-stone-400">|</span>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-stone-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{tr(language, 'Séquestre CMI Garanti', 'أداء مؤمن عبر الحساب البنكي الوسيط', 'Guaranteed CMI Escrow')}</span>
          </div>

          <span className="hidden md:inline-block text-stone-400">|</span>

          <div className="hidden md:flex items-center gap-1 text-[11px] text-stone-300">
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            <span>{tr(language, 'Fret TIR Frigorifique Connecté', 'ربط فوري بالنقل المبرد TIR', 'Reefer TIR Freight Connected')}</span>
          </div>
        </div>

        {/* Liens rapides & Compte */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('wholesale')}
            className="flex items-center gap-1 text-stone-300 hover:text-white transition font-medium text-[11px] cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>{tr(language, 'Cours du Jour', 'أسعار اليوم', 'Daily Market Prices')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('market')}
            className="flex items-center gap-1 text-stone-300 hover:text-white transition font-medium text-[11px] cursor-pointer"
          >
            <Store className="w-3.5 h-3.5 text-amber-400" />
            <span>{tr(language, 'Bourse Récoltes', 'سوق المحاصيل', 'Produce Market')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('nursery')}
            className="flex items-center gap-1 text-stone-300 hover:text-white transition font-medium text-[11px] cursor-pointer"
          >
            <Sprout className="w-3.5 h-3.5 text-emerald-400" />
            <span>{tr(language, 'Pépinières ONSSA', 'مشاتل معتمدة', 'Nursery Stocks')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
