import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  Edit3, 
  FileText, 
  Layers, 
  Plus, 
  Save, 
  RotateCcw, 
  GraduationCap,
  Eye,
  PlayCircle,
  Award,
  Search,
  Trash2,
  FolderPlus,
  Headphones,
  Video,
  ArrowRight,
  Users,
  BarChart2,
  Clock,
  UserCheck,
  Archive,
  Check,
  X
} from 'lucide-react';
import { 
  INITIAL_COURSES,
  INITIAL_CURRICULUM,
  MockStudentSubmission,
  MockExamAttemptForInstructor,
  MockCourseCurriculum,
  MockCurriculumModule,
  MockLessonItem,
  MockAssignmentItem,
  MockExamItem,
  MockPendingEnrollment
} from '../../data/mockData';
import { Course, ResearchPaper } from '../../types';
import { AddCourseModal } from '../AddCourseModal';
import { AddResearchModal } from '../AddResearchModal';
import { EditCourseModal } from '../EditCourseModal';
import { sanitizeUrl } from '../../utils/security';
import {
  loadAllStudentDataForCourse,
  saveSubmission as fbSaveSubmission,
  saveExamAttempt as fbSaveExamAttempt,
  savePracticalGrade as fbSavePracticalGrade,
  loadPracticalGrades as fbLoadPracticalGrades,
} from '../../services/studentDataService';

export interface InstructorDashboardProps {
  courses?: Course[];
  activeCourseId?: string;
  onSelectCourseId?: (courseId: string) => void;
  onAddCourse?: (newCourse: Course) => void;
  onUpdateCourse?: (updatedCourse: Course) => void;
  onDeleteCourse?: (courseId: string) => void;
  onAddResearch?: (newPaper: ResearchPaper) => void;
  submissions?: MockStudentSubmission[];
  onUpdateSubmission?: (updated: MockStudentSubmission) => void;
  examAttempts?: MockExamAttemptForInstructor[];
  onUpdateExamAttempt?: (updated: MockExamAttemptForInstructor) => void;
  curriculum?: MockCourseCurriculum;
  onUpdateCurriculum?: (updated: MockCourseCurriculum) => void;
  practicalGrades?: Record<string, { score: number; notes: string }>;
  onUpdatePracticalGrade?: (studentId: string, score: number, notes: string) => void;
  enrollments?: MockPendingEnrollment[];
  onApproveEnrollment?: (id: string) => void;
  onRejectEnrollment?: (id: string) => void;
  onArchiveEnrollment?: (id: string) => void;
  onDeleteEnrollment?: (id: string) => void;
  onArchiveAllProcessed?: (courseId?: string) => void;
  onLogAudit?: (action: string, details: string) => void;
}

