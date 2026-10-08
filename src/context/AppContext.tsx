import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { User } from 'firebase/auth';
import {
  AppLanguage,
  AppTab,
  NurseryLot,
  NurseryOrientation,
  NurseryDetails,
  MoroccanRegion,
  ProduceListing,
  TreatmentLog,
  WholesaleMarketPrice,
  ComposeEmailInitialState,
  FarmStandingListing,
  UserRole,
  UserProfile,
  UserSecurityMethod,
  SecurityDispatchNotification,
  EscrowTransaction,
  EscrowTransactionStatus,
  BoostPackageId,
  TransportBooking,
  CargoType,
  VehicleType,
  AgriB2BAd,
  UserReview,
  OfferChatMessage,
  OfferDiscussionThread,
  SellerReputation,
  LowStockAlertConfig,
  DailySyncRecord,
  ProduceExportManifest,
  AdminSession,
  AdminAuditLog,
  PlatformSettings,
  PlatformStatus,
  ModerationStatus,
  AccountStatus,
  AdministratorAccount,
  AdminModulePermission,
  CarrierVehicle,
  TransportTripRequest,
  NotificationSettings,
  PriceDropAlertItem,
  NurseryInterestAlertItem,
  MarketplaceNotificationEvent,
} from '../types';
import { ExcelStockType } from '../services/ExcelStockService';
import {
  INITIAL_CARRIER_VEHICLES,
  INITIAL_TRANSPORT_REQUESTS,
} from '../data/carrierInitialData';
import {
  verifyAdminCredentials,
  logAdminAction,
  getAdminAuditLogs,
  loadPlatformSettings,
  savePlatformSettings,
  saveListingModeration,
  saveUserAccountStatus,
  DEFAULT_PLATFORM_SETTINGS,
  getAdministratorAccounts,
  saveAdministratorAccounts,
  saveAdminAccountAudit,
} from '../services/adminFirestore';
import { INITIAL_PLATFORM_USERS } from '../data/adminInitialData';
import {
  RegisterAccountParams,
  registerUserAccount,
  loginUserAccount,
  logoutUser,
  sendUserPasswordReset,
  updateUserProfileInFirestore,
} from '../services/authService';
import {
  sendLowStockBrowserNotification,
  sendDailySyncReminderNotification,
  requestBrowserNotificationPermission,
  getBrowserNotificationStatus,
  sendPriceDropBrowserNotification,
  sendNewNurseryLotBrowserNotification,
} from '../utils/notificationUtils';
import { calculateFinancialBreakdown } from '../utils/financialCalculations';
import { isItemOwnedByUser, markItemAsOwned } from '../utils/ownershipUtils';
import {
  INITIAL_NURSERY_LOTS,
  INITIAL_PRODUCE_LISTINGS,
  INITIAL_WHOLESALE_PRICES,
  INITIAL_FARM_STANDING_LISTINGS,
} from '../data/mockData';
import {
  BOOST_PACKAGES,
  INITIAL_B2B_ADS,
  INITIAL_ESCROW_TRANSACTIONS,
  INITIAL_TRANSPORT_BOOKINGS,
} from '../data/monetizationData';
import {
  INITIAL_USER_REVIEWS,
  INITIAL_OFFER_DISCUSSIONS,
  maskPhoneNumber,
  maskEmail,
  filterChatMessage,
} from '../data/reviewsAndDiscussionsData';
import {
  INITIAL_EXPORT_MANIFESTS,
  COMMON_MOROCCAN_PRODUCE_HS_CODES,
} from '../data/exportComplianceData';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getAccessToken,
} from '../services/googleAuth';
import { dataSyncService, SyncLog } from '../services/dataSync';

