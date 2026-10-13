import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { CoursesPage } from './pages/CoursesPage';
import { ResearchPage } from './pages/ResearchPage';
import { AboutPage } from './pages/AboutPage';
import { TestimonialsPage } from './pages/TestimonialsPage';
import { ContactPage } from './pages/ContactPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { LmsDashboardPreview } from './pages/LmsDashboardPreview';
import { AuthModal } from './components/AuthModal';
import { Course, ResearchPaper, UserRole } from './types';
import { INITIAL_COURSES, INITIAL_RESEARCHES, INITIAL_CURRICULA, MockCourseCurriculum } from './data/mockData';
import { CheckCircle2, ShieldAlert } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; role: UserRole; email: string } | null>(null);
  const [enrollSuccessCourse, setEnrollSuccessCourse] = useState<Course | null>(null);

  // الحالة المركزية للكورسات والأبحاث والمناهج (Central Dynamic State)
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [researches, setResearches] = useState<ResearchPaper[]>(INITIAL_RESEARCHES);
  const [curricula, setCurricula] = useState<Record<string, MockCourseCurriculum>>(INITIAL_CURRICULA);

  const handleAddCourse = (newCourse: Course) => {
    setCourses((prev) => [newCourse, ...prev]);
    // إنشاء منهج مستقل معزول للكورس الجديد دون توريث محتوى وهمي
    setCurricula((prev) => ({
      ...prev,
      [newCourse.id]: {
        courseId: newCourse.id,
        modules: [
          {
            id: `mod-${newCourse.id}-1`,
            title: 'الوحدة الأولى: مدخل ومقدمة عامة في المسار',
            description: 'الوحدة التأسيسية الأولى للمقرر.',
            status: newCourse.status === 'coming_soon' ? 'coming_soon' : 'published',
            lessons: [],
            assignments: [],
            exams: []
          }
        ]
      }
    }));
  };

  const handleUpdateCourse = (updatedCourse: Course) => {
    setCourses((prev) => prev.map((c) => c.id === updatedCourse.id ? updatedCourse : c));
  };

  const handleUpdateCurriculum = (updated: MockCourseCurriculum) => {
    setCurricula((prev) => ({
      ...prev,
      [updated.courseId]: updated,
    }));
  };

  const handleAddResearch = (newPaper: ResearchPaper) => {
    setResearches((prev) => [newPaper, ...prev]);
  };

  const handleUpdateResearch = (updatedPaper: ResearchPaper) => {
    setResearches((prev) => prev.map((p) => p.id === updatedPaper.id ? updatedPaper : p));
  };

  const handleDeleteResearch = (id: string) => {
    setResearches((prev) => prev.filter((p) => p.id !== id));
  };

  // إدارة الوضع الليلي
  useEffect(() => {
    const savedTheme = localStorage.getItem('asira_theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('asira_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('asira_theme', 'light');
    }
  };

  const handleEnrollRequest = (course: Course) => {
    if (!currentUser) {
      setIsAuthOpen(true);
    } else {
      setEnrollSuccessCourse(course);
    }
  };

  const handleSelectCourse = (_course: Course) => {
    setCurrentTab('courses');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* شريط الإشعار الإداري السريع لاختبار المنصة */}
      <div style={{ background: 'var(--primary-900)', color: '#cbd5e1', fontSize: '0.8rem', padding: '0.4rem 1rem', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <span>مرحباً بك في منصة <strong>منتدى أسيرا لتعليم البحث العلمي (ASIRA)</strong> — واجهة رسمية وبوابة أكاديمية LMS متكاملة بتكلفة صفرية.</span>
      </div>

      {/* الهيدر العلوي */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isDark={isDark}
        toggleTheme={toggleTheme}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUser={currentUser}
      />

      {/* محتوى الصفحة النشطة */}
      <main style={{ flex: 1 }}>
        {currentTab === 'home' && (
          <HomePage
            courses={courses}
            researches={researches}
            onNavigate={(tab) => setCurrentTab(tab)}
            onEnroll={handleEnrollRequest}
            onSelectCourse={handleSelectCourse}
          />
        )}

        {currentTab === 'courses' && (
          <CoursesPage
            courses={courses}
            curricula={curricula}
            currentUser={currentUser}
            onAddCourse={handleAddCourse}
            onEnroll={handleEnrollRequest}
            onSelectCourse={handleSelectCourse}
          />
        )}

        {currentTab === 'research' && (
          <ResearchPage
            researches={researches}
            currentUser={currentUser}
            onAddResearch={handleAddResearch}
            onUpdateResearch={handleUpdateResearch}
            onDeleteResearch={handleDeleteResearch}
          />
        )}

        {currentTab === 'about' && <AboutPage />}

        {currentTab === 'testimonials' && <TestimonialsPage />}

        {currentTab === 'contact' && <ContactPage />}

        {currentTab === 'policies' && <PoliciesPage />}

        {currentTab === 'lms_dashboard' && (
          <LmsDashboardPreview
            courses={courses}
            onAddCourse={handleAddCourse}
            onUpdateCourse={handleUpdateCourse}
            researches={researches}
            onAddResearch={handleAddResearch}
            curricula={curricula}
            onUpdateCurriculum={handleUpdateCurriculum}
            userRole={currentUser?.role || 'student'}
            userName={currentUser?.name || 'أحمد الصالح'}
            onLogout={() => {
              setCurrentUser(null);
              setCurrentTab('home');
            }}
            onBackToPortal={() => setCurrentTab('home')}
          />
        )}
      </main>

      {/* التذييل */}
      <Footer onNavigate={(tab) => setCurrentTab(tab)} />

      {/* نافذة تسجيل الدخول وحماية الصلاحيات */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={(user) => {
          setCurrentUser(user);
          setCurrentTab('lms_dashboard');
        }}
      />

      {/* نافذة تأكيد طلب الالتحاق */}
      {enrollSuccessCourse && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 110,
          padding: '1.5rem',
        }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>
            <CheckCircle2 size={54} color="#10b981" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              تم استلام طلب الالتحاق بنجاح!
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              تم تسجيل طلب التحاقك بدورة <strong>"{enrollSuccessCourse.title}"</strong> بحالة <code>pending</code>. ستتم مراجعة الطلب والموافقة عليه من قبل إدارة المنتدى لتفعيل صلاحية الوصول لكافة الدروس.
            </p>
            <button
              onClick={() => {
                setEnrollSuccessCourse(null);
                setCurrentTab('lms_dashboard');
              }}
              className="btn btn-primary"
              style={{ width: '100%' }}
            >
              الانتقال إلى لوحة تحكم الطالب
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;
