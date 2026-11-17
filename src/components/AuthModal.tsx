import React, { useState } from 'react';
import { BookOpen, ShieldCheck, AlertTriangle, Loader2, Play } from 'lucide-react';
import { UserRole } from '../types';
import { auth, db } from '../services/firebaseConfig';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { isDemoMode, demoLogin, demoRegister, DEMO_ACCOUNTS } from '../utils/demoMode';

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

  const demoActive = isDemoMode();

  if (!isOpen) return null;

  // ============ تسجيل دخول سريع لوضع التجربة ============
  const handleDemoQuickLogin = (account: typeof DEMO_ACCOUNTS[0]) => {
    onLogin({
      uid: account.uid,
      name: account.name,
      role: account.role,
      email: account.email,
    });
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // ============ وضع التجربة (Demo Mode) ============
      if (demoActive) {
        if (isRegister) {
          if (!name.trim()) {
            setError('يرجى إدخال الاسم الأكاديمي.');
            setLoading(false);
            return;
          }
          if (!email.trim()) {
            setError('يرجى إدخال البريد الإلكتروني.');
            setLoading(false);
            return;
          }
          const demoUser = demoRegister(name, email);
          onLogin({
            uid: demoUser.uid,
            name: demoUser.name,
            role: demoUser.role,
            email: demoUser.email,
          });
          resetForm();
          onClose();
        } else {
          if (!email.trim() || !password.trim()) {
            setError('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
            setLoading(false);
            return;
          }
          const demoUser = demoLogin(email, password);
          if (demoUser) {
            onLogin({
              uid: demoUser.uid,
              name: demoUser.name,
              role: demoUser.role,
              email: demoUser.email,
            });
            resetForm();
            onClose();
          } else {
            setError('البريد أو كلمة المرور غير صحيحة. يمكنك استخدام أزرار الدخول السريع.');
          }
        }
        setLoading(false);
        return;
      }

      // ============ وضع Firebase الحقيقي ============
      if (isRegister) {
        if (!name.trim()) {
          setError('يرجى إدخال الاسم الأكاديمي.');
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
        if (!email.trim() || !password.trim()) {
          setError('يرجى إدخال البريد الإلكتروني وكلمة المرور.');
          setLoading(false);
          return;
        }

        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        const uid = cred.user.uid;

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
          console.info('[Auth] Could not fetch user document, defaulting to student role.');
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
        setError('هذا البريد الإلكتروني مسجل مسبقاً. جرب تسجيل الدخول.');
      } else if (code === 'auth/weak-password') {
        setError('كلمة المرور ضعيفة جداً. يرجى اختيار كلمة أقوى.');
      } else if (code === 'auth/invalid-email') {
        setError('صيغة البريد الإلكتروني غير صحيحة.');
      } else if (code === 'auth/too-many-requests') {
        setError('تم تجاوز عدد المحاولات المسموح بها. حاول مرة أخرى لاحقاً.');
      } else if (code.includes('network') || code.includes('unavailable')) {
        setError('تعذر الاتصال بالخادم. تحقق من اتصال الإنترنت.');
      } else {
        setError(err?.message || 'حدث خطأ غير متوقع. حاول مرة أخرى.');
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
          maxWidth: '440px', 
          width: '100%', 
          maxHeight: 'calc(100dvh - 1.5rem)',
          overflowY: 'auto',
          position: 'relative',
          padding: '1.25rem 1.25rem 1rem',
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
            top: '10px', 
            left: '10px', 
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
        <div style={{ textAlign: 'center', marginBottom: '0.9rem', marginTop: '0.25rem' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: 'var(--radius-md)', 
            background: 'var(--primary-100)', 
            color: 'var(--primary-700)', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginBottom: '0.4rem' 
          }}>
            <BookOpen size={20} />
          </div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            {isRegister ? 'إنشاء حساب طالب جديد' : 'تسجيل الدخول إلى البوابة'}
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', margin: 0 }}>
            منتدى أسيرا لتعليم البحث العلمي (ASIRA LMS)
          </p>
        </div>

        {/* أزرار الدخول السريع في وضع التجربة */}
        {demoActive && !isRegister && (
          <div style={{ 
            marginBottom: '0.85rem', 
            padding: '0.65rem 0.75rem', 
            background: 'var(--bg-subtle)', 
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Play size={13} color="var(--accent-gold-dark)" />
                دخول تجريبي فوري بنقرة واحدة:
              </span>
              <span style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#fef3c7', color: '#92400e', fontWeight: 700 }}>
                Demo
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.uid}
                  type="button"
                  onClick={() => handleDemoQuickLogin(account)}
                  className="btn btn-outline"
                  style={{
                    padding: '0.4rem 0.2rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.1rem',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    lineHeight: 1.2,
                  }}
                  title={account.email}
                >
                  <span>{account.role === 'student' ? '👨‍🎓 طالب' : account.role === 'instructor' ? '👨‍🏫 مدرس' : '🛡️ مدير'}</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                    {account.role === 'student' ? 'طالب أسيرا' : account.role === 'instructor' ? 'د. أحمد' : 'الإدارة'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* تنبيه حماية الصلاحيات الصارم عند التسجيل الحقيقي */}
        {isRegister && !demoActive && (
          <div style={{ padding: '0.55rem 0.75rem', background: 'var(--primary-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-100)', fontSize: '0.75rem', color: 'var(--primary-800)', marginBottom: '0.75rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <ShieldCheck size={16} color="var(--primary-600)" style={{ flexShrink: 0 }} />
            <span>يُنشأ الحساب بصلاحية طالب افتراضياً وفق ضوابط الأمان.</span>
          </div>
        )}

        {/* رسالة الخطأ */}
        {error && (
          <div style={{ padding: '0.55rem 0.75rem', background: '#fef2f2', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca', fontSize: '0.75rem', color: '#991b1b', marginBottom: '0.75rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <AlertTriangle size={16} color="#dc2626" style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* فاصل إذا كان وضع التجربة نشط */}
        {demoActive && !isRegister && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>أو بالبريد وكلمة المرور</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          </div>
        )}

        {/* نموذج الإدخال */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.2rem', color: 'var(--text-main)' }}>
                الاسم الأكاديمي
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="الاسم الثلاثي أو الرباعي"
                required
                style={{ 
                  width: '100%', 
                  padding: '0.55rem 0.75rem', 
                  borderRadius: 'var(--radius-md)', 
                  border: '1px solid var(--border-color)', 
                  background: 'var(--bg-main)', 
                  color: 'var(--text-main)', 
                  fontFamily: 'var(--font-arabic)',
                  fontSize: '0.85rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.2rem', color: 'var(--text-main)' }}>
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={demoActive ? 'student@demo.asira.com' : 'name@example.com'}
              required
              style={{ 
                width: '100%', 
                padding: '0.55rem 0.75rem', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border-color)', 
                background: 'var(--bg-main)', 
                color: 'var(--text-main)', 
                fontFamily: 'var(--font-arabic)',
                fontSize: '0.85rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '0.2rem', color: 'var(--text-main)' }}>
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={demoActive ? 'demo123' : '••••••••'}
              required={!demoActive || !isRegister}
              minLength={demoActive ? undefined : 6}
              style={{ 
                width: '100%', 
                padding: '0.55rem 0.75rem', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border-color)', 
                background: 'var(--bg-main)', 
                color: 'var(--text-main)', 
                fontFamily: 'var(--font-arabic)',
                fontSize: '0.85rem',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ 
              padding: '0.65rem', 
              marginTop: '0.35rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              borderRadius: 'var(--radius-md)',
            }}
            id="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin-animation" />
                <span>جاري المعالجة...</span>
              </>
            ) : (
              <span>{isRegister ? 'إنشاء حساب طالب' : 'تسجيل الدخول'}</span>
            )}
          </button>
        </form>

        {/* التبديل بين الدخول والتسجيل */}
        <div style={{ textAlign: 'center', marginTop: '0.85rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {isRegister ? (
            <span>لديك حساب بالفعل؟ <button onClick={() => { setIsRegister(false); setError(null); }} style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>سجل دخولك</button></span>
          ) : (
            <span>طالب جديد؟ <button onClick={() => { setIsRegister(true); setError(null); }} style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>أنشئ حسابك هنا</button></span>
          )}
        </div>
      </div>
    </div>
  );
};
