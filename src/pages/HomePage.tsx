import React from 'react';
import { 
  BookOpen, 
  Award, 
  Sparkles, 
  ArrowLeft, 
  Search, 
  FileText, 
  GraduationCap, 
  Star 
} from 'lucide-react';
import { INITIAL_STATS, INITIAL_COURSES, INITIAL_RESEARCHES, INITIAL_TESTIMONIALS } from '../data/mockData';
import { CourseCard } from '../components/CourseCard';
import { ResearchCard } from '../components/ResearchCard';
import { Course, ResearchPaper } from '../types';

interface HomePageProps {
  courses?: Course[];
  researches?: ResearchPaper[];
  onNavigate: (tab: string) => void;
  onEnroll: (course: Course) => void;
  onSelectCourse: (course: Course) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ 
  courses = INITIAL_COURSES,
  researches = INITIAL_RESEARCHES,
  onNavigate, 
  onEnroll, 
  onSelectCourse 
}) => {
  return (
    <div>
      {/* 1. قسم البطل (Hero Section) */}
      <section className="hero-section">
        <div className="container hero-content">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span className="badge badge-emerald">
              <Sparkles size={14} /> مبادرة تدريب ونشر أكاديمي دولي
            </span>
            <span className="badge badge-primary">
              منتدى أسيرا لتعليم البحث العلمي
            </span>
          </div>

          <h1 className="hero-title">
            نُمكّن الباحثين العرب من إتقان <span className="gradient-text">مناهج البحث والنشر الدولي الرصين</span>
          </h1>

          <p className="hero-subtitle">
            منصتكم الأكاديمية المتكاملة لتعلم صياغة الأوراق العلمية، المراجعات المنهجية، التحليل الإحصائي، ونشر أبحاثكم في أرقى المجلات المفهرسة عالمياً (Q1 & Q2).
          </p>

          <div className="hero-actions">
            <button
              onClick={() => onNavigate('courses')}
              className="btn btn-primary"
              style={{ padding: '0.8rem 1.8rem', fontSize: '1.05rem' }}
              id="hero-explore-courses-btn"
            >
              <BookOpen size={20} />
              <span>استكشف برامجنا وكورساتنا</span>
              <ArrowLeft size={18} />
            </button>

            <button
              onClick={() => onNavigate('research')}
              className="btn btn-outline"
              style={{ padding: '0.8rem 1.8rem', fontSize: '1.05rem' }}
              id="hero-explore-research-btn"
            >
              <FileText size={20} />
              <span>أبحاث طلابنا المنشورة</span>
            </button>
          </div>

          {/* شريط الإحصائيات الحية لأثر منتدى أسيرا */}
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-number">{INITIAL_STATS.publishedPapers}+</div>
              <div className="stat-label">بحثاً منشوراً في مجلات عالمية</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{INITIAL_STATS.studentsTrained}+</div>
              <div className="stat-label">باحثاً وطالباً تم تدريبهم</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{INITIAL_STATS.activeMentors}+</div>
              <div className="stat-label">مشرفاً وأكاديمياً متخصصاً</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{INITIAL_STATS.hoursOfTraining}+</div>
              <div className="stat-label">ساعة تدريب وإشراف مباشر</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. مسارات البحث العلمي في أسيرا (Research Tracks) */}
      <section style={{ padding: '4.5rem 0', background: 'var(--bg-subtle)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem' }}>
            <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
              المسارات التخصصية
            </span>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
              مجالات التدريب الأكاديمي الرصين
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
              نركز في منتدى أسيرا على المهارات التي تنقل الطالب من متلقٍ للمعلومة إلى صانع للمعرفة وباحث معتمد.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ textAlign: 'right' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--primary-100)', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Search size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                المراجعات المنهجية (Systematic Reviews)
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                بروتوكول PRISMA، تسجيل PROSPERO، التصفية المزدوجة عبر Rayyan، واستخلاص البيانات بدقة موثقة.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'right' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <FileText size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                التحليل الإحصائي التلوي (Meta-Analysis)
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                تحليل الأدلة المجمعة باستخدام برمجيات RevMan و R، ورسم مخططات Forest & Funnel Plots وتفسير عدم التجانس.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'right' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--accent-gold-light)', color: 'var(--accent-gold-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <GraduationCap size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                الإحصاء الحيوي الطبي (Biostatistics)
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                تنظيف وتحليل البيانات الطبية في SPSS و R، واختبارات الفرضيات المتقدمة، وبناء نماذج الانحدار.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'right' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--primary-50)', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Award size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                النشر الدولي وأخلاقيات البحث
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                معايير ICMJE، صياغة رسائل التقديم (Cover Letters)، الرد على المحكّمين (Peer Reviewers)، وتجنب المجلات المفترسة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. الكورسات والبرامج المميزة */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-emerald" style={{ marginBottom: '0.5rem' }}>
                البرامج المتاحة حالياً
              </span>
              <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                كورسات منتدى أسيرا التدريبية
              </h2>
            </div>
            <button
              onClick={() => onNavigate('courses')}
              className="btn btn-outline"
            >
              <span>عرض جميع الكورسات</span>
              <ArrowLeft size={16} />
            </button>
          </div>

          <div className="grid-3">
            {courses.slice(0, 3).map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onSelect={onSelectCourse}
                onEnroll={onEnroll}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. أحدث الأبحاث المنشورة لطلاب المنتدى (Research Highlights) */}
      <section style={{ padding: '5rem 0', background: 'var(--bg-subtle)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '0.5rem' }}>
                فخر المنتدى
              </span>
              <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                أبحاث منشورة في مجلات عالمية محكمة
              </h2>
            </div>
            <button
              onClick={() => onNavigate('research')}
              className="btn btn-outline"
            >
              <span>معرض الأبحاث الكامل</span>
              <ArrowLeft size={16} />
            </button>
          </div>

          <div className="grid-3">
            {researches.slice(0, 3).map((paper) => (
              <ResearchCard key={paper.id} paper={paper} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. قصص نجاح طلابنا وخريجينا */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem' }}>
            <span className="badge badge-gold" style={{ marginBottom: '0.75rem' }}>
              آراء وتجارب واقعية
            </span>
            <h2 style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
              ماذا يقول طلاب أسيرا عن تجربتهم؟
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              شهادات نعتز بها من طلاب الكليات الطبية والصحية الذين خاضوا تجربة التعلم والنشر معنا.
            </p>
          </div>

          <div className="grid-3">
            {INITIAL_TESTIMONIALS.map((item) => (
              <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                  ))}
                </div>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.7', marginBottom: '1.5rem', flexGrow: 1, fontStyle: 'italic' }}>
                  "{item.quote}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  {item.avatarUrl ? (
                    <img 
                      src={item.avatarUrl} 
                      alt={item.studentName}
                      style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--primary-600), var(--primary-850, #1e3a8a))',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        flexShrink: 0,
                      }}
                    >
                      {item.studentName.replace(/^[طصد]\.\s*/, '').slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {item.studentName}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {item.university}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. دعوة للانضمام والبدء (Call to Action) */}
      <section style={{ padding: '4rem 0', background: 'linear-gradient(135deg, var(--primary-900), var(--primary-950))', color: '#fff', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '750px' }}>
          <h2 style={{ fontSize: '2.3rem', fontWeight: 900, marginBottom: '1rem' }}>
            هل أنت مستعد لنشر ورقتك العلمية الأولى؟
          </h2>
          <p style={{ fontSize: '1.15rem', color: '#cbd5e1', lineHeight: '1.8', marginBottom: '2rem' }}>
            انضم إلى مجتمع منتدى أسيرا، وسجل في أحد مساراتنا التدريبية المتخصصة تحت إشراف نخبة من الأكاديميين والباحثين المعتمدين.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('courses')}
              className="btn btn-accent"
              style={{ padding: '0.8rem 2rem', fontSize: '1.05rem' }}
            >
              <span>انضم الآن إلى كورساتنا</span>
              <ArrowLeft size={18} />
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="btn btn-outline"
              style={{ padding: '0.8rem 2rem', fontSize: '1.05rem', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
            >
              <span>تواصل مع المشرفين</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
