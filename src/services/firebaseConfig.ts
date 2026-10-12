// ===================================================
// تهيئة اتصال Firebase لمنصة منتدى أسيرا
// ===================================================
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// قراءة الإعدادات من متغيرات البيئة الآمنة (Vite Env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyMockKeyForAsiraResearchForumDev123",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "asira-platform.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "asira-platform",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "asira-platform.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456789"
};

// تهيئة التطبيق فقط إذا لم يكن مُهيئاً مسبقاً
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
