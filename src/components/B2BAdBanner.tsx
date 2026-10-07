import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ExternalLink,
  Phone,
  MessageSquare,
  ShieldCheck,
  Tag,
  Leaf,
  Droplets,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { tr } from '../utils/translations';
import { AgriB2BAd } from '../types';

interface B2BAdBannerProps {
  categoryFilter?: string;
  className?: string;
}

export const B2BAdBanner: React.FC<B2BAdBannerProps> = ({ categoryFilter, className = '' }) => {
  const { b2bAds, setIsB2BPartnerModalOpen, language, trackB2BAdClick, trackB2BAdView } = useApp();

  const filteredAds = (categoryFilter
    ? b2bAds.filter((ad) => ad.category.toLowerCase().includes(categoryFilter.toLowerCase()))
    : b2bAds
  ).filter((ad) => ad.status !== 'paused' && ad.status !== 'expired');

  const [currentIdx, setCurrentIdx] = useState(0);

  // Rotate ads every 7 seconds if multiple ads exist
  useEffect(() => {
    if (filteredAds.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % filteredAds.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [filteredAds.length]);

  const currentAd: AgriB2BAd | undefined = filteredAds[currentIdx] || filteredAds[0];

  // Track view impression
  useEffect(() => {
    if (currentAd && trackB2BAdView) {
      trackB2BAdView(currentAd.id);
    }
  }, [currentAd?.id, trackB2BAdView]);

  if (!currentAd) return null;

  const getAdIcon = (iconName: string) => {
    switch (iconName) {
      case 'Leaf':
        return <Leaf className="w-4 h-4 text-emerald-400" />;
      case 'Droplets':
        return <Droplets className="w-4 h-4 text-blue-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-amber-400" />;
      case 'FlaskConical':
        return <FlaskConical className="w-4 h-4 text-purple-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev - 1 + filteredAds.length) % filteredAds.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev + 1) % filteredAds.length);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-stone-800 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 text-white p-4 sm:p-5 shadow-lg ${className}`}
    >
      {/* Background glow accent */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left info */}
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700 flex items-center space-x-1">
              <span>{tr(language, 'Sponsorisé B2B', 'شريك فلاحي B2B', 'B2B Sponsored')}</span>
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
              {getAdIcon(currentAd.iconName)}
              <span>{currentAd.badgeText}</span>
            </span>
            {currentAd.promoCode && (
              <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                Code: {currentAd.promoCode}
              </span>
            )}
            {filteredAds.length > 1 && (
              <span className="text-[10px] text-stone-400">
                ({currentIdx + 1}/{filteredAds.length})
              </span>
            )}
          </div>

          <h4 className="text-base font-bold text-white tracking-tight">
            {currentAd.brandName} — <span className="font-normal text-stone-300">{currentAd.tagline}</span>
          </h4>

          <p className="text-xs text-stone-400 leading-relaxed">
            {currentAd.description}
          </p>
        </div>

        {/* Right CTA & Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {currentAd.websiteUrl && (
            <a
              href={currentAd.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackB2BAdClick && trackB2BAdClick(currentAd.id)}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all active:scale-95"
            >
              <span>{currentAd.ctaText || 'En savoir plus'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {currentAd.contactWhatsapp && (
            <a
              href={`https://wa.me/${currentAd.contactWhatsapp.replace(/[^0-9]/g, '')}?text=Bonjour%2C%20je%20vous%20contacte%20suite%20%C3%A0%20votre%20annonce%20sur%20AgriMaroc`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackB2BAdClick && trackB2BAdClick(currentAd.id)}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Direct</span>
            </a>
          )}

          {currentAd.contactPhone && (
            <a
              href={`tel:${currentAd.contactPhone}`}
              onClick={() => trackB2BAdClick && trackB2BAdClick(currentAd.id)}
              className="px-3.5 py-2 rounded-xl border border-stone-700 bg-stone-800/80 hover:bg-stone-700 text-stone-200 text-xs font-medium flex items-center space-x-1.5 transition-all active:scale-95"
            >
              <Phone className="w-3.5 h-3.5 text-stone-400" />
              <span>{currentAd.contactPhone}</span>
            </a>
          )}

          {filteredAds.length > 1 && (
            <div className="flex items-center gap-1 ml-1">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1.5 rounded-lg border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
                title="Précédent"
                aria-label="Annonce précédente"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="p-1.5 rounded-lg border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-300 transition"
                title="Suivant"
                aria-label="Annonce suivante"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsB2BPartnerModalOpen(true)}
            className="text-[11px] text-stone-400 hover:text-stone-200 underline underline-offset-4 ml-1"
          >
            {tr(language, 'Annonceur ? Rejoindre', 'فضاء المعلنين', 'Advertiser? Join')}
          </button>
        </div>
      </div>

      {/* Dots Indicator */}
      {filteredAds.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-3 pt-2 border-t border-stone-800/60">
          {filteredAds.map((ad, idx) => (
            <button
              key={ad.id}
              onClick={() => setCurrentIdx(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIdx ? 'w-6 bg-emerald-400' : 'w-2 bg-stone-700 hover:bg-stone-500'
              }`}
              title={ad.brandName}
              aria-label={`Voir l'annonce ${ad.brandName}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
