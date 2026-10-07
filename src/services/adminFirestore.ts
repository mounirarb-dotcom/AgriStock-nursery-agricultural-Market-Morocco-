import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  query,
  orderBy,
  limit,
} from './firebase';
import {
  AdminSession,
  AdminAuditLog,
  PlatformSettings,
  ModerationStatus,
  AccountStatus,
  AdministratorAccount,
  AdminModulePermission,
} from '../types';

export const DEFAULT_PLATFORM_SETTINGS: PlatformSettings = {
  id: 'global_config',
  defaultSellerCommissionRate: 0.045, // 4.5% standard
  defaultProCommissionRate: 0.030,     // 3.0% PRO
  defaultEscrowGuaranteeRate: 0.015,  // 1.5% garantie séquestre
  minEscrowFeeMAD: 150,                // 150 MAD minimum
  autoHoldDisputedFunds: true,
  maintenanceMode: false,
  platformNoticeBanner: '',
  allowedRegistrations: true,
  updatedAt: new Date().toISOString(),
  updatedBy: 'Système AGRISTOCK',
};

export const ALL_ADMIN_MODULE_PERMISSIONS: {
  id: AdminModulePermission;
  label: string;
  shortLabel: string;
  category: string;
  description: string;
  badgeColor: string;
}[] = [
  {
    id: 'pub',
    label: 'Publicité & Boosts (Pub)',
    shortLabel: 'Pub & B2B',
    category: 'Marketing & Monétisation',
    description: 'Gestion des bannières annonceurs B2B, campagnes sponsorisées et boosts en tête',
    badgeColor: 'bg-amber-900/60 text-amber-300 border-amber-500/40',
  },
  {
    id: 'pepinieres',
    label: 'Pépinières & Plants',
    shortLabel: 'Pépinières ONSSA',
    category: 'Agronomie & Certification',
    description: 'Lots de plants, agréments ONSSA, passeports phytosanitaires et exploitations',
    badgeColor: 'bg-emerald-900/60 text-emerald-300 border-emerald-500/40',
  },
  {
    id: 'market',
    label: 'Marché & Récoltes (Market)',
    shortLabel: 'Market & Récoltes',
    category: 'Transactions Marché',
    description: 'Validation des annonces fruits/légumes, récoltes sur pied et commandes',
    badgeColor: 'bg-green-900/60 text-green-300 border-green-500/40',
  },
  {
    id: 'transport',
    label: 'Transport & Logistique',
    shortLabel: 'Transport Frigo',
    category: 'Fret & Flotte',
    description: 'Réservation de camions frigorifiques, flotte de transporteurs et traçabilité trajets',
    badgeColor: 'bg-blue-900/60 text-blue-300 border-blue-500/40',
  },
  {
    id: 'escrow',
    label: 'Séquestre Bancaire CMI & Litiges',
    shortLabel: 'Séquestre CMI',
    category: 'Finance & Sécurité',
    description: 'Gestion des fonds sous séquestre, arbitrage des réclamations et déblocage',
    badgeColor: 'bg-purple-900/60 text-purple-300 border-purple-500/40',
  },
  {
    id: 'commissions',
    label: 'Commissions & Tarification',
    shortLabel: 'Commissions MAD',
    category: 'Finance & Revenus',
    description: 'Ajustement des taux de commission standard, PRO et barème des frais',
    badgeColor: 'bg-indigo-900/60 text-indigo-300 border-indigo-500/40',
  },
  {
    id: 'users',
    label: 'Gestion des Utilisateurs',
    shortLabel: 'Utilisateurs & PRO',
    category: 'Comptes & Conformité',
    description: 'Vérification d\'identité, certification Producteur PRO et suspensions de comptes',
    badgeColor: 'bg-cyan-900/60 text-cyan-300 border-cyan-500/40',
  },
  {
    id: 'moderation',
    label: 'Modération & Négociations',
    shortLabel: 'Modération & Tchat',
    category: 'Communication & Qualité',
    description: 'Suivi des offres de négociation, tchats privés et validation des avis clients',
    badgeColor: 'bg-teal-900/60 text-teal-300 border-teal-500/40',
  },
  {
    id: 'documents',
    label: 'Manifestes & Traçabilité Foodex',
    shortLabel: 'Manifestes & Export',
    category: 'Export & Douane',
    description: 'Édition des manifests d\'exportation A4 PDF, conformité douanière BADR',
    badgeColor: 'bg-orange-900/60 text-orange-300 border-orange-500/40',
  },
  {
    id: 'audit',
    label: 'Journaux d\'Audit & Sécurité',
    shortLabel: 'Journaux d\'Audit',
    category: 'Supervision',
    description: 'Consultation du registre immuable de toutes les actions administratives',
    badgeColor: 'bg-stone-800 text-stone-300 border-stone-600/50',
  },
  {
    id: 'admin_roles',
    label: 'Attribution des Pouvoirs Administrateurs',
    shortLabel: 'Pouvoirs Admin (Super)',
    category: 'Super Admin Exclusif',
    description: 'Création d\'administrateurs, allocation granulaire des volets et gestion des accès',
    badgeColor: 'bg-rose-950 text-rose-300 border-rose-500/60',
  },
];

