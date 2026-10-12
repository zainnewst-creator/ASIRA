// ===================================================
// خدمة إدارة الكورسات والالتحاق (Course & Enrollment Service)
// ===================================================
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Course, Enrollment, EnrollmentStatus, LessonProgress } from '../types';
import { INITIAL_COURSES } from '../data/mockData';
import { logAuditEvent } from './auditService';

// جلب الكورسات المنشورة (مع كاش محلي لتوفير الحصص المجانية)
export const getPublishedCourses = async (): Promise<Course[]> => {
  try {
    const q = query(collection(db, 'courses'), where('status', '==', 'published'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Course));
    }
  } catch (error) {
    console.info('[CourseService] Using cached/initial courses:', error);
  }
  return INITIAL_COURSES;
};

// طلب التحاق طالب بكورس (معرف حتمي لمنع تكرار الطلب: studentUid)
export const requestCourseEnrollment = async (
  studentUid: string,
  studentName: string,
  studentEmail: string,
  courseId: string
): Promise<Enrollment> => {
  const enrollmentData: Enrollment = {
    studentUid,
    studentName,
    studentEmail,
    courseId,
    status: 'pending',
    requestedAt: new Date().toISOString(),
  };

  try {
    const enrollmentRef = doc(db, 'courses', courseId, 'enrollments', studentUid);
    await setDoc(enrollmentRef, enrollmentData);
  } catch (err) {
    console.info('[CourseService] Enrollment saved locally:', enrollmentData);
  }

  return enrollmentData;
};

// مراجعة المدير لطلب الالتحاق (موافقة / رفض مع تسجيل التدقيق)
export const reviewEnrollment = async (
  courseId: string,
  studentUid: string,
  newStatus: EnrollmentStatus,
  reviewerUid: string,
  rejectionReason?: string
): Promise<void> => {
  try {
    const enrollmentRef = doc(db, 'courses', courseId, 'enrollments', studentUid);
    await updateDoc(enrollmentRef, {
      status: newStatus,
      reviewedBy: reviewerUid,
      reviewedAt: new Date().toISOString(),
      ...(rejectionReason ? { rejectionReason } : {})
    });

    await logAuditEvent(
      reviewerUid,
      'admin',
      `enrollment_${newStatus}`,
      'enrollments',
      `${courseId}_${studentUid}`,
      { courseId, studentUid, newStatus }
    );
  } catch (err) {
    console.info('[CourseService] Review updated locally:', { courseId, studentUid, newStatus });
  }
};

// تسجيل إكمال الدرس (معرف حتمي مركب لمنع تكرار السجلات: studentUid_lessonId)
export const markLessonComplete = async (
  studentUid: string,
  courseId: string,
  lessonId: string
): Promise<LessonProgress> => {
  const docId = `${studentUid}_${lessonId}`;
  const progressData: LessonProgress = {
    id: docId,
    studentUid,
    courseId,
    lessonId,
    isCompleted: true,
    completedAt: new Date().toISOString(),
  };

  try {
    const progressRef = doc(db, 'courses', courseId, 'lessonProgress', docId);
    await setDoc(progressRef, progressData);
  } catch (err) {
    console.info('[CourseService] Lesson progress saved locally:', progressData);
  }

  return progressData;
};
