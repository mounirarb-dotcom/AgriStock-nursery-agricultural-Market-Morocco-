/**
 * Browser & In-App Notification Utilities for Nursery Stock Management
 */

export interface NotificationStatus {
  supported: boolean;
  permission: 'granted' | 'denied' | 'default' | 'unsupported';
}

export function getBrowserNotificationStatus(): NotificationStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { supported: false, permission: 'unsupported' };
  }
  return {
    supported: true,
    permission: Notification.permission,
  };
}

export async function requestBrowserNotificationPermission(): Promise<'granted' | 'denied' | 'default' | 'unsupported'> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.warn('Error requesting browser notification permission:', error);
    // Some older browsers use callback syntax
    return new Promise((resolve) => {
      try {
        Notification.requestPermission((perm) => {
          resolve(perm);
        });
      } catch {
        resolve('denied');
      }
    });
  }
}

export interface LowStockNotificationPayload {
  lotBatch: string;
  variety: string;
  species: string;
  currentStock: number;
  threshold: number;
  category?: string;
  location?: string;
}

export function sendLowStockBrowserNotification(payload: LowStockNotificationPayload): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    const title = `⚠️ Alerte Stock Bas : ${payload.variety}`;
    const body = `Stock critique : Il ne reste que ${(payload.currentStock || 0).toLocaleString('fr-FR')} plants pour le lot ${payload.lotBatch} (Seuil minimal configuré : ${(payload.threshold || 0).toLocaleString('fr-FR')} plants).`;
    
    // Tag prevents notification stacking for the same batch
    const notification = new Notification(title, {
      body,
      icon: '/src/assets/images/nursery_olive_saplings_1789031030975.jpg',
      tag: `low-stock-${payload.lotBatch}`,
      silent: false,
      requireInteraction: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (err) {
    console.warn('Failed to dispatch browser notification:', err);
    return false;
  }
}

export function sendTestBrowserNotification(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notification = new Notification('🌱 AgriStock Maroc - Notification de Test', {
      body: 'Le système d\'alerte de stock bas de votre pépinière est parfaitement configuré et actif !',
      icon: '/src/assets/images/nursery_olive_saplings_1789031030975.jpg',
      tag: 'test-notification',
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (err) {
    console.warn('Failed to send test notification:', err);
    return false;
  }
}

export function sendDailySyncReminderNotification(unverifiedLotsCount: number): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    const title = '📅 Rappel Inventaire Pépinière - AgriStock';
    const body = `${unverifiedLotsCount} lot${unverifiedLotsCount > 1 ? 's' : ''} attend${unverifiedLotsCount > 1 ? 'ent' : ''} votre synchronisation du jour. Confirmez vos stocks en 1 tap !`;

    const notification = new Notification(title, {
      body,
      icon: '/src/assets/images/nursery_olive_saplings_1789031030975.jpg',
      tag: 'daily-sync-reminder',
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (err) {
    console.warn('Failed to send daily sync reminder:', err);
    return false;
  }
}

export interface PriceDropNotificationPayload {
  produceTitle?: string;
  produceName?: string;
  variety?: string;
  oldPrice: number;
  newPrice: number;
  dropPercent: number;
  unit?: string;
  region?: string;
  locationCity?: string;
  listingId?: string;
}

export function sendPriceDropBrowserNotification(payload: PriceDropNotificationPayload): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    const titleStr = payload.produceTitle || payload.produceName || 'Produit Agricole';
    const unitStr = payload.unit || 'kg';
    const locationStr = payload.locationCity || payload.region;
    const title = `📉 Baisse de prix : ${titleStr} (-${payload.dropPercent}%)`;
    const body = `Le prix est passé de ${payload.oldPrice.toFixed(2)} à ${payload.newPrice.toFixed(2)} MAD/${unitStr}${locationStr ? ` (${locationStr})` : ''}. Offre disponible dès maintenant !`;

    const notification = new Notification(title, {
      body,
      icon: '/src/assets/images/nursery_olive_saplings_1789031030975.jpg',
      tag: `price-drop-${payload.listingId || titleStr}`,
      silent: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (err) {
    console.warn('Failed to send price drop browser notification:', err);
    return false;
  }
}

export interface NewNurseryLotNotificationPayload {
  species: string;
  variety: string;
  quantity: number;
  unitPrice?: number;
  unitPriceMAD?: number;
  region?: string;
  onssaCertified?: boolean;
  lotId?: string;
}

export function sendNewNurseryLotBrowserNotification(payload: NewNurseryLotNotificationPayload): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    const priceVal = payload.unitPrice ?? payload.unitPriceMAD ?? 0;
    const title = `🌱 Nouvel arrivage pépinière : ${payload.species} (${payload.variety})`;
    const certText = payload.onssaCertified ? ' • Certifié ONSSA' : '';
    const body = `${(payload.quantity || 0).toLocaleString('fr-FR')} plants disponibles à ${priceVal.toFixed(2)} MAD/plant${payload.region ? ` • ${payload.region}` : ''}${certText}.`;

    const notification = new Notification(title, {
      body,
      icon: '/src/assets/images/nursery_olive_saplings_1789031030975.jpg',
      tag: `nursery-lot-${payload.lotId || payload.variety}`,
      silent: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (err) {
    console.warn('Failed to send nursery lot browser notification:', err);
    return false;
  }
}