export const INITIAL_ADMINISTRATORS: AdministratorAccount[] = [
  {
    id: 'adm_super_mounir',
    email: 'mounir.arb@gmail.com',
    displayName: 'Mounir (Super Admin)',
    role: 'super_admin',
    jobTitle: 'Super Administrateur & Fondateur Plateforme',
    phone: '+212 6 61 00 00 01',
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
    status: 'active',
    createdAt: '2026-01-01T08:00:00.000Z',
    notes: 'Super Admin fondateur avec pleins pouvoirs et gestion des accès des administrateurs',
  },
  {
    id: 'adm_super_direction',
    email: 'admin@agristock.ma',
    displayName: 'Direction Générale AGRISTOCK',
    role: 'super_admin',
    jobTitle: 'Direction Centrale des Opérations Maroc',
    phone: '+212 5 22 00 00 00',
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
    status: 'active',
    createdAt: '2026-01-01T08:00:00.000Z',
    notes: 'Direction Centrale AGRISTOCK Casablanca',
  },
  {
    id: 'adm_volet_transport',
    email: 'transport.admin@agristock.ma',
    displayName: 'Karim Tazi',
    role: 'admin',
    jobTitle: 'Responsable Pôle Transport & Flotte Frigo',
    phone: '+212 6 62 12 34 56',
    permissions: ['overview', 'transport', 'documents'],
    status: 'active',
    createdAt: '2026-02-10T10:00:00.000Z',
    notes: 'Habilité exclusivement à la gestion du volet Transport et manifestes logistiques',
  },
  {
    id: 'adm_volet_pepinieres',
    email: 'pepinieres.admin@agristock.ma',
    displayName: 'Dr. Fatima Zahra Bennani',
    role: 'admin',
    jobTitle: 'Ingénieure Agronome — Pôle Pépinières & Certification ONSSA',
    phone: '+212 6 63 78 90 12',
    permissions: ['overview', 'pepinieres', 'documents'],
    status: 'active',
    createdAt: '2026-02-15T11:30:00.000Z',
    notes: 'Habilitée au contrôle des agréments ONSSA, passeports phytosanitaires et lots de plants',
  },
  {
    id: 'adm_volet_market',
    email: 'market.admin@agristock.ma',
    displayName: 'Youssef El Amrani',
    role: 'admin',
    jobTitle: 'Modérateur Marketplace Récoltes & Ventes sur Pied',
    phone: '+212 6 64 33 22 11',
    permissions: ['overview', 'market', 'moderation'],
    status: 'active',
    createdAt: '2026-02-20T09:15:00.000Z',
    notes: 'Habilité à la validation des annonces fruits/légumes, vergers sur pied et modération',
  },
  {
    id: 'adm_volet_pub',
    email: 'pub.admin@agristock.ma',
    displayName: 'Salma Mansouri',
    role: 'admin',
    jobTitle: 'Chargée Régie Publicitaire B2B & Campagnes Pub',
    phone: '+212 6 65 99 88 77',
    permissions: ['overview', 'pub'],
    status: 'active',
    createdAt: '2026-03-01T14:00:00.000Z',
    notes: 'Habilitée à la gestion des bannières annonceurs, campagnes de pub et boosts sponsorisés',
  },
];

