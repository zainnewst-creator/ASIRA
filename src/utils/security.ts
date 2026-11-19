// ===================================================
// أدوات الأمان والحماية المدنية للواجهة الأمامية (Client Security Utilities)
// ===================================================

/**
 * تنظيف والتحقق من الروابط لمنع هجمات XSS عبر بروتوكولات غير آمنة مثل javascript: أو data:
 */
export const sanitizeUrl = (url?: string | null): string => {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  
  // السماح فقط ببروتوكولات الويب الآمنة ومراسلات البريد
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }
  
  // الروابط الداخلية المسموح بها في الصفحة
  if (trimmed.startsWith('#') || trimmed.startsWith('/')) {
    return trimmed;
  }
  
  // حجب أي مسار مريب
  return '#';
};

/**
 * تنظيف النصوص لمنع حقن نصوص ضارة في واجهات الإدخال
 */
export const sanitizeInput = (input: string, maxLength: number = 1000): string => {
  if (!input || typeof input !== 'string') return '';
  return input.trim().slice(0, maxLength);
};

/**
 * التحقق من أن رابط التسليم أو الملف يتبع نطاقاً معتمداً وآمناً
 */
export const isTrustedStorageUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'https:') return false;
    const trustedHosts = ['drive.google.com', 'docs.google.com', 'firebasestorage.googleapis.com'];
    return trustedHosts.includes(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
};

/**
 * عزل وتجريد مفاتيح الحلول ونقاط الإجابات النموذجية من كائنات الاختبارات المعروضة للطلاب
 */
export const sanitizeExamForStudent = <T extends { questions?: Array<any> }>(exam: T): T => {
  if (!exam || !exam.questions) return exam;
  return {
    ...exam,
    questions: exam.questions.map((q) => {
      // إزالة حقول الإجابة الصحيحة حتى لا تظهر في DOM أو State الطالب
      const { correctIndex: _ci, correctOption: _co, correctOpt: _cp, ...safeQuestion } = q;
      return safeQuestion;
    }),
  };
};

/**
 * استخراج معرف فيديو YouTube بأمان من الروابط المختلفة أو من المعرف المباشر
 */
export const extractYoutubeId = (urlOrId?: string | null): string => {
  if (!urlOrId || typeof urlOrId !== 'string') return '';
  const trimmed = urlOrId.trim();
  // إذا كان المعرف نقياً بطول 11 حرفاً (معرف يوتيوب القياسي)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  // إذا كان رابطاً مثل youtu.be أو watch?v= أو embed
  const match = trimmed.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
};
