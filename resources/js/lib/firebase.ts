import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const rawConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
] as const;

const missingKeys = requiredKeys
  .filter((key) => !rawConfig[key])
  .map((key) => key);

if (missingKeys.length > 0) {
  throw new Error(
    `Missing Firebase config values: ${missingKeys.join(', ')}. Add them to .env or VITE environment variables.`
  );
}

const firebaseConfig: FirebaseOptions = {
  apiKey: rawConfig.apiKey,
  authDomain: rawConfig.authDomain,
  projectId: rawConfig.projectId,
  storageBucket: rawConfig.storageBucket,
  messagingSenderId: rawConfig.messagingSenderId,
  appId: rawConfig.appId,
  ...(rawConfig.measurementId ? { measurementId: rawConfig.measurementId } : {}),
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);

export async function ensureFirebaseAuth() {
  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
}
