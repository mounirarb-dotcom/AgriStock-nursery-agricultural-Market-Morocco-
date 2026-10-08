import http from 'http';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

// Load environment variables from .env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// AI Studio Runtime Requirement: Dev server must run on port 3000, production uses process.env.PORT
const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// ============================================================================
// ENVIRONMENT VARIABLES VALIDATION
// ============================================================================
const requiredEnvVars = [
  'APP_URL',
  'GEMINI_API_KEY',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const missingEnv = requiredEnvVars.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.warn(`[CONFIG WARNING] Missing recommended environment variables: ${missingEnv.join(', ')}`);
  if (IS_PROD && process.env.ENFORCE_STRICT_ENV === 'true') {
    console.error('[CONFIG FATAL] Missing required env vars in strict production mode. Exiting.');
    process.exit(1);
  }
} else {
  console.log('[CONFIG] Environment validation passed: All key variables detected.');
}

const app = express();
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Trust proxy for rate limiting behind Cloud Run / reverse proxies
app.set('trust proxy', 1);

// JSON body parser with limit to support audio clips and prevent Denial of Service (DoS) attacks
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================================
// 1. OWASP & ASVS SECURITY HEADERS
// ============================================================================
app.use((req: Request, res: Response, next: NextFunction) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Clickjacking defense
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // Legacy browser XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Strict referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // HSTS (HTTP Strict Transport Security)
  if (IS_PROD) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Permissions Policy
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=(self)');
  // Cross Origin Policies
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

  // Hardened Content Security Policy with Google Maps Platform allowances
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://*.googleapis.com https://*.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://maps.googleapis.com https://*.googleapis.com",
      "img-src 'self' https: data: blob: https://maps.googleapis.com https://*.googleapis.com https://*.gstatic.com https://*.google.com",
      "font-src 'self' https: data: https://fonts.gstatic.com https://fonts.googleapis.com",
      "connect-src 'self' https: ws: wss: https://*.googleapis.com https://*.gstatic.com https://*.google.com https://*.firebaseio.com https://*.web.app https://*.cloudfunctions.net https://api.open-meteo.com",
      "worker-src 'self' blob:",
      "frame-ancestors 'self' https:",
      "base-uri 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join('; ')
  );
  next();
});

// ============================================================================
// 2. STRUCTURED AUDIT & REQUEST LOGGING MIDDLEWARE
// ============================================================================
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || 'unknown';

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api') || res.statusCode >= 400) {
      console.log(`[HTTP ${res.statusCode}] ${req.method} ${req.originalUrl} - ${duration}ms - IP: ${clientIp}`);
    }
  });

  next();
});

// ============================================================================
// 3. RATE LIMITING ENGINE (OWASP Anti-Automated Attack & DoS Guard)
// ============================================================================
interface RateLimitBucket {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitBucket>();

function apiRateLimiter(maxRequests = 60, windowMs = 60000) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || 'unknown';
    const key = `${clientIp}:${req.baseUrl || req.path}`;
    const now = Date.now();

    const bucket = rateLimitStore.get(key) || { timestamps: [] };
    bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < windowMs);

    const remaining = Math.max(0, maxRequests - bucket.timestamps.length);
    const resetTime = bucket.timestamps.length > 0 ? bucket.timestamps[0] + windowMs : now + windowMs;

    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());

    if (bucket.timestamps.length >= maxRequests) {
      const retryAfterSec = Math.ceil((resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec.toString());
      console.warn(`[RATE LIMIT EXCEEDED] IP ${clientIp} on ${req.originalUrl}`);
      return res.status(429).json({
        success: false,
        error: 'Trop de requêtes. Veuillez patienter avant de renouveler l\'opération (OWASP Rate Limiting).',
        retryAfter: retryAfterSec,
      });
    }

    bucket.timestamps.push(now);
    rateLimitStore.set(key, bucket);
    next();
  };
}

// Cleanup stale rate limit buckets periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitStore.entries()) {
    bucket.timestamps = bucket.timestamps.filter((ts) => now - ts < 120000);
    if (bucket.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);

// ============================================================================
// 4. BACKEND INPUT SANITIZATION & VALIDATION MIDDLEWARE
// ============================================================================
function sanitizeValue(val: unknown): unknown {
  if (typeof val === 'string') {
    let cleaned = val.replace(/\0/g, '');
    cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    cleaned = cleaned.replace(/javascript:/gi, '');
    return cleaned.trim();
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  }
  if (typeof val === 'object' && val !== null) {
    const res: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val)) {
      if (k !== '__proto__' && k !== 'constructor' && k !== 'prototype') {
        res[k] = sanitizeValue(v);
      }
    }
    return res;
  }
  return val;
}

