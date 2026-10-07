import { describe, it, expect } from 'vitest';
import {
  sanitizeText,
  validateEmail,
  validatePhone,
  detectSqlInjection,
  validateParameterizedQuery,
} from '../utils/securityUtils';

describe('OWASP Security Utilities', () => {
  it('should strip script tags and dangerous HTML from text input', () => {
    const maliciousInput = '<script>alert("xss")</script>Bonjour le Maroc';
    const cleaned = sanitizeText(maliciousInput);
    expect(cleaned).not.toContain('<script>');
    expect(cleaned).not.toContain('</script>');
    expect(cleaned).toContain('Bonjour le Maroc');
  });

  it('should validate legitimate Moroccan phone numbers', () => {
    const validMoroccanPhone = '+212661234567';
    const result = validatePhone(validMoroccanPhone);
    expect(result.isValid).toBe(true);
    expect(result.value).toBe('+212661234567');
  });

  it('should reject invalid email formats', () => {
    const invalidEmail = 'not-an-email';
    const result = validateEmail(invalidEmail);
    expect(result.isValid).toBe(false);
  });

  it('should detect SQL injection patterns in raw queries', () => {
    const sqli = "SELECT * FROM users WHERE 1=1; DROP TABLE users; --";
    expect(detectSqlInjection(sqli)).toBe(true);
  });

  it('should validate secure parameterized queries with placeholders', () => {
    const safeSql = "SELECT * FROM produce_listings WHERE region = $1 AND price_per_kg <= $2";
    const result = validateParameterizedQuery(safeSql, ['Souss-Massa', 15.5]);
    expect(result.isSafe).toBe(true);
  });
});

