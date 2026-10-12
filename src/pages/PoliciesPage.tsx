import React from 'react';
import { ShieldCheck, Lock, FileText, AlertCircle } from 'lucide-react';

export const PoliciesPage: React.FC = () => {
  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem', maxWidth: '850px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
          اللوائح والسياسات الرسمية
        </span>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
          سياسات منتدى أسيرا والنزاهة الأكاديمية
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          تنظم هذه السياسات العلاقة الأكاديمية وحماية البيانات واستخدام منصة أسيرا للبحث العلمي.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* 1. ميثاق النزاهة الأكاديمية ومكافحة الانتحال */}
        <section className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', color: 'var(--primary-700)' }}>
            <ShieldCheck size={24} />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
              1. ميثاق النزاهة الأكاديمية وحظر الانتحال (Plagiarism)
            </h2>
          </div>
          <div style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '0.75rem' }}>
              يلتزم كل طالب وباحث مسجل في منتدى أسيرا بالمعايير العالمية للنزاهة العلمية المعمول بها في دور النشر الدولية (ICMJE و COPE):
            </p>
            <ul style={{ paddingRight: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>العمل الشخصي:</strong> يجب أن تكون كافة التكليفات وتسليمات الأوراق العلمية نتاج جهد الطالب الفعلي.</li>
              <li><strong>حظر الذكاء الاصطناعي التوليدي في الاختبارات:</strong> يُحظر بشكل قاطع استخدام أدوات الذكاء الاصطناعي أثناء أداء الاختبارات النظرية والنهائية، ويُعد ذلك مخالفة تستوجب إلغاء المحاولة.</li>
              <li><strong>مكافحة الانتحال العلمي:</strong> يُشترط التوثيق الدقيق لكافة الاقتباسات والمراجع وتجنب النقل الحرفي دون عزو.</li>
            </ul>
          </div>
        </section>

        {/* 2. سياسة الخصوصية وحماية البيانات */}
        <section className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', color: 'var(--accent-emerald)' }}>
            <Lock size={24} />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
              2. سياسة الخصوصية وحماية بيانات الطلاب
            </h2>
          </div>
          <div style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
            <p style={{ marginBottom: '0.75rem' }}>
              تلتزم منصة أسيرا بأعلى درجات الخصوصية وحماية البيانات الأكاديمية:
            </p>
            <ul style={{ paddingRight: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>سرية السجلات:</strong> درجات التكليفات والاختبارات ومحاولات الطالب محصورة تماماً بين الطالب ومشرف الدورة وإدارة المنتدى.</li>
              <li><strong>بيانات التواصل:</strong> لا يتم مشاركة أرقام الهواتف أو البريد الإلكتروني مع أي أطراف ثالثة أو مع الطلاب الآخرين.</li>
              <li><strong>تخزين الملفات:</strong> تُحفظ روابط التكليفات في بيئة مؤمنة دون مشاركة خارجية إلا برضا صاحب العمل.</li>
            </ul>
          </div>
        </section>

        {/* 3. شروط استخدام المنصة والشهادات */}
        <section className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', color: 'var(--accent-gold)' }}>
            <FileText size={24} />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
              3. شروط الاستخدام وإصدار الشهادات
            </h2>
          </div>
          <div style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
            <ul style={{ paddingRight: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>الشهادات الرسمية:</strong> تصدر الشهادات بعد استيفاء الشروط المحددة للدورة واعتماد المدرس والمدير، ويتم توقيعها من العمادة وإدراج كود تحقق فريد.</li>
              <li><strong>إلغاء الشهادة:</strong> تحتفظ إدارة المنتدى بحق إلغاء أو سحب أي شهادة إذا ثبت لاحقاً وجود تلاعب بالدرجات أو انتهاك لميثاق النزاهة العلمية.</li>
              <li><strong>الملكية الفكرية:</strong> المواد التعليمية والتسجيلات المرئية مملوكة لمنتدى أسيرا ويُمنع إعادة نشرها تجارياً دون إذن خطي.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
};
