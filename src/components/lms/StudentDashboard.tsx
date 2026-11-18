import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Award, 
  FileText, 
  AlertCircle, 
  Send, 
  ExternalLink, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  GraduationCap, 
  RotateCcw,
  ShieldCheck,
  Download,
  PlayCircle,
  Edit3,
  Lock,
  Headphones
} from 'lucide-react';
import { 
  MockStudentSubmission, 
  MockExamAttemptForInstructor, 
  MockCourseCurriculum,
  MockCertificateRequest,
  MockPendingEnrollment,
  INITIAL_CURRICULUM,
  INITIAL_COURSES
} from '../../data/mockData';
import { Course } from '../../types';
import { AcademicCertificateModal } from './AcademicCertificateModal';
import { AudioLessonPlayer } from './AudioLessonPlayer';
import { sanitizeUrl, sanitizeExamForStudent, isTrustedStorageUrl } from '../../utils/security';

export interface StudentDashboardProps {
  courses?: Course[];
  pendingEnrollments?: MockPendingEnrollment[];
  activeCourseId?: string;
  onSelectCourseId?: (courseId: string) => void;
  studentName?: string;
  studentUid?: string;
  submissions?: MockStudentSubmission[];
  onSubmitAssignment?: (submission: MockStudentSubmission) => void;
  examAttempts?: MockExamAttemptForInstructor[];
  onSubmitExamAttempt?: (attempt: MockExamAttemptForInstructor) => void;
  curriculum?: MockCourseCurriculum;
  practicalGrades?: Record<string, { score: number; notes: string }>;
  certRequests?: MockCertificateRequest[];
  onRequestCertificate?: (courseId: string) => void;
  onNavigateTab?: (tab: string) => void;
  onLogAudit?: (action: string, details: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  courses = [],
  pendingEnrollments = [],
  activeCourseId: propActiveCourseId,
  onSelectCourseId,
  studentName = 'طالب أسيرا',
  studentUid = '',
  submissions: propSubmissions,
  onSubmitAssignment,
  examAttempts: propExamAttempts,
  onSubmitExamAttempt: _onSubmitExamAttempt,
  curriculum: propCurriculum,
  practicalGrades: propPracticalGrades,
  certRequests: propCertRequests,
  onRequestCertificate,
  onNavigateTab,
  onLogAudit,
}) => {
  const [activeTab, setActiveTab] = useState<'learn' | 'assignments' | 'exam' | 'transcript'>('learn');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(propActiveCourseId || null);

  // طلبات الشهادات الأكاديمية
  const [localCertRequests, setLocalCertRequests] = useState<MockCertificateRequest[]>(propCertRequests || []);
  const certRequests = propCertRequests || localCertRequests;
  const [requestFeedback, setRequestFeedback] = useState<string | null>(null);

  // الكورس الحالي المختار
  const currentCourse = selectedCourseId ? (courses.find((c) => c.id === selectedCourseId) || courses[0]) : null;

  // استخدام البيانات الممررة أو الافتراضية
  const [localSubmissions, setLocalSubmissions] = useState<MockStudentSubmission[]>(propSubmissions || []);
  const submissions = propSubmissions || localSubmissions;
  const examAttempts = propExamAttempts || [];
  const rawCurriculum = propCurriculum || INITIAL_CURRICULUM;
  const curriculum = React.useMemo(() => {
    return {
      ...rawCurriculum,
      modules: (rawCurriculum.modules || []).map((m) => ({
        ...m,
        exams: (m.exams || []).map((ex) => sanitizeExamForStudent(ex)),
      })),
    };
  }, [rawCurriculum]);
  const practicalGrades = propPracticalGrades || {};

  // تتبع التكليفات والاختبارات المنجزة لفتح الدروس اللاحقة فوراً
  const [submittedAssignmentIds, setSubmittedAssignmentIds] = useState<string[]>([]);
  const [completedExamIds, setCompletedExamIds] = useState<string[]>([]);

  // تكليف الطالب الحالي
  const studentSubmission = submissions.find((s) => s.studentUid === studentUid) || submissions[0];

  // محاولة اختبار الطالب الحالي
  const studentExamAttempt = examAttempts.find((a) => a.studentUid === studentUid) || examAttempts[0];

  // حالة مشغل الدروس ومتابعة المحاضرات المكتملة
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(() => {
    try {
      if (selectedCourseId && studentUid) {
        const saved = localStorage.getItem(`asira_completed_lessons_${studentUid}_${selectedCourseId}`);
        return saved ? JSON.parse(saved) : [];
      }
    } catch {
      // ignore
    }
    return [];
  });

  // مزامنة الدروس المكتملة عند تبديل الكورس أو عند تحديد درس جديد كمكتمل
  React.useEffect(() => {
    if (selectedCourseId && studentUid) {
      try {
        const saved = localStorage.getItem(`asira_completed_lessons_${studentUid}_${selectedCourseId}`);
        if (saved) {
          setCompletedLessonIds(JSON.parse(saved));
        } else {
          setCompletedLessonIds([]);
        }
      } catch {
        setCompletedLessonIds([]);
      }
    }
  }, [selectedCourseId, studentUid]);

  React.useEffect(() => {
    if (selectedCourseId && studentUid) {
      try {
        localStorage.setItem(`asira_completed_lessons_${studentUid}_${selectedCourseId}`, JSON.stringify(completedLessonIds));
      } catch {
        // ignore
      }
    }
  }, [completedLessonIds, selectedCourseId, studentUid]);

  // الأكورديون للوحدات الدراسية
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'mod-1': true,
    'mod-2': true,
    'mod-3': false,
  });

  const toggleModuleAccordion = (modId: string) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  // دفتر ملاحظات الطالب للمحاضرة الحالية (Autosaved to localStorage)
  const currentModule = curriculum.modules[currentModuleIndex] || curriculum.modules[0];
  const currentLesson = currentModule?.lessons[currentLessonIndex] || currentModule?.lessons[0];
  const [lectureNotes, setLectureNotes] = useState<string>('');
  const [notesSavedNotice, setNotesSavedNotice] = useState(false);

  useEffect(() => {
    if (currentLesson?.id) {
      const saved = localStorage.getItem(`asira_notes_${currentLesson.id}`) || '';
      setLectureNotes(saved);
    }
  }, [currentLesson?.id]);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setLectureNotes(text);
    if (currentLesson?.id) {
      localStorage.setItem(`asira_notes_${currentLesson.id}`, text);
      setNotesSavedNotice(true);
      setTimeout(() => setNotesSavedNotice(false), 2000);
    }
  };

  // نموذج تسليم التكليف
  const [assignmentInputLink, setAssignmentInputLink] = useState(studentSubmission?.driveFileUrl || '');
  const [studentNotesInput, setStudentNotesInput] = useState('');
  const [submitSuccessNotice, setSubmitSuccessNotice] = useState(false);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  // إشعار قفل المتطلبات الأكاديمية
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  // حالة الاختبار التفاعلي والأسئلة الثلاثة
  const [examSubmitted, setExamSubmitted] = useState(studentExamAttempt?.status === 'approved');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({
    q1: 'A',
    q2: 'A',
    q3: 'A',
  });
  const [examTimer, setExamTimer] = useState<number>(1455); // ~24 minutes
  const [examCalculatedScore, setExamCalculatedScore] = useState<number>(studentExamAttempt?.calculatedScore || 28);

  // تسليم الاختبار التفاعلي - يفتح الدرس الجديد فوراً
  const handleExamSubmit = () => {
    let score = 0;
    if (selectedAnswers.q1 === 'A') score += 10;
    if (selectedAnswers.q2 === 'A') score += 10;
    if (selectedAnswers.q3 === 'A') score += 10;

    const firstExam = curriculum.modules.flatMap((m) => m.exams || [])[0];
    if (firstExam?.id) {
      setCompletedExamIds((prev) => Array.from(new Set([...prev, firstExam.id])));
    }

    setExamCalculatedScore(score);
    setExamSubmitted(true);

    if (onLogAudit) {
      onLogAudit('تسليم اختبار نظري', `قام الطالب (${studentName}) بتسليم محاولة اختبار وحصل مبدئياً على ${score}/30 وتم فتح الدرس التالي فوراً`);
    }
  };

  // تسليم تلقائي عند نفاد الوقت المحدد للاختبار - يفتح الدرس الجديد فوراً
  const handleAutoSubmitOnTimeOut = () => {
    let score = 0;
    if (selectedAnswers.q1 === 'A') score += 10;
    if (selectedAnswers.q2 === 'A') score += 10;
    if (selectedAnswers.q3 === 'A') score += 10;

    const firstExam = curriculum.modules.flatMap((m) => m.exams || [])[0];
    if (firstExam?.id) {
      setCompletedExamIds((prev) => Array.from(new Set([...prev, firstExam.id])));
    }

    setExamCalculatedScore(score);
    setExamSubmitted(true);
    alert('⏱️ انتهى وقت الاختبار المحدد تماماً! تم تسليم إجاباتك تلقائياً للحفاظ على نتيجتك وتم فتح المحاضرة التالية لك.');

    if (onLogAudit) {
      onLogAudit('تسليم اختبار تلقائي لانتهاء الوقت', `تم تسليم اختبار الطالب (${studentName}) تلقائياً وحصل على ${score}/30`);
    }
  };

  // مؤقت الاختبار التنازلي التفاعلي
  useEffect(() => {
    if (activeTab === 'exam' && !examSubmitted && examTimer > 0) {
      const timer = setInterval(() => {
        setExamTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmitOnTimeOut();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeTab, examSubmitted, examTimer]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // نافذة معاينة الشهادة المعتمدة
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  // تسطيح عناصر الكورس بالكامل لحساب التتابع والتسلسل الأكاديمي الإلزامي
  interface FlattenedItem {
    type: 'lesson' | 'assignment' | 'exam';
    id: string;
    title: string;
    moduleIndex: number;
    subIndex: number;
    moduleTitle: string;
    isModuleComingSoon: boolean;
    isCompleted: boolean;
    isLocked: boolean;
    prerequisiteTitle?: string;
  }

  const flattenedCourseItems: FlattenedItem[] = [];
  (curriculum.modules || []).forEach((mod, mIdx) => {
    const isModComingSoon = mod.status === 'coming_soon' || currentCourse?.status === 'coming_soon';

    // 1. المحاضرات والدروس
    (mod.lessons || []).forEach((les, lIdx) => {
      flattenedCourseItems.push({
        type: 'lesson',
        id: les.id,
        title: les.title,
        moduleIndex: mIdx,
        subIndex: lIdx,
        moduleTitle: mod.title,
        isModuleComingSoon: isModComingSoon,
        isCompleted: completedLessonIds.includes(les.id),
        isLocked: false,
      });
    });

    // 2. التكليفات العملية: بمجرد رفع وتسليم أول ملف، يفتح الدرس التالي حتى لو كان بانتظار تصحيح ومراجعة أو مطلوب تعديل
    (mod.assignments || []).forEach((asg, aIdx) => {
      const isCompleted =
        submittedAssignmentIds.includes(asg.id) ||
        submissions.some((s) => {
          const titleMatch =
            s.assignmentTitle === asg.title ||
            s.assignmentTitle.includes(asg.title) ||
            asg.title.includes(s.assignmentTitle);
          const hasUploadedFileOrStatus =
            Boolean(s.driveFileUrl) ||
            s.status === 'submitted' ||
            s.status === 'graded' ||
            s.status === 'revision_required';
          return titleMatch && hasUploadedFileOrStatus;
        });

      flattenedCourseItems.push({
        type: 'assignment',
        id: asg.id,
        title: asg.title,
        moduleIndex: mIdx,
        subIndex: aIdx,
        moduleTitle: mod.title,
        isModuleComingSoon: isModComingSoon,
        isCompleted,
        isLocked: false,
      });
    });

    // 3. الاختبارات والتقييمات: أول ما يخلص الاختبار يفتح له الدرس الجديد فوراً
    (mod.exams || []).forEach((ex, eIdx) => {
      const isCompleted =
        completedExamIds.includes(ex.id) ||
        examSubmitted ||
        examAttempts.some((a) => {
          const titleMatch =
            a.examTitle === ex.title ||
            a.examTitle.includes(ex.title) ||
            ex.title.includes(a.examTitle);
          return (
            titleMatch &&
            (a.status === 'approved' ||
              a.calculatedScore !== undefined ||
              a.officialGrade !== undefined)
          );
        });

      flattenedCourseItems.push({
        type: 'exam',
        id: ex.id,
        title: ex.title,
        moduleIndex: mIdx,
        subIndex: eIdx,
        moduleTitle: mod.title,
        isModuleComingSoon: isModComingSoon,
        isCompleted,
        isLocked: false,
      });
    });
  });

  // تطبيق القفل التسلسلي:
  // العنصر الأول متاح ما لم تكن الوحدة قريباً
  // أي عنصر لاحق يقفل إذا لم يكتمل العنصر الذي قبله مباشرة
  let previousItemCompleted = true;
  for (let i = 0; i < flattenedCourseItems.length; i++) {
    const item = flattenedCourseItems[i];
    if (i === 0) {
      item.isLocked = item.isModuleComingSoon;
      if (item.isModuleComingSoon) {
        item.prerequisiteTitle = 'المحتوى قيد الإعداد الأكاديمي (قريباً)';
      }
    } else {
      const prev = flattenedCourseItems[i - 1];
      if (item.isModuleComingSoon) {
        item.isLocked = true;
        item.prerequisiteTitle = 'هذه الوحدة قيد الإعداد الأكاديمي (قريباً)';
      } else if (!previousItemCompleted) {
        item.isLocked = true;
        item.prerequisiteTitle = prev.title;
      }
    }

    if (!item.isCompleted) {
      previousItemCompleted = false;
    }
  }

  // التحقق من حالة الدرس الحالي
  const currentFlattenedLesson = flattenedCourseItems.find(
    (item) => item.type === 'lesson' && item.id === currentLesson?.id
  );
  const isCurrentLessonLocked = currentFlattenedLesson?.isLocked || false;
  const currentLessonPrerequisite = currentFlattenedLesson?.prerequisiteTitle || '';

  // حساب نسبة التقدم في الكورس
  const totalLessonsCount = curriculum.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const progressPercentage = Math.round((completedLessonIds.length / (totalLessonsCount || 1)) * 100);

  // تبديل الكورس النشط
  const handleSelectCourse = (id: string) => {
    setSelectedCourseId(id);
    if (onSelectCourseId) onSelectCourseId(id);
  };

  // تبديل إكمال الدرس
  const toggleLessonCompletion = (lessonId: string) => {
    if (completedLessonIds.includes(lessonId)) {
      setCompletedLessonIds((prev) => prev.filter((id) => id !== lessonId));
    } else {
      setCompletedLessonIds((prev) => [...prev, lessonId]);
      if (onLogAudit) {
        onLogAudit('إكمال درس تعليمي', `أكمل الطالب (${studentName}) الدرس: ${currentLesson?.title}`);
      }
    }
  };

  // تسليم التكليف
  const handleAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAssignmentError(null);
    if (!assignmentInputLink.trim()) return;

    if (!isTrustedStorageUrl(assignmentInputLink.trim())) {
      setAssignmentError('يرجى إدخال رابط مشاركة صالح يبدأ بـ https:// من Google Drive أو Google Docs. (تنبيه: فحص المنصة يتحقق فقط من صحة نطاق الرابط، ولا يضمن وجود الملف أو إمكانية وصول المشرف إليه؛ يرجى التأكد بنفسك من فتح صلاحية المشاهدة Viewer لأي شخص لديه الرابط).');
      return;
    }

    // استخراج التكليف المرتبط في مديول الكورس
    const firstAsg = curriculum.modules.flatMap((m) => m.assignments || [])[0];
    const targetTitle = firstAsg?.title || studentSubmission?.assignmentTitle || 'صياغة بروتوكول بحثي بنظام PICO وتحديد الفرضيات';
    const targetId = firstAsg?.id || 'asg-1';

    const nextVersion = studentSubmission ? (studentSubmission.version || 1) + 1 : 1;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updatedSub: MockStudentSubmission = {
      ...studentSubmission,
      id: studentSubmission?.id || `sub-${Date.now()}`,
      studentUid,
      studentName,
      university: 'باحث أكاديمي',
      assignmentTitle: targetTitle,
      version: nextVersion,
      driveFileUrl: assignmentInputLink.trim(),
      submittedAt: formattedDate,
      status: 'submitted',
      grade: undefined,
      instructorFeedback: undefined,
      revisionNotes: studentNotesInput ? `ملاحظة الطالب: ${studentNotesInput}` : undefined,
    };

    setSubmittedAssignmentIds((prev) => Array.from(new Set([...prev, targetId])));
    setLocalSubmissions((prev) => prev.map((s) => s.id === updatedSub.id ? updatedSub : s));

    if (onSubmitAssignment) {
      onSubmitAssignment(updatedSub);
    }

    if (onLogAudit) {
      onLogAudit('تسليم تكليف أكاديمي', `قام الطالب (${studentName}) بتسليم النسخة v${nextVersion} بكورس ${currentCourse?.code} وتم فتح الدرس التالي فوراً`);
    }

    setSubmitSuccessNotice(true);
    setTimeout(() => setSubmitSuccessNotice(false), 6000);
  };

  // درجات السجل الأكاديمي
  const assignmentScore = studentSubmission?.grade !== undefined ? studentSubmission.grade : 0;
  const examScore = studentExamAttempt?.officialGrade !== undefined ? studentExamAttempt.officialGrade : (examSubmitted ? examCalculatedScore : 0);
  const practicalScore = practicalGrades[studentUid]?.score || 0;
  const totalScore = assignmentScore + examScore + practicalScore;

  // ========================================================
  // 1. نافذة المقررات المسجلة (المربعات ونظرة عامة بدون أشرطة مشتتة)
  // ========================================================
  if (!selectedCourseId || !currentCourse) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* الترويسة الأنيقة لشاشة دوراتي */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              دوراتي ومساراتي الأكاديمية المسجلة
            </h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              مرحباً بك، د. {studentName} — اختر الدورة لمتابعة المحاضرات، حل التكليفات، أو أداء الاختبارات.
            </p>
          </div>
          {onNavigateTab && (
            <button
              onClick={() => onNavigateTab('courses')}
              className="btn btn-outline"
              style={{ fontSize: '0.85rem', borderRadius: 'var(--radius-full)' }}
            >
              <BookOpen size={15} />
              <span>دليل جميع الكورسات المتاحة</span>
            </button>
          )}
        </div>

        {/* إشعار بطلبات الالتحاق قيد الانتظار إن وجدت */}
        {pendingEnrollments && pendingEnrollments.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              طلبات الالتحاق قيد المراجعة والاعتماد:
            </h4>
            {pendingEnrollments.map((pe) => (
              <div
                key={pe.id}
                className="alert-box alert-box-warning"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}
              >
                <div>
                  <strong>{pe.courseTitle}</strong>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    تم تقديم الطلب بتاريخ {pe.requestedAt || 'اليوم'} • الحالة: بانتظار اعتماد الإدارة لتفعيل الدروس
                  </div>
                </div>
                <span className="badge badge-gold">⏳ قيد المراجعة</span>
              </div>
            ))}
          </div>
        )}

        {/* إذا لم يكن الطالب مسجلاً في أي كورس بعد */}
        {courses.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', maxWidth: '620px', margin: '2rem auto' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--primary-100)',
              color: 'var(--primary-600)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <GraduationCap size={34} />
            </div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
              أنت لست مسجلاً في أي كورس حالياً
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '2rem' }}>
              تفضل بالاطلاع على دليل المسارات والكورسات الأكاديمية المتاحة في منتدى أسيرا، واختر الدورة المناسبة وقدم طلب التحاق ليتم تفعيله لك من قبل إدارة المنتدى.
            </p>
            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('courses')}
                className="btn btn-primary"
                style={{ padding: '0.85rem 2rem', fontSize: '1rem', borderRadius: 'var(--radius-full)', margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span>استكشاف الكورسات والتقديم على دورة</span>
                <ChevronLeft size={18} />
              </button>
            )}
          </div>
        ) : (
          /* شبكة المربعات (الكورسات المسجلة) */
          <div className="grid-2">
            {courses.map((course) => {
              const isComingSoon = course.status === 'coming_soon';

              return (
                <div key={course.id} className="card" style={{ border: '1px solid var(--border-color)', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <span className={`badge ${isComingSoon ? 'badge-gold' : 'badge-emerald'}`}>
                      {isComingSoon ? '⏳ قريباً (قيد الإعداد)' : 'كورس مسجل ومعتمد'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 700 }}>
                      {course.code}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                    {course.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.6' }}>
                    {course.summary}
                  </p>

                  <div style={{ marginBottom: '1.25rem', padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                      <span>نسبة الإنجاز في المساق:</span>
                      <strong>{isComingSoon ? '0%' : '40%'}</strong>
                    </div>
                    <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{ width: isComingSoon ? '0%' : '40%', height: '100%', background: 'linear-gradient(90deg, #10b981, #2563eb)' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {isComingSoon ? (
                      <button
                        disabled
                        className="btn btn-outline"
                        style={{ flex: 1, fontSize: '0.85rem', opacity: 0.65, cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                      >
                        <Lock size={14} />
                        <span>قريباً (المحتوى قيد التجهيز)</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setSelectedCourseId(course.id);
                            setActiveTab('learn');
                            if (onSelectCourseId) onSelectCourseId(course.id);
                          }}
                          className="btn btn-primary"
                          style={{ flex: 1, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
                        >
                          <span>دخول الكورس ومتابعة التعلم</span>
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCourseId(course.id);
                            setActiveTab('assignments');
                            if (onSelectCourseId) onSelectCourseId(course.id);
                          }}
                          className="btn btn-outline"
                          style={{ fontSize: '0.85rem' }}
                        >
                          <span>التكليفات</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCourseId(course.id);
                            setActiveTab('transcript');
                            if (onSelectCourseId) onSelectCourseId(course.id);
                          }}
                          className="btn btn-outline"
                          style={{ fontSize: '0.85rem' }}
                        >
                          <span>السجل</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ========================================================
  // 2. نافذة الكورس المختار (داخل الكورس بنوافذ منسابة)
  // ========================================================
  return (
    <div>
      {/* شريط رأس الكورس مع زر العودة الأنيق */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1.25rem',
        marginBottom: '1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedCourseId(null)}
            className="btn btn-outline"
            style={{ fontSize: '0.82rem', padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <ChevronRight size={16} />
            <span>← العودة إلى قائمة مقرراتي</span>
          </button>
          <span className="badge badge-primary" style={{ fontFamily: 'monospace' }}>
            {currentCourse.code}
          </span>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {currentCourse.title}
          </span>
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          المشرف الأكاديمي: <strong>{currentCourse.instructorNames?.join(', ') || 'المشرف الأكاديمي'}</strong>
        </div>
      </div>

      {/* تبويبات خاصة بهذا الكورس فقط */}
      <div className="lms-tabs-bar" style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('learn')}
          className={`btn lms-tab-btn ${activeTab === 'learn' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <PlayCircle size={16} />
          <span>المحاضرات ومشغل الدروس</span>
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`btn lms-tab-btn ${activeTab === 'assignments' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <FileText size={16} />
          <span>التكليفات وملاحظات المشرف</span>
        </button>

        <button
          onClick={() => setActiveTab('exam')}
          className={`btn lms-tab-btn ${activeTab === 'exam' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <CheckCircle2 size={16} />
          <span>الاختبارات الإلكترونية (MCQ)</span>
        </button>

        <button
          onClick={() => setActiveTab('transcript')}
          className={`btn lms-tab-btn ${activeTab === 'transcript' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <GraduationCap size={16} />
          <span>السجل الأكاديمي والشهادة</span>
        </button>
      </div>

      {/* إشعار قفل المتطلبات الأكاديمية */}
      {lockedNotice && (
        <div style={{
          padding: '0.85rem 1.25rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-main)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem',
          fontSize: '0.88rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Lock size={18} color="#ef4444" />
            <span style={{ fontWeight: 700 }}>{lockedNotice}</span>
          </div>
          <button onClick={() => setLockedNotice(null)} className="btn btn-ghost" style={{ padding: '0.2rem 0.5rem' }}>✕</button>
        </div>
      )}

      {/* 2. تبويب: مشغل الدروس والمحاضرات (Real YouTube Iframe & Notebook) */}
      {activeTab === 'learn' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          {/* مشغل الفيديو والمحتوى */}
          <div className="card" style={{ padding: '1.5rem' }}>
            {/* مشغل الفيديو أو شاشة القفل الأكاديمي الإلزامي */}
            {isCurrentLessonLocked ? (
              <div style={{ 
                width: '100%', 
                aspectRatio: '16/9', 
                background: 'linear-gradient(135deg, #0b1120 0%, #1e1b4b 100%)', 
                borderRadius: 'var(--radius-md)', 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center',
                border: '2px dashed rgba(239, 68, 68, 0.4)',
                marginBottom: '1.25rem', 
                boxShadow: 'var(--shadow-md)'
              }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Lock size={30} color="#ef4444" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
                  هذا الدرس مقفل بالتسلسل الأكاديمي
                </h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.88rem', maxWidth: '480px', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                  لا يمكن فتح هذا الدرس حتى يتم إكمال المتطلب الأكاديمي السابق بنجاح:
                  <br />
                  <strong style={{ color: '#f59e0b', fontSize: '0.95rem', display: 'inline-block', marginTop: '0.4rem' }}>
                    "{currentLessonPrerequisite || 'المتطلب الأكاديمي السابق'}"
                  </strong>
                </p>
                {flattenedCourseItems.find((f) => !f.isCompleted && !f.isLocked) && (
                  <button
                    onClick={() => {
                      const firstAvailable = flattenedCourseItems.find((f) => !f.isCompleted && !f.isLocked);
                      if (firstAvailable) {
                        if (firstAvailable.type === 'lesson') {
                          setCurrentModuleIndex(firstAvailable.moduleIndex);
                          setCurrentLessonIndex(firstAvailable.subIndex);
                        } else if (firstAvailable.type === 'assignment') {
                          setActiveTab('assignments');
                        } else if (firstAvailable.type === 'exam') {
                          setActiveTab('exam');
                        }
                      }
                    }}
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem' }}
                  >
                    <span>الانتقال للمتطلب الأكاديمي المطلوب إكماله</span>
                    <ChevronLeft size={15} />
                  </button>
                )}
              </div>
            ) : currentLesson?.mediaType === 'audio' || (currentLesson?.audioUrl || currentLesson?.driveAudioUrl) ? (
              <AudioLessonPlayer
                title={currentLesson.title}
                courseTitle={currentCourse?.title}
                instructorName={currentCourse?.instructorNames?.[0]}
                audioUrl={currentLesson.audioUrl}
                driveAudioUrl={currentLesson.driveAudioUrl}
                durationMinutes={currentLesson.durationMinutes}
              />
            ) : (
              <div style={{ 
                width: '100%', 
                aspectRatio: '16/9', 
                background: '#050a18', 
                borderRadius: 'var(--radius-md)', 
                overflow: 'hidden', 
                marginBottom: '1.25rem', 
                boxShadow: 'var(--shadow-md)',
                position: 'relative'
              }}>
                {currentLesson?.youtubeId ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${currentLesson.youtubeId}?rel=0&modestbranding=1`}
                    title={currentLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#fff', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <PlayCircle size={56} color="#3b82f6" style={{ margin: '0 auto 0.75rem', opacity: 0.9 }} />
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.4rem' }}>
                      {currentLesson?.title || 'المحاضرة التعليمية'}
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
                      كورس: {currentCourse?.title}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>
                  {currentModule?.title}
                </span>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0.25rem 0' }}>
                  {currentLesson?.title}
                </h2>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', marginTop: '0.25rem' }}>
                  <span>المدة: {currentLesson?.durationMinutes} دقيقة</span>
                  <span>المحاضر: {currentCourse?.instructorNames?.[0] || 'المشرف الأكاديمي'}</span>
                </div>
              </div>

              <button
                disabled={isCurrentLessonLocked}
                onClick={() => currentLesson && toggleLessonCompletion(currentLesson.id)}
                className={`btn ${currentLesson && completedLessonIds.includes(currentLesson.id) ? 'btn-accent' : 'btn-outline'}`}
                style={{ padding: '0.55rem 1.15rem', opacity: isCurrentLessonLocked ? 0.5 : 1 }}
              >
                <CheckCircle2 size={16} />
                <span>
                  {currentLesson && completedLessonIds.includes(currentLesson.id) ? 'تم إكمال الدرس ✓' : 'تحديد كمكتمل'}
                </span>
              </button>
            </div>

            {/* ملفات Google Drive */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ExternalLink size={15} color="var(--primary-600)" />
                <span>ملفات وسلايدات المحاضرة (Google Drive):</span>
              </h4>
              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <a
                  href={sanitizeUrl(currentLesson?.drivePdfUrl || 'https://drive.google.com')}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                  style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
                >
                  <FileText size={14} />
                  <span>سلايدات المحاضرة وملاحظات الشرح (PDF)</span>
                </a>
              </div>
            </div>

            {/* دفتر ملاحظات الطالب الأكاديمية (Auto-saved notepad) */}
            <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <strong style={{ fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
                  <Edit3 size={15} color="var(--primary-600)" />
                  <span>دفتر ملاحظاتي الأكاديمية لهذا الدرس:</span>
                </strong>
                <span style={{ fontSize: '0.75rem', color: notesSavedNotice ? 'var(--accent-emerald)' : 'var(--text-muted)' }}>
                  {notesSavedNotice ? '✓ تم الحفظ تلقائياً في المتصفح' : 'حفظ تلقائي فوري'}
                </span>
              </div>
              <textarea
                rows={3}
                value={lectureNotes}
                onChange={handleNotesChange}
                placeholder="دون أهم النقاط والأسئلة واستفسارات البحث العلمي هنا أثناء مشاهدة المحاضرة..."
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.85rem', fontFamily: 'var(--font-arabic)' }}
              />
            </div>

            {/* التنقل بين الدروس مع التحقق التسلسلي */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <button
                disabled={currentLessonIndex === 0 && currentModuleIndex === 0}
                onClick={() => {
                  if (currentLessonIndex > 0) setCurrentLessonIndex(currentLessonIndex - 1);
                  else if (currentModuleIndex > 0) {
                    setCurrentModuleIndex(currentModuleIndex - 1);
                    setCurrentLessonIndex(curriculum.modules[currentModuleIndex - 1].lessons.length - 1);
                  }
                }}
                className="btn btn-ghost"
                style={{ fontSize: '0.85rem' }}
              >
                <ChevronLeft size={15} />
                <span>الدرس السابق</span>
              </button>

              <button
                onClick={() => {
                  if (currentLesson && !completedLessonIds.includes(currentLesson.id)) {
                    setLockedNotice(`🔒 للتقدم للدرس التالي، يرجى إكمال الدرس الحالي ("${currentLesson.title}") أولاً بالضغط على زر "تحديد كمكتمل".`);
                    return;
                  }

                  if (currentLessonIndex < currentModule.lessons.length - 1) {
                    const nextLes = currentModule.lessons[currentLessonIndex + 1];
                    const nextLocked = flattenedCourseItems.find((f) => f.type === 'lesson' && f.id === nextLes?.id)?.isLocked;
                    if (nextLocked) {
                      setLockedNotice(`🔒 الدرس التالي مقفل حالياً. المتطلب: "${currentLesson?.title}".`);
                      return;
                    }
                    setCurrentLessonIndex(currentLessonIndex + 1);
                  } else if (currentModuleIndex < curriculum.modules.length - 1) {
                    const nextMod = curriculum.modules[currentModuleIndex + 1];
                    const firstLes = nextMod?.lessons?.[0];
                    const nextLocked = firstLes ? flattenedCourseItems.find((f) => f.type === 'lesson' && f.id === firstLes?.id)?.isLocked : false;
                    if (nextLocked) {
                      setLockedNotice(`🔒 محتوى الوحدة التالية مقفل حالياً حتى إكمال كافة متطلبات الوحدة الحالية.`);
                      return;
                    }
                    setCurrentModuleIndex(currentModuleIndex + 1);
                    setCurrentLessonIndex(0);
                  }
                }}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem' }}
              >
                <span>الدرس التالي</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* شجرة المنهج والوحدات (Sidebar with Accordion & Sequential Locking) */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              فهرس محاضرات وعناصر الكورس
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {curriculum.modules.map((mod, mIdx) => {
                const isExpanded = expandedModules[mod.id] ?? true;
                const totalModItems = (mod.lessons?.length || 0) + (mod.assignments?.length || 0) + (mod.exams?.length || 0);

                return (
                  <div key={mod.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                    <button
                      onClick={() => toggleModuleAccordion(mod.id)}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        background: 'var(--bg-subtle)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        color: 'var(--text-main)',
                        textAlign: 'right'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span>{mod.title}</span>
                        {mod.status === 'coming_soon' ? (
                          <span className="badge badge-gold" style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem' }}>⏳ قريباً</span>
                        ) : (
                          <span className="badge badge-primary" style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem' }}>{totalModItems} عنصر</span>
                        )}
                      </div>
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>

                    {isExpanded && (
                      <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', background: 'var(--bg-card)' }}>
                        {/* 1. قائمة الدروس */}
                        {mod.lessons.map((les, lIdx) => {
                          const isCurrent = mIdx === currentModuleIndex && lIdx === currentLessonIndex;
                          const fItem = flattenedCourseItems.find((f) => f.type === 'lesson' && f.id === les.id);
                          const isLocked = fItem?.isLocked || false;
                          const isCompleted = completedLessonIds.includes(les.id);

                          return (
                            <button
                              key={les.id}
                              onClick={() => {
                                if (isLocked) {
                                  setLockedNotice(`🔒 هذا الدرس مقفل! يتطلب إكمال: "${fItem?.prerequisiteTitle || 'المتطلب السابق'}" أولاً.`);
                                  return;
                                }
                                setCurrentModuleIndex(mIdx);
                                setCurrentLessonIndex(lIdx);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.55rem 0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                border: isCurrent ? '1px solid var(--primary-600)' : '1px solid transparent',
                                background: isCurrent ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                                color: isLocked ? 'var(--text-muted)' : isCurrent ? 'var(--primary-600)' : 'var(--text-main)',
                                fontSize: '0.82rem',
                                textAlign: 'right',
                                cursor: isLocked ? 'not-allowed' : 'pointer',
                                opacity: isLocked ? 0.75 : 1,
                              }}
                              title={isLocked ? `مقفل: يتطلب إكمال ${fItem?.prerequisiteTitle}` : les.title}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden' }}>
                                {isLocked ? (
                                  <Lock size={14} color="#ef4444" />
                                ) : isCompleted ? (
                                  <CheckCircle2 size={15} color="#10b981" />
                                ) : (les.mediaType === 'audio' || les.audioUrl || les.driveAudioUrl) ? (
                                  <Headphones size={15} color={isCurrent ? 'var(--primary-600)' : '#3b82f6'} />
                                ) : (
                                  <PlayCircle size={15} color={isCurrent ? 'var(--primary-600)' : 'var(--text-subtle)'} />
                                )}
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: isCurrent ? 700 : 500 }}>
                                  {les.title}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.72rem', color: isLocked ? '#ef4444' : 'var(--text-muted)' }}>
                                {isLocked ? 'مقفل 🔒' : `${les.durationMinutes} د`}
                              </span>
                            </button>
                          );
                        })}

                        {/* 2. قائمة التكليفات في المديول */}
                        {mod.assignments && mod.assignments.length > 0 && mod.assignments.map((asg) => {
                          const fItem = flattenedCourseItems.find((f) => f.type === 'assignment' && f.id === asg.id);
                          const isLocked = fItem?.isLocked || false;
                          const isCompleted = fItem?.isCompleted || false;

                          return (
                            <button
                              key={asg.id}
                              onClick={() => {
                                if (isLocked) {
                                  setLockedNotice(`🔒 هذا التكليف مقفل! يتطلب إكمال: "${fItem?.prerequisiteTitle || 'المتطلب السابق'}" أولاً.`);
                                  return;
                                }
                                setActiveTab('assignments');
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.5rem 0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-color)',
                                background: isLocked ? 'rgba(239, 68, 68, 0.04)' : 'rgba(16, 185, 129, 0.05)',
                                color: isLocked ? 'var(--text-muted)' : 'var(--text-main)',
                                fontSize: '0.8rem',
                                textAlign: 'right',
                                cursor: isLocked ? 'not-allowed' : 'pointer',
                                opacity: isLocked ? 0.75 : 1,
                              }}
                              title={isLocked ? `مقفل: يتطلب إكمال ${fItem?.prerequisiteTitle}` : asg.title}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden' }}>
                                {isLocked ? (
                                  <Lock size={13} color="#ef4444" />
                                ) : isCompleted ? (
                                  <CheckCircle2 size={14} color="#10b981" />
                                ) : (
                                  <FileText size={14} color="var(--accent-emerald)" />
                                )}
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>
                                  📄 {asg.title}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.7rem', color: isLocked ? '#ef4444' : 'var(--accent-emerald)' }}>
                                {isLocked ? 'مقفل 🔒' : 'تكليف عملي'}
                              </span>
                            </button>
                          );
                        })}

                        {/* 3. قائمة الاختبارات في المديول */}
                        {mod.exams && mod.exams.length > 0 && mod.exams.map((ex) => {
                          const fItem = flattenedCourseItems.find((f) => f.type === 'exam' && f.id === ex.id);
                          const isLocked = fItem?.isLocked || false;
                          const isCompleted = fItem?.isCompleted || false;

                          return (
                            <button
                              key={ex.id}
                              onClick={() => {
                                if (isLocked) {
                                  setLockedNotice(`🔒 هذا الاختبار مقفل! يتطلب إكمال: "${fItem?.prerequisiteTitle || 'المتطلب السابق'}" أولاً.`);
                                  return;
                                }
                                setActiveTab('exam');
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.5rem 0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-color)',
                                background: isLocked ? 'rgba(239, 68, 68, 0.04)' : 'rgba(245, 158, 11, 0.06)',
                                color: isLocked ? 'var(--text-muted)' : 'var(--text-main)',
                                fontSize: '0.8rem',
                                textAlign: 'right',
                                cursor: isLocked ? 'not-allowed' : 'pointer',
                                opacity: isLocked ? 0.75 : 1,
                              }}
                              title={isLocked ? `مقفل: يتطلب إكمال ${fItem?.prerequisiteTitle}` : ex.title}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden' }}>
                                {isLocked ? (
                                  <Lock size={13} color="#ef4444" />
                                ) : isCompleted ? (
                                  <CheckCircle2 size={14} color="#10b981" />
                                ) : (
                                  <Award size={14} color="var(--accent-gold)" />
                                )}
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 600 }}>
                                  🏆 {ex.title}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.7rem', color: isLocked ? '#ef4444' : 'var(--accent-gold)' }}>
                                {isLocked ? 'مقفل 🔒' : 'اختبار'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. تبويب: تسليم التكليفات وملاحظات المشرف */}
      {activeTab === 'assignments' && (
        <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div>
                <span className="badge badge-primary">كورس: {currentCourse?.title}</span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.35rem' }}>
                  {studentSubmission?.assignmentTitle || 'صياغة بروتوكول بحثي وتحديد استراتيجية MeSH'}
                </h2>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <span className="badge badge-outline">النسخة v{studentSubmission?.version || 1}</span>
                <span className="badge badge-emerald" style={{ fontSize: '0.85rem' }}>الدرجة: {studentSubmission?.maxScore || 20} درجة</span>
              </div>
            </div>

            {/* مكان عرض تعليق وملاحظات المشرف الأكاديمي البارز */}
            {studentSubmission?.status === 'graded' && (
              <div style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.08)', border: '2px solid rgba(16, 185, 129, 0.4)', borderRadius: 'var(--radius-md)', margin: '1.25rem 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={22} color="#10b981" />
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#065f46' }}>
                      تم تصحيح واعتماد التكليف رسمياً من المشرف
                    </h4>
                  </div>
                  <div style={{ background: '#10b981', color: '#fff', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-md)', fontWeight: 800, fontSize: '1.2rem' }}>
                    {studentSubmission.grade} / {studentSubmission.maxScore}
                  </div>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <strong style={{ display: 'block', fontSize: '0.88rem', color: 'var(--primary-700)', marginBottom: '0.3rem' }}>
                    ملاحظات وتعليق المشرف الأكاديمي:
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-main)', fontStyle: 'italic' }}>
                    "{studentSubmission.instructorFeedback || 'عمل متميز جداً واستيفاء كامل لجميع معايير البروتوكول البحثي الدولي.'}"
                  </p>
                </div>
              </div>
            )}

            {studentSubmission?.status === 'revision_required' && (
              <div style={{ padding: '1.25rem', background: 'rgba(239, 68, 68, 0.08)', border: '2px solid rgba(239, 68, 68, 0.4)', borderRadius: 'var(--radius-md)', margin: '1.25rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <AlertCircle size={22} color="#ef4444" />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#b91c1c' }}>
                    تنبيه: مطلوب إعادة تسليم وتعديل العمل (Revision Required)
                  </h4>
                </div>
                <div style={{ background: 'var(--bg-card)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  <strong style={{ display: 'block', fontSize: '0.85rem', color: '#b91c1c', marginBottom: '0.2rem' }}>
                    تعليمات المشرف المطلوب تعديلها:
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>
                    {studentSubmission.revisionNotes || studentSubmission.instructorFeedback}
                  </p>
                </div>
              </div>
            )}

            {/* نموذج تسليم الرابط وملاحظات الطالب */}
            <form onSubmit={handleAssignmentSubmit} style={{ padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginTop: '1rem' }}>
              <div style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                  خطوات تسليم التكليف عبر Google Drive:
                </h4>
                <ol style={{ paddingRight: '1.25rem', margin: '0 0 0.75rem', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.8' }}>
                  <li>ارفع ملف الحل (PDF أو Word) إلى حسابك الشخصي في <strong>Google Drive</strong>.</li>
                  <li>انقر بزر الفأرة الأيمن على الملف، ثم اختر <strong>مشاركة (Share)</strong>.</li>
                  <li>من خيار الوصول العام (General access)، غيّر الحالة إلى <strong>"أي شخص لديه الرابط" (Anyone with the link)</strong>، وتأكد من تعيين الدور إلى <strong>"مشاهد" (Viewer)</strong> حتى يتمكن المشرف من فتح الملف وتصحيحه.</li>
                  <li>انسخ الرابط الصحيح (Copy link) والصقه في الخانة أدناه.</li>
                </ol>
                <div className="alert-box alert-box-info" style={{ padding: '0.65rem 0.85rem', fontSize: '0.78rem', lineHeight: '1.6' }}>
                  <strong>⚠️ تنبيه هام حول صلاحيات الوصول:</strong> فحص النظام الآلي يتأكد فقط من أن الرابط يتبع نطاق Google Drive أو Docs الآمن والمعتمد؛ <em>وهذا الفحص لا يضمن وجود الملف ولا يضمن إمكانية وصول المشرف إليه</em>. إذا كان الملف مقفلاً أو لا يملك المشرف إذن عرضه، فسيطلب منك المشرف إعادة التسليم وتعديل صلاحيات المشاركة.
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    رابط Google Drive *
                  </label>
                  <input
                    type="url"
                    required
                    value={assignmentInputLink}
                    onChange={(e) => setAssignmentInputLink(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', direction: 'ltr', textAlign: 'left', fontFamily: 'monospace', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    ملاحظاتك للمشرف حول الحل أو التعديلات المنجزة في هذه النسخة:
                  </label>
                  <textarea
                    rows={2}
                    value={studentNotesInput}
                    onChange={(e) => setStudentNotesInput(e.target.value)}
                    placeholder="اكتب هنا أي توضيح للمشرف الأكاديمي بخصوص خطواتك أو الأسئلة التي ترغب بمراجعتها..."
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.85rem', fontFamily: 'var(--font-arabic)' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.55rem 1.4rem' }}>
                    <Send size={14} />
                    <span>تسليم وتحديث الرابط</span>
                  </button>
                </div>
              </div>

              {assignmentError && (
                <div style={{
                  marginTop: '0.85rem',
                  padding: '0.75rem 1rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid #ef4444',
                  color: '#b91c1c',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                }}>
                  {assignmentError}
                </div>
              )}

              {submitSuccessNotice && (
                <div 
                  className="alert-box alert-box-success"
                  style={{
                    marginTop: '0.85rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.6rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <CheckCircle2 size={18} color="#059669" />
                    <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>
                      تم حفظ وتسليم ملف التكليف بنجاح! تم فتح المحاضرة التالية لك في المنهج فوراً.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const nextUnlocked = flattenedCourseItems.find(
                        (f) => f.type === 'lesson' && !completedLessonIds.includes(f.id) && !f.isLocked
                      ) || flattenedCourseItems.find((f) => f.type === 'lesson');
                      if (nextUnlocked) {
                        setCurrentModuleIndex(nextUnlocked.moduleIndex);
                        setCurrentLessonIndex(nextUnlocked.subIndex);
                      }
                      setActiveTab('learn');
                    }}
                    className="btn btn-primary"
                    style={{ fontSize: '0.82rem', padding: '0.4rem 0.9rem' }}
                    id="assignment-next-lesson-btn"
                  >
                    <span>الانتقال للمحاضرة التالية المفتوحة الآن ←</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* 4. تبويب الاختبارات الإلكترونية التفاعلية (Interactive MCQ Engine) */}
      {activeTab === 'exam' && (
        <div className="card" style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span className="badge badge-primary">كورس: {currentCourse?.code}</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--text-main)' }}>
                {studentExamAttempt?.examTitle || 'اختبار منتصف المسار النظري (Theory Exam)'}
              </h3>
            </div>
            {!examSubmitted ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: examTimer <= 120 ? '#ef4444' : 'var(--primary-600)',
                fontWeight: 800,
                background: examTimer <= 120 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(14, 165, 233, 0.1)',
                border: examTimer <= 120 ? '1px solid #ef4444' : '1px solid var(--border-color)',
                padding: '0.4rem 0.95rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: examTimer <= 120 ? '0 0 10px rgba(239, 68, 68, 0.3)' : 'none',
              }}>
                <Clock size={16} />
                <span>
                  {examTimer <= 120 ? '⚠️ تحذير قرب انتهاء الوقت: ' : 'الوقت المتبقي: '}
                  {formatTimer(examTimer)}
                </span>
              </div>
            ) : (
              <span className="badge badge-emerald">تم اعتماد المحاولة</span>
            )}
          </div>

          {examSubmitted ? (
            <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <CheckCircle2 size={52} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>تم رصد وتسليم محاولة الاختبار بنجاح</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                الدرجة الرسمية المحسوبة: <strong style={{ color: 'var(--accent-emerald)', fontSize: '1.2rem' }}>{examCalculatedScore} / 30 درجة</strong>
              </p>
              <div className="alert-box alert-box-success" style={{ maxWidth: '420px', margin: '0 auto 1.25rem', fontSize: '0.85rem', fontWeight: 600 }}>
                🎉 تم فتح المحاضرة والدرس التالي لك في الكورس فوراً!
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => {
                    const nextUnlocked = flattenedCourseItems.find(
                      (f) => f.type === 'lesson' && !completedLessonIds.includes(f.id) && !f.isLocked
                    ) || flattenedCourseItems.find((f) => f.type === 'lesson');
                    if (nextUnlocked) {
                      setCurrentModuleIndex(nextUnlocked.moduleIndex);
                      setCurrentLessonIndex(nextUnlocked.subIndex);
                    }
                    setActiveTab('learn');
                  }}
                  className="btn btn-primary"
                  style={{ fontSize: '0.9rem', padding: '0.6rem 1.4rem' }}
                  id="exam-continue-to-next-lesson-btn"
                >
                  <PlayCircle size={16} />
                  <span>الانتقال للمحاضرة التالية المفتوحة الآن ←</span>
                </button>
                <button onClick={() => setExamSubmitted(false)} className="btn btn-outline" style={{ fontSize: '0.82rem' }}>
                  <RotateCcw size={14} />
                  <span>إعادة المحاولة التدريبية</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
                {/* السؤال 1 */}
                <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                    السؤال 1: أي من التصاميم المنهجية يعتبر المعيار الذهبي لتقييم كفاءة الأدوية والتدخلات السريرية؟ (10 درجات)
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-sm)', background: selectedAnswers.q1 === 'A' ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-card)', border: selectedAnswers.q1 === 'A' ? '1px solid var(--primary-600)' : '1px solid var(--border-color)', cursor: 'pointer' }}>
                      <input type="radio" name="q1" checked={selectedAnswers.q1 === 'A'} onChange={() => setSelectedAnswers({ ...selectedAnswers, q1: 'A' })} />
                      <span style={{ fontSize: '0.88rem' }}>أ) التجارب السريرية العشوائية المزدوجة التعمية (RCTs)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-sm)', background: selectedAnswers.q1 === 'B' ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-card)', border: selectedAnswers.q1 === 'B' ? '1px solid var(--primary-600)' : '1px solid var(--border-color)', cursor: 'pointer' }}>
                      <input type="radio" name="q1" checked={selectedAnswers.q1 === 'B'} onChange={() => setSelectedAnswers({ ...selectedAnswers, q1: 'B' })} />
                      <span style={{ fontSize: '0.88rem' }}>ب) دراسة الحالات والشواهد بأثر رجعي (Case-Control)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-sm)', background: selectedAnswers.q1 === 'C' ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-card)', border: selectedAnswers.q1 === 'C' ? '1px solid var(--primary-600)' : '1px solid var(--border-color)', cursor: 'pointer' }}>
                      <input type="radio" name="q1" checked={selectedAnswers.q1 === 'C'} onChange={() => setSelectedAnswers({ ...selectedAnswers, q1: 'C' })} />
                      <span style={{ fontSize: '0.88rem' }}>ج) سلسلة الحالات الوصفية (Case Series)</span>
                    </label>
                  </div>
                </div>

                {/* السؤال 2 */}
                <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                    السؤال 2: ما هو الدليل الإرشادي المعتمد عالمياً لإعداد وكتابة بروتوكولات المراجعات المنهجية؟ (10 درجات)
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-sm)', background: selectedAnswers.q2 === 'A' ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-card)', border: selectedAnswers.q2 === 'A' ? '1px solid var(--primary-600)' : '1px solid var(--border-color)', cursor: 'pointer' }}>
                      <input type="radio" name="q2" checked={selectedAnswers.q2 === 'A'} onChange={() => setSelectedAnswers({ ...selectedAnswers, q2: 'A' })} />
                      <span style={{ fontSize: '0.88rem' }}>أ) دليل PRISMA-P 2020 لبروتوكولات المراجعة</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-sm)', background: selectedAnswers.q2 === 'B' ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-card)', border: selectedAnswers.q2 === 'B' ? '1px solid var(--primary-600)' : '1px solid var(--border-color)', cursor: 'pointer' }}>
                      <input type="radio" name="q2" checked={selectedAnswers.q2 === 'B'} onChange={() => setSelectedAnswers({ ...selectedAnswers, q2: 'B' })} />
                      <span style={{ fontSize: '0.88rem' }}>ب) بيان STROBE للدراسات الرصدية</span>
                    </label>
                  </div>
                </div>

                {/* السؤال 3 */}
                <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                    السؤال 3: متى يجب على الباحث تسجيل بروتوكول المراجعة في منصة PROSPERO الدولية؟ (10 درجات)
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-sm)', background: selectedAnswers.q3 === 'A' ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-card)', border: selectedAnswers.q3 === 'A' ? '1px solid var(--primary-600)' : '1px solid var(--border-color)', cursor: 'pointer' }}>
                      <input type="radio" name="q3" checked={selectedAnswers.q3 === 'A'} onChange={() => setSelectedAnswers({ ...selectedAnswers, q3: 'A' })} />
                      <span style={{ fontSize: '0.88rem' }}>أ) قبل بدء استخلاص البيانات وتصفية النتائج الأولية</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.85rem', borderRadius: 'var(--radius-sm)', background: selectedAnswers.q3 === 'B' ? 'rgba(37, 99, 235, 0.12)' : 'var(--bg-card)', border: selectedAnswers.q3 === 'B' ? '1px solid var(--primary-600)' : '1px solid var(--border-color)', cursor: 'pointer' }}>
                      <input type="radio" name="q3" checked={selectedAnswers.q3 === 'B'} onChange={() => setSelectedAnswers({ ...selectedAnswers, q3: 'B' })} />
                      <span style={{ fontSize: '0.88rem' }}>ب) بعد الانتهاء من كتابة المسودة الكاملة وقبل إرسالها للمجلة</span>
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button onClick={handleExamSubmit} className="btn btn-primary" style={{ padding: '0.65rem 1.75rem' }}>
                  <CheckCircle2 size={16} />
                  <span>تسليم الإجابات واعتماد الدرجة فوراً</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. تبويب السجل الأكاديمي والشهادة */}
      {activeTab === 'transcript' && (
        <div className="card" style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                السجل الأكاديمي الموحد
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                الكورس: <strong>{currentCourse?.title}</strong> ({currentCourse?.code})
              </p>
            </div>
            <span className="badge badge-emerald" style={{ fontSize: '0.9rem', padding: '0.4rem 0.85rem' }}>
              المعدل التراكمي: {totalScore}% (ناجح مع مرتبة الشرف)
            </span>
          </div>

          <div className="table-responsive" style={{ marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)' }}>
                  <th style={{ padding: '0.75rem' }}>التقييم الأكاديمي</th>
                  <th style={{ padding: '0.75rem' }}>الدرجة المرصودة</th>
                  <th style={{ padding: '0.75rem' }}>الدرجة الكلية</th>
                  <th style={{ padding: '0.75rem' }}>الحالة</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem' }}>التكليف العملي (Assignment)</td>
                  <td style={{ padding: '0.75rem', fontWeight: 800 }}>{assignmentScore}</td>
                  <td style={{ padding: '0.75rem' }}>20</td>
                  <td style={{ padding: '0.75rem' }}><span className="badge badge-emerald">معتمد</span></td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem' }}>اختبار منتصف المسار النظري</td>
                  <td style={{ padding: '0.75rem', fontWeight: 800 }}>{examScore}</td>
                  <td style={{ padding: '0.75rem' }}>30</td>
                  <td style={{ padding: '0.75rem' }}><span className="badge badge-emerald">معتمد</span></td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem' }}>الامتحان العملي الحضوري</td>
                  <td style={{ padding: '0.75rem', fontWeight: 800 }}>{practicalScore}</td>
                  <td style={{ padding: '0.75rem' }}>50</td>
                  <td style={{ padding: '0.75rem' }}><span className="badge badge-emerald">تم الرصد</span></td>
                </tr>
                <tr style={{ background: 'var(--bg-subtle)', fontWeight: 800 }}>
                  <td style={{ padding: '0.75rem' }}>المجموع التراكمي النهائي</td>
                  <td style={{ padding: '0.75rem', color: 'var(--accent-emerald)', fontSize: '1.2rem' }}>{totalScore}%</td>
                  <td style={{ padding: '0.75rem' }}>100%</td>
                  <td style={{ padding: '0.75rem' }}><span className="badge badge-emerald">مؤهل لإصدار الشهادة الأكاديمية</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* رسالة إشعار تقديم الطلب السريعة */}
          {requestFeedback && (
            <div style={{
              padding: '0.85rem 1.25rem',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid var(--accent-emerald)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-main)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
              fontSize: '0.88rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} color="var(--accent-emerald)" />
                <span>{requestFeedback}</span>
              </div>
              <button onClick={() => setRequestFeedback(null)} className="btn btn-ghost" style={{ padding: '0.2rem 0.5rem' }}>✕</button>
            </div>
          )}

          {/* منظومة الشهادات: التحقق من الأهلية ودورة التجهيز خارج المنصة */}
          {(() => {
            const currentCertReq = certRequests.find(
              (r) => r.studentUid === studentUid && (r.courseId === currentCourse?.id || r.courseTitle === currentCourse?.title)
            );
            const isEligibleForCert = totalScore >= (currentCourse?.passingScore || 70);

            const handleRequestCert = () => {
              if (!currentCourse) return;
              if (onRequestCertificate) {
                onRequestCertificate(currentCourse.id);
              } else {
                const newReq: MockCertificateRequest = {
                  id: `cert-req-${Date.now()}`,
                  studentUid,
                  studentName,
                  courseId: currentCourse.id,
                  courseTitle: currentCourse.title,
                  courseCode: currentCourse.code,
                  totalScore,
                  requestedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                  status: 'pending',
                };
                setLocalCertRequests((prev) => [newReq, ...prev]);
              }
              setRequestFeedback('تم إرسال طلب إصدار وتوقيع الشهادة إلى عمادة منتدى أسيرا بنجاح! سيتم تدقيق درجاتك وتجهيز الشهادة الموقعة خارج المنصة.');
              if (onLogAudit) {
                onLogAudit('طلب شهادة أكاديمية', `قام الطالب (${studentName}) بطلب شهادة لكورس: ${currentCourse.title}`);
              }
            };

            // الحالة 1: لم يتم طلب الشهادة بعد
            if (!currentCertReq) {
              if (isEligibleForCert) {
                return (
                  <div style={{
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, rgba(217, 119, 6, 0.06) 100%)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ flex: 1, minWidth: '260px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                          <span className="badge badge-emerald">✓ مؤهل للتخرج ونيل الشهادة الرسمية</span>
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>المعدل التراكمي: {totalScore}%</span>
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.35rem', color: 'var(--text-main)' }}>
                          طلب إصدار الشهادة الأكاديمية الرسمية
                        </h3>
                        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                          تنويه أكاديمي: شهادات إتمام البرامج التدريبية في منتدى أسيرا لا يتم إنشاؤها تلقائياً بالمنصة، بل يتم تدقيق نتائج الطالب وتجهيز وثيقة الشهادة وتوقيعها رسمياً من قِبل عميد المبادرة خارج المنصة بصيغة PDF معتمدة وموثقة بكود تحقق، ثم رفعها للمنصة.
                        </p>
                      </div>

                      <button
                        onClick={handleRequestCert}
                        className="btn btn-primary"
                        id="request-certificate-btn"
                        style={{ padding: '0.75rem 1.6rem', fontWeight: 800, fontSize: '0.92rem', whiteSpace: 'nowrap' }}
                      >
                        <Award size={18} />
                        <span>طلب إصدار الشهادة الأكاديمية</span>
                      </button>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div style={{
                    padding: '1.25rem',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem'
                  }}>
                    <AlertCircle size={24} color="#f59e0b" style={{ flexShrink: 0 }} />
                    <div>
                      <strong style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                        متطلبات نيل الشهادة غير مكتملة بعد:
                      </strong>
                      <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                        نسبة النجاح المقررة هي {currentCourse?.passingScore || 70}%. مجموعك الحالي هو {totalScore}%. يرجى استكمال التكليفات والامتحانات أولاً للتأهل لطلب الشهادة.
                      </span>
                    </div>
                  </div>
                );
              }
            }

            // الحالة 2: الطلب قيد المراجعة أو قيد التجهيز والتوقيع خارج المنصة
            if (currentCertReq.status === 'pending' || currentCertReq.status === 'processing') {
              return (
                <div style={{
                  padding: '1.5rem',
                  background: 'rgba(217, 119, 6, 0.05)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(217, 119, 6, 0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span className="badge badge-gold">
                          {currentCertReq.status === 'processing' ? '✍️ جاري تجهيز وتوقيع الشهادة خارج المنصة' : '⏳ طلب الشهادة قيد المراجعة والتدقيق'}
                        </span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          تاريخ تقديم الطلب: {currentCertReq.requestedAt}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.35rem', color: 'var(--text-main)' }}>
                        طلب الشهادة قيد الإجراء لدى إدارة المنصة والعمادة
                      </h3>
                      <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, maxWidth: '700px' }}>
                        تم تسجيل طلبك بنجاح. تقوم عمادة منتدى أسيرا واللجنة الأكاديمية حالياً بمراجعة درجاتك وإعداد الشهادة وتوقيعها يدوياً خارج المنصة.
                        <br />
                        <strong style={{ color: 'var(--accent-gold)' }}>
                          تنبيه: يمكنك متابعة حالة الطلب هنا، وستتاح أزرار استعراض وتحميل الشهادة فور قيام الإدارة باعتمادها ورفع رابط النسخة الموقعة.
                        </strong>
                      </p>
                    </div>
                  </div>

                  {/* مسار مراحل إعداد وتوقيع الشهادة */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '0.75rem',
                    background: 'var(--bg-card)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={18} color="#10b981" />
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>1. تقديم الطلب</div>
                        <div style={{ fontSize: '0.74rem', color: '#10b981' }}>مكتمل ({currentCertReq.requestedAt.split(' ')[0]})</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={18} color="#d97706" />
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>2. التجهيز والتوقيع خارج المنصة</div>
                        <div style={{ fontSize: '0.74rem', color: '#d97706', fontWeight: 700 }}>قيد الإجراء حالياً ⏳</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.55 }}>
                      <ShieldCheck size={18} />
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>3. رفع الرابط وإتاحة التحميل</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>بانتظار اعتماد الإدارة 🔒</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // الحالة 3: تم اعتماد وإصدار الشهادة ورفع رابطها من قبل المدير
            if (currentCertReq.status === 'issued') {
              return (
                <div style={{
                  padding: '1.5rem',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(217, 119, 6, 0.08) 100%)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--accent-emerald)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                        <span className="badge badge-emerald">✓ تم اعتماد وتوقيع الشهادة رسمياً</span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          تاريخ الاعتماد: {currentCertReq.issuedAt || '2026-10-13'}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0 0 0.35rem', color: 'var(--text-main)' }}>
                        شهادتك الأكاديمية الرسمية جاهزة وموثقة
                      </h3>
                      <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                        تم توقيع الشهادة من عميد منتدى أسيرا واعتمادها باللجنة العلمية ورفع النسخة الموثقة بنجاح.
                      </p>
                      
                      <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>رمز التحقق الأكاديمي المعتمد:</span>
                        <code style={{ padding: '0.2rem 0.5rem', background: 'var(--bg-subtle)', borderRadius: '4px', fontWeight: 800, color: 'var(--primary-600)', fontFamily: 'monospace' }}>
                          {currentCertReq.verificationCode || 'غير متوفر'}
                        </code>
                      </div>

                      {currentCertReq.adminNotes && (
                        <div style={{ marginTop: '0.6rem', fontSize: '0.82rem', color: 'var(--accent-emerald)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.4rem 0.75rem', borderRadius: '4px', maxWidth: '600px' }}>
                          <strong>ملاحظة العمادة:</strong> {currentCertReq.adminNotes}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        onClick={() => setIsCertificateModalOpen(true)}
                        className="btn btn-outline"
                        style={{ padding: '0.65rem 1.25rem', fontWeight: 700 }}
                        id="view-certificate-btn"
                      >
                        <Award size={16} />
                        <span>استعراض وثيقة الشهادة</span>
                      </button>

                      {currentCertReq.signedPdfUrl ? (
                        <a
                          href={sanitizeUrl(currentCertReq.signedPdfUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary"
                          style={{ padding: '0.65rem 1.4rem', fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                          id="download-certificate-btn"
                        >
                          <Download size={16} />
                          <span>تحميل الشهادة الموقعة (Google Drive PDF)</span>
                          <ExternalLink size={14} />
                        </a>
                      ) : (
                        <button
                          onClick={() => setIsCertificateModalOpen(true)}
                          className="btn btn-primary"
                          style={{ padding: '0.65rem 1.4rem', fontWeight: 800 }}
                          id="download-certificate-btn"
                        >
                          <Download size={16} />
                          <span>تحميل الشهادة الأكاديمية (PDF)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // الحالة 4: تم رفض الطلب
            if (currentCertReq.status === 'rejected') {
              return (
                <div className="alert-box alert-box-danger" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <span className="badge badge-primary" style={{ marginBottom: '0.35rem', borderColor: 'currentColor' }}>
                        تم رفض طلب الشهادة
                      </span>
                      <h4 style={{ margin: '0.2rem 0', fontSize: '1rem', fontWeight: 800 }}>ملاحظات الإدارة الأكاديمية:</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem' }}>
                        {currentCertReq.adminNotes || 'لم يتم استيفاء المتطلبات المقررة في الحضور والتطبيقات العملية.'}
                      </p>
                    </div>
                    <button onClick={handleRequestCert} className="btn btn-outline" style={{ borderColor: 'currentColor', color: 'inherit' }}>
                      إعادة تقديم الطلب
                    </button>
                  </div>
                </div>
              );
            }

            return null;
          })()}
        </div>
      )}

      {/* نافذة معاينة الشهادة المعتمدة الرسمية */}
      {isCertificateModalOpen && (
        <AcademicCertificateModal
          isOpen={isCertificateModalOpen}
          onClose={() => setIsCertificateModalOpen(false)}
          studentName={studentName}
          course={currentCourse}
          totalScore={totalScore}
          verificationCode={
            certRequests.find((r) => r.studentUid === studentUid && (r.courseId === currentCourse?.id || r.courseTitle === currentCourse?.title))?.verificationCode || ''
          }
          signedPdfUrl={
            certRequests.find((r) => r.studentUid === studentUid && (r.courseId === currentCourse?.id || r.courseTitle === currentCourse?.title))?.signedPdfUrl
          }
        />
      )}
    </div>
  );
};
