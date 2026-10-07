import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  USER_MANUAL_CHAPTERS,
  ManualSection,
  downloadUserManualFile,
} from '../data/userManualData';
import {
  BookOpen,
  Download,
  Printer,
  Search,
  X,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  FileText,
  Sparkles,
  Sprout,
  Zap,
  TrendingUp,
  Store,
  MessageSquare,
  Truck,
  Lock,
  Smartphone,
  UserCheck,
  FileDown,
  Globe,
} from 'lucide-react';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialChapterId?: string;
}

export const UserManualModal: React.FC<UserManualModalProps> = ({
  isOpen,
  onClose,
  initialChapterId,
}) => {
  const { language } = useApp();
  const [manualLang, setManualLang] = useState<'fr' | 'ar'>(language === 'ar' ? 'ar' : 'fr');
  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    initialChapterId || USER_MANUAL_CHAPTERS[0].id
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialChapterId) {
      setSelectedChapterId(initialChapterId);
    }
  }, [isOpen, initialChapterId]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const isAr = manualLang === 'ar';

  // Filter chapters based on search query
  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return USER_MANUAL_CHAPTERS;
    const q = searchQuery.toLowerCase().trim();
    return USER_MANUAL_CHAPTERS.filter(ch => {
      const matchTitle = isAr
        ? ch.titleAr.toLowerCase().includes(q)
        : ch.title.toLowerCase().includes(q);
      const matchSummary = isAr
        ? ch.summaryAr.toLowerCase().includes(q)
        : ch.summary.toLowerCase().includes(q);
      const matchSteps = ch.steps.some(st =>
        (isAr ? st.titleAr + st.descAr : st.title + st.desc).toLowerCase().includes(q)
      );
      return matchTitle || matchSummary || matchSteps;
    });
  }, [searchQuery, isAr]);

  const activeChapter: ManualSection = useMemo(() => {
    const found = USER_MANUAL_CHAPTERS.find(c => c.id === selectedChapterId);
    if (found) return found;
    return filteredChapters[0] || USER_MANUAL_CHAPTERS[0];
  }, [selectedChapterId, filteredChapters]);

  if (!isOpen) return null;

  const handleDownloadMarkdown = () => {
    downloadUserManualFile(manualLang);
    setDownloadSuccessToast(
      isAr
        ? 'تم تحميل ملف دليل الاستعمال بنجاح بصيغة Markdown/Text !'
        : 'Manuel d\'utilisation téléchargé avec succès (.md / texte hors-ligne) !'
    );
    setTimeout(() => setDownloadSuccessToast(null), 4000);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  // Helper icon mapper
  const renderIcon = (name: string, className: string = 'w-4 h-4') => {
    switch (name) {
      case 'UserCheck':
        return <UserCheck className={className} />;
      case 'Sprout':
        return <Sprout className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'TrendingUp':
        return <TrendingUp className={className} />;
      case 'Store':
        return <Store className={className} />;
      case 'ShieldCheck':
        return <ShieldCheck className={className} />;
      case 'MessageSquare':
        return <MessageSquare className={className} />;
      case 'Truck':
        return <Truck className={className} />;
      case 'Lock':
        return <Lock className={className} />;
      case 'Smartphone':
        return <Smartphone className={className} />;
      case 'Globe':
        return <Globe className={className} />;
      default:
        return <FileText className={className} />;
    }
  };

  return (
    <div
      id="user-manual-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/75 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-5xl bg-[#FCFDF9] rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0e2118] text-stone-100 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#1b3b2c] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/80 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0 shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {isAr ? 'دليل الاستعمال الرسمي للمنصة' : 'Manuel d\'Utilisation Officiel AgriMaroc'}
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-800/80 text-emerald-200 border border-emerald-500/30">
                  v2.6 🇲🇦
                </span>
              </div>
              <p className="text-xs text-stone-300 line-clamp-1">
                {isAr
                  ? 'دليل مهني شامل للمشاتل المعتمدة، الخضر والفواكه والمعاملات المحمية'
                  : 'Guide pratique certifié ONSSA, gestion des stocks, cotations & paiements sous séquestre'}
              </p>
            </div>
          </div>

          {/* Action Bar: Language toggle, Downloads & Close */}
          <div className="flex items-center gap-2">
            {/* Language switch */}
            <div className="flex items-center bg-[#081810] rounded-xl p-0.5 border border-[#1b3d2c] text-xs">
              <button
                type="button"
                onClick={() => setManualLang('fr')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                  manualLang === 'fr'
                    ? 'bg-emerald-700 text-white'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Français
              </button>
              <button
                type="button"
                onClick={() => setManualLang('ar')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition cursor-pointer ${
                  manualLang === 'ar'
                    ? 'bg-emerald-700 text-white'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                العربية
              </button>
            </div>

            {/* Télécharger Markdown / Text */}
            <button
              id="btn-manual-download-md"
              type="button"
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer"
              title="Télécharger le manuel complet en fichier texte Markdown pour lecture hors-ligne"
            >
              <FileDown className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isAr ? 'تحميل كملف (.md)' : 'Télécharger (.md)'}
              </span>
            </button>

            {/* Imprimer / PDF */}
            <button
              id="btn-manual-print-pdf"
              type="button"
              onClick={handlePrintPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 text-xs font-semibold border border-stone-700 transition active:scale-95 cursor-pointer"
              title="Imprimer ou enregistrer en PDF au format A4 officiel"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">
                {isAr ? 'طباعة / PDF' : 'Imprimer / PDF'}
              </span>
            </button>

            {/* Close button */}
            <button
              id="btn-manual-close"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-[#162f23] transition cursor-pointer"
              aria-label="Fermer le manuel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast feedback */}
        {downloadSuccessToast && (
          <div className="bg-emerald-100 border-b border-emerald-300 text-emerald-900 px-4 py-2 text-xs font-semibold flex items-center justify-between shrink-0 animate-fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              {downloadSuccessToast}
            </span>
            <button
              onClick={() => setDownloadSuccessToast(null)}
              className="text-emerald-700 hover:text-emerald-900"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Sub-toolbar: Search & Chapter Count */}
        <div className="px-4 sm:px-6 py-2.5 bg-stone-100/90 border-b border-stone-200 flex items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={
                isAr
                  ? 'ابحث في الدليل (أونسا، سيكرو، D3، شاحنات، أسعار...)'
                  : 'Rechercher dans le manuel (ONSSA, séquestre, D3, QR code, transport...)'
              }
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-600">
            <span className="font-semibold text-stone-800">
              {filteredChapters.length} / {USER_MANUAL_CHAPTERS.length}
            </span>
            <span className="hidden sm:inline">
              {isAr ? 'أقسام إرشادية' : 'chapitres disponibles'}
            </span>
          </div>
        </div>

        {/* Body Layout: Sidebar navigation + Main Chapter Details */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Chapter Navigation Sidebar */}
          <div className="w-full md:w-72 lg:w-80 bg-white border-b md:border-b-0 md:border-r border-stone-200 overflow-y-auto shrink-0 p-2 sm:p-3 space-y-1 max-h-44 md:max-h-none">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-600 px-2 py-1">
              {isAr ? 'فهرس المحتويات' : 'Sommaire des Chapitres'}
            </div>
            {filteredChapters.map((ch, idx) => {
              const isSelected = ch.id === activeChapter.id;
              return (
                <button
                  key={ch.id}
                  id={`btn-manual-tab-${ch.id}`}
                  type="button"
                  onClick={() => setSelectedChapterId(ch.id)}
                  className={`w-full text-left flex items-start gap-2.5 p-2.5 rounded-xl text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-300/80 shadow-xs'
                      : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900 border border-transparent'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {renderIcon(ch.iconName, 'w-3.5 h-3.5')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-semibold text-stone-600 uppercase tracking-wide">
                        {isAr ? ch.badgeAr : ch.badge}
                      </span>
                      <span className="text-[10px] font-mono text-stone-500">
                        0{idx + 1}
                      </span>
                    </div>
                    <div className="font-semibold truncate text-stone-900">
                      {isAr ? ch.titleAr : ch.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Main Active Chapter Content Area */}
          <div
            id="printable-user-manual-content"
            className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-stone-50/50"
          >
            {/* Active Chapter Header */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {isAr ? activeChapter.badgeAr : activeChapter.badge}
                </span>
                <span className="text-xs text-stone-600 font-medium">
                  {isAr ? 'منصة أجري ماروك الرسمية' : 'Documentation Système AgriMaroc 2026'}
                </span>
              </div>

              <h1 className="text-lg sm:text-xl font-black text-stone-900">
                {isAr ? activeChapter.titleAr : activeChapter.title}
              </h1>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                {isAr ? activeChapter.summaryAr : activeChapter.summary}
              </p>
            </div>

            {/* Step-by-Step Procedure */}
            <div className="space-y-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-stone-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                {isAr ? 'الخطوات والإجراءات الميدانية' : 'Procédure Opérationnelle Étape par Étape'}
              </h3>

              <div className="space-y-3">
                {activeChapter.steps.map((st, sIdx) => (
                  <div
                    key={sIdx}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-300 transition space-y-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-xs flex items-center justify-center shrink-0">
                        {sIdx + 1}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-stone-900">
                        {isAr ? st.titleAr : st.title}
                      </h4>
                    </div>

                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed pl-9">
                      {isAr ? st.descAr : st.desc}
                    </p>

                    {(st.tip || st.tipAr) && (
                      <div className="ml-9 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">
                            {isAr ? 'توصية الخبراء : ' : 'Conseil Pro : '}
                          </span>
                          {isAr ? st.tipAr : st.tip}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Key Benefits Grid */}
            <div className="bg-emerald-950 text-white p-5 sm:p-6 rounded-2xl border border-emerald-800 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {isAr ? 'الفوائد الميدانية للمهنيين' : 'Avantages Clés pour votre Exploitation'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {(isAr ? activeChapter.keyBenefitsAr : activeChapter.keyBenefits).map((b, bIdx) => (
                  <div
                    key={bIdx}
                    className="flex items-start gap-2 bg-emerald-900/60 p-2.5 rounded-xl border border-emerald-700/50 text-xs text-stone-200"
                  >
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs if present */}
            {activeChapter.faq && activeChapter.faq.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-black uppercase tracking-wider text-stone-700 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-stone-500" />
                  {isAr ? 'الأسئلة الأكثر تداولاً' : 'Questions Fréquentes sur cette Fonction'}
                </h3>
                <div className="space-y-2">
                  {activeChapter.faq.map((f, fIdx) => (
                    <div
                      key={fIdx}
                      className="bg-white p-4 rounded-xl border border-stone-200 space-y-1.5"
                    >
                      <div className="text-xs sm:text-sm font-bold text-stone-900">
                        {isAr ? f.qAr : f.q}
                      </div>
                      <div className="text-xs text-stone-600 leading-relaxed">
                        {isAr ? f.aAr : f.a}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Export Footer within chapter */}
            <div className="p-4 rounded-2xl bg-white border border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-stone-600">
                {isAr
                  ? 'ترغب في مشاركة هذا الدليل مع عمال الضيعة أو المسؤول التجاري؟'
                  : 'Vous souhaitez imprimer ou partager ce guide avec vos équipes ?'}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadMarkdown}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5 text-emerald-700" />
                  {isAr ? 'تنزيل الدليل كاملاً (.md)' : 'Télécharger le Manuel complet'}
                </button>
                <button
                  type="button"
                  onClick={handlePrintPDF}
                  className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-400" />
                  {isAr ? 'طباعة / PDF' : 'Imprimer en PDF'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Info */}
        <div className="px-4 sm:px-6 py-3 bg-stone-100 border-t border-stone-200 flex flex-wrap items-center justify-between text-xs text-stone-600 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              {isAr
                ? 'دليل رسمي مصادق عليه — مطابقة أونسا ONSSA وتصريح CNDP n° D-W-849'
                : 'Manuel certifié conforme ONSSA & CNDP Loi 09-08 — AgriMaroc 2026'}
            </span>
          </div>
          <div className="text-[11px] text-stone-600">
            {isAr ? 'نسخة قابلة للطباعة A4 والحفظ دون اتصال' : 'Format A4 imprimable & consultation hors-ligne'}
          </div>
        </div>
      </div>
    </div>
  );
};