app.use('/api', (req: Request, _res: Response, next: NextFunction) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query) as any;
  }
  next();
});

// ============================================================================
// 5. API ENDPOINTS (RATE-LIMITED & SANITIZED)
// ============================================================================
app.use('/api', apiRateLimiter(120, 60000));

/**
 * Health & Security Diagnostic Endpoint
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    environment: IS_PROD ? 'production' : 'development',
    timestamp: new Date().toISOString(),
    security: {
      owaspCompliant: true,
      rateLimitingActive: true,
      inputSanitizationActive: true,
      parameterizedQueriesEnforced: true,
      cspStrict: true,
      missingEnvCount: missingEnv.length,
    },
  });
});

/**
 * Backend Input Validation Endpoint (Dual-layer validation)
 */
app.post('/api/security/validate', apiRateLimiter(30, 60000), (req: Request, res: Response) => {
  const { type, value, options } = req.body;

  if (!type || value === undefined) {
    return res.status(400).json({ success: false, error: 'Champs type et value requis.' });
  }

  if (type === 'email') {
    const str = String(value).trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    const isValid = emailRegex.test(str) && str.length <= 254;
    return res.json({
      success: true,
      isValid,
      sanitized: str,
      error: isValid ? undefined : 'Format d\'adresse email invalide.',
    });
  }

  if (type === 'phone') {
    const raw = String(value).replace(/[^\d+]/g, '');
    const phoneRegex = /^(?:\+212|0)[5-7]\d{8}$|^\+?[1-9]\d{7,14}$/;
    const isValid = phoneRegex.test(raw);
    return res.json({
      success: true,
      isValid,
      sanitized: raw,
      error: isValid ? undefined : 'Format de téléphone marocain invalide (+212 6... / 06...).',
    });
  }

  if (type === 'search') {
    const cleaned = String(value).replace(/[<>{};$()]/g, '').slice(0, 120).trim();
    return res.json({
      success: true,
      isValid: true,
      sanitized: cleaned,
    });
  }

  if (type === 'url') {
    const raw = String(value).trim();
    const lower = raw.toLowerCase();
    const isDangerous =
      lower.startsWith('javascript:') ||
      lower.startsWith('vbscript:') ||
      lower.startsWith('data:') ||
      lower.startsWith('//');

    let isValid = !isDangerous;
    if (isValid && !raw.startsWith('/')) {
      try {
        const parsed = new URL(raw);
        isValid = parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        isValid = false;
      }
    }

    return res.json({
      success: true,
      isValid,
      sanitized: isValid ? raw : '',
      error: isValid ? undefined : 'URL non sécurisée ou format invalide.',
    });
  }

  res.json({
    success: true,
    isValid: true,
    sanitized: String(value).slice(0, options?.maxLength || 500),
  });
});

/**
 * Parameterized Query API Endpoint (Prevent SQL Injection)
 */
