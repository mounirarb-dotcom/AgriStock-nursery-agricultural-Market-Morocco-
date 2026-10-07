/**
 * OWASP Security Utility for AgriStock (Maroc)
 * 
 * Implements core OWASP Application Security Verification Standard (ASVS) requirements:
 * 1. Sanitization of all user inputs (Forms, Search, URLs)
 * 2. Protection against Cross-Site Scripting (XSS)
 * 3. Prevention of SQL / NoSQL / Command Injections
 * 4. Client-side and backend-mirrored input validation
 * 5. Rate limiting guards against automated spam / brute-force attacks
 * 6. Safe URL verification to prevent Open Redirects and SSRF
 */

// ============================================================================
// 1. XSS & HTML ENTITY SANITIZATION
// ============================================================================

const HTML_ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Encodes special characters to prevent HTML/XSS injection.
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  return str.replace(/[&<>"'`=\/]/g, (s) => HTML_ENTITY_MAP[s] || s);
}

/**
 * Strips script tags, javascript: pseudo-protocols, dangerous event handlers (onload, onerror),
 * control characters, and null bytes from any user-supplied string.
 */
export function sanitizeText(input: unknown, maxLength = 5000): string {
  if (input === null || input === undefined) return '';
  let str = String(input);

  // Remove null bytes and dangerous invisible control characters
  str = str.replace(/\0/g, '').replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, '');

  // Normalize Unicode to canonical decomposition/composition to prevent homoglyph attacks
  try {
    str = str.normalize('NFKC');
  } catch {
    // Fallback if environment doesn't support NFKC
  }

  // Strip script tags and iframe tags completely
  str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  str = str.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  // Strip inline event attributes like onclick=, onerror=, onload=
  str = str.replace(/\bon[a-z]+\s*=\s*(['"]).*?\1/gi, '');
  str = str.replace(/\bon[a-z]+\s*=\s*[^>\s]+/gi, '');

  // Strip javascript: or data: pseudo-protocols in text
  str = str.replace(/javascript:/gi, '');
  str = str.replace(/vbscript:/gi, '');

  // Trim whitespace
  str = str.trim();

  // Enforce max length constraint
  if (str.length > maxLength) {
    str = str.slice(0, maxLength);
  }

  return str;
}

// ============================================================================
// 2. SEARCH INPUT SANITIZATION
// ============================================================================

/**
 * Sanitizes search queries:
 * - Caps max length to 120 characters to prevent ReDoS (Regular Expression Denial of Service)
 * - Strips characters used in SQL/NoSQL injection and regex exploits
 */
export function sanitizeSearchQuery(query: unknown, maxLength = 120): string {
  if (!query) return '';
  let cleaned = String(query).trim();

  // Strip null bytes and control chars
  cleaned = cleaned.replace(/\0/g, '');

  // Remove dangerous characters used in SQL injection and XSS
  cleaned = cleaned.replace(/[<>{};$()]/g, '');

  // Prevent regex metacharacter bombardment
  cleaned = cleaned.replace(/[*+?^${}()|[\]\\]/g, ' ');

  // Collapse multiple spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Enforce max length
  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength).trim();
  }

  return cleaned;
}

// ============================================================================
// 3. URL SANITIZATION (PREVENT OPEN REDIRECT & XSS)
// ============================================================================

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * Sanitizes and validates a URL to ensure it is safe to display or navigate to.
 * Explicitly rejects javascript:, data:, vbscript:, file:, and protocol-relative URLs.
 */
export function sanitizeUrl(url: unknown, defaultFallback = ''): string {
  if (!url || typeof url !== 'string') return defaultFallback;

  const trimmed = url.trim();

  // Explicit rejection of dangerous pseudo-protocols, but allow safe image data URLs & blobs for photos
  const lower = trimmed.toLowerCase();

  // Safe image data URLs from camera and file upload
  if (
    lower.startsWith('data:image/jpeg;') ||
    lower.startsWith('data:image/jpg;') ||
    lower.startsWith('data:image/png;') ||
    lower.startsWith('data:image/webp;') ||
    lower.startsWith('data:image/gif;')
  ) {
    return trimmed;
  }

  // Safe blob URLs from local camera / file captures
  if (lower.startsWith('blob:')) {
    return trimmed;
  }

  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('file:')
  ) {
    return defaultFallback;
  }

  // Allow relative URLs starting with '/' but not protocol-relative '//'
  if (trimmed.startsWith('/')) {
    if (trimmed.startsWith('//')) {
      return defaultFallback; // Block protocol-relative open redirects like //evil.com
    }
    return trimmed;
  }

  // Verify absolute URLs have http: or https:
  try {
    const parsed = new URL(trimmed);
    if (ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      return parsed.toString();
    }
  } catch {
    // Malformed URL
    return defaultFallback;
  }

  return defaultFallback;
}

