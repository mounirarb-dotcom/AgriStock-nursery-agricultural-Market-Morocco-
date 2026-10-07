import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/translations';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';

interface Props {
  variant?: 'nav' | 'hero' | 'banner';
}

export const PWAInstallButton: React.FC<Props> = ({ variant = 'nav' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { language } = useApp();
  const t = useTranslation(language);

  // If already installed, show a subtle active badge or hide in nav
  if (isInstalled) {
    if (variant === 'hero') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Installé sur l'appareil
        </span>
      );
    }
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'banner') {
      return (
        <button
          id="btn-install-banner"
          onClick={install}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition active:scale-95"
        >
          <Download className="w-4 h-4" />
          {t.installApp}
        </button>
      );
    }

    return (
      <button
        id="btn-install-nav"
        onClick={install}
        className="flex items-center gap-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 text-xs font-medium shadow-sm transition active:scale-95 cursor-pointer"
        title="Installer l'application sur votre appareil Android / PC"
      >
        <Smartphone className="w-3.5 h-3.5 text-emerald-200" />
        <span className="font-semibold">{t.installApp}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          id="btn-install-ios"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-emerald-600 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 text-xs font-medium hover:bg-emerald-50 transition"
        >
          <Smartphone className="w-3.5 h-3.5" />
          {t.installIOS}
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  Installer sur iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-stone-400 hover:text-stone-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-sm text-stone-600">
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <p>
                    Appuyez sur le bouton <strong>Partager</strong> (icône carrée avec flèche vers le haut) dans la barre Safari.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <p>
                    Faites défiler vers le bas et touchez <strong>Sur l'écran d'accueil</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <p>
                    Validez en touchant <strong>Ajouter</strong> en haut à droite.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback trigger if browser hasn't fired beforeinstallprompt yet or user wants guidance
  return (
    <button
      id="btn-install-info"
      onClick={() => {
        // Scroll to or switch to play store tab
        window.dispatchEvent(new CustomEvent('open-playstore-tab'));
      }}
      className="hidden sm:flex items-center gap-1.5 rounded-lg bg-emerald-800 text-white px-3 py-1.5 text-xs font-semibold hover:bg-emerald-900 transition shadow-xs"
    >
      <Smartphone className="w-3.5 h-3.5 text-emerald-300" />
      <span>Play Store & App</span>
    </button>
  );
};