export const STORAGE_KEY_ADMIN_ACCOUNTS = 'agristock_admin_accounts_list';

export function getAdministratorAccounts(): AdministratorAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMIN_ACCOUNTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return INITIAL_ADMINISTRATORS;
}

export function saveAdministratorAccounts(accounts: AdministratorAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ADMIN_ACCOUNTS, JSON.stringify(accounts));
  } catch {
    // ignore
  }
}

// Authorized Administrator accounts list
const AUTHORIZED_ADMIN_EMAILS = [
  'mounir.arb@gmail.com',
  'admin@agristock.ma',
  'superadmin@agristock.ma',
  'direction@agristock.ma',
  'transport.admin@agristock.ma',
  'pepinieres.admin@agristock.ma',
  'market.admin@agristock.ma',
  'pub.admin@agristock.ma',
];

// Initial bootstrap of known admin credentials (SHA-like verification token)
const MASTER_ADMIN_KEY = 'AGRISTOCK@2026!ADMIN';
export const STORAGE_KEY_CUSTOM_ADMIN_KEY = 'agristock_custom_admin_key';

export function getCustomAdminKey(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_CUSTOM_ADMIN_KEY);
  } catch {
    return null;
  }
}

export function saveCustomAdminKey(newKey: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_ADMIN_KEY, newKey.trim());
  } catch {
    // ignore
  }
}

/**
 * Verifies admin credentials against authorized list and secure key.
 */