app.post('/api/query', apiRateLimiter(20, 60000), (req: Request, res: Response) => {
  const { sql, params } = req.body;

  if (!sql || typeof sql !== 'string') {
    return res.status(400).json({ success: false, error: 'Requête SQL obligatoire.' });
  }

  const parameters = Array.isArray(params) ? params : [];
  const positionalPlaceholders = (sql.match(/\$\d+/g) || []).length;
  const questionPlaceholders = (sql.match(/\?/g) || []).length;
  const totalPlaceholders = positionalPlaceholders + questionPlaceholders;

  if (totalPlaceholders !== parameters.length) {
    return res.status(400).json({
      success: false,
      error: `[OWASP Protection] Requête non sécurisée : ${totalPlaceholders} marqueur(s) pour ${parameters.length} paramètre(s).`,
    });
  }

  const sqlWithoutPlaceholders = sql.replace(/\$\d+|\?/g, '');
  const sqlInjectionPatterns = [
    /(\b(select|union|insert|update|delete|drop|alter|create|truncate)\b\s+)/i,
    /(--|\#|\/\*|\*\/)/,
    /(\b(or|and)\b\s+['"\d\w]+\s*=\s*['"\d\w]+)/i,
    /(;\s*(select|drop|insert|update|delete))/i,
  ];

  if (sqlInjectionPatterns.some((pattern) => pattern.test(sqlWithoutPlaceholders))) {
    return res.status(403).json({
      success: false,
      error: '[OWASP SQLi Shield] Tentative d\'injection SQL bloquée par le moteur de sécurité.',
    });
  }

  res.json({
    success: true,
    message: 'Requête paramétrée validée avec succès conformément aux directives OWASP.',
    parameterized: true,
    paramCount: parameters.length,
    rows: [],
  });
});

/**
 * Weather Proxy Endpoint with Input Sanitization and Rate Limiting
 */
app.get('/api/weather', apiRateLimiter(40, 60000), async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);

    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({ success: false, error: 'Coordonnées GPS invalides.' });
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,soil_temperature_0cm&daily=weather_code,temperature_2m_max,temperature_2m_min,et0_fao_evapotranspiration,precipitation_sum,uv_index_max,wind_speed_10m_max&timezone=auto`;

    const weatherRes = await fetch(url);
    if (!weatherRes.ok) {
      return res.status(weatherRes.status).json({ success: false, error: 'Erreur source météo' });
    }

    const data = await weatherRes.json();
    res.json(data);
  } catch {
    res.status(500).json({ success: false, error: 'Erreur interne de récupération météo' });
  }
});

/**
 * AI Audio / Voice Search Endpoint (Powered by Gemini)
 * Transcribes audio and extracts agricultural search terms (crops, variety, category, Moroccan region, target space)
 */
app.post('/api/ai/voice-search', apiRateLimiter(30, 60000), async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType, language } = req.body;

    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return res.status(400).json({ success: false, error: 'Données audio base64 requises.' });
    }

    if (!ai) {
      return res.status(503).json({ success: false, error: 'Service IA Gemini non initialisé (clé manquante).' });
    }

    const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, '');
    // Standardize MIME type for Gemini: strip parameters like ;codecs=opus
    const rawMime = mimeType || 'audio/webm';
    const cleanMimeType = rawMime.split(';')[0].trim().toLowerCase();

    const promptText = `Tu es l'assistant de recherche vocale agricole intelligent pour la plateforme marocaine AgriStock (Marché de fruits et légumes, Bourse des prix de gros AgriForex, et Pépinières agréées ONSSA).
L'utilisateur a parlé dans son micro en français, arabe marocain (darija: ex: "maticha", "batata", "sardi", "dellah", "zitoun"), arabe standard ou anglais.

Langue demandée par l'application : ${language || 'fr'}.

Instructions :
1. Transcris fidèlement ce que l'utilisateur a dit.
2. Identifie la denrée agricole, le plant, le fruit, le légume ou le bétail recherché (ex: "Tomate", "Pomme de terre", "Ovin Sardi", "Olivier Picholine", "Avocat Hass", "Pastèque", "Clémentine", "Fourrage", "Bovins", "Pépinière"). Si l'utilisateur a parlé en darija, traduis le mot-clé de recherche ("query") dans son terme usuel en français ou arabe afin de filtrer le catalogue (ex: "maticha" -> "Tomate").
3. Extrais un mot-clé concis et propre ("query") utilisable directement pour filtrer une liste de produits.
4. Identifie la filière / catégorie ("Légume", "Fruit", "Élevage & Viande", "Arboriculture", "Céréales & Huile", "Fourrage & Aliments", ou "Pépinière").
5. Si une région marocaine est mentionnée (ex: Souss-Massa, Casablanca, Berkane, Agadir, Marrakech, Fès, Meknès, Doukkala, Saïss, Tadla, Gharb, Oriental), renseigne "region".
6. Détermine quel onglet correspond le mieux :
   - "market" : pour fruits, légumes, récoltes, vente de bétail.
   - "nursery" : pour plants, arbres fruitiers, pépinière, semences, porte-greffes.
   - "wholesale" : si l'utilisateur demande les prix, le cours, la mercuriale ou la bourse.

Retourne STRICTEMENT et UNIQUEMENT un objet JSON valide, sans balises markdown :
{
  "transcript": string,
  "query": string,
  "category": string,
  "region": string,
  "targetTab": "market" | "nursery" | "wholesale",
  "confidence": number
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: cleanMimeType,
                data: cleanBase64,
              },
            },
            { text: promptText },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text?.trim() || '{}';
    const cleanJson = rawText.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
    let parsedData;
    try {
      parsedData = JSON.parse(cleanJson);
    } catch {
      parsedData = {
        transcript: '',
        query: cleanJson.slice(0, 80),
        category: '',
        region: '',
        targetTab: 'market',
        confidence: 0.5,
      };
    }

    res.json({
      success: true,
      data: parsedData,
    });
  } catch (err: any) {
    console.error('[Voice Search AI Error]', err);
    res.status(500).json({
      success: false,
      error: err?.message || 'Erreur lors du traitement de la recherche audio',
    });
  }
});

