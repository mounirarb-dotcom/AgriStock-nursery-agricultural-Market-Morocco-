import React from 'react';

interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'navbar' | 'mark' | 'full' | 'badge';
  className?: string;
  subtext?: string;
  onClick?: () => void;
}

export const AppLogoIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 40,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-md transition-transform hover:scale-105 ${className}`}
      aria-label="Logo AgriStock Maroc"
    >
      <defs>
        {/* Deep Moroccan Forest Green background gradient */}
        <linearGradient id="agriLogo_bg" x1="10" y1="10" x2="110" y2="110" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#064e3b" />
          <stop offset="50%" stopColor="#022c22" />
          <stop offset="100%" stopColor="#041f18" />
        </linearGradient>

        {/* Golden Sun & Soil gradient */}
        <linearGradient id="agriLogo_gold" x1="20" y1="90" x2="100" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Vibrant Left Leaf gradient */}
        <linearGradient id="agriLogo_leafLeft" x1="30" y1="55" x2="60" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Vibrant Right Leaf gradient */}
        <linearGradient id="agriLogo_leafRight" x1="90" y1="45" x2="60" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>

        {/* Star / Solar Amber Glow */}
        <linearGradient id="agriLogo_star" x1="52" y1="8" x2="68" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        {/* Border stroke highlight */}
        <linearGradient id="agriLogo_border" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.6" />
        </linearGradient>

        {/* Subtle shadow filter */}
        <filter id="agriLogo_glow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#042f2e" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Outer Squircle Container with Precision Chamfer */}
      <rect
        x="5"
        y="5"
        width="110"
        height="110"
        rx="28"
        fill="url(#agriLogo_bg)"
        stroke="url(#agriLogo_border)"
        strokeWidth="2.5"
      />

      {/* Decorative Moroccan Circular Horizon */}
      <circle
        cx="60"
        cy="60"
        r="44"
        fill="none"
        stroke="#10b981"
        strokeWidth="1.2"
        strokeOpacity="0.25"
        strokeDasharray="4 4"
      />

      {/* Moroccan Fertile Soil Furrows (Sillons agricoles dorés de la terre marocaine) */}
      <path
        d="M 28 88 Q 60 74 92 88"
        fill="none"
        stroke="url(#agriLogo_gold)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M 36 96 Q 60 85 84 96"
        fill="none"
        stroke="url(#agriLogo_gold)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeOpacity="0.75"
      />

      {/* Nursery Pot / Protective Planting Mound */}
      <path
        d="M 47 84 L 73 84 L 70 91 C 69 93 67 94 65 94 L 55 94 C 53 94 51 93 50 91 Z"
        fill="#78350f"
        stroke="#d97706"
        strokeWidth="1"
        opacity="0.85"
      />

      {/* Central Sprout Stem */}
      <path
        d="M 58 84 C 58 65 59 44 60 30 C 61 44 62 65 62 84 Z"
        fill="#86efac"
      />

      {/* Left Vigorous Leaf (Pépinière / Jeune plant) */}
      <path
        d="M 60 78 C 57 62 40 52 30 56 C 28 72 44 81 60 78 Z"
        fill="url(#agriLogo_leafLeft)"
        filter="url(#agriLogo_glow)"
      />
      {/* Left Leaf Rib */}
      <path
        d="M 60 78 C 50 72 40 65 32 58"
        fill="none"
        stroke="#a7f3d0"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Right Foliage Leaf (Arboriculture / Feuillage fructifère) */}
      <path
        d="M 60 72 C 64 54 82 42 92 46 C 94 62 77 74 60 72 Z"
        fill="url(#agriLogo_leafRight)"
        filter="url(#agriLogo_glow)"
      />
      {/* Right Leaf Rib */}
      <path
        d="M 60 72 C 70 65 80 57 88 48"
        fill="none"
        stroke="#bbf7d0"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Produce Emblem Droplets (Fruits & Légumes du Maroc : Agrumes & Olive) */}
      {/* Golden Citrus dot */}
      <circle cx="73" cy="38" r="4.5" fill="#f59e0b" stroke="#fef08a" strokeWidth="1" />
      {/* Green Olive dot */}
      <circle cx="47" cy="45" r="3.5" fill="#15803d" stroke="#86efac" strokeWidth="1" />

      {/* Moroccan 5-Point Quality Star at the Apex (Étoile Chérifienne d'Excellence & Agrément ONSSA) */}
      <polygon
        points="60,13 62.4,18.8 68.5,19.2 63.8,23.2 65.3,29.2 60,25.8 54.7,29.2 56.2,23.2 51.5,19.2 57.6,18.8"
        fill="url(#agriLogo_star)"
        stroke="#fef08a"
        strokeWidth="0.8"
        filter="url(#agriLogo_glow)"
      />
    </svg>
  );
};

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  variant = 'navbar',
  className = '',
  subtext,
  onClick,
}) => {
  const pixelSizes = {
    xs: 28,
    sm: 34,
    md: 42,
    lg: 52,
    xl: 68,
  };

  const iconPx = pixelSizes[size];

  if (variant === 'mark') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center justify-center cursor-pointer ${className}`}
      >
        <AppLogoIcon size={iconPx} />
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div
        onClick={onClick}
        className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-stone-900 border border-emerald-500/30 text-white shadow-lg ${
          onClick ? 'cursor-pointer hover:border-emerald-400/60 transition' : ''
        } ${className}`}
      >
        <AppLogoIcon size={32} />
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black tracking-tight text-white">AGRISTOCK</span>
            <span className="text-[9px] font-extrabold uppercase px-1 py-0.2 rounded bg-amber-500 text-stone-950">
              MAROC
            </span>
          </div>
          <span className="text-[9px] text-emerald-400 block font-medium -mt-0.5">
            {subtext || 'Pépinières & Marché'}
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div
        onClick={onClick}
        className={`flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left ${
          onClick ? 'cursor-pointer group' : ''
        } ${className}`}
      >
        <AppLogoIcon size={iconPx} className={onClick ? 'group-hover:scale-105 transition-transform' : ''} />
        <div>
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
              AGRI<span className="text-emerald-400">STOCK</span>
            </span>
            <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-xs">
              MAROC
            </span>
          </div>
          <p className="text-xs text-emerald-300/90 font-medium mt-0.5">
            {subtext || 'Pépinières Certifiées & Bourse Agricole des Fruits & Légumes'}
          </p>
          <p className="text-[11px] text-stone-400 font-sans dir-rtl mt-0.5">
            مشاتل وسوق الخضر والفواكه بالمغرب • معتمد ONSSA
          </p>
        </div>
      </div>
    );
  }

  // Default: 'navbar'
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group shrink-0 ${className}`}
    >
      <AppLogoIcon
        size={iconPx}
        className="group-hover:scale-105 transition-transform duration-200"
      />
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-base sm:text-lg font-black tracking-tight text-white leading-none">
            AGRI<span className="text-emerald-400">STOCK</span>
          </span>
          <span className="text-[9px] sm:text-[10px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 shadow-xs leading-none">
            MAROC
          </span>
        </div>
        <p className="text-[10px] sm:text-[11px] text-stone-300 font-medium hidden lg:block leading-tight mt-1">
          {subtext || 'Pépinières & Marché de Gros'}
        </p>
      </div>
    </div>
  );
};
