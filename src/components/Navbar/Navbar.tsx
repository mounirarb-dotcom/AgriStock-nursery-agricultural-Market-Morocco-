import React from 'react';
import { Menu, X } from 'lucide-react';
import { AppLogo } from '../AppLogo';
import { useNavbarLogic } from './useNavbarLogic';
import { NavbarDesktopTabs } from './NavbarDesktopTabs';
import { NavbarRoleSelector } from './NavbarRoleSelector';
import { NavbarToolbar } from './NavbarToolbar';
import { NavbarMobileMenu } from './NavbarMobileMenu';
import { NavbarContextualSubBar } from './NavbarContextualSubBar';
import { NavbarSettingsModal } from './NavbarSettingsModal';

export const Navbar: React.FC = () => {
  const {
    language,
    setLanguage,
    activeTab,
    setActiveTab,
    userProfile,
    setUserRole,
    isSuperAdmin,
    isSessionUnlocked,
    lockSession,
    setIsStockAuthModalOpen,
    setStockAuthModalMode,
    escrowTransactions,
    isEscrowListModalOpen,
    setIsEscrowListModalOpen,
    buyerActiveSubTab,
    setBuyerActiveSubTab,
    setIsProModalOpen,
    openLogisticsModal,
    setIsDiscussionsListModalOpen,
    totalUnreadDiscussionsCount,
    discussions,
    platformPaymentProtected,
    togglePlatformPaymentProtection,
    setIsOfficialComplianceModalOpen,
    setIsBenchmarkModalOpen,
    openUserManual,
    openExportManifestModal,
    isAdminAuthenticated,
    setIsAdminLoginModalOpen,
    adminSession,
    openNotificationSettings,
    unreadNotificationsCount,
    setIsRegistrationModalOpen,
    setIsLoginModalOpen,
    setIsProfileModalOpen,
    resetToSampleData,
    openExcelStockModal,
    openFieldQRScannerModal,
    openAudioSearchModal,
    tabs,
    showSettingsModal,
    setShowSettingsModal,
    mobileMenuOpen,
    setMobileMenuOpen,
    roleDropdownOpen,
    setRoleDropdownOpen,
    toolsDropdownOpen,
    setToolsDropdownOpen,
    importStatus,
    handleExport,
    handleImportFile,
  } = useNavbarLogic();

  return (
    <>
      <header className="bg-[#0b1f14] border-b border-[#1b3d2c] sticky top-0 z-40 text-stone-100 shadow-md">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* Gauche : Logo + Bouton Mobile Menu */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-[#162f23] hover:bg-[#1d3d2e] border border-emerald-500/30 text-stone-200 transition cursor-pointer"
                aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Menu principal & Services B2B'}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-emerald-300" />
                ) : (
                  <Menu className="w-5 h-5 text-emerald-300" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className="flex items-center gap-2 cursor-pointer group focus:outline-hidden"
              >
                <AppLogo />
              </button>
            </div>

            {/* Centre : Onglets Principaux Desktop (useMemo mémorisé) */}
            <NavbarDesktopTabs tabs={tabs} />

            {/* Droite : Sélecteur de Rôle + Barre d'outils B2B & Profil */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <NavbarRoleSelector
                userProfile={userProfile}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                setUserRole={setUserRole}
                roleDropdownOpen={roleDropdownOpen}
                setRoleDropdownOpen={setRoleDropdownOpen}
                setIsProfileModalOpen={setIsProfileModalOpen}
                language={language}
              />

              <NavbarToolbar
                language={language}
                setLanguage={setLanguage}
                userProfile={userProfile}
                unreadNotificationsCount={unreadNotificationsCount}
                openNotificationSettings={openNotificationSettings}
                openFieldQRScannerModal={openFieldQRScannerModal}
                openAudioSearchModal={openAudioSearchModal}
                setIsDiscussionsListModalOpen={setIsDiscussionsListModalOpen}
                totalUnreadDiscussionsCount={totalUnreadDiscussionsCount}
                discussionsCount={discussions?.length || 0}
                toolsDropdownOpen={toolsDropdownOpen}
                setToolsDropdownOpen={setToolsDropdownOpen}
                setIsProfileModalOpen={setIsProfileModalOpen}
                setIsLoginModalOpen={setIsLoginModalOpen}
                setIsRegistrationModalOpen={setIsRegistrationModalOpen}
                isAdminAuthenticated={isAdminAuthenticated}
                setActiveTab={setActiveTab}
                setIsAdminLoginModalOpen={setIsAdminLoginModalOpen}
                openLogisticsModal={openLogisticsModal}
                setIsEscrowListModalOpen={setIsEscrowListModalOpen}
                escrowTransactions={escrowTransactions}
                openExportManifestModal={openExportManifestModal}
                openExcelStockModal={openExcelStockModal}
                openUserManual={openUserManual}
                setIsOfficialComplianceModalOpen={setIsOfficialComplianceModalOpen}
                setIsProModalOpen={setIsProModalOpen}
                setShowSettingsModal={setShowSettingsModal}
                platformPaymentProtected={platformPaymentProtected}
                togglePlatformPaymentProtection={togglePlatformPaymentProtection}
                isSessionUnlocked={isSessionUnlocked}
                lockSession={lockSession}
                setStockAuthModalMode={setStockAuthModalMode}
                setIsStockAuthModalOpen={setIsStockAuthModalOpen}
              />
            </div>
          </div>
        </div>

        {/* Menu Mobile Déroulant Extrait */}
        <NavbarMobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          userProfile={userProfile}
          language={language}
          setLanguage={setLanguage}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setUserRole={setUserRole}
          tabs={tabs}
          setIsProfileModalOpen={setIsProfileModalOpen}
          setIsRegistrationModalOpen={setIsRegistrationModalOpen}
          openAudioSearchModal={openAudioSearchModal}
          setIsLoginModalOpen={setIsLoginModalOpen}
          openFieldQRScannerModal={openFieldQRScannerModal}
          isSessionUnlocked={isSessionUnlocked}
          lockSession={lockSession}
          setStockAuthModalMode={setStockAuthModalMode}
          setIsStockAuthModalOpen={setIsStockAuthModalOpen}
          setIsEscrowListModalOpen={setIsEscrowListModalOpen}
          escrowTransactions={escrowTransactions}
          openLogisticsModal={openLogisticsModal}
          setIsProModalOpen={setIsProModalOpen}
          platformPaymentProtected={platformPaymentProtected}
          togglePlatformPaymentProtection={togglePlatformPaymentProtection}
          openNotificationSettings={openNotificationSettings}
          unreadNotificationsCount={unreadNotificationsCount}
          totalUnreadDiscussionsCount={totalUnreadDiscussionsCount}
          openExportManifestModal={openExportManifestModal}
          setIsOfficialComplianceModalOpen={setIsOfficialComplianceModalOpen}
          setIsBenchmarkModalOpen={setIsBenchmarkModalOpen}
          openUserManual={openUserManual}
          openExcelStockModal={openExcelStockModal}
          setShowSettingsModal={setShowSettingsModal}
          isAdminAuthenticated={isAdminAuthenticated}
          setIsAdminLoginModalOpen={setIsAdminLoginModalOpen}
          adminSession={adminSession}
        />

        {/* Sous-barre contextuelle & Fil d'Ariane (Breadcrumbs) */}
        <NavbarContextualSubBar
          userProfile={userProfile}
          language={language}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          buyerActiveSubTab={buyerActiveSubTab}
          setBuyerActiveSubTab={setBuyerActiveSubTab}
          isEscrowListModalOpen={isEscrowListModalOpen}
          setIsEscrowListModalOpen={setIsEscrowListModalOpen}
          setIsOfficialComplianceModalOpen={setIsOfficialComplianceModalOpen}
        />
      </header>

      {/* Modal Sauvegarde & Données JSON */}
      <NavbarSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        language={language}
        importStatus={importStatus}
        openExcelStockModal={openExcelStockModal}
        openUserManual={openUserManual}
        isSuperAdmin={isSuperAdmin}
        handleExport={handleExport}
        handleImportFile={handleImportFile}
        resetToSampleData={resetToSampleData}
      />
    </>
  );
};