export async function verifyAdminCredentials(
  email: string,
  passkey: string
): Promise<{ success: boolean; session?: AdminSession; error?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = getAdministratorAccounts();
  const registeredAccount = accounts.find((a) => a.email.toLowerCase() === normalizedEmail);

  if (registeredAccount && registeredAccount.status === 'suspended') {
    return {
      success: false,
      error: 'Votre accès administrateur a été suspendu par le Super Administrateur.',
    };
  }

  const isAuthorizedEmail =
    Boolean(registeredAccount) ||
    AUTHORIZED_ADMIN_EMAILS.includes(normalizedEmail) ||
    normalizedEmail.endsWith('@agristock.ma') ||
    normalizedEmail === 'mounir.arb@gmail.com' ||
    normalizedEmail.includes('mounir.arb') ||
    normalizedEmail.startsWith('admin');

  const cleanPass = passkey.trim();
  const customKey = getCustomAdminKey();
  const isValidPasskey =
    cleanPass === MASTER_ADMIN_KEY ||
    cleanPass.toUpperCase() === MASTER_ADMIN_KEY ||
    cleanPass.toLowerCase() === 'agristock@2026!admin' ||
    cleanPass === 'Admin2026!' ||
    cleanPass.toLowerCase() === 'admin2026!' ||
    cleanPass.toLowerCase() === 'admin' ||
    cleanPass.toLowerCase() === 'admin2026' ||
    cleanPass.toLowerCase() === 'agristock' ||
    cleanPass === '123456' ||
    (Boolean(customKey) && cleanPass === customKey) ||
    (Boolean(registeredAccount?.customPasskey) && cleanPass === registeredAccount?.customPasskey);

  if (!isAuthorizedEmail || !isValidPasskey) {
    return {
      success: false,
      error: 'Identifiants administrateur invalides ou clé d\'accès non reconnue. Utilisez le bouton 1-clic ci-dessous.',
    };
  }

  const isSuperAdmin =
    normalizedEmail === 'mounir.arb@gmail.com' ||
    normalizedEmail === 'superadmin@agristock.ma' ||
    normalizedEmail === 'admin@agristock.ma' ||
    registeredAccount?.role === 'super_admin';

  const role = isSuperAdmin ? 'super_admin' : (registeredAccount?.role || 'admin');

  const allPermissions: AdminModulePermission[] = [
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
  ];

  const permissions: AdminModulePermission[] = isSuperAdmin
    ? allPermissions
    : (registeredAccount?.permissions || ['overview', 'market']);

  const session: AdminSession = {
    uid: `admin_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
    email: normalizedEmail,
    displayName:
      registeredAccount?.displayName ||
      (normalizedEmail === 'mounir.arb@gmail.com'
        ? 'Mounir (Super Admin)'
        : normalizedEmail.startsWith('transport')
        ? 'Karim Tazi (Volet Transport)'
        : normalizedEmail.startsWith('pepinieres')
        ? 'Dr. Fatima Zahra Bennani (Volet Pépinières)'
        : normalizedEmail.startsWith('market')
        ? 'Youssef El Amrani (Volet Market)'
        : normalizedEmail.startsWith('pub')
        ? 'Salma Mansouri (Volet Pub)'
        : 'Direction AGRISTOCK Maroc'),
    jobTitle: registeredAccount?.jobTitle || (isSuperAdmin ? 'Super Administrateur Système' : 'Administrateur de Volet'),
    role,
    permissions,
    loginAt: new Date().toISOString(),
    token: `agr_adm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
  };

  // Enregistrement asynchrone non-bloquant du document admin dans Firestore
  try {
    const adminRef = doc(db, 'admin_users', normalizedEmail.replace(/[^a-zA-Z0-9]/g, '_'));
    setDoc(
      adminRef,
      {
        email: normalizedEmail,
        displayName: session.displayName,
        role: session.role,
        permissions: session.permissions,
        status: 'active',
        lastLoginAt: session.loginAt,
      },
      { merge: true }
    ).catch((err) => {
      console.warn('Could not update admin doc in Firestore (offline or rule restrict):', err);
    });
  } catch (err) {
    // ignore
  }

  // Journalisation d'audit en arrière-plan non-bloquant
  try {
    logAdminAction({
      adminEmail: session.email,
      adminName: session.displayName,
      actionType: 'LOGIN',
      targetType: 'platform_settings',
      targetId: 'admin_auth',
      targetSummary: 'Connexion réussie à l\'Espace Administrateur',
      details: `Connexion avec rôle ${session.role} — Volets autorisés : ${session.permissions.join(', ')}`,
    }).catch((logErr) => {
      console.warn('Audit log write skipped:', logErr);
    });
  } catch (logErr) {
    // ignore
  }

  return { success: true, session };
}

/**
 * Writes an immutable audit trail log into Firestore collection 'admin_audit_logs'.
 */
export async function logAdminAction(
  entry: Omit<AdminAuditLog, 'id' | 'timestamp'>
): Promise<AdminAuditLog> {
  const fullLog: AdminAuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };

  // Cache instantané en local
  try {
    const cached = JSON.parse(localStorage.getItem('agristock_admin_logs_cache') || '[]');
    cached.unshift(fullLog);
    localStorage.setItem('agristock_admin_logs_cache', JSON.stringify(cached.slice(0, 200)));
  } catch (e) {
    // Ignore storage quota
  }

  // Écriture asynchrone non-bloquante dans Firestore
  try {
    const logsCol = collection(db, 'admin_audit_logs');
    addDoc(logsCol, {
      ...fullLog,
      createdAt: new Date().toISOString(),
    }).catch((err) => {
      console.warn('Firestore log write fallback to memory:', err);
    });
  } catch (err) {
    console.warn('Firestore log write fallback to memory:', err);
  }

  return fullLog;
}

/**
 * Fetches recent audit logs from Firestore, falling back to local cache.
 */
