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
  PlayCircle
} from 'lucide-react';
import { 
  INITIAL_STUDENT_SUBMISSIONS, 
  INITIAL_EXAM_ATTEMPTS, 
  INITIAL_CURRICULUM,
  MockStudentSubmission,
  MockExamAttemptForInstructor,
  MockCourseCurriculum
} from '../../data/mockData';

export interface InstructorDashboardProps {
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
  
  // بيانات التكليفات (تفضيل props مع الرجوع للبيانات الافتراضية)
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

  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [previewLesson, setPreviewLesson] = useState<{ id: string; title: string; youtubeId: string; durationMinutes: number; drivePdfUrl?: string } | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonYoutube, setNewLessonYoutube] = useState('');
  const [newLessonDrive, setNewLessonDrive] = useState('');

  // بيانات الامتحان العملي الحضوري
  const [localPracticalGrades, setLocalPracticalGrades] = useState<Record<string, { score: number; notes: string }>>({
    'student-1': { score: 42, notes: 'أداء ممتاز في اختبار تحليل البيانات الإحصائية الحضوري' },
    'student-2': { score: 38, notes: 'جيد جداً مع ملاحظة طفيفة في صياغة الفرضية' },
  });
  const practicalGrades = propPracticalGrades || localPracticalGrades;
  const [selectedPracticalStudent, setSelectedPracticalStudent] = useState<{ id: string; name: string; score: number; notes: string } | null>(null);

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
        : `رصد وتعديل درجة التكليف للطالب (${selectedSubmission.studentName}): ${gradeInput}/${selectedSubmission.maxScore} مع كتابة الملاحظات الأكاديمية`;
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
      onLogAudit('إضافة درس ومحاضرة', `إضافة درس جديد: "${newLessonTitle}" مع تضمين مقطع YouTube ومرفقات Google Drive`);
    }

    setIsAddLessonModalOpen(false);
    setNewLessonTitle('');
    setNewLessonYoutube('');
    setNewLessonDrive('');
  };

  return (
    <div>
      {/* شريط تبويبات المدرس */}
      <div style={{ display: 'flex', gap: '0.6rem', borderBottom: '2px solid var(--border-color)', marginBottom: '2rem', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`btn ${activeTab === 'assignments' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.92rem' }}
        >
          <FileText size={16} />
          <span>قائمة تسليمات الطلاب وتصحيح التكليفات ({submissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`btn ${activeTab === 'exams' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.92rem' }}
        >
          <CheckCircle2 size={16} />
          <span>مراجعة وتعديل درجات الاختبارات ({examAttempts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('curriculum')}
          className={`btn ${activeTab === 'curriculum' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.92rem' }}
        >
          <Layers size={16} />
          <span>مراجعة وبناء المنهج والدروس (Course Builder)</span>
        </button>

        <button
          onClick={() => setActiveTab('practical')}
          className={`btn ${activeTab === 'practical' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.92rem' }}
        >
          <GraduationCap size={16} />
          <span>رصد وتعديل الامتحان العملي الحضوري</span>
        </button>
      </div>

      {/* 1. تبويب قائمة تسليمات الطلاب وتصحيح التكليفات (Assignments Hub) */}
      {activeTab === 'assignments' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                قائمة الطلاب الذين قاموا بتسليم التكليف
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                افتح رابط Google Drive المرفوع من الطالب، وقم برصد الدرجة أو تعديلها في أي وقت، واكتب تعليقك التقييمي ليظهر في لوحة الطالب.
              </p>
            </div>
            <span className="badge badge-primary">
              كورس: RES-101 (أساسيات البحث العلمي)
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.85rem' }}>اسم الطالب والجامعة</th>
                  <th style={{ padding: '0.85rem' }}>النسخة</th>
                  <th style={{ padding: '0.85rem' }}>تاريخ التسليم</th>
                  <th style={{ padding: '0.85rem' }}>الملف المرفوع من الطالب</th>
                  <th style={{ padding: '0.85rem' }}>الحالة</th>
                  <th style={{ padding: '0.85rem' }}>الدرجة المرصودة</th>
                  <th style={{ padding: '0.85rem' }}>تعليق وملاحظات المدرس</th>
                  <th style={{ padding: '0.85rem' }}>الإجراء الأكاديمي</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.85rem' }}>
                      <strong style={{ display: 'block', color: 'var(--text-main)' }}>{sub.studentName}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sub.university}</span>
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <span className="badge badge-primary" style={{ fontFamily: 'var(--font-num)' }}>v{sub.version}</span>
                    </td>
                    <td style={{ padding: '0.85rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {sub.submittedAt}
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <a
                        href={sub.driveFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline"
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                      >
                        <ExternalLink size={13} />
                        <span>فتح ملف الطالب (Drive)</span>
                      </a>
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      {sub.status === 'graded' && <span className="badge badge-emerald">تم الرصد والاعتماد</span>}
                      {sub.status === 'submitted' && <span className="badge badge-gold">بانتظار التصحيح</span>}
                      {sub.status === 'revision_required' && <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>مطلوب تعديل وإعادة تسليم</span>}
                    </td>
                    <td style={{ padding: '0.85rem', fontWeight: 800, fontSize: '1rem', color: sub.grade !== undefined ? 'var(--primary-700)' : 'var(--text-muted)' }}>
                      {sub.grade !== undefined ? `${sub.grade} / ${sub.maxScore}` : '—'}
                    </td>
                    <td style={{ padding: '0.85rem', fontSize: '0.82rem', maxWidth: '240px', color: 'var(--text-muted)' }}>
                      {sub.instructorFeedback ? (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.3rem' }}>
                          <MessageSquare size={13} color="var(--primary-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={sub.instructorFeedback}>
                            {sub.instructorFeedback}
                          </span>
                        </div>
                      ) : sub.revisionNotes ? (
                        <div style={{ color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <RotateCcw size={12} />
                          <span>{sub.revisionNotes}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-subtle)' }}>لم يتم إرسال تعليق بعد</span>
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
                        style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
                      >
                        <Edit3 size={13} />
                        <span>{sub.grade !== undefined ? 'تعديل الدرجة والتعليق' : 'رصد الدرجة وإرسال التعليق'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* نافذة تصحيح وإرسال التعليق للطالب (Modal) */}
          {selectedSubmission && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(7, 13, 30, 0.75)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '1.5rem',
            }}>
              <div className="card" style={{ maxWidth: '640px', width: '100%', position: 'relative' }}>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="btn btn-ghost"
                  style={{ position: 'absolute', top: '12px', left: '12px' }}
                >
                  ✕
                </button>

                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                  تصحيح وتعديل تكليف الطالب: {selectedSubmission.studentName}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  الجامعة: {selectedSubmission.university} | النسخة المسلّمة: <strong>v{selectedSubmission.version}</strong>
                </p>

                {/* زر مباشر لفتح ملف الطالب في Google Drive */}
                <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block' }}>رابط الملف المرفوع من الطالب:</span>
                    <strong style={{ fontSize: '0.88rem' }}>ملف حل التكليف على Google Drive</strong>
                  </div>
                  <a
                    href={selectedSubmission.driveFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline"
                    style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}
                  >
                    <ExternalLink size={14} />
                    <span>فتح الملف في نافذة جديدة</span>
                  </a>
                </div>

                {/* خيار طلب إعادة التسليم والتعديل */}
                <div style={{ padding: '0.85rem', background: requestRevisionToggle ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-subtle)', border: requestRevisionToggle ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem' }}>
                    <input
                      type="checkbox"
                      checked={requestRevisionToggle}
                      onChange={(e) => setRequestRevisionToggle(e.target.checked)}
                    />
                    <RotateCcw size={16} color={requestRevisionToggle ? '#ef4444' : 'var(--primary-600)'} />
                    <span>طلب إعادة تسليم وتعديل العمل من الطالب (Request Revision)</span>
                  </label>
                  {requestRevisionToggle && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#b91c1c', marginBottom: '0.25rem' }}>
                        التعليمات المحددة للطالب لإعادة التسليم (ستظهر له فوراً):
                      </label>
                      <input
                        type="text"
                        value={revisionNotesInput}
                        onChange={(e) => setRevisionNotesInput(e.target.value)}
                        placeholder="مثال: يرجى استكمال معايير الاستبعاد في الصفحة 3 قبل اعتماد الدرجة..."
                        style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid #f87171', background: 'var(--bg-card)', color: 'var(--text-main)' }}
                      />
                    </div>
                  )}
                </div>

                {/* حقل رصد وتعديل الدرجة */}
                {!requestRevisionToggle && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        درجة التكليف المرصودة (من {selectedSubmission.maxScore}):
                      </label>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>يمكنك تعديل هذه الدرجة في أي وقت</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="number"
                        min={0}
                        max={selectedSubmission.maxScore}
                        value={gradeInput}
                        onChange={(e) => setGradeInput(Number(e.target.value))}
                        style={{ width: '130px', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '2px solid var(--primary-600)', fontSize: '1.2rem', fontWeight: 800, textAlign: 'center' }}
                      />
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>/ {selectedSubmission.maxScore} درجة</span>
                    </div>
                  </div>
                )}

                {/* مربع كتابة تعليق وملاحظات المدرس للطالب */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                    تعليق وملاحظات المدرس للطالب (Feedback) — ستظهر للطالب داخل صفحته:
                  </label>
                  <textarea
                    rows={4}
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    placeholder="اكتب تعليقك الأكاديمي، نقاط القوة ونقاط التحسين، وسيرى الطالب هذا التعليق في لوحة التحكم الخاصة به..."
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', fontFamily: 'var(--font-arabic)', fontSize: '0.9rem', color: 'var(--text-main)' }}
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

      {/* 2. تبويب محاولات الاختبارات ومراجعة وتعديل الدرجات (Exams Review & Override) */}
      {activeTab === 'exams' && (
        <div className="card">
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
              محاولات الطلاب في الاختبارات وتعديل الدرجات
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              يحسب المتصفح الدرجة تلقائياً بناءً على مفتاح الإجابات السري. تستطيع كمدرس مراجعة إجابات كل طالب، وتعديل الدرجة يدوياً (Manual Override) في أي وقت قبل أو بعد الاعتماد!
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.85rem' }}>اسم الطالب والجامعة</th>
                  <th style={{ padding: '0.85rem' }}>اسم الاختبار</th>
                  <th style={{ padding: '0.85rem' }}>تاريخ التسليم</th>
                  <th style={{ padding: '0.85rem' }}>الدرجة المحسوبة تلقائياً</th>
                  <th style={{ padding: '0.85rem' }}>الدرجة الرسمية المعتمدة</th>
                  <th style={{ padding: '0.85rem' }}>الحالة</th>
                  <th style={{ padding: '0.85rem' }}>الإجراء الأكاديمي</th>
                </tr>
              </thead>
              <tbody>
                {examAttempts.map((att) => (
                  <tr key={att.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.85rem' }}>
                      <strong style={{ display: 'block', color: 'var(--text-main)' }}>{att.studentName}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{att.university}</span>
                    </td>
                    <td style={{ padding: '0.85rem' }}>{att.examTitle}</td>
                    <td style={{ padding: '0.85rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{att.submittedAt}</td>
                    <td style={{ padding: '0.85rem', color: 'var(--primary-700)', fontWeight: 700 }}>
                      {att.calculatedScore} / {att.maxScore} (مسودة)
                    </td>
                    <td style={{ padding: '0.85rem', fontWeight: 800, fontSize: '1.05rem', color: att.officialGrade !== undefined ? 'var(--text-main)' : 'var(--text-muted)' }}>
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
                        style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
                      >
                        <Eye size={13} />
                        <span>{att.officialGrade !== undefined ? 'مراجعة وتعديل الدرجة' : 'مراجعة الأسئلة والاعتماد'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* نافذة مراجعة إجابات الطالب وتعديل الدرجة المحسوبة */}
          {selectedAttempt && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(7, 13, 30, 0.75)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '1.5rem',
            }}>
              <div className="card" style={{ maxWidth: '820px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
                <button
                  onClick={() => setSelectedAttempt(null)}
                  className="btn btn-ghost"
                  style={{ position: 'absolute', top: '12px', left: '12px' }}
                >
                  ✕
                </button>

                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                  مراجعة اختبار: {selectedAttempt.studentName}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  الدرجة المحسوبة برمجياً داخل واجهتك بناءً على مفتاح الحل: <strong>{selectedAttempt.calculatedScore} / {selectedAttempt.maxScore}</strong>
                </p>

                {/* جدول تفاصيل الأسئلة والإجابات */}
                <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-color)' }}>
                        <th style={{ padding: '0.6rem' }}>السؤال</th>
                        <th style={{ padding: '0.6rem' }}>إجابة الطالب</th>
                        <th style={{ padding: '0.6rem' }}>الإجابة الصحيحة</th>
                        <th style={{ padding: '0.6rem' }}>النقاط</th>
                        <th style={{ padding: '0.6rem' }}>التقييم</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAttempt.studentAnswers.map((ans, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.6rem' }}>{ans.questionText}</td>
                          <td style={{ padding: '0.6rem' }}>{ans.studentAnswer}</td>
                          <td style={{ padding: '0.6rem', color: 'var(--primary-600)', fontWeight: 700 }}>{ans.correctAnswer}</td>
                          <td style={{ padding: '0.6rem' }}>{ans.points}/{ans.maxPoints}</td>
                          <td style={{ padding: '0.6rem', fontWeight: 700, color: ans.isCorrect ? '#10b981' : '#ef4444' }}>
                            {ans.isCorrect ? '✓ صحيح' : '✗ خطأ'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* حقل تعديل الدرجة يدوياً من المدرس (Override) */}
                <div style={{ padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    تعديل واعتماد الدرجة يدوياً (Manual Score Override):
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
                    يمكنك تعديل الدرجة سواء بالزيادة أو النقصان وفق تقييمك التربوي، وسيتم حفظ التعديل في السجل الرسمي وسجل التدقيق.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '1rem', alignItems: 'center' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        الدرجة الرسمية المعتمدة:
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={selectedAttempt.maxScore}
                        value={overrideScoreInput}
                        onChange={(e) => setOverrideScoreInput(Number(e.target.value))}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '2px solid var(--primary-600)', fontSize: '1.2rem', fontWeight: 800, textAlign: 'center' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        سبب التعديل أو ملاحظات الاعتماد (تُحفظ في سجل التدقيق):
                      </label>
                      <input
                        type="text"
                        value={overrideReasonInput}
                        onChange={(e) => setOverrideReasonInput(e.target.value)}
                        placeholder="مثال: تم قبول الإجابة بناءً على توضيح الطالب في المحاضرة..."
                        style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-card)' }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => setSelectedAttempt(null)} className="btn btn-outline">
                    إلغاء
                  </button>
                  <button onClick={handleCommitExamGrade} className="btn btn-primary">
                    <CheckCircle2 size={16} />
                    <span>تثبيت واعتماد الدرجة الرسمية للطالب</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. تبويب مراجعة وبناء المنهج والدروس (Course Builder) */}
      {activeTab === 'curriculum' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                مراجعة تفاصيل الدروس ومحتوى الكورس
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                يمكن للمدرس مراجعة تفاصيل كل درس وسلايداته، وإضافة محاضرات جديدة وتعديل روابط YouTube و Google Drive في أي وقت.
              </p>
            </div>
            <button
              onClick={() => setIsAddLessonModalOpen(true)}
              className="btn btn-primary"
            >
              <Plus size={16} />
              <span>إضافة درس ومحاضرة جديدة</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {curriculum.modules.map((mod) => (
              <div key={mod.id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div style={{ padding: '0.85rem 1.25rem', background: 'var(--bg-subtle)', fontWeight: 800, fontSize: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{mod.title}</span>
                  <span className="badge badge-primary">{mod.lessons.length} دروس</span>
                </div>

                <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {mod.lessons.map((les) => (
                    <div
                      key={les.id}
                      style={{
                        padding: '0.85rem 1rem',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <BookOpen size={18} color="var(--primary-600)" />
                        <div>
                          <strong style={{ fontSize: '0.95rem' }}>{les.title}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem', marginTop: '0.2rem' }}>
                            <span>المدة: {les.durationMinutes} دقيقة</span>
                            <span>إلزامي: {les.isMandatory ? 'نعم' : 'لا'}</span>
                            <span>YouTube ID: <code>{les.youtubeId}</code></span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          onClick={() => setPreviewLesson(les)}
                          className="btn btn-outline"
                          style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                        >
                          <PlayCircle size={13} />
                          <span>معاينة الدرس</span>
                        </button>
                        {les.drivePdfUrl && (
                          <a
                            href={les.drivePdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-outline"
                            style={{ fontSize: '0.8rem', padding: '0.35rem 0.65rem' }}
                          >
                            <ExternalLink size={13} />
                            <span>ملف السلايدات</span>
                          </a>
                        )}
                        <span className="badge badge-emerald">منشور للطالب</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* نافذة معاينة الدرس للمدرس */}
          {previewLesson && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(7, 13, 30, 0.75)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '1.5rem',
            }}>
              <div className="card" style={{ maxWidth: '650px', width: '100%', position: 'relative' }}>
                <button
                  onClick={() => setPreviewLesson(null)}
                  className="btn btn-ghost"
                  style={{ position: 'absolute', top: '12px', left: '12px' }}
                >
                  ✕
                </button>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  معاينة الدرس: {previewLesson.title}
                </h3>
                <div style={{ width: '100%', aspectRatio: '16/9', background: '#070d1e', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: '1.25rem', color: '#fff' }}>
                  <div style={{ textAlign: 'center' }}>
                    <PlayCircle size={52} color="#3b82f6" style={{ margin: '0 auto 0.75rem' }} />
                    <p style={{ fontWeight: 700, margin: 0 }}>مقطع المحاضرة المضمّن عبر YouTube</p>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>المعرف: {previewLesson.youtubeId} | المدة: {previewLesson.durationMinutes} دقيقة</p>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {previewLesson.drivePdfUrl && (
                    <a href={previewLesson.drivePdfUrl} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
                      <ExternalLink size={14} />
                      <span>فتح ملف السلايدات (Drive PDF)</span>
                    </a>
                  )}
                  <button onClick={() => setPreviewLesson(null)} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
                    إغلاق المعاينة
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* نافذة إضافة درس جديد */}
          {isAddLessonModalOpen && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(7, 13, 30, 0.75)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '1.5rem',
            }}>
              <div className="card" style={{ maxWidth: '550px', width: '100%', position: 'relative' }}>
                <button
                  onClick={() => setIsAddLessonModalOpen(false)}
                  className="btn btn-ghost"
                  style={{ position: 'absolute', top: '12px', left: '12px' }}
                >
                  ✕
                </button>

                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                  إضافة درس ومحاضرة إلى الوحدة الأولى
                </h3>

                <form onSubmit={handleAddLesson} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      عنوان الدرس
                    </label>
                    <input
                      type="text"
                      required
                      value={newLessonTitle}
                      onChange={(e) => setNewLessonTitle(e.target.value)}
                      placeholder="مثال: الدرس 3: أدوات التحليل الإحصائي المتقدم"
                      style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      معرف فيديو المحاضرة (YouTube Video ID أو رابط كامل)
                    </label>
                    <input
                      type="text"
                      value={newLessonYoutube}
                      onChange={(e) => setNewLessonYoutube(e.target.value)}
                      placeholder="مثال: dQw4w9WgXcQ"
                      style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                      رابط سلايدات وملفات المحاضرة (Google Drive)
                    </label>
                    <input
                      type="url"
                      value={newLessonDrive}
                      onChange={(e) => setNewLessonDrive(e.target.value)}
                      placeholder="https://drive.google.com/file/d/..."
                      style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button type="button" onClick={() => setIsAddLessonModalOpen(false)} className="btn btn-outline">
                      إلغاء
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <Plus size={15} />
                      <span>حفظ ونشر الدرس للطلاب</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. تبويب رصد الامتحان العملي الحضوري */}
      {activeTab === 'practical' && (
        <div className="card">
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
              رصد وتعديل درجات الامتحان العملي الحضوري (بالجامعة)
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              يتم إجراء هذا الامتحان حضورياً في الجامعة، ويقوم المدرس برصد وتعديل الدرجة من 50 مباشرة عبر هذه اللوحة، وتنعكس فوراً في السجل الأكاديمي للطالب.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.85rem' }}>اسم الطالب والجامعة</th>
                  <th style={{ padding: '0.85rem' }}>الدرجة المرصودة (من 50)</th>
                  <th style={{ padding: '0.85rem' }}>الملاحظات الأكاديمية على الأداء</th>
                  <th style={{ padding: '0.85rem' }}>الحالة</th>
                  <th style={{ padding: '0.85rem' }}>الإجراء الأكاديمي</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.85rem' }}>
                    <strong>أحمد محمد الصالح</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>جامعة الملك سعود - كلية الطب</div>
                  </td>
                  <td style={{ padding: '0.85rem', fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                    {practicalGrades['student-1']?.score || 42} / 50
                  </td>
                  <td style={{ padding: '0.85rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {practicalGrades['student-1']?.notes || 'أداء ممتاز في اختبار تحليل البيانات الإحصائية الحضوري'}
                  </td>
                  <td style={{ padding: '0.85rem' }}>
                    <span className="badge badge-emerald">تم الرصد والاعتماد</span>
                  </td>
                  <td style={{ padding: '0.85rem' }}>
                    <button
                      onClick={() => setSelectedPracticalStudent({
                        id: 'student-1',
                        name: 'أحمد محمد الصالح',
                        score: practicalGrades['student-1']?.score || 42,
                        notes: practicalGrades['student-1']?.notes || 'أداء ممتاز في اختبار تحليل البيانات الإحصائية الحضوري',
                      })}
                      className="btn btn-outline"
                      style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
                    >
                      <Edit3 size={13} />
                      <span>تعديل الدرجة والملاحظات</span>
                    </button>
                  </td>
                </tr>

                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.85rem' }}>
                    <strong>سارة خالد الكيلاني</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>جامعة العلوم والتكنولوجيا - دكتور صيدلة</div>
                  </td>
                  <td style={{ padding: '0.85rem', fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                    {practicalGrades['student-2']?.score || 38} / 50
                  </td>
                  <td style={{ padding: '0.85rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {practicalGrades['student-2']?.notes || 'جيد جداً مع ملاحظة طفيفة في صياغة الفرضية'}
                  </td>
                  <td style={{ padding: '0.85rem' }}>
                    <span className="badge badge-emerald">تم الرصد والاعتماد</span>
                  </td>
                  <td style={{ padding: '0.85rem' }}>
                    <button
                      onClick={() => setSelectedPracticalStudent({
                        id: 'student-2',
                        name: 'سارة خالد الكيلاني',
                        score: practicalGrades['student-2']?.score || 38,
                        notes: practicalGrades['student-2']?.notes || 'جيد جداً مع ملاحظة طفيفة في صياغة الفرضية',
                      })}
                      className="btn btn-outline"
                      style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
                    >
                      <Edit3 size={13} />
                      <span>تعديل الدرجة والملاحظات</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* نافذة تعديل درجة العملي */}
          {selectedPracticalStudent && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(7, 13, 30, 0.75)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 100,
              padding: '1.5rem',
            }}>
              <div className="card" style={{ maxWidth: '520px', width: '100%', position: 'relative' }}>
                <button
                  onClick={() => setSelectedPracticalStudent(null)}
                  className="btn btn-ghost"
                  style={{ position: 'absolute', top: '12px', left: '12px' }}
                >
                  ✕
                </button>

                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                  رصد وتعديل درجة الامتحان العملي: {selectedPracticalStudent.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  الامتحان العملي الحضوري بكلية الطب
                </p>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    الدرجة المرصودة (من 50):
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={selectedPracticalStudent.score}
                    onChange={(e) => setSelectedPracticalStudent({ ...selectedPracticalStudent, score: Number(e.target.value) })}
                    style={{ width: '130px', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '2px solid var(--primary-600)', fontSize: '1.2rem', fontWeight: 800, textAlign: 'center' }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    الملاحظات الأكاديمية على أداء الطالب:
                  </label>
                  <input
                    type="text"
                    value={selectedPracticalStudent.notes}
                    onChange={(e) => setSelectedPracticalStudent({ ...selectedPracticalStudent, notes: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => setSelectedPracticalStudent(null)} className="btn btn-outline">
                    إلغاء
                  </button>
                  <button
                    onClick={() => {
                      if (onUpdatePracticalGrade) {
                        onUpdatePracticalGrade(selectedPracticalStudent.id, selectedPracticalStudent.score, selectedPracticalStudent.notes);
                      } else {
                        setLocalPracticalGrades({
                          ...practicalGrades,
                          [selectedPracticalStudent.id]: {
                            score: selectedPracticalStudent.score,
                            notes: selectedPracticalStudent.notes,
                          }
                        });
                      }

                      if (onLogAudit) {
                        onLogAudit(
                          'رصد/تعديل درجة الامتحان العملي الحضوري',
                          `رصد درجة الطالب (${selectedPracticalStudent.name}): ${selectedPracticalStudent.score}/50. الملاحظات: ${selectedPracticalStudent.notes}`
                        );
                      }

                      setSelectedPracticalStudent(null);
                    }}
                    className="btn btn-primary"
                  >
                    <Save size={15} />
                    <span>حفظ وتثبيت الدرجة</span>
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
