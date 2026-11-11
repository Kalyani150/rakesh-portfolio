import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY;

const firebaseConfig = {
  // getAuth() throws on an empty key, which would blank the whole app before the
  // "not configured" banner can render. A placeholder keeps the UI alive; firebaseReady
  // (below) still reports the real state.
  apiKey: rawApiKey || "not-configured",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// True once you've filled in .env.local. Used to show a friendly setup notice
// instead of crashing when the config is still empty.
export const firebaseReady = Boolean(rawApiKey && firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
