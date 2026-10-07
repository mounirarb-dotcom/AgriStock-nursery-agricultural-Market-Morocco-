export type MoroccanRegion =
  | 'Souss-Massa (Agadir, Taroudant, Chtouka)'
  | 'L\'Oriental (Berkane, Oujda, Nador)'
  | 'Gharb - Chrarda (Kénitra, Sidi Slimane)'
  | 'Fès - Meknès (Saïss, El Hajeb, Sefrou)'
  | 'Marrakech - Safi (Haouz, El Kelaâ)'
  | 'Béni Mellal - Khénifra (Tadla)'
  | 'Drâa - Tafilalet (Zagora, Errachidia)'
  | 'Tanger - Tétouan - Al Hoceïma (Loukkos, Larache)'
  | 'Casablanca - Settat & Doukkala';

export type NurseryCategory =
  | 'Plantes Ornementales & Espaces Verts (Palmiers, Bougainvilliers, Lauriers, Gazon...)'
  | 'Jeunes Plants de Légumes & Maraîchage (Tomate, Poivron, Pastèque, Oignon...)'
  | 'Arbres Fruitiers (Agrumes, Olivier, Palmier...)'
  | 'Plants Maraîchers (Tomate, Poivron, Pastèque...)'
  | 'Plantes Ornementales'
  | 'Petits Fruits & Baies (Fraisier, Myrtillier)'
  | 'Porte-greffes & Écussons'
  | 'Arganier & Plantes Terroir';

export type GrowthStage =
  | 'Semis / Germination'
  | 'Greffage en cours'
  | 'Sevrage & Élevage'
  | 'Prêt à la plantation (Commercialisable)';

export type ONSSAStatus =
  | 'ONSSA Certifié (Catégorie Bleue)'
  | 'ONSSA Base (Catégorie Blanche)'
  | 'ONSSA Standard Contrôlé (Catégorie Jaune)'
  | 'En cours d\'homologation'
  | 'Conventionnel';

export type HealthStatus = 'Excellent' | 'Bon' | 'À surveiller' | 'En traitement';
export type NurseryStockStatus = 'In Stock' | 'Reserved' | 'Sold';

export interface TreatmentLog {
  id: string;
  date: string;
  product: string;
  targetPest: string; // e.g. "Mouche blanche (Bemisia)", "Oïdium", "Cochenille"
  dose: string;
  technician: string;
}

export interface NurseryOrnamentalDetails {
  ornamentalType?:
    | 'Arbre d\'alignement & ombrage'
    | 'Arbuste & Haie décorative'
    | 'Palmier, Yucca & Cycas'
    | 'Cactée, Succulente & Agave'
    | 'Plante grimpante'
    | 'Vivace, Graminée & Couvre-sol'
    | 'Gazon naturel en rouleaux';
  plantForm?:
    | 'Arbre Tige (tronc unique)'
    | 'Cépée (multi-troncs)'
    | 'Touffe / Buisson ramifié'
    | 'Pyramide / Topiaire'
    | 'Grimpante sur tuteur / Bambou'
    | 'Rampant / Tapissant'
    | "Bonsaï d'extérieur / Forme libre";
  plantHeight?: string; // e.g. "40-60 cm", "80-100 cm", "125-150 cm", "175-200 cm", "2.5-3 m", "4m+"
  trunkCircumference?: string; // e.g. "Calibre 8/10", "10/12", "12/14", "14/16", "16/18", "20/25 cm"
  palmStipeHeight?: string; // e.g. "Stipe 50 cm", "Stipe 1 m", "Stipe 1.5 m", "Stipe 2 m+"
  sunExposure?: 'Plein soleil' | 'Mi-ombre' | 'Ombre';
  waterRequirement?: 'Faible (Xérophyte / Résistant sécheresse)' | 'Modéré' | 'Élevé';
  foliageType?: 'Persistant' | 'Caduc' | 'Semi-persistant';
  floweringSeason?: string; // e.g. "Printemps-Été", "Presque toute l'année", "Automne"
  flowerColor?: string; // e.g. "Violet", "Blanc", "Rose", "Jaune", "Rouge", "Orange"
  landscapeUsage?: string; // e.g. "Haie brise-vue", "Alignement voirie & avenues", "Sujet spécimen isolé", "Rocaille & Massif", "Jardinière & terrasse"
}

