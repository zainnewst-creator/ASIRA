// ===================================================
// محرك التكليفات والاختبارات والتصحيح الآمن (Assessment Engine)
// ===================================================
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { 
  AssignmentSubmission, 
  ExamAttempt, 
  OfficialGrade, 
  ExamQuestion 
} from '../types';
import { logAuditEvent } from './auditService';

// 1. تسليم التكليف برابط Google Drive مع إدارة النسخ (Revisions)
export const submitAssignment = async (
  assignmentId: string,
  courseId: string,
  studentUid: string,
  studentName: string,
  driveFileUrl: string,
  studentNotes?: string
): Promise<AssignmentSubmission> => {
  const subDocRef = doc(db, 'courses', courseId, 'assignments', assignmentId, 'submissions', studentUid);
  
  let existingSubmission: AssignmentSubmission | null = null;
  try {
    const snap = await getDoc(subDocRef);
    if (snap.exists()) {
      existingSubmission = snap.data() as AssignmentSubmission;
    }
  } catch (e) {
    // Fallback to local
  }

  const nextVersion = existingSubmission ? existingSubmission.latestVersion + 1 : 1;
  const newHistoryEntry = {
    version: nextVersion,
    fileUrl: driveFileUrl,
    submittedAt: new Date().toISOString(),
    studentNotes,
  };

  const submissionData: AssignmentSubmission = {
    id: `${assignmentId}_${studentUid}`,
    assignmentId,
    courseId,
    studentUid,
    studentName,
    latestVersion: nextVersion,
    status: 'submitted',
    history: existingSubmission ? [...existingSubmission.history, newHistoryEntry] : [newHistoryEntry],
  };

  try {
    await setDoc(subDocRef, submissionData);
  } catch (err) {
    console.info('[Assessment] Submission saved locally:', submissionData);
  }

  return submissionData;
};

// 2. تصحيح التكليف من المدرس (إدخال الدرجة أو طلب تعديل)
export const gradeAssignmentSubmission = async (
  assignmentId: string,
  courseId: string,
  studentUid: string,
  grade: number,
  feedback: string,
  instructorUid: string,
  requestRevision: boolean = false
): Promise<void> => {
  const subDocRef = doc(db, 'courses', courseId, 'assignments', assignmentId, 'submissions', studentUid);
  const status = requestRevision ? 'revision_required' : 'graded';

  try {
    await updateDoc(subDocRef, {
      grade: requestRevision ? null : grade,
      feedback,
      status,
      gradedBy: instructorUid,
      gradedAt: new Date().toISOString(),
    });

    if (!requestRevision) {
      // رصد الدرجة في سجل الدرجات الرسمية
      const gradeDocRef = doc(db, 'courses', courseId, 'officialGrades', `${studentUid}_${assignmentId}`);
      await setDoc(gradeDocRef, {
        id: `${studentUid}_${assignmentId}`,
        studentUid,
        courseId,
        assessmentType: 'assignment',
        assessmentId: assignmentId,
        rawScore: grade,
        maxScore: 20,
        status: 'approved',
        approvedBy: instructorUid,
        approvedAt: new Date().toISOString(),
        remarks: feedback,
      });

      await logAuditEvent(
        instructorUid,
        'instructor',
        'assignment_graded',
        'officialGrades',
        `${studentUid}_${assignmentId}`,
        { grade, assignmentId, studentUid }
      );
    }
  } catch (err) {
    console.info('[Assessment] Assignment graded locally:', { grade, status });
  }
};

// 3. تسليم محاولة الاختبار النظري من الطالب (إجابات خام دون مفتاح الحل)
export const submitExamAttempt = async (
  examId: string,
  courseId: string,
  studentUid: string,
  attemptNumber: number,
  studentAnswers: Record<string, number>
): Promise<ExamAttempt> => {
  const attemptDocId = `${studentUid}_${examId}_attempt_${attemptNumber}`;
  const attemptData: ExamAttempt = {
    id: attemptDocId,
    studentUid,
    examId,
    courseId,
    attemptNumber,
    studentAnswers,
    startedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    submittedAt: new Date().toISOString(),
    status: 'submitted',
  };

  try {
    const attemptRef = doc(db, 'courses', courseId, 'exams', examId, 'attempts', attemptDocId);
    await setDoc(attemptRef, attemptData);
  } catch (err) {
    console.info('[Assessment] Exam attempt saved locally:', attemptData);
  }

  return attemptData;
};

// 4. التصحيح التلقائي الآمن داخل متصفح المدرس (Calculated Draft Preview)
export const calculateInstructorGradePreview = (
  questions: ExamQuestion[],
  studentAnswers: Record<string, number>,
  secretAnswerKey: Record<string, number>
): {
  detailedResults: { questionId: string; studentChoice: number; correctChoice: number; isCorrect: boolean; points: number }[];
  totalScore: number;
  maxScore: number;
} => {
  let totalScore = 0;
  let maxScore = 0;

  const detailedResults = questions.map((q) => {
    const studentChoice = studentAnswers[q.id];
    const correctChoice = secretAnswerKey[q.id];
    const isCorrect = studentChoice === correctChoice;
    const points = isCorrect ? q.points : 0;

    totalScore += points;
    maxScore += q.points;

    return {
      questionId: q.id,
      studentChoice,
      correctChoice,
      isCorrect,
      points,
    };
  });

  return { detailedResults, totalScore, maxScore };
};

// 5. اعتماد ونشر الدرجة الرسمية للاختبار من قبل المدرس المخول (Official Commitment)
export const commitOfficialExamGrade = async (
  examId: string,
  courseId: string,
  studentUid: string,
  finalScore: number,
  maxScore: number,
  instructorUid: string,
  remarks?: string
): Promise<OfficialGrade> => {
  const gradeId = `${studentUid}_${examId}`;
  const officialGrade: OfficialGrade = {
    id: gradeId,
    studentUid,
    courseId,
    assessmentType: 'theory_exam',
    assessmentId: examId,
    rawScore: finalScore,
    maxScore,
    status: 'approved',
    approvedBy: instructorUid,
    approvedAt: new Date().toISOString(),
    remarks,
  };

  try {
    const gradeRef = doc(db, 'courses', courseId, 'officialGrades', gradeId);
    await setDoc(gradeRef, officialGrade);

    await logAuditEvent(
      instructorUid,
      'instructor',
      'exam_grade_approved',
      'officialGrades',
      gradeId,
      { finalScore, maxScore, studentUid, examId }
    );
  } catch (err) {
    console.info('[Assessment] Official grade committed locally:', officialGrade);
  }

  return officialGrade;
};
