import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import {
  Search,
  Store,
  Sprout,
  ShieldCheck,
  TrendingUp,
  MapPin,
  ArrowRight,
  Plus,
  Tractor,
  CheckCircle2,
  Sparkles,
  Truck,
  Layers,
} from 'lucide-react';

export interface HeroSectionProps {
  onSearch?: (term: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSearch }) => {
  const {
    language,
    setActiveTab,
    produceListings,
    nurseryLots,
    farmStandingListings,
    setIsRegistrationModalOpen,
    navigateToProduceCategory,
  } = useApp();

  const [heroSearch, setHeroSearch] = useState('');

  // Statistiques réelles calculées
  const totalTonnes = produceListings
    .filter((p) => p.unit === 'Tonnes' && p.status === 'Disponible')
    .reduce((sum, p) => sum + (p.quantityAvailable || 0), 0);

  const totalPlants = nurseryLots.reduce(
    (sum, n) => sum + (n.quantityAvailable || 0),
    0
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && heroSearch.trim()) {
      onSearch(heroSearch);
    } else {
      setActiveTab('market');
    }
  };

  const quickTags = [
    { label: 'Tomates Rondes Souss', category: 'Légume' },
    { label: 'Clémentines Berkane IGP', category: 'Fruit' },
    { label: 'Dattes Mejhoul Zagora', category: 'Fruit' },
    { label: 'Olivier Picholine Certifié', category: 'Pépinière' },
    { label: 'Pommes Golden Midelt', category: 'Fruit' },
  ];

  return (
    <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#081f14] via-[#0d2d1d] to-[#06160e] text-white border border-[#1b4e34] shadow-2xl p-6 sm:p-10 lg:p-12">
      {/* Halos de lumière décoratifs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto space-y-6 sm:space-y-8 text-center">
        {/* Badge d'introduction sans pilule superflue */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/25 text-emerald-300 text-xs font-semibold backdrop-blur-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            {tr(
              language,
              'Bourse Agricole B2B & Pépinières Certifiées au Maroc',
              'البورصة الفلاحية B2B والمشاتل المعتمدة بالمغرب',
              'B2B Agricultural Exchange & Certified Nurseries in Morocco'
            )}
          </span>
        </div>

        {/* Titre d'impact */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
            {tr(
              language,
              'Achetez & Vendez vos Récoltes et Plants au Meilleur Prix',
              'بيع واشترِ محاصيلك الزراعية وشتلاتك بأفضل سعر',
              'Buy & Sell Fresh Produce and Nursery Stocks at Best Market Rates'
            )}
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-stone-200/90 max-w-2xl mx-auto font-normal leading-relaxed">
            {tr(
              language,
              'La marketplace professionnelle marocaine reliant directement exploitants, coopératives maraîchères, pépinières agréées ONSSA et grossistes avec séquestre bancaire garanti et fret connecté.',
              'المنصة المغربية المهنية التي تربط الفلاحين والتعاونيات والمشاتل المعتمدة وكبار المشترين، مع ضمان الأداء البنكي وربط فوري بشاحنات التبريد.',
              'The Moroccan B2B platform connecting growers, cooperatives, ONSSA-certified nurseries and wholesalers with secured bank escrow and refrigerated transport.'
            )}
          </p>
        </div>

        {/* Moteur de recherche intégré */}
        <form
          onSubmit={handleSearchSubmit}
          className="max-w-2xl mx-auto bg-white/95 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl flex flex-col sm:flex-row items-center gap-2"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              placeholder={tr(
                language,
                'Que cherchez-vous ? (ex: Clémentines, Tomates, Olivier...)',
                'عن ماذا تبحث؟ (مثال: حوامض، طماطم، شتلات زيتون...)',
                'What are you looking for? (e.g. Citrus, Tomatoes, Olive trees...)'
              )}
              className="w-full pl-11 pr-4 py-3 bg-transparent text-stone-900 placeholder-stone-400 text-xs sm:text-sm font-medium focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <span>{tr(language, 'Rechercher', 'بحث', 'Search')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Mots-clés fréquents */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-stone-300">
          <span className="text-stone-400 font-medium">
            {tr(language, 'Suggestions rapides :', 'مقترحات سريعة :', 'Trending searches :')}
          </span>
          {quickTags.map((tag, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (tag.category === 'Pépinière') {
                  setActiveTab('nursery');
                } else {
                  navigateToProduceCategory(tag.category);
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-stone-200 hover:text-white transition cursor-pointer border border-white/10"
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Boutons d'action principaux */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('market')}
            className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs sm:text-sm shadow-lg transition active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Store className="w-4 h-4 text-stone-950" />
            <span>{tr(language, 'Explorer la Bourse F&L', 'تصفح سوق الخضر والفواكه', 'Browse Fresh Produce')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('nursery')}
            className="px-5 py-3 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-emerald-300 font-bold text-xs sm:text-sm border border-emerald-500/40 shadow-lg transition active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Sprout className="w-4 h-4 text-emerald-400" />
            <span>{tr(language, 'Catalogue Pépinières ONSSA', 'دليل المشاتل المعتمدة', 'Nursery Stock Catalog')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('wholesale')}
            className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-stone-200 hover:text-white font-bold text-xs sm:text-sm border border-white/15 transition active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4 text-amber-400" />
            <span>{tr(language, 'Prix de Gros en Direct', 'أسعار أسواق الجملة', 'Wholesale Daily Prices')}</span>
          </button>
        </div>

        {/* Métriques clés en réassurance */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-white/10 text-left">
          <div className="p-3.5 rounded-2xl bg-black/20 border border-white/5 space-y-1">
            <span className="text-[11px] text-stone-400 font-medium block">
              {tr(language, 'Volumes Disponibles', 'الكميات المتوفرة', 'Available Produce')}
            </span>
            <div className="text-xl sm:text-2xl font-black text-white">
              {(totalTonnes || 0).toLocaleString('fr-FR')} <span className="text-xs font-bold text-emerald-400">Tonnes</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/20 border border-white/5 space-y-1">
            <span className="text-[11px] text-stone-400 font-medium block">
              {tr(language, 'Plants Certifiés ONSSA', 'شتائل معتمدة رسمياً', 'Certified Seedlings')}
            </span>
            <div className="text-xl sm:text-2xl font-black text-white">
              {(totalPlants || 0).toLocaleString('fr-FR')} <span className="text-xs font-bold text-emerald-400">Plants</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/20 border border-white/5 space-y-1">
            <span className="text-[11px] text-stone-400 font-medium block">
              {tr(language, 'Séquestre Bancaire', 'حساب بنكي وسيط', 'Secured Escrow')}
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>100% Sécurisé</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/20 border border-white/5 space-y-1">
            <span className="text-[11px] text-stone-400 font-medium block">
              {tr(language, 'Couverture Territoire', 'تغطية الجهات الفلاحية', 'Territory Coverage')}
            </span>
            <div className="text-xl sm:text-2xl font-black text-white">
              12 <span className="text-xs font-bold text-amber-400">Régions du Maroc</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