export interface NurseryLot {
  id: string;
  userId?: string; // Identifiant unique du propriétaire / pépiniériste
  batchNumber: string; // e.g. LOT-2025-OLV-042
  species: string; // e.g. Olivier (Olea europaea)
  variety: string; // e.g. Picholine Marocaine, Menara, Haouzia
  category: NurseryCategory;
  rootstock?: string; // e.g. Bigaradier, Citrange Carrizo, Picholine franc
  propagationMethod: 'Semis' | 'Bouturage' | 'Greffage' | 'In Vitro (Micropropagation)';
  stage: GrowthStage;
  quantityTotal: number;
  quantityAvailable: number;
  quantityReserved: number;
  unitPriceMAD: number; // in Dirham
  containerType: string;
  greenhouseLocation: string; // e.g. Serre 4 - Secteur Ombragé
  seedingOrGraftDate: string;
  estimatedReadyDate: string;
  onssaStatus: ONSSAStatus;
  phytosanitaryPassportNumber: string; // e.g. ONSSA-MA-2025-PP-8842
  healthStatus: HealthStatus;
  region: MoroccanRegion;
  treatments: TreatmentLog[];
  imageUrl?: string;
  additionalImages?: string[];
  isCustomPhoto?: boolean;
  notes?: string;
  lastUpdated: string;
  ornamentalDetails?: NurseryOrnamentalDetails;
  isFeatured?: boolean;
  boostLevel?: 'flash_3d' | 'intensive_7d' | 'mega_14d';
  boostExpiresAt?: string;
  sellerName?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  sellerIsPro?: boolean;
  verifiedAgriForex?: boolean;
  rating?: number;
  reviewsCount?: number;
  lowStockThreshold?: number; // Configurable low-stock alert threshold for this specific lot
  moderationStatus?: ModerationStatus;
  moderationReason?: string;
  moderatedAt?: string;
  moderatedBy?: string;
  status?: NurseryStockStatus;
}

export interface LowStockAlertConfig {
  defaultThreshold: number; // e.g. 500 plants
  varietyThresholds: Record<string, number>; // variety name -> custom threshold
  browserNotificationsEnabled: boolean;
}

export interface PriceDropAlertItem {
  id: string;
  produceName: string;
  category?: ProduceCategory;
  variety?: string;
  maxTargetPrice?: number;
  minDropPercent: number;
  region?: string;
  enabled: boolean;
  createdAt: string;
}

export interface NurseryInterestAlertItem {
  id: string;
  speciesOrCategory: string;
  variety?: string;
  onssaOnly: boolean;
  minQuantity: number;
  region?: string;
  enabled: boolean;
  createdAt: string;
}

export interface MarketplaceNotificationEvent {
  id: string;
  type: 'price_drop' | 'new_nursery_lot';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  targetId?: string;
  targetTab: 'market' | 'nursery' | 'wholesale';
  metadata?: {
    oldPrice?: number;
    newPrice?: number;
    dropPercent?: number;
    quantity?: number;
    variety?: string;
    region?: string;
  };
}

export interface NotificationSettings {
  priceDropAlertsEnabled: boolean;
  nurseryAlertsEnabled: boolean;
  browserPushEnabled: boolean;
  inAppToastEnabled: boolean;
  emailAlertsEnabled: boolean;
  whatsappAlertsEnabled: boolean;
  globalMinPriceDropPercent: number;
  priceDropWatches: PriceDropAlertItem[];
  nurseryInterestWatches: NurseryInterestAlertItem[];
  notificationHistory: MarketplaceNotificationEvent[];
}

export type ProduceCategory =
  | 'Fruit'
  | 'Légume'
  | 'Plants & Pépinière'
  | 'Élevage & Bétail'
  | 'Machinisme & Équipements'
  | 'Fourrage & Intrants';

export type LivestockSubCategory = 'bovins' | 'ovins' | 'caprins';

export type ListingIntent = 'sell' | 'buy'; // 'sell' = Vente, 'buy' = Achat

