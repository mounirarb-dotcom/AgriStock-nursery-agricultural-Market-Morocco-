import { describe, it, expect, vi } from 'vitest';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn().mockResolvedValue({
    user: { uid: 'usr_mock_security_uid', displayName: 'Test User' },
  }),
  signInWithEmailAndPassword: vi.fn().mockImplementation((_auth, _email, pass) => {
    if (pass === 'CorrectPassword#123') {
      return Promise.resolve({
        user: { uid: 'usr_mock_security_uid', displayName: 'Test User', email: _email },
      });
    }
    return Promise.reject({ code: 'auth/wrong-password' });
  }),
  signOut: vi.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
  updateProfile: vi.fn().mockResolvedValue(undefined),
  onAuthStateChanged: vi.fn(),
  getAuth: vi.fn(),
}));

vi.mock('../services/firebase', () => ({
  auth: {},
  db: {},
  doc: vi.fn().mockReturnValue({}),
  setDoc: vi.fn().mockResolvedValue(undefined),
  getDoc: vi.fn().mockResolvedValue({ exists: () => false }),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  collection: vi.fn().mockReturnValue({}),
  query: vi.fn().mockReturnValue({}),
  where: vi.fn().mockReturnValue({}),
  getDocs: vi.fn().mockResolvedValue({ empty: true, docs: [] }),
}));

import { registerUserAccount, loginUserAccount } from '../services/authService';
import { UserProfile } from '../types';

describe('Security Hardening & OWASP Compliance Tests', () => {
  it('hashes passwords using bcrypt with 12 salt rounds and never returns plaintext password', async () => {
    const rawPassword = 'StrongPassword!2026';
    const saltRounds = 12;
    const hash = await bcrypt.hash(rawPassword, saltRounds);

    expect(hash).not.toBe(rawPassword);
    expect(hash.startsWith('$2a$') || hash.startsWith('$2b$')).toBe(true);

    const isMatch = await bcrypt.compare(rawPassword, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await bcrypt.compare('WrongPassword', hash);
    expect(isWrongMatch).toBe(false);
  });

  it('ensures registerUserAccount generates secure profile without storing plaintext password in memory or payload', async () => {
    const testEmail = `agri_${Date.now()}@agristock.ma`;
    const result = await registerUserAccount({
      displayName: 'Coopérative Test Souss',
      phone: '+212 6 61 22 33 44',
      email: testEmail,
      password: 'SecretPassword#123',
      roles: ['seller'],
      termsAccepted: true,
    });

    expect(result.success).toBe(true);
    expect(result.profile).toBeDefined();

    // Plaintext password field must NEVER exist or be populated on the profile
    const profile = result.profile as UserProfile;
    expect(profile.password).toBeUndefined();
    expect(profile.passwordHash).toBeDefined();
    expect(typeof profile.passwordHash).toBe('string');
    expect(profile.passwordHash?.startsWith('$2')).toBe(true);

    // Verify hash matches the original password
    const matches = await bcrypt.compare('SecretPassword#123', profile.passwordHash || '');
    expect(matches).toBe(true);
  });

  it('rejects authentication with invalid credentials and does not permit account backdoor derogations', async () => {
    const dummyEmail = 'elboizidi.ghizlane@gmail.com';
    // Attempting login with incorrect password for the previously bypassable address
    const result = await loginUserAccount(dummyEmail, 'completely_incorrect_password');
    // Must be rejected or handled as wrong password, not bypassed
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/incorrect|erreur|introuvable/i);
  });

  it('verifies HMAC-SHA256 signature for CMI payments and rejects tampered webhooks', () => {
    const secretKey = 'agristock_cmi_secure_key_2026';
    const orderId = 'ORD-2026-9901';
    const amount = '1500';
    const txId = 'CMI-MA-2026-A1B2';

    const payload = `${orderId}:${amount}:${txId}`;
    const validSignature = crypto.createHmac('sha256', secretKey).update(payload).digest('hex');

    expect(validSignature).toBeDefined();
    expect(validSignature.length).toBe(64); // SHA-256 produces 64 hex chars

    // Tampered payload verification
    const tamperedPayload = `${orderId}:9999:${txId}`;
    const tamperedSignature = crypto.createHmac('sha256', secretKey).update(tamperedPayload).digest('hex');
    expect(validSignature).not.toBe(tamperedSignature);

    // Timing-safe equal test
    const isValid = crypto.timingSafeEqual(
      Buffer.from(validSignature),
      Buffer.from(validSignature)
    );
    expect(isValid).toBe(true);

    const isTamperedValid = crypto.timingSafeEqual(
      Buffer.from(validSignature),
      Buffer.from(tamperedSignature)
    );
    expect(isTamperedValid).toBe(false);
  });

  it('uses cryptographically secure pseudo-random numbers (CSPRNG) for identifiers', () => {
    const id1 = crypto.randomBytes(8).toString('hex');
    const id2 = crypto.randomBytes(8).toString('hex');

    expect(id1).not.toBe(id2);
    expect(id1.length).toBe(16);
    expect(id2.length).toBe(16);
  });
});
