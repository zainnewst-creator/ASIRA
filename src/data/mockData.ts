import { Course, ResearchPaper, Testimonial } from '../types';

export const INITIAL_STATS = {
  publishedPapers: 48,
  studentsTrained: 1250,
  activeMentors: 24,
  partnerUniversities: 12,
  hoursOfTraining: 3400,
};

export const INITIAL_COURSES: Course[] = [];

export const INITIAL_RESEARCHES: ResearchPaper[] = [];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    studentName: 'ط. أحمد الصالح',
    university: 'كلية الطب البشري - جامعة الملك سعود',
    researchTitle: 'باحث مشارك في ورقة منشورة في Q1',
    quote: 'انضمامي لمنتدى أسيرا كان نقطة التحول الحقيقية في مسيرتي الأكاديمية. من فكرة بسيطة وتدريب مكثف على المراجعات المنهجية، نجحنا كفريق في نشر ورقتنا الأولى في مجلة أوروبية محكمة!',
    rating: 5,
    avatarUrl: '',
    status: 'published',
  },
  {
    id: 'test-2',
    studentName: 'ص. ريم الحكيمي',
    university: 'دكتور صيدلة - جامعة العلوم والتكنولوجيا',
    researchTitle: 'مؤلفة أولى لبحث مقطعي متعدد المراكز',
    quote: 'كنت أعتقد أن البحث العلمي مجرد متطلب تخرج روتيني، لكن مع أسيرا تعلمت كيف أصيغ البروتوكول وأتعامل مع التحليل الإحصائي باحترافية كاملة ودون خوف.',
    rating: 5,
    avatarUrl: '',
    status: 'published',
  },
  {
    id: 'test-3',
    studentName: 'ط. محمد البعداني',
    university: 'كلية الطب والعلوم الصحية',
    researchTitle: 'خريج مسار المراجعات المنهجية والتحليل التلوي',
    quote: 'المتابعة الدقيقة والتصحيح المفصل لكل تكليف هو ما يميز منتدى أسيرا. المدربون لا يعطونك معلومات نظرية فقط، بل يشاركونك خبرة النشر في الميدان خطوة بخطوة.',
    rating: 5,
    avatarUrl: '',
    status: 'published',
  }
];

// ===================================================
// بيانات نماذج لوحات التحكم الأكاديمية (LMS Portal Data)
// ===================================================

export interface MockStudentSubmission {
  id: string;
  studentUid: string;
  studentName: string;
  university: string;
  assignmentTitle: string;
  version: number;
  driveFileUrl: string;
  submittedAt: string;
  status: 'submitted' | 'graded' | 'revision_required';
  grade?: number;
  maxScore: number;
  instructorFeedback?: string;
  revisionNotes?: string;
}

export const INITIAL_STUDENT_SUBMISSIONS: MockStudentSubmission[] = [];

export interface MockExamAttemptForInstructor {
  id: string;
  studentUid: string;
  studentName: string;
  university: string;
  examTitle: string;
  submittedAt: string;
  calculatedScore: number;
  officialGrade?: number;
  maxScore: number;
  status: 'pending_review' | 'approved';
  instructorRemarks?: string;
  studentAnswers: {
    qId: string;
    questionText: string;
    studentAnswer: string;
    correctAnswer: string;
    points: number;
    maxPoints: number;
    isCorrect: boolean;
  }[];
}

export const INITIAL_EXAM_ATTEMPTS: MockExamAttemptForInstructor[] = [];

export interface MockLessonItem {
  id: string;
  title: string;
  mediaType?: 'video' | 'audio';
  youtubeId?: string;
  audioUrl?: string;
  driveAudioUrl?: string;
  durationMinutes: number;
  isMandatory: boolean;
  drivePdfUrl?: string;
}

export interface MockAssignmentItem {
  id: string;
  title: string;
  instructions?: string;
  driveTemplateUrl?: string;
  maxScore: number;
  deadline?: string;
}

export interface MockExamItem {
  id: string;
  title: string;
  examType: 'theory' | 'quiz' | 'final' | 'practical';
  durationMinutes: number;
  maxScore: number;
  questions?: Array<{
    id: string;
    text: string;
    options: string[];
    correctIndex: number;
    points: number;
  }>;
}

export interface MockCurriculumModule {
  id: string;
  title: string;
  description?: string;
  status?: 'published' | 'coming_soon' | 'draft';
  lessons: MockLessonItem[];
  assignments?: MockAssignmentItem[];
  exams?: MockExamItem[];
}

export interface MockCourseCurriculum {
  courseId: string;
  modules: MockCurriculumModule[];
}

export const INITIAL_CURRICULA: Record<string, MockCourseCurriculum> = {};

export const INITIAL_CURRICULUM: MockCourseCurriculum = { courseId: '', modules: [] };

export interface MockPendingEnrollment {
  id: string;
  studentUid: string;
  studentName: string;
  studentEmail: string;
  university: string;
  specialty: string;
  academicLevel: string;
  courseId: string;
  courseTitle: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'archived';
  archivedAt?: string;
}

export const INITIAL_PENDING_ENROLLMENTS: MockPendingEnrollment[] = [];

export interface MockCertificateRequest {
  id: string;
  studentUid: string;
  studentName: string;
  university?: string;
  courseId: string;
  courseTitle: string;
  courseCode?: string;
  totalScore?: number;
  requestedAt: string;
  status: 'pending' | 'processing' | 'issued' | 'rejected';
  signedPdfUrl?: string;
  verificationCode?: string;
  adminNotes?: string;
  issuedAt?: string;
}

export const INITIAL_CERT_REQUESTS: MockCertificateRequest[] = [];

export interface MockAuditLogItem {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  details: string;
}

export const INITIAL_AUDIT_LOGS: MockAuditLogItem[] = [];