export interface ProduceListing {
  id: string;
  userId?: string; // Identifiant unique du propriétaire / vendeur
  title: string;
  category: ProduceCategory;
  variety: string;
  region: MoroccanRegion;
  locationCity: string;
  quantityAvailable: number;
  unit: 'Tonnes' | 'Kg' | 'Caisses (10kg)' | 'Palettes' | 'Plants' | 'Têtes / Bêtes' | 'Unités / Matériel' | 'Bottes';
  minOrderQuantity: number;
  pricePerUnitMAD: number;
  priceType: 'Départ ferme (Sortie de champ)' | 'Rendu marché de gros' | 'Prix négociable' | 'Budget max achat';
  calibre: string; // e.g. "Calibre 1 (54-58mm)", "Extra", "Catégorie I", "Âge 14 mois", "Année 2021"
  packaging: string; // e.g. "Caisses IFCO", "Bétaillère", "Palettes Euro", "Vrac benne"
  harvestDate: string;
  certifications: ('ONSSA Homologué' | 'GlobalG.A.P' | 'Bio Maroc' | 'IGP Maroc' | 'Export Ready' | 'Vérifié AgriForex' | 'Vaccination Certifiée')[];
  sellerName: string;
  sellerType: 'Agriculteur / Producteur' | 'Coopérative Agricole' | 'Pépiniériste Agréé' | 'Négociant / Exportateur' | 'Éleveur Certifié' | 'Acheteur / Grossiste';
  phone: string;
  whatsapp: string;
  sellerEmail?: string;
  description: string;
  imageUrl: string;
  additionalImages?: string[];
  isCustomPhoto?: boolean;
  isFeatured?: boolean;
  boostLevel?: 'flash_3d' | 'intensive_7d' | 'mega_14d';
  boostExpiresAt?: string;
  sellerIsPro?: boolean;
  rating?: number;
  reviewsCount?: number;
  status: 'Disponible' | 'Réservé' | 'Vendu';
  createdAt: string;
  listingIntent?: ListingIntent; // 'sell' (Vente) ou 'buy' (Achat)
  verifiedAgriForex?: boolean;
  targetBudgetMAD?: number;
  machineryYear?: number;
  machineryHours?: number;
  livestockAgeMonths?: number;
  livestockSubCategory?: LivestockSubCategory; // 'bovins' | 'ovins' | 'caprins'
  livestockBreed?: string; // Race (ex: Sardi, Timahdite, Beni Guil, D'man, Montbéliarde, Holstein, Charolaise, Chèvre Alpine, etc.)
  livestockHeadCount?: number; // Nombre de têtes
  livestockAverageWeightKg?: number; // Poids moyen (kg)
  livestockHealthCertificate?: string; // N° Certificat sanitaire vétérinaire / Agrément ONSSA / N° Boucle SNIT
  livestockVaccinationStatus?: string; // Statut vaccinal (Fièvre aphteuse, Clavelée, Entérotoxémie)
  livestockPurpose?: 'Engraissement / Boucherie' | 'Élevage / Reproduction' | 'Laitier' | 'Aïd Al-Adha' | 'Génisses pleines';
  livestockDiet?: 'Pâturage naturel' | 'Alimentation composée & foin' | 'Mixte';
  cheptelPhotoUrl?: string; // Photo cheptel
  batchNumber?: string; // e.g. LOT-PRD-2025-089 pour traçabilité & inventaire
  phytosanitaryPassport?: string; // N° agrément station ou passeport ONSSA
  moderationStatus?: ModerationStatus;
  moderationReason?: string;
  moderatedAt?: string;
  moderatedBy?: string;
}

export interface WholesaleMarketPrice {
  id: string;
  commodity: string;
  commodityAr: string;
  category: 'Fruit' | 'Légume' | 'Élevage & Viande' | 'Céréales & Huile' | 'Fourrage & Aliments';
  marketName: string;
  minPriceMAD: number;
  maxPriceMAD: number;
  averagePriceMAD: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  variationPercent: number;
  lastUpdated: string;
  regionalQuotes?: { market: string; avgPriceMAD: number; trend: 'up' | 'down' | 'stable' }[];
}

export interface FarmStandingListing {
  id: string;
  userId?: string; // Identifiant unique du propriétaire / exploitant
  title: string;
  cropCategory: 'Agrumes (Clémentines, Oranges...)' | 'Olivier (Huile & Table)' | 'Maraîchage Plein Champ (Pastèque, Melon, Pomme de terre...)' | 'Rosacées (Pommiers, Pêchers, Abricotiers)' | 'Céréales & Légumineuses' | 'Autre culture';
  variety: string;
  region: MoroccanRegion;
  locationDetails: string;
  surfaceHectares: number; // Superficie en Hectares
  pricePerHectareMAD: number; // Prix de vente au forfait par hectare (MAD/ha)
  estimatedTotalYieldTonnes?: number; // Rendement total estimé (en tonnes)
  estimatedYieldPerHaTonnes?: number; // Rendement moyen estimé par hectare (T/ha)
  harvestReadyDate: string; // Période ou date de récolte
  irrigationType: 'Goutte-à-goutte (Puits & Bassin)' | 'Gravitaire (Tour d\'eau)' | 'Pivot / Aspersion' | 'Bour (Pluvial)';
  pickingCondition: 'Sur pied - Cueillette & transport à charge de l\'acheteur' | 'Vente négociable avec ouvriers' | 'Récolté départ bord champ';
  sellerName: string;
  sellerPhone: string;
  sellerWhatsapp: string;
  sellerEmail?: string;
  description: string;
  imageUrl: string;
  isFeatured?: boolean;
  boostLevel?: 'flash_3d' | 'intensive_7d' | 'mega_14d';
  sellerIsPro?: boolean;
  rating?: number;
  reviewsCount?: number;
  status: 'Disponible' | 'En négociation' | 'Vendu';
  createdAt: string;
  moderationStatus?: ModerationStatus;
  moderationReason?: string;
  moderatedAt?: string;
  moderatedBy?: string;
}

