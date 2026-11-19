// ===================================================
// خدمة بيانات الطلاب (Student Data Service)
// حفظ وتحميل بيانات الاختبارات والتكليفات والتقدم والدرجات العملية
// ===================================================
import {
  collection,
  collectionGroup,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

// ===================================================
// الأنواع (Interfaces)
// ===================================================

export interface ExamAttemptData {
  examId: string;
  courseId: string;
  studentUid: string;
  selectedAnswers: Record<string, string>;
  calculatedScore: number;
  examSubmitted: boolean;
  submittedAt: string;
}

export interface SubmissionData {
  assignmentId: string;
  courseId: string;
  studentUid: string;
  assignmentTitle: string;
  driveFileUrl: string;
  status: string;
  grade: number | null;
  maxScore: number;
  instructorFeedback: string;
  version: number;
  submittedAt: string;
  revisionNotes: string;
}

export interface PracticalGradeData {
  studentUid: string;
  courseId: string;
  score: number;
  notes: string;
  gradedBy: string;
  gradedAt: string;
}

export interface AllStudentCourseData {
  submissions: Record<string, SubmissionData[]>;
  examAttempts: Record<string, ExamAttemptData[]>;
  practicalGrades: Record<string, { score: number; notes: string }>;
  completedLessons: Record<string, string[]>;
}

// ===================================================
// 1. حفظ وتحميل محاولات الاختبار
// ===================================================

export const saveExamAttempt = async (
  studentUid: string,
  courseId: string,
  examData: Omit<ExamAttemptData, 'courseId' | 'studentUid'>
): Promise<void> => {
  const docId = `${courseId}_${examData.examId}`;
  const data: ExamAttemptData = {
    ...examData,
    courseId,
    studentUid,
  };

  try {
    const docRef = doc(db, 'users', studentUid, 'examAttempts', docId);
    await setDoc(docRef, data);
  } catch (error) {
    console.info('[StudentDataService] saveExamAttempt fallback:', data);
  }
};

export const loadExamAttempts = async (
  studentUid: string,
  courseId: string
): Promise<ExamAttemptData[]> => {
  try {
    const colRef = collection(db, 'users', studentUid, 'examAttempts');
    const q = query(colRef, where('courseId', '==', courseId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => d.data() as ExamAttemptData);
    }
  } catch (error) {
    console.info('[StudentDataService] loadExamAttempts fallback for', studentUid, courseId);
  }
  return [];
};

// ===================================================
// 2. حفظ وتحميل تسليمات التكليفات
// ===================================================

export const saveSubmission = async (
  studentUid: string,
  courseId: string,
  submission: Omit<SubmissionData, 'courseId' | 'studentUid'>
): Promise<void> => {
  const docId = `${courseId}_${submission.assignmentId}`;
  const data: SubmissionData = {
    ...submission,
    courseId,
    studentUid,
  };

  try {
    const docRef = doc(db, 'users', studentUid, 'submissions', docId);
    await setDoc(docRef, data);
  } catch (error) {
    console.info('[StudentDataService] saveSubmission fallback:', data);
  }
};

export const loadSubmissions = async (
  studentUid: string,
  courseId: string
): Promise<SubmissionData[]> => {
  try {
    const colRef = collection(db, 'users', studentUid, 'submissions');
    const q = query(colRef, where('courseId', '==', courseId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => d.data() as SubmissionData);
    }
  } catch (error) {
    console.info('[StudentDataService] loadSubmissions fallback for', studentUid, courseId);
  }
  return [];
};

// ===================================================
// 3. حفظ وتحميل الدروس المكتملة
// ===================================================

export const saveCompletedLessons = async (
  studentUid: string,
  courseId: string,
  lessonIds: string[]
): Promise<void> => {
  const data = {
    studentUid,
    courseId,
    lessonIds,
    updatedAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, 'users', studentUid, 'progress', courseId);
    await setDoc(docRef, data);
  } catch (error) {
    console.info('[StudentDataService] saveCompletedLessons fallback:', data);
  }
};

export const loadCompletedLessons = async (
  studentUid: string,
  courseId: string
): Promise<string[]> => {
  try {
    const docRef = doc(db, 'users', studentUid, 'progress', courseId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      return (data.lessonIds as string[]) || [];
    }
  } catch (error) {
    console.info('[StudentDataService] loadCompletedLessons fallback for', studentUid, courseId);
  }
  return [];
};

