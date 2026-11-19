import React, { useState } from 'react';
import { BookOpen, Moon, Sun, UserCircle2, ArrowLeft, Menu, X, LogOut } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isDark: boolean;
  toggleTheme: () => void;
  onOpenAuth: () => void;
  currentUser?: { name: string; role: string } | null;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  isDark,
  toggleTheme,
  onOpenAuth,
  currentUser,
  onLogout,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    setCurrentTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="navbar" style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      <div className="container nav-container">
        {/* الشعار المؤطر لمنتدى أسيرا */}
        <a 
          href="#home" 
          onClick={(e) => { e.preventDefault(); handleNavClick('home'); }} 
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

        {/* روابط التنقل الرئيسية للواجهة العامة (سطح المكتب) */}
        <nav className="desktop-nav">
          <ul className="nav-links">
            <li>
              <a
                href="#home"
                className={`nav-link ${currentTab === 'home' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}
                id="nav-link-home"
              >
                الرئيسية
              </a>
            </li>
            <li>
              <a
                href="#courses"
                className={`nav-link ${currentTab === 'courses' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); handleNavClick('courses'); }}
                id="nav-link-courses"
              >
                الكورسات والبرامج
              </a>
            </li>
            <li>
              <a
                href="#research"
                className={`nav-link ${currentTab === 'research' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); handleNavClick('research'); }}
                id="nav-link-research"
              >
                أبحاثنا ومشاريعنا
              </a>
            </li>
            <li>
              <a
                href="#about"
                className={`nav-link ${currentTab === 'about' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); handleNavClick('about'); }}
                id="nav-link-about"
              >
                من نحن
              </a>
            </li>
            <li>
              <a
                href="#testimonials"
                className={`nav-link ${currentTab === 'testimonials' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); handleNavClick('testimonials'); }}
                id="nav-link-testimonials"
              >
                طلابنا وقصص النجاح
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className={`nav-link ${currentTab === 'contact' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); handleNavClick('contact'); }}
                id="nav-link-contact"
              >
                تواصل معنا
              </a>
            </li>
          </ul>
        </nav>

        {/* أدوات الهيدر (الوضع الداكن والدخول للبوابة الأكاديمية + زر الهامبرغر للجوال) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={toggleTheme}
            className="btn btn-ghost"
            style={{ padding: '0.45rem', borderRadius: 'var(--radius-full)' }}
            title={isDark ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
            id="theme-toggle-btn"
          >
            {isDark ? <Sun size={19} color="#f59e0b" /> : <Moon size={19} color="#475569" />}
          </button>

          <div className="desktop-portal-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {currentUser ? (
              <>
                <button
                  onClick={() => handleNavClick('lms_dashboard')}
                  className="btn btn-primary"
                  id="user-portal-btn"
                  style={{ fontSize: '0.85rem' }}
                >
                  <UserCircle2 size={17} />
                  <span>لوحة التحكم ({currentUser.name})</span>
                </button>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="btn btn-ghost"
                    id="navbar-logout-btn"
                    title="تسجيل الخروج من المنصة"
                    style={{
                      padding: '0.45rem',
                      borderRadius: 'var(--radius-full)',
                      color: '#ef4444',
                    }}
                  >
                    <LogOut size={18} />
                  </button>
                )}
              </>
            ) : (
              <button
                onClick={onOpenAuth}
                className="btn btn-primary"
                id="login-modal-btn"
                style={{ fontSize: '0.85rem' }}
              >
                <BookOpen size={16} />
                <span>بوابة التعليم</span>
                <ArrowLeft size={14} />
              </button>
            )}
          </div>

          {/* زر القائمة للشاشات الصغيرة والتابليت */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="btn btn-ghost mobile-hamburger-btn"
            style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)' }}
            aria-label="تبديل القائمة الرئيسية"
            id="mobile-menu-toggle-btn"
          >
            {isMobileMenuOpen ? <X size={22} color="var(--primary-600)" /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* القائمة المنسدلة للشاشات الصغيرة والجوال (Mobile & Tablet Dropdown Drawer) */}
      {isMobileMenuOpen && (
        <div className="mobile-nav-drawer" style={{
          background: 'var(--bg-card)',
          borderBottom: '2px solid var(--primary-600)',
          padding: '1rem 1.25rem 1.5rem',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <button
              onClick={() => handleNavClick('home')}
              className={`btn ${currentTab === 'home' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', padding: '0.65rem 1rem', fontSize: '0.92rem' }}
            >
              الرئيسية
            </button>
            <button
              onClick={() => handleNavClick('courses')}
              className={`btn ${currentTab === 'courses' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', padding: '0.65rem 1rem', fontSize: '0.92rem' }}
            >
              الكورسات والبرامج الأكاديمية
            </button>
            <button
              onClick={() => handleNavClick('research')}
              className={`btn ${currentTab === 'research' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', padding: '0.65rem 1rem', fontSize: '0.92rem' }}
            >
              أبحاثنا ومشاريع النشر
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={`btn ${currentTab === 'about' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', padding: '0.65rem 1rem', fontSize: '0.92rem' }}
            >
              من نحن ورسالتنا
            </button>
            <button
              onClick={() => handleNavClick('testimonials')}
              className={`btn ${currentTab === 'testimonials' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', padding: '0.65rem 1rem', fontSize: '0.92rem' }}
            >
              طلابنا وقصص النجاح
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className={`btn ${currentTab === 'contact' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ justifyContent: 'flex-start', padding: '0.65rem 1rem', fontSize: '0.92rem' }}
            >
              تواصل معنا
            </button>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
            {currentUser ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  onClick={() => handleNavClick('lms_dashboard')}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                >
                  <UserCircle2 size={18} />
                  <span>الدخول للوحة التعليم ({currentUser.name})</span>
                </button>
                {onLogout && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="btn btn-outline"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      padding: '0.6rem',
                      color: '#ef4444',
                      borderColor: 'rgba(239, 68, 68, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <LogOut size={16} />
                    <span>تسجيل الخروج</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="btn btn-accent"
                style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
              >
                <BookOpen size={18} />
                <span>تسجيل الدخول لبوابة التعليم</span>
                <ArrowLeft size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
