import React from 'react';
import { Star, Quote, Award } from 'lucide-react';
import { INITIAL_TESTIMONIALS } from '../data/mockData';

export const TestimonialsPage: React.FC = () => {
  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem', maxWidth: '1100px' }}>
      <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3.5rem' }}>
        <span className="badge badge-gold" style={{ marginBottom: '0.75rem' }}>
          لوحة الشرف وقصص النجاح (Wall of Fame)
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
          طلابنا وقصص إنجازاتهم الأكاديمية
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.7' }}>
          هؤلاء هم أبطال أسيرا الحقيقيون؛ طلاب بدأوا من الصفر، واجتازوا برامجنا وتكليفاتنا الصارمة، ونشروا أبحاثهم في مجلات دولية مرموقة.
        </p>
      </div>

      <div className="grid-3" style={{ marginBottom: '4rem' }}>
        {INITIAL_TESTIMONIALS.map((item) => (
          <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
            <Quote size={32} color="var(--primary-200)" style={{ position: 'absolute', top: '16px', left: '16px' }} />

            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem' }}>
              {[...Array(item.rating)].map((_, i) => (
                <Star key={i} size={17} fill="#f59e0b" color="#f59e0b" />
              ))}
            </div>

            <p style={{ fontSize: '0.98rem', color: 'var(--text-main)', lineHeight: '1.8', marginBottom: '1.5rem', flexGrow: 1, fontStyle: 'italic' }}>
              "{item.quote}"
            </p>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              {item.avatarUrl ? (
                <img
                  src={item.avatarUrl}
                  alt={item.studentName}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary-600), var(--primary-900, #172554))',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    flexShrink: 0,
                  }}
                >
                  {item.studentName.replace(/^[طصد]\.\s*/, '').slice(0, 2)}
                </div>
              )}
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  {item.studentName}
                </h4>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {item.university}
                </div>
                {item.researchTitle && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary-600)', fontWeight: 600, marginTop: '0.25rem' }}>
                    {item.researchTitle}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* بطاقة تشجيعية */}
      <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', background: 'var(--bg-subtle)' }}>
        <Award size={40} color="var(--primary-600)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          هل تود أن تكون قصتك القادمة على لوحة شرف أسيرا؟
        </h3>
        <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 1.5rem', fontSize: '0.95rem' }}>
          كل ورقة بحثية تراها اليوم بدأت بطلب التحاق وتكليف أول تم تصحيحه باعتناء. الفرصة متاحة لك الآن.
        </p>
      </div>
    </div>
  );
};
