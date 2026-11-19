// ===================================================
// تهيئة اتصال Firebase الحقيقي لمنصة منتدى أسيرا
// ===================================================
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// الإعدادات الرسمية لمشروع Firebase (asira-79469)
// ⚠️ يجب تعريف المتغيرات في ملف .env (لا تُكتب مباشرة في الكود)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// التحقق من وجود الإعدادات الأساسية
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    '[Firebase] ⚠️ إعدادات Firebase غير موجودة! تأكد من إنشاء ملف .env يحتوي على:\n' +
    'VITE_FIREBASE_API_KEY=...\nVITE_FIREBASE_PROJECT_ID=...\n' +
    'راجع .env.example للتفاصيل.'
  );
}

// تهيئة التطبيق
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
