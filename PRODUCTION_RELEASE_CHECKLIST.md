# قائمة التحقق لجاهزية الإطلاق والتشغيل الإنتاجي (Production Release Checklist)
**المشروع:** منصة ومنتدى أسيرا لتعليم البحث العلمي (ASIRA Research Learning Platform)  
**تاريخ المراجعة:** 14 أكتوبر 2026  
**حالة الجاهزية الفنية للكود:** ✅ **جاهز للإطلاق المشروط بموافقة المالك (Ready for Authorized Release)**

---

## 1. الإجراءات المكتملة والمحققة برمجياً (Automated & Code-Level Completed Tasks)

- [x] **فحص الأنواع البرمجية الثابت (TypeScript Validation):**
  - تم تنفيذ `npx tsc --noEmit` بنجاح بدون أي أخطاء (Exit code 0).
- [x] **بناء الأصول الإنتاجية (Production Build):**
  - تم تنفيذ `npm run build` بنجاح وإنتاج الحزم المجزأة في مجلد `dist/` بحجم أمثل وخالٍ من التحذيرات.
- [x] **حزمة الاختبارات الأمنية ومحاكي القواعد الآلي (Security Test Suite):**
  - تم تنفيذ `npm test` بنجاح واجتياز **63 اختباراً أمنياً مؤتمتاً** بنسبة 100% تشمل 27 اختبار وحدة، 17 فحص تكوين، و 19 محاكاة منطقية لقواعد Firestore للأدوار السبعة.
- [x] **تحصين قواعد أمان فايربيس (Firestore Rules Hardening - Phase 3.1):**
  - تم تدقيق وتحصين ملف `firestore.rules`:
    - حظر التجاوز الإداري عبر البريد الإلكتروني المجرد (`isAdmin` يشترط الدور في قاعدة البيانات مع `email_verified == true`).
    - عزل خصوصية الطلاب عن المدرسين في `/users/{uid}`.
    - حظر سحب مسودات الشهادات غير المعتمدة للعامة وحصرها بـ `status == 'issued'`.
    - حظر حقن الدرجات وحصر الدرجات الرسمية والعملية بالمدير والمدرس المعتمد للمساق.
- [x] **حماية الواجهة الأمامية من هجمات XSS:**
  - تم تفعيل دالة `sanitizeUrl` على كافة الروابط الخارجية (DOI, PubMed, Google Drive).
- [x] **حماية مجالات التخزين السحابي:**
  - تم تقييد دالة `isTrustedStorageUrl` بفحص النطاقات الحقيقية المعتمدة فقط ومنع انتحال النطاقات الفرعية.
- [x] **عزل الإجابات النموذجية للامتحانات:**
  - تم تفعيل دالة `sanitizeExamForStudent` لحذف `correctIndex` و `correctOpt` من كائنات الامتحانات المعروضة للطلاب.
- [x] **إعداد ملف استضافة Vercel مع ترويسات الأمان:**
  - تم إنشاء `vercel.json` متضمناً قواعد توجيه SPA (`rewrites`) وترويسات الأمان الصارمة (CSP, X-Frame-Options: DENY, nosniff, Referrer-Policy).
- [x] **إعداد خط أنابيب التكامل المستمر (GitHub Actions CI):**
  - تم إنشاء `.github/workflows/ci.yml` للتحقق التلقائي من الكود في كل عملية دفع أو دمج.
- [x] **جاهزية التراجع في Git (Rollback Readiness):**
  - شجرة العمل نظيفة على فرع `master` مع بقاء الفروع السابقة وتاريخ الالتزامات محفوظاً بالكامل.

---

## 2. الإجراءات المطلوبة من مالك المشروع قبل النشر المباشر (Owner Actions Required Before Live Deployment)

- [ ] **ربط مشروع Firebase الإنتاجي الفعلي:**
  - التأكد من تعيين متغيرات البيئة في لوحة تحكم Vercel (Production Environment Variables):
    - `VITE_FIREBASE_API_KEY`
    - `VITE_FIREBASE_AUTH_DOMAIN`
    - `VITE_FIREBASE_PROJECT_ID`
    - `VITE_FIREBASE_STORAGE_BUCKET`
    - `VITE_FIREBASE_MESSAGING_SENDER_ID`
    - `VITE_FIREBASE_APP_ID`
- [ ] **نشر ملف قواعد الأمان إلى Firebase Console:**
  - نشر ملف `firestore.rules` المحصن إلى بيئة الإنتاج باستخدام Firebase CLI (`firebase deploy --only firestore:rules`) أو عبر Firebase Console.
- [ ] **تفعيل مصادقة البريد الإلكتروني وتوثيق حساب الإدارة:**
  - إنشاء الحساب الإداري المعتمد `admin@asira-research.org` في Firebase Authentication والتأكد من إرسال وتأكيد بريد التوثيق (`email_verified = true`).
- [ ] **إعداد نطاق النشر المخصص على Vercel:**
  - ربط الدومين الرسمي للمنصة (مثل `asira-research.org`) بالـ Deployment في لوحة Vercel وتأكيد إصدار شهادة SSL/TLS التلقائية.
- [ ] **إجراء فحص الدخان بعد النشر (Post-Deployment Smoke Test):**
  - تسجيل الدخول بحساب تجريبي في البيئة المباشرة، فتح كورس، حل اختبار، تسليم تكليف، والتأكد من استجابة النظام دون أخطاء في Console.
- [ ] **الموافقة النهائية للمالك وتثبيت نسخة الإطلاق (Final Sign-Off):**
  - مراجعة تقرير المخاطر المتبقية [PHASE_3_REMAINING_RISKS.md](file:///e:/ASIRA/PHASE_3_REMAINING_RISKS.md) واعتماد الإطلاق الرسمي.
