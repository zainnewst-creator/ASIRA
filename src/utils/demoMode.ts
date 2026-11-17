// ===================================================
// وضع التجربة (Demo Mode) — يعمل تلقائياً عند عدم تفعيل Firebase
// عند تفعيل Firebase الحقيقي، يتم تجاهل هذا الملف بالكامل
// ===================================================

import { UserRole } from '../types';

// التحقق مما إذا كانت مفاتيح Firebase الحقيقية موجودة
// إذا كان API Key يحتوي على "Mock" أو غير موجود = وضع تجربة
export const isDemoMode = (): boolean => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || '';
  // إذا كان المفتاح فارغاً أو يحتوي على Mock أو هو المفتاح الافتراضي
  return !apiKey || apiKey.includes('Mock') || apiKey === 'AIzaSyMockKeyForAsiraResearchForumDev123';
};

// حسابات التجربة (Demo Accounts)
export interface DemoAccount {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  uid: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'student@demo.asira.com',
    password: 'demo123',
    name: 'طالب تجريبي',
    role: 'student',
    uid: 'demo-student-1',
  },
  {
    email: 'instructor@demo.asira.com',
    password: 'demo123',
    name: 'د. أحمد المدرس',
    role: 'instructor',
    uid: 'demo-instructor-1',
  },
  {
    email: 'admin@demo.asira.com',
    password: 'demo123',
    name: 'مدير المنصة',
    role: 'admin',
    uid: 'demo-admin-1',
  },
];

// محاكاة تسجيل الدخول في وضع التجربة
export const demoLogin = (email: string, password: string): DemoAccount | null => {
  const account = DEMO_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.toLowerCase().trim() && a.password === password
  );
  return account || null;
};

// محاكاة إنشاء حساب في وضع التجربة
export const demoRegister = (name: string, email: string): DemoAccount => {
  return {
    email: email.trim(),
    password: '',
    name: name.trim(),
    role: 'student',
    uid: `demo-student-${Date.now()}`,
  };
};
