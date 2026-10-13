// ===================================================
// أنواع بيانات منصة منتدى أسيرا للبحث العلمي (ASIRA Types)
// ===================================================

export type UserRole = 'student' | 'instructor' | 'admin';
export type AccountStatus = 'active' | 'suspended';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  university?: string;
  specialty?: string;
  academicLevel?: string;
  phone?: string;
  avatarUrl?: string;
  accountStatus: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export type CourseStatus = 'draft' | 'published' | 'coming_soon' | 'archived';

export interface Course {
  id: string;
  title: string;
  code: string;
  summary: string;
  description: string;
  coverUrl: string;
  instructorIds: string[];
  instructorNames?: string[];
  startDate: string;
  endDate: string;
  status: CourseStatus;
  passingScore: number;
  totalLessonsCount: number;
  enrolledCount?: number;
  features?: string[];
  syllabusSummary?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
  status: 'published' | 'draft';
}

export interface Lesson {
  id: string;
  moduleId: string;
  courseId: string;
  title: string;
  description?: string;
  youtubeVideoId?: string;
  attachments?: { title: string; driveUrl: string; type: 'pdf' | 'doc' | 'link' }[];
  durationMinutes?: number;
  orderIndex: number;
  isMandatory: boolean;
}

export type EnrollmentStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn';

export interface Enrollment {
  studentUid: string;
  studentName?: string;
  studentEmail?: string;
  courseId: string;
  status: EnrollmentStatus;
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface LessonProgress {
  id: string; // `${studentUid}_${lessonId}`
  studentUid: string;
  lessonId: string;
  courseId: string;
  isCompleted: boolean;
  completedAt: string;
}

export type AssignmentStatus = 'not_submitted' | 'submitted' | 'under_review' | 'revision_required' | 'resubmitted' | 'graded';

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  instructions: string;
  templateDriveUrl?: string;
  maxScore: number;
  deadline: string;
  allowLateSubmission: boolean;
  allowResubmission: boolean;
  status: 'published' | 'draft';
}

export interface SubmissionVersion {
  version: number;
  fileUrl: string;
  submittedAt: string;
  studentNotes?: string;
}

export interface AssignmentSubmission {
  id: string; // `${assignmentId}_${studentUid}`
  assignmentId: string;
  courseId: string;
  studentUid: string;
  studentName?: string;
  latestVersion: number;
  status: AssignmentStatus;
  history: SubmissionVersion[];
  grade?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
}

export interface ExamQuestion {
  id: string;
  text: string;
  options: string[];
  points: number;
}

export interface Exam {
  id: string;
  courseId: string;
  title: string;
  type: 'theory' | 'final';
  instructions: string;
  durationMinutes: number;
  maxScore: number;
  attemptsAllowed: number; // -1 for unlimited
  openAt: string;
  closeAt: string;
  questions: ExamQuestion[];
  status: 'published' | 'draft';
}

export interface ExamAnswerKey {
  examId: string;
  courseId: string;
  answers: Record<string, number>; // questionId -> correct option index
}

export type ExamAttemptStatus = 'in_progress' | 'submitted' | 'reviewed';

export interface ExamAttempt {
  id: string; // `${studentUid}_${examId}_attempt_${attemptNumber}`
  studentUid: string;
  examId: string;
  courseId: string;
  attemptNumber: number;
  studentAnswers: Record<string, number>;
  startedAt: string;
  submittedAt?: string;
  status: ExamAttemptStatus;
  scoreProposed?: number; // Calculated inside instructor browser, NOT official
}

export type AssessmentType = 'assignment' | 'theory_exam' | 'practical_exam' | 'final_exam';

export interface OfficialGrade {
  id: string; // `${studentUid}_${assessmentId}`
  studentUid: string;
  courseId: string;
  assessmentType: AssessmentType;
  assessmentId: string;
  rawScore: number;
  maxScore: number;
  status: 'preliminary' | 'approved';
  approvedBy: string;
  approvedAt: string;
  remarks?: string;
}

export type CertificateStatus = 'not_eligible' | 'eligible' | 'requested' | 'approved' | 'issued' | 'revoked';

export interface Certificate {
  certId: string;
  studentUid: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  issueDate: string;
  status: CertificateStatus;
  signedPdfDriveUrl?: string;
  verificationCode: string;
  revokedReason?: string;
  issuedBy?: string;
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  supervisorName: string;
  field: string; // e.g. 'طب بشري', 'صيدلة إكلينيكية', 'تحليل إحصائي'
  journal: string;
  publicationYear: number;
  doiLink?: string;
  pubmedLink?: string;
  abstract: string;
  coverImageUrl?: string;
  status: 'draft' | 'published' | 'archived';
  isFeatured: boolean;
  viewsCount?: number;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  studentName: string;
  university: string;
  researchTitle?: string;
  quote: string;
  rating: number; // 1-5
  avatarUrl?: string;
  publishedPaperUrl?: string;
  status: 'pending_review' | 'published' | 'archived';
  approvedBy?: string;
}

export interface ContactMessage {
  id: string;
  senderName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorUid: string;
  actorRole: UserRole;
  actionType: string;
  targetCollection: string;
  targetId: string;
  details: Record<string, any>;
}
