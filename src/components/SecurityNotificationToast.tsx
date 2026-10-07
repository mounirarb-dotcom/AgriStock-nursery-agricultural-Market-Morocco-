import React, { useEffect, useState } from 'react';
import { Smartphone, Mail, X, Copy, Check, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export const SecurityNotificationToast: React.FC = () => {
  const { latestSecurityNotification, dismissSecurityNotification } = useAppContext();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (latestSecurityNotification) {
      setCopied(false);
    }
  }, [latestSecurityNotification]);

  if (!latestSecurityNotification) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(latestSecurityNotification.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSMS = latestSecurityNotification.channel === 'sms';

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-300">
      <div className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-md ${
        isSMS
          ? 'bg-stone-900/95 text-white border-emerald-500/50'
          : 'bg-stone-900/95 text-white border-cyan-500/50'
      }`}>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          isSMS ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
        }`}>
          {isSMS ? <Smartphone className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {isSMS ? 'SMS Reçu (Réseau MA)' : 'Email de Sécurité Reçu'}
            </span>
            <span className="text-[10px] text-stone-400">{latestSecurityNotification.timestamp}</span>
          </div>

          <p className="text-xs text-stone-200 mt-1 leading-relaxed">
            {latestSecurityNotification.message}
          </p>

          <div className="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-stone-800">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-stone-400">Code :</span>
              <span className="px-2 py-0.5 rounded-md bg-stone-800 text-white font-mono font-black text-sm tracking-widest border border-stone-700">
                {latestSecurityNotification.code}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-stone-950 text-xs font-bold transition active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Copié</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copier</span>
                </>
              )}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={dismissSecurityNotification}
          className="text-stone-400 hover:text-white p-1"
          title="Fermer la notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