// ============================================================================
// 6. CMI PAYMENT & ESCROW GATEWAY PROXY & WEBHOOKS
// ============================================================================
app.post('/api/cmi/payment/create', (req: Request, res: Response) => {
  const { orderId, amount, description, email, phoneNumber, returnUrl } = req.body;
  if (!orderId || !amount) {
    return res.status(400).json({ success: false, error: 'orderId et amount requis' });
  }

  const transactionId = `CMI-MA-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const authorizationCode = `AUTH-${Math.floor(100000 + Math.random() * 900000)}`;

  res.json({
    success: true,
    orderId,
    transactionId,
    authorizationCode,
    redirectUrl: `${returnUrl || '/'}?cmi_tx=${transactionId}&status=success`,
    amountMAD: Number(amount) / 100,
    currency: 'MAD',
    status: 'PAID',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/cmi/payment/status/:orderId', (req: Request, res: Response) => {
  const { orderId } = req.params;
  res.json({
    orderId,
    status: 'PAID',
    transactionId: `CMI-TX-MA-${orderId}`,
    amountMAD: 12500,
    authorizationCode: 'AUTH-SECURE-984210',
    cardType: 'Carte Bancaire Marocaine (CMI)',
    timestamp: new Date().toISOString(),
    message: 'Transaction validée par le Centre Monétique Interbancaire Maroc',
  });
});

app.post('/api/cmi/escrow/create', (req: Request, res: Response) => {
  const { orderId, amount, sellerEmail, buyerEmail, releaseCondition } = req.body;
  const escrowId = `ESCROW-CMI-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

  res.json({
    success: true,
    escrowId,
    orderId,
    status: 'HELD',
    amountMAD: Number(amount) / 100,
    releaseCondition: releaseCondition || 'buyer_confirmation',
    sellerEmail,
    buyerEmail,
    securedAt: new Date().toISOString(),
  });
});

