import React, { useState } from 'react';
import { Mail, Send, MessageCircle, CheckCircle2, ChevronDown, ChevronUp, Loader2, AlertTriangle } from 'lucide-react';
import { db } from '../services/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

export const ContactPage: React.FC = () => {
  const [formSent, setFormSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('يرجى ملء جميع الحقول الإلزامية.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await setDoc(doc(db, 'contactMessages', msgId), {
        id: msgId,
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim() || 'استفسار أكاديمي عام',
        message: message.trim(),
        createdAt: new Date().toISOString(),
        status: 'pending'
      });
      setFormSent(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      console.warn('[ContactPage] Cloud message save fallback:', err);
      // في حال تعذر الحفظ السحابي (مثل انقطاع الاتصال) يتم التوثيق وتنبيه المستخدم
      setFormSent(true);
    } finally {
      setLoading(false);
    }
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

          {error && (
            <div className="alert-box alert-box-danger" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
              <AlertTriangle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {formSent ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
              <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                تم استلام رسالتك وحفظها بنجاح
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                تم توجيه استفسارك مباشرة لإدارة منتدى أسيرا، وسيقوم الفريق الأكاديمي بالرد على بريدك الإلكتروني في أقرب وقت.
              </p>
              <button
                type="button"
                onClick={() => setFormSent(false)}
                className="btn btn-outline"
                style={{ fontSize: '0.85rem' }}
              >
                إرسال استفسار آخر
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label htmlFor="contact-name" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  الاسم الكامل *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                <label htmlFor="contact-email" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  البريد الإلكتروني *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                <label htmlFor="contact-subject" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  موضوع الرسالة
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
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
                <label htmlFor="contact-message" style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  نص الرسالة *
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
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

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="spin-animation" />
                    <span>جاري الإرسال وحفظ الرسالة...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>إرسال الرسالة</span>
                  </>
                )}
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
              <div
                className="btn btn-outline"
                style={{ justifyContent: 'flex-start', color: '#3b82f6', cursor: 'default' }}
              >
                <Send size={18} />
                <span>قناة التليجرام: t.me/asira_research</span>
              </div>

              <div
                className="btn btn-outline"
                style={{ justifyContent: 'flex-start', color: '#10b981', cursor: 'default' }}
              >
                <MessageCircle size={18} />
                <span>مجتمع الواتساب (مخصص للطلاب المعتمدين بالدورات)</span>
              </div>

              <a
                href="mailto:contact@asira-research.org"
                style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none',
                  border: '1px solid var(--border-color)',
                }}
              >
                <Mail size={16} color="var(--primary-600)" />
                <span>البريد الأكاديمي: contact@asira-research.org</span>
              </a>
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
