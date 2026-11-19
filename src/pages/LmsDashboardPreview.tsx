import React, { useState, useEffect } from 'react';
import {
  Course,
  ResearchPaper,
  UserRole
} from '../types';
import {
  INITIAL_COURSES,
  INITIAL_RESEARCHES,
  MockStudentSubmission,
  MockExamAttemptForInstructor,
  MockCourseCurriculum,
  MockPendingEnrollment,
  MockCertificateRequest,
  MockAuditLogItem,
  INITIAL_CURRICULA
} from '../data/mockData';
import { StudentDashboard } from '../components/lms/StudentDashboard';
import { InstructorDashboard } from '../components/lms/InstructorDashboard';
import { AdminDashboard } from '../components/lms/AdminDashboard';
import {
  loadAllStudentDataForCourse,
  saveSubmission as fbSaveSubmission,
  saveExamAttempt as fbSaveExamAttempt,
  savePracticalGrade as fbSavePracticalGrade,
  loadPracticalGrades as fbLoadPracticalGrades,
} from '../services/studentDataService';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  ArrowRight,
  LogOut,
  Sparkles
} from 'lucide-react';

interface LmsDashboardPreviewProps {
  courses?: Course[];
  onAddCourse?: (newCourse: Course) => void;
  onUpdateCourse?: (updatedCourse: Course) => void;
  onDeleteCourse?: (courseId: string) => void;
  researches?: ResearchPaper[];
  onAddResearch?: (newPaper: ResearchPaper) => void;
  onUpdateResearch?: (updatedPaper: ResearchPaper) => void;
  onDeleteResearch?: (id: string) => void;
  curricula?: Record<string, MockCourseCurriculum>;
  onUpdateCurriculum?: (curriculum: MockCourseCurriculum) => void;
  userRole: UserRole;
  userName: string;
  userUid?: string;
  enrollments?: MockPendingEnrollment[];
  onApproveEnrollment?: (id: string) => void;
  onRejectEnrollment?: (id: string) => void;
  onArchiveEnrollment?: (id: string) => void;
  onDeleteEnrollment?: (id: string) => void;
  onArchiveAllProcessed?: (courseId?: string) => void;
  certRequests?: MockCertificateRequest[];
  onRequestCertificate?: (courseId: string, totalScore?: number) => void;
  onUpdateCertificate?: (
    id: string,
    status: 'pending' | 'processing' | 'issued' | 'rejected',
    code?: string,
    pdfUrl?: string,
    notes?: string
  ) => void;
  onIssueCertificate?: (id: string, code: string, pdfUrl: string) => void;
  usersList?: Array<{ uid: string; name: string; email: string; university: string; role: UserRole; status: 'active' | 'suspended' }>;
  onUpdateUserRole?: (uid: string, nextRole: UserRole) => void;
  onToggleUserStatus?: (uid: string) => void;
  onNavigateTab?: (tab: string) => void;
  onLogout: () => void;
  onBackToPortal: () => void;
}