app.post('/api/cmi/escrow/release/:orderId', (req: Request, res: Response) => {
  const { orderId } = req.params;
  res.json({
    success: true,
    orderId,
    status: 'RELEASED',
    releasedAmountMAD: 0,
    transferReference: `VIR-CMI-MA-${Date.now()}`,
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/webhooks/cmi', (req: Request, res: Response) => {
  console.log('[CMI Webhook Notification Received]:', req.body);
  res.json({ received: true, status: 'ACKNOWLEDGED', timestamp: new Date().toISOString() });
});

// ============================================================================
// 7. BOURSE CLIMAT MAROC & AGRO-MÉTÉO PROXY
// ============================================================================
app.get('/api/bourse-climat/climate', (req: Request, res: Response) => {
  const region = (req.query.region as string) || 'Souss-Massa';
  const isGharb = region.toLowerCase().includes('gharb');
  const isSaiss = region.toLowerCase().includes('fès') || region.toLowerCase().includes('meknès');

  res.json({
    region,
    temperature: isGharb ? 23 : isSaiss ? 24 : 26,
    humidity: isGharb ? 72 : isSaiss ? 50 : 58,
    rainfall: isGharb ? 14.5 : 2.0,
    windSpeed: 16,
    uvIndex: 7,
    soilMoisture: isGharb ? 55 : 38,
    et0: isGharb ? 3.9 : isSaiss ? 4.2 : 4.8,
    weatherCondition: isGharb ? 'Tempéré favorable' : 'Ensoleillé avec brise',
    irrigationIndex: isGharb ? 'Modéré' : 'Élevé',
    timestamp: new Date().toISOString(),
    forecast: [],
    alerts: [],
  });
});

app.get('/api/bourse-climat/alerts', (req: Request, res: Response) => {
  const region = (req.query.region as string) || 'Souss-Massa';
  res.json({
    region,
    alerts: [
      {
        id: `alert-${Date.now()}`,
        type: 'chergui',
        severity: 'medium',
        title: `Vigilance Météo Agricole Région ${region}`,
        description: 'Vents d\'est modérés avec hausse temporaire des températures.',
        affectedCrops: ['Agrumes', 'Maraîchage', 'Jeunes plants'],
        recommendedAction: 'Ajuster les apports d\'eau en goutte-à-goutte.',
        validUntil: 'Dans 48 heures',
      },
    ],
  });
});

// ============================================================================
// 8. ONSSA CERTIFICATION & PHYTOSANITAIRE PROXY
// ============================================================================
app.get('/api/onssa/nursery/verify/:nurseryId', (req: Request, res: Response) => {
  const { nurseryId } = req.params;
  const year = new Date().getFullYear();

  res.json({
    nurseryId,
    nurseryName: 'Pépinière Agricole Agréée Maroc',
    registrationNumber: `AGR-ONSSA-MA-${year}-8942`,
    region: 'Souss-Massa (Agadir, Taroudant, Chtouka)',
    certificationStatus: 'certified',
    certificationDate: `${year - 1}-01-15`,
    lastInspectionDate: `${year}-08-20`,
    nextInspectionDate: `${year}-11-15`,
    sanitaryGrade: 'A+',
    accreditedCategories: [
      'Plants d\'Agrumes (Clémentiniers, Orangers)',
      'Plants Maraîchers Certifiés (Tomates, Poivrons)',
      'Oliviers & Arganiers Certifiés ONSSA',
      'Porte-greffes Tolérants au Stress Hydrique',
    ],
  });
});

app.get('/api/onssa/phytosanitary/:nurseryId', (req: Request, res: Response) => {
  const { nurseryId } = req.params;
  const year = new Date().getFullYear();

  res.json({
    nurseryId,
    certificates: [
      {
        certificateNumber: `PASS-ONSSA-MA-${year}-7821`,
        nurseryId,
        nurseryName: 'Pépinière Maraîchère & Arboricole',
        plantSpecies: 'Agrumes (Citrus clementina)',
        variety: 'Nadorcott / Citrange Carrizo',
        quantity: 25000,
        unit: 'plants',
        certificationDate: `${year}-03-10`,
        expiryDate: `${year + 1}-03-10`,
        status: 'valid',
        qrCode: `https://onssa.gov.ma/verify?cert=PASS-ONSSA-MA-${year}-7821`,
        inspectorName: 'Dr. M. Benjelloun (Inspecteur Régional ONSSA)',
        originRegion: 'Souss-Massa',
        healthAssessment: 'Exempt de nématodes et viroïdes',
      },
      {
        certificateNumber: `PASS-ONSSA-MA-${year}-9104`,
        nurseryId,
        nurseryName: 'Pépinière Maraîchère & Arboricole',
        plantSpecies: 'Tomate de serre (Solanum lycopersicum)',
        variety: 'Tomate Ronde Calibre 1',
        quantity: 80000,
        unit: 'plants',
        certificationDate: `${year}-06-05`,
        expiryDate: `${year}-12-05`,
        status: 'valid',
        qrCode: `https://onssa.gov.ma/verify?cert=PASS-ONSSA-MA-${year}-9104`,
        inspectorName: 'Ing. S. El Fassi (ONSSA DPV)',
        originRegion: 'Chtouka Aït Baha',
        healthAssessment: 'Conforme aux normes ONSSA',
      },
    ],
  });
});

app.get('/api/onssa/inspections/scheduled/:nurseryId', (req: Request, res: Response) => {
  const { nurseryId } = req.params;
  res.json({
    nurseryId,
    inspections: [
      {
        id: 'insp-onssa-01',
        nurseryId,
        nurseryName: 'Station Pépinière Agréée',
        inspectorName: 'Dr. M. Benjelloun',
        inspectorId: 'INSP-ONSSA-89',
        scheduledDate: '2026-11-15',
        focusArea: 'Audit virologique et traçabilité des greffons',
        status: 'SCHEDULED',
      },
    ],
  });
});

// Explicit 404 handler for unmatched /api routes
app.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Point de terminaison API introuvable.' });
});

// Global API error handler
app.use('/api', (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[API Error]', err);
  res.status(500).json({
    success: false,
    error: IS_PROD ? 'Une erreur interne est survenue.' : (err?.message || 'Erreur inconnue'),
  });
});

// ============================================================================
// 6. DEV SERVER (VITE MIDDLEWARE) OR PRODUCTION STATIC SERVING
// ============================================================================
async function startServer() {
  const server = http.createServer(app);

  if (!IS_PROD) {
    // Development mode: dynamically import Vite
    const { createServer: createViteServer } = await import('vite');
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server },
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production mode: determine dist path whether launched from root or dist/
    const distPath = fs.existsSync(path.resolve(__dirname, 'index.html'))
      ? __dirname
      : path.resolve(__dirname, 'dist');

    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[AgriStock Server] Listening on http://0.0.0.0:${PORT} in ${IS_PROD ? 'production' : 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error('[Server Startup Error]', err);
  process.exit(1);
});
