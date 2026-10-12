// ===================================================
// خدمة سجل التدقيق الأكاديمي (Audit Logging Service)
// ===================================================
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { AuditLog, UserRole } from '../types';

export const logAuditEvent = async (
  actorUid: string,
  actorRole: UserRole,
  actionType: string,
  targetCollection: string,
  targetId: string,
  details: Record<string, any>
): Promise<void> => {
  try {
    const timestamp = new Date().toISOString();
    const logId = `log_${Date.now()}_${actorUid.slice(0, 6)}`;
    const logData: AuditLog = {
      id: logId,
      timestamp,
      actorUid,
      actorRole,
      actionType,
      targetCollection,
      targetId,
      details,
    };

    // حفظ السجل في Firestore (قواعد الأمان تمنع تعديله أو حذفه نهائياً)
    const logRef = doc(db, 'auditLogs', logId);
    await setDoc(logRef, logData);
  } catch (error) {
    // في حال عدم توفر اتصال حي، يتم التوثيق محلياً
    console.warn('[AuditLog] Recorded locally:', { actionType, targetCollection, targetId, details });
  }
};
