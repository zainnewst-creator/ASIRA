import React, { useState } from 'react';
import { 
  Course,
  ResearchPaper,
  UserRole 
} from '../types';
import { 
  INITIAL_STUDENT_SUBMISSIONS, 
  INITIAL_EXAM_ATTEMPTS, 
  INITIAL_CURRICULUM,
  INITIAL_PENDING_ENROLLMENTS,
  INITIAL_CERT_REQUESTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_COURSES,
  INITIAL_RESEARCHES,
  MockStudentSubmission,
  MockExamAttemptForInstructor,
  MockCourseCurriculum,
  MockPendingEnrollment,
  MockCertificateRequest,
  MockAuditLogItem
} from '../data/mockData';
import { StudentDashboard } from '../components/lms/StudentDashboard';
import { InstructorDashboard } from '../components/lms/InstructorDashboard';
import { AdminDashboard } from '../components/lms/AdminDashboard';
import { 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  ArrowRight, 
  LogOut, 
  Sparkles,
  Layers
} from 'lucide-react';

interface LmsDashboardPreviewProps {
  courses?: Course[];
  onAddCourse?: (newCourse: Course) => void;
  onUpdateCourse?: (updatedCourse: Course) => void;
  researches?: ResearchPaper[];
  onAddResearch?: (newPaper: ResearchPaper) => void;
  userRole: UserRole;
  userName: string;
  onLogout: () => void;
  onBackToPortal: () => void;
}

