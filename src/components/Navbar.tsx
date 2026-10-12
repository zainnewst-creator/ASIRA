import React from 'react';
import { BookOpen, Moon, Sun, UserCircle2, ArrowLeft } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
  onOpenAuth: () => void;
  currentUser?: { name: string; role: string } | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  isDark,
  toggleTheme,
  onOpenAuth,
  currentUser,
}) => {
  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* الشعار المؤطر لمنتدى أسيرا */}
        <a 
          href="#home" 
          onClick={(e) => { e.preventDefault(); setCurrentTab('home'); }} 
          className="brand-logo-badge"
          id="nav-brand-logo"
        >
          <div className="brand-logo-icon">
            <span>AS</span>
          </div>
          <div className="brand-logo-text">
            <span className="brand-logo-title">مُنتدى أسيرا</span>
            <span className="brand-logo-subtitle">لتعليم البحث العلمي | ASIRA</span>
          </div>
        </a>

        {/* روابط التنقل الرئيسية للواجهة العامة */}
        <nav>
          <ul className="nav-links">
            <li>
              <a
                href="#home"
                className={`nav-link ${currentTab === 'home' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setCurrentTab('home'); }}
                id="nav-link-home"
              >
                الرئيسية
              </a>
            </li>
            <li>
              <a
                href="#courses"
                className={`nav-link ${currentTab === 'courses' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setCurrentTab('courses'); }}
                id="nav-link-courses"
              >
                الكورسات والبرامج
              </a>
            </li>
            <li>
              <a
                href="#research"
                className={`nav-link ${currentTab === 'research' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setCurrentTab('research'); }}
                id="nav-link-research"
              >
                أبحاثنا ومشاريعنا
              </a>
            </li>
            <li>
              <a
                href="#about"
                className={`nav-link ${currentTab === 'about' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setCurrentTab('about'); }}
                id="nav-link-about"
              >
                من نحن
              </a>
            </li>
            <li>
              <a
                href="#testimonials"
                className={`nav-link ${currentTab === 'testimonials' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setCurrentTab('testimonials'); }}
                id="nav-link-testimonials"
              >
                طلابنا وقصص النجاح
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className={`nav-link ${currentTab === 'contact' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); setCurrentTab('contact'); }}
                id="nav-link-contact"
              >
                تواصل معنا
              </a>
            </li>
          </ul>
        </nav>

        {/* أدوات الهيدر (الوضع الداكن والدخول للبوابة الأكاديمية) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={toggleTheme}
            className="btn btn-ghost"
            style={{ padding: '0.5rem', borderRadius: 'var(--radius-full)' }}
            title={isDark ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
            id="theme-toggle-btn"
          >
            {isDark ? <Sun size={19} color="#f59e0b" /> : <Moon size={19} color="#475569" />}
          </button>

          {currentUser ? (
            <button
              onClick={() => setCurrentTab('lms_dashboard')}
              className="btn btn-primary"
              id="user-portal-btn"
            >
              <UserCircle2 size={18} />
              <span>لوحة التحكم ({currentUser.name})</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn btn-primary"
              id="login-modal-btn"
            >
              <BookOpen size={17} />
              <span>بوابة التعليم الأكاديمي</span>
              <ArrowLeft size={15} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
