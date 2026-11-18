// ===================================================
// تهيئة اتصال Firebase الحقيقي لمنصة منتدى أسيرا
// ===================================================
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// الإعدادات الرسمية لمشروع Firebase (asira-79469)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCf637G-vYKaejPd66P6p-iZz6Uzd_af3g",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "asira-79469.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "asira-79469",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "asira-79469.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "699835643004",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:699835643004:web:32422ff935838dfb7885f9",
  measurementId: "G-JP6V6JCJFE"
};

// تهيئة التطبيق
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
