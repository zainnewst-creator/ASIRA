import React, { useState } from 'react';
import { BookOpen, ShieldCheck, AlertTriangle, Loader2, CheckCircle2, KeyRound } from 'lucide-react';
import { UserRole } from '../types';
import { auth, db, googleProvider } from '../services/firebaseConfig';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: { uid?: string; name: string; role: UserRole; email: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // استرجاع البريد المحفوظ تلقائياً عند فتح النافذة
  React.useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('asira_remember_email');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setName('');
    setPassword('');
    setError(null);
    setIsForgotPassword(false);
    setResetSent(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('يرجى إدخال البريد الإلكتروني المسجل لإرسال رابط الاستعادة.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setResetSent(true);
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found') {
        setError('لا يوجد حساب مسجل بهذا البريد الإلكتروني.');
      } else if (code === 'auth/invalid-email') {
        setError('صيغة البريد الإلكتروني غير صالحة.');
      } else {
        setError(err?.message || 'تعذر إرسال رابط استعادة كلمة المرور.');
      }
    } finally {
      setLoading(false);
    }
  };

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

        if (rememberMe) {
          try {
            localStorage.setItem('asira_remember_email', email.trim());
          } catch {}
        }

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

        if (rememberMe) {
          try {
            localStorage.setItem('asira_remember_email', email.trim());
          } catch {}
        } else {
          try {
            localStorage.removeItem('asira_remember_email');
          } catch {}
        }

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

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const uid = user.uid;

      let role: UserRole = 'student';
      let displayName = user.displayName || user.email || 'طالب أسيرا';

      try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          role = (data.role as UserRole) || 'student';
          displayName = data.displayName || displayName;
        } else {
          await setDoc(doc(db, 'users', uid), {
            uid,
            email: user.email || '',
            displayName,
            role: 'student',
            accountStatus: 'active',
            createdAt: new Date().toISOString(),
          });
        }
      } catch (docErr) {
        console.info('[Auth] Could not sync user doc on Google sign-in:', docErr);
      }

      onLogin({
        uid,
        name: displayName,
        role,
        email: user.email || '',
      });
      resetForm();
      onClose();
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        // ألغى المستخدم النافذة المنبثقة
      } else if (code === 'auth/unauthorized-domain') {
        setError('النطاق الحالي غير مصرح به في Firebase. يرجى إضافة رابط الموقع في Firebase Console -> Authentication -> Settings -> Authorized domains.');
      } else if (code === 'auth/popup-blocked') {
        setError('تم حجب النافذة المنبثقة بواسطة المتصفح. يرجى السماح بالنوافذ المنبثقة (Popups) وإعادة المحاولة.');
      } else if (code === 'auth/operation-not-allowed') {
        setError('موفر تسجيل الدخول عبر Google غير مفعّل في Firebase Authentication Console.');
      } else {
        setError(err?.message || 'تعذر تسجيل الدخول عبر Google. حاول مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="modal-card" 
        style={{ 
          maxWidth: '430px', 
          width: '100%', 
          padding: '1.5rem',
          margin: 'auto',
          boxSizing: 'border-box',
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
            {isForgotPassword ? <KeyRound size={22} /> : <BookOpen size={22} />}
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            {isForgotPassword ? 'استعادة كلمة المرور' : isRegister ? 'إنشاء حساب طالب جديد' : 'تسجيل الدخول إلى البوابة الأكاديمية'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', margin: 0 }}>
            {isForgotPassword ? 'أدخل بريدك الإلكتروني لإرسال رابط إعادة تعيين كلمة المرور' : 'منتدى أسيرا لتعليم البحث العلمي (ASIRA LMS)'}
          </p>
        </div>

        {/* رسالة نجاح إرسال رابط استعادة كلمة المرور */}
        {resetSent && (
          <div className="alert-box alert-box-success" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.82rem' }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح! تفقد صندوق الوارد أو مجلد البريد غير المرغوب فيه (Spam).</span>
          </div>
        )}

        {/* رسالة الخطأ */}
        {error && (
          <div className="alert-box alert-box-danger" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.82rem' }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* نموذج استعادة كلمة المرور */}
        {isForgotPassword ? (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-main)' }}>
                البريد الإلكتروني المسجل *
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
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spin-animation" />
                  <span>جاري الإرسال...</span>
                </>
              ) : (
                <span>إرسال رابط الاستعادة إلى البريد</span>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.82rem' }}>
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setResetSent(false);
                  setError(null);
                }}
                style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
              >
                ← العودة إلى تسجيل الدخول
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* زر تسجيل الدخول المباشر بحساب Google */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="btn btn-outline"
              style={{
                width: '100%',
                padding: '0.65rem',
                marginBottom: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
                fontSize: '0.88rem',
                fontWeight: 700,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-main)',
                color: 'var(--text-main)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>المتابعة بحساب Google</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.9rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>أو بالبريد وكلمة المرور</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            </div>

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    كلمة المرور *
                  </label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setError(null);
                        setResetSent(false);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary-600)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        padding: 0,
                        fontFamily: 'inherit'
                      }}
                    >
                      نسيت كلمة المرور؟
                    </button>
                  )}
                </div>
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

              {!isRegister && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                  <input
                    type="checkbox"
                    id="auth-remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--primary-600)' }}
                  />
                  <label
                    htmlFor="auth-remember-me"
                    style={{ fontSize: '0.82rem', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}
                  >
                    تذكر بيانات تسجيلي على هذا الجهاز
                  </label>
                </div>
              )}

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
          </>
        )}
      </div>
    </div>
  );
};
