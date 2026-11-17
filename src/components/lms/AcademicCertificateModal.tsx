import React from 'react';
import { Award, CheckCircle2, Download, Printer, ShieldCheck, X, ExternalLink } from 'lucide-react';
import { Course } from '../../types';
import { sanitizeUrl } from '../../utils/security';

interface AcademicCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  course: Course;
  verificationCode?: string;
  totalScore?: number;
  issueDate?: string;
  signedPdfUrl?: string;
}

export const AcademicCertificateModal: React.FC<AcademicCertificateModalProps> = ({
  isOpen,
  onClose,
  studentName,
  course,
  verificationCode = '',
  totalScore = 0,
  issueDate = '',
  signedPdfUrl,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 100 }}>
      <div 
        className="modal-content certificate-modal-content"
        style={{ 
          maxWidth: '920px', 
          width: '95vw',
          maxHeight: '92vh', 
          overflowY: 'auto',
          padding: '1.75rem',
          background: 'var(--bg-card)'
        }}
      >
        {/* أزرار الإغلاق والطباعة في الأعلى */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={22} color="var(--accent-gold)" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              الشهادة الأكاديمية المعتمدة الرسمية
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {signedPdfUrl && (
              <a
                href={sanitizeUrl(signedPdfUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', padding: '0.45rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none' }}
                title="فتح وتحميل ملف الـ PDF الأصلي الموقع من العميد"
                id="modal-signed-pdf-link"
              >
                <Download size={16} />
                <span>تحميل PDF الموقع من العميد</span>
                <ExternalLink size={14} />
              </a>
            )}
            <button
              onClick={handlePrint}
              className="btn btn-outline"
              style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
              title="طباعة الشهادة أو حفظها بصيغة PDF"
            >
              <Printer size={16} />
              <span>طباعة / حفظ PDF</span>
            </button>
            <button
              onClick={onClose}
              className="btn btn-ghost"
              style={{ padding: '0.45rem' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* جسم الشهادة المصمم بمعايير الأكاديميات العالمية */}
        <div 
          id="asira-academic-certificate"
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #fefefe 0%, #f8fafc 100%)',
            border: '8px double #b45309',
            borderRadius: '12px',
            padding: '2.5rem 2rem',
            color: '#0f172a',
            textAlign: 'center',
            boxShadow: '0 10px 35px rgba(0,0,0,0.12)',
            overflow: 'hidden'
          }}
        >
          {/* زخرفة مائية خلفية للشهادة */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '14rem',
            fontWeight: 900,
            color: 'rgba(180, 83, 9, 0.03)',
            pointerEvents: 'none',
            fontFamily: 'serif',
            userSelect: 'none'
          }}>
            ASIRA
          </div>

          {/* ترويسة الشهادة الرسمية */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>مُنتدى أسيرا لتعليم البحث العلمي</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>ASIRA Medical & Scientific Research Initiative</div>
            </div>

            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #b45309, #d97706)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.2rem',
              boxShadow: '0 4px 12px rgba(180, 83, 9, 0.3)'
            }}>
              AS
            </div>

            <div style={{ textAlign: 'left', direction: 'ltr' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Accredited Certification</div>
              <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>VERIFIED DIGITAL ID</div>
            </div>
          </div>

          <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #b45309, transparent)', margin: '1rem auto 2rem', maxWidth: '80%' }} />

          {/* عنوان الشهادة */}
          <h1 style={{ 
            fontSize: '2.2rem', 
            fontWeight: 900, 
            color: '#1e293b', 
            margin: '0 0 0.5rem',
            fontFamily: 'var(--font-arabic)',
            letterSpacing: '0.5px'
          }}>
            شهادة إتمام برنامج تدريبي معتمد
          </h1>

          <p style={{ fontSize: '1rem', color: '#475569', margin: '0 0 1.5rem' }}>
            تشهد عمادة منتدى أسيرا لتعليم البحث العلمي بأن الباحث / الباحثة:
          </p>

          {/* اسم الطالب بخط بارز وأنيق */}
          <div style={{
            display: 'inline-block',
            padding: '0.5rem 2.5rem',
            borderBottom: '3px solid #b45309',
            fontSize: '2rem',
            fontWeight: 900,
            color: '#0f172a',
            marginBottom: '1.5rem',
            fontFamily: 'var(--font-arabic)'
          }}>
            {studentName}
          </div>

          <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#334155', maxWidth: '700px', margin: '0 auto 1.5rem' }}>
            قد أتم بنجاح واقتدار كافة متطلبات الدورة الأكاديمية والتطبيقات العملية والامتحانات المقررة في:
          </p>

          {/* اسم الكورس والرمز */}
          <div style={{
            background: 'rgba(217, 119, 6, 0.08)',
            border: '1px solid rgba(217, 119, 6, 0.3)',
            borderRadius: '8px',
            padding: '1rem 1.5rem',
            display: 'inline-block',
            marginBottom: '1.5rem',
            maxWidth: '90%'
          }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.35rem', color: '#0f172a' }}>
              {course.title}
            </h2>
            <div style={{ fontSize: '0.88rem', color: '#b45309', fontWeight: 700 }}>
              رمز المقرر: {course.code} | بنسبة إنجاز: {totalScore}% (تقدير ممتاز مع مرتبة الشرف)
            </div>
          </div>

          {/* تاريخ الإصدار والتوقيعات الرسمية */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginTop: '2rem', alignItems: 'end' }}>
            <div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.35rem' }}>تاريخ المنح والاعتماد:</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>{issueDate} م</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>مطابق لمعايير النشر الطبي الدولي</div>
            </div>

            {/* الختم الأكاديمي الرقمي */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                border: '3px dashed #b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#b45309',
                padding: '4px',
                marginBottom: '0.35rem'
              }}>
                <ShieldCheck size={38} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#b45309' }}>الختم الأكاديمي المعتمد</span>
            </div>

            <div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.35rem' }}>المشرف الأكاديمي ورئيس المبادرة:</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', textDecoration: 'underline' }}>
                د. إبراهيم يحيى
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>عميد منتدى أسيرا للبحث العلمي</div>
            </div>
          </div>

          {/* شريط التحقق الرقمي السفلي */}
          <div style={{ 
            marginTop: '2.5rem', 
            paddingTop: '1rem', 
            borderTop: '1px solid #e2e8f0', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: '0.75rem', 
            fontSize: '0.78rem', 
            color: '#64748b' 
          }}>
            <div>
              رمز التحقق الرقمي (Verification Hash): <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{verificationCode}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle2 size={14} color="#059669" />
              <span>شهادة موثقة ورسمية يمكن التحقق منها عبر بوابة منتدى أسيرا</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
