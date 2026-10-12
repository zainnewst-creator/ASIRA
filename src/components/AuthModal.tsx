import React, { useState } from 'react';
import { Lock, Mail, User, BookOpen, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: { name: string; role: UserRole; email: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('student@asira-research.org');
  const [name, setName] = useState('أحمد الصالح');
  const [password, setPassword] = useState('••••••••');
  const [demoRole, setDemoRole] = useState<UserRole>('student');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      name: name || (demoRole === 'admin' ? 'مدير المنصة' : demoRole === 'instructor' ? 'د. إبراهيم يحيى' : 'أحمد الصالح'),
      role: isRegister ? 'student' : demoRole, // التسجيل الجديد دائماً طالب وفق القواعد
      email: email || 'student@asira-research.org',
    });
    onClose();
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

        {/* تنبيه حماية الصلاحيات الصارم */}
        {isRegister && (
          <div style={{ padding: '0.75rem', background: 'var(--primary-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-100)', fontSize: '0.8rem', color: 'var(--primary-800)', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <ShieldCheck size={18} color="var(--primary-600)" />
            <span>يُنشأ أي حساب جديد بصلاحية طالب (Student) افتراضياً وفق قواعد الأمان الصارمة.</span>
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
                placeholder="أحمد محمد الصالح"
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
              placeholder="user@example.com"
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
              placeholder="••••••••"
              style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'var(--font-arabic)' }}
            />
          </div>

          {/* تبديل الأدوار في وضع التجربة لاختبار الواجهات الثلاث */}
          {!isRegister && (
            <div style={{ padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                تجربة دور المستخدم في البوابة:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {(['student', 'instructor', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setDemoRole(r)}
                    className={`btn ${demoRole === r ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: 1, padding: '0.35rem', fontSize: '0.75rem' }}
                    id={`role-btn-${r}`}
                  >
                    {r === 'student' ? 'طالب' : r === 'instructor' ? 'مدرس' : 'مدير'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ padding: '0.75rem', marginTop: '0.5rem' }}
            id="auth-submit-btn"
          >
            {isRegister ? 'إنشاء حساب طالب' : 'تسجيل الدخول'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {isRegister ? (
            <span>لديك حساب بالفعل؟ <button onClick={() => setIsRegister(false)} style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>سجل دخولك</button></span>
          ) : (
            <span>طالب جديد؟ <button onClick={() => setIsRegister(true)} style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>أنشئ حسابك هنا</button></span>
          )}
        </div>
      </div>
    </div>
  );
};