export type AppTab =
  | 'home'
  | 'landing'
  | 'buyer_space'
  | 'nursery'
  | 'market'
  | 'favorites'
  | 'farm_standing'
  | 'wholesale'
  | 'directory'
  | 'seller_space'
  | 'nursery_space'
  | 'carrier_space'
  | 'gmail'
  | 'playstore'
  | 'admin'
  | 'dashboard'
  | 'orders'
  | 'profile';
export type AppLanguage = 'fr' | 'ar' | 'en';

export type PlatformStatus = 'EN ATTENTE' | 'VALIDÉ' | 'EN COURS' | 'TERMINÉ' | 'ANNULÉ' | 'LITIGE';
export type ModerationStatus = 'EN ATTENTE' | 'VALIDÉ' | 'REFUSÉ' | 'LITIGE';
export type AccountStatus = 'active' | 'suspended';
export type AdminRole = 'super_admin' | 'admin' | 'auditor';

export type AdminModulePermission =
  | 'overview'    // Vue d'ensemble & indicateurs globaux
  | 'pub'         // Publicité, Bannières B2B & Boosts sponsorisés
  | 'pepinieres'  // Pépinières, Lots de plants certifiés ONSSA, Exploitations
  | 'market'      // Marché Récoltes, Fruits & Légumes, Ventes sur pied
  | 'transport'   // Logistique, Flotte Frigorifique, Transporteurs & Trajets
  | 'escrow'      // Séquestre CMI, Déblocage de fonds & Rapprochement
  | 'commissions' // Commissions plateforme MAD & Taux
  | 'users'       // Gestion des Utilisateurs, Profils PRO & Suspensions
  | 'moderation'  // Négociations, Modération tchat & Avis
  | 'documents'   // Manifestes d'Expédition / Export Foodex & Traçabilité
  | 'audit'       // Journaux d'Audit & Sécurité
  | 'admin_roles';// Réglage des pouvoirs et accès administrateurs (Super Admin)

export interface AdministratorAccount {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
  jobTitle: string;
  phone?: string;
  permissions: AdminModulePermission[];
  status: 'active' | 'suspended';
  createdAt: string;
  lastLoginAt?: string;
  customPasskey?: string;
  notes?: string;
}

export interface AdminSession {
  uid: string;
  email: string;
  displayName: string;
  role: AdminRole;
  jobTitle?: string;
  permissions: AdminModulePermission[];
  loginAt: string;
  token: string;
}

export type AdminActionType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'SUSPEND_USER'
  | 'ACTIVATE_USER'
  | 'UPDATE_USER_ROLE'
  | 'VALIDATE_LISTING'
  | 'REJECT_LISTING'
  | 'UPDATE_COMMISSION'
  | 'UPDATE_ORDER_STATUS'
  | 'RELEASE_ESCROW'
  | 'FREEZE_ESCROW'
  | 'RESOLVE_DISPUTE'
  | 'TOGGLE_BOOST'
  | 'UPDATE_PLATFORM_SETTINGS'
  | 'MODERATE_REVIEW'
  | 'CREATE_ADMIN'
  | 'UPDATE_ADMIN_PERMISSIONS'
  | 'SUSPEND_ADMIN'
  | 'REACTIVATE_ADMIN'
  | 'DELETE_ADMIN'
  | 'VALIDATE_PRO_PROFILE';

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  adminEmail: string;
  adminName: string;
  actionType: AdminActionType;
  targetType: 'user' | 'listing' | 'order' | 'escrow' | 'boost' | 'review' | 'platform_settings';
  targetId: string;
  targetSummary: string;
  details?: string;
  previousValue?: string;
  newValue?: string;
}

export interface CategoryCommissionConfig {
  category: string;
  rate: number; // e.g. 0.05 for 5%
  updatedAt: string;
}

export interface CustomPartnerCommissionConfig {
  partnerId: string;
  partnerName: string;
  rate: number;
  notes?: string;
  updatedAt: string;
}

export interface PlatformSettings {
  id: string;
  defaultSellerCommissionRate: number; // e.g. 0.045 (4.5%)
  defaultProCommissionRate: number;     // e.g. 0.030 (3.0%)
  defaultEscrowGuaranteeRate: number;  // e.g. 0.015 (1.5%)
  minEscrowFeeMAD: number;             // e.g. 150 MAD
  categoryCommissionRates?: Record<string, number>;
  customPartnerCommissions?: CustomPartnerCommissionConfig[];
  autoHoldDisputedFunds: boolean;
  maintenanceMode: boolean;
  platformNoticeBanner?: string;
  allowedRegistrations: boolean;
  updatedAt: string;
  updatedBy: string;
}

export type B2BAgentCategory =
  | 'Pépinière Agréée ONSSA'
  | 'Domaine Agricole & Production'
  | 'Coopérative Agricole & GIE'
  | 'Négociant Marché de Gros'
  | 'Station de Conditionnement & Export'
  | 'Transport Frigorifique & Logistique'
  | 'Fournisseur Intrants & Équipements'
  | 'Conseil Agronomique & Laboratoire';

