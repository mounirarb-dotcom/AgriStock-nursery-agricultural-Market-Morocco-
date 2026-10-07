import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserIdentificationModal } from '../UserIdentificationModal';
import { RegistrationModal } from '../RegistrationModal';
import { NurserySetupModal } from '../NurserySetupModal';
import { LoginModal } from '../LoginModal';
import { UserProfileModal } from '../UserProfileModal';
import { StockSecurityModal } from '../StockSecurityModal';
import { SecurityNotificationToast } from '../SecurityNotificationToast';
import { LowStockNotificationToast } from '../LowStockNotificationToast';
import { EscrowPaymentModal } from '../EscrowPaymentModal';
import { EscrowTrackerModal } from '../EscrowTrackerModal';
import { BoostListingModal } from '../BoostListingModal';
import { ProCertificationModal } from '../ProCertificationModal';
import { LogisticsModal } from '../LogisticsModal';
import { B2BPartnerModal } from '../B2BPartnerModal';
import { OfferDiscussionModal } from '../OfferDiscussionModal';
import { DiscussionsListModal } from '../DiscussionsListModal';
import { RatingReviewModal } from '../RatingReviewModal';
import { OfficialComplianceModal } from '../OfficialComplianceModal';
import { MarketBenchmarkModal } from '../MarketBenchmarkModal';
import { UserManualModal } from '../UserManualModal';
import { ExportManifestModal } from '../ExportManifestModal';
import { NotificationSettingsModal } from '../NotificationSettingsModal';
import { MarketplaceNotificationToast } from '../MarketplaceNotificationToast';
import { RoleSwitchToast } from '../RoleSwitchToast';
import { AdminLoginModal } from '../admin/AdminLoginModal';
import { ExcelStockModal } from '../ExcelStockModal';
import { FieldQRScannerModal } from '../FieldQRScannerModal';
import { BatchQRCodeModal } from '../BatchQRCodeModal';
import { AudioSearchModal } from '../AudioSearchModal';
import { RoleOnboardingModal } from '../RoleOnboardingModal';
import { SimpleOrderModal } from '../SimpleOrderModal';
import { OfferDetailModal } from '../OfferDetailModal';
import { NurseryLot, ProduceListing } from '../../types';

export const AppModalsContainer: React.FC = () => {
  const {
    isOfficialComplianceModalOpen,
    setIsOfficialComplianceModalOpen,
    isBenchmarkModalOpen,
    setIsBenchmarkModalOpen,
    isUserManualModalOpen,
    setIsUserManualModalOpen,
    userManualInitialChapter,
    isExcelStockModalOpen,
    closeExcelStockModal,
    excelStockInitialType,
    isFieldQRScannerModalOpen,
    closeFieldQRScannerModal,
    fieldQRScannerInitialBatch,
    openEscrowPayment,
    isAudioSearchModalOpen,
    setIsAudioSearchModalOpen,
    setGlobalVoiceSearchQuery,
    setActiveTab,
  } = useApp();

  const [selectedQRItem, setSelectedQRItem] = useState<NurseryLot | ProduceListing | null>(null);

  return (
    <>
      <RoleOnboardingModal />
      <SimpleOrderModal />
      <OfferDetailModal />
      <RegistrationModal />
      <NurserySetupModal />
      <LoginModal />
      <UserProfileModal />
      <UserIdentificationModal />
      <AdminLoginModal />
      <StockSecurityModal />
      <SecurityNotificationToast />
      <LowStockNotificationToast />
      <EscrowPaymentModal />
      <EscrowTrackerModal />
      <BoostListingModal />
      <ProCertificationModal />
      <LogisticsModal />
      <B2BPartnerModal />
      <OfferDiscussionModal />
      <DiscussionsListModal />
      <RatingReviewModal />
      <OfficialComplianceModal
        isOpen={isOfficialComplianceModalOpen}
        onClose={() => setIsOfficialComplianceModalOpen(false)}
      />
      <MarketBenchmarkModal
        isOpen={isBenchmarkModalOpen}
        onClose={() => setIsBenchmarkModalOpen(false)}
      />
      <UserManualModal
        isOpen={isUserManualModalOpen}
        onClose={() => setIsUserManualModalOpen(false)}
        initialChapterId={userManualInitialChapter}
      />
      <ExportManifestModal />
      <ExcelStockModal
        isOpen={isExcelStockModalOpen}
        onClose={closeExcelStockModal}
        initialType={excelStockInitialType}
      />
      <FieldQRScannerModal
        isOpen={isFieldQRScannerModalOpen}
        onClose={closeFieldQRScannerModal}
        initialBatchNumber={fieldQRScannerInitialBatch}
        onSelectLotToOrder={(item) => {
          if ('species' in item) {
            openEscrowPayment('nursery_lot', item, Math.min(500, item.quantityAvailable));
          } else {
            openEscrowPayment('produce_listing', item, Math.min(2, item.quantityAvailable));
          }
        }}
        onOpenBatchQRModal={(item) => setSelectedQRItem(item)}
      />
      {selectedQRItem && (
        <BatchQRCodeModal
          isOpen={true}
          onClose={() => setSelectedQRItem(null)}
          lot={'species' in selectedQRItem ? (selectedQRItem as NurseryLot) : undefined}
          produceListing={'species' in selectedQRItem ? undefined : (selectedQRItem as ProduceListing)}
        />
      )}
      <NotificationSettingsModal />
      <MarketplaceNotificationToast />
      <RoleSwitchToast />
      <AudioSearchModal
        isOpen={isAudioSearchModalOpen}
        onClose={() => setIsAudioSearchModalOpen(false)}
        onApplySearch={(query, targetTab) => {
          setGlobalVoiceSearchQuery(query);
          if (targetTab) {
            setActiveTab(targetTab);
          }
        }}
      />
    </>
  );
};