interface AppContextType {
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  nurseryLots: NurseryLot[];
  produceListings: ProduceListing[];
  farmStandingListings: FarmStandingListing[];
  wholesalePrices: WholesaleMarketPrice[];
  addNurseryLot: (lot: Omit<NurseryLot, 'id' | 'lastUpdated'>) => void;
  updateNurseryLot: (id: string, updated: Partial<NurseryLot>) => void;
  deleteNurseryLot: (id: string) => void;
  addTreatmentLog: (lotId: string, treatment: Omit<TreatmentLog, 'id'>) => void;
  adjustStockQuantity: (lotId: string, changeAvailable: number, changeReserved?: number) => void;
  addProduceListing: (listing: Omit<ProduceListing, 'id' | 'createdAt' | 'status'>) => void;
  updateProducePrice: (id: string, newPriceMAD: number) => void;
  updateProduceListing: (id: string, updated: Partial<ProduceListing>) => void;
  updateListingStatus: (id: string, status: 'Disponible' | 'Réservé' | 'Vendu') => void;
  deleteProduceListing: (id: string) => void;
  addFarmStandingListing: (listing: Omit<FarmStandingListing, 'id' | 'createdAt' | 'status'>) => void;
  updateFarmStandingListing: (id: string, updated: Partial<FarmStandingListing>) => void;
  updateFarmStandingStatus: (id: string, status: 'Disponible' | 'En négociation' | 'Vendu') => void;
  deleteFarmStandingListing: (id: string) => void;
  resetToSampleData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => boolean;
  // Import / Export en Lot & Bases de données Excel Stock
  bulkAddNurseryLots: (lots: Omit<NurseryLot, 'id' | 'lastUpdated'>[]) => number;
  bulkAddProduceListings: (listings: Omit<ProduceListing, 'id' | 'createdAt' | 'status'>[]) => number;
  bulkAddFarmStandingListings: (listings: Omit<FarmStandingListing, 'id' | 'createdAt' | 'status'>[]) => number;
  bulkAddCarrierVehicles: (vehicles: Omit<CarrierVehicle, 'id'>[]) => number;
  isExcelStockModalOpen: boolean;
  setIsExcelStockModalOpen: (open: boolean) => void;
  excelStockInitialType: ExcelStockType;
  openExcelStockModal: (initialType?: ExcelStockType) => void;
  closeExcelStockModal: () => void;
  // User Profile & Role Identification (Acheteur / Vendeur)
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  setUserRole: (role: UserRole) => void;
  isIdentificationModalOpen: boolean;
  setIsIdentificationModalOpen: (open: boolean) => void;
  // Inscription & Authentification Multi-Rôles
  isRegistrationModalOpen: boolean;
  setIsRegistrationModalOpen: (open: boolean) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  // Configuration Pépinière Dédiée (Ornementale vs Arboriculture)
  isNurserySetupModalOpen: boolean;
  setIsNurserySetupModalOpen: (open: boolean) => void;
  openNurserySetupModal: () => void;
  closeNurserySetupModal: () => void;
  // Scanner & Traçabilité QR Code Terrain (Champ-au-Marché)
  isFieldQRScannerModalOpen: boolean;
  setIsFieldQRScannerModalOpen: (open: boolean) => void;
  openFieldQRScannerModal: (initialBatchNumber?: string) => void;
  closeFieldQRScannerModal: () => void;
  fieldQRScannerInitialBatch: string;
  saveNurserySetupConfig: (config: {
    nurseryName: string;
    orientation: NurseryOrientation;
    region: MoroccanRegion;
    city: string;
    onssaApprovalNumber: string;
    hasOfficialOnssa: boolean;
    annualCapacitySaplings: number;
    infrastructures: string[];
    specialties: string[];
    ornamentalDetails?: any;
    arboricultureDetails?: any;
  }) => void;
  registerAccount: (params: RegisterAccountParams) => Promise<{ success: boolean; error?: string }>;
  loginAccount: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logoutAccount: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfileData: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  validateUserProfessionalProfile: (userId: string) => Promise<void>;
  // Account & Stock Security Protection (Mot de passe, SMS, Email)
  isSessionUnlocked: boolean;
  unlockSession: (passwordOrCode: string) => { success: boolean; error?: string };
  lockSession: () => void;
  setAccountSecurity: (params: {
    password: string;
    method: UserSecurityMethod;
    recoveryEmail?: string;
    recoveryPhone?: string;
  }) => void;
  removeAccountSecurity: (currentPassword: string) => { success: boolean; error?: string };
  sendSecurityOTP: (channel: 'sms' | 'email', target: string) => { code: string; message: string };
  latestSecurityNotification: SecurityDispatchNotification | null;
  dismissSecurityNotification: () => void;
  requestStockActionAuth: (action: () => void, actionDescription?: string) => void;
  isStockAuthModalOpen: boolean;
  setIsStockAuthModalOpen: (open: boolean) => void;
  stockAuthModalMode: 'verify_password' | 'setup_security';
  setStockAuthModalMode: (mode: 'verify_password' | 'setup_security') => void;
  pendingStockActionDescription: string | null;
  cancelPendingStockAction: () => void;
  executePendingStockAction: () => void;
  // Gmail & Google Auth integration
  googleUser: User | null;
  googleAccessToken: string | null;
  isAuthLoading: boolean;
  loginWithGoogle: () => Promise<{ user: User; accessToken: string } | null>;
  logoutFromGoogle: () => Promise<void>;
  composeState: ComposeEmailInitialState | null;
  openComposeModal: (initial?: ComposeEmailInitialState) => void;
  closeComposeModal: () => void;
  // 1. Paiement Séquestre & Commission (Escrow)
  escrowTransactions: EscrowTransaction[];
  createEscrowTransaction: (data: {
    itemType: 'nursery_lot' | 'produce' | 'farm_standing';
    itemId: string;
    itemTitle: string;
    sellerName: string;
    sellerPhone?: string;
    buyerName: string;
    buyerPhone: string;
    buyerEmail: string;
    deliveryAddress: string;
    destinationCity: string;
    quantity: number;
    unit: string;
    unitPriceMAD: number;
    subtotalAmountMAD: number;
    paymentMethod: 'carte_cmi' | 'stripe_card' | 'virement_sequestre';
    trackingCarrier?: string;
    notes?: string;
  }) => EscrowTransaction;
  updateEscrowStatus: (id: string, status: EscrowTransactionStatus, note?: string) => void;
  releaseEscrowFunds: (id: string) => void;
  openLitigation: (id: string, reason: string) => void;
  isEscrowModalOpen: boolean;
  setIsEscrowModalOpen: (open: boolean) => void;
  activeEscrowItem: {
    itemType: 'nursery_lot' | 'produce' | 'farm_standing';
    item: any;
    defaultQuantity?: number;
  } | null;
  openEscrowPayment: (
    itemType: 'nursery_lot' | 'produce' | 'farm_standing',
    item: any,
    defaultQuantity?: number
  ) => void;
  closeEscrowPayment: () => void;
  isEscrowListModalOpen: boolean;
  setIsEscrowListModalOpen: (open: boolean) => void;
  // 2. Options de visibilité (Boosts)
  boostListing: (
    type: 'nursery' | 'produce' | 'farm_standing',
    id: string,
    packageId: BoostPackageId
  ) => void;
  isBoostModalOpen: boolean;
  setIsBoostModalOpen: (open: boolean) => void;
  boostTarget: {
    type: 'nursery' | 'produce' | 'farm_standing';
    id: string;
    title: string;
    currentBoost?: string;
  } | null;
  openBoostModal: (
    type: 'nursery' | 'produce' | 'farm_standing',
    id: string,
    title: string,
    currentBoost?: string
  ) => void;
  closeBoostModal: () => void;
  // 3. Profil Pro & Certification
  isProModalOpen: boolean;
  setIsProModalOpen: (open: boolean) => void;
  upgradeToPro: (plan: 'monthly_pro' | 'annual_pro') => void;
  // Recherche Vocale & Audio
  isAudioSearchModalOpen: boolean;
  setIsAudioSearchModalOpen: (open: boolean) => void;
  openAudioSearchModal: () => void;
  globalVoiceSearchQuery: string;
  setGlobalVoiceSearchQuery: (query: string) => void;
  // 4. Transport & Fret Logistique
  transportBookings: TransportBooking[];
  createTransportBooking: (booking: Omit<TransportBooking, 'id' | 'bookingRef' | 'status' | 'bookedAt'>) => TransportBooking;
  isLogisticsModalOpen: boolean;
  setIsLogisticsModalOpen: (open: boolean) => void;
  logisticsInitialData: {
    originCity?: string;
    destinationCity?: string;
    cargoType?: CargoType;
    volumeTonnes?: number;
    itemTitle?: string;
  } | null;
  openLogisticsModal: (initialData?: {
    originCity?: string;
    destinationCity?: string;
    cargoType?: CargoType;
    volumeTonnes?: number;
    itemTitle?: string;
  }) => void;
  closeLogisticsModal: () => void;
  // 5. Publicité B2B Partenaires & Régie Pub Admin
  b2bAds: AgriB2BAd[];
  isB2BPartnerModalOpen: boolean;
  setIsB2BPartnerModalOpen: (open: boolean) => void;
  addB2BAd: (ad: Omit<AgriB2BAd, 'id'>) => AgriB2BAd;
  updateB2BAd: (id: string, updates: Partial<AgriB2BAd>) => void;
  deleteB2BAd: (id: string) => void;
  toggleB2BAdStatus: (id: string) => void;
  resetB2BAdsToDefault: () => void;
  trackB2BAdClick: (id: string) => void;
  trackB2BAdView: (id: string) => void;
  // 6. Protection des Coordonnées & Séquestre Plateforme
  platformPaymentProtected: boolean;
  setPlatformPaymentProtected: (enabled: boolean) => void;
  togglePlatformPaymentProtection: () => void;
  maskUserPhone: (phone?: string) => string;
  maskUserEmail: (email?: string) => string;
  // 7. Espace de Discussion par Offre
  discussions: Record<string, OfferDiscussionThread>;
  activeDiscussionOffer: {
    offerId: string;
    offerType: 'produce' | 'nursery' | 'farm_standing';
    offer: any;
  } | null;
  openOfferDiscussion: (
    offerId: string,
    offerType: 'produce' | 'nursery' | 'farm_standing',
    offer: any
  ) => void;
  closeOfferDiscussion: () => void;
  sendOfferMessage: (
    offerId: string,
    content: string,
    options?: {
      messageType?: 'text' | 'price_offer' | 'escrow_prompt' | 'system';
      proposedPriceMAD?: number;
      proposedQuantity?: number;
      unit?: string;
    }
  ) => void;
  acceptPriceOffer: (offerId: string, messageId: string) => void;
  isDiscussionsListModalOpen: boolean;
  setIsDiscussionsListModalOpen: (open: boolean) => void;
  totalUnreadDiscussionsCount: number;
  // 8. Système de Notation par Étoiles & Fidélisation
  reviews: UserReview[];
  addReview: (review: Omit<UserReview, 'id' | 'date'>) => void;
  getSellerReviews: (sellerName: string) => UserReview[];
  getSellerReputation: (sellerName: string) => SellerReputation;
  ratingModalTarget: {
    sellerName: string;
    offerTitle?: string;
    offerId?: string;
  } | null;
  openRatingModal: (
    sellerName: string,
    offerTitle?: string,
    offerId?: string
  ) => void;
  closeRatingModal: () => void;
  // Navigation ciblée depuis la page d'accueil
  nurseryDepartmentFilter: 'ALL' | 'ARBORICULTURE' | 'MARAICHAGE' | 'ORNEMENTALE';
  setNurseryDepartmentFilter: (dept: 'ALL' | 'ARBORICULTURE' | 'MARAICHAGE' | 'ORNEMENTALE') => void;
  produceCategoryFilter: string;
  setProduceCategoryFilter: (cat: string) => void;
  produceIntentFilter: 'ALL' | 'sell' | 'buy';
  setProduceIntentFilter: (intent: 'ALL' | 'sell' | 'buy') => void;
  navigateToNurseryDepartment: (dept: 'ALL' | 'ARBORICULTURE' | 'MARAICHAGE' | 'ORNEMENTALE') => void;
  navigateToProduceCategory: (cat: string, intent?: 'ALL' | 'sell' | 'buy') => void;
  // 10. Système d'Alerte Stock Bas (Pépinières)
  lowStockConfig: LowStockAlertConfig;
  updateDefaultLowStockThreshold: (threshold: number) => void;
  updateVarietyLowStockThreshold: (variety: string, threshold: number) => void;
  removeVarietyLowStockThreshold: (variety: string) => void;
  toggleBrowserNotifications: (enable: boolean) => Promise<{ granted: boolean; message?: string }>;
  getLotThreshold: (lot: NurseryLot) => number;
  isLotLowStock: (lot: NurseryLot) => boolean;
  lowStockLots: NurseryLot[];
  isLowStockSettingsModalOpen: boolean;
  setIsLowStockSettingsModalOpen: (open: boolean) => void;
  latestLowStockAlert: LowStockAlertToastPayload | null;
  dismissLowStockAlert: () => void;
  triggerLowStockAlert: (lot: NurseryLot, currentStock: number, threshold: number) => void;
  // 11. Statut Officiel, Cadre Légal & CNDP
  isOfficialComplianceModalOpen: boolean;
  setIsOfficialComplianceModalOpen: (open: boolean) => void;
  // 12. Comparatif de Marché & Avantages Concurrentiels
  isBenchmarkModalOpen: boolean;
  setIsBenchmarkModalOpen: (open: boolean) => void;
  // 13. Système de Rappel & Quick Sync Quotidien
  dailySyncRecord: DailySyncRecord;
  confirmAllNurseryLotsSyncedToday: () => void;
  batchUpdateNurseryLotsStock: (updates: { id: string; quantityAvailable: number }[]) => void;
  updateDailySyncSettings: (settings: Partial<DailySyncRecord>) => void;
  isQuickSyncModalOpen: boolean;
  setIsQuickSyncModalOpen: (open: boolean) => void;
  // 14. Manuel d'utilisation Téléchargeable
  isUserManualModalOpen: boolean;
  setIsUserManualModalOpen: (open: boolean) => void;
  userManualInitialChapter?: string;
  openUserManual: (chapterId?: string) => void;
  // 15. Module Manifestes d'Export Standardisés (PDF & Conformité)
  exportManifests: ProduceExportManifest[];
  isExportManifestModalOpen: boolean;
  setIsExportManifestModalOpen: (open: boolean) => void;
  activeExportManifestId: string | null;
  setActiveExportManifestId: (id: string | null) => void;
  prepopulatedListingForManifest: ProduceListing | null;
  openExportManifestModal: (manifestId?: string, prepopulateListing?: ProduceListing) => void;
  createExportManifest: (data: Omit<ProduceExportManifest, 'id' | 'manifestNumber'>) => ProduceExportManifest;
  updateExportManifest: (id: string, updates: Partial<ProduceExportManifest>) => void;
  deleteExportManifest: (id: string) => void;
  generateManifestFromListing: (listing: ProduceListing) => ProduceExportManifest;
  // 16. Espace Administrateur & Autorisations RBAC
  adminSession: AdminSession | null;
  isAdminAuthenticated: boolean;
  isAdminLoginModalOpen: boolean;
  setIsAdminLoginModalOpen: (open: boolean) => void;
  adminLogin: (email: string, passkey: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => Promise<void>;
  auditLogs: AdminAuditLog[];
  loadAuditLogs: () => Promise<void>;
  platformSettings: PlatformSettings;
  updatePlatformSettings: (settings: Partial<PlatformSettings>) => Promise<void>;
  userAccountsList: UserProfile[];
  suspendUserAccount: (userId: string, userName: string, reason: string) => Promise<void>;
  reactivateUserAccount: (userId: string, userName: string) => Promise<void>;
  updateUserRoleByAdmin: (userId: string, newRole: UserRole) => Promise<void>;
  moderateListing: (
    listingId: string,
    listingTitle: string,
    listingType: 'nursery_lot' | 'produce' | 'farm_standing',
    status: ModerationStatus,
    reason?: string
  ) => Promise<void>;
  updateTransactionCommission: (transactionId: string, newRate: number) => Promise<void>;
  updateTransportCommission: (bookingId: string, newRate: number) => Promise<void>;
  updateTransactionStatus: (transactionId: string, status: PlatformStatus, reason?: string) => Promise<void>;
  resolveDispute: (
    transactionId: string,
    ruling: 'refund_buyer' | 'pay_seller' | 'split_50_50',
    notes: string
  ) => Promise<void>;
  toggleBoostListing: (
    listingId: string,
    listingType: 'nursery_lot' | 'produce' | 'farm_standing',
    active: boolean
  ) => Promise<void>;
  // 17. Gestion des Rôles & Volets Administrateurs (Super Admin)
  administratorAccounts: AdministratorAccount[];
  createAdministratorAccount: (accountData: Omit<AdministratorAccount, 'id' | 'createdAt'>) => Promise<void>;
  updateAdministratorAccount: (account: AdministratorAccount) => Promise<void>;
  toggleAdministratorStatus: (adminId: string, reason?: string) => Promise<void>;
  deleteAdministratorAccount: (adminId: string) => Promise<void>;
  switchAdminSessionPreview: (adminId: string | null) => void;
  hasAdminPermission: (permission: AdminModulePermission) => boolean;
  isSuperAdmin: boolean;
  // Support Multi-rôles & Espaces Métiers
  switchActiveRole: (role: UserRole) => void;
  updateUserRoles: (roles: UserRole[]) => void;
  requestRoleActivation: (
    targetRole: UserRole,
    details?: {
      nurseryDetails?: any;
      carrierDetails?: any;
      sellerDetails?: any;
      buyerDetails?: any;
    }
  ) => Promise<{ success: boolean; requiresApproval: boolean; message: string }>;
  canManageNursery: boolean;
  canManageSeller: boolean;
  canManageCarrier: boolean;
  canManageAdmin: boolean;
  roleSwitchToast: { message: string; role: UserRole } | null;
  dismissRoleSwitchToast: () => void;
  // Role SubTabs & Favorites
  buyerActiveSubTab: 'orders' | 'favorites' | 'discussions' | 'logistics' | 'price_comparison' | 'reviews';
  setBuyerActiveSubTab: (tab: 'orders' | 'favorites' | 'discussions' | 'logistics' | 'price_comparison' | 'reviews') => void;
  favoriteIds: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  // Flotte & Logistique Transporteur
  carrierVehicles: CarrierVehicle[];
  addCarrierVehicle: (vehicle: Omit<CarrierVehicle, 'id'>) => void;
  updateCarrierVehicleStatus: (id: string, status: CarrierVehicle['status']) => void;
  transportTripRequests: TransportTripRequest[];
  addTransportTripRequest: (req: Omit<TransportTripRequest, 'id' | 'requestNumber' | 'createdAt' | 'status'>) => void;
  updateTransportTripStatus: (id: string, status: TransportTripRequest['status'], vehicleId?: string) => void;
  // 17. Système d'Alertes Personnalisées (Baisses de Prix & Nouveaux Stocks Pépinière)
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (newSettings: Partial<NotificationSettings>) => void;
  addPriceDropWatch: (watch: Omit<PriceDropAlertItem, 'id' | 'createdAt'>) => void;
  removePriceDropWatch: (id: string) => void;
  togglePriceDropWatch: (id: string, enabled?: boolean) => void;
  addNurseryInterestWatch: (watch: Omit<NurseryInterestAlertItem, 'id' | 'createdAt'>) => void;
  removeNurseryInterestWatch: (id: string) => void;
  toggleNurseryInterestWatch: (id: string, enabled?: boolean) => void;
  isNotificationSettingsModalOpen: boolean;
  setIsNotificationSettingsModalOpen: (open: boolean) => void;
  activeNotificationSettingsTab: 'price_drops' | 'nursery_lots' | 'channels' | 'history';
  setActiveNotificationSettingsTab: (tab: 'price_drops' | 'nursery_lots' | 'channels' | 'history') => void;
  openNotificationSettings: (tab?: 'price_drops' | 'nursery_lots' | 'channels' | 'history') => void;
  triggerSimulatedNotification: (type: 'price_drop' | 'new_nursery_lot') => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotificationHistory: () => void;
  unreadNotificationsCount: number;
  latestMarketplaceToast: MarketplaceNotificationEvent | null;
  dismissMarketplaceToast: () => void;
  // 18. Synchronisation Temps Réel (CMI, Bourse Climat, ONSSA)
  isDataSyncing: boolean;
  lastDataSyncTime: string | null;
  triggerManualSync: () => Promise<void>;
  syncLogs: SyncLog[];
  // 19. Logique Simplifiée & Rôles
  isRoleOnboardingOpen: boolean;
  setIsRoleOnboardingOpen: (open: boolean) => void;
  isSimpleOrderModalOpen: boolean;
  simpleOrderItem: any;
  openSimpleOrder: (item: any) => void;
  closeSimpleOrder: () => void;
  isOfferDetailModalOpen: boolean;
  selectedOfferForDetail: any;
  openOfferDetail: (item: any) => void;
  closeOfferDetail: () => void;
  isSimpleCreateOfferOpen: boolean;
  setIsSimpleCreateOfferOpen: (open: boolean) => void;
}

export interface LowStockAlertToastPayload {
  id: string;
  lotId: string;
  lotBatch: string;
  variety: string;
  species: string;
  currentQty: number;
  threshold: number;
  time: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_LOTS = 'agrimaroc_nursery_lots_v1';
const STORAGE_KEY_PRODUCE = 'agrimaroc_produce_listings_v1';
const STORAGE_KEY_FARM_STANDING = 'agrimaroc_farm_standing_v1';
const STORAGE_KEY_LANG = 'agrimaroc_lang_v1';
const STORAGE_KEY_PROFILE = 'agrimaroc_user_profile_v1';
const STORAGE_KEY_ESCROW = 'agrimaroc_escrow_transactions_v1';
const STORAGE_KEY_TRANSPORT = 'agrimaroc_transport_bookings_v1';
const STORAGE_KEY_REVIEWS = 'agrimaroc_reviews_v1';
const STORAGE_KEY_DISCUSSIONS = 'agrimaroc_discussions_v1';
const STORAGE_KEY_PAYMENT_PROTECTION = 'agrimaroc_payment_protection_v1';
const STORAGE_KEY_LOW_STOCK_CONFIG = 'agrimaroc_low_stock_config_v1';
const STORAGE_KEY_DAILY_SYNC = 'agrimaroc_daily_sync_record_v1';
const STORAGE_KEY_EXPORT_MANIFESTS = 'agrimaroc_export_manifests_v1';
const STORAGE_KEY_ADMIN_SESSION = 'agrimaroc_admin_session_v1';
const STORAGE_KEY_PLATFORM_SETTINGS = 'agrimaroc_platform_settings_v1';
const STORAGE_KEY_USER_ACCOUNTS = 'agrimaroc_user_accounts_v1';
const STORAGE_KEY_CARRIER_VEHICLES = 'agrimaroc_carrier_vehicles_v1';
const STORAGE_KEY_TRANSPORT_REQUESTS = 'agrimaroc_transport_requests_v1';
const STORAGE_KEY_NOTIFICATION_SETTINGS = 'agrimaroc_notification_settings_v1';
const STORAGE_KEY_B2B_ADS = 'agrimaroc_b2b_ads_v1';
const STORAGE_KEY_FAVORITES = 'agrimaroc_buyer_favorites_v1';

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  priceDropAlertsEnabled: true,
  nurseryAlertsEnabled: true,
  browserPushEnabled: true,
  inAppToastEnabled: true,
  emailAlertsEnabled: false,
  whatsappAlertsEnabled: true,
  globalMinPriceDropPercent: 10,
  priceDropWatches: [
    {
      id: 'pwatch-01',
      produceName: 'Tomates Rondes Lisses',
      category: 'Légume',
      variety: 'Torry F1 / Reva',
      maxTargetPrice: 4800,
      minDropPercent: 10,
      region: 'Souss-Massa (Agadir, Taroudant, Chtouka)',
      enabled: true,
      createdAt: '2025-03-01',
    },
    {
      id: 'pwatch-02',
      produceName: 'Clémentines Nadorcott',
      category: 'Fruit',
      variety: 'Afourer / Nadorcott Export',
      maxTargetPrice: 6200,
      minDropPercent: 15,
      region: 'Berkane / Oriental',
      enabled: true,
      createdAt: '2025-03-05',
    },
    {
      id: 'pwatch-03',
      produceName: 'Avocats Hass Extra',
      category: 'Fruit',
      variety: 'Hass Calibre 14-18',
      maxTargetPrice: 22000,
      minDropPercent: 10,
      region: 'Rabat - Salé - Kénitra (Gharb)',
      enabled: true,
      createdAt: '2025-03-10',
    },
  ],
  nurseryInterestWatches: [
    {
      id: 'nwatch-01',
      speciesOrCategory: 'Olivier (Olea europaea)',
      variety: 'Picholine Marocaine',
      onssaOnly: true,
      minQuantity: 500,
      region: 'Marrakech - Safi (Haouz, El Kelaâ)',
      enabled: true,
      createdAt: '2025-03-02',
    },
    {
      id: 'nwatch-02',
      speciesOrCategory: 'Clémentinier (Citrus clementina)',
      variety: 'Nadorcott / Afourer',
      onssaOnly: true,
      minQuantity: 500,
      region: 'Souss-Massa (Taroudant)',
      enabled: true,
      createdAt: '2025-03-04',
    },
    {
      id: 'nwatch-03',
      speciesOrCategory: 'Plants Maraîchers & Légumes',
      variety: 'Tomate Ronde Greffée sur Maxifort',
      onssaOnly: true,
      minQuantity: 2000,
      region: 'Souss-Massa (Agadir)',
      enabled: true,
      createdAt: '2025-03-08',
    },
  ],
  notificationHistory: [
    {
      id: 'notif-hist-01',
      type: 'price_drop',
      title: 'Baisse de prix : Tomates Rondes Lisses (-18%)',
      message: 'Prix en baisse de 5.80 à 4.80 MAD/kg à Chtouka Aït Baha (Souss-Massa). 45 Tonnes disponibles.',
      timestamp: 'Il y a 25 min',
      read: false,
      targetId: 'prod-01',
      targetTab: 'market',
      metadata: {
        oldPrice: 5.8,
        newPrice: 4.8,
        dropPercent: 18,
        variety: 'Torry F1',
        region: 'Souss-Massa',
      },
    },
    {
      id: 'notif-hist-02',
      type: 'new_nursery_lot',
      title: 'Nouvel arrivage : Olivier Picholine Marocaine (3 800 plants)',
      message: 'Nouveau lot certifié ONSSA Catégorie Bleue disponible à 18.50 MAD/pot chez Pépinière Al Haouz.',
      timestamp: 'Il y a 2 heures',
      read: false,
      targetId: 'lot-olv-01',
      targetTab: 'nursery',
      metadata: {
        quantity: 3800,
        variety: 'Picholine Marocaine',
        region: 'Marrakech - Safi',
      },
    },
    {
      id: 'notif-hist-03',
      type: 'price_drop',
      title: 'Baisse de prix : Clémentines Nadorcott (-12%)',
      message: 'Le prix de vente est passé de 7.50 à 6.60 MAD/kg à Berkane. Expédition immédiate.',
      timestamp: 'Hier',
      read: true,
      targetId: 'prod-02',
      targetTab: 'market',
      metadata: {
        oldPrice: 7.5,
        newPrice: 6.6,
        dropPercent: 12,
        variety: 'Nadorcott',
        region: 'Berkane',
      },
    },
  ],
};

const DEFAULT_DAILY_SYNC_RECORD: DailySyncRecord = {
  lastSyncDate: '',
  lastSyncTimeStr: '',
  syncedLotsCount: 0,
  totalLotsCount: 0,
  reminderEnabled: true,
  reminderHour: '17:00',
};

const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'usr-1',
  role: 'buyer',
  roles: ['buyer'],
  displayName: '',
  phone: '',
  whatsapp: '',
  companyName: '',
  region: 'Souss-Massa (Agadir, Taroudant, Chtouka)',
  hasCompletedIdentification: false,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      return (saved as AppLanguage) || 'fr';
    } catch {
      return 'fr';
    }
  });

  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [nurseryDepartmentFilter, setNurseryDepartmentFilter] = useState<'ALL' | 'ARBORICULTURE' | 'MARAICHAGE' | 'ORNEMENTALE'>('ALL');
  const [produceCategoryFilter, setProduceCategoryFilter] = useState<string>('ALL');
  const [produceIntentFilter, setProduceIntentFilter] = useState<'ALL' | 'sell' | 'buy'>('ALL');

  const navigateToNurseryDepartment = useCallback((dept: 'ALL' | 'ARBORICULTURE' | 'MARAICHAGE' | 'ORNEMENTALE') => {
    setNurseryDepartmentFilter(dept);
    setActiveTab('nursery');
  }, []);

  const navigateToProduceCategory = useCallback((cat: string, intent: 'ALL' | 'sell' | 'buy' = 'ALL') => {
    setProduceCategoryFilter(cat);
    setProduceIntentFilter(intent);
    setActiveTab('market');
  }, []);

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_USER_PROFILE, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load user profile', e);
    }
    return DEFAULT_USER_PROFILE;
  });

  const [isIdentificationModalOpen, setIsIdentificationModalOpen] = useState<boolean>(false);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isNurserySetupModalOpen, setIsNurserySetupModalOpen] = useState<boolean>(false);
  const [isFieldQRScannerModalOpen, setIsFieldQRScannerModalOpen] = useState<boolean>(false);
  const [fieldQRScannerInitialBatch, setFieldQRScannerInitialBatch] = useState<string>('');

  const openNurserySetupModal = useCallback(() => {
    setIsNurserySetupModalOpen(true);
  }, []);

  const closeNurserySetupModal = useCallback(() => {
    setIsNurserySetupModalOpen(false);
  }, []);

  const openFieldQRScannerModal = useCallback((initialBatchNumber?: string) => {
    if (initialBatchNumber) {
      setFieldQRScannerInitialBatch(initialBatchNumber);
    }
    setIsFieldQRScannerModalOpen(true);
  }, []);

  const closeFieldQRScannerModal = useCallback(() => {
    setIsFieldQRScannerModalOpen(false);
    setFieldQRScannerInitialBatch('');
  }, []);

  // Listen for direct mobile verification deep link (?verify_batch=...)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const batchFromUrl = searchParams.get('verify_batch') || searchParams.get('batch');
      if (batchFromUrl) {
        setFieldQRScannerInitialBatch(batchFromUrl);
        setIsFieldQRScannerModalOpen(true);
      }
    }
  }, []);

  const saveNurserySetupConfig = useCallback(
    (config: {
      nurseryName: string;
      orientation: NurseryOrientation;
      region: MoroccanRegion;
      city: string;
      onssaApprovalNumber: string;
      hasOfficialOnssa: boolean;
      annualCapacitySaplings: number;
      infrastructures: string[];
      specialties: string[];
      ornamentalDetails?: any;
      arboricultureDetails?: any;
    }) => {
      setUserProfile((prev) => {
        const currentRoles = prev.roles && prev.roles.length > 0 ? prev.roles : [prev.role];
        const newRoles = currentRoles.includes('nursery') ? currentRoles : [...currentRoles, 'nursery' as UserRole];

        const updatedNurseryDetails: NurseryDetails = {
          nurseryName: config.nurseryName,
          onssaApprovalNumber: config.onssaApprovalNumber,
          certifications: config.hasOfficialOnssa
            ? ['Agrément ONSSA Officiel', 'Passeport Phytosanitaire Homologué']
            : ['En cours d’homologation'],
          specialties: config.specialties,
          annualSaplingCapacity: config.annualCapacitySaplings,
          orientation: config.orientation,
          infrastructures: config.infrastructures,
          ornamentalDetails: config.ornamentalDetails,
          arboricultureDetails: config.arboricultureDetails,
        };

        const updatedProfile: UserProfile = {
          ...prev,
          roles: newRoles,
          role: 'nursery',
          hasCompletedIdentification: true,
          displayName: config.nurseryName || prev.displayName,
          companyName: config.nurseryName || prev.companyName,
          region: config.region || prev.region,
          city: config.city || prev.city,
          nurseryDetails: updatedNurseryDetails,
        };

        try {
          localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(updatedProfile));
        } catch (e) {
          console.warn('Could not persist profile update', e);
        }

        return updatedProfile;
      });

      // Automatically configure the nursery department view to match their orientation
      if (config.orientation === 'ornamental') {
        setNurseryDepartmentFilter('ORNEMENTALE');
      } else if (config.orientation === 'arboriculture') {
        setNurseryDepartmentFilter('ARBORICULTURE');
      } else {
        setNurseryDepartmentFilter('ALL');
      }

      setIsNurserySetupModalOpen(false);
      // Seamlessly navigate to the Nursery Dashboard!
      setActiveTab('nursery_space');
    },
    []
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(userProfile));
    } catch (e) {
      console.warn('Storage quota exceeded for profile', e);
    }
  }, [userProfile]);

  const setUserRole = useCallback((role: UserRole) => {
    setUserProfile(prev => {
      const currentRoles = prev.roles && prev.roles.length > 0 ? prev.roles : [prev.role];
      if (!currentRoles.includes(role)) {
        console.warn(`Role ${role} is not in user roles. Request activation first.`);
        return prev;
      }
      return {
        ...prev,
        role,
        hasCompletedIdentification: true,
      };
    });
  }, []);

  // Favoris de l'acheteur
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FAVORITES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load favorites', e);
    }
    return ['prod-01', 'lot-olv-01'];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favoriteIds));
    } catch (e) {
      console.warn('Storage quota exceeded for favorites', e);
    }
  }, [favoriteIds]);

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }, []);

  const isFavorite = useCallback((id: string) => favoriteIds.includes(id), [favoriteIds]);

  // Sous-onglets des espaces métiers
  const [buyerActiveSubTab, setBuyerActiveSubTab] = useState<'orders' | 'favorites' | 'discussions' | 'logistics' | 'price_comparison' | 'reviews'>('orders');
  const [roleSwitchToast, setRoleSwitchToast] = useState<{ message: string; role: UserRole } | null>(null);

  const dismissRoleSwitchToast = useCallback(() => {
    setRoleSwitchToast(null);
  }, []);

  // Contrôles RBAC (Role-Based Access Control)
  const canManageNursery = useMemo(() => {
    return userProfile.role === 'nursery' || Boolean(userProfile.roles && userProfile.roles.includes('nursery'));
  }, [userProfile.role, userProfile.roles]);

  const canManageSeller = useMemo(() => {
    return userProfile.role === 'seller' || Boolean(userProfile.roles && userProfile.roles.includes('seller'));
  }, [userProfile.role, userProfile.roles]);

  const canManageCarrier = useMemo(() => {
    return userProfile.role === 'carrier' || Boolean(userProfile.roles && userProfile.roles.includes('carrier'));
  }, [userProfile.role, userProfile.roles]);

  const switchActiveRole = useCallback((role: UserRole) => {
    setUserProfile(prev => {
      const currentRoles = prev.roles && prev.roles.length > 0 ? prev.roles : [prev.role];
      if (!currentRoles.includes(role)) {
        console.warn(`Role ${role} is not among user assigned roles.`);
        return prev;
      }
      return {
        ...prev,
        role,
        hasCompletedIdentification: true,
      };
    });

    if (role === 'buyer') {
      setActiveTab('buyer_space');
      setRoleSwitchToast({
        role: 'buyer',
        message: 'Espace Acheteur activé : vos achats, commandes et séquestres.',
      });
    } else if (role === 'nursery') {
      setActiveTab('nursery_space');
      setRoleSwitchToast({
        role: 'nursery',
        message: 'Espace Pépiniériste activé : inventaire des plants et traçabilité ONSSA.',
      });
    } else if (role === 'seller') {
      setActiveTab('seller_space');
      setRoleSwitchToast({
        role: 'seller',
        message: 'Espace Vendeur activé : gestion des récoltes et ventes sur pied.',
      });
    } else if (role === 'carrier') {
      setActiveTab('carrier_space');
      setRoleSwitchToast({
        role: 'carrier',
        message: 'Espace Fret & Transport activé : missions et livraisons frigorifiques.',
      });
    }
  }, []);

  const requestRoleActivation = useCallback(async (
    targetRole: UserRole,
    details?: {
      nurseryDetails?: any;
      carrierDetails?: any;
      sellerDetails?: any;
      buyerDetails?: any;
    }
  ): Promise<{ success: boolean; requiresApproval: boolean; message: string }> => {
    const requiresApproval = targetRole === 'nursery' || targetRole === 'carrier' || targetRole === 'seller';

    setUserProfile(prev => {
      const currentRoles = prev.roles && prev.roles.length > 0 ? prev.roles : [prev.role];
      const newRoles = currentRoles.includes(targetRole) ? currentRoles : [...currentRoles, targetRole];
      const updated: UserProfile = {
        ...prev,
        roles: newRoles,
        role: targetRole,
        verificationStatus: requiresApproval ? 'pending_verification' : prev.verificationStatus,
        nurseryDetails: details?.nurseryDetails || prev.nurseryDetails,
        carrierDetails: details?.carrierDetails || prev.carrierDetails,
        sellerDetails: details?.sellerDetails || prev.sellerDetails,
        buyerDetails: details?.buyerDetails || prev.buyerDetails,
      };
      try {
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not persist profile update', e);
      }
      return updated;
    });

    if (targetRole === 'buyer') {
      setActiveTab('buyer_space');
      return { success: true, requiresApproval: false, message: 'Rôle Acheteur activé avec succès.' };
    } else if (targetRole === 'seller') {
      setActiveTab('seller_space');
      return { success: true, requiresApproval: true, message: 'Rôle Vendeur / Producteur ajouté. Votre profil est enregistré.' };
    } else if (targetRole === 'nursery') {
      setActiveTab('nursery_space');
      return { success: true, requiresApproval: true, message: 'Rôle Pépiniériste ajouté. Votre N° d\'agrément ONSSA est soumis à vérification avant affichage de la mention « Agréé ».' };
    } else if (targetRole === 'carrier') {
      setActiveTab('carrier_space');
      return { success: true, requiresApproval: true, message: 'Rôle Transporteur ajouté. Votre licence de transport frigorifique est en cours de contrôle avant affichage de la mention « Agréé ».' };
    }
    return { success: true, requiresApproval: false, message: 'Rôle activé.' };
  }, []);

  const updateUserRoles = useCallback((roles: UserRole[]) => {
    setUserProfile(prev => ({
      ...prev,
      roles,
      role: roles.includes(prev.role) ? prev.role : (roles[0] || 'buyer'),
    }));
  }, []);

  // Inscription et création de compte (Firebase Auth + Firestore)
  const registerAccount = useCallback(async (params: RegisterAccountParams) => {
    const res = await registerUserAccount(params);
    if (res.success && res.profile) {
      setUserProfile(res.profile);
      // Synchronise la liste des utilisateurs pour la console Admin
      setUserAccountsList(prev => {
        const exists = prev.some(u => u.id === res.profile!.id || u.email === res.profile!.email);
        if (exists) {
          return prev.map(u => (u.id === res.profile!.id || u.email === res.profile!.email ? res.profile! : u));
        }
        return [res.profile!, ...prev];
      });
      return { success: true };
    }
    return { success: false, error: res.error || 'Erreur lors de la création du compte.' };
  }, []);

  // Connexion au compte (Firebase Auth + Firestore)
  const loginAccount = useCallback(async (email: string, pass: string) => {
    const res = await loginUserAccount(email, pass);
    if (res.success && res.profile) {
      const activeProf = res.profile;
      setUserProfile(activeProf);
      // Déverrouille la session
      setIsSessionUnlocked(true);
      try {
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(activeProf));
      } catch (e) {
        console.warn('Storage quota exceeded for profile', e);
      }
      setUserAccountsList(prev => {
        const normEmail = (activeProf.email || '').toLowerCase();
        const exists = prev.some(u => u.id === activeProf.id || (u.email && u.email.toLowerCase() === normEmail));
        if (exists) {
          return prev.map(u => (u.id === activeProf.id || (u.email && u.email.toLowerCase() === normEmail) ? activeProf : u));
        }
        return [activeProf, ...prev];
      });
      // Redirection intuitive vers l'espace de gestion selon le rôle
      if (activeProf.role === 'nursery' || activeProf.roles?.includes('nursery')) {
        setActiveTab('nursery_space');
      } else if (activeProf.role === 'seller' || activeProf.roles?.includes('seller')) {
        setActiveTab('seller_space');
      }
      return { success: true };
    }
    return { success: false, error: res.error || 'Identifiants invalides.' };
  }, []);

  // Déconnexion
  const logoutAccount = useCallback(async () => {
    await logoutUser();
    setUserProfile(DEFAULT_USER_PROFILE);
    setIsSessionUnlocked(false);
    setActiveTab('home');
  }, []);

  // Mot de passe oublié
  const sendPasswordReset = useCallback(async (email: string) => {
    const res = await sendUserPasswordReset(email);
    return res;
  }, []);

  // Mise à jour des informations de profil
  const updateProfileData = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      setUserProfile(prev => {
        const merged = { ...prev, ...updates };
        return merged;
      });
      setUserAccountsList(prev =>
        prev.map(u => (u.id === userProfile.id ? { ...u, ...updates } : u))
      );
      await updateUserProfileInFirestore(userProfile.id, updates);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, [userProfile.id]);

  // Flotte Transporteur & Fret Logistique
  const [carrierVehicles, setCarrierVehicles] = useState<CarrierVehicle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CARRIER_VEHICLES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load carrier vehicles', e);
    }
    return INITIAL_CARRIER_VEHICLES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CARRIER_VEHICLES, JSON.stringify(carrierVehicles));
    } catch (e) {
      console.warn('Storage quota exceeded for carrier vehicles', e);
    }
  }, [carrierVehicles]);

  const addCarrierVehicle = useCallback((vehicle: Omit<CarrierVehicle, 'id'>) => {
    const newVehicle: CarrierVehicle = {
      ...vehicle,
      id: `veh-${Date.now()}`,
    };
    setCarrierVehicles(prev => [newVehicle, ...prev]);
  }, []);

  const updateCarrierVehicleStatus = useCallback((id: string, status: CarrierVehicle['status']) => {
    setCarrierVehicles(prev => prev.map(v => v.id === id ? { ...v, status } : v));
  }, []);

  // Demandes de Fret & Transport Trips
  const [transportTripRequests, setTransportTripRequests] = useState<TransportTripRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRANSPORT_REQUESTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load transport trip requests', e);
    }
    return INITIAL_TRANSPORT_REQUESTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TRANSPORT_REQUESTS, JSON.stringify(transportTripRequests));
    } catch (e) {
      console.warn('Storage quota exceeded for transport requests', e);
    }
  }, [transportTripRequests]);

  const addTransportTripRequest = useCallback((req: Omit<TransportTripRequest, 'id' | 'requestNumber' | 'createdAt' | 'status'>) => {
    const newReq: TransportTripRequest = {
      ...req,
      id: `req-trp-${Date.now()}`,
      requestNumber: `TRP-2026-MA-${Math.floor(100 + Math.random() * 900)}`,
      status: 'en_attente',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setTransportTripRequests(prev => [newReq, ...prev]);
  }, []);

  const updateTransportTripStatus = useCallback((id: string, status: TransportTripRequest['status'], vehicleId?: string) => {
    setTransportTripRequests(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status,
          ...(vehicleId ? { assignedCarrierVehicleId: vehicleId } : {}),
        };
      }
      return t;
    }));
  }, []);

  const [nurseryLots, setNurseryLots] = useState<NurseryLot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const initMap = new Map(INITIAL_NURSERY_LOTS.map(l => [l.id, l]));
          return parsed.map((lot: NurseryLot) => {
            const init = initMap.get(lot.id);
            return {
              ...lot,
              userId: lot.userId || init?.userId,
              sellerName: lot.sellerName || init?.sellerName,
              sellerPhone: lot.sellerPhone || init?.sellerPhone,
              lowStockThreshold: lot.lowStockThreshold || init?.lowStockThreshold,
            };
          });
        }
      }
    } catch (e) {
      console.error('Failed to load nursery lots from localStorage', e);
    }
    return INITIAL_NURSERY_LOTS;
  });

  // Low Stock Alert Configuration & Monitoring
  const DEFAULT_LOW_STOCK_CONFIG: LowStockAlertConfig = {
    defaultThreshold: 500,
    varietyThresholds: {
      'Mejhoul (Medjool) Certifié': 1500,
      'Cycas Revoluta Spécimen Rustique': 100,
      'Picholine Marocaine': 800,
      'Nadorcott / Afourer': 1000,
      'Tomate Ronde Greffée sur Maxifort': 5000,
      'Poivron Carré Rouge & Jaune F1 (California type)': 4000,
    },
    browserNotificationsEnabled: true,
  };

  const [lowStockConfig, setLowStockConfig] = useState<LowStockAlertConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOW_STOCK_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.defaultThreshold === 'number') {
          return {
            ...DEFAULT_LOW_STOCK_CONFIG,
            ...parsed,
          };
        }
      }
    } catch (e) {
      console.error('Failed to load low stock config from localStorage', e);
    }
    return DEFAULT_LOW_STOCK_CONFIG;
  });

  const [isLowStockSettingsModalOpen, setIsLowStockSettingsModalOpen] = useState(false);
  const [latestLowStockAlert, setLatestLowStockAlert] = useState<LowStockAlertToastPayload | null>(null);
  const [isOfficialComplianceModalOpen, setIsOfficialComplianceModalOpen] = useState(false);
  const [isBenchmarkModalOpen, setIsBenchmarkModalOpen] = useState(false);
  const [isUserManualModalOpen, setIsUserManualModalOpen] = useState(false);
  const [userManualInitialChapter, setUserManualInitialChapter] = useState<string | undefined>(undefined);

  // 15. Module Manifestes d'Exportation
  const [exportManifests, setExportManifests] = useState<ProduceExportManifest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXPORT_MANIFESTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not load export manifests from storage', e);
    }
    return INITIAL_EXPORT_MANIFESTS;
  });

  const [isExportManifestModalOpen, setIsExportManifestModalOpen] = useState(false);
  const [activeExportManifestId, setActiveExportManifestId] = useState<string | null>(null);
  const [prepopulatedListingForManifest, setPrepopulatedListingForManifest] = useState<ProduceListing | null>(null);

  // 17. Système d'Alertes Personnalisées (Baisses de Prix & Arrivages Pépinières)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFICATION_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.priceDropAlertsEnabled === 'boolean') {
          return {
            ...DEFAULT_NOTIFICATION_SETTINGS,
            ...parsed,
          };
        }
      }
    } catch (e) {
      console.warn('Could not load notification settings from storage', e);
    }
    return DEFAULT_NOTIFICATION_SETTINGS;
  });

  const [isNotificationSettingsModalOpen, setIsNotificationSettingsModalOpen] = useState(false);
  const [activeNotificationSettingsTab, setActiveNotificationSettingsTab] = useState<'price_drops' | 'nursery_lots' | 'channels' | 'history'>('price_drops');
  const [latestMarketplaceToast, setLatestMarketplaceToast] = useState<MarketplaceNotificationEvent | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFICATION_SETTINGS, JSON.stringify(notificationSettings));
    } catch (e) {
      console.warn('Failed to save notification settings to localStorage', e);
    }
  }, [notificationSettings]);

  const updateNotificationSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setNotificationSettings((prev) => ({
      ...prev,
      ...newSettings,
    }));
  }, []);

  const addPriceDropWatch = useCallback((watch: Omit<PriceDropAlertItem, 'id' | 'createdAt'>) => {
    const newItem: PriceDropAlertItem = {
      ...watch,
      id: `pwatch-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setNotificationSettings((prev) => ({
      ...prev,
      priceDropWatches: [newItem, ...prev.priceDropWatches],
    }));
  }, []);

  const removePriceDropWatch = useCallback((id: string) => {
    setNotificationSettings((prev) => ({
      ...prev,
      priceDropWatches: prev.priceDropWatches.filter((w) => w.id !== id),
    }));
  }, []);

  const togglePriceDropWatch = useCallback((id: string, enabled?: boolean) => {
    setNotificationSettings((prev) => ({
      ...prev,
      priceDropWatches: prev.priceDropWatches.map((w) =>
        w.id === id ? { ...w, enabled: enabled !== undefined ? enabled : !w.enabled } : w
      ),
    }));
  }, []);

  const addNurseryInterestWatch = useCallback((watch: Omit<NurseryInterestAlertItem, 'id' | 'createdAt'>) => {
    const newItem: NurseryInterestAlertItem = {
      ...watch,
      id: `nwatch-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setNotificationSettings((prev) => ({
      ...prev,
      nurseryInterestWatches: [newItem, ...prev.nurseryInterestWatches],
    }));
  }, []);

  const removeNurseryInterestWatch = useCallback((id: string) => {
    setNotificationSettings((prev) => ({
      ...prev,
      nurseryInterestWatches: prev.nurseryInterestWatches.filter((w) => w.id !== id),
    }));
  }, []);

  const toggleNurseryInterestWatch = useCallback((id: string, enabled?: boolean) => {
    setNotificationSettings((prev) => ({
      ...prev,
      nurseryInterestWatches: prev.nurseryInterestWatches.map((w) =>
        w.id === id ? { ...w, enabled: enabled !== undefined ? enabled : !w.enabled } : w
      ),
    }));
  }, []);

  const openNotificationSettings = useCallback((tab?: 'price_drops' | 'nursery_lots' | 'channels' | 'history') => {
    if (tab) setActiveNotificationSettingsTab(tab);
    setIsNotificationSettingsModalOpen(true);
  }, []);

  const dismissMarketplaceToast = useCallback(() => {
    setLatestMarketplaceToast(null);
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotificationSettings((prev) => ({
      ...prev,
      notificationHistory: prev.notificationHistory.map((item) =>
        item.id === id ? { ...item, read: true } : item
      ),
    }));
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotificationSettings((prev) => ({
      ...prev,
      notificationHistory: prev.notificationHistory.map((item) => ({ ...item, read: true })),
    }));
  }, []);

  const clearNotificationHistory = useCallback(() => {
    setNotificationSettings((prev) => ({
      ...prev,
      notificationHistory: [],
    }));
  }, []);

  const unreadNotificationsCount = useMemo(() => {
    return notificationSettings.notificationHistory.filter((item) => !item.read).length;
  }, [notificationSettings.notificationHistory]);

  const triggerSimulatedNotification = useCallback(
    (type: 'price_drop' | 'new_nursery_lot') => {
      if (type === 'price_drop') {
        const dropEvent: MarketplaceNotificationEvent = {
          id: `sim-drop-${Date.now()}`,
          type: 'price_drop',
          title: 'Alerte Baisse de Prix : Tomates Allongées (-21%)',
          message: 'Le prix de vente est passé de 6.20 à 4.90 MAD/kg dans le Souss-Massa (Taroudant). Lot disponible immédiatement.',
          timestamp: 'À l\'instant',
          read: false,
          targetId: 'prod-sim-01',
          targetTab: 'market',
          metadata: {
            oldPrice: 6.2,
            newPrice: 4.9,
            dropPercent: 21,
            variety: 'Torry F1',
            region: 'Souss-Massa',
          },
        };

        if (notificationSettings.browserPushEnabled) {
          sendPriceDropBrowserNotification({
            produceName: 'Tomates Allongées',
            variety: 'Torry F1',
            oldPrice: 6.2,
            newPrice: 4.9,
            dropPercent: 21,
            region: 'Souss-Massa (Taroudant)',
          });
        }

        if (notificationSettings.inAppToastEnabled) {
          setLatestMarketplaceToast(dropEvent);
        }

        setNotificationSettings((prev) => ({
          ...prev,
          notificationHistory: [dropEvent, ...prev.notificationHistory],
        }));
      } else {
        const nurseryEvent: MarketplaceNotificationEvent = {
          id: `sim-nursery-${Date.now()}`,
          type: 'new_nursery_lot',
          title: 'Nouvel arrivage : Olivier Picholine Marocaine (5 000 plants)',
          message: 'Nouveau lot certifié ONSSA Catégorie Bleue disponible à 17.50 MAD/plant chez Pépinière Al Haouz.',
          timestamp: 'À l\'instant',
          read: false,
          targetId: 'lot-sim-01',
          targetTab: 'nursery',
          metadata: {
            quantity: 5000,
            variety: 'Picholine Marocaine',
            region: 'Marrakech - Safi',
          },
        };

        if (notificationSettings.browserPushEnabled) {
          sendNewNurseryLotBrowserNotification({
            species: 'Olivier (Olea europaea)',
            variety: 'Picholine Marocaine',
            quantity: 5000,
            unitPriceMAD: 17.5,
            region: 'Marrakech - Safi',
            onssaCertified: true,
          });
        }

        if (notificationSettings.inAppToastEnabled) {
          setLatestMarketplaceToast(nurseryEvent);
        }

        setNotificationSettings((prev) => ({
          ...prev,
          notificationHistory: [nurseryEvent, ...prev.notificationHistory],
        }));
      }
    },
    [notificationSettings.browserPushEnabled, notificationSettings.inAppToastEnabled]
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EXPORT_MANIFESTS, JSON.stringify(exportManifests));
    } catch (e) {
      console.warn('Storage quota exceeded for export manifests', e);
    }
  }, [exportManifests]);

  const openExportManifestModal = useCallback((manifestId?: string, prepopulateListing?: ProduceListing) => {
    setActiveExportManifestId(manifestId || null);
    setPrepopulatedListingForManifest(prepopulateListing || null);
    setIsExportManifestModalOpen(true);
  }, []);

  const createExportManifest = useCallback((data: Omit<ProduceExportManifest, 'id' | 'manifestNumber'>): ProduceExportManifest => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newManifest: ProduceExportManifest = {
      ...data,
      id: `man-exp-${Date.now()}`,
      manifestNumber: `EXP-MAN-${new Date().getFullYear()}-MA-${randomSuffix}`,
    };
    setExportManifests(prev => [newManifest, ...prev]);
    setActiveExportManifestId(newManifest.id);
    return newManifest;
  }, []);

  const updateExportManifest = useCallback((id: string, updates: Partial<ProduceExportManifest>) => {
    setExportManifests(prev =>
      prev.map(m => (m.id === id ? { ...m, ...updates } : m))
    );
  }, []);

  const deleteExportManifest = useCallback((id: string) => {
    setExportManifests(prev => prev.filter(m => m.id !== id));
    if (activeExportManifestId === id) {
      setActiveExportManifestId(null);
    }
  }, [activeExportManifestId]);

  const generateManifestFromListing = useCallback((listing: ProduceListing): ProduceExportManifest => {
    // Calcul automatique poids et emballage
    let netWeightKg = 20000;
    if (listing.unit === 'Tonnes') {
      netWeightKg = listing.quantityAvailable * 1000;
    } else if (listing.unit === 'Kg') {
      netWeightKg = listing.quantityAvailable;
    } else if (listing.unit === 'Caisses (10kg)') {
      netWeightKg = listing.quantityAvailable * 10;
    }

    const grossWeightKg = Math.round(netWeightKg * 1.075);
    const estimatedPackages = Math.max(100, Math.round(netWeightKg / 6));
    const estimatedPallets = Math.min(33, Math.max(1, Math.round(estimatedPackages / 140)));

    // Recherche code SH
    const matchedHS = COMMON_MOROCCAN_PRODUCE_HS_CODES.find(h =>
      listing.title.toLowerCase().includes(h.category.toLowerCase()) ||
      listing.variety.toLowerCase().includes(h.commodityFr.toLowerCase()) ||
      h.commodityFr.toLowerCase().includes(listing.title.toLowerCase().split(' ')[0])
    ) || COMMON_MOROCCAN_PRODUCE_HS_CODES[0];

    const todayStr = new Date().toISOString().split('T')[0];
    const departure = new Date();
    departure.setDate(departure.getDate() + 1);
    const departureStr = departure.toISOString().split('T')[0];
    const arrival = new Date();
    arrival.setDate(arrival.getDate() + 3);
    const arrivalStr = arrival.toISOString().split('T')[0];

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    const generated: ProduceExportManifest = {
      id: `man-exp-${Date.now()}`,
      manifestNumber: `EXP-MAN-${new Date().getFullYear()}-MA-${randomSuffix}`,
      status: 'inspected',
      destinationType: 'international',
      issueDate: todayStr,
      departureDate: departureStr,
      estimatedArrivalDate: arrivalStr,

      exporterName: listing.sellerName || 'Domaine Maraîcher Certifié Agréé',
      exporterICE: '001928401000088',
      exporterRC: 'RC 49201 Agadir',
      exporterAddress: `Périmètre Agricole de ${listing.locationCity}`,
      exporterCity: listing.locationCity,
      originRegion: listing.region,
      onssaApprovalNumber: listing.phytosanitaryPassport || 'ST-ONSSA-SM-2024-0491',
      foodexApprovalNumber: 'EACCE-EXP-7721-MA',
      contactPerson: listing.sellerName,
      contactPhone: listing.phone,

      consigneeName: 'Grand Marché d\'Intérêt National de Rungis (Secteur Frais)',
      consigneeAddress: '1 Rue de la Corderie, Bâtiment Primeurs',
      consigneeCity: 'Rungis (Paris)',
      consigneeCountry: 'France',
      consigneeVatEori: 'FR99482019482',
      notifyParty: 'Euro-Logistics Transitaire Port Tanger Med / Algésiras',

      transportMode: 'road_reefer',
      carrierName: 'AgriFret Frigo International Express',
      truckPlateNumber: `${Math.floor(10000 + Math.random() * 89999)}-A-33`,
      trailerPlateNumber: `REM-FRIGO-${randomSuffix}`,
      sealNumber: `BADR-PL-${Math.floor(100000 + Math.random() * 899999)}`,
      temperatureSetpointC: matchedHS.recommendedTempC,
      temperatureMinC: matchedHS.tempToleranceC.min,
      temperatureMaxC: matchedHS.tempToleranceC.max,
      dataloggerNumber: `USB-TEMP-LOGGER-${randomSuffix}`,
      portOfLoading: 'Port Tanger Med Roulier & Fret',
      portOfDischarge: 'Port d\'Algésiras (Espagne) / Hub Rungis',
      customsOffice: 'Bureau Douanier Tanger Med (Code 400)',
      dumNumber: `DUM-${new Date().getFullYear()}-400-${randomSuffix}-X`,
      cmrNumber: `CMR-MA-FR-${randomSuffix}`,

      items: [
        {
          id: `item-${Date.now()}-1`,
          commodity: listing.title,
          variety: listing.variety,
          hsCode: matchedHS.hsCode,
          qualityClass: 'Catégorie I',
          calibre: listing.calibre || 'Calibre Standardisé Export',
          lotNumber: listing.batchNumber || `LOT-${new Date().getFullYear()}-PRD-${randomSuffix}`,
          packagingType: listing.packaging || matchedHS.standardPackaging,
          packagesCount: estimatedPackages,
          palletsCount: estimatedPallets,
          netWeightKg,
          grossWeightKg,
          globalGapGgn: '4052899482103',
          originPlot: `Parcelle Récolte ${listing.locationCity}`,
        },
      ],

      phytosanitaryCertificateNumber: `ONSSA-PHYTO-EXP-${new Date().getFullYear()}-00${randomSuffix}`,
      foodexInspectionCertificate: `FOODEX-CERT-${new Date().getFullYear()}-${randomSuffix}`,
      eur1CertificateNumber: `MA-EUR1-${new Date().getFullYear()}-${randomSuffix}`,
      isGlobalGapCertified: listing.certifications.includes('GlobalG.A.P') || listing.certifications.includes('Export Ready'),
      isOrganicBio: listing.certifications.includes('Bio Maroc'),
      isResidueCompliant: true,
      quarantinePestFree: true,
      specialHandlingNotes: `Contrôle continu de la chaîne du froid à ${matchedHS.recommendedTempC}°C. Lot contrôlé avant empotage.`,

      totalPallets: estimatedPallets,
      totalPackages: estimatedPackages,
      totalNetWeightKg: netWeightKg,
      totalGrossWeightKg: grossWeightKg,

      qualityManagerName: 'Ing. Responsable Qualité Station Agréée',
      driverSignatureName: 'Chauffeur International TIR Certifié',
      inspectorName: 'Inspecteur ONSSA / EACCE Morocco Foodex',
      notes: `Manifeste d'exportation standardisé généré à partir de l'annonce officielle #${listing.id}. Conforme aux exigences UE.`,
      linkedProduceListingId: listing.id,
    };

    setExportManifests(prev => [generated, ...prev]);
    setActiveExportManifestId(generated.id);
    setIsExportManifestModalOpen(true);
    return generated;
  }, []);

  const openUserManual = useCallback((chapterId?: string) => {
    setUserManualInitialChapter(chapterId);
    setIsUserManualModalOpen(true);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOW_STOCK_CONFIG, JSON.stringify(lowStockConfig));
    } catch (e) {
      console.warn('Storage quota exceeded for low stock config', e);
    }
  }, [lowStockConfig]);

  const updateDefaultLowStockThreshold = useCallback((threshold: number) => {
    setLowStockConfig(prev => ({
      ...prev,
      defaultThreshold: Math.max(1, threshold),
    }));
  }, []);

  const updateVarietyLowStockThreshold = useCallback((variety: string, threshold: number) => {
    setLowStockConfig(prev => ({
      ...prev,
      varietyThresholds: {
        ...prev.varietyThresholds,
        [variety]: Math.max(0, threshold),
      },
    }));
  }, []);

  const removeVarietyLowStockThreshold = useCallback((variety: string) => {
    setLowStockConfig(prev => {
      const next = { ...prev.varietyThresholds };
      delete next[variety];
      return {
        ...prev,
        varietyThresholds: next,
      };
    });
  }, []);

  const toggleBrowserNotifications = useCallback(async (enable: boolean) => {
    if (!enable) {
      setLowStockConfig(prev => ({ ...prev, browserNotificationsEnabled: false }));
      return { granted: false };
    }
    const status = getBrowserNotificationStatus();
    if (status.permission === 'granted') {
      setLowStockConfig(prev => ({ ...prev, browserNotificationsEnabled: true }));
      return { granted: true };
    }
    const perm = await requestBrowserNotificationPermission();
    const granted = perm === 'granted';
    setLowStockConfig(prev => ({ ...prev, browserNotificationsEnabled: granted }));
    return { granted, message: granted ? undefined : 'Permission refusée par le navigateur' };
  }, []);

  const getLotThreshold = useCallback((lot: NurseryLot): number => {
    if (typeof lot.lowStockThreshold === 'number' && lot.lowStockThreshold >= 0) {
      return lot.lowStockThreshold;
    }
    if (lot.variety && lowStockConfig.varietyThresholds[lot.variety] !== undefined) {
      return lowStockConfig.varietyThresholds[lot.variety];
    }
    return lowStockConfig.defaultThreshold;
  }, [lowStockConfig]);

  const isLotLowStock = useCallback((lot: NurseryLot): boolean => {
    if (!lot) return false;
    const thresh = getLotThreshold(lot);
    return lot.quantityAvailable <= thresh;
  }, [getLotThreshold]);

  const lowStockLots = useMemo(() => {
    return nurseryLots.filter(l => l && isLotLowStock(l));
  }, [nurseryLots, isLotLowStock]);

  const triggerLowStockAlert = useCallback((lot: NurseryLot, currentStock: number, threshold: number) => {
    if (!lot) return;
    const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setLatestLowStockAlert({
      id: 'alert-' + Date.now(),
      lotId: lot.id,
      lotBatch: lot.batchNumber || 'N/A',
      variety: lot.variety || '',
      species: lot.species || '',
      currentQty: currentStock,
      threshold,
      time: timeStr,
    });

    if (lowStockConfig.browserNotificationsEnabled) {
      sendLowStockBrowserNotification({
        lotBatch: lot.batchNumber || 'N/A',
        variety: lot.variety || '',
        species: lot.species || '',
        currentStock,
        threshold,
        category: lot.category || '',
        location: lot.greenhouseLocation || '',
      });
    }
  }, [lowStockConfig]);

  const dismissLowStockAlert = useCallback(() => {
    setLatestLowStockAlert(null);
  }, []);

  // 13. Système de Rappel & Quick Sync Quotidien d'Inventaire
  const [dailySyncRecord, setDailySyncRecord] = useState<DailySyncRecord>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DAILY_SYNC);
      if (saved) {
        return { ...DEFAULT_DAILY_SYNC_RECORD, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load daily sync record', e);
    }
    return DEFAULT_DAILY_SYNC_RECORD;
  });

  const [isQuickSyncModalOpen, setIsQuickSyncModalOpen] = useState<boolean>(false);

  const [produceListings, setProduceListings] = useState<ProduceListing[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Migration & assainissement : exclure définitivement les machines agricoles
          const withoutMachinery = parsed.filter(
            (p: ProduceListing) =>
              p.category !== 'Machinisme & Équipements' &&
              p.id !== 'prod-09' &&
              p.id !== 'prod-10' &&
              !p.title?.toLowerCase().includes('tracteur') &&
              !(p as any).machineryYear
          );

          // Transformer ou remplacer tout appel d'offres / demande d'achat en offre de vente
          const initProduceMap = new Map(INITIAL_PRODUCE_LISTINGS.map(p => [p.id, p]));
          const sanitized = withoutMachinery.map((p: ProduceListing) => {
            const init = initProduceMap.get(p.id);

            let title = p.title || '';
            let sellerName = p.sellerName || '';
            let sellerType = p.sellerType || '';
            let imageUrl = p.imageUrl || '';
            let description = p.description || '';

            const isCallForTender =
              title.toUpperCase().includes("APPEL D'OFFRES") ||
              title.toUpperCase().includes("DEMANDE D'ACHAT") ||
              title.toLowerCase().startsWith('recherche ') ||
              p.listingIntent === 'buy';

            if (init && (isCallForTender || init.title !== title || p.id === 'prod-12' || p.id === 'prod-13')) {
              // Rétablir l'offre de vente officielle du producteur
              title = init.title;
              sellerName = init.sellerName;
              sellerType = init.sellerType;
              imageUrl = init.imageUrl;
              description = init.description;
            } else if (isCallForTender) {
              title = title
                .replace(/APPEL D'OFFRES\s*:\s*/gi, "Offre de Vente : ")
                .replace(/DEMANDE D'ACHAT\s*:\s*/gi, "Offre de Vente : ")
                .replace(/Recherche\s+/gi, "Disponible : ");
            }

            // Image de moutons/béliers Sardi vérifiée pour l'élevage
            if (
              p.id === 'prod-13' ||
              (p.category === 'Élevage & Bétail' &&
                (!imageUrl || imageUrl.includes('cbdcc31') || imageUrl.includes('server') || imageUrl.includes('photo-1558494949')))
            ) {
              imageUrl = 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=800&q=80';
            }

            // Sécurisation stricte du prix unitaire : ne jamais laisser undefined
            const rawPrice = Number(
              p.pricePerUnitMAD ??
              (p as any).targetBudgetMAD ??
              (p as any).price ??
              (p as any).pricePerUnit ??
              init?.pricePerUnitMAD ??
              3500
            );

            const calculatedPrice = !isNaN(rawPrice) && rawPrice > 0
              ? (p.unit === 'Tonnes' && rawPrice < 100 ? Math.round(rawPrice * 1000) : rawPrice)
              : (init?.pricePerUnitMAD || 2500);

            return {
              ...p,
              title,
              sellerName: sellerName || init?.sellerName || 'Exploitant Agricole',
              sellerType: sellerType || init?.sellerType || 'Agriculteur / Producteur',
              imageUrl: imageUrl || init?.imageUrl || 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80',
              description: description || init?.description || '',
              listingIntent: 'sell' as const, // Conserver uniquement des offres de vente
              userId: p.userId || init?.userId,
              sellerEmail: p.sellerEmail || init?.sellerEmail,
              pricePerUnitMAD: calculatedPrice,
              quantityAvailable: Number(p.quantityAvailable) || init?.quantityAvailable || 10,
              targetBudgetMAD: undefined,
            };
          });

          // Mettre à jour le localStorage avec les données assainies
          try {
            localStorage.setItem(STORAGE_KEY_PRODUCE, JSON.stringify(sanitized));
          } catch {
            // ignore
          }

          return sanitized;
        }
      }
    } catch (e) {
      console.error('Failed to load produce listings from localStorage', e);
    }
    return INITIAL_PRODUCE_LISTINGS;
  });

  const [farmStandingListings, setFarmStandingListings] = useState<FarmStandingListing[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FARM_STANDING);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const initFarmMap = new Map(INITIAL_FARM_STANDING_LISTINGS.map(f => [f.id, f]));
          return parsed.map((f: FarmStandingListing) => {
            const init = initFarmMap.get(f.id);
            return {
              ...f,
              userId: f.userId || init?.userId,
              sellerEmail: f.sellerEmail || init?.sellerEmail,
            };
          });
        }
      }
    } catch (e) {
      console.error('Failed to load farm standing listings from localStorage', e);
    }
    return INITIAL_FARM_STANDING_LISTINGS;
  });

  const [wholesalePrices] = useState<WholesaleMarketPrice[]>(INITIAL_WHOLESALE_PRICES);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOTS, JSON.stringify(nurseryLots));
    } catch (e) {
      console.warn('Storage quota exceeded for lots', e);
    }
  }, [nurseryLots]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCE, JSON.stringify(produceListings));
    } catch (e) {
      console.warn('Storage quota exceeded for produce', e);
    }
  }, [produceListings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FARM_STANDING, JSON.stringify(farmStandingListings));
    } catch (e) {
      console.warn('Storage quota exceeded for farm standing listings', e);
    }
  }, [farmStandingListings]);

  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [composeState, setComposeState] = useState<ComposeEmailInitialState | null>(null);

  useEffect(() => {
    setIsAuthLoading(true);
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleAccessToken(token);
        setIsAuthLoading(false);
      },
      () => {
        setGoogleUser(null);
        setGoogleAccessToken(null);
        setIsAuthLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (googleUser && googleUser.email) {
      setUserProfile(prev => {
        if (prev.email === googleUser.email && prev.id === googleUser.uid) {
          return prev;
        }
        return {
          ...prev,
          id: googleUser.uid || prev.id,
          email: googleUser.email,
          displayName: prev.displayName || googleUser.displayName || 'Exploitant Agricole',
          hasCompletedIdentification: true,
        };
      });
    }
  }, [googleUser]);

  const loginWithGoogle = async () => {
    try {
      setIsAuthLoading(true);
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleAccessToken(res.accessToken);
      }
      return res;
    } finally {
      setIsAuthLoading(false);
    }
  };

  const logoutFromGoogle = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setGoogleAccessToken(null);
  };

  const openComposeModal = (initial?: ComposeEmailInitialState) => {
    setComposeState(initial || {});
  };

  const closeComposeModal = () => {
    setComposeState(null);
  };

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY_LANG, lang);
      document.documentElement.setAttribute('lang', lang);
      document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
    document.documentElement.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
  }, [language]);

  const addNurseryLot = (lot: Omit<NurseryLot, 'id' | 'lastUpdated'>) => {
    if (!canManageNursery) {
      alert('Action refusée : Seuls les comptes pépiniéristes agréés ou administrateurs peuvent créer des lots de plants.');
      return;
    }

    const newLot: NurseryLot = {
      ...lot,
      id: 'lot-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId: (lot as any).userId || userProfile.id,
      sellerName: (lot as any).sellerName || userProfile.companyName || userProfile.displayName || 'Pépinière Agréée',
      sellerPhone: (lot as any).sellerPhone || userProfile.phone,
      sellerEmail: (lot as any).sellerEmail || userProfile.email,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    markItemAsOwned(newLot.id);
    setNurseryLots(prev => [newLot, ...prev]);

    // Déclenchement automatique d'alerte si le lot correspond aux centres d'intérêts de l'utilisateur
    if (notificationSettings.nurseryArrivalsAlerts) {
      const match = notificationSettings.nurseryInterestAlerts.find(
        w =>
          w.enabled &&
          ((w.speciesOrCategory &&
            (newLot.species.toLowerCase().includes(w.speciesOrCategory.toLowerCase()) ||
              newLot.category.toLowerCase().includes(w.speciesOrCategory.toLowerCase()))) ||
            (w.variety && newLot.variety.toLowerCase().includes(w.variety.toLowerCase())))
      );

      if (match) {
        const isCertified = newLot.onssaStatus.includes('ONSSA');
        if (!match.onssaOnly || isCertified) {
          const event: MarketplaceNotificationEvent = {
            id: `notif-lot-${Date.now()}`,
            type: 'new_nursery_lot',
            title: `🌱 Nouvel arrivage : ${newLot.species} (${newLot.variety})`,
            message: `${(newLot.quantityAvailable || 0).toLocaleString('fr-FR')} plants disponibles à ${newLot.unitPriceMAD} MAD/plant (${newLot.region || 'Maroc'}).`,
            timestamp: "À l'instant",
            read: false,
            targetId: newLot.id,
            targetTab: 'nursery',
            metadata: {
              quantity: newLot.quantityAvailable,
              variety: newLot.variety,
              region: newLot.region,
            },
          };

          if (notificationSettings.browserPushEnabled) {
            sendNewNurseryLotBrowserNotification({
              species: newLot.species,
              variety: newLot.variety,
              quantity: newLot.quantityAvailable,
              unitPrice: newLot.unitPriceMAD,
              region: newLot.region,
              onssaCertified: isCertified,
              lotId: newLot.id,
            });
          }

          if (notificationSettings.inAppToastEnabled) {
            setLatestMarketplaceToast(event);
          }

          setNotificationSettings(prev => ({
            ...prev,
            notificationHistory: [event, ...prev.notificationHistory],
          }));
        }
      }
    }
  };

  const updateNurseryLot = (id: string, updated: Partial<NurseryLot>) => {
    if (!canManageNursery) {
      alert('Action refusée : Seuls les comptes pépiniéristes agréés ou administrateurs peuvent modifier les lots de plants.');
      return;
    }

    setNurseryLots(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const next: NurseryLot = {
          ...item,
          ...updated,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
        const thresh = getLotThreshold(next);
        if (
          updated.quantityAvailable !== undefined &&
          item.quantityAvailable > thresh &&
          updated.quantityAvailable <= thresh
        ) {
          triggerLowStockAlert(next, updated.quantityAvailable, thresh);
        }
        return next;
      })
    );
  };

  const deleteNurseryLot = (id: string) => {
    if (!canManageNursery) {
      alert('Action refusée : Seuls les comptes pépiniéristes agréés ou administrateurs peuvent supprimer des lots.');
      return;
    }

    setNurseryLots(prev => prev.filter(l => l.id !== id));
  };

  const addTreatmentLog = (lotId: string, treatment: Omit<TreatmentLog, 'id'>) => {
    if (!canManageNursery) {
      alert('Action refusée : Seuls les comptes pépiniéristes agréés peuvent enregistrer des traitements sanitaires.');
      return;
    }

    const newTreatment: TreatmentLog = {
      ...treatment,
      id: 'trt-' + Date.now(),
    };
    setNurseryLots(prev =>
      prev.map(l => {
        if (l.id !== lotId) return l;
        return {
          ...l,
          treatments: [newTreatment, ...(l.treatments || [])],
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  const adjustStockQuantity = (lotId: string, changeAvailable: number, changeReserved = 0) => {
    if (!canManageNursery) {
      alert('Action refusée : Seuls les comptes pépiniéristes agréés peuvent ajuster les quantités en stock.');
      return;
    }
    setNurseryLots(prev =>
      prev.map(l => {
        if (l.id !== lotId) return l;
        const newAvailable = Math.max(0, l.quantityAvailable + changeAvailable);
        const newReserved = Math.max(0, l.quantityReserved + changeReserved);
        const thresh = getLotThreshold(l);

        // Detect transition from normal stock to low stock
        if (changeAvailable < 0 && l.quantityAvailable > thresh && newAvailable <= thresh) {
          triggerLowStockAlert(l, newAvailable, thresh);
        }

        return {
          ...l,
          quantityAvailable: newAvailable,
          quantityReserved: newReserved,
          quantityTotal: newAvailable + newReserved,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  const confirmAllNurseryLotsSyncedToday = useCallback(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    setNurseryLots(prev =>
      prev.map(l => ({
        ...l,
        lastUpdated: todayStr,
      }))
    );

    setDailySyncRecord(prev => {
      const updated: DailySyncRecord = {
        ...prev,
        lastSyncDate: todayStr,
        lastSyncTimeStr: timeStr,
        syncedLotsCount: nurseryLots.length,
        totalLotsCount: nurseryLots.length,
      };
      try {
        localStorage.setItem(STORAGE_KEY_DAILY_SYNC, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save daily sync record', e);
      }
      return updated;
    });
  }, [nurseryLots.length]);

  const batchUpdateNurseryLotsStock = useCallback(
    (updates: { id: string; quantityAvailable: number }[]) => {
      const todayStr = new Date().toISOString().split('T')[0];
      const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      const updateMap = new Map(updates.map(u => [u.id, u.quantityAvailable]));

      setNurseryLots(prev =>
        prev.map(lot => {
          if (updateMap.has(lot.id)) {
            const newAvailable = Math.max(0, updateMap.get(lot.id)!);
            const thresh = getLotThreshold(lot);
            if (lot.quantityAvailable > thresh && newAvailable <= thresh) {
              triggerLowStockAlert(lot, newAvailable, thresh);
            }
            return {
              ...lot,
              quantityAvailable: newAvailable,
              quantityTotal: newAvailable + lot.quantityReserved,
              lastUpdated: todayStr,
            };
          }
          return lot;
        })
      );

      setDailySyncRecord(prev => {
        const updated: DailySyncRecord = {
          ...prev,
          lastSyncDate: todayStr,
          lastSyncTimeStr: timeStr,
          syncedLotsCount: updates.length,
          totalLotsCount: nurseryLots.length,
        };
        try {
          localStorage.setItem(STORAGE_KEY_DAILY_SYNC, JSON.stringify(updated));
        } catch (e) {
          console.warn('Failed to save daily sync record', e);
        }
        return updated;
      });
    },
    [getLotThreshold, triggerLowStockAlert, nurseryLots.length]
  );

  const updateDailySyncSettings = useCallback((settings: Partial<DailySyncRecord>) => {
    setDailySyncRecord(prev => {
      const updated = { ...prev, ...settings };
      try {
        localStorage.setItem(STORAGE_KEY_DAILY_SYNC, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save daily sync settings', e);
      }
      return updated;
    });
  }, []);

  // Automated daily reminder: triggers browser notification once per session if not synced today
  useEffect(() => {
    if (!dailySyncRecord.reminderEnabled) return;
    const todayStr = new Date().toISOString().split('T')[0];
    if (dailySyncRecord.lastSyncDate === todayStr) return;

    const sessionKey = `agristock_daily_reminded_${todayStr}`;
    try {
      if (sessionStorage.getItem(sessionKey)) return;
      const unverifiedLots = nurseryLots.filter(l => l.lastUpdated !== todayStr);
      if (unverifiedLots.length > 0) {
        const didNotify = sendDailySyncReminderNotification(unverifiedLots.length);
        if (didNotify) {
          sessionStorage.setItem(sessionKey, 'true');
        }
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }, [dailySyncRecord, nurseryLots]);

  const addProduceListing = (listing: Omit<ProduceListing, 'id' | 'createdAt' | 'status'>) => {
    const newListing: ProduceListing = {
      ...listing,
      id: 'prod-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId: (listing as any).userId || userProfile.id,
      sellerName: (listing as any).sellerName || userProfile.companyName || userProfile.displayName || 'Producteur Maraîcher',
      phone: (listing as any).phone || userProfile.phone,
      whatsapp: (listing as any).whatsapp || userProfile.whatsapp || userProfile.phone,
      sellerEmail: (listing as any).sellerEmail || userProfile.email,
      status: 'Disponible',
      createdAt: new Date().toISOString().split('T')[0],
    };
    markItemAsOwned(newListing.id);
    setProduceListings(prev => [newListing, ...prev]);

    // Déclenchement automatique d'alerte si l'offre correspond à un seuil surveillé
    if (notificationSettings.priceDropAlerts && newListing.listingIntent !== 'buy') {
      const matchingWatch = notificationSettings.priceDropWatchList.find(
        w =>
          w.enabled &&
          ((w.produceName && newListing.title.toLowerCase().includes(w.produceName.toLowerCase())) ||
            (w.category && newListing.category.toLowerCase().includes(w.category.toLowerCase()))) &&
          (w.targetPriceMAD ? newListing.pricePerUnitMAD <= w.targetPriceMAD : true)
      );

      if (matchingWatch) {
        const dropEvent: MarketplaceNotificationEvent = {
          id: `notif-drop-${Date.now()}`,
          type: 'price_drop',
          title: `🎯 Offre ciblée : ${newListing.title} (${newListing.pricePerUnitMAD} MAD/${newListing.unit})`,
          message: `Nouvelle offre sous votre prix cible (${matchingWatch.targetPriceMAD || matchingWatch.currentPriceMAD} MAD) à ${newListing.locationCity || newListing.region}.`,
          timestamp: "À l'instant",
          read: false,
          targetId: newListing.id,
          targetTab: 'market',
          metadata: {
            oldPrice: matchingWatch.currentPriceMAD,
            newPrice: newListing.pricePerUnitMAD,
            dropPercent: Math.max(
              5,
              Math.round(
                ((matchingWatch.currentPriceMAD - newListing.pricePerUnitMAD) /
                  matchingWatch.currentPriceMAD) *
                  100
              )
            ),
            variety: newListing.variety,
            region: newListing.region,
          },
        };

        if (notificationSettings.browserPushEnabled) {
          sendPriceDropBrowserNotification({
            produceTitle: newListing.title,
            variety: newListing.variety,
            oldPrice: matchingWatch.currentPriceMAD,
            newPrice: newListing.pricePerUnitMAD,
            dropPercent: Math.max(
              5,
              Math.round(
                ((matchingWatch.currentPriceMAD - newListing.pricePerUnitMAD) /
                  matchingWatch.currentPriceMAD) *
                  100
              )
            ),
            unit: newListing.unit,
            locationCity: newListing.locationCity,
            listingId: newListing.id,
          });
        }

        if (notificationSettings.inAppToastEnabled) {
          setLatestMarketplaceToast(dropEvent);
        }

        setNotificationSettings(prev => ({
          ...prev,
          notificationHistory: [dropEvent, ...prev.notificationHistory],
        }));
      }
    }
  };

  const updateProducePrice = useCallback((id: string, newPriceMAD: number) => {
    setProduceListings(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const oldPrice = p.pricePerUnitMAD;
        const dropPercent = oldPrice > 0 ? Math.round(((oldPrice - newPriceMAD) / oldPrice) * 100) : 0;

        if (newPriceMAD < oldPrice && dropPercent >= 5 && notificationSettings.priceDropAlerts) {
          const dropEvent: MarketplaceNotificationEvent = {
            id: `prod-drop-${Date.now()}`,
            type: 'price_drop',
            title: `📉 Baisse de prix : ${p.title} (-${dropPercent}%)`,
            message: `Prix réduit de ${oldPrice.toFixed(2)} à ${newPriceMAD.toFixed(2)} MAD/${p.unit} à ${p.locationCity} (${p.region}). Offre disponible !`,
            timestamp: "À l'instant",
            read: false,
            targetId: p.id,
            targetTab: 'market',
            metadata: {
              oldPrice,
              newPrice: newPriceMAD,
              dropPercent,
              variety: p.variety,
              region: p.region,
            },
          };

          if (notificationSettings.browserPushEnabled) {
            sendPriceDropBrowserNotification({
              produceTitle: p.title,
              variety: p.variety,
              oldPrice,
              newPrice: newPriceMAD,
              dropPercent,
              unit: p.unit,
              locationCity: p.locationCity,
              listingId: p.id,
            });
          }

          if (notificationSettings.inAppToastEnabled) {
            setLatestMarketplaceToast(dropEvent);
          }

          setNotificationSettings(prevSettings => ({
            ...prevSettings,
            notificationHistory: [dropEvent, ...prevSettings.notificationHistory],
          }));
        }

        return {
          ...p,
          pricePerUnitMAD: newPriceMAD,
        };
      })
    );
  }, [notificationSettings.priceDropAlerts, notificationSettings.browserPushEnabled, notificationSettings.inAppToastEnabled]);

  const updateListingStatus = (id: string, status: 'Disponible' | 'Réservé' | 'Vendu') => {
    setProduceListings(prev =>
      prev.map(p => (p.id === id ? { ...p, status } : p))
    );
  };

  const updateProduceListing = useCallback((id: string, updated: Partial<ProduceListing>) => {
    setProduceListings(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updated } : p))
    );
  }, []);

  const deleteProduceListing = (id: string) => {
    setProduceListings(prev => prev.filter(p => p.id !== id));
  };

  const addFarmStandingListing = (listing: Omit<FarmStandingListing, 'id' | 'createdAt' | 'status'>) => {
    const newListing: FarmStandingListing = {
      ...listing,
      id: 'fsl-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId: (listing as any).userId || userProfile.id,
      sellerName: (listing as any).sellerName || userProfile.companyName || userProfile.displayName || 'Exploitant Agricole',
      sellerPhone: (listing as any).sellerPhone || userProfile.phone,
      sellerWhatsapp: (listing as any).sellerWhatsapp || userProfile.whatsapp || userProfile.phone,
      sellerEmail: (listing as any).sellerEmail || userProfile.email,
      status: 'Disponible',
      createdAt: new Date().toISOString().split('T')[0],
    };
    markItemAsOwned(newListing.id);
    setFarmStandingListings(prev => [newListing, ...prev]);
  };

  const updateFarmStandingListing = useCallback((id: string, updated: Partial<FarmStandingListing>) => {
    setFarmStandingListings(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updated } : item))
    );
  }, []);

  const updateFarmStandingStatus = (id: string, status: 'Disponible' | 'En négociation' | 'Vendu') => {
    setFarmStandingListings(prev =>
      prev.map(item => (item.id === id ? { ...item, status } : item))
    );
  };

  const deleteFarmStandingListing = (id: string) => {
    setFarmStandingListings(prev => prev.filter(item => item.id !== id));
  };

  const resetToSampleData = () => {
    setNurseryLots(INITIAL_NURSERY_LOTS);
    setProduceListings(INITIAL_PRODUCE_LISTINGS);
    setFarmStandingListings(INITIAL_FARM_STANDING_LISTINGS);
    localStorage.setItem(STORAGE_KEY_LOTS, JSON.stringify(INITIAL_NURSERY_LOTS));
    localStorage.setItem(STORAGE_KEY_PRODUCE, JSON.stringify(INITIAL_PRODUCE_LISTINGS));
    localStorage.setItem(STORAGE_KEY_FARM_STANDING, JSON.stringify(INITIAL_FARM_STANDING_LISTINGS));
  };

  // --- Import / Export en Lot & Bases Excel Stock ---
  const [isExcelStockModalOpen, setIsExcelStockModalOpen] = useState(false);
  const [excelStockInitialType, setExcelStockInitialType] = useState<ExcelStockType>('produce');

  const openExcelStockModal = useCallback((initialType?: ExcelStockType) => {
    if (initialType) {
      setExcelStockInitialType(initialType);
    } else {
      if (canManageNursery) setExcelStockInitialType('nursery');
      else if (canManageCarrier) setExcelStockInitialType('carrier');
      else if (userProfile.role === 'buyer') setExcelStockInitialType('buyer');
      else setExcelStockInitialType('produce');
    }
    setIsExcelStockModalOpen(true);
  }, [canManageNursery, canManageCarrier, userProfile.role]);

  const closeExcelStockModal = useCallback(() => {
    setIsExcelStockModalOpen(false);
  }, []);

  const bulkAddNurseryLots = useCallback((lots: Omit<NurseryLot, 'id' | 'lastUpdated'>[]): number => {
    const today = new Date().toISOString().split('T')[0];
    const newItems: NurseryLot[] = lots.map((lot, idx) => ({
      ...lot,
      id: `lot-bulk-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      userId: (lot as any).userId || userProfile.id,
      lastUpdated: today,
    }));
    setNurseryLots(prev => [...newItems, ...prev]);
    return newItems.length;
  }, [userProfile.id]);

  const bulkAddProduceListings = useCallback((listings: Omit<ProduceListing, 'id' | 'createdAt' | 'status'>[]): number => {
    const today = new Date().toISOString().split('T')[0];
    const newItems: ProduceListing[] = listings.map((item, idx) => ({
      ...item,
      id: `prod-bulk-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      userId: (item as any).userId || userProfile.id,
      status: 'Disponible' as const,
      createdAt: today,
    }));
    setProduceListings(prev => [...newItems, ...prev]);
    return newItems.length;
  }, [userProfile.id]);

  const bulkAddFarmStandingListings = useCallback((listings: Omit<FarmStandingListing, 'id' | 'createdAt' | 'status'>[]): number => {
    const today = new Date().toISOString().split('T')[0];
    const newItems: FarmStandingListing[] = listings.map((item, idx) => ({
      ...item,
      id: `fsl-bulk-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      userId: (item as any).userId || userProfile.id,
      status: 'Disponible' as const,
      createdAt: today,
    }));
    setFarmStandingListings(prev => [...newItems, ...prev]);
    return newItems.length;
  }, [userProfile.id]);

  const bulkAddCarrierVehicles = useCallback((vehicles: Omit<CarrierVehicle, 'id'>[]): number => {
    const newItems: CarrierVehicle[] = vehicles.map((veh, idx) => ({
      ...veh,
      id: `veh-bulk-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
    }));
    setCarrierVehicles(prev => [...newItems, ...prev]);
    return newItems.length;
  }, []);

  // Account & Stock Security Management
  const [isSessionUnlocked, setIsSessionUnlocked] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.isPasswordProtected) return true;
      }
    } catch {}
    return true;
  });

  const [activeGeneratedOTP, setActiveGeneratedOTP] = useState<string | null>(null);
  const [latestSecurityNotification, setLatestSecurityNotification] = useState<SecurityDispatchNotification | null>(null);

  const [isStockAuthModalOpen, setIsStockAuthModalOpen] = useState(false);
  const [stockAuthModalMode, setStockAuthModalMode] = useState<'verify_password' | 'setup_security'>('verify_password');
  const [pendingStockAction, setPendingStockAction] = useState<{ action: () => void; description?: string } | null>(null);

  const lockSession = useCallback(() => {
    setIsSessionUnlocked(false);
  }, []);

  const unlockSession = useCallback((passwordOrCode: string): { success: boolean; error?: string } => {
    const trimmed = passwordOrCode.trim();
    if (!trimmed) {
      return { success: false, error: 'Veuillez saisir votre mot de passe.' };
    }

    const savedPassword = userProfile.password;
    const isMatched = (savedPassword && trimmed === savedPassword) ||
                      (activeGeneratedOTP && trimmed === activeGeneratedOTP);

    if (isMatched) {
      setIsSessionUnlocked(true);
      return { success: true };
    }

    return { success: false, error: 'Mot de passe ou code incorrect.' };
  }, [userProfile.password, activeGeneratedOTP]);

  const setAccountSecurity = useCallback((params: {
    password: string;
    method: UserSecurityMethod;
    recoveryEmail?: string;
    recoveryPhone?: string;
  }) => {
    setUserProfile(prev => ({
      ...prev,
      isPasswordProtected: true,
      password: params.password,
      securityMethod: params.method,
      recoveryPhone: params.recoveryPhone || prev.phone,
      recoveryEmail: params.recoveryEmail || prev.email,
      lastProtectedAt: new Date().toISOString(),
    }));
    setIsSessionUnlocked(true);
  }, []);

  const removeAccountSecurity = useCallback((currentPassword: string) => {
    if (userProfile.password && currentPassword.trim() !== userProfile.password) {
      return { success: false, error: 'Mot de passe actuel incorrect.' };
    }
    setUserProfile(prev => ({
      ...prev,
      isPasswordProtected: false,
      password: undefined,
      securityMethod: undefined,
    }));
    setIsSessionUnlocked(true);
    return { success: true };
  }, [userProfile.password]);

  const sendSecurityOTP = useCallback((channel: 'sms' | 'email', target: string) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setActiveGeneratedOTP(code);

    const notification: SecurityDispatchNotification = {
      id: 'sec-' + Date.now(),
      channel,
      recipient: target,
      code,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message: channel === 'sms'
        ? `SMS AgriStock: Votre code de sécurité pour protéger et modifier vos stocks est: ${code}. Ne le communiquez à personne.`
        : `Email AgriStock: Code de validation de sécurité des stocks: ${code}. Valable 15 minutes.`,
    };

    setLatestSecurityNotification(notification);
    return { code, message: notification.message };
  }, []);

  const dismissSecurityNotification = useCallback(() => {
    setLatestSecurityNotification(null);
  }, []);

  const requestStockActionAuth = useCallback((action: () => void, actionDescription?: string) => {
    if (!userProfile.isPasswordProtected) {
      // Prompt user to setup security so that stocks cannot be tampered with
      setPendingStockAction({ action, description: actionDescription });
      setStockAuthModalMode('setup_security');
      setIsStockAuthModalOpen(true);
      return;
    }

    if (isSessionUnlocked) {
      action();
      return;
    }

    // Protected and locked: require authentication
    setPendingStockAction({ action, description: actionDescription });
    setStockAuthModalMode('verify_password');
    setIsStockAuthModalOpen(true);
  }, [userProfile.isPasswordProtected, isSessionUnlocked]);

  const executePendingStockAction = useCallback(() => {
    if (pendingStockAction) {
      pendingStockAction.action();
      setPendingStockAction(null);
    }
  }, [pendingStockAction]);

  const cancelPendingStockAction = useCallback(() => {
    setPendingStockAction(null);
  }, []);

  // --- 1. Escrow Transactions (Séquestre & Paiements Sécurisés) ---
  const [escrowTransactions, setEscrowTransactions] = useState<EscrowTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ESCROW);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load escrow transactions from localStorage', e);
    }
    return INITIAL_ESCROW_TRANSACTIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ESCROW, JSON.stringify(escrowTransactions));
    } catch (e) {
      console.warn('Storage quota exceeded for escrow', e);
    }
  }, [escrowTransactions]);

  const [isEscrowModalOpen, setIsEscrowModalOpen] = useState(false);
  const [activeEscrowItem, setActiveEscrowItem] = useState<{
    itemType: 'nursery_lot' | 'produce' | 'farm_standing';
    item: any;
    defaultQuantity?: number;
  } | null>(null);
  const [isEscrowListModalOpen, setIsEscrowListModalOpen] = useState(false);

  const openEscrowPayment = useCallback((
    itemType: 'nursery_lot' | 'produce' | 'farm_standing',
    item: any,
    defaultQuantity?: number
  ) => {
    // Règle stricte de conformité : Un annonceur ou vendeur ne doit jamais acheter ses propres produits
    if (isItemOwnedByUser(item, userProfile, googleUser)) {
      const toastEvent: MarketplaceNotificationEvent = {
        id: `own_product_guard_${Date.now()}`,
        type: 'new_nursery_lot',
        title: 'Auto-achat interdit',
        message: "En tant qu'annonceur / vendeur, vous ne pouvez pas acheter vos propres offres. Gérez votre lot depuis votre espace dédié.",
        timestamp: "À l'instant",
        read: false,
        targetTab: itemType === 'nursery_lot' ? 'nursery' : 'market',
      };
      setLatestMarketplaceToast(toastEvent);
      return;
    }

    setActiveEscrowItem({ itemType, item, defaultQuantity });
    setIsEscrowModalOpen(true);
  }, [userProfile, googleUser]);

  const closeEscrowPayment = useCallback(() => {
    setIsEscrowModalOpen(false);
    setActiveEscrowItem(null);
  }, []);

  const createEscrowTransaction = useCallback((data: {
    itemType: 'nursery_lot' | 'produce' | 'farm_standing';
    itemId: string;
    itemTitle: string;
    sellerName: string;
    sellerPhone?: string;
    buyerName: string;
    buyerPhone: string;
    buyerEmail: string;
    deliveryAddress: string;
    destinationCity: string;
    quantity: number;
    unit: string;
    unitPriceMAD: number;
    subtotalAmountMAD?: number;
    paymentMethod: 'carte_cmi' | 'stripe_card' | 'virement_sequestre';
    trackingCarrier?: string;
    notes?: string;
  }) => {
    // Calcul financier unifié - Source unique de vérité
    const breakdown = calculateFinancialBreakdown({
      quantity: data.quantity,
      unitPriceMAD: data.unitPriceMAD,
      isProCertified: userProfile.isProCertified,
    });

    const newTx: EscrowTransaction = {
      id: 'esc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      referenceNumber: `ESC-2026-MA-${Math.floor(1000 + Math.random() * 9000)}`,
      itemType: data.itemType,
      itemId: data.itemId,
      itemTitle: data.itemTitle,
      sellerName: data.sellerName,
      sellerPhone: data.sellerPhone,
      buyerName: data.buyerName,
      buyerPhone: data.buyerPhone,
      buyerEmail: data.buyerEmail,
      deliveryAddress: data.deliveryAddress,
      destinationCity: data.destinationCity,
      quantity: breakdown.quantity,
      unit: data.unit,
      unitPriceMAD: breakdown.unitPriceMAD,
      subtotalAmountMAD: breakdown.subtotalAmountMAD,
      platformCommissionRate: breakdown.commissionRate,
      platformCommissionMAD: breakdown.platformCommissionMAD,
      escrowGuaranteeFeeMAD: breakdown.escrowGuaranteeFeeMAD,
      totalPaidByBuyerMAD: breakdown.totalPaidByBuyerMAD,
      sellerPayoutAmountMAD: breakdown.sellerPayoutAmountMAD,
      paymentMethod: data.paymentMethod,
      paymentDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'funds_held',
      trackingCarrier: data.trackingCarrier || 'AgriFret Maroc Express',
      inspectionHoursRemaining: 48,
      notes: data.notes,
      statusHistory: [
        {
          status: 'funds_held',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          note: `Fonds de ${(breakdown.totalPaidByBuyerMAD || 0).toLocaleString('fr-FR')} MAD consignés et bloqués sur compte séquestre sécurisé.`,
        },
      ],
    };

    setEscrowTransactions(prev => [newTx, ...prev]);

    if (data.itemType === 'nursery_lot') {
      setNurseryLots(prev =>
        prev.map(lot =>
          lot.id === data.itemId
            ? {
                ...lot,
                quantityAvailable: Math.max(0, lot.quantityAvailable - data.quantity),
                quantityReserved: (lot.quantityReserved || 0) + data.quantity,
              }
            : lot
        )
      );
    }

    return newTx;
  }, [userProfile.isProCertified]);

  const updateEscrowStatus = useCallback((id: string, status: EscrowTransactionStatus, note?: string) => {
    setEscrowTransactions(prev =>
      prev.map(tx => {
        if (tx.id !== id) return tx;
        const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const defaultNotes: Record<EscrowTransactionStatus, string> = {
          funds_held: 'Fonds consignés sur compte séquestre.',
          in_transit: 'Marchandise expédiée avec transporteur.',
          delivered: 'Livraison réceptionnée par l\'acheteur. Contrôle de conformité en cours.',
          released: 'Conformité approuvée. Fonds débloqués et versés au vendeur.',
          disputed: 'Litige de conformité signalé par l\'acheteur.',
        };
        return {
          ...tx,
          status,
          statusHistory: [
            ...tx.statusHistory,
            {
              status,
              timestamp: now,
              note: note || defaultNotes[status],
            },
          ],
        };
      })
    );
  }, []);

  const releaseEscrowFunds = useCallback((id: string) => {
    updateEscrowStatus(id, 'released', 'L\'acheteur a confirmé la réception conforme. Les fonds sont débloqués et transférés au vendeur.');
  }, [updateEscrowStatus]);

  const openLitigation = useCallback((id: string, reason: string) => {
    setEscrowTransactions(prev =>
      prev.map(tx => {
        if (tx.id !== id) return tx;
        const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
        return {
          ...tx,
          status: 'disputed',
          disputeReason: reason,
          statusHistory: [
            ...tx.statusHistory,
            {
              status: 'disputed',
              timestamp: now,
              note: `Litige ouvert : ${reason}`,
            },
          ],
        };
      })
    );
  }, []);

  // --- 2. Boosts d'annonces (Visibilité Premium) ---
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [boostTarget, setBoostTarget] = useState<{
    type: 'nursery' | 'produce' | 'farm_standing';
    id: string;
    title: string;
    currentBoost?: string;
  } | null>(null);

  const openBoostModal = useCallback((
    type: 'nursery' | 'produce' | 'farm_standing',
    id: string,
    title: string,
    currentBoost?: string
  ) => {
    setBoostTarget({ type, id, title, currentBoost });
    setIsBoostModalOpen(true);
  }, []);

  const closeBoostModal = useCallback(() => {
    setIsBoostModalOpen(false);
    setBoostTarget(null);
  }, []);

  const boostListing = useCallback((
    type: 'nursery' | 'produce' | 'farm_standing',
    id: string,
    packageId: BoostPackageId
  ) => {
    const pkg = BOOST_PACKAGES.find(p => p.id === packageId);
    const days = pkg ? pkg.durationDays : 7;
    const expires = new Date();
    expires.setDate(expires.getDate() + days);
    const expiresStr = expires.toISOString().split('T')[0];

    if (type === 'nursery') {
      setNurseryLots(prev => {
        const boosted = prev.find(l => l.id === id);
        if (!boosted) return prev;
        const updated = {
          ...boosted,
          isFeatured: true,
          boostLevel: packageId,
          boostExpiresAt: expiresStr,
        };
        return [updated, ...prev.filter(l => l.id !== id)];
      });
    } else if (type === 'produce') {
      setProduceListings(prev => {
        const boosted = prev.find(l => l.id === id);
        if (!boosted) return prev;
        const updated = {
          ...boosted,
          isFeatured: true,
          boostLevel: packageId,
          boostExpiresAt: expiresStr,
        };
        return [updated, ...prev.filter(l => l.id !== id)];
      });
    } else if (type === 'farm_standing') {
      setFarmStandingListings(prev => {
        const boosted = prev.find(l => l.id === id);
        if (!boosted) return prev;
        const updated = {
          ...boosted,
          isFeatured: true,
          boostLevel: packageId,
        };
        return [updated, ...prev.filter(l => l.id !== id)];
      });
    }
  }, []);

  // --- 3. Profil Pro & Certification ---
  const [isProModalOpen, setIsProModalOpen] = useState(false);

  const upgradeToPro = useCallback((plan: 'monthly_pro' | 'annual_pro') => {
    const expires = new Date();
    expires.setMonth(expires.getMonth() + (plan === 'monthly_pro' ? 1 : 12));
    setUserProfile(prev => ({
      ...prev,
      isProCertified: true,
      proPlan: plan,
      proSince: new Date().toISOString().split('T')[0],
      proExpiresAt: expires.toISOString().split('T')[0],
      sellerCommissionRate: 0.035,
    }));
    setIsProModalOpen(false);
  }, []);

  // --- Recherche Vocale & Audio ---
  const [isAudioSearchModalOpen, setIsAudioSearchModalOpen] = useState(false);
  const [globalVoiceSearchQuery, setGlobalVoiceSearchQuery] = useState('');

  const openAudioSearchModal = useCallback(() => {
    setIsAudioSearchModalOpen(true);
  }, []);

  // --- 4. Services Logistiques & Transport ---
  const [transportBookings, setTransportBookings] = useState<TransportBooking[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TRANSPORT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load transport bookings', e);
    }
    return INITIAL_TRANSPORT_BOOKINGS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TRANSPORT, JSON.stringify(transportBookings));
    } catch (e) {
      console.warn('Storage quota exceeded for transport', e);
    }
  }, [transportBookings]);

  const [isLogisticsModalOpen, setIsLogisticsModalOpen] = useState(false);
  const [logisticsInitialData, setLogisticsInitialData] = useState<{
    originCity?: string;
    destinationCity?: string;
    cargoType?: CargoType;
    volumeTonnes?: number;
    itemTitle?: string;
  } | null>(null);

  const openLogisticsModal = useCallback((initialData?: {
    originCity?: string;
    destinationCity?: string;
    cargoType?: CargoType;
    volumeTonnes?: number;
    itemTitle?: string;
  }) => {
    setLogisticsInitialData(initialData || null);
    setIsLogisticsModalOpen(true);
  }, []);

  const closeLogisticsModal = useCallback(() => {
    setIsLogisticsModalOpen(false);
    setLogisticsInitialData(null);
  }, []);

  const createTransportBooking = useCallback((booking: Omit<TransportBooking, 'id' | 'bookingRef' | 'status' | 'bookedAt'>) => {
    const newBooking: TransportBooking = {
      ...booking,
      id: 'trp-' + Date.now(),
      bookingRef: `TRP-MA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'confirme',
      bookedAt: new Date().toISOString().split('T')[0],
    };
    setTransportBookings(prev => [newBooking, ...prev]);
    return newBooking;
  }, []);

  // --- 5. Publicité B2B Partenaires & Régie Pub Admin ---
  const ENRICHED_INITIAL_B2B_ADS: AgriB2BAd[] = useMemo(() => INITIAL_B2B_ADS.map((ad, idx) => ({
    ...ad,
    status: 'active' as const,
    placement: 'all' as const,
    monthlyFeeMAD: [2500, 3000, 2200, 2800][idx % 4],
    contactPerson: [
      'Directeur Commercial Souss',
      'Ingénieur Support Maghreb',
      'Responsable Plasticulture',
      'Dr. Agronome Responsable Labo'
    ][idx % 4],
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    clicksCount: [142, 98, 115, 87][idx % 4],
    viewsCount: [1850, 1420, 1630, 1290][idx % 4],
    createdAt: '2026-01-01',
  })), []);

  const [b2bAds, setB2bAds] = useState<AgriB2BAd[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_B2B_ADS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load b2bAds from localStorage', e);
    }
    return INITIAL_B2B_ADS.map((ad, idx) => ({
      ...ad,
      status: 'active' as const,
      placement: 'all' as const,
      monthlyFeeMAD: [2500, 3000, 2200, 2800][idx % 4],
      contactPerson: [
        'Directeur Commercial Souss',
        'Ingénieur Support Maghreb',
        'Responsable Plasticulture',
        'Dr. Agronome Responsable Labo'
      ][idx % 4],
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      clicksCount: [142, 98, 115, 87][idx % 4],
      viewsCount: [1850, 1420, 1630, 1290][idx % 4],
      createdAt: '2026-01-01',
    }));
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_B2B_ADS, JSON.stringify(b2bAds));
    } catch (e) {
      console.warn('Storage quota exceeded for b2bAds', e);
    }
  }, [b2bAds]);

  const addB2BAd = useCallback((adData: Omit<AgriB2BAd, 'id'>): AgriB2BAd => {
    const newAd: AgriB2BAd = {
      ...adData,
      id: `b2b-${Date.now()}`,
      status: adData.status || 'active',
      placement: adData.placement || 'all',
      clicksCount: adData.clicksCount || 0,
      viewsCount: adData.viewsCount || 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setB2bAds(prev => [newAd, ...prev]);
    return newAd;
  }, []);

  const updateB2BAd = useCallback((id: string, updates: Partial<AgriB2BAd>) => {
    setB2bAds(prev => prev.map(ad => ad.id === id ? { ...ad, ...updates } : ad));
  }, []);

  const deleteB2BAd = useCallback((id: string) => {
    setB2bAds(prev => prev.filter(ad => ad.id !== id));
  }, []);

  const toggleB2BAdStatus = useCallback((id: string) => {
    setB2bAds(prev => prev.map(ad => {
      if (ad.id === id) {
        const newStatus = ad.status === 'active' ? 'paused' : 'active';
        return { ...ad, status: newStatus };
      }
      return ad;
    }));
  }, []);

  const resetB2BAdsToDefault = useCallback(() => {
    const defaults = INITIAL_B2B_ADS.map((ad, idx) => ({
      ...ad,
      status: 'active' as const,
      placement: 'all' as const,
      monthlyFeeMAD: [2500, 3000, 2200, 2800][idx % 4],
      contactPerson: [
        'Directeur Commercial Souss',
        'Ingénieur Support Maghreb',
        'Responsable Plasticulture',
        'Dr. Agronome Responsable Labo'
      ][idx % 4],
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      clicksCount: [142, 98, 115, 87][idx % 4],
      viewsCount: [1850, 1420, 1630, 1290][idx % 4],
      createdAt: '2026-01-01',
    }));
    setB2bAds(defaults);
  }, []);

  const trackB2BAdClick = useCallback((id: string) => {
    setB2bAds(prev => prev.map(ad => ad.id === id ? { ...ad, clicksCount: (ad.clicksCount || 0) + 1 } : ad));
  }, []);

  const trackB2BAdView = useCallback((id: string) => {
    setB2bAds(prev => prev.map(ad => ad.id === id ? { ...ad, viewsCount: (ad.viewsCount || 0) + 1 } : ad));
  }, []);

  const [isB2BPartnerModalOpen, setIsB2BPartnerModalOpen] = useState(false);

  // --- 6. Protection des Coordonnées & Séquestre Plateforme ---
  const [platformPaymentProtected, setPlatformPaymentProtectedState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PAYMENT_PROTECTION);
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return true; // Active by default to protect payments and prevent direct bypass
  });

  const setPlatformPaymentProtected = useCallback((enabled: boolean) => {
    setPlatformPaymentProtectedState(enabled);
    try {
      localStorage.setItem(STORAGE_KEY_PAYMENT_PROTECTION, JSON.stringify(enabled));
    } catch {}
  }, []);

  const togglePlatformPaymentProtection = useCallback(() => {
    setPlatformPaymentProtected(!platformPaymentProtected);
  }, [platformPaymentProtected, setPlatformPaymentProtected]);

  const maskUserPhone = useCallback((phone?: string) => {
    if (!platformPaymentProtected) return phone || 'Non renseigné';
    return maskPhoneNumber(phone);
  }, [platformPaymentProtected]);

  const maskUserEmail = useCallback((email?: string) => {
    if (!platformPaymentProtected) return email || 'Non renseigné';
    return maskEmail(email);
  }, [platformPaymentProtected]);

  // --- 7. Espace de Discussion par Offre ---
  const [discussions, setDiscussions] = useState<Record<string, OfferDiscussionThread>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DISCUSSIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) {
      console.error('Failed to load discussions', e);
    }
    return INITIAL_OFFER_DISCUSSIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DISCUSSIONS, JSON.stringify(discussions));
    } catch (e) {
      console.warn('Storage quota exceeded for discussions', e);
    }
  }, [discussions]);

  const [activeDiscussionOffer, setActiveDiscussionOffer] = useState<{
    offerId: string;
    offerType: 'produce' | 'nursery' | 'farm_standing';
    offer: any;
  } | null>(null);

  const [isDiscussionsListModalOpen, setIsDiscussionsListModalOpen] = useState(false);

  const openOfferDiscussion = useCallback((
    offerId: string,
    offerType: 'produce' | 'nursery' | 'farm_standing',
    offer: any
  ) => {
    setDiscussions((prev) => {
      if (prev[offerId]) {
        return {
          ...prev,
          [offerId]: {
            ...prev[offerId],
            unreadCount: 0,
          },
        };
      }
      const newThread: OfferDiscussionThread = {
        offerId,
        offerType,
        offerTitle: offer.title || offer.species || 'Offre Agricole',
        offerPriceMAD: offer.pricePerUnitMAD || offer.unitPriceMAD || offer.pricePerHectareMAD || 0,
        offerUnit: offer.unit || (offer.surfaceHectares ? 'Ha' : 'Unité'),
        sellerName: offer.sellerName || 'Producteur',
        sellerRating: offer.rating || 4.9,
        buyerName: userProfile.displayName || 'Acheteur',
        unreadCount: 0,
        lastUpdated: 'À l\'instant',
        messages: [
          {
            id: 'msg-init-' + Date.now(),
            offerId,
            offerType,
            offerTitle: offer.title || offer.species || 'Offre Agricole',
            senderId: 'system',
            senderName: 'Sécurité Séquestre AgriMaroc',
            senderRole: 'seller',
            content: '🔒 Espace de négociation sécurisé ouvert. Discutez des volumes, prix et délais. Vos paiements sont garantis sous séquestre bancaire.',
            timestamp: 'À l\'instant',
            messageType: 'system',
          },
        ],
      };
      return {
        ...prev,
        [offerId]: newThread,
      };
    });

    setActiveDiscussionOffer({ offerId, offerType, offer });
  }, [userProfile.displayName]);

  const closeOfferDiscussion = useCallback(() => {
    setActiveDiscussionOffer(null);
  }, []);

  const sendOfferMessage = useCallback((
    offerId: string,
    content: string,
    options?: {
      messageType?: 'text' | 'price_offer' | 'escrow_prompt' | 'system';
      proposedPriceMAD?: number;
      proposedQuantity?: number;
      unit?: string;
    }
  ) => {
    let finalContent = content;
    let phoneMaskedWarning = false;
    if (platformPaymentProtected) {
      const filtered = filterChatMessage(content);
      finalContent = filtered.filteredText;
      phoneMaskedWarning = filtered.hasMaskedContent;
    }

    const nowStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const newMsg: OfferChatMessage = {
      id: 'msg-' + Date.now(),
      offerId,
      offerType: activeDiscussionOffer?.offerType || 'produce',
      offerTitle: activeDiscussionOffer?.offer?.title || 'Offre Agricole',
      senderId: userProfile.id || 'usr-me',
      senderName: userProfile.displayName || (userProfile.role === 'seller' ? 'Vendeur' : 'Acheteur'),
      senderRole: userProfile.role || 'buyer',
      content: finalContent,
      timestamp: 'Aujourd\'hui à ' + nowStr,
      messageType: options?.messageType || 'text',
      proposedPriceMAD: options?.proposedPriceMAD,
      proposedQuantity: options?.proposedQuantity,
      unit: options?.unit,
      offerStatus: options?.messageType === 'price_offer' ? 'pending' : undefined,
      phoneMaskedWarning,
    };

    setDiscussions((prev) => {
      const existing = prev[offerId];
      if (!existing) return prev;
      return {
        ...prev,
        [offerId]: {
          ...existing,
          lastUpdated: 'À l\'instant',
          messages: [...existing.messages, newMsg],
        },
      };
    });
  }, [platformPaymentProtected, activeDiscussionOffer, userProfile]);

  const acceptPriceOffer = useCallback((offerId: string, messageId: string) => {
    setDiscussions((prev) => {
      const existing = prev[offerId];
      if (!existing) return prev;
      const updatedMessages = existing.messages.map((m) => {
        if (m.id === messageId) {
          return { ...m, offerStatus: 'accepted' as const };
        }
        return m;
      });
      const sysMsg: OfferChatMessage = {
        id: 'msg-accept-' + Date.now(),
        offerId,
        offerType: existing.offerType,
        offerTitle: existing.offerTitle,
        senderId: 'system',
        senderName: 'Séquestre Plateforme',
        senderRole: 'seller',
        content: '✅ Offre de prix acceptée ! Vous pouvez maintenant cliquer sur "Payer sous Séquestre" pour sécuriser la commande.',
        timestamp: 'À l\'instant',
        messageType: 'escrow_prompt',
      };
      return {
        ...prev,
        [offerId]: {
          ...existing,
          messages: [...updatedMessages, sysMsg],
        },
      };
    });
  }, []);

  const totalUnreadDiscussionsCount = (Object.values(discussions) as OfferDiscussionThread[]).reduce(
    (acc, thread) => acc + (thread.unreadCount || 0),
    0
  );

  // --- 8. Système de Notation par Étoiles & Fidélisation ---
  const [reviews, setReviews] = useState<UserReview[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REVIEWS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load reviews', e);
    }
    return INITIAL_USER_REVIEWS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
    } catch (e) {
      console.warn('Storage quota exceeded for reviews', e);
    }
  }, [reviews]);

  const [ratingModalTarget, setRatingModalTarget] = useState<{
    sellerName: string;
    offerTitle?: string;
    offerId?: string;
  } | null>(null);

  const openRatingModal = useCallback((
    sellerName: string,
    offerTitle?: string,
    offerId?: string
  ) => {
    setRatingModalTarget({ sellerName, offerTitle, offerId });
  }, []);

  const closeRatingModal = useCallback(() => {
    setRatingModalTarget(null);
  }, []);

  const addReview = useCallback((reviewData: Omit<UserReview, 'id' | 'date'>) => {
    const newRev: UserReview = {
      ...reviewData,
      id: 'rev-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
    };
    setReviews((prev) => [newRev, ...prev]);

    const targetName = reviewData.targetSellerName.toLowerCase().trim();
    setProduceListings((prev) =>
      prev.map((p) => {
        if (p.sellerName.toLowerCase().trim() === targetName) {
          const currentRating = p.rating || 4.8;
          const currentCount = p.reviewsCount || 10;
          const newAvg = Math.round(((currentRating * currentCount + reviewData.rating) / (currentCount + 1)) * 10) / 10;
          return { ...p, rating: newAvg, reviewsCount: currentCount + 1 };
        }
        return p;
      })
    );
    setNurseryLots((prev) =>
      prev.map((n) => {
        if (n.sellerName && n.sellerName.toLowerCase().trim() === targetName) {
          const currentRating = n.rating || 4.9;
          const currentCount = n.reviewsCount || 10;
          const newAvg = Math.round(((currentRating * currentCount + reviewData.rating) / (currentCount + 1)) * 10) / 10;
          return { ...n, rating: newAvg, reviewsCount: currentCount + 1 };
        }
        return n;
      })
    );
    setFarmStandingListings((prev) =>
      prev.map((f) => {
        if (f.sellerName.toLowerCase().trim() === targetName) {
          const currentRating = f.rating || 4.8;
          const currentCount = f.reviewsCount || 8;
          const newAvg = Math.round(((currentRating * currentCount + reviewData.rating) / (currentCount + 1)) * 10) / 10;
          return { ...f, rating: newAvg, reviewsCount: currentCount + 1 };
        }
        return f;
      })
    );
  }, []);

  const getSellerReviews = useCallback((sellerName: string) => {
    const clean = sellerName.toLowerCase().trim();
    return reviews.filter(
      (r) => r.targetSellerName.toLowerCase().trim() === clean
    );
  }, [reviews]);

  const getSellerReputation = useCallback((sellerName: string): SellerReputation => {
    const sellerRevs = getSellerReviews(sellerName);
    if (sellerRevs.length === 0) {
      return {
        sellerName,
        averageRating: 4.9,
        totalReviews: 14,
        badge: 'Fournisseur Certifié',
        satisfactionRatePercent: 98,
      };
    }
    const avg =
      sellerRevs.reduce((acc, r) => acc + r.rating, 0) / sellerRevs.length;
    const roundedAvg = Math.round(avg * 10) / 10;
    return {
      sellerName,
      averageRating: roundedAvg,
      totalReviews: sellerRevs.length,
      badge: roundedAvg >= 4.8 ? 'Top Vendeur 5★' : 'Fournisseur Certifié',
      satisfactionRatePercent: Math.min(100, Math.round((roundedAvg / 5) * 100)),
    };
  }, [getSellerReviews]);

  // ====================================================
  // 16. Espace Administrateur & Autorisations RBAC
  // ====================================================
  const [adminSession, setAdminSession] = useState<AdminSession | null>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY_ADMIN_SESSION);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load admin session', e);
    }
    return null;
  });

  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState<boolean>(false);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PLATFORM_SETTINGS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // fallback
    }
    return DEFAULT_PLATFORM_SETTINGS;
  });

  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);

  const [userAccountsList, setUserAccountsList] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER_ACCOUNTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = [...parsed];
          for (const initUser of INITIAL_PLATFORM_USERS) {
            const exists = merged.some(
              u =>
                u.id === initUser.id ||
                (u.email && initUser.email && u.email.toLowerCase() === initUser.email.toLowerCase())
            );
            if (!exists) {
              merged.push(initUser);
            }
          }
          return merged;
        }
      }
    } catch (e) {
      // fallback
    }
    return INITIAL_PLATFORM_USERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER_ACCOUNTS, JSON.stringify(userAccountsList));
    } catch (e) {
      // ignore
    }
  }, [userAccountsList]);

  // Load Firestore settings & logs on mount
  useEffect(() => {
    loadPlatformSettings().then((s) => setPlatformSettings(s));
    getAdminAuditLogs().then((logs) => setAuditLogs(logs));
  }, []);

  const loadAuditLogs = useCallback(async () => {
    const logs = await getAdminAuditLogs();
    setAuditLogs(logs);
  }, []);

  // Auto-authenticate admin if Google Auth matches Mounir or authorized admin email
  useEffect(() => {
    if (googleUser && googleUser.email && !adminSession) {
      const email = googleUser.email.toLowerCase();
      if (email === 'mounir.arb@gmail.com' || email.endsWith('@agristock.ma')) {
        const session: AdminSession = {
          uid: googleUser.uid,
          email: googleUser.email,
          displayName: googleUser.displayName || 'Mounir (Super Admin)',
          role: 'super_admin',
          jobTitle: 'Super Administrateur Système',
          permissions: [
            'overview',
            'pub',
            'pepinieres',
            'market',
            'transport',
            'escrow',
            'commissions',
            'users',
            'moderation',
            'documents',
            'audit',
            'admin_roles',
          ],
          loginAt: new Date().toISOString(),
          token: `google_admin_${Date.now()}`,
        };
        setAdminSession(session);
        try {
          sessionStorage.setItem(STORAGE_KEY_ADMIN_SESSION, JSON.stringify(session));
        } catch (e) {
          // ignore
        }
      }
    }
  }, [googleUser, adminSession]);

  const isAdminAuthenticated = Boolean(adminSession && adminSession.token);

  // Administration strictement séparée des rôles commerciaux
  const canManageAdmin = useMemo(() => {
    return Boolean(adminSession && adminSession.token) || userProfile.role === 'admin';
  }, [adminSession, userProfile.role]);

  const adminLogin = useCallback(
    async (email: string, passkey: string): Promise<{ success: boolean; error?: string }> => {
      const result = await verifyAdminCredentials(email, passkey);
      if (result.success && result.session) {
        setAdminSession(result.session);
        try {
          sessionStorage.setItem(STORAGE_KEY_ADMIN_SESSION, JSON.stringify(result.session));
        } catch (e) {
          // ignore
        }
        // Charger les logs en arrière-plan sans bloquer la navigation de l'administrateur
        void loadAuditLogs();
        return { success: true };
      }
      return { success: false, error: result.error || 'Accès refusé' };
    },
    [loadAuditLogs]
  );

  const adminLogout = useCallback(async () => {
    if (adminSession) {
      await logAdminAction({
        adminEmail: adminSession.email,
        adminName: adminSession.displayName,
        actionType: 'LOGOUT',
        targetType: 'platform_settings',
        targetId: 'admin_auth',
        targetSummary: 'Déconnexion de l\'Espace Administrateur',
      });
    }
    setAdminSession(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY_ADMIN_SESSION);
    } catch (e) {
      // ignore
    }
    if (activeTab === 'admin') {
      setActiveTab('home');
    }
  }, [adminSession, activeTab]);

  const updatePlatformSettingsHandler = useCallback(
    async (newSettings: Partial<PlatformSettings>) => {
      if (!adminSession) return;
      const merged = { ...platformSettings, ...newSettings };
      setPlatformSettings(merged);
      await savePlatformSettings(merged, adminSession);
      await loadAuditLogs();
    },
    [adminSession, platformSettings, loadAuditLogs]
  );

  const suspendUserAccount = useCallback(
    async (userId: string, userName: string, reason: string) => {
      if (!adminSession) return;
      setUserAccountsList((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                status: 'suspended',
                suspendedReason: reason,
                suspendedAt: new Date().toISOString(),
              }
            : u
        )
      );
      await saveUserAccountStatus({
        userId,
        userName,
        newStatus: 'suspended',
        reason,
        admin: adminSession,
      });
      await loadAuditLogs();
    },
    [adminSession, loadAuditLogs]
  );

  const reactivateUserAccount = useCallback(
    async (userId: string, userName: string) => {
      if (!adminSession) return;
      setUserAccountsList((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                status: 'active',
                suspendedReason: undefined,
                suspendedAt: undefined,
              }
            : u
        )
      );
      await saveUserAccountStatus({
        userId,
        userName,
        newStatus: 'active',
        admin: adminSession,
      });
      await loadAuditLogs();
    },
    [adminSession, loadAuditLogs]
  );

  const updateUserRoleByAdmin = useCallback(
    async (userId: string, newRole: UserRole) => {
      if (!adminSession) return;
      setUserAccountsList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
      await logAdminAction({
        adminEmail: adminSession.email,
        adminName: adminSession.displayName,
        actionType: 'UPDATE_USER_ROLE',
        targetType: 'user',
        targetId: userId,
        targetSummary: `Changement de rôle utilisateur vers "${newRole}"`,
        newValue: newRole,
      });
      await loadAuditLogs();
    },
    [adminSession, loadAuditLogs]
  );

  // Validation administrative des profils professionnels (Par l'Admin AGRISTOCK)
  const validateUserProfessionalProfile = useCallback(
    async (userId: string, targetStatus: 'verified' | 'rejected' = 'verified') => {
      const isApproved = targetStatus === 'verified';
      setUserAccountsList(prev =>
        prev.map(u =>
          u.id === userId
            ? {
                ...u,
                verificationStatus: isApproved ? 'active' : 'rejected',
                isProCertified: isApproved,
              }
            : u
        )
      );
      if (userProfile.id === userId) {
        setUserProfile(prev => ({
          ...prev,
          verificationStatus: isApproved ? 'active' : 'rejected',
          isProCertified: isApproved,
        }));
      }
      if (adminSession) {
        await logAdminAction({
          adminEmail: adminSession.email,
          adminName: adminSession.displayName,
          actionType: 'VALIDATE_PRO_PROFILE',
          targetType: 'user',
          targetId: userId,
          targetSummary: isApproved
            ? 'Validation officielle du profil professionnel et des agréments'
            : 'Rejet des pièces justificatives du profil professionnel',
        });
        await loadAuditLogs();
      }
      await updateUserProfileInFirestore(userId, {
        verificationStatus: isApproved ? 'active' : 'rejected',
        isProCertified: isApproved,
      });
    },
    [adminSession, loadAuditLogs, userProfile.id]
  );

  const moderateListing = useCallback(
    async (
      listingId: string,
      listingTitle: string,
      listingType: 'nursery_lot' | 'produce' | 'farm_standing',
      status: ModerationStatus,
      reason?: string
    ) => {
      if (!adminSession) return;

      if (listingType === 'nursery_lot') {
        setNurseryLots((prev) =>
          prev.map((l) =>
            l.id === listingId
              ? {
                  ...l,
                  moderationStatus: status,
                  moderationReason: reason,
                  moderatedAt: new Date().toISOString(),
                  moderatedBy: adminSession.displayName,
                }
              : l
          )
        );
      } else if (listingType === 'produce') {
        setProduceListings((prev) =>
          prev.map((p) =>
            p.id === listingId
              ? {
                  ...p,
                  moderationStatus: status,
                  moderationReason: reason,
                  moderatedAt: new Date().toISOString(),
                  moderatedBy: adminSession.displayName,
                }
              : p
          )
        );
      } else if (listingType === 'farm_standing') {
        setFarmStandingListings((prev) =>
          prev.map((f) =>
            f.id === listingId
              ? {
                  ...f,
                  moderationStatus: status,
                  moderationReason: reason,
                  moderatedAt: new Date().toISOString(),
                  moderatedBy: adminSession.displayName,
                }
              : f
          )
        );
      }

      await saveListingModeration({
        listingId,
        listingTitle,
        listingType,
        newStatus: status,
        reason,
        admin: adminSession,
      });
      await loadAuditLogs();
    },
    [adminSession, loadAuditLogs]
  );

  const updateTransactionCommission = useCallback(
    async (transactionId: string, newRate: number) => {
      if (!adminSession) return;
      setEscrowTransactions((prev) =>
        prev.map((tx) => {
          if (tx.id === transactionId) {
            const newCommissionMAD = Math.round(tx.subtotalAmountMAD * newRate);
            const newSellerPayoutMAD = tx.subtotalAmountMAD - newCommissionMAD;
            return {
              ...tx,
              platformCommissionRate: newRate,
              platformCommissionMAD: newCommissionMAD,
              sellerPayoutAmountMAD: newSellerPayoutMAD,
            };
          }
          return tx;
        })
      );
      await logAdminAction({
        adminEmail: adminSession.email,
        adminName: adminSession.displayName,
        actionType: 'UPDATE_COMMISSION',
        targetType: 'escrow',
        targetId: transactionId,
        targetSummary: `Ajustement commission transaction #${transactionId}`,
        details: `Nouveau taux: ${(newRate * 100).toFixed(1)}%`,
        newValue: `${(newRate * 100).toFixed(1)}%`,
      });
      await loadAuditLogs();
    },
    [adminSession, loadAuditLogs]
  );

  const updateTransportCommission = useCallback(
    async (bookingId: string, newRate: number) => {
      if (!adminSession) return;
      setTransportBookings((prev) =>
        prev.map((b) => {
          if (b.id === bookingId) {
            const newCommissionMAD = Math.round(b.totalPriceMAD * newRate);
            const newCarrierPayoutMAD = b.totalPriceMAD - newCommissionMAD;
            return {
              ...b,
              platformCommissionMAD: newCommissionMAD,
              carrierPayoutMAD: newCarrierPayoutMAD,
            };
          }
          return b;
        })
      );
      await logAdminAction({
        adminEmail: adminSession.email,
        adminName: adminSession.displayName,
        actionType: 'UPDATE_COMMISSION',
        targetType: 'system',
        targetId: bookingId,
        targetSummary: `Ajustement commission transport #${bookingId}`,
        details: `Nouveau taux commission transport: ${(newRate * 100).toFixed(1)}%`,
        newValue: `${(newRate * 100).toFixed(1)}%`,
      });
      await loadAuditLogs();
    },
    [adminSession, loadAuditLogs]
  );

  const updateTransactionStatus = useCallback(
    async (transactionId: string, status: PlatformStatus, reason?: string) => {
      if (!adminSession) return;

      let escrowStatus: EscrowTransactionStatus = 'funds_held';
      if (status === 'EN COURS') escrowStatus = 'in_transit';
      else if (status === 'TERMINÉ') escrowStatus = 'released';
      else if (status === 'LITIGE') escrowStatus = 'disputed';
      else if (status === 'VALIDÉ') escrowStatus = 'delivered';

      setEscrowTransactions((prev) =>
        prev.map((tx) => {
          if (tx.id === transactionId) {
            return {
              ...tx,
              adminStatus: status,
              status: escrowStatus,
              disputeReason: status === 'LITIGE' ? (reason || 'Litige déclaré par l\'administration') : tx.disputeReason,
              statusHistory: [
                ...tx.statusHistory,
                {
                  status: escrowStatus,
                  timestamp: new Date().toISOString(),
                  note: `Statut administratif mis à jour vers: ${status}. ${reason || ''}`.trim(),
                },
              ],
            };
          }
          return tx;
        })
      );

      await logAdminAction({
        adminEmail: adminSession.email,
        adminName: adminSession.displayName,
        actionType: 'UPDATE_ORDER_STATUS',
        targetType: 'order',
        targetId: transactionId,
        targetSummary: `Statut passé à "${status}" pour #${transactionId}`,
        details: reason ? `Motif: ${reason}` : undefined,
        newValue: status,
      });
      await loadAuditLogs();
    },
    [adminSession, loadAuditLogs]
  );

  const resolveDispute = useCallback(
    async (
      transactionId: string,
      ruling: 'refund_buyer' | 'pay_seller' | 'split_50_50',
      notes: string
    ) => {
      if (!adminSession) return;

      setEscrowTransactions((prev) =>
        prev.map((tx) => {
          if (tx.id === transactionId) {
            const nextStatus: EscrowTransactionStatus =
              ruling === 'pay_seller' ? 'released' : 'disputed';
            return {
              ...tx,
              status: nextStatus,
              adminStatus: ruling === 'pay_seller' ? 'TERMINÉ' : 'VALIDÉ',
              disputeRuling: ruling,
              disputeResolvedAt: new Date().toISOString(),
              disputeResolvedBy: adminSession.displayName,
              statusHistory: [
                ...tx.statusHistory,
                {
                  status: nextStatus,
                  timestamp: new Date().toISOString(),
                  note: `Arbitrage litige rendu: ${ruling}. Notes: ${notes}`,
                },
              ],
            };
          }
          return tx;
        })
      );

      await logAdminAction({
        adminEmail: adminSession.email,
        adminName: adminSession.displayName,
        actionType: 'RESOLVE_DISPUTE',
        targetType: 'escrow',
        targetId: transactionId,
        targetSummary: `Arbitrage litige #${transactionId}: ${ruling}`,
        details: notes,
        newValue: ruling,
      });
      await loadAuditLogs();
    },
    [adminSession, loadAuditLogs]
  );

  const toggleBoostListing = useCallback(
    async (
      listingId: string,
      listingType: 'nursery_lot' | 'produce' | 'farm_standing',
      active: boolean
    ) => {
      if (!adminSession) return;

      if (listingType === 'nursery_lot') {
        setNurseryLots((prev) =>
          prev.map((l) =>
            l.id === listingId
              ? {
                  ...l,
                  isFeatured: active,
                  boostLevel: active ? 'intensive_7d' : undefined,
                }
              : l
          )
        );
      } else if (listingType === 'produce') {
        setProduceListings((prev) =>
          prev.map((p) =>
            p.id === listingId
              ? {
                  ...p,
                  isFeatured: active,
                  boostLevel: active ? 'intensive_7d' : undefined,
                }
              : p
          )
        );
      } else if (listingType === 'farm_standing') {
        setFarmStandingListings((prev) =>
          prev.map((f) =>
            f.id === listingId
              ? {
                  ...f,
                  isFeatured: active,
                  boostLevel: active ? 'intensive_7d' : undefined,
                }
              : f
          )
        );
      }

      await logAdminAction({
        adminEmail: adminSession.email,
        adminName: adminSession.displayName,
        actionType: 'TOGGLE_BOOST',
        targetType: 'boost',
        targetId: listingId,
        targetSummary: `${active ? 'Activation' : 'Désactivation'} Boost sponsorisé #${listingId}`,
      });
      await loadAuditLogs();
    },
    [adminSession, loadAuditLogs]
  );

  // ====================================================
  // 17. Gestion des Rôles & Volets Administrateurs (Super Admin)
  // ====================================================
  const [administratorAccounts, setAdministratorAccounts] = useState<AdministratorAccount[]>(() => {
    return getAdministratorAccounts();
  });

  useEffect(() => {
    saveAdministratorAccounts(administratorAccounts);
  }, [administratorAccounts]);

  const isSuperAdmin = useMemo(() => {
    // 1. Session admin active en cours
    if (adminSession) {
      const email = (adminSession.email || '').toLowerCase();
      if (
        adminSession.role === 'super_admin' ||
        email === 'mounir.arb@gmail.com' ||
        email === 'superadmin@agristock.ma' ||
        email === 'admin@agristock.ma'
      ) {
        return true;
      }
    }
    // 2. Utilisateur authentifié via Google ou profil utilisateur Super Admin
    const currentEmail = (userProfile?.email || googleUser?.email || '').toLowerCase();
    if (
      currentEmail === 'mounir.arb@gmail.com' ||
      currentEmail === 'superadmin@agristock.ma' ||
      currentEmail.endsWith('@agristock.ma')
    ) {
      return true;
    }
    // 3. Rôle admin dans userProfile
    if (userProfile?.role === 'admin') {
      return true;
    }
    return false;
  }, [adminSession, userProfile?.email, userProfile?.role, googleUser?.email]);

  // Sauvegarde & Export Système JSON - STRICTEMENT RÉSERVÉ AU SUPER ADMIN
  const exportDataJSON = useCallback((): string => {
    if (!isSuperAdmin) {
      console.warn("Accès refusé : l'export de données JSON est strictement réservé au Super Administrateur.");
      throw new Error("Action non autorisée : L'export de données JSON est strictement réservé au Super Administrateur.");
    }
    const backup = {
      version: '1.2',
      exportedAt: new Date().toISOString(),
      exportedBy: adminSession?.displayName || userProfile?.displayName || 'Super Admin',
      nurseryLots,
      produceListings,
      farmStandingListings,
      b2bAds,
      exportManifests,
      administratorAccounts,
    };
    return JSON.stringify(backup, null, 2);
  }, [
    isSuperAdmin,
    adminSession?.displayName,
    userProfile?.displayName,
    nurseryLots,
    produceListings,
    farmStandingListings,
    b2bAds,
    exportManifests,
    administratorAccounts,
  ]);

  const importDataJSON = useCallback((jsonStr: string): boolean => {
    if (!isSuperAdmin) {
      console.warn("Accès refusé : l'import de données JSON est strictement réservé au Super Administrateur.");
      throw new Error("Action non autorisée : L'import de données JSON est strictement réservé au Super Administrateur.");
    }
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.nurseryLots)) {
        setNurseryLots(data.nurseryLots);
      }
      if (Array.isArray(data.produceListings)) {
        setProduceListings(data.produceListings);
      }
      if (Array.isArray(data.farmStandingListings)) {
        setFarmStandingListings(data.farmStandingListings);
      }
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }, [isSuperAdmin]);

  const hasAdminPermission = useCallback(
    (permission: AdminModulePermission): boolean => {
      if (!adminSession) return false;
      if (isSuperAdmin) return true;
      if (Array.isArray(adminSession.permissions) && adminSession.permissions.includes(permission)) {
        return true;
      }
      return false;
    },
    [adminSession, isSuperAdmin]
  );

  const createAdministratorAccount = useCallback(
    async (accountData: Omit<AdministratorAccount, 'id' | 'createdAt'>) => {
      if (!adminSession) return;
      const newAccount: AdministratorAccount = {
        ...accountData,
        id: `adm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        createdAt: new Date().toISOString(),
      };
      setAdministratorAccounts((prev) => [newAccount, ...prev]);
      await saveAdminAccountAudit({
        account: newAccount,
        action: 'CREATE_ADMIN',
        admin: adminSession,
        details: `Création de l'administrateur ${newAccount.displayName} (${newAccount.jobTitle}) avec les volets : ${newAccount.permissions.join(', ')}`,
      });
      await loadAuditLogs();
    },
    [adminSession, loadAuditLogs]
  );

  const updateAdministratorAccount = useCallback(
    async (account: AdministratorAccount) => {
      if (!adminSession) return;
      setAdministratorAccounts((prev) =>
        prev.map((a) => (a.id === account.id ? account : a))
      );
      if (adminSession.email.toLowerCase() === account.email.toLowerCase()) {
        setAdminSession((prev) =>
          prev
            ? {
                ...prev,
                displayName: account.displayName,
                role: account.role,
                jobTitle: account.jobTitle,
                permissions: account.permissions,
              }
            : null
        );
      }
      await saveAdminAccountAudit({
        account,
        action: 'UPDATE_ADMIN_PERMISSIONS',
        admin: adminSession,
        details: `Mise à jour des volets autorisés : ${account.permissions.join(', ')} (Rôle: ${account.role})`,
      });
      await loadAuditLogs();
    },
    [adminSession, loadAuditLogs]
  );

  const toggleAdministratorStatus = useCallback(
    async (adminId: string, reason?: string) => {
      if (!adminSession) return;
      let targetAcc: AdministratorAccount | undefined;
      setAdministratorAccounts((prev) =>
        prev.map((a) => {
          if (a.id === adminId) {
            const nextStatus = a.status === 'active' ? 'suspended' : 'active';
            targetAcc = { ...a, status: nextStatus };
            return targetAcc;
          }
          return a;
        })
      );
      if (targetAcc) {
        await saveAdminAccountAudit({
          account: targetAcc,
          action: targetAcc.status === 'suspended' ? 'SUSPEND_ADMIN' : 'REACTIVATE_ADMIN',
          admin: adminSession,
          details: reason || `Statut passé à ${targetAcc.status}`,
        });
        await loadAuditLogs();
      }
    },
    [adminSession, loadAuditLogs]
  );

  const deleteAdministratorAccount = useCallback(
    async (adminId: string) => {
      if (!adminSession) return;
      const targetAcc = administratorAccounts.find((a) => a.id === adminId);
      if (!targetAcc) return;
      if (targetAcc.email === 'mounir.arb@gmail.com' || targetAcc.email === 'admin@agristock.ma') {
        return;
      }
      setAdministratorAccounts((prev) => prev.filter((a) => a.id !== adminId));
      await saveAdminAccountAudit({
        account: targetAcc,
        action: 'DELETE_ADMIN',
        admin: adminSession,
        details: `Suppression du profil administrateur ${targetAcc.displayName}`,
      });
      await loadAuditLogs();
    },
    [adminSession, administratorAccounts, loadAuditLogs]
  );

  const switchAdminSessionPreview = useCallback(
    (adminId: string | null) => {
      if (!adminId) {
        const superAdminAcc = administratorAccounts.find((a) => a.role === 'super_admin') || {
          id: 'adm_super_mounir',
          email: 'mounir.arb@gmail.com',
          displayName: 'Mounir (Super Admin)',
          role: 'super_admin' as const,
          jobTitle: 'Super Administrateur Système',
          permissions: [
            'overview',
            'pub',
            'pepinieres',
            'market',
            'transport',
            'escrow',
            'commissions',
            'users',
            'moderation',
            'documents',
            'audit',
            'admin_roles',
          ] as AdminModulePermission[],
        };
        const restoredSession: AdminSession = {
          uid: superAdminAcc.id,
          email: superAdminAcc.email,
          displayName: superAdminAcc.displayName,
          role: 'super_admin',
          jobTitle: superAdminAcc.jobTitle,
          permissions: [
            'overview',
            'pub',
            'pepinieres',
            'market',
            'transport',
            'escrow',
            'commissions',
            'users',
            'moderation',
            'documents',
            'audit',
            'admin_roles',
          ],
          loginAt: new Date().toISOString(),
          token: `super_adm_${Date.now()}`,
        };
        setAdminSession(restoredSession);
        try {
          sessionStorage.setItem(STORAGE_KEY_ADMIN_SESSION, JSON.stringify(restoredSession));
        } catch (e) {
          // ignore
        }
        return;
      }

      const target = administratorAccounts.find((a) => a.id === adminId);
      if (!target) return;

      const previewSession: AdminSession = {
        uid: target.id,
        email: target.email,
        displayName: `${target.displayName} (Aperçu Volet)`,
        role: target.role,
        jobTitle: target.jobTitle,
        permissions: target.permissions,
        loginAt: new Date().toISOString(),
        token: `preview_adm_${Date.now()}`,
      };
      setAdminSession(previewSession);
      try {
        sessionStorage.setItem(STORAGE_KEY_ADMIN_SESSION, JSON.stringify(previewSession));
      } catch (e) {
        // ignore
      }
    },
    [administratorAccounts]
  );

  // 18. Synchronisation Temps Réel (CMI, Bourse Climat, ONSSA)
  const [isDataSyncing, setIsDataSyncing] = useState<boolean>(false);
  const [lastDataSyncTime, setLastDataSyncTime] = useState<string | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>(() => dataSyncService.getSyncLogs());

  const triggerManualSync = useCallback(async () => {
    setIsDataSyncing(true);
    try {
      await dataSyncService.syncAll({
        nurseryId: userProfile?.id || 'nurs-active-01',
        nurseryLots,
        orders: escrowTransactions,
      });
      setLastDataSyncTime(new Date().toLocaleTimeString(language === 'ar' ? 'ar-MA' : 'fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }));
      setSyncLogs(dataSyncService.getSyncLogs());
    } catch (err) {
      console.error('[AppContext] Sync error:', err);
    } finally {
      setIsDataSyncing(false);
    }
  }, [userProfile?.id, nurseryLots, escrowTransactions, language]);

  // Synchronisation périodique automatique en arrière-plan
  useEffect(() => {
    // 1. Initialisation légère
    triggerManualSync();

    // 2. Écouteur des mises à jour de sync
    const unsubscribe = dataSyncService.subscribe((_log) => {
      setLastDataSyncTime(new Date().toLocaleTimeString(language === 'ar' ? 'ar-MA' : 'fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }));
      setSyncLogs(dataSyncService.getSyncLogs());
    });

    // 3. Sync CMI toutes les heures
    const cmiInterval = setInterval(() => {
      if (escrowTransactions && escrowTransactions.length > 0) {
        escrowTransactions.slice(0, 3).forEach(tx => {
          dataSyncService.syncOrdersWithCMI(tx.id).catch(console.error);
        });
      }
    }, 60 * 60 * 1000);

    // 4. Sync Bourse Climat 2x par jour (12 heures)
    const climateInterval = setInterval(() => {
      dataSyncService.syncClimateDataForAllLots(nurseryLots).catch(console.error);
    }, 12 * 60 * 60 * 1000);

    // 5. Sync ONSSA hebdomadaire (7 jours)
    const onssaInterval = setInterval(() => {
      dataSyncService.syncONSSACertifications(userProfile?.id || 'nurs-active-01').catch(console.error);
    }, 7 * 24 * 60 * 60 * 1000);

    return () => {
      unsubscribe();
      clearInterval(cmiInterval);
      clearInterval(climateInterval);
      clearInterval(onssaInterval);
    };
  }, []);

  // 19. Logique Simplifiée & Rôles
  const [isRoleOnboardingOpen, setIsRoleOnboardingOpen] = useState<boolean>(() => {
    try {
      const hasChosen = localStorage.getItem('agristock_has_chosen_role_v1');
      return !hasChosen;
    } catch {
      return false;
    }
  });

  const [isSimpleOrderModalOpen, setIsSimpleOrderModalOpen] = useState(false);
  const [simpleOrderItem, setSimpleOrderItem] = useState<any>(null);

  const openSimpleOrder = useCallback((item: any) => {
    setSimpleOrderItem(item);
    setIsSimpleOrderModalOpen(true);
  }, []);

  const closeSimpleOrder = useCallback(() => {
    setIsSimpleOrderModalOpen(false);
    setSimpleOrderItem(null);
  }, []);

  const [isOfferDetailModalOpen, setIsOfferDetailModalOpen] = useState(false);
  const [selectedOfferForDetail, setSelectedOfferForDetail] = useState<any>(null);

  const openOfferDetail = useCallback((item: any) => {
    setSelectedOfferForDetail(item);
    setIsOfferDetailModalOpen(true);
  }, []);

  const closeOfferDetail = useCallback(() => {
    setIsOfferDetailModalOpen(false);
    setSelectedOfferForDetail(null);
  }, []);

  const [isSimpleCreateOfferOpen, setIsSimpleCreateOfferOpen] = useState(false);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        activeTab,
        setActiveTab,
        nurseryLots,
        produceListings,
        farmStandingListings,
        wholesalePrices,
        addNurseryLot,
        updateNurseryLot,
        deleteNurseryLot,
        addTreatmentLog,
        adjustStockQuantity,
        addProduceListing,
        updateProducePrice,
        updateProduceListing,
        updateListingStatus,
        deleteProduceListing,
        addFarmStandingListing,
        updateFarmStandingListing,
        updateFarmStandingStatus,
        deleteFarmStandingListing,
        resetToSampleData,
        exportDataJSON,
        importDataJSON,
        bulkAddNurseryLots,
        bulkAddProduceListings,
        bulkAddFarmStandingListings,
        bulkAddCarrierVehicles,
        isExcelStockModalOpen,
        setIsExcelStockModalOpen,
        excelStockInitialType,
        openExcelStockModal,
        closeExcelStockModal,
        userProfile,
        setUserProfile,
        setUserRole,
        isIdentificationModalOpen,
        setIsIdentificationModalOpen,
        // Inscription & Authentification Multi-Rôles
        isRegistrationModalOpen,
        setIsRegistrationModalOpen,
        isLoginModalOpen,
        setIsLoginModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        // Configuration Pépinière Dédiée
        isNurserySetupModalOpen,
        setIsNurserySetupModalOpen,
        openNurserySetupModal,
        closeNurserySetupModal,
        saveNurserySetupConfig,
        // Scanner & Traçabilité QR Code Terrain (Champ-au-Marché)
        isFieldQRScannerModalOpen,
        setIsFieldQRScannerModalOpen,
        openFieldQRScannerModal,
        closeFieldQRScannerModal,
        fieldQRScannerInitialBatch,
        registerAccount,
        loginAccount,
        logoutAccount,
        sendPasswordReset,
        updateProfileData,
        validateUserProfessionalProfile,
        // Security features
        isSessionUnlocked,
        unlockSession,
        lockSession,
        setAccountSecurity,
        removeAccountSecurity,
        sendSecurityOTP,
        latestSecurityNotification,
        dismissSecurityNotification,
        requestStockActionAuth,
        isStockAuthModalOpen,
        setIsStockAuthModalOpen,
        stockAuthModalMode,
        setStockAuthModalMode,
        pendingStockActionDescription: pendingStockAction?.description || null,
        cancelPendingStockAction,
        executePendingStockAction,
        // Gmail & Google Auth integration
        googleUser,
        googleAccessToken,
        isAuthLoading,
        loginWithGoogle,
        logoutFromGoogle,
        composeState,
        openComposeModal,
        closeComposeModal,
        // 1. Escrow (Paiement Séquestre & Commission)
        escrowTransactions,
        createEscrowTransaction,
        updateEscrowStatus,
        releaseEscrowFunds,
        openLitigation,
        isEscrowModalOpen,
        setIsEscrowModalOpen,
        activeEscrowItem,
        openEscrowPayment,
        closeEscrowPayment,
        isEscrowListModalOpen,
        setIsEscrowListModalOpen,
        // 2. Options de visibilité (Boosts)
        boostListing,
        isBoostModalOpen,
        setIsBoostModalOpen,
        boostTarget,
        openBoostModal,
        closeBoostModal,
        // 3. Profil Pro & Certification
        isProModalOpen,
        setIsProModalOpen,
        upgradeToPro,
        // Recherche Vocale & Audio
        isAudioSearchModalOpen,
        setIsAudioSearchModalOpen,
        openAudioSearchModal,
        globalVoiceSearchQuery,
        setGlobalVoiceSearchQuery,
        // 4. Services Logistiques & Transport
        transportBookings,
        createTransportBooking,
        isLogisticsModalOpen,
        setIsLogisticsModalOpen,
        logisticsInitialData,
        openLogisticsModal,
        closeLogisticsModal,
        // 5. Publicité B2B Partenaires & Régie Pub Admin
        b2bAds,
        isB2BPartnerModalOpen,
        setIsB2BPartnerModalOpen,
        addB2BAd,
        updateB2BAd,
        deleteB2BAd,
        toggleB2BAdStatus,
        resetB2BAdsToDefault,
        trackB2BAdClick,
        trackB2BAdView,
        // 6. Protection des Coordonnées & Séquestre Plateforme
        platformPaymentProtected,
        setPlatformPaymentProtected,
        togglePlatformPaymentProtection,
        maskUserPhone,
        maskUserEmail,
        // 7. Espace de Discussion par Offre
        discussions,
        activeDiscussionOffer,
        openOfferDiscussion,
        closeOfferDiscussion,
        sendOfferMessage,
        acceptPriceOffer,
        isDiscussionsListModalOpen,
        setIsDiscussionsListModalOpen,
        totalUnreadDiscussionsCount,
        // 8. Système de Notation par Étoiles & Fidélisation
        reviews,
        addReview,
        getSellerReviews,
        getSellerReputation,
        ratingModalTarget,
        openRatingModal,
        closeRatingModal,
        // 9. Navigation ciblée depuis la page d'accueil
        nurseryDepartmentFilter,
        setNurseryDepartmentFilter,
        produceCategoryFilter,
        setProduceCategoryFilter,
        produceIntentFilter,
        setProduceIntentFilter,
        navigateToNurseryDepartment,
        navigateToProduceCategory,
        // 10. Système d'Alerte Stock Bas (Pépinières)
        lowStockConfig,
        updateDefaultLowStockThreshold,
        updateVarietyLowStockThreshold,
        removeVarietyLowStockThreshold,
        toggleBrowserNotifications,
        getLotThreshold,
        isLotLowStock,
        lowStockLots,
        isLowStockSettingsModalOpen,
        setIsLowStockSettingsModalOpen,
        latestLowStockAlert,
        dismissLowStockAlert,
        triggerLowStockAlert,
        // 11. Statut Officiel & Conformité Légale CNDP
        isOfficialComplianceModalOpen,
        setIsOfficialComplianceModalOpen,
        // 12. Comparatif de Marché & Avantages Concurrentiels
        isBenchmarkModalOpen,
        setIsBenchmarkModalOpen,
        // 13. Système de Rappel & Quick Sync Quotidien
        dailySyncRecord,
        confirmAllNurseryLotsSyncedToday,
        batchUpdateNurseryLotsStock,
        updateDailySyncSettings,
        isQuickSyncModalOpen,
        setIsQuickSyncModalOpen,
        // 14. Manuel d'utilisation Téléchargeable
        isUserManualModalOpen,
        setIsUserManualModalOpen,
        userManualInitialChapter,
        openUserManual,
        // 15. Module Manifestes d'Export Standardisés
        exportManifests,
        isExportManifestModalOpen,
        setIsExportManifestModalOpen,
        activeExportManifestId,
        setActiveExportManifestId,
        prepopulatedListingForManifest,
        openExportManifestModal,
        createExportManifest,
        updateExportManifest,
        deleteExportManifest,
        generateManifestFromListing,
        // 16. Espace Administrateur & Autorisations RBAC
        adminSession,
        isAdminAuthenticated,
        isAdminLoginModalOpen,
        setIsAdminLoginModalOpen,
        adminLogin,
        adminLogout,
        auditLogs,
        loadAuditLogs,
        platformSettings,
        updatePlatformSettings: updatePlatformSettingsHandler,
        userAccountsList,
        suspendUserAccount,
        reactivateUserAccount,
        updateUserRoleByAdmin,
        moderateListing,
        updateTransactionCommission,
        updateTransportCommission,
        updateTransactionStatus,
        resolveDispute,
        toggleBoostListing,
        // 17. Gestion des Rôles & Volets Administrateurs (Super Admin)
        administratorAccounts,
        createAdministratorAccount,
        updateAdministratorAccount,
        toggleAdministratorStatus,
        deleteAdministratorAccount,
        switchAdminSessionPreview,
        hasAdminPermission,
        isSuperAdmin,
        // Support Multi-rôles & Espaces Métiers
        switchActiveRole,
        updateUserRoles,
        requestRoleActivation,
        canManageNursery,
        canManageSeller,
        canManageCarrier,
        canManageAdmin,
        roleSwitchToast,
        dismissRoleSwitchToast,
        buyerActiveSubTab,
        setBuyerActiveSubTab,
        favoriteIds,
        toggleFavorite,
        isFavorite,
        // Flotte & Logistique Transporteur
        carrierVehicles,
        addCarrierVehicle,
        updateCarrierVehicleStatus,
        transportTripRequests,
        addTransportTripRequest,
        updateTransportTripStatus,
        // 17. Système d'Alertes Personnalisées (Baisses de Prix & Arrivages Pépinières)
        notificationSettings,
        updateNotificationSettings,
        addPriceDropWatch,
        removePriceDropWatch,
        togglePriceDropWatch,
        addNurseryInterestWatch,
        removeNurseryInterestWatch,
        toggleNurseryInterestWatch,
        isNotificationSettingsModalOpen,
        setIsNotificationSettingsModalOpen,
        activeNotificationSettingsTab,
        setActiveNotificationSettingsTab,
        openNotificationSettings,
        triggerSimulatedNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotificationHistory,
        unreadNotificationsCount,
        latestMarketplaceToast,
        dismissMarketplaceToast,
        // 18. Synchronisation Temps Réel (CMI, Bourse Climat, ONSSA)
        isDataSyncing,
        lastDataSyncTime,
        triggerManualSync,
        syncLogs,
        // 19. Logique Simplifiée & Rôles
        isRoleOnboardingOpen,
        setIsRoleOnboardingOpen,
        isSimpleOrderModalOpen,
        simpleOrderItem,
        openSimpleOrder,
        closeSimpleOrder,
        isOfferDetailModalOpen,
        selectedOfferForDetail,
        openOfferDetail,
        closeOfferDetail,
        isSimpleCreateOfferOpen,
        setIsSimpleCreateOfferOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const useAppContext = useApp;