export const LmsDashboardPreview: React.FC<LmsDashboardPreviewProps> = ({
  courses = INITIAL_COURSES,
  onAddCourse,
  onUpdateCourse,
  researches = INITIAL_RESEARCHES,
  onAddResearch,
  userRole: initialRole,
  userName: initialName,
  onLogout,
  onBackToPortal,
}) => {
  // الدور النشط للتجربة الحية (مع إمكانية التبديل السريع بين الأدوار)
  const [activeRole, setActiveRole] = useState<UserRole>(initialRole);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || 'course-1');

  // الحالة المركزية المشتركة بين الأدوار (Real-Time Synchronized State)
  const [submissions, setSubmissions] = useState<MockStudentSubmission[]>(INITIAL_STUDENT_SUBMISSIONS);
  const [examAttempts, setExamAttempts] = useState<MockExamAttemptForInstructor[]>(INITIAL_EXAM_ATTEMPTS);
  const [curriculum, setCurriculum] = useState<MockCourseCurriculum>(INITIAL_CURRICULUM);
  const [enrollments, setEnrollments] = useState<MockPendingEnrollment[]>(INITIAL_PENDING_ENROLLMENTS);
  const [certRequests, setCertRequests] = useState<MockCertificateRequest[]>(INITIAL_CERT_REQUESTS);
  const [auditLogs, setAuditLogs] = useState<MockAuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [practicalGrades, setPracticalGrades] = useState<Record<string, { score: number; notes: string }>>({
    'student-1': { score: 42, notes: 'أداء ممتاز في اختبار تحليل البيانات الإحصائية الحضوري' },
    'student-2': { score: 38, notes: 'جيد جداً مع ملاحظة طفيفة في صياغة الفرضية' },
  });

  // إضافة عملية إلى سجل التدقيق غير القابل للتعديل
  const appendAuditLog = (action: string, details: string) => {
    const actorName = activeRole === 'admin' 
      ? 'مدير المنصة العام (Admin)' 
      : activeRole === 'instructor' 
      ? 'د. إبراهيم يحيى (Instructor)' 
      : 'أحمد محمد الصالح (Student)';
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
  };

  // 3. اعتماد / تعديل درجة اختبار من قبل المدرس
  const handleUpdateExamAttempt = (updated: MockExamAttemptForInstructor) => {
    setExamAttempts((prev) => prev.map((a) => a.id === updated.id ? updated : a));
  };

  // 4. تعديل المنهج والدروس
  const handleUpdateCurriculum = (updated: MockCourseCurriculum) => {
    setCurriculum(updated);
  };

  // 5. تعديل درجة العملي الحضوري
  const handleUpdatePracticalGrade = (studentId: string, score: number, notes: string) => {
    setPracticalGrades((prev) => ({
      ...prev,
      [studentId]: { score, notes }
    }));
  };

  // 6. قبول طلب التحاق من قبل المدير
  const handleApproveEnrollment = (id: string) => {
    setEnrollments((prev) => prev.map((e) => e.id === id ? { ...e, status: 'approved' } : e));
  };

  // 7. رفض طلب التحاق من قبل المدير
  const handleRejectEnrollment = (id: string) => {
    setEnrollments((prev) => prev.map((e) => e.id === id ? { ...e, status: 'rejected' } : e));
  };

  // 8. إصدار وتوقيع شهادة من قبل المدير
  const handleIssueCertificate = (id: string, code: string, pdfUrl: string) => {
    setCertRequests((prev) =>
      prev.map((c) => c.id === id ? { ...c, status: 'issued', verificationCode: code, signedPdfUrl: pdfUrl } : c)
    );
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
              {activeRole === 'admin' ? 'الإدارة الأكاديمية والعمليات' : activeRole === 'instructor' ? 'المشرف: د. إبراهيم يحيى' : `مرحباً بك، ${initialName}`}
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

        {/* شريط تبديل الأدوار للتجربة الحية المتكاملة (Role Switcher Toolbar) */}
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
            <Sparkles size={18} color="var(--primary-600)" />
            <div>
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)', display: 'block' }}>
                تبديل الدور للتجربة الحية (Cross-Role Testing):
              </strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                جرب رصد المدرس للدرجة أو كتابة تعليق، ثم انتقل لدور الطالب لترى التعليق والدرجة مباشرة في صفحته!
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-subtle)', padding: '0.35rem', borderRadius: 'var(--radius-md)' }}>
            <button
              onClick={() => setActiveRole('student')}
              className={`btn ${activeRole === 'student' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
            >
              <GraduationCap size={15} />
              <span>تجربة دور الطالب</span>
            </button>

            <button
              onClick={() => setActiveRole('instructor')}
              className={`btn ${activeRole === 'instructor' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
            >
              <Users size={15} />
              <span>تجربة دور المدرس</span>
            </button>

            <button
              onClick={() => setActiveRole('admin')}
              className={`btn ${activeRole === 'admin' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
            >
              <ShieldCheck size={15} />
              <span>تجربة دور المدير</span>
            </button>
          </div>
        </div>

        {/* عرض اللوحة المناسبة حسب الدور النشط */}
        {activeRole === 'student' && (
          <StudentDashboard
            courses={courses}
            activeCourseId={selectedCourseId}
            onSelectCourseId={setSelectedCourseId}
            studentName={initialName}
            studentUid="student-1"
            submissions={submissions}
            onSubmitAssignment={handleSubmitAssignment}
            examAttempts={examAttempts}
            curriculum={curriculum}
            practicalGrades={practicalGrades}
            onLogAudit={appendAuditLog}
          />
        )}

        {activeRole === 'instructor' && (
          <InstructorDashboard
            courses={courses}
            activeCourseId={selectedCourseId}
            onSelectCourseId={setSelectedCourseId}
            onAddCourse={onAddCourse}
            onUpdateCourse={onUpdateCourse}
            onAddResearch={onAddResearch}
            submissions={submissions}
            onUpdateSubmission={handleUpdateSubmission}
            examAttempts={examAttempts}
            onUpdateExamAttempt={handleUpdateExamAttempt}
            curriculum={curriculum}
            onUpdateCurriculum={handleUpdateCurriculum}
            practicalGrades={practicalGrades}
            onUpdatePracticalGrade={handleUpdatePracticalGrade}
            onLogAudit={appendAuditLog}
          />
        )}

        {activeRole === 'admin' && (
          <AdminDashboard
            enrollments={enrollments}
            onApproveEnrollment={handleApproveEnrollment}
            onRejectEnrollment={handleRejectEnrollment}
            certRequests={certRequests}
            onIssueCertificate={handleIssueCertificate}
            auditLogs={auditLogs}
            onLogAudit={appendAuditLog}
          />
        )}

      </div>
    </div>
  );
};
