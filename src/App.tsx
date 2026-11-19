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
import { INITIAL_COURSES, INITIAL_RESEARCHES, INITIAL_CURRICULA, MockCourseCurriculum, MockPendingEnrollment, MockCertificateRequest } from './data/mockData';
import { CheckCircle2, ShieldAlert } from 'lucide-react';
import { auth, db } from './services/firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, updateDoc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';

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

  // الحالة المركزية لمستخدمي المنصة وتوزيع الصلاحيات (Role-Based Access)
  const [usersList, setUsersList] = useState<Array<{ uid: string; name: string; email: string; university: string; role: UserRole; status: 'active' | 'suspended' }>>(() => {
    try {
      const saved = localStorage.getItem('asira_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // مزامنة حية ومستمرة لمستخدمي المنصة من Firestore فور تسجيل الدخول أو استعادة الجلسة
  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const syncUsers = () => {
      try {
        unsubscribeSnapshot = onSnapshot(
          collection(db, 'users'),
          (snap) => {
            if (!snap.empty) {
              const loaded: Array<{ uid: string; name: string; email: string; university: string; role: UserRole; status: 'active' | 'suspended' }> = [];
              snap.forEach((docSnap) => {
                const d = docSnap.data();
                loaded.push({
                  uid: docSnap.id,
                  name: d.displayName || d.name || d.email || 'مستخدم',
                  email: d.email || '',
                  university: d.university || 'مسجل بالمنصة',
                  role: (d.role as UserRole) || 'student',
                  status: d.accountStatus || 'active',
                });
              });
              setUsersList((prev) => {
                const map = new Map<string, typeof loaded[0]>();
                prev.forEach((u) => map.set(u.uid, u));
                loaded.forEach((u) => map.set(u.uid, { ...map.get(u.uid), ...u }));
                const merged = Array.from(map.values());
                try {
                  localStorage.setItem('asira_users', JSON.stringify(merged));
                } catch {}
                return merged;
              });
            }
          },
          (err) => {
            console.info('[Users] Realtime listener info:', err.message);
          }
        );
      } catch (err) {
        console.info('[Users] Snapshot initialization fallback:', err);
      }
    };

    if (currentUser) {
      syncUsers();
    }

    return () => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, [currentUser?.uid, currentUser?.role]);

  // ضمان إدراج المستخدم الحالي دائماً في قائمة المستخدمين
  useEffect(() => {
    if (currentUser && currentUser.uid) {
      setUsersList((prev) => {
        const idx = prev.findIndex((u) => u.uid === currentUser.uid);
        const currentObj = {
          uid: currentUser.uid!,
          name: currentUser.name,
          email: currentUser.email,
          university: 'المستخدم الحالي',
          role: currentUser.role,
          status: 'active' as const,
        };
        let updated: typeof prev;
        if (idx >= 0) {
          updated = prev.map((u) => u.uid === currentUser.uid ? { ...u, role: currentUser.role, name: currentUser.name } : u);
        } else {
          updated = [currentObj, ...prev];
        }
        try {
          localStorage.setItem('asira_users', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  }, [currentUser]);

  const handleUpdateUserRole = async (uid: string, nextRole: UserRole) => {
    setUsersList((prev) => {
      const updated = prev.map((u) => (u.uid === uid ? { ...u, role: nextRole } : u));
      try {
        localStorage.setItem('asira_users', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (currentUser && currentUser.uid === uid) {
      const nextUser = { ...currentUser, role: nextRole };
      setCurrentUser(nextUser);
      try {
        localStorage.setItem('asira_current_user', JSON.stringify(nextUser));
      } catch {}
    }

    try {
      await setDoc(
        doc(db, 'users', uid),
        { role: nextRole, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    } catch (err) {
      console.warn('[Users] Cloud role update warning:', err);
    }
  };

  const handleToggleUserStatus = async (uid: string) => {
    let nextStatus: 'active' | 'suspended' = 'active';
    setUsersList((prev) => {
      const updated = prev.map((u) => {
        if (u.uid === uid) {
          nextStatus = u.status === 'active' ? 'suspended' : 'active';
          return { ...u, status: nextStatus };
        }
        return u;
      });
      try {
        localStorage.setItem('asira_users', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await setDoc(
        doc(db, 'users', uid),
        { accountStatus: nextStatus, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    } catch (err) {
      console.warn('[Users] Cloud status update warning:', err);
    }
  };

  // الحالة المركزية لطلبات الشهادات الأكاديمية الموقعة (Dean Signed Certificates)
  const [certRequests, setCertRequests] = useState<MockCertificateRequest[]>(() => {
    try {
      const saved = localStorage.getItem('asira_cert_requests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleRequestCertificate = (courseId: string, totalScore: number = 85) => {
    const course = courses.find((c) => c.id === courseId);
    const studentUid = currentUser?.uid || 'student-current';
    const studentName = currentUser?.name || 'طالب أسيرا';

    setCertRequests((prev) => {
      const existing = prev.find(
        (c) => c.studentUid === studentUid && (c.courseId === courseId || c.courseTitle === course?.title)
      );
      if (existing) return prev;

      const newReq: MockCertificateRequest = {
        id: `cert-req-${Date.now()}`,
        studentUid,
        studentName,
        university: 'طالب مسجل بالمنصة',
        courseId,
        courseTitle: course?.title || 'كورس بحثي معتمد',
        courseCode: course?.code || 'RES-100',
        totalScore,
        requestedAt: new Date().toISOString().split('T')[0],
        status: 'pending',
      };
      const next = [newReq, ...prev];
      try {
        localStorage.setItem('asira_cert_requests', JSON.stringify(next));
      } catch {}
      try {
        setDoc(doc(db, 'certRequests', newReq.id), newReq, { merge: true });
      } catch {}
      return next;
    });
  };

  const handleUpdateCertificate = (
    id: string,
    status: 'pending' | 'processing' | 'issued' | 'rejected',
    code?: string,
    pdfUrl?: string,
    notes?: string
  ) => {
    setCertRequests((prev) => {
      const next = prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status,
              verificationCode: code || c.verificationCode,
              signedPdfUrl: pdfUrl || c.signedPdfUrl,
              adminNotes: notes !== undefined ? notes : c.adminNotes,
              issuedAt: status === 'issued' ? new Date().toISOString().split('T')[0] : c.issuedAt,
            }
          : c
      );
      try {
        localStorage.setItem('asira_cert_requests', JSON.stringify(next));
      } catch {}
      try {
        setDoc(doc(db, 'certRequests', id), {
          status,
          ...(code !== undefined ? { verificationCode: code } : {}),
          ...(pdfUrl !== undefined ? { signedPdfUrl: pdfUrl } : {}),
          ...(notes !== undefined ? { adminNotes: notes } : {}),
          ...(status === 'issued' ? { issuedAt: new Date().toISOString().split('T')[0] } : {})
        }, { merge: true });
      } catch {}
      return next;
    });
  };

  const handleIssueCertificate = (id: string, code: string, pdfUrl: string) => {
    handleUpdateCertificate(id, 'issued', code, pdfUrl);
  };

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
      const updated = prev.map((e) => (e.id === id ? { ...e, status: 'approved' as const } : e));
      try {
        localStorage.setItem('asira_enrollments', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    try {
      updateDoc(doc(db, 'enrollments', id), { status: 'approved' });
    } catch {}
  };

  const handleRejectEnrollment = (id: string) => {
    setEnrollments((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, status: 'rejected' as const } : e));
      try {
        localStorage.setItem('asira_enrollments', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    try {
      updateDoc(doc(db, 'enrollments', id), { status: 'rejected' });
    } catch {}
  };

  const handleArchiveEnrollment = (id: string) => {
    const now = new Date().toISOString();
    setEnrollments((prev) => {
      const updated = prev.map((e) =>
        e.id === id ? { ...e, status: 'archived' as const, archivedAt: now } : e
      );
      try {
        localStorage.setItem('asira_enrollments', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    try {
      updateDoc(doc(db, 'enrollments', id), { status: 'archived', archivedAt: now });
    } catch {}
  };

  const handleDeleteEnrollment = (id: string) => {
    setEnrollments((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      try {
        localStorage.setItem('asira_enrollments', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    try {
      deleteDoc(doc(db, 'enrollments', id));
    } catch {}
  };

  const handleArchiveAllProcessed = (courseId?: string) => {
    const now = new Date().toISOString();
    setEnrollments((prev) => {
      const updated = prev.map((e) => {
        if (courseId && e.courseId !== courseId) return e;
        if (e.status === 'approved' || e.status === 'rejected') {
          try {
            updateDoc(doc(db, 'enrollments', e.id), { status: 'archived', archivedAt: now });
          } catch {}
          return { ...e, status: 'archived' as const, archivedAt: now };
        }
        return e;
      });
      try {
        localStorage.setItem('asira_enrollments', JSON.stringify(updated));
      } catch {}
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

  // مزامنة الكورسات والمناهج وطلبات الالتحاق والشهادات مع Firestore عند بدء التشغيل
  useEffect(() => {
    // 1. تحميل الكورسات من Firestore
    getDocs(collection(db, 'courses')).then((snap) => {
      if (!snap.empty) {
        const fbCourses = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Course));
        setCourses((prev) => {
          const map = new Map<string, Course>();
          prev.forEach((c) => map.set(c.id, c));
          fbCourses.forEach((c) => map.set(c.id, { ...map.get(c.id), ...c }));
          const merged = Array.from(map.values());
          try {
            localStorage.setItem('asira_courses', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    }).catch(() => {});

    // 2. تحميل المناهج من Firestore
    getDocs(collection(db, 'curricula')).then((snap) => {
      if (!snap.empty) {
        const fbCurricula: Record<string, MockCourseCurriculum> = {};
        snap.docs.forEach((d) => {
          fbCurricula[d.id] = d.data() as MockCourseCurriculum;
        });
        setCurricula((prev) => {
          const merged = { ...prev, ...fbCurricula };
          try {
            localStorage.setItem('asira_curricula', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    }).catch(() => {});

    // 3. تحميل طلبات الالتحاق من Firestore
    getDocs(collection(db, 'enrollments')).then((snap) => {
      if (!snap.empty) {
        const fbEnrollments = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MockPendingEnrollment));
        setEnrollments((prev) => {
          const map = new Map<string, MockPendingEnrollment>();
          prev.forEach((e) => map.set(e.id, e));
          fbEnrollments.forEach((e) => map.set(e.id, { ...map.get(e.id), ...e }));
          const merged = Array.from(map.values());
          try {
            localStorage.setItem('asira_enrollments', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    }).catch(() => {});

    // 4. تحميل طلبات الشهادات من Firestore
    getDocs(collection(db, 'certRequests')).then((snap) => {
      if (!snap.empty) {
        const fbCerts = snap.docs.map((d) => ({ id: d.id, ...d.data() } as MockCertificateRequest));
        setCertRequests((prev) => {
          const map = new Map<string, MockCertificateRequest>();
          prev.forEach((c) => map.set(c.id, c));
          fbCerts.forEach((c) => map.set(c.id, { ...map.get(c.id), ...c }));
          const merged = Array.from(map.values());
          try {
            localStorage.setItem('asira_cert_requests', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    }).catch(() => {});
  }, []);

  const handleAddCourse = (newCourse: Course) => {
    setCourses((prev) => {
      const updated = [newCourse, ...prev];
      try {
        localStorage.setItem('asira_courses', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    try {
      setDoc(doc(db, 'courses', newCourse.id), newCourse);
    } catch {}

    const newCurriculum: MockCourseCurriculum = {
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
    };

    // إنشاء منهج مستقل معزول للكورس الجديد دون توريث محتوى وهمي
    setCurricula((prev) => {
      const next = { ...prev, [newCourse.id]: newCurriculum };
      try {
        localStorage.setItem('asira_curricula', JSON.stringify(next));
      } catch {}
      return next;
    });
    try {
      setDoc(doc(db, 'curricula', newCourse.id), newCurriculum);
    } catch {}
  };

  const handleUpdateCourse = (updatedCourse: Course) => {
    setCourses((prev) => {
      const updated = prev.map((c) => c.id === updatedCourse.id ? updatedCourse : c);
      try {
        localStorage.setItem('asira_courses', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    try {
      setDoc(doc(db, 'courses', updatedCourse.id), updatedCourse, { merge: true });
    } catch {}
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
      try {
        localStorage.setItem('asira_curricula', JSON.stringify(copy));
      } catch {}
      return copy;
    });
    try {
      deleteDoc(doc(db, 'courses', courseId));
      deleteDoc(doc(db, 'curricula', courseId));
    } catch {}
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
    try {
      setDoc(doc(db, 'curricula', updated.courseId), updated);
    } catch {}
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
          const updatedEnrollment: MockPendingEnrollment = {
            ...existing,
            studentName: currentUser.name || existing.studentName,
            studentEmail: currentUser.email || existing.studentEmail,
            status: 'pending',
            requestedAt: new Date().toISOString().split('T')[0],
          };
          updated[existingIndex] = updatedEnrollment;
          setEnrollments(updated);
          try {
            localStorage.setItem('asira_enrollments', JSON.stringify(updated));
          } catch {}
          try {
            setDoc(doc(db, 'enrollments', existing.id), updatedEnrollment, { merge: true });
          } catch {}
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
          try {
            localStorage.setItem('asira_enrollments', JSON.stringify(updated));
          } catch {}
          return updated;
        });
        try {
          setDoc(doc(db, 'enrollments', newEnrollment.id), newEnrollment);
        } catch {}
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
            onArchiveEnrollment={handleArchiveEnrollment}
            onDeleteEnrollment={handleDeleteEnrollment}
            onArchiveAllProcessed={handleArchiveAllProcessed}
            certRequests={certRequests}
            onRequestCertificate={handleRequestCertificate}
            onUpdateCertificate={handleUpdateCertificate}
            onIssueCertificate={handleIssueCertificate}
            usersList={usersList}
            onUpdateUserRole={handleUpdateUserRole}
            onToggleUserStatus={handleToggleUserStatus}
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
