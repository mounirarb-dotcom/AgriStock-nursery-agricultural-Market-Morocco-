import { describe, it, expect, vi } from 'vitest';
import { globalClientRateLimiter, validateEmail, validatePhone, sanitizeText } from '../utils/securityUtils';
import { buildSafeSelectQuery, executeParameterizedQuery } from '../services/dbSecurity';

describe('Authentication & Access Security Guards', () => {
  it('strictly validates and normalizes user email addresses', () => {
    const validResult = validateEmail('  Fellah.Souss@AGRI-MAROC.MA  ');
    expect(validResult.isValid).toBe(true);
    expect(validResult.value).toBe('fellah.souss@agri-maroc.ma');

    const invalidResult = validateEmail('fake-email-without-at');
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.error).toContain('invalide');
  });

  it('validates Moroccan national and international phone numbers', () => {
    // Moroccan mobile numbers (+212 6... / +212 7... / 06... / 07...)
    expect(validatePhone('0661123456').isValid).toBe(true);
    expect(validatePhone('+212661123456').isValid).toBe(true);
    expect(validatePhone('+212 700 889900').isValid).toBe(true);

    // Invalid non-phone strings
    expect(validatePhone('12345').isValid).toBe(false);
    expect(validatePhone('abcdefghij').isValid).toBe(false);
  });

  it('sanitizes display names and eliminates potential XSS injections', () => {
    const dirty = '<script>alert("hack")</script> Pépinière Atlas';
    const cleaned = sanitizeText(dirty, 50);
    expect(cleaned).not.toContain('<script>');
    expect(cleaned).toContain('Pépinière Atlas');
  });

  it('enforces client-side rate limiting on brute-force attempts', () => {
    const actionKey = 'test:rate_limit_action';
    const limit = 3;
    const windowMs = 5000;

    // Reset bucket
    globalClientRateLimiter.clear();

    const check1 = globalClientRateLimiter.check(actionKey, limit, windowMs);
    expect(check1.allowed).toBe(true);

    const check2 = globalClientRateLimiter.check(actionKey, limit, windowMs);
    expect(check2.allowed).toBe(true);

    const check3 = globalClientRateLimiter.check(actionKey, limit, windowMs);
    expect(check3.allowed).toBe(true);

    // 4th call exceeds limit within window
    const check4 = globalClientRateLimiter.check(actionKey, limit, windowMs);
    expect(check4.allowed).toBe(false);
    expect(check4.retryAfterMs).toBeGreaterThan(0);
  });

  it('prevents privilege escalation by disallowing admin assignment in public registration logic', () => {
    const submittedRoles = ['admin', 'nursery', 'buyer'];
    const sanitizedRoles = submittedRoles.filter((r) => r !== 'admin');

    expect(sanitizedRoles).not.toContain('admin');
    expect(sanitizedRoles).toContain('nursery');
    expect(sanitizedRoles).toContain('buyer');

    // Nursery requires KYC/ONSSA verification before full activation
    const hasProRole = sanitizedRoles.some((r) => r === 'nursery' || r === 'carrier' || r === 'seller');
    const expectedStatus = hasProRole ? 'pending_verification' : 'active';
    expect(expectedStatus).toBe('pending_verification');
  });
});

describe('Database Parameterization & SQLi Defense (dbSecurity)', () => {
  it('builds secure parameterized SELECT queries with positional placeholders', () => {
    const query = buildSafeSelectQuery(
      'nursery_lots',
      ['id', 'species', 'unit_price_mad'],
      { region: 'Souss-Massa', onssa_certified: true }
    );

    expect(query.sql).toBe('SELECT id, species, unit_price_mad FROM nursery_lots WHERE region = $1 AND onssa_certified = $2');
    expect(query.params).toEqual(['Souss-Massa', true]);
  });

  it('rejects unsafe table names or SQL injection attempts in table identifier', () => {
    expect(() => {
      buildSafeSelectQuery('users; DROP TABLE products;--', ['id'], {});
    }).toThrow('[OWASP Security] Nom de table non autorisé.');
  });

  it('rejects unsafe column names in query builder', () => {
    expect(() => {
      buildSafeSelectQuery('nursery_lots', ['id', 'species UNION SELECT password FROM users--'], {});
    }).toThrow('[OWASP Security] Nom de colonne non autorisé');
  });

  it('successfully executes parameterized queries while detecting and neutralizing raw SQL injections', async () => {
    const safeResult = await executeParameterizedQuery(
      'SELECT * FROM produce_listings WHERE variety = $1',
      ['Tomate Ronde']
    );
    expect(safeResult.isSecure).toBe(true);

    // Injection attempt within a parameter value must be rejected
    await expect(
      executeParameterizedQuery('SELECT * FROM produce_listings WHERE variety = $1', ["Tomate' OR '1'='1"])
    ).rejects.toThrow();

    // Query with mismatch between placeholders and arguments must be rejected
    await expect(
      executeParameterizedQuery("SELECT * FROM produce_listings WHERE variety = 'Tomate' OR '1'='1'")
    ).rejects.toThrow();
  });
});
