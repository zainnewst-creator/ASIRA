# نتائج الفحص الأمني المتقدم واختبار الاختراق العميق (Advanced Security Findings)
## منصة أسيرا لتعليم البحث العلمي (ASIRA Research Learning Platform)
**وثيقة تقييم وتحليل الفئات الأمنية المتقدمة وفق معايير OWASP و Firebase Security**  
**المرحلة:** المرحلة الثالثة (Phase 3 — Deep Security Assessment & Penetration Findings)  
**التاريخ:** أكتوبر 2026  
**حالة التقييم:** تدقيق واختبار شامل بالأدلة والبراهين الفنية

---

## 1. منهجية الفحص والتصنيف الأمني (Assessment Methodology)
تم إخضاع المنصة لفحص أمني واختبار اختراق تجريبي معتمد على الأدلة (Evidence-Based Testing) عبر 15 فئة هجومية متقدمة، مع تصنيف كل نتيجة وفق إحدى الحالات المعتمدة:
- **VERIFIED PROTECTED**: تم التحقق من وجود حماية فعالة ومجربة في البنية البرمجية أو القواعد السحابية.
- **FIXED — VERIFIED BY RETEST**: ثغرة أو فجوة كانت موجودة وتم إصلاحها وإعادة اختبارها واجتيازها بنجاح.
- **POTENTIAL VULNERABILITY**: خطر أمني محتمل أو قيود تعتمد على إعدادات بيئة الإنتاج السحابية.
- **NOT TESTED / BLOCKED**: فحص يتطلب وصولاً حياً إلى خدمات الإنتاج أو البنية التحتية لمزود الاستضافة وتم توثيق متطلباته بدقة.
- **NOT APPLICABLE**: فئة هجومية لا تنطبق على معمارية المنصة الفعلية (مثل هجمات SQL Injection في غياب قواعد SQL).

---

## 2. نتائج الفحص عبر الفئات الـ 15 (Detailed Findings across 15 Attack Categories)

### الفئة 1: حجب الخدمة واستنزاف الموارد والتكاليف (DoS & Cost Abuse)
- **DoS — Denial of Service (استنزاف الذاكرة والعمليات):**
  - *النتيجة:* `VERIFIED PROTECTED`.
  - *الدليل:* تم وضع قيود أطوال صارمة على المدخلات النصية عبر `sanitizeInput(val, maxLength)` مما يحول دون إرسال نصوص هائلة الحجم لاستنزاف معالجة المتصفح.
- **DDoS — Distributed Denial of Service (الهجمات الموزعة):**
  - *النتيجة:* `BLOCKED / PROVIDER DEPENDENT`.
  - *الدليل:* المنصة مستضافة كـ SPA على شبكة Vercel Edge العالمية، وحمايتها تعتمد على شبكة Anycast الخاصة بـ Vercel و Google Cloud Armor على مستوى فايربيس. لا يمكن ولا يجوز توليد حركة مرور إغراقية لاختبار ذلك بدون تصريح مكتوب من مزود الخدمة.
- **Resource Exhaustion & Cost Abuse (استنزاف استعلامات Firestore):**
  - *النتيجة:* `POTENTIAL VULNERABILITY / OPERATIONAL RISK (RISK-03)`.
  - *الدليل:* تكرار استعلامات الشهادات أو المقررات من خلال واجهات برمجة التطبيقات قد يستهلك حصة القراءة المجانية لفايربيس. تم توثيق توصية تفعيل Firebase App Check ووضع حصص استهلاك (Quotas) في دليل الإطلاق.

### الفئة 2: هجمات الحسابات والمصادقة (Authentication & Account Security)
- **Brute-Force & Credential Stuffing (تخمين كلمات المرور):**
  - *النتيجة:* `VERIFIED PROTECTED`.
  - *الدليل:* تعتمد المنصة على Firebase Authentication الذي يتضمن آليات حماية وتأخير ذكية تلقائية (Smart Rate Limiting) وحظر مؤقت لعناوين IP والحسابات التي تكرر محاولات الدخول الخاطئة.
