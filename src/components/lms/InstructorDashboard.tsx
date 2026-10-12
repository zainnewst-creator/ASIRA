import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  Edit3, 
  MessageSquare, 
  FileText, 
  BookOpen, 
  Layers, 
  Plus, 
  Clock, 
  AlertCircle, 
  Save, 
  RotateCcw, 
  GraduationCap,
  Eye,
  Check,
  X,
  PlayCircle,
  HelpCircle,
  Award
} from 'lucide-react';
import { 
  INITIAL_STUDENT_SUBMISSIONS, 
  INITIAL_EXAM_ATTEMPTS, 
  INITIAL_CURRICULUM,
  INITIAL_COURSES,
  MockStudentSubmission,
  MockExamAttemptForInstructor,
  MockCourseCurriculum
} from '../../data/mockData';
import { Course, ResearchPaper } from '../../types';
import { AddCourseModal } from '../AddCourseModal';
import { AddResearchModal } from '../AddResearchModal';

export interface InstructorDashboardProps {
  courses?: Course[];
  activeCourseId?: string;
  onSelectCourseId?: (courseId: string) => void;
  onAddCourse?: (newCourse: Course) => void;
  onAddResearch?: (newPaper: ResearchPaper) => void;
  submissions?: MockStudentSubmission[];
  onUpdateSubmission?: (updated: MockStudentSubmission) => void;
  examAttempts?: MockExamAttemptForInstructor[];
  onUpdateExamAttempt?: (updated: MockExamAttemptForInstructor) => void;
  curriculum?: MockCourseCurriculum;
  onUpdateCurriculum?: (updated: MockCourseCurriculum) => void;
  practicalGrades?: Record<string, { score: number; notes: string }>;
  onUpdatePracticalGrade?: (studentId: string, score: number, notes: string) => void;
  onLogAudit?: (action: string, details: string) => void;
}

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({
  courses = INITIAL_COURSES,
  activeCourseId: propActiveCourseId,
  onSelectCourseId,
  onAddCourse,
  onAddResearch,
  submissions: propSubmissions,
  onUpdateSubmission,
  examAttempts: propExamAttempts,
  onUpdateExamAttempt,
  curriculum: propCurriculum,
  onUpdateCurriculum,
  practicalGrades: propPracticalGrades,
  onUpdatePracticalGrade,
  onLogAudit,
}) => {
  const [activeTab, setActiveTab] = useState<'assignments' | 'exams' | 'curriculum' | 'practical'>('assignments');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(propActiveCourseId || courses[0]?.id || 'course-1');

  // الكورس النشط حالياً
  const currentCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];

  // بيانات التكليفات
  const [localSubmissions, setLocalSubmissions] = useState<MockStudentSubmission[]>(INITIAL_STUDENT_SUBMISSIONS);
  const submissions = propSubmissions || localSubmissions;

  const [selectedSubmission, setSelectedSubmission] = useState<MockStudentSubmission | null>(null);
  const [gradeInput, setGradeInput] = useState<number>(18);
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [requestRevisionToggle, setRequestRevisionToggle] = useState<boolean>(false);
  const [revisionNotesInput, setRevisionNotesInput] = useState<string>('');

  // بيانات الاختبارات
  const [localExamAttempts, setLocalExamAttempts] = useState<MockExamAttemptForInstructor[]>(INITIAL_EXAM_ATTEMPTS);
  const examAttempts = propExamAttempts || localExamAttempts;

  const [selectedAttempt, setSelectedAttempt] = useState<MockExamAttemptForInstructor | null>(null);
  const [overrideScoreInput, setOverrideScoreInput] = useState<number>(0);
  const [overrideReasonInput, setOverrideReasonInput] = useState<string>('');

  // بيانات المنهج
  const [localCurriculum, setLocalCurriculum] = useState(INITIAL_CURRICULUM);
  const curriculum = propCurriculum || localCurriculum;

  // نوافذ الإضافة العامة
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isAddResearchModalOpen, setIsAddResearchModalOpen] = useState(false);

  // نافذة إضافة درس
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [previewLesson, setPreviewLesson] = useState<{ id: string; title: string; youtubeId: string; durationMinutes: number; drivePdfUrl?: string } | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonYoutube, setNewLessonYoutube] = useState('');
  const [newLessonDrive, setNewLessonDrive] = useState('');

  // نافذة إضافة تكليف جديد
  const [isAddAssignmentModalOpen, setIsAddAssignmentModalOpen] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentInstructions, setAssignmentInstructions] = useState('');
  const [assignmentDriveTemplate, setAssignmentDriveTemplate] = useState('');
  const [assignmentMaxScore, setAssignmentMaxScore] = useState(20);
  const [assignmentDeadline, setAssignmentDeadline] = useState('2026-11-25');

  // نافذة إضافة اختبار جديد
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
  const [examType, setExamType] = useState<'theory' | 'final' | 'quiz' | 'practical'>('theory');
  const [examTitle, setExamTitle] = useState('');
  const [examDuration, setExamDuration] = useState(30);
  const [examMaxScore, setExamMaxScore] = useState(30);
  const [examQuestions, setExamQuestions] = useState<Array<{ qText: string; optA: string; optB: string; optC: string; optD: string; correctOpt: string; points: number }>>([
    {
      qText: 'أي من البرمجيات التالية تستخدم في التحليل الإحصائي التلوي Meta-Analysis؟',
      optA: 'RevMan & R',
      optB: 'Photoshop',
      optC: 'Microsoft Word',
      optD: 'Google Sheets فقط',
      correctOpt: 'A',
      points: 5,
    }
  ]);
  const [newQText, setNewQText] = useState('');
  const [newOptA, setNewOptA] = useState('');
  const [newOptB, setNewOptB] = useState('');
  const [newOptC, setNewOptC] = useState('');
  const [newOptD, setNewOptD] = useState('');
  const [newCorrectOpt, setNewCorrectOpt] = useState('A');
  const [newQPoints, setNewQPoints] = useState(5);

  // بيانات الامتحان العملي الحضوري
  const [localPracticalGrades, setLocalPracticalGrades] = useState<Record<string, { score: number; notes: string }>>({
    'student-1': { score: 42, notes: 'أداء ممتاز في اختبار تحليل البيانات الإحصائية الحضوري' },
    'student-2': { score: 38, notes: 'جيد جداً مع ملاحظة طفيفة في صياغة الفرضية' },
  });
  const practicalGrades = propPracticalGrades || localPracticalGrades;
  const [selectedPracticalStudent, setSelectedPracticalStudent] = useState<{ id: string; name: string; score: number; notes: string } | null>(null);

  // تبديل الكورس
  const handleSelectCourse = (id: string) => {
    setSelectedCourseId(id);
    if (onSelectCourseId) onSelectCourseId(id);
  };

  // حفظ تصحيح وتعديل درجة التكليف
  const handleSaveAssignmentGrading = () => {
    if (!selectedSubmission) return;

    const updatedSub: MockStudentSubmission = {
      ...selectedSubmission,
      status: requestRevisionToggle ? 'revision_required' : 'graded',
      grade: requestRevisionToggle ? undefined : gradeInput,
      instructorFeedback: feedbackInput,
      revisionNotes: requestRevisionToggle ? revisionNotesInput : undefined,
    };

    if (onUpdateSubmission) {
      onUpdateSubmission(updatedSub);
    } else {
      setLocalSubmissions((prev) => prev.map((sub) => sub.id === updatedSub.id ? updatedSub : sub));
    }

    if (onLogAudit) {
      const details = requestRevisionToggle 
        ? `طلب إعادة تسليم وتعديل من الطالب (${selectedSubmission.studentName}): ${revisionNotesInput}`
        : `رصد وتعديل درجة التكليف للطالب (${selectedSubmission.studentName}): ${gradeInput}/${selectedSubmission.maxScore} مع الملاحظات الأكاديمية`;
      onLogAudit(requestRevisionToggle ? 'طلب إعادة تسليم تكليف' : 'رصد/تعديل درجة تكليف', details);
    }

    setSelectedSubmission(null);
  };

  // اعتماد وتعديل درجة الاختبار
  const handleCommitExamGrade = () => {
    if (!selectedAttempt) return;

    const updatedAtt: MockExamAttemptForInstructor = {
      ...selectedAttempt,
      status: 'approved',
      officialGrade: overrideScoreInput,
      instructorRemarks: overrideReasonInput || selectedAttempt.instructorRemarks,
    };

    if (onUpdateExamAttempt) {
      onUpdateExamAttempt(updatedAtt);
    } else {
      setLocalExamAttempts((prev) => prev.map((att) => att.id === updatedAtt.id ? updatedAtt : att));
    }

    if (onLogAudit) {
      onLogAudit(
        'اعتماد/تعديل درجة اختبار نظري',
        `تعديل واعتماد درجة الطالب (${selectedAttempt.studentName}): ${overrideScoreInput}/${selectedAttempt.maxScore}. الملاحظات: ${overrideReasonInput || 'معتمدة دون ملاحظات'}`
      );
    }

    setSelectedAttempt(null);
  };

  // إضافة درس جديد
  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle) return;

    const newLesson = {
      id: `les-${Date.now()}`,
      title: newLessonTitle,
      youtubeId: newLessonYoutube || 'dQw4w9WgXcQ',
      durationMinutes: 45,
      isMandatory: true,
      drivePdfUrl: newLessonDrive || 'https://drive.google.com',
    };

    const updatedCurriculum = {
      ...curriculum,
      modules: curriculum.modules.map((m, idx) =>
        idx === 0 ? { ...m, lessons: [...m.lessons, newLesson] } : m
      ),
    };

    if (onUpdateCurriculum) {
      onUpdateCurriculum(updatedCurriculum);
    } else {
      setLocalCurriculum(updatedCurriculum);
    }

    if (onLogAudit) {
      onLogAudit('إضافة درس ومحاضرة', `إضافة درس جديد: "${newLessonTitle}" بكورس ${currentCourse?.code}`);
    }

    setIsAddLessonModalOpen(false);
    setNewLessonTitle('');
    setNewLessonYoutube('');
    setNewLessonDrive('');
  };

  // إضافة تكليف جديد
  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentTitle.trim()) return;

    // إضافة تكليف جديد لقائمة تسليمات الطلاب
    const newSubmissionEntry: MockStudentSubmission = {
      id: `sub-new-${Date.now()}`,
      studentUid: 'student-1',
      studentName: 'أحمد محمد الصالح',
      university: 'جامعة الملك سعود - كلية الطب',
      assignmentTitle: assignmentTitle.trim(),
      version: 1,
      driveFileUrl: assignmentDriveTemplate || 'https://drive.google.com/file/d/SampleTemplate/view',
      submittedAt: 'تم الإنشاء حديثاً',
      status: 'submitted',
      grade: undefined,
      maxScore: Number(assignmentMaxScore) || 20,
      instructorFeedback: undefined,
    };

    if (onUpdateSubmission) {
      onUpdateSubmission(newSubmissionEntry);
    } else {
      setLocalSubmissions((prev) => [newSubmissionEntry, ...prev]);
    }

    if (onLogAudit) {
      onLogAudit('إضافة تكليف أكاديمي جديد', `تم إنشاء ونشر تكليف: "${assignmentTitle}" بدرجة كلية ${assignmentMaxScore}`);
    }

    setIsAddAssignmentModalOpen(false);
    setAssignmentTitle('');
    setAssignmentInstructions('');
    setAssignmentDriveTemplate('');
  };

  // إضافة سؤال لمصفوفة أسئلة الاختبار
  const handleAddQuestionToExam = () => {
    if (!newQText.trim() || !newOptA.trim() || !newOptB.trim()) {
      alert('يرجى ملء نص السؤال وخيارين على الأقل');
      return;
    }

    setExamQuestions((prev) => [
      ...prev,
      {
        qText: newQText.trim(),
        optA: newOptA.trim(),
        optB: newOptB.trim(),
        optC: newOptC.trim() || 'لا شيء مما ذكر',
        optD: newOptD.trim() || 'جميع ما ذكر',
        correctOpt: newCorrectOpt,
        points: Number(newQPoints) || 5,
      }
    ]);

    setNewQText('');
    setNewOptA('');
    setNewOptB('');
    setNewOptC('');
    setNewOptD('');
  };

  // حفظ ونشر الاختبار الجديد
  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) return;

    const newAttemptEntry: MockExamAttemptForInstructor = {
      id: `attempt-new-${Date.now()}`,
      studentUid: 'student-1',
      studentName: 'أحمد محمد الصالح',
      university: 'جامعة الملك سعود - كلية الطب',
      examTitle: examTitle.trim(),
      submittedAt: 'تم النشر الآن',
      calculatedScore: examQuestions.reduce((sum, q) => sum + q.points, 0),
      officialGrade: undefined,
      maxScore: Number(examMaxScore) || 30,
      status: 'pending_review',
      instructorRemarks: undefined,
      studentAnswers: examQuestions.map((q, idx) => ({
        qId: `q-${idx}`,
        questionText: q.qText,
        studentAnswer: q[`opt${q.correctOpt}` as keyof typeof q] as string,
        correctAnswer: q[`opt${q.correctOpt}` as keyof typeof q] as string,
        points: q.points,
        maxPoints: q.points,
        isCorrect: true,
      }))
    };

    if (onUpdateExamAttempt) {
      onUpdateExamAttempt(newAttemptEntry);
    } else {
      setLocalExamAttempts((prev) => [newAttemptEntry, ...prev]);
    }

    if (onLogAudit) {
      onLogAudit('إضافة اختبار أكاديمي جديد', `تم إنشاء ونشر اختبار: "${examTitle}" (${examQuestions.length} أسئلة)`);
    }

    setIsAddExamModalOpen(false);
    setExamTitle('');
  };

  return (
    <div>
      {/* شريط اختيار الكورس المدار وأزرار الإنشاء السريعة */}
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
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
            الكورس المدار حالياً:
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

        {/* أزرار إضافة كورس وبحث عامة */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {onAddCourse && (
            <button
              onClick={() => setIsAddCourseModalOpen(true)}
              className="btn btn-outline"
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
            >
              <Plus size={14} />
              <span>إضافة كورس جديد</span>
            </button>
          )}

          {onAddResearch && (
            <button
              onClick={() => setIsAddResearchModalOpen(true)}
              className="btn btn-outline"
              style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
            >
              <Plus size={14} />
              <span>إضافة بحث منشور</span>
            </button>
          )}
        </div>
      </div>

      {/* تبويبات المدرس الأكاديمية المبسطة */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--border-color)', marginBottom: '1.75rem', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`btn ${activeTab === 'assignments' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.9rem' }}
        >
          <FileText size={16} />
          <span>تصحيح التكليفات ({submissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`btn ${activeTab === 'exams' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.9rem' }}
        >
          <CheckCircle2 size={16} />
          <span>مراجعة درجات الاختبارات ({examAttempts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('curriculum')}
          className={`btn ${activeTab === 'curriculum' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.9rem' }}
        >
          <Layers size={16} />
          <span>منشئ المحتوى والتقييمات (Builder)</span>
        </button>

        <button
          onClick={() => setActiveTab('practical')}
          className={`btn ${activeTab === 'practical' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.9rem' }}
        >
          <GraduationCap size={16} />
          <span>الامتحان العملي الحضوري</span>
        </button>
      </div>

      {/* 1. تبويب تصحيح التكليفات (Assignments Hub) */}
      {activeTab === 'assignments' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                قائمة تسليمات الطلاب للتكليفات
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                افتح رابط Google Drive المرفوع من الطالب، ورصد الدرجة أو تعديلها مع كتابة الملاحظات لتظهر فوراً للطالب.
              </p>
            </div>
            <span className="badge badge-primary">
              كود الكورس: {currentCourse?.code}
            </span>
          </div>

          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.85rem' }}>الطالب والجامعة</th>
                  <th style={{ padding: '0.85rem' }}>اسم التكليف</th>
                  <th style={{ padding: '0.85rem' }}>النسخة</th>
                  <th style={{ padding: '0.85rem' }}>ملف الطالب المرفوع</th>
                  <th style={{ padding: '0.85rem' }}>الحالة</th>
                  <th style={{ padding: '0.85rem' }}>الدرجة المرصودة</th>
                  <th style={{ padding: '0.85rem' }}>الملاحظات المرصودة</th>
                  <th style={{ padding: '0.85rem' }}>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.85rem' }}>
                      <strong style={{ display: 'block', color: 'var(--text-main)' }}>{sub.studentName}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{sub.university}</span>
                    </td>
                    <td style={{ padding: '0.85rem', fontWeight: 600 }}>{sub.assignmentTitle}</td>
                    <td style={{ padding: '0.85rem' }}>
                      <span className="badge badge-primary">v{sub.version}</span>
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <a
                        href={sub.driveFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline"
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                      >
                        <ExternalLink size={13} />
                        <span>فتح ملف Drive</span>
                      </a>
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      {sub.status === 'graded' && <span className="badge badge-emerald">تم الرصد</span>}
                      {sub.status === 'submitted' && <span className="badge badge-gold">بانتظار التصحيح</span>}
                      {sub.status === 'revision_required' && <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>مطلوب تعديل</span>}
                    </td>
                    <td style={{ padding: '0.85rem', fontWeight: 800, fontSize: '0.95rem' }}>
                      {sub.grade !== undefined ? `${sub.grade} / ${sub.maxScore}` : '—'}
                    </td>
                    <td style={{ padding: '0.85rem', fontSize: '0.8rem', maxWidth: '220px', color: 'var(--text-muted)' }}>
                      {sub.instructorFeedback ? (
                        <span title={sub.instructorFeedback} style={{ display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          "{sub.instructorFeedback}"
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-subtle)' }}>لا يوجد تعليق</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <button
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setGradeInput(sub.grade !== undefined ? sub.grade : 18);
                          setFeedbackInput(sub.instructorFeedback || '');
                          setRequestRevisionToggle(sub.status === 'revision_required');
                          setRevisionNotesInput(sub.revisionNotes || '');
                        }}
                        className="btn btn-primary"
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                      >
                        <Edit3 size={13} />
                        <span>{sub.grade !== undefined ? 'تعديل الدرجة' : 'تصحيح التكليف'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* نافذة تصحيح وإرسال التعليق للطالب (Modal) */}
          {selectedSubmission && (
            <div className="modal-overlay">
              <div className="modal-content">
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="btn btn-ghost"
                  style={{ position: 'absolute', top: '16px', left: '16px', padding: '0.4rem' }}
                >
                  ✕
                </button>

                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                  تصحيح وتعديل تكليف: {selectedSubmission.studentName}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  التكليف: <strong>{selectedSubmission.assignmentTitle}</strong> (النسخة: v{selectedSubmission.version})
                </p>

                {/* زر مباشر لفتح ملف الطالب في Google Drive */}
                <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>ملف حل التكليف على Google Drive:</span>
                  <a
                    href={selectedSubmission.driveFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline"
                    style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}
                  >
                    <ExternalLink size={13} />
                    <span>فتح الملف في نافذة جديدة</span>
                  </a>
                </div>

                {/* خيار طلب إعادة التسليم والتعديل */}
                <div style={{ padding: '0.85rem', background: requestRevisionToggle ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-subtle)', border: requestRevisionToggle ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem' }}>
                    <input
                      type="checkbox"
                      checked={requestRevisionToggle}
                      onChange={(e) => setRequestRevisionToggle(e.target.checked)}
                    />
                    <RotateCcw size={15} color={requestRevisionToggle ? '#ef4444' : 'var(--primary-600)'} />
                    <span>طلب إعادة تسليم وتعديل العمل من الطالب (Request Revision)</span>
                  </label>
                  {requestRevisionToggle && (
                    <div style={{ marginTop: '0.65rem' }}>
                      <input
                        type="text"
                        value={revisionNotesInput}
                        onChange={(e) => setRevisionNotesInput(e.target.value)}
                        placeholder="أسباب طلب التعديل والتعليمات للطالب..."
                        style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', border: '1px solid #f87171', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                      />
                    </div>
                  )}
                </div>

                {/* حقل رصد وتعديل الدرجة */}
                {!requestRevisionToggle && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      الدرجة المرصودة (من {selectedSubmission.maxScore}):
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={selectedSubmission.maxScore}
                      value={gradeInput}
                      onChange={(e) => setGradeInput(Number(e.target.value))}
                      style={{ width: '120px', padding: '0.55rem', borderRadius: 'var(--radius-md)', border: '2px solid var(--primary-600)', fontSize: '1.15rem', fontWeight: 800, textAlign: 'center' }}
                    />
                  </div>
                )}

                {/* مربع كتابة تعليق وملاحظات المدرس للطالب */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    تعليق وملاحظات المدرس للطالب (Feedback) — ستظهر للطالب فوراً:
                  </label>
                  <textarea
                    rows={3}
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="اكتب تعليقك الأكاديمي ونقاط القوة والتحسين..."
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', fontFamily: 'var(--font-arabic)', fontSize: '0.88rem' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => setSelectedSubmission(null)} className="btn btn-outline">
                    إلغاء
                  </button>
                  <button onClick={handleSaveAssignmentGrading} className="btn btn-primary">
                    <Save size={15} />
                    <span>حفظ وتثبيت الدرجة والتعليق</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. تبويب مراجعة وتعديل درجات الاختبارات */}
      {activeTab === 'exams' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                محاولات الاختبارات وتعديل الدرجات
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                مراجعة إجابات كل طالب، مع إمكانية تعديل الدرجة يدوياً (Manual Score Override) في أي وقت.
              </p>
            </div>
          </div>

          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.85rem' }}>اسم الطالب</th>
                  <th style={{ padding: '0.85rem' }}>اسم الاختبار</th>
                  <th style={{ padding: '0.85rem' }}>تاريخ التسليم</th>
                  <th style={{ padding: '0.85rem' }}>الدرجة المحسوبة</th>
                  <th style={{ padding: '0.85rem' }}>الدرجة الرسمية</th>
                  <th style={{ padding: '0.85rem' }}>الحالة</th>
                  <th style={{ padding: '0.85rem' }}>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {examAttempts.map((att) => (
                  <tr key={att.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.85rem' }}>
                      <strong style={{ display: 'block', color: 'var(--text-main)' }}>{att.studentName}</strong>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{att.university}</span>
                    </td>
                    <td style={{ padding: '0.85rem' }}>{att.examTitle}</td>
                    <td style={{ padding: '0.85rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{att.submittedAt}</td>
                    <td style={{ padding: '0.85rem', color: 'var(--primary-700)', fontWeight: 700 }}>
                      {att.calculatedScore} / {att.maxScore}
                    </td>
                    <td style={{ padding: '0.85rem', fontWeight: 800, fontSize: '0.95rem' }}>
                      {att.officialGrade !== undefined ? `${att.officialGrade} / ${att.maxScore}` : 'قيد الاعتماد'}
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      {att.status === 'approved' ? (
                        <span className="badge badge-emerald">معتمدة رسمياً</span>
                      ) : (
                        <span className="badge badge-gold">بانتظار المراجعة</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <button
                        onClick={() => {
                          setSelectedAttempt(att);
                          setOverrideScoreInput(att.officialGrade !== undefined ? att.officialGrade : att.calculatedScore);
                          setOverrideReasonInput(att.instructorRemarks || '');
                        }}
                        className="btn btn-primary"
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                      >
                        <Eye size={13} />
                        <span>{att.officialGrade !== undefined ? 'تعديل الدرجة' : 'مراجعة واعتماد'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* نافذة مراجعة وتعديل درجة الاختبار */}
          {selectedAttempt && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '780px' }}>
                <button
                  onClick={() => setSelectedAttempt(null)}
                  className="btn btn-ghost"
                  style={{ position: 'absolute', top: '16px', left: '16px', padding: '0.4rem' }}
                >
                  ✕
                </button>

                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                  مراجعة اختبار: {selectedAttempt.studentName}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  الدرجة المحسوبة تلقائياً: <strong>{selectedAttempt.calculatedScore} / {selectedAttempt.maxScore}</strong>
                </p>

                <div className="table-responsive" style={{ marginBottom: '1.25rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-subtle)' }}>
                        <th style={{ padding: '0.5rem' }}>السؤال</th>
                        <th style={{ padding: '0.5rem' }}>إجابة الطالب</th>
                        <th style={{ padding: '0.5rem' }}>الإجابة الصحيحة</th>
                        <th style={{ padding: '0.5rem' }}>النقاط</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAttempt.studentAnswers.map((ans, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.5rem' }}>{ans.questionText}</td>
                          <td style={{ padding: '0.5rem' }}>{ans.studentAnswer}</td>
                          <td style={{ padding: '0.5rem', color: 'var(--primary-600)', fontWeight: 700 }}>{ans.correctAnswer}</td>
                          <td style={{ padding: '0.5rem', fontWeight: 700 }}>{ans.points}/{ans.maxPoints}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* حقل تعديل الدرجة */}
                <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '1rem', alignItems: 'center' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        الدرجة المعتمدة:
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={selectedAttempt.maxScore}
                        value={overrideScoreInput}
                        onChange={(e) => setOverrideScoreInput(Number(e.target.value))}
                        style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', border: '2px solid var(--primary-600)', fontSize: '1.15rem', fontWeight: 800, textAlign: 'center' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        ملاحظات الاعتماد أو سبب التعديل:
                      </label>
                      <input
                        type="text"
                        value={overrideReasonInput}
                        onChange={(e) => setOverrideReasonInput(e.target.value)}
                        placeholder="سبب تعديل الدرجة..."
                        style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => setSelectedAttempt(null)} className="btn btn-outline">
                    إلغاء
                  </button>
                  <button onClick={handleCommitExamGrade} className="btn btn-primary">
                    <CheckCircle2 size={15} />
                    <span>تثبيت واعتماد الدرجة</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. تبويب منشئ المحتوى والتقييمات (Course Builder & Assessments) */}
      {activeTab === 'curriculum' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* شريط الإجراءات لإنشاء الدروس والتكاليف والامتحانات */}
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                منشئ المحتوى والتقييمات الأكاديمية
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                أضف المحاضرات، أنشئ التكليفات العملية بروابط Drive، وابنِ الامتحانات الإلكترونية بأنواعها لكورس: <strong>{currentCourse?.title}</strong>
              </p>
            </div>

            {/* الأزرار الثلاثة المباشرة للإضافة */}
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setIsAddLessonModalOpen(true)}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem' }}
              >
                <Plus size={15} />
                <span>إضافة محاضرة / درس</span>
              </button>

              <button
                onClick={() => setIsAddAssignmentModalOpen(true)}
                className="btn btn-accent"
                style={{ fontSize: '0.85rem' }}
              >
                <Plus size={15} />
                <span>إضافة تكليف جديد</span>
              </button>

              <button
                onClick={() => setIsAddExamModalOpen(true)}
                className="btn btn-outline"
                style={{ fontSize: '0.85rem' }}
              >
                <Plus size={15} />
                <span>إضافة امتحان / اختبار</span>
              </button>
            </div>
          </div>

          {/* قائمة الوحدات والدروس */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BookOpen size={18} color="var(--primary-600)" />
              <span>فهرس المحاضرات والدروس المنشورة:</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {curriculum.modules.map((mod) => (
                <div key={mod.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-subtle)', fontWeight: 800, fontSize: '0.95rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{mod.title}</span>
                    <span className="badge badge-primary">{mod.lessons.length} دروس</span>
                  </div>

                  <div style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {mod.lessons.map((les) => (
                      <div
                        key={les.id}
                        style={{
                          padding: '0.65rem 0.85rem',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <PlayCircle size={16} color="var(--primary-600)" />
                          <strong style={{ fontSize: '0.88rem' }}>{les.title}</strong>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>({les.durationMinutes} دقيقة)</span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => setPreviewLesson(les)}
                            className="btn btn-outline"
                            style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                          >
                            <span>معاينة</span>
                          </button>
                          {les.drivePdfUrl && (
                            <a href={les.drivePdfUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}>
                              <span>السلايدات</span>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. تبويب الامتحان العملي الحضوري */}
      {activeTab === 'practical' && (
        <div className="card">
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
              رصد وتعديل الامتحان العملي الحضوري بالجامعة
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              رصد درجات الامتحان العملي الحضوري المنعقد في المعمل المركزي (من 50 درجة).
            </p>
          </div>

          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.85rem' }}>اسم الطالب</th>
                  <th style={{ padding: '0.85rem' }}>الدرجة المرصودة (من 50)</th>
                  <th style={{ padding: '0.85rem' }}>الملاحظات الأكاديمية</th>
                  <th style={{ padding: '0.85rem' }}>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.85rem' }}>
                    <strong>أحمد محمد الصالح</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>جامعة الملك سعود</div>
                  </td>
                  <td style={{ padding: '0.85rem', fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                    {practicalGrades['student-1']?.score || 42} / 50
                  </td>
                  <td style={{ padding: '0.85rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {practicalGrades['student-1']?.notes || 'أداء ممتاز'}
                  </td>
                  <td style={{ padding: '0.85rem' }}>
                    <button
                      onClick={() => setSelectedPracticalStudent({
                        id: 'student-1',
                        name: 'أحمد محمد الصالح',
                        score: practicalGrades['student-1']?.score || 42,
                        notes: practicalGrades['student-1']?.notes || '',
                      })}
                      className="btn btn-outline"
                      style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                    >
                      <span>تعديل الدرجة</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* نافذة إضافة درس جديد */}
      {isAddLessonModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={() => setIsAddLessonModalOpen(false)} className="btn btn-ghost" style={{ position: 'absolute', top: '16px', left: '16px', padding: '0.4rem' }}>✕</button>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>إضافة درس ومحاضرة إلى الكورس</h3>
            <form onSubmit={handleAddLesson} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>عنوان الدرس *</label>
                <input type="text" required value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)} placeholder="مثال: الدرس 4: صياغة استراتيجية MeSH" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>معرف فيديو YouTube أو الرابط</label>
                <input type="text" value={newLessonYoutube} onChange={(e) => setNewLessonYoutube(e.target.value)} placeholder="dQw4w9WgXcQ" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>رابط سلايدات Google Drive</label>
                <input type="url" value={newLessonDrive} onChange={(e) => setNewLessonDrive(e.target.value)} placeholder="https://drive.google.com/..." style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsAddLessonModalOpen(false)} className="btn btn-outline">إلغاء</button>
                <button type="submit" className="btn btn-primary"><Plus size={15} /><span>حفظ ونشر الدرس</span></button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة إضافة تكليف جديد */}
      {isAddAssignmentModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button onClick={() => setIsAddAssignmentModalOpen(false)} className="btn btn-ghost" style={{ position: 'absolute', top: '16px', left: '16px', padding: '0.4rem' }}>✕</button>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>إضافة تكليف جديد للكورس</h3>
            <form onSubmit={handleAddAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>عنوان التكليف الأكاديمي *</label>
                <input type="text" required value={assignmentTitle} onChange={(e) => setAssignmentTitle(e.target.value)} placeholder="مثال: التكليف 3: تحليل البيانات واستخلاص النتائج" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>تعليمات وإرشادات الحل</label>
                <textarea rows={2} value={assignmentInstructions} onChange={(e) => setAssignmentInstructions(e.target.value)} placeholder="تعليمات ومعايير التقييم..." style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', fontFamily: 'var(--font-arabic)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>الدرجة القصوى</label>
                  <input type="number" min={5} max={100} value={assignmentMaxScore} onChange={(e) => setAssignmentMaxScore(Number(e.target.value))} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', fontWeight: 700 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>الموعد النهائي</label>
                  <input type="date" value={assignmentDeadline} onChange={(e) => setAssignmentDeadline(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>رابط نموذج التكليف (Google Drive Template)</label>
                <input type="url" value={assignmentDriveTemplate} onChange={(e) => setAssignmentDriveTemplate(e.target.value)} placeholder="https://drive.google.com/..." style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsAddAssignmentModalOpen(false)} className="btn btn-outline">إلغاء</button>
                <button type="submit" className="btn btn-accent"><Plus size={15} /><span>حفظ ونشر التكليف</span></button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة إضافة اختبار جديد بأنواعه */}
      {isAddExamModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '720px' }}>
            <button onClick={() => setIsAddExamModalOpen(false)} className="btn btn-ghost" style={{ position: 'absolute', top: '16px', left: '16px', padding: '0.4rem' }}>✕</button>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>إنشاء ونشر اختبار أكاديمي جديد</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              حدد نوع الاختبار والأسئلة ومفتاح الحل السري المعزول.
            </p>

            <form onSubmit={handleSaveExam} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>نوع الاختبار *</label>
                  <select value={examType} onChange={(e) => setExamType(e.target.value as any)} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
                    <option value="theory">اختبار منتصف المسار النظري (Mid-term MCQ)</option>
                    <option value="final">اختبار نهائي شامل (Final Exam)</option>
                    <option value="quiz">كويز سريع أسبوعي (Quiz)</option>
                    <option value="practical">متطلب امتحان عملي حضوري</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>عنوان الاختبار *</label>
                  <input type="text" required value={examTitle} onChange={(e) => setExamTitle(e.target.value)} placeholder="مثال: كويز الوحدة الثانية" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>المدة بالدقائق</label>
                  <input type="number" min={5} max={180} value={examDuration} onChange={(e) => setExamDuration(Number(e.target.value))} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', fontWeight: 700 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>الدرجة الكلية</label>
                  <input type="number" min={5} max={100} value={examMaxScore} onChange={(e) => setExamMaxScore(Number(e.target.value))} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', fontWeight: 700 }} />
                </div>
              </div>

              {/* منشئ الأسئلة MCQ */}
              <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
                <strong style={{ fontSize: '0.88rem', display: 'block', marginBottom: '0.5rem' }}>
                  إضافة سؤال جديد للاختبار ({examQuestions.length} أسئلة مضافة حالياً):
                </strong>
                <input type="text" value={newQText} onChange={(e) => setNewQText(e.target.value)} placeholder="نص السؤال..." style={{ width: '100%', padding: '0.55rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-card)', marginBottom: '0.5rem', fontSize: '0.85rem' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input type="text" value={newOptA} onChange={(e) => setNewOptA(e.target.value)} placeholder="الخيار A" style={{ padding: '0.45rem', fontSize: '0.82rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                  <input type="text" value={newOptB} onChange={(e) => setNewOptB(e.target.value)} placeholder="الخيار B" style={{ padding: '0.45rem', fontSize: '0.82rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                  <input type="text" value={newOptC} onChange={(e) => setNewOptC(e.target.value)} placeholder="الخيار C" style={{ padding: '0.45rem', fontSize: '0.82rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                  <input type="text" value={newOptD} onChange={(e) => setNewOptD(e.target.value)} placeholder="الخيار D" style={{ padding: '0.45rem', fontSize: '0.82rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
                    <span>الخيار الصحيح:</span>
                    <select value={newCorrectOpt} onChange={(e) => setNewCorrectOpt(e.target.value)} style={{ padding: '0.3rem', borderRadius: '4px' }}>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                  <button type="button" onClick={handleAddQuestionToExam} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
                    <Plus size={13} />
                    <span>إدراج هذا السؤال في الاختبار</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsAddExamModalOpen(false)} className="btn btn-outline">إلغاء</button>
                <button type="submit" className="btn btn-primary"><Save size={15} /><span>حفظ ونشر الاختبار للطلاب</span></button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة إضافة كورس جديد */}
      {onAddCourse && (
        <AddCourseModal
          isOpen={isAddCourseModalOpen}
          onClose={() => setIsAddCourseModalOpen(false)}
          onAddCourse={onAddCourse}
        />
      )}

      {/* نافذة إضافة بحث جديد */}
      {onAddResearch && (
        <AddResearchModal
          isOpen={isAddResearchModalOpen}
          onClose={() => setIsAddResearchModalOpen(false)}
          onAddResearch={onAddResearch}
        />
      )}
    </div>
  );
};
