import { UserProfile } from '../types';

export const STORAGE_KEY_OWNED_ITEMS = 'agrimaroc_owned_item_ids_v1';

/**
 * Persist an item ID created on this browser session as owned by current user.
 */
export function markItemAsOwned(itemId: string): void {
  if (!itemId || typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OWNED_ITEMS);
    const ids: string[] = raw ? JSON.parse(raw) : [];
    if (!ids.includes(itemId)) {
      ids.push(itemId);
      localStorage.setItem(STORAGE_KEY_OWNED_ITEMS, JSON.stringify(ids));
    }
  } catch {
    // Ignore quota or parsing issues
  }
}

/**
 * Check if item ID was marked as created / owned locally.
 */
export function isItemIdMarkedAsOwned(itemId: string): boolean {
  if (!itemId || typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OWNED_ITEMS);
    if (!raw) return false;
    const ids: string[] = JSON.parse(raw);
    return Array.isArray(ids) && ids.includes(itemId);
  } catch {
    return false;
  }
}

/**
 * Determines whether a listing or lot belongs to the current user.
 * Rule: An advertiser / seller / producer must NEVER be able to purchase or order their own products.
 */
export function isItemOwnedByUser(
  item: any,
  userProfile?: UserProfile | null,
  googleUser?: { uid?: string; email?: string | null } | null
): boolean {
  if (!item) return false;

  // 0. Check local device creation registry
  if (item.id && isItemIdMarkedAsOwned(item.id)) {
    return true;
  }

  if (!userProfile) return false;

  const currentUserId = userProfile.id || googleUser?.uid || '';
  const currentUserEmail = (userProfile.email || googleUser?.email || '').trim().toLowerCase();
  const currentUserPhone = (userProfile.phone || userProfile.whatsapp || '').replace(/\D/g, '');
  const currentDisplayName = (userProfile.displayName || '').trim().toLowerCase();
  const currentCompanyName = (userProfile.companyName || '').trim().toLowerCase();

  // 1. Direct userId match
  if (item.userId) {
    if (currentUserId && item.userId === currentUserId) return true;
    if (userProfile.id && item.userId === userProfile.id) return true;
    if (googleUser?.uid && item.userId === googleUser.uid) return true;
  }

  // 2. Direct email match
  const itemSellerEmail = (item.sellerEmail || '').trim().toLowerCase();
  if (itemSellerEmail && currentUserEmail && itemSellerEmail === currentUserEmail) {
    return true;
  }

  // 3. Special handling for Ghizlane El Bouzidi & Bougainvillea offers
  const isGhizlaneAccount =
    currentUserEmail === 'elboizidi.ghizlane@gmail.com' ||
    currentDisplayName.includes('ghizlane') ||
    currentCompanyName.includes('el bouzidi') ||
    currentUserId === 'usr_ghizlane_elbouzidi';

  if (isGhizlaneAccount) {
    // Exact match for lot-orn-02
    if (item.id === 'lot-orn-02' || item.batchNumber === 'LOT-2025-BOU-44') {
      return true;
    }
    // Any Bougainvillea offer
    const textCorpus = `${item.species || ''} ${item.title || ''} ${item.variety || ''} ${item.notes || ''} ${item.category || ''}`.toLowerCase();
    if (textCorpus.includes('bougainvill') || textCorpus.includes('bougainvillea')) {
      return true;
    }
  }

  // 4. Clean phone number match (at least 9 digits)
  const itemPhone = (item.sellerPhone || item.phone || item.sellerWhatsapp || item.whatsapp || '').replace(/\D/g, '');
  if (itemPhone.length >= 9 && currentUserPhone.length >= 9 && itemPhone === currentUserPhone) {
    return true;
  }

  // 5. Explicit company / display name match (excluding generic labels)
  const itemSellerName = (item.sellerName || '').trim().toLowerCase();
  const genericNames = new Set([
    'pépinière agréée',
    'producteur partenaire',
    'exploitant agricole',
    'acheteur partenaire',
    'coopérative agricole',
    '',
  ]);

  if (itemSellerName && !genericNames.has(itemSellerName)) {
    if (currentCompanyName && !genericNames.has(currentCompanyName) && itemSellerName === currentCompanyName) {
      return true;
    }
    if (currentDisplayName && !genericNames.has(currentDisplayName) && itemSellerName === currentDisplayName) {
      return true;
    }
  }

  return false;
}
