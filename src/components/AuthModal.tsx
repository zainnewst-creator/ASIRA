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
            setError('البريد أو كلمة المرور غير صحيحة. جرب حسابات التجربة أدناه.');
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
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(7, 13, 30, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1rem',
    }}>
      <div className="card" style={{ maxWidth: '460px', width: '100%', position: 'relative' }}>
        <button
          onClick={onClose}
          className="btn btn-ghost"
          style={{ position: 'absolute', top: '12px', left: '12px', padding: '0.25rem 0.5rem', fontSize: '1.1rem' }}
          id="close-auth-modal-btn"
        >
          ✕
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <BookOpen size={24} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {isRegister ? 'إنشاء حساب طالب جديد' : 'تسجيل الدخول إلى البوابة الأكاديمية'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            منتدى أسيرا لتعليم البحث العلمي (ASIRA LMS)
          </p>
        </div>

        {/* بانر وضع التجربة */}
        {demoActive && (
          <div style={{
            padding: '0.75rem',
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #f59e0b',
            fontSize: '0.8rem',
            color: '#92400e',
            marginBottom: '1rem',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
          }}>
            <Play size={16} color="#d97706" />
            <span><strong>وضع التجربة:</strong> Firebase غير مفعّل. استخدم الحسابات التجريبية أدناه لاستعراض المنصة.</span>
          </div>
        )}

        {/* تنبيه حماية الصلاحيات الصارم */}
        {isRegister && !demoActive && (
          <div style={{ padding: '0.75rem', background: 'var(--primary-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-100)', fontSize: '0.8rem', color: 'var(--primary-800)', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <ShieldCheck size={18} color="var(--primary-600)" />
            <span>يُنشأ أي حساب جديد بصلاحية طالب (Student) افتراضياً وفق قواعد الأمان الصارمة.</span>
          </div>
        )}

        {/* رسالة الخطأ */}
        {error && (
          <div style={{ padding: '0.75rem', background: '#fef2f2', borderRadius: 'var(--radius-md)', border: '1px solid #fecaca', fontSize: '0.8rem', color: '#991b1b', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <AlertTriangle size={18} color="#dc2626" />
            <span>{error}</span>
          </div>
        )}

        {/* أزرار الدخول السريع في وضع التجربة */}
        {demoActive && !isRegister && (
          <div style={{ marginBottom: '1.25rem' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              دخول سريع بحساب تجريبي:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.uid}
                  type="button"
                  onClick={() => handleDemoQuickLogin(account)}
                  className="btn btn-outline"
                  style={{
                    padding: '0.55rem 0.75rem',
                    fontSize: '0.82rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  <span style={{ fontWeight: 700 }}>
                    {account.role === 'student' ? '👨‍🎓 طالب' : account.role === 'instructor' ? '👨‍🏫 مدرس' : '🛡️ مدير'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {account.email}
                  </span>
                </button>
              ))}
            </div>
            <div style={{ borderTop: '1px solid var(--border-color)', margin: '1rem 0 0.5rem', position: 'relative' }}>
              <span style={{
                position: 'absolute',
                top: '-0.6rem',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'var(--bg-card)',
                padding: '0 0.75rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
              }}>
                أو سجل يدوياً
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                الاسم الأكاديمي
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="الاسم الكامل"
                required
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'var(--font-arabic)' }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={demoActive ? 'student@demo.asira.com' : 'user@example.com'}
              required
              style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'var(--font-arabic)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={demoActive ? 'demo123' : '••••••••'}
              required={!demoActive || !isRegister}
              minLength={demoActive ? undefined : 6}
              style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'var(--font-arabic)' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '0.75rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            id="auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin-animation" />
                <span>جاري المعالجة...</span>
              </>
            ) : (
              <span>{isRegister ? 'إنشاء حساب طالب' : 'تسجيل الدخول'}</span>
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {isRegister ? (
            <span>لديك حساب بالفعل؟ <button onClick={() => { setIsRegister(false); setError(null); }} style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>سجل دخولك</button></span>
          ) : (
            <span>طالب جديد؟ <button onClick={() => { setIsRegister(true); setError(null); }} style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>أنشئ حسابك هنا</button></span>
          )}
        </div>
      </div>
    </div>
  );
};
