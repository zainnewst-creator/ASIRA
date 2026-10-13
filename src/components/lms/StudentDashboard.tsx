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
  MessageSquare,
  Check,
  ShieldCheck,
  Download,
  PlayCircle,
  Layers,
  Edit3,
  Printer,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { 
  MockStudentSubmission, 
  MockExamAttemptForInstructor, 
  MockCourseCurriculum,
  MockCertificateRequest,
  INITIAL_STUDENT_SUBMISSIONS, 
  INITIAL_EXAM_ATTEMPTS, 
  INITIAL_CURRICULUM,
  INITIAL_COURSES,
  INITIAL_CERT_REQUESTS
} from '../../data/mockData';
import { Course } from '../../types';
import { AcademicCertificateModal } from './AcademicCertificateModal';

export interface StudentDashboardProps {
  courses?: Course[];
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
  courses = INITIAL_COURSES,
  activeCourseId: propActiveCourseId,
  onSelectCourseId,
  studentName = 'أحمد محمد الصالح',
  studentUid = 'student-1',
  submissions: propSubmissions,
  onSubmitAssignment,
  examAttempts: propExamAttempts,
  onSubmitExamAttempt,
  curriculum: propCurriculum,
  practicalGrades: propPracticalGrades,
  certRequests: propCertRequests,
  onRequestCertificate,
  onLogAudit,
}) => {
  const [activeTab, setActiveTab] = useState<'my_courses' | 'learn' | 'assignments' | 'exam' | 'transcript'>('my_courses');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(propActiveCourseId || courses[0]?.id || 'course-1');

  // طلبات الشهادات الأكاديمية
  const [localCertRequests, setLocalCertRequests] = useState<MockCertificateRequest[]>(INITIAL_CERT_REQUESTS);
  const certRequests = propCertRequests || localCertRequests;
  const [requestFeedback, setRequestFeedback] = useState<string | null>(null);

  // الكورس الحالي المختار
  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

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
  const [assignmentInputLink, setAssignmentInputLink] = useState(studentSubmission?.driveFileUrl || 'https://drive.google.com/file/d/1ExampleStudentSubmissionAhmed/view');
  const [studentNotesInput, setStudentNotesInput] = useState('');
  const [submitSuccessNotice, setSubmitSuccessNotice] = useState(false);

  // حالة الاختبار التفاعلي والأسئلة الثلاثة
  const [examSubmitted, setExamSubmitted] = useState(studentExamAttempt?.status === 'approved');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({
    q1: 'A',
    q2: 'A',
    q3: 'A',
  });
  const [examTimer, setExamTimer] = useState<number>(1455); // ~24 minutes
  const [examCalculatedScore, setExamCalculatedScore] = useState<number>(studentExamAttempt?.calculatedScore || 28);

  // مؤقت الاختبار
  useEffect(() => {
    if (activeTab === 'exam' && !examSubmitted && examTimer > 0) {
      const timer = setInterval(() => {
        setExamTimer((prev) => (prev > 0 ? prev - 1 : 0));
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
    if (!assignmentInputLink.trim()) return;

    const nextVersion = studentSubmission ? (studentSubmission.version || 1) + 1 : 1;
    const updatedSub: MockStudentSubmission = {
      ...studentSubmission,
      id: studentSubmission?.id || `sub-${Date.now()}`,
      studentUid,
      studentName,
      university: 'جامعة الملك سعود - كلية الطب',
      assignmentTitle: studentSubmission?.assignmentTitle || 'صياغة بروتوكول بحثي وتحديد استراتيجية MeSH',
      version: nextVersion,
      driveFileUrl: assignmentInputLink,
      submittedAt: 'الآن (2026-10-13)',
      status: 'submitted',
      grade: undefined,
      instructorFeedback: undefined,
      revisionNotes: studentNotesInput ? `ملاحظة الطالب: ${studentNotesInput}` : undefined,
    };

    if (onSubmitAssignment) {
      onSubmitAssignment(updatedSub);
    }

    if (onLogAudit) {
      onLogAudit('تسليم تكليف أكاديمي', `قام الطالب (${studentName}) بتسليم النسخة v${nextVersion} بكورس ${currentCourse?.code}`);
    }

    setSubmitSuccessNotice(true);
    setTimeout(() => setSubmitSuccessNotice(false), 4000);
  };

  // تسليم الاختبار التفاعلي
  const handleExamSubmit = () => {
    // حساب الدرجة التلقائية
    let score = 0;
    if (selectedAnswers.q1 === 'A') score += 10;
    if (selectedAnswers.q2 === 'A') score += 10;
    if (selectedAnswers.q3 === 'A') score += 10;

    setExamCalculatedScore(score);
    setExamSubmitted(true);

    if (onLogAudit) {
      onLogAudit('تسليم اختبار نظري', `قام الطالب (${studentName}) بتسليم محاولة اختبار وحصل مبدئياً على ${score}/30`);
    }
  };

  // درجات السجل الأكاديمي
  const assignmentScore = studentSubmission?.grade !== undefined ? studentSubmission.grade : 18;
  const examScore = studentExamAttempt?.officialGrade !== undefined ? studentExamAttempt.officialGrade : (examSubmitted ? examCalculatedScore : 26);
  const practicalScore = practicalGrades[studentUid]?.score || 42;
  const totalScore = assignmentScore + examScore + practicalScore;

  return (
    <div>
      {/* شريط اختيار الكورس ومؤشر الكورس النشط */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
            الكورس النشط:
          </span>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => handleSelectCourse(course.id)}
                className={`btn ${selectedCourseId === course.id ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.82rem', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-full)' }}
              >
                <span>{course.code}</span>
              </button>
            ))}
          </div>
          <span className="badge badge-emerald" style={{ fontSize: '0.82rem' }}>
            {currentCourse?.title}
          </span>
        </div>

        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          المشرف الأكاديمي: <strong>{currentCourse?.instructorNames?.join(', ') || 'د. إبراهيم يحيى'}</strong>
        </div>
      </div>

      {/* شريط تبويبات لوحة تحكم الطالب المحسنة */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--border-color)', marginBottom: '1.75rem', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('my_courses')}
          className={`btn ${activeTab === 'my_courses' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.9rem' }}
        >
          <BookOpen size={16} />
          <span>دوراتي المسجلة ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('learn')}
          className={`btn ${activeTab === 'learn' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.9rem' }}
        >
          <PlayCircle size={16} />
          <span>المحاضرات ومشغل الدروس</span>
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`btn ${activeTab === 'assignments' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.9rem' }}
        >
          <FileText size={16} />
          <span>التكليفات وملاحظات المشرف</span>
        </button>

        <button
          onClick={() => setActiveTab('exam')}
          className={`btn ${activeTab === 'exam' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.9rem' }}
        >
          <CheckCircle2 size={16} />
          <span>الاختبارات الإلكترونية (MCQ)</span>
        </button>

        <button
          onClick={() => setActiveTab('transcript')}
          className={`btn ${activeTab === 'transcript' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.9rem' }}
        >
          <GraduationCap size={16} />
          <span>السجل الأكاديمي والشهادة</span>
        </button>
      </div>

      {/* 1. تبويب: دوراتي المسجلة (Multi-Course Overview) */}
      {activeTab === 'my_courses' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                مساراتك ودوراتك الأكاديمية المسجلة
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                تابع تقدمك الأكاديمي في كل كورس واطلع على المحاضرات والتقييمات المعتمدة.
              </p>
            </div>
          </div>

          <div className="grid-2">
            {courses.map((course) => {
              const isCurrent = course.id === selectedCourseId;

              return (
                <div key={course.id} className="card" style={{ border: isCurrent ? '2px solid var(--primary-600)' : '1px solid var(--border-color)', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                    <span className={`badge ${isCurrent ? 'badge-primary' : 'badge-emerald'}`}>
                      {isCurrent ? 'الكورس المفتوح حالياً' : 'كورس مسجل'}
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
                      <strong>{isCurrent ? `${progressPercentage}%` : '40%'}</strong>
                    </div>
                    <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{ width: isCurrent ? `${progressPercentage}%` : '40%', height: '100%', background: 'linear-gradient(90deg, #10b981, #2563eb)' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => {
                        handleSelectCourse(course.id);
                        setActiveTab('learn');
                      }}
                      className="btn btn-primary"
                      style={{ flex: 1, fontSize: '0.85rem' }}
                    >
                      <span>{isCurrent ? 'متابعة الدروس الآن' : 'فتح محتوى هذا الكورس'}</span>
                      <ChevronRight size={15} />
                    </button>
                    <button
                      onClick={() => {
                        handleSelectCourse(course.id);
                        setActiveTab('assignments');
                      }}
                      className="btn btn-outline"
                      style={{ fontSize: '0.85rem' }}
                    >
                      <span>التكليفات</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. تبويب: مشغل الدروس والمحاضرات (Real YouTube Iframe & Notebook) */}
      {activeTab === 'learn' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          {/* مشغل الفيديو والمحتوى */}
          <div className="card" style={{ padding: '1.5rem' }}>
            {/* مشغل الفيديو الحقيقي (Responsive YouTube Iframe) */}
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
                  <span>المحاضر: {currentCourse?.instructorNames?.[0] || 'د. إبراهيم يحيى'}</span>
                </div>
              </div>

              <button
                onClick={() => currentLesson && toggleLessonCompletion(currentLesson.id)}
                className={`btn ${currentLesson && completedLessonIds.includes(currentLesson.id) ? 'btn-accent' : 'btn-outline'}`}
                style={{ padding: '0.55rem 1.15rem' }}
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
                  href={currentLesson?.drivePdfUrl || 'https://drive.google.com'}
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

            {/* التنقل بين الدروس */}
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
                  if (currentLessonIndex < currentModule.lessons.length - 1) setCurrentLessonIndex(currentLessonIndex + 1);
                  else if (currentModuleIndex < curriculum.modules.length - 1) {
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

          {/* شجرة المنهج والوحدات (Sidebar with Accordion) */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              فهرس محاضرات الكورس
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {curriculum.modules.map((mod, mIdx) => {
                const isExpanded = expandedModules[mod.id] ?? true;

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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span>{mod.title}</span>
                        <span className="badge badge-primary" style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem' }}>{mod.lessons.length}</span>
                      </div>
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>

                    {isExpanded && (
                      <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', background: 'var(--bg-card)' }}>
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
                                background: isCurrent ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                                color: isCurrent ? 'var(--primary-600)' : 'var(--text-main)',
                                fontSize: '0.82rem',
                                textAlign: 'right',
                                cursor: 'pointer',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden' }}>
                                {isCompleted ? <CheckCircle2 size={15} color="#10b981" /> : <PlayCircle size={15} color={isCurrent ? 'var(--primary-600)' : 'var(--text-subtle)'} />}
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: isCurrent ? 700 : 500 }}>{les.title}</span>
                              </div>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{les.durationMinutes} د</span>
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
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                تسليم رابط ملف الحل على Google Drive:
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                تأكد من ضبط مشاركة الملف على: "Anyone with the link can view".
              </p>
              
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

              {submitSuccessNotice && (
                <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.85rem', background: '#10b981', color: '#fff', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                  تم حفظ وتسليم رابط التكليف بنجاح للمشرف الأكاديمي!
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444', fontWeight: 800, background: 'rgba(239, 68, 68, 0.1)', padding: '0.35rem 0.85rem', borderRadius: 'var(--radius-md)' }}>
                <Clock size={16} />
                <span>الوقت المتبقي: {formatTimer(examTimer)} دقيقة</span>
              </div>
            ) : (
              <span className="badge badge-emerald">تم اعتماد المحاولة</span>
            )}
          </div>

          {examSubmitted ? (
            <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <CheckCircle2 size={52} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>تم رصد وتسليم محاولة الاختبار بنجاح</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                الدرجة الرسمية المحسوبة: <strong style={{ color: 'var(--accent-emerald)', fontSize: '1.2rem' }}>{examCalculatedScore} / 30 درجة</strong>
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
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
                          {currentCertReq.verificationCode || 'ASIRA-2026-8812'}
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
                          href={currentCertReq.signedPdfUrl}
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
                <div style={{ padding: '1.25rem', background: '#fef2f2', border: '1px solid #f87171', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c', marginBottom: '0.35rem' }}>
                        تم رفض طلب الشهادة
                      </span>
                      <h4 style={{ margin: '0.2rem 0', color: '#991b1b', fontSize: '1rem', fontWeight: 800 }}>ملاحظات الإدارة الأكاديمية:</h4>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f1d1d' }}>
                        {currentCertReq.adminNotes || 'لم يتم استيفاء المتطلبات المقررة في الحضور والتطبيقات العملية.'}
                      </p>
                    </div>
                    <button onClick={handleRequestCert} className="btn btn-outline" style={{ borderColor: '#ef4444', color: '#b91c1c' }}>
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
            certRequests.find((r) => r.studentUid === studentUid && (r.courseId === currentCourse?.id || r.courseTitle === currentCourse?.title))?.verificationCode || 'ASIRA-2026-8812'
          }
          signedPdfUrl={
            certRequests.find((r) => r.studentUid === studentUid && (r.courseId === currentCourse?.id || r.courseTitle === currentCourse?.title))?.signedPdfUrl
          }
        />
      )}
    </div>
  );
};
