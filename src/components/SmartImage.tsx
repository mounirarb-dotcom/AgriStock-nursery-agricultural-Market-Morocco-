import React, { useState } from 'react';
import { sanitizeUrl } from '../utils/securityUtils';
import {
  Sprout,
  Apple,
  Salad,
  Tractor,
  Trees,
  Wheat,
  Flower2,
  Package,
} from 'lucide-react';

interface SmartImageProps {
  src?: string;
  alt: string;
  className?: string;
  category?: string;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  category = '',
}) => {
  const [hasError, setHasError] = useState(false);

  // Category-specific visual theme
  const getCategoryFallback = () => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('fruit') || cat.includes('agrum') || cat.includes('arbori')) {
      return {
        bg: 'from-amber-800/80 via-amber-900 to-stone-900',
        textColor: 'text-amber-300',
        icon: <Apple className="w-10 h-10 text-amber-400/80" />,
        label: 'Fruits & Vergers',
      };
    }
    if (cat.includes('légum') || cat.includes('maraîch') || cat.includes('tomate')) {
      return {
        bg: 'from-emerald-800/80 via-emerald-950 to-stone-900',
        textColor: 'text-emerald-300',
        icon: <Salad className="w-10 h-10 text-emerald-400/80" />,
        label: 'Maraîchage & Légumes',
      };
    }
    if (cat.includes('ornement') || cat.includes('fleur') || cat.includes('palmier')) {
      return {
        bg: 'from-purple-900/80 via-purple-950 to-stone-900',
        textColor: 'text-purple-300',
        icon: <Flower2 className="w-10 h-10 text-purple-400/80" />,
        label: 'Plantes Ornementales',
      };
    }
    if (cat.includes('machin') || cat.includes('tracteur') || cat.includes('équip')) {
      return {
        bg: 'from-blue-900/80 via-slate-900 to-stone-950',
        textColor: 'text-blue-300',
        icon: <Tractor className="w-10 h-10 text-blue-400/80" />,
        label: 'Machinisme Agricole',
      };
    }
    if (cat.includes('fourrage') || cat.includes('luzerne') || cat.includes('intrant') || cat.includes('paille')) {
      return {
        bg: 'from-yellow-900/80 via-amber-950 to-stone-950',
        textColor: 'text-yellow-300',
        icon: <Wheat className="w-10 h-10 text-yellow-400/80" />,
        label: 'Fourrage & Intrants',
      };
    }
    if (cat.includes('élev') || cat.includes('bétail') || cat.includes('mouton') || cat.includes('bovin')) {
      return {
        bg: 'from-stone-800 via-stone-900 to-zinc-950',
        textColor: 'text-amber-200',
        icon: <Package className="w-10 h-10 text-amber-300/80" />,
        label: 'Élevage & Cheptel',
      };
    }
    if (cat.includes('sur pied') || cat.includes('verger') || cat.includes('arbre')) {
      return {
        bg: 'from-emerald-900 via-stone-900 to-stone-950',
        textColor: 'text-emerald-300',
        icon: <Trees className="w-10 h-10 text-emerald-400/80" />,
        label: 'Vergers & Terroirs',
      };
    }
    return {
      bg: 'from-emerald-900/90 via-stone-900 to-stone-950',
      textColor: 'text-emerald-300',
      icon: <Sprout className="w-10 h-10 text-emerald-400/80" />,
      label: 'AgriStock Maroc',
    };
  };

  const fallback = getCategoryFallback();

  const safeSrc = sanitizeUrl(src);

  if (!safeSrc || hasError) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br ${fallback.bg} relative overflow-hidden select-none`}
      >
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 mb-2 shadow-inner">
            {fallback.icon}
          </div>
          <span className={`text-[11px] font-bold ${fallback.textColor} tracking-tight line-clamp-1`}>
            {alt || fallback.label}
          </span>
          <span className="text-[9px] text-stone-400 uppercase tracking-wider mt-0.5">
            {fallback.label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={safeSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