export const InstructorDashboard: React.FC<InstructorDashboardProps> = ({
  courses = INITIAL_COURSES,
  activeCourseId: propActiveCourseId,
  onSelectCourseId,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onAddResearch,
  submissions: propSubmissions,
  onUpdateSubmission,
  examAttempts: propExamAttempts,
  onUpdateExamAttempt,
  curriculum: propCurriculum,
  onUpdateCurriculum,
  practicalGrades: propPracticalGrades,
  onUpdatePracticalGrade,
  enrollments = [],
  onApproveEnrollment,
  onRejectEnrollment,
  onArchiveEnrollment,
  onDeleteEnrollment,
  onArchiveAllProcessed,
  onLogAudit,
}) => {
  const [activeTab, setActiveTab] = useState<'curriculum' | 'exams' | 'assignments' | 'practical' | 'progress' | 'enrollments'>('curriculum');
  const [enrollFilter, setEnrollFilter] = useState<'active' | 'pending' | 'approved' | 'rejected' | 'archived' | 'all'>('active');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(() => {
    if (propActiveCourseId && courses.some((c) => c.id === propActiveCourseId)) {
      return propActiveCourseId;
    }
    return null;
  });

  useEffect(() => {
    if (propActiveCourseId && courses.some((c) => c.id === propActiveCourseId)) {
      setSelectedCourseId(propActiveCourseId);
    } else if (!propActiveCourseId || (selectedCourseId && !courses.some((c) => c.id === selectedCourseId))) {
      setSelectedCourseId(null);
    }
  }, [propActiveCourseId, courses]);

  // الكورس النشط حالياً عند الدخول لإدارته
  const currentCourse = selectedCourseId ? (courses.find((c) => c.id === selectedCourseId) || null) : null;
  const isLevel1 = !selectedCourseId || !currentCourse;

  // طلبات التسجيل الخاصة بهذا الكورس
  const courseEnrollments = (enrollments || []).filter(
    (e) => e.courseId === currentCourse?.id
  );

  // الطلاب المعتمدون في الكورس المحدد
  const courseApprovedStudents = courseEnrollments.filter(
    (e) => e.status === 'approved'
  );

  const filteredCourseEnrollments = courseEnrollments.filter((enr) => {
    if (enrollFilter === 'active') return enr.status !== 'archived';
    if (enrollFilter === 'pending') return enr.status === 'pending';
    if (enrollFilter === 'approved') return enr.status === 'approved';
    if (enrollFilter === 'rejected') return enr.status === 'rejected';
    if (enrollFilter === 'archived') return enr.status === 'archived';
    return true;
  });

  // بيانات التكليفات
  const [localSubmissions, setLocalSubmissions] = useState<MockStudentSubmission[]>(propSubmissions || []);
  const submissions = propSubmissions || localSubmissions;

  // تصفية التكليفات الخاصة بطلاب هذا الكورس
  const courseSubmissions = submissions.filter((sub) =>
    courseApprovedStudents.some((s) => s.studentUid === sub.studentUid || (s.studentName && s.studentName === sub.studentName))
  );

  const [selectedSubmission, setSelectedSubmission] = useState<MockStudentSubmission | null>(null);
  const [gradeInput, setGradeInput] = useState<number>(0);
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [requestRevisionToggle, setRequestRevisionToggle] = useState<boolean>(false);
  const [revisionNotesInput, setRevisionNotesInput] = useState<string>('');

  // بيانات الاختبارات
  const [localExamAttempts, setLocalExamAttempts] = useState<MockExamAttemptForInstructor[]>(propExamAttempts || []);
  const examAttempts = propExamAttempts || localExamAttempts;

  // تصفية الاختبارات الخاصة بطلاب هذا الكورس
  const courseExamAttempts = examAttempts.filter((att) =>
    courseApprovedStudents.some((s) => s.studentUid === att.studentUid || (s.studentName && s.studentName === att.studentName))
  );

  const [selectedAttempt, setSelectedAttempt] = useState<MockExamAttemptForInstructor | null>(null);
  const [overrideScoreInput, setOverrideScoreInput] = useState<number>(0);
  const [overrideReasonInput, setOverrideReasonInput] = useState<string>('');

  // فلاتر وبحث التكليفات والاختبارات
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [submissionFilter, setSubmissionFilter] = useState<'all' | 'submitted' | 'graded' | 'revision_required'>('all');

  const [examSearch, setExamSearch] = useState('');
  const [examFilter, setExamFilter] = useState<'all' | 'approved' | 'pending'>('all');

  const filteredSubmissions = courseSubmissions.filter((sub) => {
    const matchesStatus = submissionFilter === 'all' || sub.status === submissionFilter;
    const matchesSearch = sub.studentName.toLowerCase().includes(submissionSearch.toLowerCase()) ||
      sub.university.toLowerCase().includes(submissionSearch.toLowerCase()) ||
      sub.assignmentTitle.toLowerCase().includes(submissionSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredExamAttempts = courseExamAttempts.filter((att) => {
    const matchesStatus = examFilter === 'all' || 
      (examFilter === 'approved' ? att.status === 'approved' : att.status !== 'approved');
    const matchesSearch = att.studentName.toLowerCase().includes(examSearch.toLowerCase()) ||
      att.university.toLowerCase().includes(examSearch.toLowerCase()) ||
      att.examTitle.toLowerCase().includes(examSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // بيانات المنهج
  const [localCurriculum, setLocalCurriculum] = useState(INITIAL_CURRICULUM);
  const curriculum = propCurriculum || localCurriculum;

  // إدارة المديولات والوحدات
  const [targetModuleId, setTargetModuleId] = useState<string>('');
  const [isAddModuleModalOpen, setIsAddModuleModalOpen] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');
  const [newModuleStatus, setNewModuleStatus] = useState<'published' | 'coming_soon'>('published');
  const [isEditModuleModalOpen, setIsEditModuleModalOpen] = useState(false);
  const [moduleToEdit, setModuleToEdit] = useState<MockCurriculumModule | null>(null);
  const [editModuleTitle, setEditModuleTitle] = useState('');
  const [editModuleDesc, setEditModuleDesc] = useState('');
  const [editModuleStatus, setEditModuleStatus] = useState<'published' | 'coming_soon'>('published');

  // نوافذ الإضافة والتعديل العامة
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
  const [isAddResearchModalOpen, setIsAddResearchModalOpen] = useState(false);

  // حالة معاينة الدرس
  const [previewLesson, setPreviewLesson] = useState<MockLessonItem | null>(null);

  // الدرجات العملية
  const [localPracticalGrades, setLocalPracticalGrades] = useState<Record<string, { score: number; notes: string }>>({});
  const practicalGrades = propPracticalGrades || localPracticalGrades;
  const [selectedPracticalStudent, setSelectedPracticalStudent] = useState<{ id: string; name: string; score: number; notes: string } | null>(null);
  const [isAddPracticalModalOpen, setIsAddPracticalModalOpen] = useState(false);
  const [newPracticalStudentUid, setNewPracticalStudentUid] = useState('');
  const [newPracticalScore, setNewPracticalScore] = useState(40);
  const [newPracticalNotes, setNewPracticalNotes] = useState('أداء متميز في الاختبار العملي الحضوري');

  // تحميل بيانات الطلاب من Firebase عند اختيار كورس
  useEffect(() => {
    if (!currentCourse?.id) return;
    const courseId = currentCourse.id;

    // تحميل كل بيانات الطلاب
    loadAllStudentDataForCourse(courseId).then((data) => {
      // دمج التسليمات
      if (data.submissions && Object.keys(data.submissions).length > 0) {
        const fbSubs: MockStudentSubmission[] = [];
        Object.entries(data.submissions).forEach(([uid, subs]) => {
          subs.forEach((sub) => {
            fbSubs.push({
              id: sub.assignmentId || `sub-fb-${uid}`,
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
        if (fbSubs.length > 0) {
          setLocalSubmissions((prev) => {
            const merged = [...prev];
            fbSubs.forEach((fb) => {
              if (!merged.some((s) => s.studentUid === fb.studentUid && s.assignmentTitle === fb.assignmentTitle)) {
                merged.push(fb);
              }
            });
            return merged;
          });
        }
      }

      // دمج محاولات الاختبار
      if (data.examAttempts && Object.keys(data.examAttempts).length > 0) {
        const fbAtts: MockExamAttemptForInstructor[] = [];
        Object.entries(data.examAttempts).forEach(([uid, attempts]) => {
          attempts.forEach((att) => {
            fbAtts.push({
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
        if (fbAtts.length > 0) {
          setLocalExamAttempts((prev) => {
            const merged = [...prev];
            fbAtts.forEach((fb) => {
              if (!merged.some((a) => a.studentUid === fb.studentUid && a.examTitle === fb.examTitle)) {
                merged.push(fb);
              }
            });
            return merged;
          });
        }
      }

      // دمج الدرجات العملية
      if (data.practicalGrades && Object.keys(data.practicalGrades).length > 0) {
        setLocalPracticalGrades((prev) => ({ ...prev, ...data.practicalGrades }));
      }
    }).catch(() => {});
  }, [currentCourse?.id]);

  // نافذة إضافة درس
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);
  const [lessonMediaType, setLessonMediaType] = useState<'video' | 'audio'>('video');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonYoutube, setNewLessonYoutube] = useState('');
  const [newLessonAudio, setNewLessonAudio] = useState('');
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
  const [newQPoints] = useState(5);

  // تبديل الكورس
  const handleSelectCourse = (id: string) => {
    setSelectedCourseId(id);
    if (onSelectCourseId) onSelectCourseId(id);
  };

  // العودة لقائمة الكورسات
  const handleBackToCourses = () => {
    setSelectedCourseId(null);
    if (onSelectCourseId) onSelectCourseId('');
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

    // حفظ تحديث التكليف في Firebase
    if (updatedSub.studentUid && currentCourse?.id) {
      fbSaveSubmission(updatedSub.studentUid, currentCourse.id, {
        assignmentId: updatedSub.id,
        assignmentTitle: updatedSub.assignmentTitle,
        driveFileUrl: updatedSub.driveFileUrl,
        status: updatedSub.status,
        grade: updatedSub.grade ?? null,
        maxScore: updatedSub.maxScore,
        instructorFeedback: updatedSub.instructorFeedback || '',
        version: updatedSub.version,
        submittedAt: updatedSub.submittedAt,
        revisionNotes: updatedSub.revisionNotes || '',
      }).catch(() => {});
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

    // حفظ تحديث درجة الاختبار في Firebase
    if (updatedAtt.studentUid && currentCourse?.id) {
      fbSaveExamAttempt(updatedAtt.studentUid, currentCourse.id, {
        examId: updatedAtt.examTitle || updatedAtt.id,
        selectedAnswers: {},
        calculatedScore: updatedAtt.officialGrade ?? updatedAtt.calculatedScore ?? 0,
        examSubmitted: true,
        submittedAt: updatedAtt.submittedAt || new Date().toISOString(),
      }).catch(() => {});
    }

    if (onLogAudit) {
      onLogAudit(
        'اعتماد/تعديل درجة اختبار نظري',
        `تعديل واعتماد درجة الطالب (${selectedAttempt.studentName}): ${overrideScoreInput}/${selectedAttempt.maxScore}. الملاحظات: ${overrideReasonInput || 'معتمدة دون ملاحظات'}`
      );
    }

    setSelectedAttempt(null);
  };

  // 1. إضافة مديول / وحدة دراسية جديدة
  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;

    const newMod: MockCurriculumModule = {
      id: `mod-${Date.now()}`,
      title: newModuleTitle.trim(),
      description: newModuleDesc.trim() || undefined,
      status: newModuleStatus,
      lessons: [],
      assignments: [],
      exams: [],
    };

    const updatedCurriculum: MockCourseCurriculum = {
      ...curriculum,
      modules: [...(curriculum.modules || []), newMod],
    };

    if (onUpdateCurriculum) onUpdateCurriculum(updatedCurriculum);
    else setLocalCurriculum(updatedCurriculum);

    if (onLogAudit) {
      onLogAudit('إضافة مديول دراسي', `تم إنشاء وحدة دراسية جديدة: "${newModuleTitle}" (${newModuleStatus === 'coming_soon' ? 'قريباً' : 'منشورة'}) بكورس ${currentCourse?.code}`);
    }

    setIsAddModuleModalOpen(false);
    setNewModuleTitle('');
    setNewModuleDesc('');
    setNewModuleStatus('published');
  };

  // 2. تعديل اسم ووصف المديول
  const handleSaveEditModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleToEdit || !editModuleTitle.trim()) return;

    const updatedCurriculum: MockCourseCurriculum = {
      ...curriculum,
      modules: (curriculum.modules || []).map((m) =>
        m.id === moduleToEdit.id
          ? { 
              ...m, 
              title: editModuleTitle.trim(), 
              description: editModuleDesc.trim() || undefined,
              status: editModuleStatus
            }
          : m
      ),
    };

    if (onUpdateCurriculum) onUpdateCurriculum(updatedCurriculum);
    else setLocalCurriculum(updatedCurriculum);

    if (onLogAudit) {
      onLogAudit('تعديل مديول دراسي', `تم تعديل بيانات وحالة الوحدة: "${editModuleTitle}"`);
    }

    setIsEditModuleModalOpen(false);
    setModuleToEdit(null);
  };

  // 3. حذف مديول بالكامل
  const handleDeleteModule = (modId: string, modTitle: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الوحدة: "${modTitle}" وجميع محتوياتها من محاضرات وتكليفات؟`)) return;

    const updatedCurriculum: MockCourseCurriculum = {
      ...curriculum,
      modules: (curriculum.modules || []).filter((m) => m.id !== modId),
    };

    if (onUpdateCurriculum) onUpdateCurriculum(updatedCurriculum);
    else setLocalCurriculum(updatedCurriculum);

    if (onLogAudit) {
      onLogAudit('حذف مديول دراسي', `تم حذف الوحدة "${modTitle}"`);
    }
  };

  // 4. إضافة درس جديد لمديول محدد
  const handleAddLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim()) return;

    const targetModId = targetModuleId || curriculum.modules?.[0]?.id;
    const newLesson: MockLessonItem = {
      id: `les-${Date.now()}`,
      title: newLessonTitle.trim(),
      mediaType: lessonMediaType,
      youtubeId: lessonMediaType === 'video' ? (newLessonYoutube.trim() || 'dQw4w9WgXcQ') : undefined,
      driveAudioUrl: lessonMediaType === 'audio' ? newLessonAudio.trim() : undefined,
      audioUrl: lessonMediaType === 'audio' ? newLessonAudio.trim() : undefined,
      durationMinutes: 45,
      isMandatory: true,
      drivePdfUrl: newLessonDrive.trim() || 'https://drive.google.com',
    };

    let modules = [...(curriculum.modules || [])];
    if (modules.length === 0) {
      modules = [{
        id: `mod-${Date.now()}`,
        title: 'الوحدة الأولى: مدخل ومقدمة عامة',
        lessons: [newLesson],
        assignments: [],
        exams: [],
      }];
    } else {
      modules = modules.map((m) =>
        (m.id === targetModId || (!targetModId && m === modules[0]))
          ? { ...m, lessons: [...(m.lessons || []), newLesson] }
          : m
      );
    }

    const updatedCurriculum: MockCourseCurriculum = {
      ...curriculum,
      modules,
    };

    if (onUpdateCurriculum) onUpdateCurriculum(updatedCurriculum);
    else setLocalCurriculum(updatedCurriculum);

    if (onLogAudit) {
      onLogAudit('إضافة درس ومحاضرة', `إضافة درس جديد: "${newLessonTitle}" بكورس ${currentCourse?.code}`);
    }

    setIsAddLessonModalOpen(false);
    setLessonMediaType('video');
    setNewLessonTitle('');
    setNewLessonYoutube('');
    setNewLessonAudio('');
    setNewLessonDrive('');
  };

  // 5. حذف درس من مديول
  const handleDeleteLesson = (modId: string, lesId: string, lesTitle: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الدرس: "${lesTitle}"؟`)) return;

    const updatedCurriculum: MockCourseCurriculum = {
      ...curriculum,
      modules: (curriculum.modules || []).map((m) =>
        m.id === modId
          ? { ...m, lessons: (m.lessons || []).filter((l) => l.id !== lesId) }
          : m
      ),
    };

    if (onUpdateCurriculum) onUpdateCurriculum(updatedCurriculum);
    else setLocalCurriculum(updatedCurriculum);

    if (onLogAudit) {
      onLogAudit('حذف درس', `تم حذف الدرس "${lesTitle}" من كورس ${currentCourse?.code}`);
    }
  };

  // 6. إضافة تكليف جديد لمديول محدد
  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentTitle.trim()) return;

    const targetModId = targetModuleId || curriculum.modules?.[0]?.id;
    const newAsg: MockAssignmentItem = {
      id: `asg-${Date.now()}`,
      title: assignmentTitle.trim(),
      instructions: assignmentInstructions.trim() || undefined,
      driveTemplateUrl: assignmentDriveTemplate.trim() || undefined,
      maxScore: Number(assignmentMaxScore) || 20,
      deadline: assignmentDeadline,
    };

    let modules = [...(curriculum.modules || [])];
    if (modules.length === 0) {
      modules = [{
        id: `mod-${Date.now()}`,
        title: 'الوحدة الأولى: مدخل ومقدمة عامة',
        lessons: [],
        assignments: [newAsg],
        exams: [],
      }];
    } else {
      modules = modules.map((m) =>
        (m.id === targetModId || (!targetModId && m === modules[0]))
          ? { ...m, assignments: [...(m.assignments || []), newAsg] }
          : m
      );
    }

    const updatedCurriculum: MockCourseCurriculum = {
      ...curriculum,
      modules,
    };

    if (onUpdateCurriculum) onUpdateCurriculum(updatedCurriculum);
    else setLocalCurriculum(updatedCurriculum);

    if (onLogAudit) {
      onLogAudit('إضافة تكليف أكاديمي جديد', `تم إنشاء ونشر تكليف: "${assignmentTitle}" بدرجة ${assignmentMaxScore}`);
    }

    setIsAddAssignmentModalOpen(false);
    setAssignmentTitle('');
    setAssignmentInstructions('');
    setAssignmentDriveTemplate('');
  };

  // 7. حذف تكليف من مديول
  const handleDeleteAssignment = (modId: string, asgId: string, asgTitle: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف التكليف: "${asgTitle}"؟`)) return;

    const updatedCurriculum: MockCourseCurriculum = {
      ...curriculum,
      modules: (curriculum.modules || []).map((m) =>
        m.id === modId
          ? { ...m, assignments: (m.assignments || []).filter((a) => a.id !== asgId) }
          : m
      ),
    };

    if (onUpdateCurriculum) onUpdateCurriculum(updatedCurriculum);
    else setLocalCurriculum(updatedCurriculum);

    if (onLogAudit) {
      onLogAudit('حذف تكليف', `تم حذف التكليف "${asgTitle}"`);
    }
  };

  // 8. إضافة سؤال لمصفوفة أسئلة الاختبار
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

  // 9. حفظ ونشر الاختبار الجديد لمديول محدد
  const handleSaveExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) return;

    const targetModId = targetModuleId || curriculum.modules?.[0]?.id;
    const newExamItem: MockExamItem = {
      id: `exam-${Date.now()}`,
      title: examTitle.trim(),
      examType: examType,
      durationMinutes: Number(examDuration) || 30,
      maxScore: Number(examMaxScore) || 30,
      questions: examQuestions.map((q, idx) => ({
        id: `q-${idx}`,
        text: q.qText,
        options: [q.optA, q.optB, q.optC, q.optD],
        correctIndex: q.correctOpt === 'A' ? 0 : q.correctOpt === 'B' ? 1 : q.correctOpt === 'C' ? 2 : 3,
        points: q.points,
      })),
    };

    let modules = [...(curriculum.modules || [])];
    if (modules.length === 0) {
      modules = [{
        id: `mod-${Date.now()}`,
        title: 'الوحدة الأولى: مدخل ومقدمة عامة',
        lessons: [],
        assignments: [],
        exams: [newExamItem],
      }];
    } else {
      modules = modules.map((m) =>
        (m.id === targetModId || (!targetModId && m === modules[0]))
          ? { ...m, exams: [...(m.exams || []), newExamItem] }
          : m
      );
    }

    const updatedCurriculum: MockCourseCurriculum = {
      ...curriculum,
      modules,
    };

    if (onUpdateCurriculum) onUpdateCurriculum(updatedCurriculum);
    else setLocalCurriculum(updatedCurriculum);


    if (onLogAudit) {
      onLogAudit('إضافة اختبار أكاديمي جديد', `تم إنشاء ونشر اختبار: "${examTitle}" (${examQuestions.length} أسئلة)`);
    }

    setIsAddExamModalOpen(false);
    setExamTitle('');
  };

  // 10. حذف اختبار من مديول
  const handleDeleteExam = (modId: string, exId: string, exTitle: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الاختبار: "${exTitle}"؟`)) return;

    const updatedCurriculum: MockCourseCurriculum = {
      ...curriculum,
      modules: (curriculum.modules || []).map((m) =>
        m.id === modId
          ? { ...m, exams: (m.exams || []).filter((e) => e.id !== exId) }
          : m
      ),
    };

    if (onUpdateCurriculum) onUpdateCurriculum(updatedCurriculum);
    else setLocalCurriculum(updatedCurriculum);

    if (onLogAudit) {
      onLogAudit('حذف اختبار', `تم حذف الاختبار "${exTitle}"`);
    }
  };

  return (
    <div>
      {/* المستوى الأول: قائمة الكورسات الحالية (عند عدم اختيار كورس محدد) */}
      {isLevel1 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1.5rem',
            background: 'var(--bg-card)',
            padding: '1.25rem 1.5rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                <span className="badge badge-emerald" style={{ fontSize: '0.82rem' }}>
                  👨‍🏫 إدارة المقررات والتعليم الأكاديمي
                </span>
              </div>
              <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--text-main)', margin: 0 }}>
                قائمة الكورسات الحالية
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.3rem 0 0' }}>
                اختر الكورس الأكاديمي لإدارة منهجه ومحاضراته، متابعة تقدم الطلاب المسجلين فيه، ورصد وتصحيح التكليفات والاختبارات والامتحان العملي.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {onAddCourse && (
                <button
                  onClick={() => setIsAddCourseModalOpen(true)}
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                >
                  <Plus size={15} />
                  <span>إضافة كورس جديد</span>
                </button>
              )}
              {onAddResearch && (
                <button
                  onClick={() => setIsAddResearchModalOpen(true)}
                  className="btn btn-outline"
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                >
                  <Plus size={15} />
                  <span>إضافة بحث منشور</span>
                </button>
              )}
            </div>
          </div>

          {/* شبكة بطاقات الكورسات أو رسالة الحالة الفارغة */}
          {courses.length === 0 ? (
            <div className="card" style={{
              textAlign: 'center',
              padding: '3.5rem 1.5rem',
              borderRadius: 'var(--radius-lg)',
              border: '2px dashed var(--border-color)',
              background: 'var(--bg-card)',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                لا توجد كورسات مضافة حالياً في المنصة
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
                ابدأ بإضافة أول كورس أكاديمي لمنتدى أسيرا لتتمكن من بناء المنهج، وضع الاختبارات والتكليفات، ومتابعة الطلاب المسجلين فيه.
              </p>
              {onAddCourse && (
                <button
                  onClick={() => setIsAddCourseModalOpen(true)}
                  className="btn btn-primary"
                  style={{ fontSize: '0.9rem', padding: '0.6rem 1.4rem' }}
                >
                  <Plus size={16} />
                  <span>إضافة أول كورس أكاديمي الآن</span>
                </button>
              )}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.25rem',
            }}>
              {courses.map((course) => {
                const enrolledInCourse = (enrollments || []).filter((e) => e.courseId === course.id && e.status === 'approved');
                const pendingInCourse = (enrollments || []).filter((e) => e.courseId === course.id && e.status === 'pending');
                return (
                  <div
                    key={course.id}
                    className="card"
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      cursor: 'pointer',
                      border: '1px solid var(--border-color)',
                      padding: '1.35rem',
                    }}
                    onClick={() => handleSelectCourse(course.id)}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span className="badge badge-emerald" style={{ fontWeight: 800 }}>
                          {course.code}
                        </span>
                        <span className="badge badge-subtle" style={{ fontSize: '0.78rem' }}>
                          درجة النجاح: {course.passingScore}%
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                        {course.title}
                      </h3>

                      <p style={{
                        fontSize: '0.84rem',
                        color: 'var(--text-muted)',
                        lineHeight: 1.5,
                        marginBottom: '1rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {course.summary || course.description}
                      </p>

                      <div style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        marginBottom: '0.85rem'
                      }}>
                        <Users size={14} />
                        <span>المشرفون: <strong>{course.instructorNames?.join('، ') || 'المشرف الأكاديمي'}</strong></span>
                      </div>
                    </div>

                    <div style={{
                      paddingTop: '0.85rem',
                      borderTop: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <span className="badge badge-primary" style={{ fontSize: '0.78rem' }}>
                          👥 {enrolledInCourse.length} طلاب مسجلون
                        </span>
                        {pendingInCourse.length > 0 && (
                          <span className="badge badge-gold" style={{ fontSize: '0.74rem' }}>
                            ⏳ {pendingInCourse.length} بانتظار القبول
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectCourse(course.id);
                          }}
                          className="btn btn-primary"
                          style={{ fontSize: '0.82rem', padding: '0.35rem 0.85rem' }}
                        >
                          <span>إدارة الكورس ←</span>
                        </button>
                        {onDeleteCourse && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`هل أنت متأكد من حذف المقرر (${course.code}: ${course.title}) نهائياً من المنصة؟`)) {
                                onDeleteCourse(course.id);
                                if (onLogAudit) {
                                  onLogAudit('حذف كورس', `تم حذف الكورس ${course.code} من قائمة الكورسات`);
                                }
                              }
                            }}
                            className="btn btn-ghost"
                            style={{ padding: '0.35rem 0.6rem', color: '#ef4444' }}
                            title="حذف هذا المقرر نهائياً"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* المستوى الثاني: نافذة إدارة الكورس المختار */}
      {!isLevel1 && currentCourse && (
        <>
          {/* شريط رأس الكورس والعودة لقائمة الكورسات */}
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
              <button
                onClick={handleBackToCourses}
                className="btn btn-outline"
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                title="العودة إلى قائمة الكورسات"
              >
                <ArrowRight size={15} />
                <span>العودة إلى قائمة الكورسات</span>
              </button>

              <span className="badge badge-emerald" style={{ fontSize: '0.85rem', fontWeight: 800 }}>
                {currentCourse.code}
              </span>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {currentCourse.title}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setIsEditCourseModalOpen(true)}
                className="btn btn-outline"
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
                title="تعديل تفاصيل الكورس أو حذفه نهائياً"
              >
                <Edit3 size={14} />
                <span>إعدادات وحذف الكورس</span>
              </button>

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

          {/* تبويبات المشرف الأكاديمية بالترتيب الجديد المطلوب */}
          <div className="lms-tabs-bar">
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`btn lms-tab-btn ${activeTab === 'curriculum' ? 'btn-primary' : 'btn-ghost'}`}
            >
              <Layers size={16} />
              <span>المنهج والوحدات الدراسية (Curriculum Builder)</span>
            </button>

            <button
              onClick={() => setActiveTab('exams')}
              className={`btn lms-tab-btn ${activeTab === 'exams' ? 'btn-primary' : 'btn-ghost'}`}
            >
              <CheckCircle2 size={16} />
              <span>مراجعة درجات الاختبارات ({courseExamAttempts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('assignments')}
              className={`btn lms-tab-btn ${activeTab === 'assignments' ? 'btn-primary' : 'btn-ghost'}`}
            >
              <FileText size={16} />
              <span>تصحيح التكليفات ({courseSubmissions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('practical')}
              className={`btn lms-tab-btn ${activeTab === 'practical' ? 'btn-primary' : 'btn-ghost'}`}
            >
              <GraduationCap size={16} />
              <span>الامتحان العملي الحضوري</span>
            </button>

            <button
              onClick={() => setActiveTab('progress')}
              className={`btn lms-tab-btn ${activeTab === 'progress' ? 'btn-primary' : 'btn-ghost'}`}
            >
              <Award size={16} />
              <span>متابعة تقدم الطلاب ({courseApprovedStudents.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('enrollments')}
              className={`btn lms-tab-btn ${activeTab === 'enrollments' ? 'btn-primary' : 'btn-ghost'}`}
            >
              <Users size={16} />
              <span>طلبات التسجيل ({courseEnrollments.filter((e) => e.status !== 'archived').length})</span>
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

          {/* شريط البحث وفلاتر حالة التكليفات */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
              <input
                type="text"
                value={submissionSearch}
                onChange={(e) => setSubmissionSearch(e.target.value)}
                placeholder="ابحث باسم الطالب أو الجامعة أو التكليف..."
                style={{
                  width: '100%',
                  padding: '0.55rem 2.2rem 0.55rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
              />
              <Search size={16} color="var(--text-subtle)" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setSubmissionFilter('all')}
                className={`btn ${submissionFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)' }}
              >
                الكل ({submissions.length})
              </button>
              <button
                onClick={() => setSubmissionFilter('submitted')}
                className={`btn ${submissionFilter === 'submitted' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)' }}
              >
                بانتظار التصحيح ({submissions.filter(s => s.status === 'submitted').length})
              </button>
              <button
                onClick={() => setSubmissionFilter('graded')}
                className={`btn ${submissionFilter === 'graded' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)' }}
              >
                تم الرصد ({submissions.filter(s => s.status === 'graded').length})
              </button>
              <button
                onClick={() => setSubmissionFilter('revision_required')}
                className={`btn ${submissionFilter === 'revision_required' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)' }}
              >
                مطلوب تعديل ({submissions.filter(s => s.status === 'revision_required').length})
              </button>
            </div>
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
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                      لا توجد تسليمات تكليفات مسجلة حالياً
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub) => (
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
                          href={sanitizeUrl(sub.driveFileUrl)}
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
                            setGradeInput(sub.grade !== undefined ? sub.grade : 0);
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
                ))
              )}
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
                <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>ملف حل التكليف على Google Drive:</span>
                    <a
                      href={sanitizeUrl(selectedSubmission.driveFileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-outline"
                      style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}
                    >
                      <ExternalLink size={13} />
                      <span>فتح الملف في نافذة جديدة</span>
                    </a>
                  </div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>
                    💡 إذا تعذر فتح الملف أو ظهرت رسالة إذن بالدخول (Access Denied)، فعّل خيار "طلب إعادة تسليم وتعديل العمل" بالأسفل لتنبيه الطالب بفتح صلاحية العرض (Viewer).
                  </span>
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

          {/* شريط البحث والفلترة للاختبارات */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
              <input
                type="text"
                value={examSearch}
                onChange={(e) => setExamSearch(e.target.value)}
                placeholder="ابحث باسم الطالب أو الاختبار..."
                style={{
                  width: '100%',
                  padding: '0.55rem 2.2rem 0.55rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
              />
              <Search size={16} color="var(--text-subtle)" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setExamFilter('all')}
                className={`btn ${examFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)' }}
              >
                الكل ({examAttempts.length})
              </button>
              <button
                onClick={() => setExamFilter('pending')}
                className={`btn ${examFilter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)' }}
              >
                بانتظار المراجعة ({examAttempts.filter(a => a.status !== 'approved').length})
              </button>
              <button
                onClick={() => setExamFilter('approved')}
                className={`btn ${examFilter === 'approved' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.78rem', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)' }}
              >
                معتمدة رسمياً ({examAttempts.filter(a => a.status === 'approved').length})
              </button>
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
                {filteredExamAttempts.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                      لا توجد محاولات اختبارات مسجلة حالياً
                    </td>
                  </tr>
                ) : (
                  filteredExamAttempts.map((att) => (
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
                ))
              )}
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

      {/* 3. تبويب منشئ المحتوى والتقييمات بالمديولات (Modular Curriculum Builder) */}
      {activeTab === 'curriculum' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* شريط الإجراءات لإنشاء المديولات والدروس والتكاليف والامتحانات */}
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '4px solid var(--primary-600)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-primary">{currentCourse?.code}</span>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                  منشئ المنهج والمديولات والتقييمات الأكاديمية
                </h2>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                هيكلة الكورس على شكل وحدات (Modules)، وبناء المحاضرات والتكليفات والامتحانات داخل كل وحدة بالترتيب لكورس: <strong>{currentCourse?.title}</strong>
              </p>
            </div>

            {/* أزرار الإجراءات الرئيسية */}
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  setNewModuleTitle('');
                  setNewModuleDesc('');
                  setIsAddModuleModalOpen(true);
                }}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem' }}
                id="add-new-module-btn"
              >
                <FolderPlus size={16} />
                <span>+ إضافة مديول / وحدة دراسية</span>
              </button>

              <button
                onClick={() => {
                  setTargetModuleId(curriculum.modules?.[0]?.id || '');
                  setIsAddLessonModalOpen(true);
                }}
                className="btn btn-outline"
                style={{ fontSize: '0.85rem' }}
              >
                <Plus size={15} />
                <span>إضافة محاضرة</span>
              </button>

              <button
                onClick={() => {
                  setTargetModuleId(curriculum.modules?.[0]?.id || '');
                  setIsAddAssignmentModalOpen(true);
                }}
                className="btn btn-accent"
                style={{ fontSize: '0.85rem' }}
              >
                <Plus size={15} />
                <span>إضافة تكليف</span>
              </button>

              <button
                onClick={() => {
                  setTargetModuleId(curriculum.modules?.[0]?.id || '');
                  setIsAddExamModalOpen(true);
                }}
                className="btn btn-outline"
                style={{ fontSize: '0.85rem' }}
              >
                <Plus size={15} />
                <span>إضافة اختبار</span>
              </button>

              <button
                onClick={() => setIsEditCourseModalOpen(true)}
                className="btn btn-ghost"
                style={{ fontSize: '0.85rem' }}
                id="builder-edit-course-btn"
              >
                <Edit3 size={15} />
                <span>إعدادات الكورس</span>
              </button>
            </div>
          </div>

          {/* بطاقة ملخص تفاصيل الكورس والمشرفين */}
          {currentCourse && (
            <div className="card" style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap', background: 'var(--bg-subtle)' }}>
              <div style={{ width: '120px', height: '75px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                <img
                  src={currentCourse.coverUrl}
                  alt={currentCourse.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <span className="badge badge-primary">{currentCourse.code}</span>
                  {currentCourse.status === 'coming_soon' && (
                    <span className="badge" style={{ background: '#f59e0b', color: '#fff', fontWeight: 800 }}>
                      ⏳ قريباً - قيد الإعداد
                    </span>
                  )}
                  <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{currentCourse.title}</strong>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 0.35rem' }}>
                  المشرفون: <strong>{currentCourse.instructorNames?.join('، ') || 'المشرف الأكاديمي'}</strong> | درجة النجاح: <strong>{currentCourse.passingScore}%</strong> | الوحدات المجهزة: <strong>{curriculum.modules?.length || 0} وحدة</strong>
                </p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', margin: 0 }}>
                  {currentCourse.summary}
                </p>
              </div>
              <button
                onClick={() => setIsEditCourseModalOpen(true)}
                className="btn btn-outline"
                style={{ fontSize: '0.82rem', padding: '0.45rem 1rem' }}
              >
                <Edit3 size={14} />
                <span>تعديل التفاصيل والغلاف</span>
              </button>
            </div>
          )}

          {/* قائمة المديولات ومحتوياتها المنظمة بالترتيب */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {(!curriculum.modules || curriculum.modules.length === 0) ? (
              <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', border: '2px dashed var(--border-color)' }}>
                <FolderPlus size={48} color="var(--primary-600)" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  لم يتم إنشاء أي مديولات أو وحدات في هذا الكورس بعد
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
                  ابدأ ببناء المحتوى الأكاديمي عبر إنشاء المديول الأول، ثم أضف الدروس والتكليفات والاختبارات التفاعلية بداخله.
                </p>
                <button
                  onClick={() => {
                    setNewModuleTitle('الوحدة الأولى: مدخل وأساسيات المسار');
                    setNewModuleDesc('المفاهيم التأسيسية وأهداف البرنامج التدريبي');
                    setIsAddModuleModalOpen(true);
                  }}
                  className="btn btn-primary"
                  style={{ padding: '0.65rem 1.75rem', fontSize: '0.92rem' }}
                >
                  <Plus size={16} />
                  <span>+ إنشاء أول مديول للكورس الآن</span>
                </button>
              </div>
            ) : (
              curriculum.modules.map((mod, modIdx) => (
                <div key={mod.id} className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                  {/* رأس المديول وأزرار إدارته */}
                  <div style={{
                    padding: '1rem 1.25rem',
                    background: 'var(--bg-subtle)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-primary" style={{ fontWeight: 800, fontSize: '0.82rem' }}>
                          مديول {modIdx + 1}
                        </span>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                          {mod.title}
                        </h3>
                        {mod.status === 'coming_soon' && (
                          <span className="badge" style={{ background: '#f59e0b', color: '#fff', fontSize: '0.75rem' }}>
                            قريباً
                          </span>
                        )}
                      </div>
                      {mod.description && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '0.35rem 0 0' }}>
                          {mod.description}
                        </p>
                      )}
                    </div>

                    {/* أزرار التحكم بالمديول وإضافة العناصر إليه */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      <button
                        onClick={() => {
                          setTargetModuleId(mod.id);
                          setIsAddLessonModalOpen(true);
                        }}
                        className="btn btn-primary"
                        style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
                        title="إضافة درس في هذه الوحدة"
                      >
                        <Plus size={13} />
                        <span>درس</span>
                      </button>

                      <button
                        onClick={() => {
                          setTargetModuleId(mod.id);
                          setIsAddAssignmentModalOpen(true);
                        }}
                        className="btn btn-accent"
                        style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
                        title="إضافة تكليف في هذه الوحدة"
                      >
                        <Plus size={13} />
                        <span>تكليف</span>
                      </button>

                      <button
                        onClick={() => {
                          setTargetModuleId(mod.id);
                          setIsAddExamModalOpen(true);
                        }}
                        className="btn btn-outline"
                        style={{ fontSize: '0.78rem', padding: '0.3rem 0.65rem' }}
                        title="إضافة اختبار في هذه الوحدة"
                      >
                        <Plus size={13} />
                        <span>اختبار</span>
                      </button>

                      <button
                        onClick={() => {
                          setModuleToEdit(mod);
                          setEditModuleTitle(mod.title);
                          setEditModuleDesc(mod.description || '');
                          setEditModuleStatus(mod.status === 'coming_soon' ? 'coming_soon' : 'published');
                          setIsEditModuleModalOpen(true);
                        }}
                        className="btn btn-ghost"
                        style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}
                        title="تعديل عنوان ووصف هذه الوحدة"
                      >
                        <Edit3 size={13} />
                        <span>تعديل</span>
                      </button>

                      <button
                        onClick={() => handleDeleteModule(mod.id, mod.title)}
                        className="btn btn-ghost"
                        style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem', color: '#ef4444' }}
                        title="حذف هذه الوحدة بالكامل"
                      >
                        <Trash2 size={13} />
                        <span>حذف</span>
                      </button>
                    </div>
                  </div>

                  {/* قائمة العناصر داخل المديول (الدروس والتكليفات والامتحانات) */}
                  <div style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {/* 1. الدروس */}
                    {mod.lessons && mod.lessons.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          🎥 المحاضرات المسجلة ({mod.lessons.length}):
                        </span>
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
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({les.durationMinutes} دقيقة)</span>
                            </div>

                            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                              <button
                                onClick={() => setPreviewLesson(les)}
                                className="btn btn-outline"
                                style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                              >
                                <span>معاينة</span>
                              </button>
                              {les.drivePdfUrl && (
                                <a
                                  href={sanitizeUrl(les.drivePdfUrl)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-outline"
                                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                                >
                                  <span>السلايدات</span>
                                </a>
                              )}
                              <button
                                onClick={() => handleDeleteLesson(mod.id, les.id, les.title)}
                                className="btn btn-ghost"
                                style={{ padding: '0.25rem 0.45rem', color: '#ef4444' }}
                                title="حذف هذا الدرس"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 2. التكليفات داخل هذا المديول */}
                    {mod.assignments && mod.assignments.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          📄 التكليفات العملية ({mod.assignments.length}):
                        </span>
                        {mod.assignments.map((asg) => (
                          <div
                            key={asg.id}
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
                              borderRight: '3px solid var(--accent-emerald)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <FileText size={16} color="var(--accent-emerald)" />
                              <div>
                                <strong style={{ fontSize: '0.88rem', display: 'block' }}>{asg.title}</strong>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  الدرجة القصوى: {asg.maxScore} نقطة {asg.deadline ? `• الموعد: ${asg.deadline}` : ''}
                                </span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                              {asg.driveTemplateUrl && (
                                <a
                                  href={sanitizeUrl(asg.driveTemplateUrl)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-outline"
                                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                                >
                                  <ExternalLink size={12} />
                                  <span>قالب Drive</span>
                                </a>
                              )}
                              <button
                                onClick={() => handleDeleteAssignment(mod.id, asg.id, asg.title)}
                                className="btn btn-ghost"
                                style={{ padding: '0.25rem 0.45rem', color: '#ef4444' }}
                                title="حذف هذا التكليف"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 3. الامتحانات والاختبارات داخل هذا المديول */}
                    {mod.exams && mod.exams.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          🏆 الاختبارات والتقييمات ({mod.exams.length}):
                        </span>
                        {mod.exams.map((ex) => (
                          <div
                            key={ex.id}
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
                              borderRight: '3px solid var(--accent-gold)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Award size={16} color="var(--accent-gold)" />
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                  <strong style={{ fontSize: '0.88rem' }}>{ex.title}</strong>
                                  <span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>
                                    {ex.examType === 'quiz' ? 'كويز سريع' : ex.examType === 'theory' ? 'نظري Mid-Term' : 'امتحان شامل'}
                                  </span>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                  المدة: {ex.durationMinutes} دقيقة • الدرجة: {ex.maxScore} نقطة • الأسئلة: {ex.questions?.length || 0} أسئلة
                                </span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                              <button
                                onClick={() => handleDeleteExam(mod.id, ex.id, ex.title)}
                                className="btn btn-ghost"
                                style={{ padding: '0.25rem 0.45rem', color: '#ef4444' }}
                                title="حذف هذا الاختبار"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* إذا كانت الوحدة فارغة تماماً */}
                    {(!mod.lessons || mod.lessons.length === 0) &&
                     (!mod.assignments || mod.assignments.length === 0) &&
                     (!mod.exams || mod.exams.length === 0) && (
                      <div style={{ padding: '1.25rem', textAlign: 'center', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        الوحدة فارغة حالياً. استخدم أزرار <strong>(+ درس)</strong> أو <strong>(+ تكليف)</strong> أو <strong>(+ اختبار)</strong> بالأعلى لإضافة محتوى إليها.
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. تبويب الامتحان العملي الحضوري */}
      {activeTab === 'practical' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                رصد وتعديل الامتحان العملي الحضوري بالجامعة
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                رصد درجات الامتحان العملي الحضوري المنعقد في المعمل المركزي (من 50 درجة).
              </p>
            </div>
            {courseApprovedStudents.length > 0 && (
              <button
                onClick={() => {
                  setNewPracticalStudentUid(courseApprovedStudents[0]?.studentUid || '');
                  setNewPracticalScore(40);
                  setNewPracticalNotes('أداء متميز في الاختبار العملي الحضوري');
                  setIsAddPracticalModalOpen(true);
                }}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', padding: '0.45rem 0.95rem' }}
              >
                <Plus size={15} />
                <span>رصد درجة عملي لطالب جديد</span>
              </button>
            )}
          </div>

          {courseApprovedStudents.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              background: 'var(--bg-main)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-color)',
            }}>
              <GraduationCap size={44} color="var(--primary-600)" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                لا يوجد طلاب مسجلون رسمياً في هذا المقرر بعد
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
                بمجرد تقديم الطلاب لطلبات الالتحاق واعتمادها من قبل الإدارة الأكاديمية، سيظهرون تلقائياً هنا لرصد درجات الامتحان العملي وتثبيتها في سجلاتهم.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '0.85rem' }}>اسم الطالب والبيانات الأكاديمية</th>
                    <th style={{ padding: '0.85rem' }}>تاريخ القبول</th>
                    <th style={{ padding: '0.85rem' }}>الدرجة المرصودة (من 50)</th>
                    <th style={{ padding: '0.85rem' }}>الملاحظات الأكاديمية</th>
                    <th style={{ padding: '0.85rem' }}>الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {courseApprovedStudents.map((st) => {
                    const gradeInfo = practicalGrades[st.studentUid] || practicalGrades[st.id];
                    const isGraded = gradeInfo && gradeInfo.score !== undefined;
                    return (
                      <tr key={st.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.85rem' }}>
                          <strong style={{ display: 'block', color: 'var(--text-main)' }}>{st.studentName}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {st.university} {st.specialty ? `• ${st.specialty}` : ''}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                            {st.studentEmail}
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          {st.requestedAt || '—'}
                        </td>
                        <td style={{ padding: '0.85rem' }}>
                          {isGraded ? (
                            <span style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--primary-700)' }}>
                              {gradeInfo.score} / 50
                            </span>
                          ) : (
                            <span className="badge badge-subtle" style={{ fontSize: '0.78rem' }}>
                              لم يُرصد بعد
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                          {gradeInfo?.notes || '—'}
                        </td>
                        <td style={{ padding: '0.85rem' }}>
                          <button
                            onClick={() => setSelectedPracticalStudent({
                              id: st.studentUid,
                              name: st.studentName,
                              score: gradeInfo?.score !== undefined ? gradeInfo.score : 40,
                              notes: gradeInfo?.notes || 'أداء متميز في اختبار تحليل البيانات الإحصائية الحضوري',
                            })}
                            className="btn btn-outline"
                            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                          >
                            <Edit3 size={13} />
                            <span>{isGraded ? 'تعديل الدرجة' : 'رصد الدرجة'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* نافذة تعديل أو رصد درجة الطالب العملي المحدد */}
          {selectedPracticalStudent && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '520px', width: '100%', position: 'relative' }}>
                <button
                  onClick={() => setSelectedPracticalStudent(null)}
                  className="btn btn-ghost"
                  style={{ position: 'absolute', top: '12px', left: '12px' }}
                >
                  ✕
                </button>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                  رصد وتعديل درجة الامتحان العملي: {selectedPracticalStudent.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  الامتحان العملي الحضوري في المعمل المركزي
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
                        setLocalPracticalGrades((prev) => ({
                          ...prev,
                          [selectedPracticalStudent.id]: {
                            score: selectedPracticalStudent.score,
                            notes: selectedPracticalStudent.notes,
                          }
                        }));
                      }
                      // حفظ الدرجة العملية في Firebase
                      if (currentCourse?.id) {
                        fbSavePracticalGrade(selectedPracticalStudent.id, currentCourse.id, selectedPracticalStudent.score, selectedPracticalStudent.notes, 'المدرس الأكاديمي').catch(() => {});
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

          {/* نافذة رصد درجة عملي جديدة لطالب */}
          {isAddPracticalModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '520px', width: '100%', position: 'relative' }}>
                <button
                  onClick={() => setIsAddPracticalModalOpen(false)}
                  className="btn btn-ghost"
                  style={{ position: 'absolute', top: '12px', left: '12px' }}
                >
                  ✕
                </button>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                  رصد درجة امتحان عملي لطالب
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  اختر طالباً من المسجلين في المقرر وأدخل درجته وملاحظاته.
                </p>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    اختر الطالب:
                  </label>
                  <select
                    value={newPracticalStudentUid}
                    onChange={(e) => setNewPracticalStudentUid(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)' }}
                  >
                    {courseApprovedStudents.map((st) => (
                      <option key={st.studentUid} value={st.studentUid}>
                        {st.studentName} ({st.university} - {st.studentEmail})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    الدرجة المرصودة (من 50):
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={newPracticalScore}
                    onChange={(e) => setNewPracticalScore(Number(e.target.value))}
                    style={{ width: '130px', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '2px solid var(--primary-600)', fontSize: '1.2rem', fontWeight: 800, textAlign: 'center' }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    الملاحظات الأكاديمية:
                  </label>
                  <input
                    type="text"
                    value={newPracticalNotes}
                    onChange={(e) => setNewPracticalNotes(e.target.value)}
                    placeholder="مثال: أداء ممتاز، دقة في تطبيق منهجية البحث"
                    style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => setIsAddPracticalModalOpen(false)} className="btn btn-outline">
                    إلغاء
                  </button>
                  <button
                    onClick={() => {
                      if (!newPracticalStudentUid) return;
                      const selectedStudentObj = courseApprovedStudents.find(s => s.studentUid === newPracticalStudentUid);
                      const sName = selectedStudentObj?.studentName || newPracticalStudentUid;

                      if (onUpdatePracticalGrade) {
                        onUpdatePracticalGrade(newPracticalStudentUid, newPracticalScore, newPracticalNotes);
                      } else {
                        setLocalPracticalGrades((prev) => ({
                          ...prev,
                          [newPracticalStudentUid]: {
                            score: newPracticalScore,
                            notes: newPracticalNotes,
                          }
                        }));
                      }
                      // حفظ الدرجة العملية في Firebase
                      if (currentCourse?.id) {
                        fbSavePracticalGrade(newPracticalStudentUid, currentCourse.id, newPracticalScore, newPracticalNotes, 'المدرس الأكاديمي').catch(() => {});
                      }

                      if (onLogAudit) {
                        onLogAudit(
                          'رصد درجة امتحان عملي حضوري',
                          `رصد درجة الطالب (${sName}): ${newPracticalScore}/50`
                        );
                      }

                      setIsAddPracticalModalOpen(false);
                    }}
                    className="btn btn-primary"
                  >
                    <Save size={15} />
                    <span>تثبيت الدرجة</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. تبويب متابعة تقدم الطلاب (Student Progress Tracker) */}
      {activeTab === 'progress' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                لوحة متابعة التقدم الأكاديمي للطلاب (Student Progress Tracker)
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                متابعة دقيقة لنسبة مشاهدة المحاضرات، تسليمات التكليفات، درجات الاختبارات والامتحان العملي لكل طالب مسجل.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-primary">
                👥 المسجلون: {courseApprovedStudents.length}
              </span>
              <span className="badge badge-emerald">
                📚 المحاضرات: {curriculum.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || currentCourse?.totalLessonsCount || 0}
              </span>
            </div>
          </div>

          {courseApprovedStudents.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1.5rem',
              background: 'var(--bg-main)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-color)',
            }}>
              <Award size={44} color="var(--primary-600)" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                لا يوجد طلاب ملتحقون بهذا المقرر حالياً
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
                عند قبول انضمام أي طالب للكورس، سيظهر تقدمه الأكاديمي هنا تلقائياً لتمكين المشرف من متابعة مساره لحظة بلحظة.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-color)' }}>
                    <th style={{ padding: '0.85rem' }}>الطالب والبيانات الجامعية</th>
                    <th style={{ padding: '0.85rem' }}>مشاهدة الدروس والمحاضرات</th>
                    <th style={{ padding: '0.85rem' }}>التكليفات الدراسية</th>
                    <th style={{ padding: '0.85rem' }}>الاختبارات النظرية</th>
                    <th style={{ padding: '0.85rem' }}>الامتحان العملي (50)</th>
                    <th style={{ padding: '0.85rem' }}>الحالة الأكاديمية</th>
                  </tr>
                </thead>
                <tbody>
                  {courseApprovedStudents.map((st) => {
                    // حساب المحاضرات المكتملة
                    let completedLessonsCount = 0;
                    try {
                      const saved = localStorage.getItem(`asira_completed_lessons_${st.studentUid}_${currentCourse?.id}`);
                      if (saved) {
                        completedLessonsCount = JSON.parse(saved).length;
                      }
                    } catch {}
                    const totalLessons = curriculum.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || currentCourse?.totalLessonsCount || 1;
                    const lessonsPercent = Math.min(100, Math.round((completedLessonsCount / totalLessons) * 100));
                    const remainingLessons = Math.max(0, totalLessons - completedLessonsCount);

                    // حساب التكليفات
                    const stSubmissions = submissions.filter(s => s.studentUid === st.studentUid);
                    const gradedSubmissions = stSubmissions.filter(s => s.status === 'graded');
                    const totalAssigScore = gradedSubmissions.reduce((acc, s) => acc + (s.grade || 0), 0);
                    const totalCurriculumAssignments = curriculum.modules.reduce((acc, m) => acc + (m.assignments?.length || 0), 0);

                    // حساب الاختبارات
                    const stExams = examAttempts.filter(a => a.studentUid === st.studentUid);
                    const examScore = stExams[0]?.officialGrade ?? stExams[0]?.calculatedScore;
                    const totalCurriculumExams = curriculum.modules.reduce((acc, m) => acc + (m.exams?.length || 0), 0);

                    // الامتحان العملي
                    const practicalEntry = practicalGrades[st.studentUid] || practicalGrades[st.id];
                    const practicalScore = practicalEntry?.score;

                    // مجموع الدرجات إن توفر
                    const hasPractical = practicalScore !== undefined;
                    const totalCumulative = (practicalScore || 0) + (examScore || 0) + totalAssigScore;
                    const isPassing = totalCumulative >= (currentCourse?.passingScore || 70);

                    return (
                      <tr key={st.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.85rem' }}>
                          <strong style={{ display: 'block', color: 'var(--text-main)' }}>{st.studentName}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {st.university} {st.specialty ? `• ${st.specialty}` : ''}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                            {st.studentEmail}
                          </div>
                        </td>

                        {/* مشاهدة الدروس */}
                        <td style={{ padding: '0.85rem', minWidth: '150px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                            <span>{completedLessonsCount} / {totalLessons} درس</span>
                            <span>{lessonsPercent}%</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: 'var(--bg-main)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${lessonsPercent}%`, height: '100%', background: 'var(--primary-600)', transition: 'width 0.3s' }} />
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            {remainingLessons === 0 ? '✓ أتم جميع المحاضرات' : `متبقي: ${remainingLessons} درس`}
                          </div>
                        </td>

                        {/* التكليفات */}
                        <td style={{ padding: '0.85rem', fontSize: '0.82rem' }}>
                          <div>
                            <strong>{stSubmissions.length}</strong> من أصل {totalCurriculumAssignments} تكليفات
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', marginTop: '0.15rem' }}>
                            المصححة: {gradedSubmissions.length} ({totalAssigScore} درجة)
                          </div>
                        </td>

                        {/* الاختبارات */}
                        <td style={{ padding: '0.85rem', fontSize: '0.82rem' }}>
                          <div>
                            <strong>{stExams.length}</strong> من أصل {totalCurriculumExams} اختبار
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', marginTop: '0.15rem' }}>
                            الدرجة: {examScore !== undefined ? `${examScore} / 30` : 'لم يُقدم بعد'}
                          </div>
                        </td>

                        {/* الامتحان العملي */}
                        <td style={{ padding: '0.85rem' }}>
                          {hasPractical ? (
                            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-700)' }}>
                              {practicalScore} / 50
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedPracticalStudent({
                                  id: st.studentUid,
                                  name: st.studentName,
                                  score: 40,
                                  notes: 'أداء متميز في الاختبار العملي الحضوري',
                                });
                              }}
                              className="btn btn-outline"
                              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                            >
                              رصد الآن
                            </button>
                          )}
                        </td>

                        {/* الحالة والشهادة */}
                        <td style={{ padding: '0.85rem' }}>
                          {hasPractical && isPassing ? (
                            <span className="badge badge-emerald" style={{ fontSize: '0.78rem' }}>
                              مؤهل للشهادة 🎓 ({totalCumulative}%)
                            </span>
                          ) : hasPractical ? (
                            <span className="badge badge-gold" style={{ fontSize: '0.78rem' }}>
                              قيد المتابعة ({totalCumulative}%)
                            </span>
                          ) : (
                            <span className="badge badge-subtle" style={{ fontSize: '0.78rem' }}>
                              قيد الدراسة ⏳
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 6. تبويب: إدارة طلبات التسجيل في هذا الكورس */}
      {activeTab === 'enrollments' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                طلبات التسجيل في المقرر: {currentCourse?.title}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                متابعة واعتماد طلبات الطلاب المتقدمين لهذا الكورس، مع إمكانية أرشفة أو حذف الطلبات المنتهية لتنظيم القوائم.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="badge badge-gold">
                {courseEnrollments.filter((e) => e.status === 'pending').length} بانتظار القبول
              </span>
              {onArchiveAllProcessed && currentCourse && (
                <button
                  onClick={() => {
                    if (window.confirm('هل تريد أرشفة كافة طلبات الكورس المنتهية (المقبولة والمرفوضة) ونقلها إلى سجل الأرشيف؟')) {
                      onArchiveAllProcessed(currentCourse.id);
                    }
                  }}
                  className="btn btn-outline"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Archive size={14} />
                  <span>أرشفة طلبات الكورس المنتهية</span>
                </button>
              )}
            </div>
          </div>

          {/* فلاتر تصنيف الطلبات */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <button
              onClick={() => setEnrollFilter('active')}
              className={`btn ${enrollFilter === 'active' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              الطلبات النشطة ({courseEnrollments.filter((e) => e.status !== 'archived').length})
            </button>
            <button
              onClick={() => setEnrollFilter('pending')}
              className={`btn ${enrollFilter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              قيد المراجعة ({courseEnrollments.filter((e) => e.status === 'pending').length})
            </button>
            <button
              onClick={() => setEnrollFilter('approved')}
              className={`btn ${enrollFilter === 'approved' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              المقبولون ({courseEnrollments.filter((e) => e.status === 'approved').length})
            </button>
            <button
              onClick={() => setEnrollFilter('rejected')}
              className={`btn ${enrollFilter === 'rejected' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              المرفوضون ({courseEnrollments.filter((e) => e.status === 'rejected').length})
            </button>
            <button
              onClick={() => setEnrollFilter('archived')}
              className={`btn ${enrollFilter === 'archived' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              الأرشيف ({courseEnrollments.filter((e) => e.status === 'archived').length})
            </button>
            <button
              onClick={() => setEnrollFilter('all')}
              className={`btn ${enrollFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              الكل ({courseEnrollments.length})
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.85rem' }}>اسم الطالب</th>
                  <th style={{ padding: '0.85rem' }}>الجامعة والتخصص</th>
                  <th style={{ padding: '0.85rem' }}>المستوى</th>
                  <th style={{ padding: '0.85rem' }}>تاريخ الطلب</th>
                  <th style={{ padding: '0.85rem' }}>الحالة</th>
                  <th style={{ padding: '0.85rem' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourseEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                      لا توجد طلبات تسجيل مطابقة لهذا الفلتر في هذا المقرر
                    </td>
                  </tr>
                ) : (
                  filteredCourseEnrollments.map((enr) => (
                    <tr key={enr.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.85rem' }}>
                        <strong style={{ display: 'block', color: 'var(--text-main)' }}>{enr.studentName}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{enr.studentEmail}</span>
                      </td>
                      <td style={{ padding: '0.85rem' }}>
                        <strong style={{ display: 'block' }}>{enr.university}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{enr.specialty}</span>
                      </td>
                      <td style={{ padding: '0.85rem', fontSize: '0.85rem' }}>
                        {enr.academicLevel}
                      </td>
                      <td style={{ padding: '0.85rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {enr.requestedAt}
                      </td>
                      <td style={{ padding: '0.85rem' }}>
                        {enr.status === 'approved' && <span className="badge badge-emerald">مقبول ومسجل ✓</span>}
                        {enr.status === 'rejected' && <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>مرفوض</span>}
                        {enr.status === 'pending' && <span className="badge badge-gold">معلق (Pending)</span>}
                        {enr.status === 'archived' && <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>مؤرشف 📦</span>}
                      </td>
                      <td style={{ padding: '0.85rem' }}>
                        {enr.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            {onApproveEnrollment && (
                              <button
                                onClick={() => {
                                  onApproveEnrollment(enr.id);
                                  if (onLogAudit) onLogAudit('قبول طالب', `تم قبول التحاق الطالب (${enr.studentName}) في المقرر`);
                                }}
                                className="btn btn-accent"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                              >
                                <Check size={14} />
                                <span>قبول</span>
                              </button>
                            )}
                            {onRejectEnrollment && (
                              <button
                                onClick={() => {
                                  onRejectEnrollment(enr.id);
                                  if (onLogAudit) onLogAudit('رفض طالب', `تم رفض التحاق الطالب (${enr.studentName}) في المقرر`);
                                }}
                                className="btn btn-outline"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', color: '#ef4444' }}
                              >
                                <X size={14} />
                                <span>رفض</span>
                              </button>
                            )}
                            {onDeleteEnrollment && (
                              <button
                                onClick={() => {
                                  if (window.confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) {
                                    onDeleteEnrollment(enr.id);
                                  }
                                }}
                                className="btn btn-ghost"
                                style={{ padding: '0.35rem', color: '#ef4444' }}
                                title="حذف الطلب نهائياً"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        ) : enr.status === 'archived' ? (
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            {onApproveEnrollment && (
                              <button
                                onClick={() => onApproveEnrollment(enr.id)}
                                className="btn btn-outline"
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                                title="استعادة للنشط"
                              >
                                <RotateCcw size={13} />
                                <span>استعادة</span>
                              </button>
                            )}
                            {onDeleteEnrollment && (
                              <button
                                onClick={() => {
                                  if (window.confirm('هل أنت متأكد من حذف هذا الطلب نهائياً من الأرشيف؟')) {
                                    onDeleteEnrollment(enr.id);
                                  }
                                }}
                                className="btn btn-ghost"
                                style={{ padding: '0.3rem', color: '#ef4444' }}
                                title="حذف نهائي"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {enr.status === 'rejected' && onApproveEnrollment ? (
                              <button
                                onClick={() => onApproveEnrollment(enr.id)}
                                className="btn btn-outline"
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', color: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)' }}
                                title="إعادة قبول الطالب"
                              >
                                <Check size={13} />
                                <span>إعادة قبول</span>
                              </button>
                            ) : onRejectEnrollment ? (
                              <button
                                onClick={() => onRejectEnrollment(enr.id)}
                                className="btn btn-ghost"
                                style={{ padding: '0.2rem 0.45rem', fontSize: '0.75rem', color: '#ef4444' }}
                                title="إلغاء الاعتماد وتحويله لمرفوض"
                              >
                                إلغاء
                              </button>
                            ) : null}
                            {onArchiveEnrollment && (
                              <button
                                onClick={() => onArchiveEnrollment(enr.id)}
                                className="btn btn-ghost"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}
                                title="أرشفة الطلب"
                              >
                                <Archive size={13} />
                                <span>أرشفة</span>
                              </button>
                            )}
                            {onDeleteEnrollment && (
                              <button
                                onClick={() => {
                                  if (window.confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) {
                                    onDeleteEnrollment(enr.id);
                                  }
                                }}
                                className="btn btn-ghost"
                                style={{ padding: '0.25rem', color: '#ef4444' }}
                                title="حذف الطلب نهائياً"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
        </>
      )}

      {/* نافذة إضافة مديول / وحدة دراسية جديدة */}
      {isAddModuleModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <button
              onClick={() => setIsAddModuleModalOpen(false)}
              className="btn btn-ghost"
              style={{ position: 'absolute', top: '16px', left: '16px', padding: '0.4rem' }}
            >
              ✕
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(14, 165, 233, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FolderPlus size={20} color="var(--primary-600)" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>إضافة وحدة دراسية (مديول) جديد</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              قم بتقسيم وتوزيع محتوى الكورس على وحدات دراسية متسلسلة أكاديمياً.
            </p>

            <form onSubmit={handleAddModule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  اسم الوحدة الدراسية *
                </label>
                <input
                  type="text"
                  required
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  placeholder="مثال: الوحدة الثالثة: تحليل البيانات وصياغة الورقة العلمية"
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-arabic)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  وصف مختصر لأهداف ومحاور الوحدة
                </label>
                <textarea
                  rows={3}
                  value={newModuleDesc}
                  onChange={(e) => setNewModuleDesc(e.target.value)}
                  placeholder="أهداف التعلم ومخرجات هذه الوحدة..."
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-arabic)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  حالة نشر الوحدة التعليمية
                </label>
                <select
                  value={newModuleStatus}
                  onChange={(e) => setNewModuleStatus(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)'
                  }}
                >
                  <option value="published">منشورة ومتاحة للدراسة والتسلسل (Published)</option>
                  <option value="coming_soon">قريباً / قيد الإعداد الأكاديمي (Coming Soon - مقفلة للطلاب)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModuleModalOpen(false)}
                  className="btn btn-outline"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <Plus size={15} />
                  <span>إنشاء الوحدة التعليمية</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة تعديل بيانات المديول / الوحدة الدراسية */}
      {isEditModuleModalOpen && moduleToEdit && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px' }}>
            <button
              onClick={() => setIsEditModuleModalOpen(false)}
              className="btn btn-ghost"
              style={{ position: 'absolute', top: '16px', left: '16px', padding: '0.4rem' }}
            >
              ✕
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Edit3 size={18} color="var(--primary-600)" />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>تعديل بيانات الوحدة الدراسية</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              تعديل مسمى الوحدة ووصفها المنهجي وحالة النشر.
            </p>

            <form onSubmit={handleSaveEditModule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  اسم الوحدة الدراسية *
                </label>
                <input
                  type="text"
                  required
                  value={editModuleTitle}
                  onChange={(e) => setEditModuleTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-arabic)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  وصف الوحدة
                </label>
                <textarea
                  rows={3}
                  value={editModuleDesc}
                  onChange={(e) => setEditModuleDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)',
                    fontFamily: 'var(--font-arabic)'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  حالة نشر الوحدة التعليمية
                </label>
                <select
                  value={editModuleStatus}
                  onChange={(e) => setEditModuleStatus(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-main)'
                  }}
                >
                  <option value="published">منشورة ومتاحة للدراسة والتسلسل (Published)</option>
                  <option value="coming_soon">قريباً / قيد الإعداد الأكاديمي (Coming Soon - مقفلة للطلاب)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModuleModalOpen(false)}
                  className="btn btn-outline"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <Save size={15} />
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
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
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>الوحدة الدراسية (المديول) المستهدف *</label>
                <select
                  value={targetModuleId || curriculum.modules?.[0]?.id || ''}
                  onChange={(e) => setTargetModuleId(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                >
                  {(curriculum.modules || []).map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>عنوان الدرس *</label>
                <input type="text" required value={newLessonTitle} onChange={(e) => setNewLessonTitle(e.target.value)} placeholder="مثال: الدرس 4: صياغة استراتيجية MeSH" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>نوع محتوى المحاضرة</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setLessonMediaType('video')}
                    className={`btn ${lessonMediaType === 'video' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: 1, padding: '0.45rem', fontSize: '0.82rem' }}
                  >
                    <Video size={14} />
                    <span>فيديو YouTube</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLessonMediaType('audio')}
                    className={`btn ${lessonMediaType === 'audio' ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: 1, padding: '0.45rem', fontSize: '0.82rem' }}
                  >
                    <Headphones size={14} />
                    <span>تسجيل صوتي (Google Drive Audio)</span>
                  </button>
                </div>
              </div>

              {lessonMediaType === 'video' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>معرف فيديو YouTube أو الرابط</label>
                  <input type="text" value={newLessonYoutube} onChange={(e) => setNewLessonYoutube(e.target.value)} placeholder="مثال: dQw4w9WgXcQ" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)' }} />
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>رابط التسجيل الصوتي من Google Drive أو ملف صوتي *</label>
                  <input 
                    type="url" 
                    required 
                    value={newLessonAudio} 
                    onChange={(e) => setNewLessonAudio(e.target.value)} 
                    placeholder="https://drive.google.com/file/d/..." 
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)' }} 
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                    💡 ارفع التسجيل الصوتي لـ Google Drive واضبط المشاركة على "أي شخص لديه الرابط (Viewer)".
                  </span>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>رابط سلايدات وملاحظات Google Drive (PDF)</label>
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
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>الوحدة الدراسية (المديول) المستهدف *</label>
                <select
                  value={targetModuleId || curriculum.modules?.[0]?.id || ''}
                  onChange={(e) => setTargetModuleId(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                >
                  {(curriculum.modules || []).map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
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
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>الوحدة الدراسية (المديول) المستهدف *</label>
                  <select
                    value={targetModuleId || curriculum.modules?.[0]?.id || ''}
                    onChange={(e) => setTargetModuleId(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }}
                  >
                    {(curriculum.modules || []).map((m) => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>نوع الاختبار *</label>
                  <select value={examType} onChange={(e) => setExamType(e.target.value as any)} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
                    <option value="theory">اختبار منتصف المسار النظري (Mid-term MCQ)</option>
                    <option value="final">اختبار نهائي شامل (Final Exam)</option>
                    <option value="quiz">كويز سريع أسبوعي (Quiz)</option>
                    <option value="practical">متطلب امتحان عملي حضوري</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem' }}>عنوان الاختبار *</label>
                <input type="text" required value={examTitle} onChange={(e) => setExamTitle(e.target.value)} placeholder="مثال: كويز الوحدة الثانية" style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)' }} />
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

      {/* نافذة تعديل تفاصيل الكورس والغلاف والمشرفين وحذف الكورس */}
      {isEditCourseModalOpen && currentCourse && (
        <EditCourseModal
          isOpen={isEditCourseModalOpen}
          onClose={() => setIsEditCourseModalOpen(false)}
          course={currentCourse}
          onUpdateCourse={(updated) => {
            if (onUpdateCourse) {
              onUpdateCourse(updated);
            }
            if (onLogAudit) {
              onLogAudit('تعديل كورس', `تم تحديث تفاصيل الكورس ${updated.code} - ${updated.title} بنجاح`);
            }
            setIsEditCourseModalOpen(false);
          }}
          onDeleteCourse={(courseId) => {
            if (onDeleteCourse) {
              onDeleteCourse(courseId);
            }
            if (onLogAudit) {
              onLogAudit('حذف كورس', `تم حذف الكورس ${currentCourse.code} نهائياً`);
            }
            setIsEditCourseModalOpen(false);
            setSelectedCourseId(null);
            if (onSelectCourseId) onSelectCourseId('');
          }}
        />
      )}
    </div>
  );
};
