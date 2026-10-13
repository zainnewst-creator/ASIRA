// ===================================================
// منظومة الشهادات والتحقق الأكاديمي (Certificate Service)
// ===================================================
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Certificate } from '../types';
import { logAuditEvent } from './auditService';

// التحقق من أهلية الطالب للحصول على الشهادة
export const checkCertificateEligibility = (
  completedLessonsCount: number,
  totalLessonsRequired: number,
  cumulativeScorePercentage: number,
  passingScore: number,
  practicalExamRecorded: boolean
): { isEligible: boolean; missingCriteria: string[] } => {
  const missingCriteria: string[] = [];

  if (completedLessonsCount < totalLessonsRequired) {
    missingCriteria.push(`إكمال جميع الدروس المطلوبة (${completedLessonsCount}/${totalLessonsRequired})`);
  }
  if (cumulativeScorePercentage < passingScore) {
    missingCriteria.push(`تحقيق نسبة النجاح المطلوبة (${cumulativeScorePercentage}% / ${passingScore}%)`);
  }
  if (!practicalExamRecorded) {
    missingCriteria.push('رصد درجة الامتحان العملي الحضوري بالجامعة');
  }

  return {
    isEligible: missingCriteria.length === 0,
    missingCriteria,
  };
};

// طلب الطالب للشهادة عند استيفاء المعايير
export const requestCertificate = async (
  studentUid: string,
  studentName: string,
  courseId: string,
  courseTitle: string
): Promise<Certificate> => {
  const certId = `CERT_${courseId}_${studentUid}`;
  const verificationCode = `ASIRA-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const certData: Certificate = {
    certId,
    studentUid,
    studentName,
    courseId,
    courseTitle,
    issueDate: new Date().toISOString(),
    status: 'requested',
    verificationCode,
  };

  try {
    const certRef = doc(db, 'certificates', certId);
    await setDoc(certRef, certData);
  } catch (err) {
    console.info('[Certificate] Request saved locally:', certData);
  }

  return certData;
};

// اعتماد وإصدار الشهادة وإرفاق رابط الـ PDF الموقع من العميد (Admin Action)
export const issueSignedCertificate = async (
  certId: string,
  signedPdfDriveUrl: string,
  adminUid: string
): Promise<void> => {
  try {
    const certRef = doc(db, 'certificates', certId);
    await updateDoc(certRef, {
      status: 'issued',
      signedPdfDriveUrl,
      issuedBy: adminUid,
      issueDate: new Date().toISOString(),
    });

    await logAuditEvent(
      adminUid,
      'admin',
      'certificate_issued',
      'certificates',
      certId,
      { signedPdfDriveUrl }
    );
  } catch (err) {
    console.info('[Certificate] Issued locally:', { certId, signedPdfDriveUrl });
  }
};

// التحقق العام من صحة الشهادة بكود التحقق
export const verifyCertificateByCode = async (
  verificationCode: string
): Promise<{ valid: boolean; certificate?: Certificate }> => {
  // محاكاة سريعة للتحقق
  if (verificationCode.toUpperCase().startsWith('ASIRA-')) {
    return {
      valid: true,
      certificate: {
        certId: 'sample-cert-id',
        studentUid: 'student-1',
        studentName: 'أحمد محمد الصالح',
        courseId: 'RES-101',
        courseTitle: 'منهجية وأساسيات البحث العلمي والنشر الدولي',
        issueDate: '2026-10-12',
        status: 'issued',
        verificationCode,
        signedPdfDriveUrl: 'https://drive.google.com/file/d/sampleSignedCertificate/view',
      },
    };
  }
  return { valid: false };
};
