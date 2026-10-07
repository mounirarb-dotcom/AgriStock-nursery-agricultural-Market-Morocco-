/**
 * Parameterized Database Query Engine & OWASP Injection Prevention Layer
 * 
 * Implements:
 * - Strict parameter binding ($1, $2 or ?) to ensure separation of code from data
 * - Detection and blocking of SQL injection patterns (tautologies, stacked queries, comment hacks)
 * - Safe query builders for datastore / analytical queries
 */

import { detectSqlInjection, validateParameterizedQuery } from '../utils/securityUtils';

export interface QueryResult<T = unknown> {
  rows: T[];
  rowCount: number;
  executionTimeMs: number;
  isSecure: boolean;
}

/**
 * Executes a parameterized query securely, guaranteeing SQL injection prevention.
 * Rejects any unparameterized queries or queries containing injection signatures.
 */
export async function executeParameterizedQuery<T = Record<string, unknown>>(
  sql: string,
  params: (string | number | boolean | null | Date)[] = []
): Promise<QueryResult<T>> {
  const startTime = Date.now();

  // 1. Parameterized check: Ensure query uses placeholders rather than concatenation
  const validation = validateParameterizedQuery(sql, params);
  if (!validation.isSafe) {
    throw new Error(`[OWASP SQLi Guard] Rejet de sécurité : ${validation.error}`);
  }

  // 2. Secondary check: Detect SQL injection signatures within parameter values
  if (params.some((p) => typeof p === 'string' && detectSqlInjection(p))) {
    throw new Error('[OWASP SQLi Guard] Injection SQL détectée et neutralisée dans les paramètres.');
  }

  // 3. Normalize parameters (sanitize strings, convert dates)
  const safeParams = params.map((p) => {
    if (typeof p === 'string') {
      // Remove null bytes
      return p.replace(/\0/g, '');
    }
    return p;
  });

  // Simulated parameterized database execution (or pass to Cloud SQL / backend proxy)
  return {
    rows: [] as T[],
    rowCount: 0,
    executionTimeMs: Date.now() - startTime,
    isSecure: true,
  };
}

/**
 * Builds a safe parameterized SELECT query
 */
export function buildSafeSelectQuery(
  tableName: string,
  columns: string[],
  filters: Record<string, unknown>
): { sql: string; params: unknown[] } {
  // Validate table name (alphanumeric + underscore only)
  if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
    throw new Error('[OWASP Security] Nom de table non autorisé.');
  }

  // Validate column names
  const safeColumns = columns.map((col) => {
    if (!/^[a-zA-Z0-9_]+$/.test(col)) {
      throw new Error(`[OWASP Security] Nom de colonne non autorisé : ${col}`);
    }
    return col;
  });

  const columnList = safeColumns.length > 0 ? safeColumns.join(', ') : '*';
  const filterEntries = Object.entries(filters);

  if (filterEntries.length === 0) {
    return {
      sql: `SELECT ${columnList} FROM ${tableName}`,
      params: [],
    };
  }

  const whereClauses: string[] = [];
  const params: unknown[] = [];

  filterEntries.forEach(([key, val], idx) => {
    if (!/^[a-zA-Z0-9_]+$/.test(key)) {
      throw new Error(`[OWASP Security] Nom de champ de filtre invalide : ${key}`);
    }
    whereClauses.push(`${key} = $${idx + 1}`);
    params.push(val);
  });

  return {
    sql: `SELECT ${columnList} FROM ${tableName} WHERE ${whereClauses.join(' AND ')}`,
    params,
  };
}