export interface B2BAgent {
  id: string;
  name: string;
  category: B2BAgentCategory;
  region: MoroccanRegion;
  city: string;
  address?: string;
  phone: string;
  whatsapp: string;
  email?: string;
  website?: string;
  onssaApprovalNumber?: string;
  iceNumber?: string;
  rcNumber?: string;
  specialties: string[];
  capacityOrSurface?: string;
  isVerifiedPro: boolean;
  rating: number;
  reviewsCount: number;
  logoUrl?: string;
  description: string;
}

export type UserRole = 'buyer' | 'seller' | 'nursery' | 'carrier' | 'admin';

export type UserSecurityMethod = 'custom_password' | 'email_code' | 'sms_code';

export interface SecurityDispatchNotification {
  id: string;
  channel: 'sms' | 'email';
  recipient: string;
  code: string;
  timestamp: string;
  message: string;
}

export type AccountVerificationStatus = 'active' | 'pending_verification' | 'suspended' | 'rejected';

export interface BuyerDetails {
  buyerType: string;
  companyName: string;
  city: string;
  region: MoroccanRegion;
  activity: string;
  iceNumber?: string;
}

export interface SellerDetails {
  farmName: string;
  totalSurfaceHectares?: number;
  productionTypes: string[];
  locationDetails: string;
  region: MoroccanRegion;
  onssaCertificateNumber?: string;
}

export type NurseryOrientation = 'ornamental' | 'arboriculture' | 'mixed';

export interface NurseryDetails {
  nurseryName: string;
  onssaApprovalNumber: string;
  certifications: string[];
  specialties: string[];
  annualSaplingCapacity?: number;
  orientation?: NurseryOrientation;
  infrastructures?: string[];
  ornamentalDetails?: {
    containerTypes?: string[];
    landscapeUsages?: string[];
    popularSpecies?: string[];
  };
  arboricultureDetails?: {
    rootstocks?: string[];
    fruitSpecies?: string[];
    passportAutomated?: boolean;
  };
}

export interface CarrierDetails {
  companyName: string;
  vehicleTypes: string[];
  servedZones: string[];
  totalCapacityTonnes?: number;
  transportLicenseNumber?: string;
}

export interface UserProfile {
  id: string;
  role: UserRole; // Rôle actuellement actif
  roles?: UserRole[]; // Rôles multiples de l'utilisateur (multi-rôles ex: ['buyer', 'seller', 'carrier'])
  displayName: string;
  phone: string;
  whatsapp: string;
  companyName?: string;
  region: MoroccanRegion;
  email?: string;
  hasCompletedIdentification: boolean;
  // Statut du compte (actif / en attente de vérification / suspendu / refusé)
  status?: AccountStatus;
  verificationStatus?: AccountVerificationStatus;
  suspendedReason?: string;
  suspendedAt?: string;
  adminNotes?: string;
  createdAt?: string;
  // Acceptation des conditions d'utilisation et CNDP
  termsAccepted?: boolean;
  termsAcceptedAt?: string;
  // Détails spécifiques aux rôles sélectionnés
  buyerDetails?: BuyerDetails;
  sellerDetails?: SellerDetails;
  nurseryDetails?: NurseryDetails;
  carrierDetails?: CarrierDetails;
  // Protection des comptes et des stocks par mot de passe / code
  isPasswordProtected?: boolean;
  password?: string;
  securityMethod?: UserSecurityMethod;
  recoveryEmail?: string;
  recoveryPhone?: string;
  lastProtectedAt?: string;
  // Statut Pro / Producteur Certifié
  isProCertified?: boolean;
  proPlan?: 'none' | 'monthly_pro' | 'annual_pro';
  proSince?: string;
  proExpiresAt?: string;
  sellerCommissionRate?: number; // e.g. 0.035 (3.5% for PRO instead of standard 5.5%)
  rating?: number;
  reviewsCount?: number;
}

export interface ComposeEmailInitialState {
  to?: string;
  subject?: string;
  body?: string;
  sourceContext?: string;
}

// ----------------------------------------------------
// 1. Modèle à la commission & Paiement Séquestre (Escrow)
// ----------------------------------------------------
export type EscrowTransactionStatus =
  | 'funds_held'      // Fonds bloqués sur le compte séquestre sécurisé CMI / Stripe
  | 'in_transit'      // Expédié par le vendeur / Transporteur en route
  | 'delivered'       // Livré - En cours de vérification de conformité qualité
  | 'released'        // Fonds débloqués et versés au vendeur
  | 'disputed';       // Litige ouvert (non conformité, casse ou écart de quantité)