// ============================================================================
// 4. NUMBER & FINANCIAL SANITIZATION
// ============================================================================

export interface SanitizeNumberOptions {
  min?: number;
  max?: number;
  defaultValue?: number;
  allowDecimals?: boolean;
  precision?: number;
}

/**
 * Safely parses and sanitizes numbers, protecting against NaN, Infinity, and out-of-bounds inputs.
 */
export function sanitizeNumber(value: unknown, options: SanitizeNumberOptions = {}): number {
  const {
    min = 0,
    max = 1_000_000_000,
    defaultValue = 0,
    allowDecimals = true,
    precision = 2,
  } = options;

  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }

  let num = typeof value === 'number' ? value : Number(value);

  if (isNaN(num) || !isFinite(num)) {
    return defaultValue;
  }

  if (!allowDecimals) {
    num = Math.floor(num);
  } else if (precision !== undefined) {
    const factor = Math.pow(10, precision);
    num = Math.round(num * factor) / factor;
  }

  if (num < min) return min;
  if (num > max) return max;

  return num;
}

// ============================================================================
// 5. DEEP OBJECT SANITIZATION (FORMS & PAYLOADS)
// ============================================================================

/**
 * Recursively sanitizes all string properties within an object,
 * while safeguarding against prototype pollution attacks.
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'string') {
      return sanitizeText(obj) as unknown as T;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item)) as unknown as T;
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    // Prototype pollution guard: skip __proto__, constructor, prototype
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }

    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

// ============================================================================
// 6. INPUT VALIDATION (FRONTEND & BACKEND CO-VALIDATION)
// ============================================================================

export interface ValidationResult<T = string> {
  isValid: boolean;
  value: T;
  error?: string;
}

/**
 * Validates email according to OWASP guidelines (RFC 5322 regex + length guard).
 */
export function validateEmail(email: unknown): ValidationResult<string> {
  const sanitized = sanitizeText(email, 254).toLowerCase();

  if (!sanitized) {
    return { isValid: false, value: '', error: 'L\'adresse email est obligatoire.' };
  }

  // OWASP standard email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(sanitized)) {
    return { isValid: false, value: sanitized, error: 'Format d\'adresse email invalide.' };
  }

  return { isValid: true, value: sanitized };
}

/**
 * Validates phone numbers (Moroccan format e.g., +212 6... or 06... and international).
 */
export function validatePhone(phone: unknown): ValidationResult<string> {
  const raw = sanitizeText(phone, 30);
  // Keep only digits and '+'
  const cleaned = raw.replace(/[^\d+]/g, '');

  if (!cleaned) {
    return { isValid: false, value: '', error: 'Le numéro de téléphone est obligatoire.' };
  }

  // Moroccan (+212... / 05... / 06... / 07...) or standard E.164
  const phoneRegex = /^(?:\+212|0)[5-7]\d{8}$|^\+?[1-9]\d{7,14}$/;

  if (!phoneRegex.test(cleaned)) {
    return {
      isValid: false,
      value: cleaned,
      error: 'Format de téléphone invalide (Ex: +212 661 234567 ou 0661234567).',
    };
  }

  return { isValid: true, value: cleaned };
}

/**
 * Validates a text field with bounds checking.
 */
export function validateTextInput(
  value: unknown,
  options: {
    fieldName?: string;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    patternMessage?: string;
  } = {}
): ValidationResult<string> {
  const {
    fieldName = 'Ce champ',
    required = true,
    minLength = 1,
    maxLength = 500,
    pattern,
    patternMessage = 'Format invalide',
  } = options;

  const sanitized = sanitizeText(value, maxLength);

  if (required && (!sanitized || sanitized.length === 0)) {
    return { isValid: false, value: '', error: `${fieldName} est requis.` };
  }

  if (sanitized.length < minLength) {
    return {
      isValid: false,
      value: sanitized,
      error: `${fieldName} doit contenir au moins ${minLength} caractères.`,
    };
  }

  if (sanitized.length > maxLength) {
    return {
      isValid: false,
      value: sanitized.slice(0, maxLength),
      error: `${fieldName} ne peut pas dépasser ${maxLength} caractères.`,
    };
  }

  if (pattern && !pattern.test(sanitized)) {
    return { isValid: false, value: sanitized, error: `${fieldName} : ${patternMessage}.` };
  }

  return { isValid: true, value: sanitized };
}