// ===================================================
// 4. حفظ وتحميل الدرجات العملية (للمدرس)
// ===================================================

export const savePracticalGrade = async (
  studentUid: string,
  courseId: string,
  score: number,
  notes: string,
  gradedBy: string
): Promise<void> => {
  const data: PracticalGradeData = {
    studentUid,
    courseId,
    score,
    notes,
    gradedBy,
    gradedAt: new Date().toISOString(),
  };

  try {
    const docRef = doc(db, 'users', studentUid, 'practicalGrades', courseId);
    await setDoc(docRef, data);
  } catch (error) {
    console.info('[StudentDataService] savePracticalGrade fallback:', data);
  }
};

export const loadPracticalGrades = async (
  courseId: string
): Promise<Record<string, { score: number; notes: string }>> => {
  const result: Record<string, { score: number; notes: string }> = {};

  try {
    const q = query(
      collectionGroup(db, 'practicalGrades'),
      where('courseId', '==', courseId)
    );
    const snapshot = await getDocs(q);
    snapshot.docs.forEach((d) => {
      const data = d.data() as PracticalGradeData;
      result[data.studentUid] = { score: data.score, notes: data.notes };
    });
  } catch (error) {
    console.info('[StudentDataService] loadPracticalGrades fallback for', courseId);
  }

  return result;
};

// ===================================================
// 5. تحميل كل بيانات طالب لكورس واحد (للمدرس)
// ===================================================

export const loadAllStudentDataForCourse = async (
  courseId: string
): Promise<AllStudentCourseData> => {
  const result: AllStudentCourseData = {
    submissions: {},
    examAttempts: {},
    practicalGrades: {},
    completedLessons: {},
  };

  try {
    // تسليمات التكليفات
    const submissionsQuery = query(
      collectionGroup(db, 'submissions'),
      where('courseId', '==', courseId)
    );
    const submissionsSnap = await getDocs(submissionsQuery);
    submissionsSnap.docs.forEach((d) => {
      const data = d.data() as SubmissionData;
      if (!result.submissions[data.studentUid]) {
        result.submissions[data.studentUid] = [];
      }
      result.submissions[data.studentUid].push(data);
    });
  } catch (error) {
    console.info('[StudentDataService] loadAllStudentDataForCourse submissions fallback for', courseId);
  }

  try {
    // محاولات الاختبار
    const examsQuery = query(
      collectionGroup(db, 'examAttempts'),
      where('courseId', '==', courseId)
    );
    const examsSnap = await getDocs(examsQuery);
    examsSnap.docs.forEach((d) => {
      const data = d.data() as ExamAttemptData;
      if (!result.examAttempts[data.studentUid]) {
        result.examAttempts[data.studentUid] = [];
      }
      result.examAttempts[data.studentUid].push(data);
    });
  } catch (error) {
    console.info('[StudentDataService] loadAllStudentDataForCourse examAttempts fallback for', courseId);
  }

  try {
    // الدرجات العملية
    const gradesQuery = query(
      collectionGroup(db, 'practicalGrades'),
      where('courseId', '==', courseId)
    );
    const gradesSnap = await getDocs(gradesQuery);
    gradesSnap.docs.forEach((d) => {
      const data = d.data() as PracticalGradeData;
      result.practicalGrades[data.studentUid] = { score: data.score, notes: data.notes };
    });
  } catch (error) {
    console.info('[StudentDataService] loadAllStudentDataForCourse practicalGrades fallback for', courseId);
  }

  try {
    // الدروس المكتملة
    const progressQuery = query(
      collectionGroup(db, 'progress'),
      where('courseId', '==', courseId)
    );
    const progressSnap = await getDocs(progressQuery);
    progressSnap.docs.forEach((d) => {
      const data = d.data() as { studentUid: string; lessonIds: string[] };
      result.completedLessons[data.studentUid] = data.lessonIds || [];
    });
  } catch (error) {
    console.info('[StudentDataService] loadAllStudentDataForCourse completedLessons fallback for', courseId);
  }

  return result;
};