export interface EscrowTransaction {
  id: string;
  referenceNumber: string; // ex: ESC-2026-MA-7821
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
  platformCommissionRate: number; // ex: 0.05 (5%)
  platformCommissionMAD: number;  // 5% prélevé
  escrowGuaranteeFeeMAD: number;   // Frais de protection acheteur & séquestre
  totalPaidByBuyerMAD: number;    // Montant total bloqué
  sellerPayoutAmountMAD: number;  // Montant net reversé au vendeur après livraison
  paymentMethod: 'carte_cmi' | 'stripe_card' | 'virement_sequestre';
  paymentDate: string;
  status: EscrowTransactionStatus;
  trackingCarrier?: string;
  trackingNumber?: string;
  inspectionHoursRemaining?: number;
  notes?: string;
  statusHistory: {
    status: EscrowTransactionStatus;
    timestamp: string;
    note: string;
  }[];
  disputeReason?: string;
  adminStatus?: PlatformStatus;
  disputeRuling?: 'refund_buyer' | 'pay_seller' | 'split_50_50' | 'under_review';
  disputeResolvedAt?: string;
  disputeResolvedBy?: string;
  // Champs immuables requis pour l'audit et l'historique comptable
  montantBrutMAD?: number;
  tauxCommissionApplique?: number;
  montantCommissionMAD?: number;
  montantNetVendeurMAD?: number;
  dateTransaction?: string;
  transactionId?: string;
  isDemoMode?: boolean; // Indicateur strict : mode démonstration / simulation sans débit bancaire réel
  refundAmountMAD?: number;
  refundDate?: string;
  refundReason?: string;
}

// ----------------------------------------------------
// 2. Options de visibilité (Boosts d'annonces)
// ----------------------------------------------------
export type BoostPackageId = 'flash_3d' | 'intensive_7d' | 'mega_14d';

export interface BoostPackage {
  id: BoostPackageId;
  name: string;
  durationDays: number;
  priceMAD: number;
  badgeLabel: string;
  badgeClass: string;
  description: string;
  features: string[];
}

export interface BoostCampaign {
  id: string;
  listingId: string;
  listingType: 'produce' | 'nursery' | 'farm_standing';
  listingTitle: string;
  sellerId?: string;
  sellerName: string;
  packageId: BoostPackageId;
  packageName: string;
  durationDays: number;
  priceMAD: number;
  paidAmountMAD: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
  isDemoPayment: boolean;
  status: 'active' | 'scheduled' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  impressionsCount: number;
  clicksCount: number;
  whatsappClicksCount: number;
  createdAt: string;
}

// ----------------------------------------------------
// 3. Services logistiques & transport agricole
// ----------------------------------------------------
export type CargoType =
  | 'plants_mottes'     // Jeunes plants en mottes / alvéoles (aération, fragilité)
  | 'trees_pots'        // Arbres en conteneurs / pots (oliviers, agrumes, palmiers)
  | 'fresh_produce'     // Fruits et légumes frais (température dirigée 8-12°C)
  | 'bulk_standing';    // Récolte brute / benne bord champ

export type VehicleType =
  | 'fourgon_aere'      // Fourgonnette aérée (1 à 3T)
  | 'camion_frigo'      // Camion frigorifique porteur (6 à 12T)
  | 'semi_remorque_25t' // Semi-remorque frigorifique ou plateau (24-25T)
  | 'plateau_agricole'; // Plateau agricole bâché spécial arbres

export interface TransportBooking {
  id: string;
  bookingRef: string; // ex: TRP-MA-2026-4401
  carrierName: string; // ex: "AgriFret Maroc Express"
  originCity: string;
  destinationCity: string;
  distanceKm: number;
  cargoType: CargoType;
  vehicleType: VehicleType;
  cargoVolumeTonnes: number;
  totalPriceMAD: number;
  platformCommissionMAD: number; // ex: 8% touché par la plateforme
  carrierPayoutMAD: number;
  transitHoursEstimate: number;
  pickupDate: string;
  contactName: string;
  contactPhone: string;
  status: 'confirme' | 'en_acheminement' | 'livre';
  bookedAt: string;
}

// ----------------------------------------------------
// 4. Publicité ciblée B2B (Espaces annonceurs agricoles & Régie Pub Admin)
// ----------------------------------------------------
export type AgriB2BAdCategory =
  | 'Engrais & Biostimulants'
  | 'Irrigation & Goutte-à-goutte'
  | 'Serres & Filets'
  | 'Analyses & Labo'
  | 'Machinisme & Tracteurs'
  | 'Emballage & Conditionnement'
  | 'Semences & Hybrides'
  | 'Énergie Solaire & Pompage';

export type AgriB2BAdStatus = 'active' | 'paused' | 'expired' | 'pending_approval' | 'rejected';
export type AgriB2BAdPlacement = 'all' | 'home' | 'market' | 'nursery' | 'wholesale';

