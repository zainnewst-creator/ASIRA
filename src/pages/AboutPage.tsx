import React from 'react';
import { Target, Compass, Award, Users, BookOpen, CheckCircle, ShieldCheck } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="container" style={{ padding: '4rem 1.5rem', maxWidth: '1000px' }}>
      {/* الترويسة الرئيسية */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
          هوية ورسالة المنتدى
        </span>
        <h1 style={{ fontSize: '2.6rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '1.25rem' }}>
          عن منتدى أسيرا لتعليم البحث العلمي (ASIRA)
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.15rem', lineHeight: '1.8', maxWidth: '800px', margin: '0 auto' }}>
          مبادرة بحثية أكاديمية تأسست لتمكين طلاب وخريجي التخصصات الطبية والصحية والعلمية في العالم العربي من امتلاك أدوات التفكير النقدي ومنهجيات البحث المتقدم والنشر الدولي في مجلات النخبة.
        </p>
      </div>

      {/* الرؤية والرسالة والقيم */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.75rem', marginBottom: '4rem' }}>
        <div className="card">
          <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Compass size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
            رؤيتنا الأكاديمية
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7' }}>
            أن نكون الحاضنة والمنصة المرجعية الأولى في العالم العربي لإعداد جيل من الباحثين القادرين على إنتاج أبحاث أصيلة تسهم في حل المشكلات الصحية والمجتمعية وتنافس عالمياً.
          </p>
        </div>

        <div className="card">
          <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <Target size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
            رسالتنا
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7' }}>
            تفكيك حاجز الخوف من البحث العلمي عبر مناهج تعليمية وتطبيقية تفاعلية، والمتابعة المباشرة لكل طالب من الفكرة إلى النشر، مع الالتزام التام بأعلى معايير النزاهة العلمية.
          </p>
        </div>

        <div className="card">
          <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--accent-gold-light)', color: 'var(--accent-gold-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
            <ShieldCheck size={24} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
            قيمنا ومبادئنا
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.7' }}>
            الأمانة العلمية، مجانية إتاحة المعرفة التأسيسية، الشفافية الأكاديمية، العمل الجماعي في فرق بحثية متعددة التخصصات، والإتقان في منهجية التحليل الإحصائي.
          </p>
        </div>
      </div>

      {/* منهجية أسيرا في التدريب */}
      <div className="card" style={{ padding: '2.5rem', marginBottom: '4rem', background: 'var(--bg-subtle)' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-main)', textAlign: 'center' }}>
          منهجية أسيرا الفريدة: من الفكرة إلى النشر (Step-by-Step)
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-600)' }}>01</span>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0.35rem 0' }}>التأسيس المعرفي</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              محاضرات مركزة في تصميم الدراسات والبحث في قواعد البيانات الطبية وصياغة بروتوكول البحث.
            </p>
          </div>

          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-emerald)' }}>02</span>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0.35rem 0' }}>التكليفات العملية</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              تطبيق عملي لكل خطوة، وتصحيح تفصيلي من المشرف مع إتاحة إعادة التعديل (Revisions) لترسيخ المهارة.
            </p>
          </div>

          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent-gold)' }}>03</span>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0.35rem 0' }}>التقييم والامتحان العملي</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              اختبارات نظرية إلكترونية وتقييم عملي حضوري بالجامعة لرصد الكفاءة الأكاديمية الحقيقية.
            </p>
          </div>

          <div>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-700)' }}>04</span>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0.35rem 0' }}>النشر والشهادة</h4>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              تشكيل الفرق لكتابة الأوراق الفعلية، وإصدار شهادات الإتمام الموقعة برمز تحقق فريد.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
