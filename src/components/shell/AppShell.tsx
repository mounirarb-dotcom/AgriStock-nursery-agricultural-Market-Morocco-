import React, { useState, useEffect } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { BottomNav } from '../BottomNav';
import { ModalHost } from './ModalHost';
import { ToastHost } from './ToastHost';
import { AgriForexLiveTicker } from '../AgriForexLiveTicker';
import { Footer } from '../Footer';
import { OfflineIndicator } from '../OfflineIndicator';

export const AppShell: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [gmpQuotaExceeded, setGmpQuotaExceeded] = useState(false);

  useEffect(() => {
    const handleQuota = () => setGmpQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F8FAF6] flex flex-col font-sans text-stone-900 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Alerte Quota Cartes si applicable */}
      {gmpQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 text-xs md:text-sm text-center sticky top-0 z-50 shadow-xs">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Barre Supérieure Fixe avec Logo, Recherche, Sélecteur de Rôle, Notifs & Profil */}
      <TopBar
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      {/* Conteneur Flex avec Sidebar (Desktop/Mobile) et MainContent */}
      <div className="flex-1 flex flex-row relative min-w-0">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Backdrop pour mobile lorsque la barre latérale est déployée */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Zone Principale de Contenu avec décalage réactif pour la Sidebar */}
        <div className="flex-1 min-w-0 lg:pl-64 flex flex-col transition-all duration-200">
          <MainContent />

          {/* Bandeau de Cotation Bourse & Devises */}
          <AgriForexLiveTicker />

          <Footer />
        </div>
      </div>

      <OfflineIndicator />
      <ModalHost />
      <ToastHost />
      <BottomNav />
    </div>
  );
};
