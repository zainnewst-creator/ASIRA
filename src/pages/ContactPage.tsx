import React, { useState } from 'react';
import { Mail, Send, MessageCircle, HelpCircle, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formSent, setFormSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'هل دورات منتدى أسيرا تتطلب اشتراكات مالية؟',
      a: 'النسخة الحالية ومسارات التدريب الأساسية في منتدى أسيرا تُقدم بميزانية صفرية للمتعلمين وبشكل مجاني تماماً دعماً لتمكين الطلاب في البحث العلمي، باستثناء أي تكاليف محتملة لشراء النطاق أو شهادات خارجية إذا لزم ذلك لاحقاً.'
    },
    {
      q: 'كيف يتم تسليم التكليفات والواجبات بدون تخزين مدفوع؟',
      a: 'يتم تسليم التكليفات عبر مشاركة روابط ملفات Google Drive مع ضبط صلاحية المشاركة على "أي شخص لديه الرابط يمكنه العرض"، مما يتيح مراجعة المشرف وإضافة الملاحظات مع تعدد النسخ دون تحميل المنصة تكاليف تخزين سحابي.'
    },
    {
      q: 'كيف يتم تصحيح الاختبارات النظرية والنهائية؟',
      a: 'تؤدى الاختبارات عبر واجهة الطالب الإلكترونية وتُحفظ الإجابات في قاعدة البيانات دون مفتاح الحل. وعند فتح المشرف المخوّل لمحاولة الطالب، يجري المتصفح عملية تصحيح تلقائي مقترحة لمراجعتها واعتماد الدرجة الرسمية.'
    },
    {
      q: 'ما هي شروط الحصول على شهادة إتمام الدورة؟',
      a: 'إكمال الدروس والمحاضرات الإلزامية، تسليم كافة التكليفات المطلوبة واعتمادها، اجتياز الاختبارات النظرية والامتحان العملي الحضوري بالجامعة بنسبة لا تقل عن درجة النجاح المحددة لكل كورس.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSent(true);
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem', maxWidth: '1000px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
          تواصل مع إدارة المنتدى
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
          قنوات التواصل والاستفسارات
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.7' }}>
          نسعد باستقبال استفسارات الباحثين والطلاب، ومقترحات الشراكة الأكاديمية مع الجامعات والمراكز البحثية.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', marginBottom: '4rem' }}>
        {/* نموذج المراسلة */}
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
            أرسل استفسارك مباشرة
          </h3>

          {formSent ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                تم استلام رسالتك بنجاح
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                سيقوم فريق أسيرا بالرد على بريدك الإلكتروني في أقرب وقت.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  required
                  placeholder="د. / ط. ..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-arabic)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@university.edu"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-arabic)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  موضوع الرسالة
                </label>
                <input
                  type="text"
                  required
                  placeholder="استفسار عن كورس / شراكة بحثية..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-arabic)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  نص الرسالة
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="اكتب استفسارك بالتفصيل..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-arabic)',
                  }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                <Send size={16} />
                <span>إرسال الرسالة</span>
              </button>
            </form>
          )}
        </div>

        {/* قنوات التواصل ومجتمعات أسيرا */}
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
              مجتمعات أسيرا الرسمية
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              نرحب بانضمامك لقنواتنا التفاعلية لمتابعة الإعلانات الدورية ومواعيد الدورات ومناقشة الأفكار البحثية:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline"
                style={{ justifyContent: 'flex-start', color: '#3b82f6' }}
              >
                <Send size={18} />
                <span>قناة منتدى أسيرا على التليجرام (Telegram)</span>
              </a>

              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline"
                style={{ justifyContent: 'flex-start', color: '#10b981' }}
              >
                <MessageCircle size={18} />
                <span>مجتمع منتدى أسيرا على الواتساب (WhatsApp)</span>
              </a>

              <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} color="var(--primary-600)" />
                <span>البريد الأكاديمي: contact@asira-research.org</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* قسم الأسئلة الشائعة (FAQ) */}
      <div>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="badge badge-primary">الأسئلة المتكررة</span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.5rem' }}>
            الأسئلة الشائعة حول المنصة ونظام التعليم
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="card"
                style={{ padding: '1rem 1.25rem', cursor: 'pointer' }}
                onClick={() => setOpenFaq(isOpen ? null : index)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                    {faq.q}
                  </h4>
                  {isOpen ? <ChevronUp size={18} color="var(--primary-600)" /> : <ChevronDown size={18} color="var(--text-subtle)" />}
                </div>
                {isOpen && (
                  <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.7', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
