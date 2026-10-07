import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { tr } from '../utils/translations';
import {
  ShoppingCart,
  Sprout,
  Tractor,
  Truck,
  Shield,
  X,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

const ROLE_INFO: Record<UserRole, { label: string; icon: React.ReactNode; badgeColor: string }> = {
  buyer: {
    label: 'Acheteur / Négociant',
    icon: <ShoppingCart className="w-5 h-5 text-emerald-300" />,
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  },
  nursery: {
    label: 'Pépiniériste Agréé',
    icon: <Sprout className="w-5 h-5 text-teal-300" />,
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
  },
  seller: {
    label: 'Vendeur / Producteur',
    icon: <Tractor className="w-5 h-5 text-amber-300" />,
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
  carrier: {
    label: 'Transporteur Fret',
    icon: <Truck className="w-5 h-5 text-blue-300" />,
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  },
  admin: {
    label: 'Administrateur',
    icon: <Shield className="w-5 h-5 text-purple-300" />,
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  },
};

export const RoleSwitchToast: React.FC = () => {
  const { roleSwitchToast, dismissRoleSwitchToast, language } = useApp();

  useEffect(() => {
    if (!roleSwitchToast) return;
    const timer = setTimeout(() => {
      dismissRoleSwitchToast();
    }, 4500);
    return () => clearTimeout(timer);
  }, [roleSwitchToast, dismissRoleSwitchToast]);

  if (!roleSwitchToast) return null;

  const roleMeta = ROLE_INFO[roleSwitchToast.role] || ROLE_INFO.buyer;

  return (
    <div
      id="role-switch-toast"
      role="status"
      aria-live="polite"
      className="fixed top-5 right-4 z-50 max-w-md w-full animate-in slide-in-from-top-4 fade-in duration-300 shadow-2xl"
    >
      <div className="bg-stone-900/95 backdrop-blur-md text-white border border-emerald-500/40 rounded-2xl p-4 flex items-start gap-3.5 shadow-2xl">
        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
          {roleMeta.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border uppercase tracking-wider ${roleMeta.badgeColor}`}>
                {roleMeta.label}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {tr(language, 'Espace Actif', 'الفضاء النشط', 'Active Workspace')}
              </span>
            </div>

            <button
              id="btn-dismiss-role-switch-toast"
              type="button"
              onClick={dismissRoleSwitchToast}
              className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              title={tr(language, 'Fermer', 'إغلاق', 'Close')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-stone-200 mt-1.5 leading-relaxed font-medium">
            {roleSwitchToast.message}
          </p>

          <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-stone-400">
            <span>
              {tr(
                language,
                'Interface et données strictement adaptées au profil.',
                'الواجهة والبيانات متوافقة بدقة مع الحساب.',
                'UI & data strictly adapted to active profile.'
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