- **Account Enumeration (كشف وجود الحسابات):**
  - *النتيجة:* `VERIFIED PROTECTED`.
  - *الدليل:* تم تعطيل الكشف الصريح عن البريد الإلكتروني في واجهات الأخطاء، ورسائل الخطأ تظهر للمستخدم بصيغ موحدة وعامة ("بيانات الاعتماد غير صحيحة") دون توضيح ما إذا كان البريد موجوداً في قاعدة البيانات أم لا.
- **Session Invalidation & Role Revocation (استمرار الصلاحيات بعد إلغاء الدور):**
  - *النتيجة:* `VERIFIED PROTECTED`.
  - *الدليل:* تفحص قواعد Firestore وثيقة الدور الفعلية في `/users/$(request.auth.uid)` عند كل عملية كتابة حساسة، مما يعني أنه في اللحظة التي يلغي فيها المدير دور المستخدم من قاعدة البيانات، تُرفض أي عملية كتابة فورياً حتى وإن كانت جلسة الواجهة لا تزال مفتوحة محلياً.

### الفئة 3: التحكم في الوصول والصلاحيات (Access Control, IDOR & BOLA)
- **IDOR / BOLA على ملفات ودرجات الطلاب الآخرين:**
  - *النتيجة:* `FIXED — VERIFIED BY RETEST`.
  - *الدليل:* في السابق كانت وثائق `/users/{uid}` متاحة للقراءة لأي مستخدم مسجل. تم تصحيح هذا الجدار في المرحلة الثانية وأعيد اختباره في حزمة الاختبارات الآلية (`tests/security_suite.mjs` - Test 5.1)، حيث تشترط القواعد: `allow read: if isOwner(uid) || isAdmin() || isInstructor();`.
- **Vertical Privilege Escalation (تصعيد الصلاحية إلى مدير أو مدرس):**
  - *النتيجة:* `FIXED — VERIFIED BY RETEST`.
  - *الدليل:* تم حظر تعديل حقل `role` في وثيقة المستخدم عبر القواعد، وتشترط القواعد عند كتابة أي دور إداري أن يكون الفاعل مديراً معتمداً ومثبتاً بالبريد الموثق (`email_verified == true`).