export interface AgriB2BAd {
  id: string;
  brandName: string;
  tagline: string;
  description: string;
  category: AgriB2BAdCategory | string;
  badgeText: string;
  ctaText: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  websiteUrl?: string;
  promoCode?: string;
  bannerGradient: string;
  iconName: string;
  status?: AgriB2BAdStatus;
  placement?: AgriB2BAdPlacement;
  monthlyFeeMAD?: number;
  budgetMAD?: number;
  durationDays?: number;
  contactPerson?: string;
  startDate?: string;
  endDate?: string;
  clicksCount?: number;
  viewsCount?: number;
  notesAdmin?: string;
  rejectionReason?: string;
  isDemoPayment?: boolean;
  createdAt?: string;
}

// ----------------------------------------------------
// 5. Espace de Discussion Sécurisé par Offre (Anti-Désintermédiation)
// ----------------------------------------------------
export interface OfferChatMessage {
  id: string;
  offerId: string;
  offerType: 'produce' | 'nursery' | 'farm_standing';
  offerTitle: string;
  senderId: string;
  senderName: string;
  senderRole: 'buyer' | 'seller';
  content: string;
  timestamp: string;
  messageType?: 'text' | 'price_offer' | 'escrow_prompt' | 'system';
  proposedPriceMAD?: number;
  proposedQuantity?: number;
  unit?: string;
  offerStatus?: 'pending' | 'accepted' | 'declined';
  phoneMaskedWarning?: boolean;
}

export interface OfferDiscussionThread {
  offerId: string;
  offerType: 'produce' | 'nursery' | 'farm_standing';
  offerTitle: string;
  offerPriceMAD: number;
  offerUnit: string;
  sellerName: string;
  sellerRating?: number;
  buyerName: string;
  messages: OfferChatMessage[];
  lastUpdated: string;
  unreadCount?: number;
}

// ----------------------------------------------------
// 6. Système de Notation par Étoiles & Fidélisation
// ----------------------------------------------------
export interface ReviewCriteria {
  productQuality: number;      // Note de 1 à 5: Conformité calibre, fraîcheur ou reprise racinaire
  deliveryPunctuality: number; // Note de 1 à 5: Respect des délais convenus
  communication: number;       // Note de 1 à 5: Réactivité & clarté des échanges
}

export interface UserReview {
  id: string;
  targetSellerName: string;
  targetOfferId?: string;
  targetOfferTitle?: string;
  reviewerName: string;
  reviewerRegion: string;
  rating: number; // 1 à 5
  criteria: ReviewCriteria;
  comment: string;
  date: string;
  verifiedEscrowPurchase: boolean; // Badge "Achat vérifié sous séquestre"
  sellerResponse?: {
    date: string;
    text: string;
  };
}

export interface SellerReputation {
  sellerName: string;
  averageRating: number; // ex: 4.9
  totalReviews: number;
  badge?: 'Top Vendeur 5★' | 'Producteur d\'Élite' | 'Fournisseur Certifié';
  satisfactionRatePercent: number; // ex: 98%
}

// ----------------------------------------------------
// 7. Système de Rappel & Synchronisation Quotidienne d'Inventaire
// ----------------------------------------------------
export interface DailySyncRecord {
  lastSyncDate: string; // YYYY-MM-DD
  lastSyncTimeStr: string; // e.g. "09:30"
  syncedLotsCount: number;
  totalLotsCount: number;
  reminderEnabled: boolean;
  reminderHour: string; // e.g. "17:00"
}

// ----------------------------------------------------
// 8. Module Manifestes d'Export & Expédition Produits Agricoles (PDF & Conformité)
// ----------------------------------------------------
export interface ProduceManifestItem {
  id: string;
  commodity: string;           // e.g. "Tomate Ronde Grappe", "Clémentine Nadorcott"
  variety: string;             // e.g. "Torry F1", "Nadorcott Afourer"
  hsCode: string;              // Code du Système Harmonisé (ex. "0702.00.00")
  qualityClass: 'Extra' | 'Catégorie I' | 'Catégorie II';
  calibre: string;             // e.g. "57-67 mm (Calibre M)", "Calibre 1 (54-58 mm)"
  lotNumber: string;           // Traçabilité parcelle / station (ex. LOT-2026-TOM-CHT-01)
  packagingType: string;       // Cartons télescopiques 6kg, Caisses IFCO, Plateaux bois 10kg
  packagesCount: number;       // Nombre de colis / caisses
  palletsCount: number;        // Nombre de palettes (ex. 24 palettes Euro 80x120)
  netWeightKg: number;         // Poids net total en kg
  grossWeightKg: number;       // Poids brut total en kg
  globalGapGgn?: string;       // Numéro GGN GlobalG.A.P (13 chiffres)
  originPlot?: string;         // Parcelle / Serre d'origine
}

export type ExportManifestStatus =
  | 'draft'             // Brouillon en cours de saisie
  | 'inspected'         // Inspecté par Foodex / ONSSA
  | 'customs_cleared'   // Dédouané BADR / Scellé apposé
  | 'in_transit'        // En acheminement frigorifique
  | 'delivered';        // Réceptionné au port / entrepôt client

