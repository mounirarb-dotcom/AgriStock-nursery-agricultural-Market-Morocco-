import { describe, it, expect } from 'vitest';
import { UserProfile, AdminSession } from '../types';

describe('Super Admin JSON Data Export Security Verification', () => {
  const checkIsSuperAdmin = (
    adminSession: AdminSession | null,
    userProfile: Partial<UserProfile> | null,
    googleUserEmail?: string
  ): boolean => {
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
    const currentEmail = (userProfile?.email || googleUserEmail || '').toLowerCase();
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
  };

  const simulateExportJSON = (
    isSuperAdmin: boolean,
    data: {
      nurseryLots: any[];
      produceListings: any[];
      farmStandingListings: any[];
      b2bAds: any[];
      exportManifests: any[];
    }
  ) => {
    if (!isSuperAdmin) {
      throw new Error("Action non autorisée : L'export de données JSON est strictement réservé au Super Administrateur.");
    }
    return JSON.stringify({
      version: '1.2',
      exportedAt: new Date().toISOString(),
      ...data,
    });
  };

  it('should block regular buyer/seller from exporting JSON data', () => {
    const regularSeller: Partial<UserProfile> = {
      id: 'usr_seller_1',
      role: 'seller',
      displayName: 'Agriculteur Souss',
      email: 'agriculteur@gmail.com',
    };

    const isSuper = checkIsSuperAdmin(null, regularSeller);
    expect(isSuper).toBe(false);

    expect(() =>
      simulateExportJSON(isSuper, {
        nurseryLots: [{ id: 'lot-1' }],
        produceListings: [{ id: 'prod-1' }],
        farmStandingListings: [],
        b2bAds: [],
        exportManifests: [],
      })
    ).toThrowError(/strictement réservé au Super Administrateur/);
  });

  it('should block standard nursery producer from exporting platform JSON database', () => {
    const nurseryUser: Partial<UserProfile> = {
      id: 'usr_nursery_1',
      role: 'nursery',
      displayName: 'Pépiniériste Atlas',
      email: 'contact@pepiniere-atlas.ma',
    };

    const isSuper = checkIsSuperAdmin(null, nurseryUser);
    expect(isSuper).toBe(false);

    expect(() =>
      simulateExportJSON(isSuper, {
        nurseryLots: [],
        produceListings: [],
        farmStandingListings: [],
        b2bAds: [],
        exportManifests: [],
      })
    ).toThrowError(/strictement réservé au Super Administrateur/);
  });

  it('should block delegate admin who is not super_admin and not Mounir', () => {
    const delegateSession: AdminSession = {
      uid: 'adm_pub_1',
      displayName: 'Admin Délégué Pub',
      email: 'moderateur.pub@extern.ma',
      role: 'admin',
      permissions: ['pub'],
      token: 'tok_pub',
      loginAt: new Date().toISOString(),
    };

    const isSuper = checkIsSuperAdmin(delegateSession, null);
    expect(isSuper).toBe(false);

    expect(() =>
      simulateExportJSON(isSuper, {
        nurseryLots: [],
        produceListings: [],
        farmStandingListings: [],
        b2bAds: [],
        exportManifests: [],
      })
    ).toThrowError(/strictement réservé au Super Administrateur/);
  });

  it('should allow Super Admin with role super_admin to export JSON data', () => {
    const superAdminSession: AdminSession = {
      uid: 'adm_super_1',
      displayName: 'Super Admin Fondateur',
      email: 'superadmin@agristock.ma',
      role: 'super_admin',
      permissions: ['overview', 'users', 'market', 'pepinieres', 'admin_roles'],
      token: 'tok_super',
      loginAt: new Date().toISOString(),
    };

    const isSuper = checkIsSuperAdmin(superAdminSession, null);
    expect(isSuper).toBe(true);

    const json = simulateExportJSON(isSuper, {
      nurseryLots: [{ id: 'lot-1', variety: 'Haouzia' }],
      produceListings: [{ id: 'prod-1', variety: 'Tomate Ronde' }],
      farmStandingListings: [{ id: 'farm-1', variety: 'Clémentine Nadorcott' }],
      b2bAds: [{ id: 'ad-1', title: 'Engrais Bio' }],
      exportManifests: [{ id: 'man-1', exporterName: 'Domaine Souss' }],
    });

    const parsed = JSON.parse(json);
    expect(parsed.version).toBe('1.2');
    expect(parsed.nurseryLots).toHaveLength(1);
    expect(parsed.produceListings).toHaveLength(1);
    expect(parsed.farmStandingListings).toHaveLength(1);
    expect(parsed.b2bAds).toHaveLength(1);
    expect(parsed.exportManifests).toHaveLength(1);
  });

  it('should recognize Mounir (mounir.arb@gmail.com) as Super Admin', () => {
    const mounirProfile: Partial<UserProfile> = {
      id: 'usr_mounir',
      displayName: 'Mounir',
      email: 'mounir.arb@gmail.com',
      role: 'seller',
    };

    const isSuper = checkIsSuperAdmin(null, mounirProfile);
    expect(isSuper).toBe(true);
  });
});
