# حالة المشروع الأولية للمرحلة الثالثة (Phase 3 Initial State)
**المشروع:** منصة ومنتدى أسيرا لتعليم البحث العلمي (ASIRA Research Learning Platform)  
**التاريخ والوقت:** 14 أكتوبر 2026  
**فرع العمل المخصص:** `phase-3-production-readiness` (متفرع من `master` بعد دمج `phase-2-security-hardening`)  
**الالتزام المرجعي:** `ad8e79c` (feat(security): complete Phase 2 comprehensive security audit and remediation)

---

## 1. البنية التقنية الفعلية المحققة (Verified Technical Stack)
- **واجهة المستخدم:** React 19.0.0 (بدون إطارات عمل ثقيلة غير ضرورية، اعتماد معايير Vanilla CSS المتطورة ونظام تصميم مخصص).
- **لغة البرمجة وإعدادات الترجمة:** TypeScript 5.7.2 (`strict: true`, `noImplicitAny: true`).
- **أداة التحزيم والبناء:** Vite 6.4.4 مع تجزئة متقدمة للكود (`manualChunks`: `vendor-react`, `vendor-firebase`, `vendor-icons`).
- **خلفية البيانات والمصادقة:** Firebase 11.4.0 (Firebase Auth + Cloud Firestore).
- **قواعد الأمان:** ملف `firestore.rules` (260+ سطراً) محدث ومحصن بنهاية المرحلة الثانية.
- **التوجيه والتنقل:** Single Page Application (SPA) مبني على الحالة الداخلية لعلامات التبويب في `App.tsx` و `LmsDashboardPreview.tsx`.

---

## 2. التحقق المباشر من مخرجات المرحلة الثانية (Phase 2 Claims Verification)

| المطلب / الادعاء | التحقق من الكود الفعلي | الحالة التوثيقية |
| :--- | :--- | :---: |
| **خصوصية المستخدمين `/users/{uid}`** | تم تقييد `allow read` بـ `isOwner(uid) \|\| isAdmin() \|\| isInstructor()`. | ✅ محقق فعلياً بالكود |
| **حظر حقن الدرجات `/attempts`** | تم منع إرسال حقول `score`, `officialGrade`, `calculatedScore` من طرف الطالب. | ✅ محقق فعلياً بالكود |
| **حظر التلاعب بالدرجات المعتمدة** | مسارات `/officialGrades` و `/practicalGrades` محصورة بـ `isAdmin() \|\| isCourseInstructor()`. | ✅ محقق فعلياً بالكود |
| **منع تزوير سجلات التدقيق `/auditLogs`** | فُرض شرط `request.resource.data.actorUid == request.auth.uid` ومطابقة الدور. | ✅ محقق فعلياً بالكود |
| **تحصين فحص الشهادات** | دالة `verifyCertificateByCode` تستعلم عن الشهادة الصادرة الفعلية في Firestore. | ✅ محقق فعلياً بالكود |
| **تعقيم الروابط الخارجية (XSS)** | تطبيق `sanitizeUrl` في `ResearchCard`, `StudentDashboard`, `InstructorDashboard`, `AdminDashboard`. | ✅ محقق فعلياً بالكود |
| **ترويسات أمان المتصفح في `index.html`** | تم تضمين `nosniff` و `strict-origin-when-cross-origin`. | ✅ محقق فعلياً بالكود |

---

## 3. الفجوات والمهام المطلوبة للمرحلة الثالثة (Gaps & Phase 3 Objectives)
1. **غياب حزمة اختبارات أمنية آلية مستقلة (Automated Security Test Suite):**
   - يلزم بناء ملف اختبارات برمجية آلية قابلة للتشغيل المستمر (`npm test`) للتحقق من سلامة قواعد الأمان وتعقيم الروابط ومحرك الشهادات دون الاعتماد على الفحص اليدوي فقط.
2. **غياب ملف إعدادات الاستضافة والنشر على Vercel (`vercel.json`):**
   - يلزم إنشاء `vercel.json` يحوي قواعد التوجيه لتطبيقات الصفحة الواحدة (`rewrites`) وترويسات الأمان الفعلية على مستوى خادم الويب (`HTTP Security Headers` بما فيها CSP, HSTS, X-Frame-Options).
3. **غياب خط أنابيب التكامل المستمر (GitHub Actions CI):**
   - يلزم إعداد سير عمل `.github/workflows/ci.yml` للتحقق الآلي من الأنواع (`tsc`), وبناء المشروع الإنتاجي (`build`), وتشغيل حزمة الاختبارات الأمنية (`test`).
4. **تدقيق وتوثيق المخاطر المتبقية (Residual Risks):**
   - حصر التبعيات التحذيرية المتبقية (مثل `@grpc/grpc-js` في بيئة Node.js).
   - توثيق الحدود الآمنة للبيئة التجريبية والإنتاجية.

---

## 4. العمل المنجز الممنوع تكراره عبثاً (Non-Duplication Guardrails)
- عدم إعادة تنظيف الاستيرادات أو إعادة كتابة الواجهات الرسومية المصممة سلفاً.
- عدم كسر أو إضعاف قواعد `firestore.rules` أو السماح بحقول تساهلية لتسهيل الاختبارات.
- عدم ترقية التبعيات الرئيسية قسرياً (`npm audit fix --force`) لتفادي الرجوع لإصدار قديم من Firebase وكسر نمط modular imports.
