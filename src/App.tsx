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
import { INITIAL_COURSES, INITIAL_RESEARCHES, INITIAL_CURRICULA, MockCourseCurriculum, MockPendingEnrollment } from './data/mockData';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { auth, db } from './services/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ uid?: string; name: string; role: UserRole; email: string } | null>(() => {
    try {
      const saved = localStorage.getItem('asira_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [enrollSuccessCourse, setEnrollSuccessCourse] = useState<Course | null>(null);

  // حفظ واسترجاع جلسة المستخدم في المتصفح تلقائياً
  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem('asira_current_user', JSON.stringify(currentUser));
      } catch {}
    } else {
      try {
        localStorage.removeItem('asira_current_user');
      } catch {}
    }
  }, [currentUser]);

  // الاستماع المستمر لحالة مصادقة Firebase واستعادة الجلسة عند تحديث الصفحة (F5)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let role: UserRole = 'student';
        let displayName = firebaseUser.displayName || firebaseUser.email || 'طالب أسيرا';
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            role = (data.role as UserRole) || 'student';
            displayName = data.displayName || displayName;
          }
        } catch {
          // fallback
        }
        setCurrentUser((prev) => {
          if (prev && prev.uid === firebaseUser.uid && prev.role === role) return prev;
          return {
            uid: firebaseUser.uid,
            name: displayName,
            role,
            email: firebaseUser.email || '',
          };
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // الحالة المركزية لطلبات الالتحاق (Enrollments)
  const [enrollments, setEnrollments] = useState<MockPendingEnrollment[]>(() => {
    try {
      const saved = localStorage.getItem('asira_enrollments');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleApproveEnrollment = (id: string) => {
    setEnrollments((prev) => {
      const updated = prev.map((e) => e.id === id ? { ...e, status: 'approved' as const } : e);
      localStorage.setItem('asira_enrollments', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRejectEnrollment = (id: string) => {
    setEnrollments((prev) => {
      const updated = prev.map((e) => e.id === id ? { ...e, status: 'rejected' as const } : e);
      localStorage.setItem('asira_enrollments', JSON.stringify(updated));
      return updated;
    });
  };

  // تنظيف البيانات الوهمية القديمة من المتصفح عند أول زيارة بعد التحديث
  useEffect(() => {
    try {
      const savedCourses = localStorage.getItem('asira_courses');
      if (savedCourses) {
        const parsed = JSON.parse(savedCourses);
        const mockIds = ['course-1', 'course-2', 'course-3', 'course-4'];
        const hasMock = parsed.some((c: { id: string }) => mockIds.includes(c.id));
        if (hasMock) {
          const cleaned = parsed.filter((c: { id: string }) => !mockIds.includes(c.id));
          localStorage.setItem('asira_courses', JSON.stringify(cleaned));
        }
      }
      const savedResearches = localStorage.getItem('asira_researches');
      if (savedResearches) {
        const parsed = JSON.parse(savedResearches);
        const mockResIds = ['res-1', 'res-2', 'res-3'];
        const hasMock = parsed.some((r: { id: string }) => mockResIds.includes(r.id));
        if (hasMock) {
          const cleaned = parsed.filter((r: { id: string }) => !mockResIds.includes(r.id));
          localStorage.setItem('asira_researches', JSON.stringify(cleaned));
        }
      }
      // تنظيف المناهج الوهمية
      const savedCurricula = localStorage.getItem('asira_curricula');
      if (savedCurricula) {
        const parsed = JSON.parse(savedCurricula);
        const mockCurrIds = ['course-1', 'course-2', 'course-3', 'course-4'];
        let changed = false;
        for (const id of mockCurrIds) {
          if (parsed[id]) { delete parsed[id]; changed = true; }
        }
        if (changed) localStorage.setItem('asira_curricula', JSON.stringify(parsed));
      }
    } catch {}
  }, []);

  // الحالة المركزية للكورسات والأبحاث والمناهج (مع الحفظ في المتصفح)
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem('asira_courses');
      if (saved) {
        const parsed = JSON.parse(saved);
        // استبعاد الكورسات الوهمية
        const mockIds = ['course-1', 'course-2', 'course-3', 'course-4'];
        return parsed.filter((c: { id: string }) => !mockIds.includes(c.id));
      }
      return INITIAL_COURSES;
    } catch {
      return INITIAL_COURSES;
    }
  });
  const [researches, setResearches] = useState<ResearchPaper[]>(() => {
    try {
      const saved = localStorage.getItem('asira_researches');
      if (saved) {
        const parsed = JSON.parse(saved);
        const mockResIds = ['res-1', 'res-2', 'res-3'];
        return parsed.filter((r: { id: string }) => !mockResIds.includes(r.id));
      }
      return INITIAL_RESEARCHES;
    } catch {
      return INITIAL_RESEARCHES;
    }
  });
  const [curricula, setCurricula] = useState<Record<string, MockCourseCurriculum>>(() => {
    try {
      const saved = localStorage.getItem('asira_curricula');
      if (saved) {
        const parsed = JSON.parse(saved);
        const mockCurrIds = ['course-1', 'course-2', 'course-3', 'course-4'];
        for (const id of mockCurrIds) delete parsed[id];
        return parsed;
      }
      return INITIAL_CURRICULA;
    } catch {
      return INITIAL_CURRICULA;
    }
  });

  const handleAddCourse = (newCourse: Course) => {
    setCourses((prev) => {
      const updated = [newCourse, ...prev];
      try {
        localStorage.setItem('asira_courses', JSON.stringify(updated));
      } catch {}
      return updated;
    });
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
    setCourses((prev) => {
      const updated = prev.map((c) => c.id === updatedCourse.id ? updatedCourse : c);
      try {
        localStorage.setItem('asira_courses', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses((prev) => {
      const updated = prev.filter((c) => c.id !== courseId);
      try {
        localStorage.setItem('asira_courses', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setEnrollments((prev) => {
      const updated = prev.filter((e) => e.courseId !== courseId);
      try {
        localStorage.setItem('asira_enrollments', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setCurricula((prev) => {
      const copy = { ...prev };
      delete copy[courseId];
      return copy;
    });
  };

  const handleUpdateCurriculum = (updated: MockCourseCurriculum) => {
    setCurricula((prev) => {
      const next = {
        ...prev,
        [updated.courseId]: updated,
      };
      try {
        localStorage.setItem('asira_curricula', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleAddResearch = (newPaper: ResearchPaper) => {
    setResearches((prev) => {
      const next = [newPaper, ...prev];
      try {
        localStorage.setItem('asira_researches', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleUpdateResearch = (updatedPaper: ResearchPaper) => {
    setResearches((prev) => {
      const next = prev.map((p) => (p.id === updatedPaper.id ? updatedPaper : p));
      try {
        localStorage.setItem('asira_researches', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleDeleteResearch = (id: string) => {
    setResearches((prev) => {
      const next = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem('asira_researches', JSON.stringify(next));
      } catch {}
      return next;
    });
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
      const existingIndex = enrollments.findIndex(e => e.studentUid === currentUser.uid && e.courseId === course.id);
      if (existingIndex >= 0) {
        const existing = enrollments[existingIndex];
        if (existing.status === 'rejected' || existing.status === 'pending') {
          // إعادة تفعيل الطلب وتحديث حالته إلى pending بتاريخ اليوم ليظهر فوراً للإدارة
          const updated = [...enrollments];
          updated[existingIndex] = {
            ...existing,
            studentName: currentUser.name || existing.studentName,
            studentEmail: currentUser.email || existing.studentEmail,
            status: 'pending',
            requestedAt: new Date().toISOString().split('T')[0],
          };
          setEnrollments(updated);
          localStorage.setItem('asira_enrollments', JSON.stringify(updated));
          setEnrollSuccessCourse(course);
        } else if (existing.status === 'approved') {
          alert('أنت مسجل بالفعل في هذا المقرر الدراسي وبإمكانك الوصول إليه مباشرة من لوحة التعلم.');
          setCurrentTab('lms_dashboard');
        }
      } else {
        const newEnrollment: MockPendingEnrollment = {
          id: `enr-${Date.now()}`,
          studentUid: currentUser.uid || `student-${Date.now()}`,
          studentName: currentUser.name || 'طالب أسيرا',
          studentEmail: currentUser.email || '',
          university: 'باحث أكاديمي',
          specialty: 'علوم طبية وبحثية',
          academicLevel: 'طالب / خريج',
          courseId: course.id,
          courseTitle: course.title,
          requestedAt: new Date().toISOString().split('T')[0],
          status: 'pending',
        };
        setEnrollments(prev => {
          const updated = [newEnrollment, ...prev];
          localStorage.setItem('asira_enrollments', JSON.stringify(updated));
          return updated;
        });
        setEnrollSuccessCourse(course);
      }
    }
  };

  const handleSelectCourse = (_course: Course) => {
    setCurrentTab('courses');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
            onDeleteCourse={handleDeleteCourse}
            researches={researches}
            onAddResearch={handleAddResearch}
            onUpdateResearch={handleUpdateResearch}
            onDeleteResearch={handleDeleteResearch}
            curricula={curricula}
            onUpdateCurriculum={handleUpdateCurriculum}
            userRole={currentUser?.role || 'student'}
            userName={currentUser?.name || 'طالب أسيرا'}
            userUid={currentUser?.uid || ''}
            enrollments={enrollments}
            onApproveEnrollment={handleApproveEnrollment}
            onRejectEnrollment={handleRejectEnrollment}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onLogout={async () => {
              try {
                await signOut(auth);
              } catch {}
              setCurrentUser(null);
              try {
                localStorage.removeItem('asira_current_user');
              } catch {}
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
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setEnrollSuccessCourse(null); }}>
          <div className="modal-content" style={{ maxWidth: '480px', textAlign: 'center' }}>
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