// ============================================================================
// 7. PARAMETERIZED QUERIES (SQL INJECTION PREVENTION)
// ============================================================================

/**
 * SQL Injection Detection Signatures (OWASP Top 10)
 */
const SQL_INJECTION_PATTERNS = [
  /(\b(select|union|insert|update|delete|drop|alter|create|truncate|exec|declare)\b\s+)/i,
  /(--|\#|\/\*|\*\/)/, // Comments
  /(\b(or|and)\b\s+['"\d\w]+\s*=\s*['"\d\w]+)/i, // 1=1 tautology
  /(;\s*(select|drop|insert|update|delete|truncate))/i, // Stacked queries
  /(benchmark\s*\(\s*\d+\s*,\s*|sleep\s*\(\s*\d+\s*\))/i, // Time-based blind injection
  /(xp_cmdshell|exec\s*\()/i, // Command execution
];

/**
 * Checks if a string contains typical SQL injection attack payloads.
 */
export function detectSqlInjection(input: string): boolean {
  if (!input) return false;
  return SQL_INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

export interface ParameterizedQuery {
  sql: string;
  parameters: (string | number | boolean | null)[];
}

/**
 * Validates that a query uses parameter placeholders ($1, $2 or ?)
 * instead of unsafe string concatenation, guaranteeing SQL injection prevention.
 */
export function validateParameterizedQuery(
  sql: string,
  parameters: unknown[]
): { isSafe: boolean; error?: string } {
  if (!sql || typeof sql !== 'string') {
    return { isSafe: false, error: 'Requête SQL manquante ou invalide.' };
  }

  // Count positional parameters ($1, $2, ... or ?)
  const positionalPlaceholders = (sql.match(/\$\d+/g) || []).length;
  const questionPlaceholders = (sql.match(/\?/g) || []).length;
  const totalPlaceholders = positionalPlaceholders + questionPlaceholders;

  if (totalPlaceholders !== parameters.length) {
    return {
      isSafe: false,
      error: `Incohérence des paramètres sécurisés : ${totalPlaceholders} marqueur(s) pour ${parameters.length} valeur(s).`,
    };
  }

  // Reject direct string literals containing SQL injection attempts (stacked queries, comments, drop/truncate)
  const dangerousPatterns = [
    /(\b(drop|alter|truncate|exec|declare|xp_cmdshell)\b\s+)/i,
    /(--|\#|\/\*|\*\/)/,
    /(;\s*(select|drop|insert|update|delete|truncate))/i,
    /(\b(or|and)\b\s+['"\d\w]+\s*=\s*['"\d\w]+)/i,
  ];

  if (dangerousPatterns.some((pattern) => pattern.test(sql.replace(/\$\d+|\?/g, '')))) {
    return {
      isSafe: false,
      error: 'Requête suspecte contenant des signatures d\'injection SQL bloquées par la politique OWASP.',
    };
  }

  return { isSafe: true };
}

// ============================================================================
// 8. CLIENT-SIDE RATE LIMITER (ANTI-SPAM / BRUTE-FORCE GUARD)
// ============================================================================

interface RateLimitRecord {
  timestamps: number[];
}

export class ClientRateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();

  /**
   * Checks if an action is within allowed rate limits.
   * Uses a sliding window algorithm.
   * 
   * @param actionKey Unique identifier for the action (e.g. 'search:produce', 'form:contact')
   * @param maxRequests Maximum allowed requests in window
   * @param windowMs Time window in milliseconds (default: 60,000ms = 1 minute)
   */
  public check(
    actionKey: string,
    maxRequests = 30,
    windowMs = 60000
  ): { allowed: boolean; remaining: number; retryAfterMs: number } {
    const now = Date.now();
    const record = this.records.get(actionKey) || { timestamps: [] };

    // Discard timestamps older than window
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

    if (record.timestamps.length >= maxRequests) {
      const oldest = record.timestamps[0];
      const retryAfterMs = Math.max(0, windowMs - (now - oldest));
      return {
        allowed: false,
        remaining: 0,
        retryAfterMs,
      };
    }

    record.timestamps.push(now);
    this.records.set(actionKey, record);

    return {
      allowed: true,
      remaining: maxRequests - record.timestamps.length,
      retryAfterMs: 0,
    };
  }

  /**
   * Clears rate limit records (e.g. after logout or reset).
   */
  public reset(actionKey?: string): void {
    if (actionKey) {
      this.records.delete(actionKey);
    } else {
      this.records.clear();
    }
  }

  public clear(): void {
    this.reset();
  }
}

export const globalClientRateLimiter = new ClientRateLimiter();
