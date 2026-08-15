import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBF-d1KdrY0ie2Hb6cxwc3_8KLeS0z3kQM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "friska-afdee.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "friska-afdee",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "friska-afdee.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1013106541549",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1013106541549:web:32e92f8b1add2fa0f85de4",
};

// Initialize Firebase once
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'ping'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client is offline or network is disconnected.");
    }
  }
}