export type ExportDestinationType = 'international' | 'inter_regional';

export interface ProduceExportManifest {
  id: string;
  manifestNumber: string;                  // e.g. "EXP-MAN-2026-MA-9042"
  status: ExportManifestStatus;
  destinationType: ExportDestinationType;
  issueDate: string;                       // YYYY-MM-DD
  departureDate: string;
  estimatedArrivalDate: string;

  // Station Expéditrice / Producteur (Maroc)
  exporterName: string;
  exporterICE: string;                     // 15 chiffres
  exporterRC: string;                      // N° Registre de Commerce
  exporterAddress: string;
  exporterCity: string;
  originRegion: MoroccanRegion;
  onssaApprovalNumber: string;             // Agrément Station ONSSA (ex: ST-ONSSA-SM-2024-088)
  foodexApprovalNumber: string;            // Agrément EACCE / Morocco Foodex (ex: EACCE-EXP-4412-MA)
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;

  // Destinataire / Importateur
  consigneeName: string;
  consigneeAddress: string;
  consigneeCity: string;
  consigneeCountry: string;
  consigneeVatEori: string;                // N° EORI / TVA Intracommunautaire
  notifyParty?: string;                    // Transitaire / Courtier en douane

  // Logistique, Port & Transport Frigorifique
  transportMode: 'road_reefer' | 'maritime_reefer' | 'air_cargo';
  carrierName: string;                     // Société de transport frigorifique
  truckPlateNumber: string;                // Immatriculation Tracteur
  trailerPlateNumber?: string;             // Immatriculation Semi-remorque frigorifique
  containerNumber?: string;                // N° Conteneur reefer (si maritime)
  sealNumber: string;                      // N° Plomb / Scellé douanier
  temperatureSetpointC: number;            // Température de consigne (°C)
  temperatureMinC: number;
  temperatureMaxC: number;
  dataloggerNumber?: string;               // N° Enregistreur de température USB
  portOfLoading: string;                   // Ex: Port Tanger Med Passagers/Fret
  portOfDischarge: string;                 // Ex: Port d'Algésiras (Espagne) / Marseille
  customsOffice: string;                   // Bureau des douanes marocain
  dumNumber?: string;                      // Déclaration Unique de Marchandise BADR
  cmrNumber?: string;                      // N° CMR / Lettre de voiture internationale

  // Produits & Lots embarqués
  items: ProduceManifestItem[];

  // Conformité Sanitaire & Certifications
  phytosanitaryCertificateNumber: string;  // Certificat phytosanitaire ONSSA
  foodexInspectionCertificate: string;     // Certificat d'inspection EACCE / Foodex
  eur1CertificateNumber?: string;          // Certificat de circulation des marchandises EUR.1
  isGlobalGapCertified: boolean;
  isOrganicBio: boolean;
  isResidueCompliant: boolean;             // Conforme LMR (Limites Maximales de Résidus UE)
  quarantinePestFree: boolean;             // Déclaration absence ravageurs quarantaine
  specialHandlingNotes?: string;

  // Totaux calculés
  totalPallets: number;
  totalPackages: number;
  totalNetWeightKg: number;
  totalGrossWeightKg: number;

  // Signatures et validation
  qualityManagerName: string;
  driverSignatureName?: string;
  inspectorName?: string;
  notes?: string;
  linkedProduceListingId?: string;
}

// ----------------------------------------------------
// 16. Modèle Logistique Transporteur (Flotte & Fret)
// ----------------------------------------------------
export interface CarrierVehicle {
  id: string;
  plateNumber: string;
  vehicleType: 'camion_frigo_semi' | 'camion_frigo_porteur' | 'camion_plateau' | 'camion_benne' | 'fourgon_isotherme';
  capacityTonnes: number;
  temperatureControlled: boolean;
  tempMinC?: number;
  tempMaxC?: number;
  availableRegions: MoroccanRegion[];
  status: 'disponible' | 'en_mission' | 'maintenance';
  gpsLocation?: string;
  driverName: string;
  driverPhone: string;
}

export interface TransportTripRequest {
  id: string;
  requestNumber: string; // e.g. TRP-2026-089
  requesterName: string;
  requesterRole: 'buyer' | 'seller' | 'nursery';
  requesterPhone: string;
  originCity: string;
  destinationCity: string;
  cargoDescription: string;
  cargoType: 'fruits_legumes' | 'plants_pepiniere' | 'bétail' | 'vrac_céréales';
  volumeTonnes: number;
  requiredTemperatureC?: number;
  departureDate: string;
  budgetProposedMAD?: number;
  status: 'en_attente' | 'assigne' | 'en_cours' | 'livre';
  assignedCarrierVehicleId?: string;
  createdAt: string;
}

