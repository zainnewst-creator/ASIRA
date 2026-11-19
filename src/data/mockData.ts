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
    studentName: 'ط·. ط£ط­ظ…ط¯ ط§ظ„طµط§ظ„ط­',
    university: 'ظƒظ„ظٹط© ط§ظ„ط·ط¨ ط§ظ„ط¨ط´ط±ظٹ - ط¬ط§ظ…ط¹ط© ط§ظ„ظ…ظ„ظƒ ط³ط¹ظˆط¯',
    researchTitle: 'ط¨ط§ط­ط« ظ…ط´ط§ط±ظƒ ظپظٹ ظˆط±ظ‚ط© ظ…ظ†ط´ظˆط±ط© ظپظٹ Q1',
    quote: 'ط§ظ†ط¶ظ…ط§ظ…ظٹ ظ„ظ…ظ†طھط¯ظ‰ ط£ط³ظٹط±ط§ ظƒط§ظ† ظ†ظ‚ط·ط© ط§ظ„طھط­ظˆظ„ ط§ظ„ط­ظ‚ظٹظ‚ظٹط© ظپظٹ ظ…ط³ظٹط±طھظٹ ط§ظ„ط£ظƒط§ط¯ظٹظ…ظٹط©. ظ…ظ† ظپظƒط±ط© ط¨ط³ظٹط·ط© ظˆطھط¯ط±ظٹط¨ ظ…ظƒط«ظپ ط¹ظ„ظ‰ ط§ظ„ظ…ط±ط§ط¬ط¹ط§طھ ط§ظ„ظ…ظ†ظ‡ط¬ظٹط©طŒ ظ†ط¬ط­ظ†ط§ ظƒظپط±ظٹظ‚ ظپظٹ ظ†ط´ط± ظˆط±ظ‚طھظ†ط§ ط§ظ„ط£ظˆظ„ظ‰ ظپظٹ ظ…ط¬ظ„ط© ط£ظˆط±ظˆط¨ظٹط© ظ…ط­ظƒظ…ط©!',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    status: 'published',
  },
  {
    id: 'test-2',
    studentName: 'طµ. ط±ظٹظ… ط§ظ„ط­ظƒظٹظ…ظٹ',
    university: 'ط¯ظƒطھظˆط± طµظٹط¯ظ„ط© - ط¬ط§ظ…ط¹ط© ط§ظ„ط¹ظ„ظˆظ… ظˆط§ظ„طھظƒظ†ظˆظ„ظˆط¬ظٹط§',
    researchTitle: 'ظ…ط¤ظ„ظپط© ط£ظˆظ„ظ‰ ظ„ط¨ط­ط« ظ…ظ‚ط·ط¹ظٹ ظ…طھط¹ط¯ط¯ ط§ظ„ظ…ط±ط§ظƒط²',
    quote: 'ظƒظ†طھ ط£ط¹طھظ‚ط¯ ط£ظ† ط§ظ„ط¨ط­ط« ط§ظ„ط¹ظ„ظ…ظٹ ظ…ط¬ط±ط¯ ظ…طھط·ظ„ط¨ طھط®ط±ط¬ ط±ظˆطھظٹظ†ظٹطŒ ظ„ظƒظ† ظ…ط¹ ط£ط³ظٹط±ط§ طھط¹ظ„ظ…طھ ظƒظٹظپ ط£طµظٹط؛ ط§ظ„ط¨ط±ظˆطھظˆظƒظˆظ„ ظˆط£طھط¹ط§ظ…ظ„ ظ…ط¹ ط§ظ„طھط­ظ„ظٹظ„ ط§ظ„ط¥ط­طµط§ط¦ظٹ ط¨ط§ط­طھط±ط§ظپظٹط© ظƒط§ظ…ظ„ط© ظˆط¯ظˆظ† ط®ظˆظپ.',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    status: 'published',
  },
  {
    id: 'test-3',
    studentName: 'ط·. ظ…ط­ظ…ط¯ ط§ظ„ط¨ط¹ط¯ط§ظ†ظٹ',
    university: 'ظƒظ„ظٹط© ط§ظ„ط·ط¨ ظˆط§ظ„ط¹ظ„ظˆظ… ط§ظ„طµط­ظٹط©',
    researchTitle: 'ط®ط±ظٹط¬ ظ…ط³ط§ط± ط§ظ„ظ…ط±ط§ط¬ط¹ط§طھ ط§ظ„ظ…ظ†ظ‡ط¬ظٹط© ظˆط§ظ„طھط­ظ„ظٹظ„ ط§ظ„طھظ„ظˆظٹ',
    quote: 'ط§ظ„ظ…طھط§ط¨ط¹ط© ط§ظ„ط¯ظ‚ظٹظ‚ط© ظˆط§ظ„طھطµط­ظٹط­ ط§ظ„ظ…ظپطµظ„ ظ„ظƒظ„ طھظƒظ„ظٹظپ ظ‡ظˆ ظ…ط§ ظٹظ…ظٹط² ظ…ظ†طھط¯ظ‰ ط£ط³ظٹط±ط§. ط§ظ„ظ…ط¯ط±ط¨ظˆظ† ظ„ط§ ظٹط¹ط·ظˆظ†ظƒ ظ…ط¹ظ„ظˆظ…ط§طھ ظ†ط¸ط±ظٹط© ظپظ‚ط·طŒ ط¨ظ„ ظٹط´ط§ط±ظƒظˆظ†ظƒ ط®ط¨ط±ط© ط§ظ„ظ†ط´ط± ظپظٹ ط§ظ„ظ…ظٹط¯ط§ظ† ط®ط·ظˆط© ط¨ط®ط·ظˆط©.',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    status: 'published',
  }
];

// ===================================================
// ط¨ظٹط§ظ†ط§طھ ظ…ط­ط§ظƒط§ط© ظ„ظˆط­ط§طھ ط§ظ„طھط­ظƒظ… ط§ظ„ط£ظƒط§ط¯ظٹظ…ظٹط© (LMS Portal Data)
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
