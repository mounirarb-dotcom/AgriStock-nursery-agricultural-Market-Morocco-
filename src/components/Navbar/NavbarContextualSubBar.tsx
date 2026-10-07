import React from 'react';
import { UserProfile, AppLanguage, AppTab } from '../../types';
import { tr } from '../../utils/translations';
import { NavbarBreadcrumbs } from './NavbarBreadcrumbs';

interface NavbarContextualSubBarProps {
  userProfile: UserProfile;
  language: AppLanguage;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  buyerActiveSubTab: string;
  setBuyerActiveSubTab: (subTab: any) => void;
  isEscrowListModalOpen: boolean;
  setIsEscrowListModalOpen: (open: boolean) => void;
  setIsOfficialComplianceModalOpen: (open: boolean) => void;
}

export const NavbarContextualSubBar: React.FC<NavbarContextualSubBarProps> = ({
  userProfile,
  language,
  activeTab,
  setActiveTab,
  buyerActiveSubTab,
  setBuyerActiveSubTab,
  isEscrowListModalOpen,
  setIsEscrowListModalOpen,
  setIsOfficialComplianceModalOpen,
}) => {
  return (
    <div className="bg-[#0b1c13] border-t border-[#183627] py-1.5 px-3 sm:px-6 lg:px-8 shadow-inner">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar gap-2">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400 bg-emerald-950/70 border border-emerald-600/40 px-2 py-0.5 rounded-md">
            {userProfile.role === 'buyer' && tr(language, 'Espace Acheteur', 'فضاء المشتري', 'Buyer')}
            {userProfile.role === 'seller' && tr(language, 'Espace Vendeur', 'فضاء البائع', 'Seller')}
            {userProfile.role === 'nursery' && tr(language, 'Espace Pépinière', 'فضاء المشتل', 'Nursery')}
            {userProfile.role === 'carrier' && tr(language, 'Espace Transport', 'فضاء النقل', 'Carrier')}
            {userProfile.role === 'admin' && tr(language, 'Espace Direction Admin', 'فضاء الإدارة', 'Admin')}
          </span>

          {/* Breadcrumbs intégrés */}
          <NavbarBreadcrumbs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            language={language}
            role={userProfile.role}
          />
        </div>

        {/* Onglets contextuels spécifiques au rôle actif */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* ACHETEUR */}
          {userProfile.role === 'buyer' && (
            <>
              <button
                type="button"
                onClick={() => {
                  setBuyerActiveSubTab('price_comparison');
                  setActiveTab('buyer_space');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'buyer_space' && buyerActiveSubTab === 'price_comparison'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <span>🛍️ {tr(language, 'Mes achats', 'مشترياتي', 'My Purchases')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBuyerActiveSubTab('orders');
                  setActiveTab('buyer_space');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'buyer_space' && buyerActiveSubTab === 'orders'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <span>📦 {tr(language, 'Mes commandes', 'طلبياتي', 'My Orders')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBuyerActiveSubTab('discussions');
                  setActiveTab('buyer_space');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'buyer_space' && buyerActiveSubTab === 'discussions'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <span>💬 {tr(language, 'Négociations', 'المفاوضات', 'Negotiations')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBuyerActiveSubTab('logistics');
                  setActiveTab('buyer_space');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'buyer_space' && buyerActiveSubTab === 'logistics'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <span>🛡️ {tr(language, 'Séquestre & D3', 'الضمان البنكي', 'Escrow & D3')}</span>
              </button>
            </>
          )}

          {/* VENDEUR / PRODUCTEUR */}
          {userProfile.role === 'seller' && (
            <>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('seller_space');
                  setTimeout(() => {
                    const el = document.getElementById('seller-stocks-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'seller_space' && !isEscrowListModalOpen
                    ? 'bg-amber-600 text-white font-bold'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <span>🏷️ {tr(language, 'Mes offres', 'عروضي', 'My Offers')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('seller_space');
                  setTimeout(() => {
                    const el = document.getElementById('seller-stocks-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    const tabBtn = document.getElementById('btn-stock-tab-harvest');
                    if (tabBtn) tabBtn.click();
                  }, 100);
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 text-stone-300 hover:text-white hover:bg-stone-800/60"
              >
                <span>🌾 {tr(language, 'Mes récoltes & stocks', 'محاصيلي ومخزوني', 'My Crops & Stock')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('seller_space')}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer text-stone-300 hover:text-white hover:bg-stone-800/60"
              >
                <span>💰 {tr(language, 'Mes ventes', 'مبيعاتي', 'My Sales')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEscrowListModalOpen(true)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  isEscrowListModalOpen
                    ? 'bg-amber-600 text-white font-bold'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <span>📥 {tr(language, 'Commandes reçues', 'الطلبات الواردة', 'Orders Received')}</span>
              </button>
            </>
          )}

          {/* PÉPINIÉRISTE */}
          {userProfile.role === 'nursery' && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('nursery_space')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'nursery_space'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <span>🌿 {tr(language, 'Mes lots', 'دفعات الشتلات', 'My Lots')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('nursery_space')}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 text-stone-300 hover:text-white hover:bg-stone-800/60"
              >
                <span>📦 {tr(language, 'Mes stocks de plants', 'مخزون الشتلات', 'Plant Stocks')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOfficialComplianceModalOpen(true)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer text-stone-300 hover:text-white hover:bg-stone-800/60"
              >
                <span>🔍 {tr(language, 'Traçabilité ONSSA', 'تتبع أونسا', 'ONSSA Traceability')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOfficialComplianceModalOpen(true)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer text-stone-300 hover:text-white hover:bg-stone-800/60"
              >
                <span>📄 {tr(language, 'Passeports phytosanitaires', 'جوازات المرور', 'Phyto Passports')}</span>
              </button>
            </>
          )}

          {/* TRANSPORTEUR */}
          {userProfile.role === 'carrier' && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('carrier_space')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'carrier_space'
                    ? 'bg-sky-600 text-white font-bold'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <span>🚚 {tr(language, 'Mes missions', 'مهامي', 'My Missions')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('carrier_space')}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer text-stone-300 hover:text-white hover:bg-stone-800/60"
              >
                <span>🚛 {tr(language, 'Ma flotte', 'أسطولي', 'My Fleet')}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('carrier_space')}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer text-stone-300 hover:text-white hover:bg-stone-800/60"
              >
                <span>📦 {tr(language, 'Fret', 'الشحن', 'Freight')}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsEscrowListModalOpen(true)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  isEscrowListModalOpen
                    ? 'bg-sky-600 text-white font-bold'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <span>📍 {tr(language, 'Livraisons', 'التوصيلات', 'Deliveries')}</span>
              </button>
            </>
          )}

          {/* ADMIN */}
          {userProfile.role === 'admin' && (
            <>
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className="px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer bg-purple-700 text-white"
              >
                <span>🛡️ {tr(language, 'Supervision', 'الإشراف', 'Supervision')}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-purple-300 hover:text-white hover:bg-purple-900/40"
              >
                <span>💼 {tr(language, 'Séquestres & Transactions', 'المعاملات والضمان', 'Transactions')}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('admin')}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold text-purple-300 hover:text-white hover:bg-purple-900/40"
              >
                <span>⚖️ {tr(language, 'Commissions & Boost', 'العمولات والترويج', 'Commissions & Boost')}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
