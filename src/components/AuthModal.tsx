import React, { useState } from 'react';
import { BookOpen, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { UserRole } from '../types';
import { auth, db } from '../services/firebaseConfig';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: { uid?: string; name: string; role: UserRole; email: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        // --- 1. إنشاء حساب طالب جديد حقيقي عبر Firebase Auth ---
        if (!name.trim()) {
          setError('يرجى إدخال الاسم الأكاديمي الكامل.');
          setLoading(false);
          return;
        }
        if (!email.trim() || !password.trim()) {
          setError('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('كلمة المرور يجب أن لا تقل عن 6 أحرف.');
          setLoading(false);
          return;
        }

        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const uid = cred.user.uid;

        // تسجيل وثيقة المستخدم كطالب وفق القواعد الأمنية
        await setDoc(doc(db, 'users', uid), {
          uid,
          email: email.trim(),
          displayName: name.trim(),
          role: 'student',
          accountStatus: 'active',
          createdAt: new Date().toISOString(),
        });

        onLogin({
          uid,
          name: name.trim(),
          role: 'student',
          email: email.trim(),
        });
        resetForm();
        onClose();
      } else {
        // --- 2. تسجيل الدخول الحقيقي عبر Firebase Auth ---
        if (!email.trim() || !password.trim()) {
          setError('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
          setLoading(false);
          return;
        }

        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        const uid = cred.user.uid;

        // جلب الدور والاسم المعتمد من وثيقة المستخدم في Firestore
        let role: UserRole = 'student';
        let displayName = cred.user.displayName || email.trim();

        try {
          const userDoc = await getDoc(doc(db, 'users', uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            role = (data.role as UserRole) || 'student';
            displayName = data.displayName || displayName;
          }
        } catch {
          console.info('[Auth] Could not fetch user profile from Firestore, using default student role.');
        }

        onLogin({
          uid,
          name: displayName,
          role,
          email: email.trim(),
        });
        resetForm();
        onClose();
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      } else if (code === 'auth/email-already-in-use') {
        setError('هذا البريد الإلكتروني مسجل مسبقاً. يرجى تسجيل الدخول.');
      } else if (code === 'auth/weak-password') {
        setError('كلمة المرور ضعيفة جداً. يرجى اختيار كلمة سر أقوى.');
      } else if (code === 'auth/invalid-email') {
        setError('صيغة البريد الإلكتروني غير صالحة.');
      } else if (code === 'auth/too-many-requests') {
        setError('تم تجاوز عدد المحاولات المسموح بها مؤقتاً. حاول مرة أخرى لاحقاً.');
      } else if (code.includes('network') || code.includes('unavailable')) {
        setError('تعذر الاتصال بالخادم السحابي. يرجى التحقق من اتصال الإنترنت.');
      } else {
        setError(err?.message || 'حدث خطأ غير متوقع أثناء المصادقة. يرجى المحاولة ثانية.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setName('');
    setPassword('');
    setError(null);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(7, 13, 30, 0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '0.75rem',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="card" 
        style={{ 
          maxWidth: '430px', 
          width: '100%', 
          maxHeight: 'calc(100dvh - 1.5rem)',
          overflowY: 'auto',
          position: 'relative',
          padding: '1.5rem',
          margin: 'auto',
          boxSizing: 'border-box',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        }}
      >
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="btn btn-ghost"
          style={{ 
            position: 'absolute', 
            top: '12px', 
            left: '12px', 
            width: '32px',
            height: '32px',
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1rem',
            lineHeight: 1,
            zIndex: 10,
            borderRadius: 'var(--radius-full)',
          }}
          id="close-auth-modal-btn"
          aria-label="إغلاق"
        >
          ✕
        </button>

        {/* رأس النافذة */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: 'var(--radius-md)', 
            background: 'var(--primary-100)', 
            color: 'var(--primary-700)', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginBottom: '0.5rem' 
          }}>
            <BookOpen size={22} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            {isRegister ? 'إنشاء حساب طالب جديد' : 'تسجيل الدخول إلى البوابة الأكاديمية'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', margin: 0 }}>
            منتدى أسيرا لتعليم البحث العلمي (ASIRA LMS)
          </p>
        </div>

        {/* تنبيه الأمان عند إنشاء حساب جديد */}
        {isRegister && (
          <div style={{ padding: '0.65rem 0.85rem', background: 'var(--primary-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-100)', fontSize: '0.78rem', color: 'var(--primary-800)', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <ShieldCheck size={16} color="var(--primary-600)" style={{ flexShrink: 0 }} />
            <span>يُنشأ أي حساب جديد بصلاحية طالب (Student) افتراضياً وفق ضوابط الأمان الأكاديمي.</span>
          </div>
        )}

        {/* رسالة الخطأ */}
        {error && (
          <div style={{ padding: '0.65rem 0.85rem', background: '#fef2f2', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca', fontSize: '0.78rem', color: '#991b1b', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <AlertTriangle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* نموذج الإدخال */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-main)' }}>
                الاسم الأكاديمي الكامل *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="الاسم الثلاثي أو الرباعي"
                required
                style={{ 
                  width: '100%', 
                  padding: '0.6rem 0.8rem', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border-color)', 
                  background: 'var(--bg-main)', 
                  color: 'var(--text-main)', 
                  fontFamily: 'var(--font-arabic)',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-main)' }}>
              البريد الإلكتروني *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              style={{ 
                width: '100%', 
                padding: '0.6rem 0.8rem', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border-color)', 
                background: 'var(--bg-main)', 
                color: 'var(--text-main)', 
                fontFamily: 'var(--font-arabic)',
                fontSize: '0.88rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-main)' }}>
              كلمة المرور *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              style={{ 
                width: '100%', 
                padding: '0.6rem 0.8rem', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border-color)', 
                background: 'var(--bg-main)', 
                color: 'var(--text-main)', 
                fontFamily: 'var(--font-arabic)',
                fontSize: '0.88rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ 
              padding: '0.75rem', 
              marginTop: '0.4rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem',
              fontSize: '0.92rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
            }}
            id="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin-animation" />
                <span>جاري المصادقة السحابية...</span>
              </>
            ) : (
              <span>{isRegister ? 'إنشاء حساب طالب' : 'تسجيل الدخول'}</span>
            )}
          </button>
        </form>

        {/* التبديل بين الدخول والتسجيل */}
        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {isRegister ? (
            <span>لديك حساب بالفعل؟ <button onClick={() => { setIsRegister(false); setError(null); }} style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>سجل دخولك هنا</button></span>
          ) : (
            <span>طالب جديد في المنصة؟ <button onClick={() => { setIsRegister(true); setError(null); }} style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>أنشئ حسابك الأكاديمي</button></span>
          )}
        </div>
      </div>
    </div>
  );
};
