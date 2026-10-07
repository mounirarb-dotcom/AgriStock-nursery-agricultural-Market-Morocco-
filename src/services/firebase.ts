import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  setLogLevel,
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
  where,
  Timestamp,
} from 'firebase/firestore';
import rawFirebaseConfig from '../../firebase-applet-config.json';

// Silence non-fatal offline connection retry warnings in console
try {
  setLogLevel('error');
} catch {
  // Ignore in environments where setLogLevel is not supported
}

// OWASP Guideline: Support environment variables for API configuration with safe fallback
const resolveEnv = (val: unknown, fallback: string): string => {
  if (typeof val === 'string' && val.trim() && !val.startsWith('YOUR_') && !val.startsWith('MY_')) {
    return val;
  }
  return fallback;
};

const firebaseConfig = {
  ...rawFirebaseConfig,
  apiKey: resolveEnv(import.meta.env.VITE_FIREBASE_API_KEY, rawFirebaseConfig.apiKey),
  authDomain: resolveEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, rawFirebaseConfig.authDomain),
  projectId: resolveEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID, rawFirebaseConfig.projectId),
  storageBucket: resolveEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, rawFirebaseConfig.storageBucket),
  messagingSenderId: resolveEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID, rawFirebaseConfig.messagingSenderId),
  appId: resolveEnv(import.meta.env.VITE_FIREBASE_APP_ID, rawFirebaseConfig.appId),
};

// Initialize Firebase App singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use explicit database ID from config or environment (named database)
const firestoreDbId = resolveEnv(
  import.meta.env.VITE_FIREBASE_DATABASE_ID,
  rawFirebaseConfig.firestoreDatabaseId || ''
);

const initFirestoreDb = () => {
  const targetDbId = firestoreDbId && firestoreDbId !== '(default)' ? firestoreDbId : undefined;
  
  if (typeof window !== 'undefined') {
    try {
      return initializeFirestore(
        app,
        {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
          }),
        },
        targetDbId
      );
    } catch (_err) {
      // Fallback if already initialized
      return targetDbId ? getFirestore(app, targetDbId) : getFirestore(app);
    }
  }

  return targetDbId ? getFirestore(app, targetDbId) : getFirestore(app);
};

export const db = initFirestoreDb();

export {
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
  where,
  Timestamp,
};
