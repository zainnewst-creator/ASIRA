import React, { useState } from 'react';
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
  GraduationCap, 
  RotateCcw,
  MessageSquare,
  Check,
  ShieldCheck,
  Download,
  PlayCircle
} from 'lucide-react';
import { 
  MockStudentSubmission, 
  MockExamAttemptForInstructor, 
  MockCourseCurriculum,
  INITIAL_STUDENT_SUBMISSIONS,
  INITIAL_EXAM_ATTEMPTS,
  INITIAL_CURRICULUM
} from '../../data/mockData';

export interface StudentDashboardProps {
  studentName?: string;
  studentUid?: string;
  submissions?: MockStudentSubmission[];
  onSubmitAssignment?: (submission: MockStudentSubmission) => void;
  examAttempts?: MockExamAttemptForInstructor[];
  onSubmitExamAttempt?: (attempt: MockExamAttemptForInstructor) => void;
  curriculum?: MockCourseCurriculum;
  practicalGrades?: Record<string, { score: number; notes: string }>;
  onNavigateTab?: (tab: string) => void;
  onLogAudit?: (action: string, details: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  studentName = 'أحمد محمد الصالح',
  studentUid = 'student-1',
  submissions: propSubmissions,
  onSubmitAssignment,
  examAttempts: propExamAttempts,
  onSubmitExamAttempt,
  curriculum: propCurriculum,
  practicalGrades: propPracticalGrades,
  onLogAudit,
}) => {
  const [activeTab, setActiveTab] = useState<'my_courses' | 'learn' | 'assignments' | 'exam' | 'transcript'>('my_courses');

  // استخدام البيانات الممررة أو الافتراضية
  const submissions = propSubmissions || INITIAL_STUDENT_SUBMISSIONS;
  const examAttempts = propExamAttempts || INITIAL_EXAM_ATTEMPTS;
  const curriculum = propCurriculum || INITIAL_CURRICULUM;
  const practicalGrades = propPracticalGrades || {
    'student-1': { score: 42, notes: 'أداء ممتاز في اختبار تحليل البيانات الإحصائية الحضوري' }
  };

  // تكليف الطالب الحالي
  const studentSubmission = submissions.find((s) => s.studentUid === studentUid) || submissions[0];

  // محاولة اختبار الطالب الحالي
  const studentExamAttempt = examAttempts.find((a) => a.studentUid === studentUid) || examAttempts[0];

  // حالة مشغل الدروس
  const [currentModuleIndex, setCurrentModuleIndex] = useState(1);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(['les-1', 'les-2']);

  // نموذج تسليم التكليف
  const [assignmentInputLink, setAssignmentInputLink] = useState(studentSubmission?.driveFileUrl || 'https://drive.google.com/file/d/1ExampleStudentSubmissionAhmed/view');
  const [studentNotesInput, setStudentNotesInput] = useState('');
  const [submitSuccessNotice, setSubmitSuccessNotice] = useState(false);

  // حالة الاختبار التفاعلي
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(studentExamAttempt?.status === 'approved');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({
    q1: 'التجارب السريرية العشوائية (RCT)',
    q2: 'PRISMA 2020',
    q3: 'قبل بدء استخلاص البيانات وتصفية النتائج',
    q4: 'رفض الفرضية الصفرية ووجود دلالة إحصائية',
  });
  const [pledgeAccepted, setPledgeAccepted] = useState(true);

  // نافذة معاينة الشهادة المعتمدة
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  // الدرس الحالي النشط
  const currentModule = curriculum.modules[currentModuleIndex] || curriculum.modules[0];
  const currentLesson = currentModule?.lessons[currentLessonIndex] || currentModule?.lessons[0];

  // حساب نسبة التقدم في الكورس
  const totalLessonsCount = curriculum.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const progressPercentage = Math.round((completedLessonIds.length / (totalLessonsCount || 1)) * 100);

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

  // تسليم التكليف (v1 أو v2)
  const handleAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentInputLink.trim()) return;

    const nextVersion = studentSubmission ? (studentSubmission.version || 1) + 1 : 1;
    const updatedSub: MockStudentSubmission = {
      ...studentSubmission,
      id: studentSubmission?.id || `sub-${Date.now()}`,
      studentUid,
      studentName,
      university: 'جامعة الملك سعود - كلية الطب',
      assignmentTitle: 'صياغة بروتوكول بحثي وتحديد استراتيجية MeSH',
      version: nextVersion,
      driveFileUrl: assignmentInputLink,
      submittedAt: 'الآن (2026-10-12)',
      status: 'submitted',
      grade: undefined,
      instructorFeedback: undefined,
      revisionNotes: undefined,
    };

    if (onSubmitAssignment) {
      onSubmitAssignment(updatedSub);
    }

    if (onLogAudit) {
      onLogAudit('تسليم تكليف أكاديمي', `قام الطالب (${studentName}) بتسليم النسخة v${nextVersion} عبر رابط Google Drive.`);
    }

    setSubmitSuccessNotice(true);
    setTimeout(() => setSubmitSuccessNotice(false), 4000);
  };

  // تسليم الاختبار
  const handleExamSubmit = () => {
    setExamSubmitted(true);
    if (onLogAudit) {
      onLogAudit('تسليم اختبار نظري', `قام الطالب (${studentName}) بتسليم محاولة اختبار منتصف المسار بنجاح.`);
    }
  };

  // درجات السجل الأكاديمي
  const assignmentScore = studentSubmission?.grade !== undefined ? studentSubmission.grade : 18;
  const examScore = studentExamAttempt?.officialGrade !== undefined ? studentExamAttempt.officialGrade : 26;
  const practicalScore = practicalGrades[studentUid]?.score || 42;
  const totalScore = assignmentScore + examScore + practicalScore;
  const isPassed = totalScore >= 70;

  return (
    <div>
      {/* شريط تبويبات لوحة تحكم الطالب */}
      <div style={{ display: 'flex', gap: '0.6rem', borderBottom: '2px solid var(--border-color)', marginBottom: '2rem', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('my_courses')}
          className={`btn ${activeTab === 'my_courses' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.92rem' }}
        >
          <BookOpen size={16} />
          <span>دوراتي ومساري الأكاديمي</span>
        </button>

        <button
          onClick={() => setActiveTab('learn')}
          className={`btn ${activeTab === 'learn' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.92rem' }}
        >
          <PlayCircle size={16} />
          <span>مشغل الدروس والمحاضرات (YouTube & Drive)</span>
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`btn ${activeTab === 'assignments' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.92rem' }}
        >
          <FileText size={16} />
          <span>تسليم التكليفات وملاحظات المشرف</span>
        </button>

        <button
          onClick={() => setActiveTab('exam')}
          className={`btn ${activeTab === 'exam' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.92rem' }}
        >
          <CheckCircle2 size={16} />
          <span>محرك الاختبارات الإلكترونية (MCQ)</span>
        </button>

        <button
          onClick={() => setActiveTab('transcript')}
          className={`btn ${activeTab === 'transcript' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.92rem' }}
        >
          <GraduationCap size={16} />
          <span>السجل الأكاديمي الموحد والشهادة</span>
        </button>
      </div>

      {/* 1. تبويب: دوراتي ومساري الأكاديمي */}
      {activeTab === 'my_courses' && (
        <div className="grid-2">
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span className="badge badge-emerald">
                حالة التسجيل: مقبول (Approved)
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>كود الكورس: RES-101</span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              منهجية وأساسيات البحث العلمي والنشر الدولي
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem', lineHeight: '1.6' }}>
              المشرفون: د. إبراهيم يحيى | د. سارة الكيلاني — مسار شامل من توليد الفكرة وصياغة PICO حتى النشر.
            </p>

            {/* شريط نسبة الإنجاز والتقدم */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700 }}>نسبة إنجاز المحاضرات:</span>
                <strong style={{ color: 'var(--primary-700)' }}>{progressPercentage}% ({completedLessonIds.length} من {totalLessonsCount} دروس)</strong>
              </div>
              <div style={{ height: '10px', background: 'var(--border-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercentage}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #2563eb)', transition: 'width 0.4s ease' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button onClick={() => setActiveTab('learn')} className="btn btn-primary" style={{ flex: 1 }}>
                <span>متابعة الدروس</span>
                <ChevronRight size={16} />
              </button>
              <button onClick={() => setActiveTab('assignments')} className="btn btn-outline">
                <span>التكليف ({studentSubmission?.status === 'graded' ? 'تم الرصد' : 'مطلوب'})</span>
              </button>
              <button onClick={() => setActiveTab('transcript')} className="btn btn-ghost">
                <span>السجل الأكاديمي</span>
              </button>
            </div>
          </div>

          <div className="card">
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--primary-600)" />
              <span>الجدول الأكاديمي والمواعيد الهامة:</span>
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
              <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>تسليم تكليف بروتوكول PICO (Assignment)</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>الموعد النهائي: 15 نوفمبر 2026</div>
                </div>
                <span className="badge badge-primary">20 درجة</span>
              </div>
              <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>اختبار منتصف المسار النظري (Mid-term MCQ)</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>مدة الاختبار: 30 دقيقة عبر المنصة</div>
                </div>
                <span className="badge badge-gold">30 درجة</span>
              </div>
              <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>الامتحان العملي الحضوري بالجامعة</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>معمل الحاسوب المركزي - كلية الطب</div>
                </div>
                <span className="badge badge-emerald">50 درجة</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. تبويب: مشغل الدروس والمحاضرات (YouTube Player & Drive Slides) */}
      {activeTab === 'learn' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '1.5rem', alignItems: 'start' }}>
          {/* مشغل الفيديو والمحتوى */}
          <div className="card" style={{ padding: '1.5rem' }}>
            {/* إطار مشغل الفيديو */}
            <div style={{ width: '100%', aspectRatio: '16/9', background: '#050a18', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: '1.5rem', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ textAlign: 'center', color: '#fff', padding: '1rem' }}>
                <PlayCircle size={60} color="#3b82f6" style={{ margin: '0 auto 0.75rem', opacity: 0.9 }} />
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.5rem' }}>
                  {currentLesson?.title || 'المحاضرة التعليمية'}
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                  مستضافة ومضمّنة بأمان عبر YouTube بدون تكاليف تخزين | YouTube ID: <code>{currentLesson?.youtubeId}</code>
                </p>
              </div>
            </div>

            {/* تفاصيل الدرس النشط */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '0.35rem' }}>
                  {currentModule?.title}
                </span>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.25rem 0' }}>
                  {currentLesson?.title}
                </h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', marginTop: '0.35rem' }}>
                  <span>المدة: {currentLesson?.durationMinutes} دقيقة</span>
                  <span>المحاضر: د. إبراهيم يحيى</span>
                  <span>المتطلب: إلزامي لإصدار الشهادة</span>
                </div>
              </div>

              {/* زر تحديد الدرس كمكتمل */}
              <button
                onClick={() => currentLesson && toggleLessonCompletion(currentLesson.id)}
                className={`btn ${currentLesson && completedLessonIds.includes(currentLesson.id) ? 'btn-accent' : 'btn-outline'}`}
                style={{ padding: '0.6rem 1.25rem' }}
              >
                <CheckCircle2 size={17} />
                <span>
                  {currentLesson && completedLessonIds.includes(currentLesson.id) ? 'تم إكمال الدرس بنجاح ✓' : 'تحديد كـ "مكتمل"'}
                </span>
              </button>
            </div>

            {/* ملفات وسلايدات المحاضرة على Google Drive */}
            <div>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ExternalLink size={16} color="var(--primary-600)" />
                <span>ملفات ومراجع المحاضرة (Google Drive):</span>
              </h4>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <a
                  href={currentLesson?.drivePdfUrl || 'https://drive.google.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                  style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem' }}
                >
                  <FileText size={15} />
                  <span>سلايدات المحاضرة الرسمية (PDF)</span>
                </a>
                <a
                  href="https://drive.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline"
                  style={{ fontSize: '0.85rem', padding: '0.45rem 0.9rem' }}
                >
                  <ExternalLink size={15} />
                  <span>جدول استراتيجيات البحث في MeSH (Excel)</span>
                </a>
              </div>
            </div>

            {/* التنقل بين الدروس */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
              <button
                disabled={currentLessonIndex === 0 && currentModuleIndex === 0}
                onClick={() => {
                  if (currentLessonIndex > 0) {
                    setCurrentLessonIndex(currentLessonIndex - 1);
                  } else if (currentModuleIndex > 0) {
                    setCurrentModuleIndex(currentModuleIndex - 1);
                    setCurrentLessonIndex(curriculum.modules[currentModuleIndex - 1].lessons.length - 1);
                  }
                }}
                className="btn btn-ghost"
                style={{ fontSize: '0.88rem' }}
              >
                <ChevronLeft size={16} />
                <span>الدرس السابق</span>
              </button>

              <button
                onClick={() => {
                  if (currentLessonIndex < currentModule.lessons.length - 1) {
                    setCurrentLessonIndex(currentLessonIndex + 1);
                  } else if (currentModuleIndex < curriculum.modules.length - 1) {
                    setCurrentModuleIndex(currentModuleIndex + 1);
                    setCurrentLessonIndex(0);
                  }
                }}
                className="btn btn-primary"
                style={{ fontSize: '0.88rem' }}
              >
                <span>الدرس التالي</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* شجرة المنهج والوحدات (Sidebar) */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.65rem' }}>
              فهرس محاضرات الكورس
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {curriculum.modules.map((mod, mIdx) => (
                <div key={mod.id}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                    {mod.title}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {mod.lessons.map((les, lIdx) => {
                      const isCurrent = mIdx === currentModuleIndex && lIdx === currentLessonIndex;
                      const isCompleted = completedLessonIds.includes(les.id);

                      return (
                        <button
                          key={les.id}
                          onClick={() => {
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
                            background: isCurrent ? 'var(--primary-50)' : 'var(--bg-subtle)',
                            color: isCurrent ? 'var(--primary-900)' : 'var(--text-main)',
                            fontSize: '0.85rem',
                            textAlign: 'right',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                            {isCompleted ? (
                              <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
                            ) : isCurrent ? (
                              <PlayCircle size={16} color="var(--primary-600)" style={{ flexShrink: 0 }} />
                            ) : (
                              <Clock size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                            )}
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {les.title}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. تبويب: تسليم التكليفات وملاحظات المشرف الأكاديمي */}
      {activeTab === 'assignments' && (
        <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* تفاصيل التكليف */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div>
                <span className="badge badge-primary">التكليف الثاني (Assignment 2)</span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.35rem' }}>
                  صياغة بروتوكول بحثي كامل وتحديد استراتيجية MeSH
                </h2>
              </div>
              <div style={{ textAlign: 'left' }}>
                <span className="badge badge-emerald" style={{ fontSize: '0.9rem' }}>الدرجة الكلية: 20 درجة</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>الموعد: 15 نوفمبر 2026</div>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              المطلوب: إعداد وثيقة متكاملة تشمل سؤال البحث بنظام PICO، وتحديد مصطلحات MeSH وقواعد البيانات الطبية المستهدفة، ومعايير الشمول والاستبعاد (Eligibility Criteria).
            </p>

            {/* قالب التكليف للتحميل */}
            <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <strong style={{ fontSize: '0.9rem' }}>قالب بروتوكول البحث المعتمد من أسيرا:</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>قم بإنشاء نسخة في Google Docs وتعبئتها</div>
              </div>
              <a
                href="https://drive.google.com"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline"
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
              >
                <ExternalLink size={14} />
                <span>فتح قالب Google Docs</span>
              </a>
            </div>

            {/* ***************************************************************** */}
            {/* مكان عرض تعليق وملاحظات المدرس للطالب (THE PROMINENT FEEDBACK BOX) */}
            {/* ***************************************************************** */}
            {studentSubmission?.status === 'graded' && (
              <div style={{
                padding: '1.5rem',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '2px solid rgba(16, 185, 129, 0.4)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={24} color="#10b981" />
                    <div>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#065f46' }}>
                        تم تصحيح واعتماد التكليف رسمياً من المشرف
                      </h4>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>المشرف الأكاديمي: د. إبراهيم يحيى</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', background: '#10b981', color: '#fff', padding: '0.4rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 800, fontSize: '1.25rem' }}>
                    {studentSubmission.grade} / {studentSubmission.maxScore}
                  </div>
                </div>

                {/* نص الملاحظات والتعليق */}
                <div style={{ background: 'var(--bg-card)', padding: '1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.92rem', color: 'var(--primary-700)', marginBottom: '0.4rem' }}>
                    <MessageSquare size={16} />
                    <span>ملاحظات وتعليق المشرف الأكاديمي (Instructor Feedback):</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.7', color: 'var(--text-main)', fontStyle: 'italic' }}>
                    "{studentSubmission.instructorFeedback || 'عمل متميز جداً واستيفاء كامل لجميع معايير البروتوكول البحثي الدولي. تم رصد الدرجة في سجلك الأكاديمي.'}"
                  </p>
                </div>
              </div>
            )}

            {studentSubmission?.status === 'revision_required' && (
              <div style={{
                padding: '1.5rem',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '2px solid rgba(239, 68, 68, 0.4)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <AlertCircle size={24} color="#ef4444" />
                  <div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#b91c1c' }}>
                      تنبيه: مطلوب إعادة تسليم وتعديل العمل (Revision Required)
                    </h4>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>المشرف الأكاديمي: د. إبراهيم يحيى</span>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.3)', marginBottom: '1rem' }}>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: '#b91c1c', marginBottom: '0.25rem' }}>
                    تعليمات المشرف المطلوب تعديلها قبل رصد الدرجة:
                  </strong>
                  <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: '1.6', color: 'var(--text-main)' }}>
                    {studentSubmission.revisionNotes || studentSubmission.instructorFeedback || 'يرجى مراجعة معايير الاستبعاد وإعادة إرسال الملف المعدل.'}
                  </p>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  يرجى تعديل الملف في Google Drive ثم تحديث الرابط في النموذج أدناه لرفع النسخة الجديدة v{studentSubmission.version + 1}.
                </p>
              </div>
            )}

            {studentSubmission?.status === 'submitted' && (
              <div style={{
                padding: '1rem 1.25rem',
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}>
                <Clock size={22} color="var(--primary-600)" />
                <div>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--primary-800)' }}>
                    تم تسليم النسخة (v{studentSubmission.version}) بنجاح وهي قيد المراجعة حالياً!
                  </strong>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    سيقوم المشرف بمراجعة ملف Google Drive ورصد درجتك وكتابة الملاحظات هنا فور الانتهاء.
                  </div>
                </div>
              </div>
            )}

            {/* نموذج تسليم / تحديث رابط التكليف (Google Drive) */}
            <form onSubmit={handleAssignmentSubmit} style={{ padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Send size={16} color="var(--primary-600)" />
                <span>
                  {studentSubmission?.status === 'revision_required' ? 'إرسال النسخة المعدلة (v' + ((studentSubmission.version || 1) + 1) + '):' : 'رابط ملف الحل على Google Drive:'}
                </span>
              </h4>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                تأكد من ضبط خيار مشاركة الملف في Google Drive على: <strong>"Anyone with the link can view / أي شخص لديه الرابط يمكنه العرض"</strong>.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  type="url"
                  required
                  value={assignmentInputLink}
                  onChange={(e) => setAssignmentInputLink(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    direction: 'ltr',
                    textAlign: 'left',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                  }}
                />

                <input
                  type="text"
                  value={studentNotesInput}
                  onChange={(e) => setStudentNotesInput(e.target.value)}
                  placeholder="ملاحظات اختيارية للمشرف (مثال: تم تعديل معايير الاستبعاد في صفحة 3 وفق توجيهاتكم)"
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem',
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                  <a
                    href={assignmentInputLink}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-ghost"
                    style={{ fontSize: '0.82rem' }}
                  >
                    <ExternalLink size={14} />
                    <span>فحص الرابط للتأكد من الصلاحية</span>
                  </a>

                  <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
                    <Send size={15} />
                    <span>{studentSubmission ? 'تحديث وتسليم الرابط' : 'تسليم التكليف'}</span>
                  </button>
                </div>
              </div>

              {submitSuccessNotice && (
                <div style={{ marginTop: '0.85rem', padding: '0.65rem 1rem', background: '#10b981', color: '#fff', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check size={16} />
                  <span>تم حفظ وتسليم رابط التكليف بنجاح للمشرف الأكاديمي!</span>
                </div>
              )}
            </form>

            {/* سجل النسخ السابقة للملف */}
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                سجل النسخ المسلّمة (Submission History):
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>النسخة الحالية (v{studentSubmission?.version || 1})</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>تاريخ التسليم: {studentSubmission?.submittedAt}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <a href={studentSubmission?.driveFileUrl} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ fontSize: '0.8rem' }}>
                      <ExternalLink size={13} />
                      <span>عرض الرابط</span>
                    </a>
                    {studentSubmission?.status === 'graded' && <span className="badge badge-emerald">معتمد: {studentSubmission.grade}/20</span>}
                    {studentSubmission?.status === 'revision_required' && <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>مطلوب تعديل</span>}
                    {studentSubmission?.status === 'submitted' && <span className="badge badge-gold">قيد المراجعة</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. تبويب: محرك الاختبارات الإلكترونية (MCQ Exam) */}
      {activeTab === 'exam' && (
        <div className="card" style={{ maxWidth: '820px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
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
          <div style={{ padding: '0.85rem 1rem', background: 'var(--accent-gold-light)', color: 'var(--accent-gold-dark)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <div>
              <strong>ميثاق النزاهة الأكاديمية:</strong> أقر بأنني أؤدي هذا الاختبار بنفسي دون الاستعانة بالذكاء الاصطناعي أو مصادر خارجية. يتم عزل الإجابات وتصحيحها بأمان من قبل المشرف.
            </div>
          </div>

          {examSubmitted ? (
            <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <CheckCircle2 size={54} color="#10b981" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                تم تسليم محاولة الاختبار بنجاح!
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
                تم حفظ وتشفير إجاباتك بنجاح ونقلها لخزينة التصحيح الآمن بانتظار اعتماد المشرف الأكاديمي الرسمي.
              </p>
              {studentExamAttempt?.officialGrade !== undefined ? (
                <div style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: 'var(--bg-card)', border: '2px solid #10b981', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>الدرجة الرسمية المعتمدة:</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                    {studentExamAttempt.officialGrade} / {studentExamAttempt.maxScore} درجة
                  </div>
                </div>
              ) : (
                <span className="badge badge-gold" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                  الحالة: قيد اعتماد المشرف الأكاديمي
                </span>
              )}
            </div>
          ) : (
            <div>
              {/* الأسئلة التفاعلية */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* السؤال 1 */}
                <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                    السؤال 1: أي من التصاميم البحثية التالية يعتبر المعيار الذهبي لتقييم كفاءة دواء جديد؟
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                      'التجارب السريرية العشوائية (RCT)',
                      'دراسة الحالات والشواهد (Case-Control)',
                      'الدراسات المقطعية المستعرضة (Cross-Sectional)',
                    ].map((opt) => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.85rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="q1"
                          checked={selectedAnswers.q1 === opt}
                          onChange={() => setSelectedAnswers({ ...selectedAnswers, q1: opt })}
                        />
                        <span style={{ fontSize: '0.88rem' }}>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* السؤال 2 */}
                <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                    السؤال 2: ما هو الإصدار الأحدث والأشمل لمعايير دليل المراجعات المنهجية؟
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {['PRISMA 2020', 'PRISMA 2015', 'CONSORT 2010'].map((opt) => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.85rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="q2"
                          checked={selectedAnswers.q2 === opt}
                          onChange={() => setSelectedAnswers({ ...selectedAnswers, q2: opt })}
                        />
                        <span style={{ fontSize: '0.88rem' }}>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* السؤال 3 */}
                <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                    السؤال 3: في أي مرحلة يجب تسجيل بروتوكول المراجعة المنهجية في منصة PROSPERO؟
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {[
                      'قبل بدء استخلاص البيانات وتصفية النتائج',
                      'بعد الانتهاء من كتابة المسودة الكاملة',
                      'عند إرسال الورقة للمجلة للنشر',
                    ].map((opt) => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.85rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="q3"
                          checked={selectedAnswers.q3 === opt}
                          onChange={() => setSelectedAnswers({ ...selectedAnswers, q3: opt })}
                        />
                        <span style={{ fontSize: '0.88rem' }}>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>المحاولة: 1 من 2 مسموح بها</span>
                <button onClick={handleExamSubmit} className="btn btn-primary" style={{ padding: '0.65rem 1.75rem' }}>
                  <span>تسليم إجابات الاختبار وإنهاء المحاولة</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. تبويب: السجل الأكاديمي الموحد والشهادة الرسمية */}
      {activeTab === 'transcript' && (
        <div className="card" style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>
                السجل الأكاديمي الموحد (Official Academic Transcript)
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                الطالب: <strong>{studentName}</strong> | الكورس: منهجية وأساسيات البحث العلمي والنشر الدولي (RES-101)
              </p>
            </div>
            <span className="badge badge-emerald">
              المعدل التراكمي: {totalScore}% (ناجح)
            </span>
          </div>

          <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.85rem' }}>نوع التقييم الأكاديمي</th>
                  <th style={{ padding: '0.85rem' }}>طبيعة التقييم</th>
                  <th style={{ padding: '0.85rem' }}>الدرجة المرصودة</th>
                  <th style={{ padding: '0.85rem' }}>الدرجة الكلية</th>
                  <th style={{ padding: '0.85rem' }}>حالة الرصد</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.85rem' }}>
                    <strong>تكليف صياغة البروتوكول البحثي و MeSH</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>المشرف: د. إبراهيم يحيى</div>
                  </td>
                  <td style={{ padding: '0.85rem' }}>تكليف عملي (v{studentSubmission?.version || 1})</td>
                  <td style={{ padding: '0.85rem', fontWeight: 800, color: 'var(--primary-700)', fontSize: '1.05rem' }}>
                    {assignmentScore}
                  </td>
                  <td style={{ padding: '0.85rem' }}>20</td>
                  <td style={{ padding: '0.85rem' }}>
                    {studentSubmission?.status === 'graded' ? (
                      <span className="badge badge-emerald">معتمد رسمياً</span>
                    ) : (
                      <span className="badge badge-gold">قيد المراجعة</span>
                    )}
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.85rem' }}>
                    <strong>اختبار منتصف المسار النظري (Mid-term MCQ)</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>اختبار إلكتروني مؤمن</div>
                  </td>
                  <td style={{ padding: '0.85rem' }}>نظري إلكتروني</td>
                  <td style={{ padding: '0.85rem', fontWeight: 800, color: 'var(--primary-700)', fontSize: '1.05rem' }}>
                    {examScore}
                  </td>
                  <td style={{ padding: '0.85rem' }}>30</td>
                  <td style={{ padding: '0.85rem' }}>
                    <span className="badge badge-emerald">معتمد رسمياً</span>
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.85rem' }}>
                    <strong>الامتحان العملي الحضوري بالجامعة</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>معمل الحاسوب المركزي - كلية الطب</div>
                  </td>
                  <td style={{ padding: '0.85rem' }}>عملي حضوري</td>
                  <td style={{ padding: '0.85rem', fontWeight: 800, color: 'var(--primary-700)', fontSize: '1.05rem' }}>
                    {practicalScore}
                  </td>
                  <td style={{ padding: '0.85rem' }}>50</td>
                  <td style={{ padding: '0.85rem' }}>
                    <span className="badge badge-emerald">تم الرصد والاعتماد</span>
                  </td>
                </tr>

                <tr style={{ background: 'var(--bg-subtle)', fontWeight: 800, fontSize: '1.05rem' }}>
                  <td style={{ padding: '0.85rem' }}>المجموع التراكمي النهائي</td>
                  <td style={{ padding: '0.85rem' }}>الدرجة الكلية</td>
                  <td style={{ padding: '0.85rem', color: '#10b981', fontSize: '1.2rem' }}>{totalScore}%</td>
                  <td style={{ padding: '0.85rem' }}>100%</td>
                  <td style={{ padding: '0.85rem' }}>
                    <span className="badge badge-emerald">ناجح (مرتبة الشرف)</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* بطاقة الشهادة الرسمية */}
          <div style={{ padding: '1.5rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '2px solid var(--primary-600)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold-dark)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <ShieldCheck size={18} />
                  <span>شهادة إتمام معتمدة وموقعة رقمياً من عمادة أسيرا</span>
                </div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                  شهادة اجتياز مسار البحث العلمي والنشر الدولي
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  رمز التحقق الفريد: <code>ASIRA-2026-8812</code> | معتمدة من العميد د. إبراهيم يحيى
                </p>
              </div>

              <button
                onClick={() => setIsCertificateModalOpen(true)}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.4rem' }}
              >
                <Award size={18} />
                <span>معاينة وتحميل الشهادة (PDF)</span>
              </button>
            </div>
          </div>

          {/* نافذة معاينة الشهادة الرسمية */}
          {isCertificateModalOpen && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(7, 13, 30, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '1.5rem',
            }}>
              <div className="card" style={{ maxWidth: '720px', width: '100%', position: 'relative', border: '3px solid #d97706', background: 'var(--bg-card)' }}>
                <button
                  onClick={() => setIsCertificateModalOpen(false)}
                  className="btn btn-ghost"
                  style={{ position: 'absolute', top: '12px', left: '12px' }}
                >
                  ✕
                </button>

                {/* رأس الشهادة */}
                <div style={{ textAlign: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.9rem', color: '#d97706', fontWeight: 800, letterSpacing: '1px' }}>
                    منتدى أسيرا لتعليم البحث العلمي — ASIRA RESEARCH FORUM
                  </div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '0.35rem' }}>
                    شهادة إتمام واجتياز أكاديمي
                  </h2>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Certificate of Academic Completion & Excellence
                  </div>
                </div>

                {/* نص الشهادة */}
                <div style={{ textAlign: 'center', padding: '1rem 0 1.5rem' }}>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    تشهد عمادة مبادرة أسيرا للبحث العلمي بأن الباحث / الطالب:
                  </p>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary-700)', margin: '0.5rem 0' }}>
                    {studentName}
                  </h3>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', maxWidth: '580px', margin: '0 auto 1rem', lineHeight: '1.7' }}>
                    قد أتم بنجاح متطلبات المسار التدريبي المكثف: <br />
                    <strong>"منهجية وأساسيات البحث العلمي والنشر الدولي"</strong> <br />
                    بمجموع تراكمي عام: <strong>{totalScore}% (مرتبة الشرف)</strong>، واستوفى كافة التكليفات العملية والامتحان الحضوري.
                  </p>
                </div>

                {/* التوقيعات والختم */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>د. إبراهيم يحيى</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>عميد المبادرة والمشرف العام</div>
                    <div style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 700, marginTop: '0.2rem' }}>✓ توقيع رقمي معتمد</div>
                  </div>

                  <div style={{ textAlign: 'center', padding: '0.5rem 1rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>رمز التحقق الأكاديمي</div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontFamily: 'monospace' }}>ASIRA-2026-8812</strong>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>د. يحيى المنصوري</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>رئيس اللجنة العلمية</div>
                    <div style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 700, marginTop: '0.2rem' }}>✓ توقيع رقمي معتمد</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                  <button
                    onClick={() => {
                      alert('تم بدء تحميل الشهادة المعتمدة بصيغة PDF الموقعة من العميد!');
                      setIsCertificateModalOpen(false);
                    }}
                    className="btn btn-primary"
                    style={{ padding: '0.65rem 2rem' }}
                  >
                    <Download size={16} />
                    <span>تنزيل ملف الشهادة الموقع (Signed PDF)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