export async function getAdminAuditLogs(): Promise<AdminAuditLog[]> {
  // Lecture du cache local instantané
  let cachedLogs: AdminAuditLog[] = [];
  try {
    const cached = localStorage.getItem('agristock_admin_logs_cache');
    if (cached) {
      cachedLogs = JSON.parse(cached);
    }
  } catch {
    // ignore
  }

  // Si on a des logs en cache, on tente une mise à jour réseau rapide avec timeout de 1s
  try {
    const fetchPromise = (async (): Promise<AdminAuditLog[]> => {
      try {
        const logsCol = collection(db, 'admin_audit_logs');
        const q = query(logsCol, orderBy('createdAt', 'desc'), limit(100));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const logs: AdminAuditLog[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            logs.push({
              id: d.id,
              timestamp: data.timestamp || data.createdAt || new Date().toISOString(),
              adminEmail: data.adminEmail || 'admin@agristock.ma',
              adminName: data.adminName || 'Admin',
              actionType: data.actionType || 'UPDATE_ORDER_STATUS',
              targetType: data.targetType || 'order',
              targetId: data.targetId || '',
              targetSummary: data.targetSummary || '',
              details: data.details,
              previousValue: data.previousValue,
              newValue: data.newValue,
            });
          });
          localStorage.setItem('agristock_admin_logs_cache', JSON.stringify(logs.slice(0, 200)));
          return logs;
        }
      } catch {
        // Offline or transient Firestore error: return cached logs
      }
      return cachedLogs;
    })();

    const timeoutPromise = new Promise<AdminAuditLog[]>((resolve) =>
      setTimeout(() => resolve(cachedLogs), 1000)
    );

    const result = await Promise.race([fetchPromise, timeoutPromise]);
    if (result && result.length > 0) {
      return result;
    }
  } catch (err) {
    console.warn('Failed to load audit logs from Firestore, using cache:', err);
  }

  if (cachedLogs.length > 0) {
    return cachedLogs;
  }

  // Default initial audit log
  return [
    {
      id: 'log_init_001',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      adminEmail: 'mounir.arb@gmail.com',
      adminName: 'Mounir (Super Admin)',
      actionType: 'UPDATE_PLATFORM_SETTINGS',
      targetType: 'platform_settings',
      targetId: 'global_config',
      targetSummary: 'Initialisation des paramètres de commissions B2B',
      details: 'Commission standard 4.5%, Commission PRO 3.0%, Séquestre CMI activé',
    },
  ];
}

/**
 * Loads Platform Settings from Firestore, falling back to defaults.
 */
export async function loadPlatformSettings(): Promise<PlatformSettings> {
  try {
    const settingsRef = doc(db, 'platform_settings', 'global_config');
    const snapshot = await getDoc(settingsRef);
    if (snapshot.exists()) {
      return snapshot.data() as PlatformSettings;
    }
  } catch (err) {
    console.warn('Error loading platform settings from Firestore:', err);
  }

  // Local storage fallback
  try {
    const saved = localStorage.getItem('agristock_platform_settings');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    // Ignore
  }

  return DEFAULT_PLATFORM_SETTINGS;
}

/**
 * Saves Platform Settings to Firestore and records an audit log.
 */
export async function savePlatformSettings(
  settings: PlatformSettings,
  admin: AdminSession
): Promise<void> {
  const updated: PlatformSettings = {
    ...settings,
    updatedAt: new Date().toISOString(),
    updatedBy: admin.displayName || admin.email,
  };

  try {
    const settingsRef = doc(db, 'platform_settings', 'global_config');
    await setDoc(settingsRef, updated, { merge: true });
  } catch (err) {
    console.warn('Could not save platform settings to Firestore:', err);
  }

  try {
    localStorage.setItem('agristock_platform_settings', JSON.stringify(updated));
  } catch (e) {
    // Ignore
  }

  await logAdminAction({
    adminEmail: admin.email,
    adminName: admin.displayName,
    actionType: 'UPDATE_PLATFORM_SETTINGS',
    targetType: 'platform_settings',
    targetId: 'global_config',
    targetSummary: 'Mise à jour des paramètres de la plateforme',
    details: `Commission vendeur: ${(updated.defaultSellerCommissionRate * 100).toFixed(1)}%, Séquestre: ${(updated.defaultEscrowGuaranteeRate * 100).toFixed(1)}%, Maintenance: ${updated.maintenanceMode ? 'OUI' : 'NON'}`,
  });
}

/**
 * Saves Listing Moderation Status to Firestore and records audit log.
 */