export const LmsDashboardPreview: React.FC<LmsDashboardPreviewProps> = ({
  courses = INITIAL_COURSES,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  researches: _researches = INITIAL_RESEARCHES,
  onAddResearch,
  onUpdateResearch,
  onDeleteResearch,
  curricula: propCurricula,
  onUpdateCurriculum: propOnUpdateCurriculum,
  userRole: initialRole,
  userName: initialName,
  userUid = '',
  enrollments: propEnrollments,
  onApproveEnrollment: propOnApproveEnrollment,
  onRejectEnrollment: propOnRejectEnrollment,
  onArchiveEnrollment: propOnArchiveEnrollment,
  onDeleteEnrollment: propOnDeleteEnrollment,
  onArchiveAllProcessed: propOnArchiveAllProcessed,
  certRequests: propCertRequests,
  onRequestCertificate: propOnRequestCertificate,
  onUpdateCertificate: propOnUpdateCertificate,
  onIssueCertificate: propOnIssueCertificate,
  usersList: propUsersList,
  onUpdateUserRole,
  onToggleUserStatus,
  onNavigateTab,
  onLogout,
  onBackToPortal,
}) => {
  // الدور النشط
  const [activeRole, setActiveRole] = useState<UserRole>(initialRole);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // الحالة المركزية المشتركة بين الأدوار (Clean Slate for Production)
  const [submissions, setSubmissions] = useState<MockStudentSubmission[]>([]);
  const [examAttempts, setExamAttempts] = useState<MockExamAttemptForInstructor[]>([]);
  const [localCurricula, setLocalCurricula] = useState<Record<string, MockCourseCurriculum>>(propCurricula || INITIAL_CURRICULA);
  const activeCurricula = propCurricula || localCurricula;
  const activeCourseId = selectedCourseId || courses[0]?.id || '';
  const currentCurriculum = (activeCourseId && activeCurricula[activeCourseId]) || {
    courseId: activeCourseId,
    modules: []
  };

  const [localEnrollments, setLocalEnrollments] = useState<MockPendingEnrollment[]>([]);
  const enrollments = propEnrollments || localEnrollments;
  const [localCertRequests, setLocalCertRequests] = useState<MockCertificateRequest[]>(() => {
    try {
      const saved = localStorage.getItem('asira_cert_requests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const certRequests = propCertRequests || localCertRequests;
  const [auditLogs, setAuditLogs] = useState<MockAuditLogItem[]>([]);
  const [practicalGrades, setPracticalGrades] = useState<Record<string, { score: number; notes: string }>>({});

  // تحميل بيانات الطلاب من Firebase عند تبديل الكورس النشط
  useEffect(() => {
    if (!activeCourseId) return;

    // تحميل بيانات التكليفات والاختبارات والدرجات العملية لجميع الطلاب
    loadAllStudentDataForCourse(activeCourseId).then((data) => {
      // دمج التسليمات من Firebase مع الحالة الحالية
      if (data.submissions && Object.keys(data.submissions).length > 0) {
        const fbSubmissions: MockStudentSubmission[] = [];
        Object.entries(data.submissions).forEach(([uid, subs]) => {
          subs.forEach((sub) => {
            fbSubmissions.push({
              id: sub.assignmentId || `sub-fb-${Date.now()}-${Math.random()}`,
              studentUid: uid,
              studentName: uid,
              university: 'باحث أكاديمي',
              assignmentTitle: sub.assignmentTitle,
              version: sub.version,
              driveFileUrl: sub.driveFileUrl,
              submittedAt: sub.submittedAt,
              status: sub.status as 'submitted' | 'graded' | 'revision_required',
              grade: sub.grade ?? undefined,
              maxScore: sub.maxScore,
              instructorFeedback: sub.instructorFeedback || undefined,
              revisionNotes: sub.revisionNotes || undefined,
            });
          });
        });
        if (fbSubmissions.length > 0) {
          setSubmissions((prev) => {
            const merged = [...prev];
            fbSubmissions.forEach((fb) => {
              const existsIdx = merged.findIndex((s) =>
                s.studentUid === fb.studentUid && s.assignmentTitle === fb.assignmentTitle
              );
              if (existsIdx >= 0) {
                merged[existsIdx] = { ...merged[existsIdx], ...fb, id: merged[existsIdx].id };
              } else {
                merged.push(fb);
              }
            });
            return merged;
          });
        }
      }

      // دمج محاولات الاختبار من Firebase
      if (data.examAttempts && Object.keys(data.examAttempts).length > 0) {
        const fbAttempts: MockExamAttemptForInstructor[] = [];
        Object.entries(data.examAttempts).forEach(([uid, attempts]) => {
          attempts.forEach((att) => {
            fbAttempts.push({
              id: `exam-att-${uid}-${att.examId}`,
              studentUid: uid,
              studentName: uid,
              university: 'باحث أكاديمي',
              examTitle: att.examId,
              calculatedScore: att.calculatedScore,
              maxScore: 30,
              status: 'pending_review',
              submittedAt: att.submittedAt,
              studentAnswers: Object.entries(att.selectedAnswers || {}).map(([qId, ans]) => ({
                qId,
                questionText: `سؤال ${qId}`,
                studentAnswer: ans,
                correctAnswer: '',
                points: 0,
                maxPoints: 10,
                isCorrect: true,
              })),
            });
          });
        });
        if (fbAttempts.length > 0) {
          setExamAttempts((prev) => {
            const merged = [...prev];
            fbAttempts.forEach((fb) => {
              const existsIdx = merged.findIndex((a) => a.studentUid === fb.studentUid && a.examTitle === fb.examTitle);
              if (existsIdx >= 0) {
                merged[existsIdx] = { ...merged[existsIdx], calculatedScore: fb.calculatedScore, submittedAt: fb.submittedAt };
              } else {
                merged.push(fb);
              }
            });
            return merged;
          });
        }
      }

      // دمج الدرجات العملية من Firebase
      if (data.practicalGrades && Object.keys(data.practicalGrades).length > 0) {
        setPracticalGrades((prev) => ({ ...prev, ...data.practicalGrades }));
      }
    }).catch(() => { });

    // تحميل الدرجات العملية بشكل منفصل (أسرع)
    fbLoadPracticalGrades(activeCourseId).then((grades) => {
      if (Object.keys(grades).length > 0) {
        setPracticalGrades((prev) => ({ ...prev, ...grades }));
      }
    }).catch(() => { });
  }, [activeCourseId]);

  // إضافة عملية إلى سجل التدقيق غير القابل للتعديل
  const appendAuditLog = (action: string, details: string) => {
    const actorName = activeRole === 'admin'
      ? 'مدير المنصة العام (Admin)'
      : activeRole === 'instructor'
        ? (initialName || 'المدرس الأكاديمي')
        : (initialName || 'طالب أسيرا');
    const actorRole = activeRole === 'admin' ? 'مدير المنصة' : activeRole === 'instructor' ? 'مدرس مسند' : 'طالب';

    const now = new Date();
    const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newLog: MockAuditLogItem = {
      id: `audit-${Date.now()}`,
      timestamp,
      actorName,
      actorRole,
      action,
      details,
    };

    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // 1. تحديث تكليف من قبل المدرس
  const handleUpdateSubmission = (updated: MockStudentSubmission) => {
    setSubmissions((prev) => prev.map((s) => s.id === updated.id ? updated : s));
    // حفظ التحديث في Firebase
    if (updated.studentUid && activeCourseId) {
      fbSaveSubmission(updated.studentUid, activeCourseId, {
        assignmentId: updated.id,
        assignmentTitle: updated.assignmentTitle,
        driveFileUrl: updated.driveFileUrl,
        status: updated.status,
        grade: updated.grade ?? null,
        maxScore: updated.maxScore,
        instructorFeedback: updated.instructorFeedback || '',
        version: updated.version,
        submittedAt: updated.submittedAt,
        revisionNotes: updated.revisionNotes || '',
      }).catch(() => { });
    }
  };

  // 2. تسليم تكليف جديد من قبل الطالب
  const handleSubmitAssignment = (newSub: MockStudentSubmission) => {
    setSubmissions((prev) => {
      const exists = prev.some((s) => s.id === newSub.id);
      if (exists) {
        return prev.map((s) => s.id === newSub.id ? newSub : s);
      }
      return [newSub, ...prev];
    });
    // حفظ التسليم في Firebase
    if (newSub.studentUid && activeCourseId) {
      const firstAsg = currentCurriculum.modules?.flatMap((m) => m.assignments || [])[0];
      fbSaveSubmission(newSub.studentUid, activeCourseId, {
        assignmentId: firstAsg?.id || newSub.id,
        assignmentTitle: newSub.assignmentTitle,
        driveFileUrl: newSub.driveFileUrl,
        status: newSub.status,
        grade: newSub.grade ?? null,
        maxScore: newSub.maxScore,
        instructorFeedback: newSub.instructorFeedback || '',
        version: newSub.version,
        submittedAt: newSub.submittedAt,
        revisionNotes: newSub.revisionNotes || '',
      }).catch(() => { });
    }
  };

  // 3. اعتماد / تعديل درجة اختبار من قبل المدرس
  const handleUpdateExamAttempt = (updated: MockExamAttemptForInstructor) => {
    setExamAttempts((prev) => prev.map((a) => a.id === updated.id ? updated : a));
    // حفظ تحديث درجة الاختبار في Firebase
    if (updated.studentUid && activeCourseId) {
      fbSaveExamAttempt(updated.studentUid, activeCourseId, {
        examId: updated.examTitle || updated.id,
        selectedAnswers: {},
        calculatedScore: updated.officialGrade ?? updated.calculatedScore ?? 0,
        examSubmitted: true,
        submittedAt: updated.submittedAt || new Date().toISOString(),
      }).catch(() => { });
    }
  };

  // 4. تعديل المنهج والدروس لكل كورس على حدة
  const handleUpdateCurriculum = (updated: MockCourseCurriculum) => {
    if (propOnUpdateCurriculum) {
      propOnUpdateCurriculum(updated);
    } else {
      setLocalCurricula((prev) => ({
        ...prev,
        [updated.courseId]: updated,
      }));
    }
  };

  // 5. تعديل درجة العملي الحضوري
  const handleUpdatePracticalGrade = (studentId: string, score: number, notes: string) => {
    setPracticalGrades((prev) => ({
      ...prev,
      [studentId]: { score, notes }
    }));
    // حفظ الدرجة العملية في Firebase
    if (activeCourseId) {
      fbSavePracticalGrade(studentId, activeCourseId, score, notes, initialName || 'المدرس الأكاديمي').catch(() => { });
    }
  };

  // 6. قبول طلب التحاق من قبل المدير أو المشرف
  const handleApproveEnrollment = (id: string) => {
    if (propOnApproveEnrollment) {
      propOnApproveEnrollment(id);
    } else {
      setLocalEnrollments((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'approved' } : e)));
    }
  };

  // 7. رفض طلب التحاق من قبل المدير أو المشرف
  const handleRejectEnrollment = (id: string) => {
    if (propOnRejectEnrollment) {
      propOnRejectEnrollment(id);
    } else {
      setLocalEnrollments((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'rejected' } : e)));
    }
  };

  // 7.1 أرشفة طلب التحاق منتهي
  const handleArchiveEnrollment = (id: string) => {
    if (propOnArchiveEnrollment) {
      propOnArchiveEnrollment(id);
    } else {
      setLocalEnrollments((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: 'archived', archivedAt: new Date().toISOString() } : e))
      );
    }
  };

  // 7.2 حذف طلب التحاق نهائياً
  const handleDeleteEnrollment = (id: string) => {
    if (propOnDeleteEnrollment) {
      propOnDeleteEnrollment(id);
    } else {
      setLocalEnrollments((prev) => prev.filter((e) => e.id !== id));
    }
  };

  // 7.3 أرشفة كافة الطلبات المنتهية (المقبولة والمرفوضة)
  const handleArchiveAllProcessed = (courseId?: string) => {
    if (propOnArchiveAllProcessed) {
      propOnArchiveAllProcessed(courseId);
    } else {
      setLocalEnrollments((prev) =>
        prev.map((e) => {
          if (courseId && e.courseId !== courseId) return e;
          if (e.status === 'approved' || e.status === 'rejected') {
            return { ...e, status: 'archived', archivedAt: new Date().toISOString() };
          }
          return e;
        })
      );
    }
  };

  // 8. تقديم طلب شهادة أكاديمية من قبل الطالب
  const handleRequestCertificate = (courseId: string, scoreParam?: number) => {
    if (propOnRequestCertificate) {
      propOnRequestCertificate(courseId, scoreParam);
    }
    const course = courses.find((c) => c.id === courseId);
    const currentStudentUid = userUid || 'student-current';
    const existing = certRequests.find(
      (c) => c.studentUid === currentStudentUid && (c.courseId === courseId || c.courseTitle === course?.title)
    );
    if (existing) return;

    const newReq: MockCertificateRequest = {
      id: `cert-req-${Date.now()}`,
      studentUid: currentStudentUid,
      studentName: initialName,
      university: 'باحث أكاديمي',
      courseId: courseId,
      courseTitle: course?.title || 'منهجية وأساسيات البحث العلمي والنشر الدولي',
      courseCode: course?.code || 'RES-101',
      totalScore: scoreParam || 86,
      requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'pending',
      verificationCode: `ASIRA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setLocalCertRequests((prev) => {
      const next = [newReq, ...prev];
      try {
        localStorage.setItem('asira_cert_requests', JSON.stringify(next));
      } catch { }
      return next;
    });
    appendAuditLog(
      'تقديم طلب شهادة أكاديمية',
      `قام الطالب (${initialName}) بطلب إصدار شهادة معتمدة لكورس: ${course?.title || courseId}`
    );
  };

  // 9. تعديل حالة الشهادة ورفع الرابط من قبل المدير
  const handleUpdateCertificate = (
    id: string,
    status: 'pending' | 'processing' | 'issued' | 'rejected',
    code?: string,
    pdfUrl?: string,
    notes?: string
  ) => {
    if (propOnUpdateCertificate) {
      propOnUpdateCertificate(id, status, code, pdfUrl, notes);
    }
    setLocalCertRequests((prev) => {
      const next = prev.map((c) =>
        c.id === id
          ? {
            ...c,
            status,
            verificationCode: code !== undefined ? code : c.verificationCode,
            signedPdfUrl: pdfUrl !== undefined ? pdfUrl : c.signedPdfUrl,
            adminNotes: notes !== undefined ? notes : c.adminNotes,
            issuedAt: status === 'issued' ? new Date().toISOString().split('T')[0] : c.issuedAt,
          }
          : c
      );
      try {
        localStorage.setItem('asira_cert_requests', JSON.stringify(next));
      } catch { }
      return next;
    });
  };

  // 10. إصدار وتوقيع شهادة من قبل المدير (توافق خلفي)
  const handleIssueCertificate = (id: string, code: string, pdfUrl: string) => {
    if (propOnIssueCertificate) {
      propOnIssueCertificate(id, code, pdfUrl);
    }
    handleUpdateCertificate(id, 'issued', code, pdfUrl, 'تم توقيع الشهادة ورفع النسخة المعتمدة');
  };

  return (
    <div style={{ minHeight: '88vh', background: 'var(--bg-main)', padding: '2rem 0 4rem' }}>
      <div className="container">

        {/* شريط رأس لوحة التحكم الأكاديمية */}
        <div className="card" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '4px solid var(--primary-600)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span className={`badge ${activeRole === 'admin' ? 'badge-gold' : activeRole === 'instructor' ? 'badge-emerald' : 'badge-primary'}`}>
                {activeRole === 'admin' ? '🛡️ لوحة تحكم المدير العام' : activeRole === 'instructor' ? '👨‍🏫 لوحة تحكم المدرس الأكاديمي' : '👨‍🎓 لوحة تحكم الطالب'}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>نظام أسيرا الأكاديمي (LMS Engine)</span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
              {activeRole === 'admin' ? 'الإدارة الأكاديمية والعمليات' : activeRole === 'instructor' ? (initialName ? `المشرف: ${initialName}` : 'لوحة المشرف الأكاديمي') : `مرحباً بك، ${initialName}`}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={onBackToPortal} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
              <ArrowRight size={14} />
              <span>العودة لواجهة المنتدى العامة</span>
            </button>
            <button onClick={onLogout} className="btn btn-ghost" style={{ fontSize: '0.85rem', color: '#ef4444' }}>
              <LogOut size={14} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>

        {/* شريط تبديل الأدوار الإداري مخصص للمدير فقط لاستعراض واجهات المنصة */}
        {initialRole === 'admin' && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="var(--primary-600)" />
              <div>
                <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)', display: 'block' }}>
                  معاينة المنصة بصلاحيات أخرى (خاص بالمدير فقط):
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  يمكنك كمدير استعراض واجهة الطالب أو المدرس للتأكد من مظهر المنصة وسير المقررات.
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg-subtle)', padding: '0.35rem', borderRadius: 'var(--radius-md)', flexWrap: 'wrap' }}>
              <button
                onClick={() => setActiveRole('student')}
                className={`btn ${activeRole === 'student' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', flex: '1 1 auto' }}
              >
                <GraduationCap size={15} />
                <span>معاينة واجهة الطالب</span>
              </button>

              <button
                onClick={() => setActiveRole('instructor')}
                className={`btn ${activeRole === 'instructor' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', flex: '1 1 auto' }}
              >
                <Users size={15} />
                <span>معاينة واجهة المدرس</span>
              </button>

              <button
                onClick={() => setActiveRole('admin')}
                className={`btn ${activeRole === 'admin' ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', flex: '1 1 auto' }}
              >
                <ShieldCheck size={15} />
                <span>لوحة تحكم المدير</span>
              </button>
            </div>
          </div>
        )}

        {/* عرض اللوحة المناسبة حسب الدور النشط */}
        {activeRole === 'student' && (() => {
          const currentStudentUid = userUid || 'student-current';
          const studentApprovedEnrollments = (enrollments || []).filter(
            (e) => e.studentUid === currentStudentUid && e.status === 'approved'
          );
          const studentPendingEnrollments = (enrollments || []).filter(
            (e) => e.studentUid === currentStudentUid && e.status === 'pending'
          );

          // للطالب، يعرض فقط الكورسات المقبول فيها رسمياً
          const studentEnrolledCourses = initialRole === 'student'
            ? courses.filter((c) => studentApprovedEnrollments.some((e) => e.courseId === c.id))
            : courses;

          return (
            <StudentDashboard
              courses={studentEnrolledCourses}
              pendingEnrollments={studentPendingEnrollments}
              activeCourseId={selectedCourseId || courses[0]?.id || ''}
              onSelectCourseId={(id) => setSelectedCourseId(id)}
              studentName={initialName}
              studentUid={currentStudentUid}
              submissions={submissions}
              onSubmitAssignment={handleSubmitAssignment}
              examAttempts={examAttempts}
              curriculum={currentCurriculum}
              practicalGrades={practicalGrades}
              certRequests={certRequests}
              onRequestCertificate={handleRequestCertificate}
              onNavigateTab={onNavigateTab || onBackToPortal}
              onLogAudit={appendAuditLog}
            />
          );
        })()}

        {activeRole === 'instructor' && (
          <InstructorDashboard
            courses={courses}
            activeCourseId={selectedCourseId || undefined}
            onSelectCourseId={(id) => setSelectedCourseId(id || null)}
            onAddCourse={onAddCourse}
            onUpdateCourse={onUpdateCourse}
            onDeleteCourse={onDeleteCourse}
            onAddResearch={onAddResearch}
            submissions={submissions}
            onUpdateSubmission={handleUpdateSubmission}
            examAttempts={examAttempts}
            onUpdateExamAttempt={handleUpdateExamAttempt}
            curriculum={currentCurriculum}
            onUpdateCurriculum={handleUpdateCurriculum}
            practicalGrades={practicalGrades}
            onUpdatePracticalGrade={handleUpdatePracticalGrade}
            enrollments={enrollments}
            onApproveEnrollment={handleApproveEnrollment}
            onRejectEnrollment={handleRejectEnrollment}
            onArchiveEnrollment={handleArchiveEnrollment}
            onDeleteEnrollment={handleDeleteEnrollment}
            onArchiveAllProcessed={handleArchiveAllProcessed}
            onLogAudit={appendAuditLog}
          />
        )}

        {activeRole === 'admin' && (
          <AdminDashboard
            enrollments={enrollments}
            onApproveEnrollment={handleApproveEnrollment}
            onRejectEnrollment={handleRejectEnrollment}
            onArchiveEnrollment={handleArchiveEnrollment}
            onDeleteEnrollment={handleDeleteEnrollment}
            onArchiveAllProcessed={handleArchiveAllProcessed}
            certRequests={certRequests}
            onUpdateCertificate={handleUpdateCertificate}
            onIssueCertificate={handleIssueCertificate}
            usersList={propUsersList}
            onUpdateUserRole={onUpdateUserRole}
            onToggleUserStatus={onToggleUserStatus}
            researches={_researches}
            onAddResearch={onAddResearch}
            onUpdateResearch={onUpdateResearch}
            onDeleteResearch={onDeleteResearch}
            auditLogs={auditLogs}
            onLogAudit={appendAuditLog}
          />
        )}

      </div>
    </div>
  );
};
