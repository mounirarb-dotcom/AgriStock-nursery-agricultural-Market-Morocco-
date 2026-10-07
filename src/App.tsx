/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomePage } from './components/HomePage';
import { LandingPage } from './components/LandingPage';
import { Footer } from './components/Footer';
import { NurseryManager } from './components/NurseryManager';
import { ProduceMarketplace } from './components/ProduceMarketplace';
import { WholesalePriceTicker } from './components/WholesalePriceTicker';
import { AgriForexLiveTicker } from './components/AgriForexLiveTicker';
import { GmailManager } from './components/GmailManager';
import { PlayStoreView } from './components/PlayStoreView';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AgriWeatherWidget } from './components/AgriWeatherWidget';
import { B2BDirectoryView } from './components/B2BDirectoryView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { SellerDashboardView } from './components/SellerDashboardView';
import { BuyerDashboardView } from './components/BuyerDashboardView';
import { NurseryDashboardView } from './components/NurseryDashboardView';
import { CarrierDashboardView } from './components/CarrierDashboardView';
import { AppModalsContainer } from './components/modals/AppModalsContainer';
import { HomeView } from './components/HomeView';
import { OrdersView } from './components/OrdersView';

function MainContent() {
  const {
    activeTab,
    setActiveTab,
    userProfile,
    setIsOfficialComplianceModalOpen,
  } = useApp();

  useEffect(() => {
    const handleOpenPlayStore = () => {
      setActiveTab('playstore');
    };
    window.addEventListener('open-playstore-tab', handleOpenPlayStore);
    return () => window.removeEventListener('open-playstore-tab', handleOpenPlayStore);
  }, [setActiveTab]);

  const isSellerOrNursery =
    userProfile.role === 'seller' ||
    userProfile.role === 'nursery' ||
    Boolean(userProfile.roles && (userProfile.roles.includes('seller') || userProfile.roles.includes('nursery')));

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#F8FAF6] flex flex-col font-sans text-stone-900 antialiased">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-24 md:pb-8 space-y-4 sm:space-y-6">
        {/* Barre météo agronomique détaillée - pour la vue landing */}
        {isSellerOrNursery && activeTab === 'landing' && (
          <AgriWeatherWidget />
        )}

        {activeTab === 'home' && <HomeView />}
        {activeTab === 'landing' && <LandingPage />}
        {activeTab === 'orders' && <OrdersView />}
        {activeTab === 'nursery' && <NurseryManager />}
        {(activeTab === 'market' || activeTab === 'farm_standing') && (
          <ProduceMarketplace initialMode={activeTab === 'farm_standing' ? 'standing' : 'harvested'} />
        )}
        {activeTab === 'wholesale' && <WholesalePriceTicker />}
        {activeTab === 'directory' && (
          <B2BDirectoryView onOpenComplianceModal={() => setIsOfficialComplianceModalOpen(true)} />
        )}
        {activeTab === 'gmail' && <GmailManager />}
        {activeTab === 'playstore' && <PlayStoreView />}
        {activeTab === 'admin' && <AdminDashboardView />}
        {activeTab === 'buyer_space' && <BuyerDashboardView />}
        {activeTab === 'seller_space' && (
          <SellerDashboardView
            onScrollToInventory={() => {
              const el = document.getElementById('seller-stocks-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}
        {activeTab === 'nursery_space' && <NurseryDashboardView />}
        {activeTab === 'carrier_space' && <CarrierDashboardView />}
        {activeTab === 'dashboard' && (
          userProfile.role === 'seller' ? (
            <SellerDashboardView
              onScrollToInventory={() => {
                const el = document.getElementById('seller-stocks-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          ) : userProfile.role === 'nursery' ? (
            <NurseryDashboardView />
          ) : userProfile.role === 'carrier' ? (
            <CarrierDashboardView />
          ) : userProfile.role === 'admin' ? (
            <AdminDashboardView />
          ) : (
            <BuyerDashboardView />
          )
        )}
      </main>

      {/* Petite barre de cotations de la Bourse - Déplacée en bas */}
      <AgriForexLiveTicker />

      <Footer />
      <OfflineIndicator />
      <AppModalsContainer />
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}


