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
  PlayCircle,
  Layers
} from 'lucide-react';
import { 
  MockStudentSubmission, 
  MockExamAttemptForInstructor, 
  MockCourseCurriculum,
  INITIAL_STUDENT_SUBMISSIONS,
  INITIAL_EXAM_ATTEMPTS,
  INITIAL_CURRICULUM,
  INITIAL_COURSES
} from '../../data/mockData';
import { Course } from '../../types';

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
  onLogAudit,
}) => {
  const [activeTab, setActiveTab] = useState<'my_courses' | 'learn' | 'assignments' | 'exam' | 'transcript'>('my_courses');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(propActiveCourseId || courses[0]?.id || 'course-1');

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

  // نموذج تسليم التكليف
  const [assignmentInputLink, setAssignmentInputLink] = useState(studentSubmission?.driveFileUrl || 'https://drive.google.com/file/d/1ExampleStudentSubmissionAhmed/view');
  const [studentNotesInput, setStudentNotesInput] = useState('');
  const [submitSuccessNotice, setSubmitSuccessNotice] = useState(false);

  // حالة الاختبار التفاعلي
  const [examSubmitted, setExamSubmitted] = useState(studentExamAttempt?.status === 'approved');
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({
    q1: 'التجارب السريرية العشوائية (RCT)',
    q2: 'PRISMA 2020',
    q3: 'قبل بدء استخلاص البيانات وتصفية النتائج',
  });

  // نافذة معاينة الشهادة المعتمدة
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  // الدرس الحالي النشط
  const currentModule = curriculum.modules[currentModuleIndex] || curriculum.modules[0];
  const currentLesson = currentModule?.lessons[currentLessonIndex] || currentModule?.lessons[0];

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
      revisionNotes: undefined,
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

  // تسليم الاختبار
  const handleExamSubmit = () => {
    setExamSubmitted(true);
    if (onLogAudit) {
      onLogAudit('تسليم اختبار نظري', `قام الطالب (${studentName}) بتسليم محاولة اختبار بكورس ${currentCourse?.code}`);
    }
  };

  // درجات السجل الأكاديمي
  const assignmentScore = studentSubmission?.grade !== undefined ? studentSubmission.grade : 18;
  const examScore = studentExamAttempt?.officialGrade !== undefined ? studentExamAttempt.officialGrade : 26;
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
          المشرف: {currentCourse?.instructorNames?.join(', ') || 'د. إبراهيم يحيى'}
        </div>
      </div>

      {/* شريط تبويبات لوحة تحكم الطالب */}
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
                مساراتك ودوراتك الأكاديمية
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                اختر أي كورس لعرض محاضراته وتكليفاته واختباراته فوراً.
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
                      <span>نسبة الإنجاز:</span>
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

      {/* 2. تبويب: مشغل الدروس والمحاضرات (YouTube & Drive) */}
      {activeTab === 'learn' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
          {/* مشغل الفيديو والمحتوى */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ width: '100%', aspectRatio: '16/9', background: '#050a18', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: '1.25rem', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ textAlign: 'center', color: '#fff', padding: '1rem' }}>
                <PlayCircle size={56} color="#3b82f6" style={{ margin: '0 auto 0.75rem', opacity: 0.9 }} />
                <h4 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.4rem' }}>
                  {currentLesson?.title || 'المحاضرة التعليمية'}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
                  كورس: {currentCourse?.title} | YouTube ID: <code>{currentLesson?.youtubeId}</code>
                </p>
              </div>
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
            <div>
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
                  <span>سلايدات المحاضرة (PDF)</span>
                </a>
              </div>
            </div>

            {/* التنقل بين الدروس */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
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

          {/* شجرة المنهج والوحدات (Sidebar) */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              فهرس محاضرات الكورس
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {curriculum.modules.map((mod, mIdx) => (
                <div key={mod.id}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
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
                            padding: '0.5rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            border: isCurrent ? '1px solid var(--primary-600)' : '1px solid transparent',
                            background: isCurrent ? 'var(--primary-50)' : 'var(--bg-subtle)',
                            color: isCurrent ? 'var(--primary-900)' : 'var(--text-main)',
                            fontSize: '0.82rem',
                            textAlign: 'right',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden' }}>
                            {isCompleted ? <CheckCircle2 size={15} color="#10b981" /> : <PlayCircle size={15} color="var(--primary-600)" />}
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{les.title}</span>
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
              <span className="badge badge-emerald" style={{ fontSize: '0.85rem' }}>الدرجة: {studentSubmission?.maxScore || 20} درجة</span>
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

            {/* نموذج تسليم الرابط */}
            <form onSubmit={handleAssignmentSubmit} style={{ padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginTop: '1rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                رابط ملف الحل على Google Drive:
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                تأكد من ضبط مشاركة الملف على: "Anyone with the link can view".
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <input
                  type="url"
                  required
                  value={assignmentInputLink}
                  onChange={(e) => setAssignmentInputLink(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                  style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', direction: 'ltr', textAlign: 'left', fontFamily: 'monospace', fontSize: '0.88rem' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.55rem 1.25rem' }}>
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

      {/* 4. تبويب الاختبارات الإلكترونية */}
      {activeTab === 'exam' && (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <div>
              <span className="badge badge-primary">كورس: {currentCourse?.code}</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '0.25rem' }}>
                {studentExamAttempt?.examTitle || 'اختبار منتصف المسار النظري (Theory Exam)'}
              </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444', fontWeight: 700 }}>
              <Clock size={16} />
              <span>24:15 دقيقة متبقية</span>
            </div>
          </div>

          {examSubmitted ? (
            <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
              <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>تم تسليم إجابات الاختبار بنجاح</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                الدرجة الرسمية المعتمدة: <strong>{examScore} / {studentExamAttempt?.maxScore || 30} درجة</strong>
              </p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    السؤال 1: أي من التصاميم يعتبر المعيار الذهبي لتقييم كفاءة الأدوية؟
                  </h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem', cursor: 'pointer' }}>
                    <input type="radio" name="q1" defaultChecked />
                    <span style={{ fontSize: '0.85rem' }}>التجارب السريرية العشوائية المزدوجة التعمية (RCT)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem', cursor: 'pointer' }}>
                    <input type="radio" name="q1" />
                    <span style={{ fontSize: '0.85rem' }}>دراسة الحالات والشواهد (Case-Control)</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button onClick={handleExamSubmit} className="btn btn-primary">
                  <span>تسليم الإجابات</span>
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
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
                السجل الأكاديمي الموحد
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                الكورس: <strong>{currentCourse?.title}</strong> ({currentCourse?.code})
              </p>
            </div>
            <span className="badge badge-emerald">
              المعدل التراكمي: {totalScore}% (ناجح)
            </span>
          </div>

          <div className="table-responsive" style={{ marginBottom: '1.5rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)' }}>
                  <th style={{ padding: '0.75rem' }}>التقييم</th>
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
                  <td style={{ padding: '0.75rem', color: '#10b981', fontSize: '1.15rem' }}>{totalScore}%</td>
                  <td style={{ padding: '0.75rem' }}>100%</td>
                  <td style={{ padding: '0.75rem' }}><span className="badge badge-emerald">ناجح ومؤهل للشهادة</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <strong style={{ fontSize: '1rem', display: 'block' }}>شهادة إتمام الدورة الأكاديمية:</strong>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>رمز التحقق: ASIRA-2026-8812</span>
            </div>
            <button onClick={() => alert('تم بدء تحميل الشهادة المعتمدة الموقعة من العميد!')} className="btn btn-primary" style={{ padding: '0.55rem 1.25rem' }}>
              <Download size={15} />
              <span>تحميل الشهادة (PDF)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
