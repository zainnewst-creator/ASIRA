import React, { useState } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Award, 
  FileText, 
  AlertCircle, 
  ShieldAlert, 
  Send, 
  ExternalLink, 
  Users, 
  ChevronRight, 
  Layers, 
  GraduationCap, 
  Check, 
  X,
  FileCheck2
} from 'lucide-react';
import { UserRole } from '../types';
import { INITIAL_COURSES } from '../data/mockData';

interface LmsDashboardPreviewProps {
  userRole: UserRole;
  userName: string;
  onLogout: () => void;
  onBackToPortal: () => void;
}

export const LmsDashboardPreview: React.FC<LmsDashboardPreviewProps> = ({
  userRole,
  userName,
  onLogout,
  onBackToPortal,
}) => {
  const [activeTab, setActiveTab] = useState<'my_courses' | 'learn' | 'assignment' | 'exam' | 'grades' | 'instructor_hub' | 'admin_control'>(
    userRole === 'admin' ? 'admin_control' : userRole === 'instructor' ? 'instructor_hub' : 'my_courses'
  );

  React.useEffect(() => {
    setActiveTab(userRole === 'admin' ? 'admin_control' : userRole === 'instructor' ? 'instructor_hub' : 'my_courses');
  }, [userRole]);
  
  // حالات تفاعلية لمحاكاة الطالب والمدرس والمدير
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [assignmentLink, setAssignmentLink] = useState('https://drive.google.com/file/d/1ExampleStudentSubmission/view');
  const [assignmentSubmitted, setAssignmentSubmitted] = useState(false);
  
  // محاكاة التصحيح التلقائي الآمن داخل واجهة المدرس
  const [examGradeApproved, setExamGradeApproved] = useState(false);
  const [calculatedScore, setCalculatedScore] = useState(85);
  
  // محاكاة طلبات الالتحاق للمدير
  const [enrollmentStatus, setEnrollmentStatus] = useState<'pending' | 'approved' | 'rejected'>('approved');
  const [certIssued, setCertIssued] = useState(false);

  return (
    <div style={{ minHeight: '85vh', background: 'var(--bg-main)', padding: '2rem 0 4rem' }}>
      <div className="container">
        
        {/* شريط رأس لوحة التحكم */}
        <div className="card" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className={`badge ${userRole === 'admin' ? 'badge-gold' : userRole === 'instructor' ? 'badge-emerald' : 'badge-primary'}`}>
                {userRole === 'admin' ? 'لوحة تحكم المدير' : userRole === 'instructor' ? 'لوحة تحكم المدرس' : 'لوحة تحكم الطالب'}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>نظام أسيرا الأكاديمي</span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              مرحباً بك، {userName}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button onClick={onBackToPortal} className="btn btn-outline" style={{ fontSize: '0.88rem' }}>
              <span>العودة لواجهة المنتدى</span>
            </button>
            <button onClick={onLogout} className="btn btn-ghost" style={{ fontSize: '0.88rem', color: '#ef4444' }}>
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>

        {/* أشرطة التنقل الداخلية حسب الدور */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
          {userRole === 'student' && (
            <>
              <button
                onClick={() => setActiveTab('my_courses')}
                className={`btn ${activeTab === 'my_courses' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.88rem' }}
              >
                دوراتي المسجلة
              </button>
              <button
                onClick={() => setActiveTab('learn')}
                className={`btn ${activeTab === 'learn' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.88rem' }}
              >
                مشغل الدروس (YouTube & Drive)
              </button>
              <button
                onClick={() => setActiveTab('assignment')}
                className={`btn ${activeTab === 'assignment' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.88rem' }}
              >
                تسليم التكليفات (Drive Link)
              </button>
              <button
                onClick={() => setActiveTab('exam')}
                className={`btn ${activeTab === 'exam' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.88rem' }}
              >
                محرك الاختبارات (MCQ)
              </button>
              <button
                onClick={() => setActiveTab('grades')}
                className={`btn ${activeTab === 'grades' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.88rem' }}
              >
                السجل الأكاديمي والشهادة
              </button>
            </>
          )}

          {userRole === 'instructor' && (
            <>
              <button
                onClick={() => setActiveTab('instructor_hub')}
                className={`btn ${activeTab === 'instructor_hub' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.88rem' }}
              >
                مراجعة الطلاب والتصحيح التلقائي الآمن
              </button>
              <button
                onClick={() => setActiveTab('assignment')}
                className={`btn ${activeTab === 'assignment' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.88rem' }}
              >
                تصحيح التكليفات وملاحظات النسخ
              </button>
            </>
          )}

          {userRole === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('admin_control')}
                className={`btn ${activeTab === 'admin_control' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.88rem' }}
              >
                إدارة طلبات الالتحاق والشهادات
              </button>
              <button
                onClick={() => setActiveTab('instructor_hub')}
                className={`btn ${activeTab === 'instructor_hub' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.88rem' }}
              >
                مراقبة الاختبارات والدرجات
              </button>
            </>
          )}
        </div>

        {/* 1. تبويب: دوراتي المسجلة (Student) */}
        {activeTab === 'my_courses' && (
          <div className="grid-2">
            <div className="card">
              <span className="badge badge-emerald" style={{ marginBottom: '0.5rem' }}>
                حالة التسجيل: مقبول (Approved)
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                منهجية وأساسيات البحث العلمي والنشر الدولي
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                المشرف: د. إبراهيم يحيى | الكود: RES-101
              </p>

              {/* شريط نسبة التقدم */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span>نسبة التقدم الأكاديمي</span>
                  <strong>{lessonCompleted ? '85%' : '70%'}</strong>
                </div>
                <div style={{ height: '8px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                  <div style={{ width: lessonCompleted ? '85%' : '70%', height: '100%', background: 'linear-gradient(90deg, #10b981, #3b82f6)', transition: 'width 0.3s ease' }}></div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setActiveTab('learn')} className="btn btn-primary" style={{ flex: 1 }}>
                  <span>متابعة التعلم</span>
                  <ChevronRight size={16} />
                </button>
                <button onClick={() => setActiveTab('grades')} className="btn btn-outline">
                  <span>سجل الدرجات</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. تبويب: مشغل الدروس (YouTube + Google Drive Embed) */}
        {activeTab === 'learn' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ width: '100%', aspectRatio: '16/9', background: '#070d1e', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: '1.25rem' }}>
                {/* تمثيل مشغل يوتيوب المضمّن */}
                <div style={{ textAlign: 'center', color: '#fff' }}>
                  <BookOpen size={48} color="#3b82f6" style={{ margin: '0 auto 0.75rem' }} />
                  <p style={{ fontSize: '1rem', fontWeight: 700 }}>محاضرة: استراتيجيات البحث في PubMed بنظام MeSH</p>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>مستضافة مجاناً ومضمّنة بأمان عبر YouTube</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                    الدرس 4: مصطلحات MeSH وصياغة استراتيجية البحث المتقدم
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    الوحدة الثانية: البحث في قواعد البيانات الطبية
                  </p>
                </div>

                <button
                  onClick={() => setLessonCompleted(!lessonCompleted)}
                  className={`btn ${lessonCompleted ? 'btn-accent' : 'btn-outline'}`}
                >
                  <CheckCircle2 size={16} />
                  <span>{lessonCompleted ? 'تم إكمال الدرس بنجاح' : 'تحديد كـ "مكتمل"'}</span>
                </button>
              </div>

              {/* مرفقات Google Drive للدرس */}
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                  ملفات المحاضرة المرفقة (Google Drive):
                </h4>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <a
                    href="https://drive.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline"
                    style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
                  >
                    <ExternalLink size={14} />
                    <span>سلايدات المحاضرة (PDF)</span>
                  </a>
                  <a
                    href="https://drive.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline"
                    style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
                  >
                    <ExternalLink size={14} />
                    <span>جدول مصطلحات MeSH (Excel)</span>
                  </a>
                </div>
              </div>
            </div>

            {/* قائمة الدروس */}
            <div className="card" style={{ height: 'fit-content' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                فهرس المحاضرات
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.88rem' }}>
                <div style={{ padding: '0.5rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>1. صياغة سؤال البحث بنظام PICO</span>
                </div>
                <div style={{ padding: '0.5rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>2. الفرق بين أنواع الدراسات الطبية</span>
                </div>
                <div style={{ padding: '0.5rem', background: 'var(--primary-50)', color: 'var(--primary-800)', fontWeight: 700, borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen size={16} color="var(--primary-600)" />
                  <span>3. استراتيجية MeSH في PubMed (الحالي)</span>
                </div>
                <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                  <Clock size={16} />
                  <span>4. التصفية بواسطة Rayyan</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. تبويب: تسليم التكليف برابط Drive وسجل النسخ */}
        {activeTab === 'assignment' && (
          <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
              التكليف الثاني (Assignment 2)
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              صياغة بروتوكول بحثي كامل وتحديد الكلمات المفتاحية
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              الموعد النهائي: 15 نوفمبر 2026 | الدرجة الكاملة: 20 درجة | يسمح بإعادة التسليم عند طلب التعديل (Revisions).
            </p>

            {/* آلية التسليم الآمنة دون Firebase Storage */}
            <div style={{ padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ExternalLink size={16} color="var(--primary-600)" />
                <span>إرسال رابط ملف الحل (Google Drive):</span>
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                يرجى التأكد من ضبط صلاحية مشاركة ملف Google Drive على "Anyone with the link can view".
              </p>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="url"
                  value={assignmentLink}
                  onChange={(e) => setAssignmentLink(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  style={{
                    flex: 1,
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-arabic)',
                    direction: 'ltr',
                    textAlign: 'left',
                  }}
                />
                <button
                  onClick={() => setAssignmentSubmitted(true)}
                  className="btn btn-primary"
                >
                  <Send size={15} />
                  <span>{assignmentSubmitted ? 'تحديث الرابط (v2)' : 'تسليم التكليف'}</span>
                </button>
              </div>
            </div>

            {/* سجل النسخ السابقة والملاحظات */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                سجل النسخ وملاحظات المشرف:
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div style={{ padding: '0.75rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <strong>النسخة 1 (v1)</strong>
                    <span style={{ color: 'var(--text-subtle)' }}>12 أكتوبر 2026 - 15:30</span>
                  </div>
                  <div style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>الحالة: تم التسليم بنجاح (قيد مراجعة المدرس)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. تبويب: محرك الاختبارات والتعهد الأكاديمي */}
        {activeTab === 'exam' && (
          <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <span className="badge badge-primary">اختبار منتصف المسار (Theory Exam)</span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '0.25rem' }}>
                  اختبار مفاهيم منهجيات البحث وتصميم الدراسات
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444', fontWeight: 700, fontSize: '1.1rem' }}>
                <Clock size={18} />
                <span>24:15 دقيقة متبقية</span>
              </div>
            </div>

            {/* تنبيه النزاهة الأكاديمية وحظر الذكاء الاصطناعي */}
            <div style={{ padding: '0.75rem 1rem', background: 'var(--accent-gold-light)', color: 'var(--accent-gold-dark)', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <AlertCircle size={18} />
              <span><strong>تعهد النزاهة:</strong> أقر بأنني أؤدي الاختبار بنفسي دون استخدام الذكاء الاصطناعي أو مشاركة الأسئلة. مفاتيح الإجابات معزولة ومحمية.</span>
            </div>

            {/* سؤال عينة */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', lineHeight: '1.5' }}>
                السؤال 1 من 10: أي من التصاميم التالية يعتبر الأمثل لتقييم كفاءة دواء جديد مقارنة بالدواء الوهمي (Placebo)؟
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                  <input type="radio" name="q1" defaultChecked />
                  <span>A. دراسة التجارب السريرية العشوائية المزدوجة التعمية (Randomized Controlled Trial - RCT)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                  <input type="radio" name="q1" />
                  <span>B. دراسة الحالات والشواهد (Case-Control Study)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                  <input type="radio" name="q1" />
                  <span>C. دراسة مقطعية مستعرضة (Cross-Sectional Study)</span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>المحاولة: 1 من 2 مسموح بها</span>
              <button className="btn btn-primary">
                <span>تسليم المحاولة وإنهاء الاختبار</span>
              </button>
            </div>
          </div>
        )}

        {/* 5. تبويب: السجل الأكاديمي والشهادة (Student Transcript) */}
        {activeTab === 'grades' && (
          <div className="card" style={{ maxWidth: '850px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>
              السجل الأكاديمي الموحد (Academic Transcript)
            </h2>

            <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '0.75rem' }}>التقييم</th>
                    <th style={{ padding: '0.75rem' }}>النوع</th>
                    <th style={{ padding: '0.75rem' }}>الدرجة المرصودة</th>
                    <th style={{ padding: '0.75rem' }}>الدرجة الكلية</th>
                    <th style={{ padding: '0.75rem' }}>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem' }}>تكليف صياغة البروتوكول</td>
                    <td style={{ padding: '0.75rem' }}>تكليف عملي</td>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>18</td>
                    <td style={{ padding: '0.75rem' }}>20</td>
                    <td style={{ padding: '0.75rem' }}><span className="badge badge-emerald">معتمد</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem' }}>اختبار منتصف المسار النظري</td>
                    <td style={{ padding: '0.75rem' }}>اختبار إلكتروني</td>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>26</td>
                    <td style={{ padding: '0.75rem' }}>30</td>
                    <td style={{ padding: '0.75rem' }}><span className="badge badge-emerald">معتمد</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem' }}>الامتحان العملي الحضوري بالجامعة</td>
                    <td style={{ padding: '0.75rem' }}>عملي حضوري</td>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>42</td>
                    <td style={{ padding: '0.75rem' }}>50</td>
                    <td style={{ padding: '0.75rem' }}><span className="badge badge-emerald">تم الرصد</span></td>
                  </tr>
                  <tr style={{ background: 'var(--bg-subtle)', fontWeight: 800 }}>
                    <td style={{ padding: '0.75rem' }}>المجموع التراكمي النهائي</td>
                    <td style={{ padding: '0.75rem' }}>الدرجة الإجمالية</td>
                    <td style={{ padding: '0.75rem', color: 'var(--primary-700)' }}>86%</td>
                    <td style={{ padding: '0.75rem' }}>100%</td>
                    <td style={{ padding: '0.75rem' }}><span className="badge badge-emerald">ناجح ومؤهل للشهادة</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* قسم الشهادة */}
            <div style={{ padding: '1.5rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <GraduationCap size={20} color="var(--primary-600)" />
                    <span>شهادة إتمام الدورة الأكاديمية</span>
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    الشهادة موقعة ومعتمدة من عمادة المبادرة برمز تحقق فريد (Verification Code: ASIRA-2026-8812).
                  </p>
                </div>

                <button
                  onClick={() => setCertIssued(true)}
                  className="btn btn-primary"
                >
                  <Award size={16} />
                  <span>{certIssued ? 'تنزيل الشهادة الموقعة (PDF)' : 'طلب إصدار الشهادة'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. تبويب: لوحة المدرس (Instructor Hub - Safe Client Auto-Grading) */}
        {activeTab === 'instructor_hub' && (
          <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <span className="badge badge-emerald" style={{ marginBottom: '0.5rem' }}>
              واجهة المدرس المخول (Authorized Instructor Hub)
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              محرك التصحيح التلقائي الآمن ومراجعة محاولات الطلاب
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              يقوم متصفح المدرس المخوّل فقط بتحميل مفتاح الإجابات السري وحساب النتيجة تلقائياً، ثم اعتمادها رسمياً لتسجيلها في قاعدة البيانات.
            </p>

            {/* جدول مقارنة الإجابات بمفتاح الحل السري */}
            <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '0.6rem' }}>السؤال</th>
                    <th style={{ padding: '0.6rem' }}>إجابة الطالب</th>
                    <th style={{ padding: '0.6rem' }}>مفتاح الإجابة السري</th>
                    <th style={{ padding: '0.6rem' }}>الدرجة المقترحة</th>
                    <th style={{ padding: '0.6rem' }}>النتيجة</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.6rem' }}>1. تصميم دراسات الأدوية</td>
                    <td style={{ padding: '0.6rem' }}>الخيار A (RCT)</td>
                    <td style={{ padding: '0.6rem', color: 'var(--primary-600)', fontWeight: 700 }}>الخيار A (RCT)</td>
                    <td style={{ padding: '0.6rem' }}>5/5</td>
                    <td style={{ padding: '0.6rem', color: '#10b981', fontWeight: 700 }}>✓ صحيح</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.6rem' }}>2. بروتوكول PRISMA</td>
                    <td style={{ padding: '0.6rem' }}>الخيار C (2015)</td>
                    <td style={{ padding: '0.6rem', color: 'var(--primary-600)', fontWeight: 700 }}>الخيار B (2020)</td>
                    <td style={{ padding: '0.6rem' }}>0/5</td>
                    <td style={{ padding: '0.6rem', color: '#ef4444', fontWeight: 700 }}>✗ خطأ</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.6rem' }}>3. برمجية RevMan</td>
                    <td style={{ padding: '0.6rem' }}>الخيار D (Meta-analysis)</td>
                    <td style={{ padding: '0.6rem', color: 'var(--primary-600)', fontWeight: 700 }}>الخيار D (Meta-analysis)</td>
                    <td style={{ padding: '0.6rem' }}>5/5</td>
                    <td style={{ padding: '0.6rem', color: '#10b981', fontWeight: 700 }}>✓ صحيح</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* لوحة اعتماد الدرجة الرسمية */}
            <div style={{ padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>المجموع المحسوب تلقائياً في واجهتك:</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                  {calculatedScore} / 100 (درجة مسودة مقترحة)
                </div>
              </div>

              <button
                onClick={() => setExamGradeApproved(true)}
                className={`btn ${examGradeApproved ? 'btn-accent' : 'btn-primary'}`}
              >
                <CheckCircle2 size={16} />
                <span>{examGradeApproved ? 'تم اعتماد ونشر الدرجة الرسمية' : 'اعتماد الدرجة الرسمية وتثبيتها'}</span>
              </button>
            </div>
          </div>
        )}

        {/* 7. تبويب: لوحة المدير (Admin Control) */}
        {activeTab === 'admin_control' && (
          <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <span className="badge badge-gold" style={{ marginBottom: '0.5rem' }}>
              صلاحيات الإدارة العليا (Admin Control)
            </span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              إدارة طلبات الالتحاق وسجل العمليات الحساسة (Audit Log)
            </h2>

            {/* طلبات الالتحاق المعلقة */}
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                طلبات الالتحاق الجديدة بالكورسات:
              </h4>

              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div style={{ padding: '0.85rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-subtle)' }}>
                  <div>
                    <strong>الطالب: أحمد الصالح</strong>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>
                      (كلية الطب - جامعة الملك سعود)
                    </span>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                      الكورس المطلوب: منهجية وأساسيات البحث العلمي والنشر الدولي
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setEnrollmentStatus('approved')}
                      className="btn btn-accent"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
                    >
                      <Check size={14} />
                      <span>موافقة</span>
                    </button>
                    <button
                      onClick={() => setEnrollmentStatus('rejected')}
                      className="btn btn-outline"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem', color: '#ef4444' }}
                    >
                      <X size={14} />
                      <span>رفض</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* سجل العمليات الإدارية الحساسة (Audit Log Preview) */}
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileCheck2 size={18} color="var(--primary-600)" />
                <span>سجل التدقيق الأكاديمي غير القابل للتعديل (Audit Logs):</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem' }}>
                <div style={{ padding: '0.65rem 0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>اعتماد درجة الاختبار النظري للطالب (أحمد الصالح)</span>
                  <span style={{ color: 'var(--text-subtle)' }}>المشرف: د. إبراهيم يحيى | 12 أكتوبر 2026</span>
                </div>
                <div style={{ padding: '0.65rem 0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>الموافقة على طلب الالتحاق بكورس RES-101</span>
                  <span style={{ color: 'var(--text-subtle)' }}>المدير: admin@asira-research.org</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