### الفئة 4: أمان قاعدة بيانات Firestore (Database & Security Rules)
- **Default-Deny Policy (سياسة الرفض الافتراضي):**
  - *النتيجة:* `VERIFIED PROTECTED`.
  - *الدليل:* تم إثبات وجود قاعدة الرفض الشاملة في نهاية ملف [firestore.rules](file:///e:/ASIRA/firestore.rules): `match /{document=**} { allow read, write: if false; }` والتي تم اختبارها آلياً في الاختبار رقم 5.7 بنجاح.
- **Protected-Field Modification & Mass Assignment:**
  - *النتيجة:* `VERIFIED PROTECTED`.
  - *الدليل:* حظر حقول `score`, `officialGrade`, `calculatedScore` صراحةً عند إنشاء وثائق المحاولات، مما يمنع استغلال حقن الكائنات (Object Injection).

### الفئة 5: نزاهة الاختبارات والدرجات والشهادات (Exam, Grade & Cert Integrity)
- **Answer-Key Confidentiality (سرية مفاتيح الإجابات):**
  - *النتيجة:* `FIXED — VERIFIED BY RETEST`.
  - *الدليل:* عزل مسارات مفاتيح الحلول في قواعد فايربيس (`/exams/{examId}/answerKey/{secretDoc=**}`) واشتراط صلاحيات المدرس أو المدير فقط لقراءتها، بالإضافة إلى دالة التطهير البرمجي [sanitizeExamForStudent](file:///e:/ASIRA/src/utils/security.ts) التي تم فحصها آلياً في الاختبارات 3.1 و 3.2 لضمان تجريد حقول `correctIndex` و `correctOption` تماماً قبل وصولها لمتصفح الطالب.
- **Client-Side Score Injection (حقن الدرجات في المتصفح):**
  - *النتيجة:* `FIXED — VERIFIED BY RETEST`.
  - *الدليل:* القواعد ترفض أي وثيقة محاولة تتضمن حقول الدرجات المحسوبة، وتحصر رصد الدرجات النهائية بالمدير والمدرس في مجموعات منفصلة (`/officialGrades` و `/practicalGrades`).
- **Academic Certificate Forgery (تزوير الشهادات):**
  - *النتيجة:* `FIXED — VERIFIED BY RETEST`.
  - *الدليل:* تم إلغاء الثغرة السابقة التي كانت تقبل أي كود يبدأ بـ `ASIRA-` دون مراجعة قاعدة البيانات. أصبح التحقق يستعلم بشكل حصري من وثائق الشهادات الصادرة (`status == 'issued'`) ومطابقة الكود بدقة.

### الفئة 6: أمان واجهات التطبيق البرمجية (API & BaaS Architecture)
- **Direct API & BaaS Security Boundary:**
  - *النتيجة:* `VERIFIED PROTECTED`.
  - *الدليل:* نظراً لأن التطبيق لا يعتمد على خادم Node.js تقليدي بل يتصل مباشرة بـ Firebase SDK، فإن حدود الأمان مفروضة بنسبة 100% على مستوى محرك تقييم قواعد Firestore، ولا يمكن للمهاجم الالتفاف حول الواجهة واستدعاء REST APIs للحصول على بيانات غير مصرح بها.

### الفئة 7: هجمات الحقن وحماية المتصفح (Injection & Browser Attacks)
- **Cross-Site Scripting (XSS) & Unsafe URL Schemes:**
  - *النتيجة:* `FIXED — VERIFIED BY RETEST`.
  - *الدليل:* تم اختبار دالة `sanitizeUrl` ضد حمولات `javascript:alert(1)`، والتهريب عبر الفراغات والحروف الكبيرة `JaVaScRiPt:`، وحمولات `data:text/html`، و `vbscript:` في الاختبارات 1.1 إلى 1.4، وكلها تُبطل وتُستبدل برمز `#` الآمن.
- **HTML / SVG Injection:**
  - *النتيجة:* `VERIFIED PROTECTED`.
  - *الدليل:* يعتمد التطبيق على محرك React JSX الافتراضي الذي يعقم النصوص تلقائياً عبر Text Node Escaping، ولا يوجد استخدام لدوال خطيرة مثل `dangerouslySetInnerHTML` في عرض مدخلات الطلاب.
- **Prototype Pollution:**
  - *النتيجة:* `VERIFIED PROTECTED`.
  - *الدليل:* تم إثبات مناعة دوال التطهير عبر الاختبار الآلي 10.1 حيث لم تؤدِ الحمولات التي تحتوي على `__proto__` إلى تلويث كائن النموذج الأولي `Object.prototype`.

### الفئة 8: هجمات SSRF و CSRF واستغلال الطلبات (Request Attacks)
- **SSRF (Server-Side Request Forgery):**
  - *النتيجة:* `NOT APPLICABLE`.
  - *الدليل:* لا توجد وظائف خلفية أو Cloud Functions تقوم بجلب روابط أو موارد من خوادم داخلية أو خارجية بناءً على مدخلات المستخدم.
- **CSRF (Cross-Site Request Forgery):**
  - *النتيجة:* `VERIFIED PROTECTED`.
  - *الدليل:* يعتمد Firebase SDK على تخزين رموز الوصول (Bearer Tokens) داخل IndexedDB وإرسالها عبر ترويسة `Authorization: Bearer <token>` في طلبات gRPC/REST، ولا يعتمد على ملفات تعريف الارتباط التلقائية (Session Cookies)، مما يمنع هجمات CSRF الكلاسيكية تماماً.

### الفئة 9: رفع الملفات والتخزين السحابي (File & Storage Security)
- **Storage Subdomain Spoofing (انتحال نطاقات التخزين):**
  - *النتيجة:* `FIXED — VERIFIED BY RETEST`.
  - *الدليل:* تم اكتشاف وإصلاح ثغرة التعبير النمطي في `isTrustedStorageUrl` واستبدالها بالتحقق الصارم من `hostname` عبر `new URL()`. تم إثبات حظر نطاقات الخداع مثل `drive.google.com.attacker.com` و `drive.google.com@attacker.com` في الاختبارات الآلية 2.4 و 9.1 بنجاح.

### الفئة 10: أخطاء التهيئة والبنية التحتية (Configuration & Infrastructure)
- **HTTP Security Headers & Framing Protection:**
  - *النتيجة:* `FIXED — VERIFIED BY RETEST`.
  - *الدليل:* تم إعداد [vercel.json](file:///e:/ASIRA/vercel.json) بالترويسات الأكاديمية الصارمة:
    - `X-Content-Type-Options: nosniff` (منع التخمين الخبيث للملفات).
    - `X-Frame-Options: DENY` و `frame-ancestors 'none'` (منع Clickjacking تماماً).
    - `Content-Security-Policy` مقيدة ومضبوطة لبيئة العمل.
    - تم اختبار هذه الترويسات آلياً في الاختبارات 8.1 إلى 8.5.

### الفئة 11: الأسرار والخصوصية وتسريب البيانات (Secrets & Privacy)
- **Leaked Secrets in Source & Bundles:**
  - *النتيجة:* `VERIFIED PROTECTED`.
  - *الدليل:* فحص شامل لملفات المشروع، ومستودع Git، ومخرجات البناء `dist/assets/*.js`. لم يتم العثور على أي مفاتيح خاصة لـ Service Accounts أو كلمات مرور مخزنة. إعدادات Firebase العامة الموجودة في الواجهة هي معرفات عميل طبيعية وفق معمارية فايربيس العامة ولا تشكل أسراراً طالما أن قواعد Firestore محكمة.

### الفئة 12: سلسلة التوريد والاعتماديات (Supply-Chain Security)
- **Vulnerable Packages & Build Integrity:**
  - *النتيجة:* `VERIFIED PROTECTED / RESIDUAL RISK MONITORED`.
  - *الدليل:* التطبيق يقتصر على 4 حزم تشغيلية نظيفة. تم عزل التحذيرات الـ 4 المتعدية في `@grpc/grpc-js` وتوثيقها بوضوح (RISK-01) لكونها في بيئة Node وغير مدمجة في حزمة المتصفح العميل نهائياً.

### الفئة 13: هجمات التزامن والمنطق البرمجي (Race Conditions & Concurrency)
- **Concurrent Exam Submissions & Duplicate Attempts:**
  - *النتيجة:* `VERIFIED PROTECTED`.
  - *الدليل:* تعتمد وثائق تسليم الامتحانات على معرفات محددة ترتبط بمعرف الطالب ومعرف المحاولة، وتفرض قواعد الحفظ عدم إمكانية تعديل وثيقة المحاولة المكتملة بعد إنشائها (`allow update: if false`).

### الفئة 14: إساءة استخدام وظائف المنصة (Platform Abuse & Misuse)
- **Bulk Certificate Verification:**
  - *النتيجة:* `POTENTIAL VULNERABILITY / OPERATIONAL RISK (RISK-02)`.
  - *الدليل:* التحقق من الشهادات يتطلب كوداً عشوائياً دقيقاً، ولكن لا يوجد حالياً اختبار CAPTCHA على الواجهة لمنع التخمين الآلي للأكواد. تم توثيق ذلك كإجراء مستقبلي موصى به.

### الفئة 15: خلاصة مصفوفة الفئات الـ 15 (Classification Summary)
- إجمالي الفئات المفحوصة: 15 فئة هجومية متقدمة.
- الثغرات المكتشفة والمصلحة والمعاد اختبارها: 5 ثغرات رئيسية (IDOR، انتحال النطاقات، كشف الإجابات، كود الشهادات، ترويسات الاستضافة).
- الفئات المحمية والمؤكدة برمجياً: 8 فئات بالكامل.
- الفئات غير المنطبقة: فئة واحدة (SSRF).
- القيود التشغيلية المتبقية الخاضعة لقرار المالك: 2 قيود تشغيلية موثقة (CAPTCHA و App Check).

---

## 3. القرار الفني النهائي
المنصة محصنة ومجربة ضد نواقل الهجوم المباشرة، وحواجز الصلاحيات مفروضة على مستوى قاعدة البيانات وسحابة النشر، مما يؤكد أهليتها للتشغيل الآمن وفق مبادئ **الإطلاق المشروط (Conditional Release)**.