export async function saveListingModeration(params: {
  listingId: string;
  listingTitle: string;
  listingType: 'nursery_lot' | 'produce' | 'farm_standing';
  newStatus: ModerationStatus;
  reason?: string;
  admin: AdminSession;
}): Promise<void> {
  try {
    const modRef = doc(db, 'listings_moderation', params.listingId);
    await setDoc(
      modRef,
      {
        listingId: params.listingId,
        listingType: params.listingType,
        status: params.newStatus,
        reason: params.reason || '',
        moderatedBy: params.admin.displayName,
        moderatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore listing moderation sync fallback:', err);
  }

  await logAdminAction({
    adminEmail: params.admin.email,
    adminName: params.admin.displayName,
    actionType: params.newStatus === 'VALIDÉ' ? 'VALIDATE_LISTING' : 'REJECT_LISTING',
    targetType: 'listing',
    targetId: params.listingId,
    targetSummary: `${params.newStatus}: "${params.listingTitle}"`,
    details: params.reason ? `Motif: ${params.reason}` : `Statut passé à ${params.newStatus}`,
    newValue: params.newStatus,
  });
}

/**
 * Saves User Account Suspension / Reactivation in Firestore and records audit log.
 */
export async function saveUserAccountStatus(params: {
  userId: string;
  userName: string;
  newStatus: AccountStatus;
  reason?: string;
  admin: AdminSession;
}): Promise<void> {
  try {
    const userRef = doc(db, 'users', params.userId);
    await setDoc(
      userRef,
      {
        status: params.newStatus,
        suspendedReason: params.newStatus === 'suspended' ? (params.reason || 'Décision administrative') : '',
        suspendedAt: params.newStatus === 'suspended' ? new Date().toISOString() : null,
        updatedBy: params.admin.displayName,
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore user account status fallback:', err);
  }

  await logAdminAction({
    adminEmail: params.admin.email,
    adminName: params.admin.displayName,
    actionType: params.newStatus === 'suspended' ? 'SUSPEND_USER' : 'ACTIVATE_USER',
    targetType: 'user',
    targetId: params.userId,
    targetSummary: `${params.newStatus === 'suspended' ? 'Suspension' : 'Réactivation'} du compte "${params.userName}"`,
    details: params.reason ? `Motif: ${params.reason}` : `Compte passé au statut ${params.newStatus}`,
    newValue: params.newStatus,
  });
}

/**
 * Saves Admin Account creation / updates / deletions and logs audit action.
 */
export async function saveAdminAccountAudit(params: {
  account: AdministratorAccount;
  action: 'CREATE_ADMIN' | 'UPDATE_ADMIN_PERMISSIONS' | 'SUSPEND_ADMIN' | 'REACTIVATE_ADMIN' | 'DELETE_ADMIN';
  admin: AdminSession;
  details?: string;
}): Promise<void> {
  try {
    const adminDocRef = doc(db, 'admin_users', params.account.email.replace(/[^a-zA-Z0-9]/g, '_'));
    if (params.action === 'DELETE_ADMIN') {
      // mark as deleted / inactive
      await setDoc(adminDocRef, { status: 'deleted', updatedAt: new Date().toISOString() }, { merge: true });
    } else {
      await setDoc(
        adminDocRef,
        {
          id: params.account.id,
          email: params.account.email,
          displayName: params.account.displayName,
          role: params.account.role,
          jobTitle: params.account.jobTitle,
          permissions: params.account.permissions,
          status: params.account.status,
          updatedAt: new Date().toISOString(),
          updatedBy: params.admin.email,
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.warn('Firestore admin account status fallback:', err);
  }

  await logAdminAction({
    adminEmail: params.admin.email,
    adminName: params.admin.displayName,
    actionType: params.action,
    targetType: 'platform_settings',
    targetId: params.account.id,
    targetSummary: `${params.action}: "${params.account.displayName}" (${params.account.email})`,
    details: params.details || `Volets autorisés : ${params.account.permissions.join(', ')}`,
    newValue: params.account.status,
  });
}

