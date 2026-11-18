import React from 'react';
import { ShieldCheck, Mail, Send, Award, Users } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="footer">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
          
          {/* عمود التعريف بالمنتدى */}
          <div>
            <div className="brand-logo-badge" style={{ marginBottom: '1.25rem' }}>
              <div className="brand-logo-icon" style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}>
                <span>AS</span>
              </div>
              <div className="brand-logo-text">
                <span className="brand-logo-title" style={{ color: '#ffffff' }}>مُنتدى أسيرا</span>
                <span className="brand-logo-subtitle" style={{ color: '#94a3b8' }}>لتعليم البحث العلمي | ASIRA</span>
              </div>
            </div>
            <p style={{ fontSize: '0.92rem', lineHeight: '1.7', color: '#94a3b8', marginBottom: '1.5rem' }}>
              مبادرة أكاديمية متخصصة في تأهيل وتدريب طلاب وخريجي الكليات الطبية والصحية على منهجيات البحث العلمي والنشر الدولي الرصين في المجلات العالمية المفهرسة.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span className="badge badge-emerald" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <Award size={14} /> مبادرة غير ربحية
              </span>
              <span className="badge badge-primary" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                <Users size={14} /> مجتمع بحثي نشط
              </span>
            </div>
          </div>

          {/* روابط سريعة */}
          <div>
            <h4 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              روابط المنصة
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.92rem' }}>
              <li>
                <a href="#courses" onClick={(e) => { e.preventDefault(); onNavigate('courses'); }}>
                  دليل الكورسات المتاحة
                </a>
              </li>
              <li>
                <a href="#research" onClick={(e) => { e.preventDefault(); onNavigate('research'); }}>
                  معرض الأبحاث المنشورة (Showcase)
                </a>
              </li>
              <li>
                <a href="#about" onClick={(e) => { e.preventDefault(); onNavigate('about'); }}>
                  عن منتدى أسيرا ورسالته
                </a>
              </li>
              <li>
                <a href="#testimonials" onClick={(e) => { e.preventDefault(); onNavigate('testimonials'); }}>
                  قصص نجاح طلابنا وخريجينا
                </a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => { e.preventDefault(); onNavigate('contact'); }}>
                  تواصل معنا وقنوات الدعم
                </a>
              </li>
            </ul>
          </div>

          {/* مسارات التدريب والبحث */}
          <div>
            <h4 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              مسارات البحث والتدريب
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.92rem', color: '#cbd5e1' }}>
              <li>المراجعات المنهجية (Systematic Reviews)</li>
              <li>التحليل الإحصائي التلوي (Meta-Analysis)</li>
              <li>تصميم الدراسات الإكلينيكية (Clinical Trials)</li>
              <li>التحليل الإحصائي الطبي (SPSS & R)</li>
              <li>الكتابة الأكاديمية والنشر في Q1/Q2</li>
            </ul>
          </div>

          {/* قنوات المجتمع والسياسات */}
          <div>
            <h4 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              مجتمعات أسيرا والسياسات
            </h4>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '1rem' }}>
              انضم لمجتمعاتنا التفاعلية لمتابعة الأوركيد والمشاريع البحثية الجديدة:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
              <a 
                href="https://t.me" 
                target="_blank" 
                rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa' }}
              >
                <Send size={15} /> قناة التليجرام الرسمية للمنتدى
              </a>
              <a 
                href="mailto:contact@asira-research.org" 
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#34d399' }}
              >
                <Mail size={15} /> البريد: contact@asira-research.org
              </a>
            </div>
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.15)', paddingTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
              <a href="#policies" onClick={(e) => { e.preventDefault(); onNavigate('policies'); }} style={{ color: '#93c5fd' }}>
                سياسة الخصوصية
              </a>
              <span style={{ color: '#64748b' }}>•</span>
              <a href="#policies" onClick={(e) => { e.preventDefault(); onNavigate('policies'); }} style={{ color: '#93c5fd' }}>
                شروط الاستخدام
              </a>
              <span style={{ color: '#64748b' }}>•</span>
              <a href="#policies" onClick={(e) => { e.preventDefault(); onNavigate('policies'); }} style={{ color: '#93c5fd' }}>
                النزاهة الأكاديمية
              </a>
            </div>
          </div>
        </div>

        {/* شريط الحقوق السفلي */}
        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '2rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
          <div>
            جميع الحقوق محفوظة © {new Date().getFullYear()} منتدى أسيرا لتعليم البحث العلمي (ASIRA Research Initiative).
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
            <ShieldCheck size={16} color="#10b981" />
            <span>نظام أكاديمي آمن ومحمي بمعايير الصلاحيات الصارمة والتكلفة الصفرية</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
