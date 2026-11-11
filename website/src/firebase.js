import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// The public site only reads from Firestore — no Auth, so it isn't bundled here.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// True once you've filled in .env.local. Used to show a friendly setup notice
// instead of crashing when the config is still empty.
export const firebaseReady = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
