# مصفوفة الاختبارات الأمنية التفصيلية (Phase 3 Security Test Matrix)
**المشروع:** منصة ومنتدى أسيرا لتعليم البحث العلمي (ASIRA Research Learning Platform)  
**التاريخ:** 14 أكتوبر 2026  
**حالة الاختبارات الآلية الشاملة:** ✅ **32 اختبار ناجح من أصل 32 (100% Pass Rate)**  
**ملف الاختبارات:** `tests/security_suite.mjs`

---

## 1. مصفوفة الحدود والسيناريوهات الأمنية (Security Boundary Matrix)

| معرف الاختبار (Test ID) | الحد الأمني / المورد | دور المهاجم المفترض | سيناريو الهجوم / الاختبار | النتيجة المتوقعة | النتيجة الفعلية | الحالة | المعرف المرتبط |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **SEC-URL-01** | Client URL Sanitizer | زائر / طالب | محاولة حقن `javascript:alert(1)` في رابط DOI | استبدال الرابط بـ `#` | تم الإرجاع `#` | ✅ PASS | VULN-06 |
| **SEC-URL-02** | Client URL Sanitizer | زائر / طالب | حقن بروتوكول مشوش بحروف متباينة `JaVaScRiPt:cookie` | استبدال الرابط بـ `#` | تم الإرجاع `#` | ✅ PASS | VULN-06 |
| **SEC-URL-03** | Client URL Sanitizer | زائر / طالب | حقن محتوى Data URI مشفر `data:text/html;base64,...` | استبدال الرابط بـ `#` | تم الإرجاع `#` | ✅ PASS | VULN-06 |
| **SEC-URL-04** | Client URL Sanitizer | زائر / طالب | حقن بروتوكول قديم `vbscript:msgbox(1)` | استبدال الرابط بـ `#` | تم الإرجاع `#` | ✅ PASS | VULN-06 |
| **SEC-URL-05** | Client URL Sanitizer | باحث / مدرس | إدخال رابط DOI حقيقي يبدأ بـ HTTPS | السماح بالرابط دون تشويه | تم السماح بالرابط كاملاً | ✅ PASS | Legitimate |
| **SEC-URL-06** | Client URL Sanitizer | باحث / مدرس | إدخال رابط PubMed حقيقي يبدأ بـ HTTPS | السماح بالرابط دون تشويه | تم السماح بالرابط كاملاً | ✅ PASS | Legitimate |
| **SEC-URL-07** | Client URL Sanitizer | طالب / مدرس | إدخال رابط Google Drive لمستند أو سلايد | السماح بالرابط دون تشويه | تم السماح بالرابط كاملاً | ✅ PASS | Legitimate |
| **SEC-URL-08** | Client URL Sanitizer | نظام | تمرير قيم فارغة (null, undefined, "") | عدم انهيار النظام وإرجاع `#` | تم الإرجاع `#` بدون أخطاء | ✅ PASS | Stability |
| **SEC-STOR-01** | نطاقات التخزين | طالب | تمرير رابط Google Drive حقيقي | قبول النطاق كمعتمد | True | ✅ PASS | Integration |
| **SEC-STOR-02** | نطاقات التخزين | طالب | تمرير رابط Google Docs حقيقي | قبول النطاق كمعتمد | True | ✅ PASS | Integration |
| **SEC-STOR-03** | نطاقات التخزين | طالب | تمرير رابط Firebase Storage حقيقي | قبول النطاق كمعتمد | True | ✅ PASS | Integration |
| **SEC-STOR-04** | نطاقات التخزين | مهاجم خارجي | انتحال نطاق ببادئة خادعة `drive.google.com.attacker.com` | رفض النطاق فوراً | تم الرفض False | ✅ PASS | Spoofing |
| **SEC-STOR-05** | نطاقات التخزين | شبكة غير آمنة | تمرير رابط غير مشفر HTTP عادي | رفض الاتصال غير المشفر | تم الرفض False | ✅ PASS | Insecure Transport |
| **SEC-EXAM-01** | سرية إجابات الامتحانات | طالب | استعراض كائن الامتحان في متصفح الطالب | عزل وحذف حقول `correctIndex`, `correctOpt` | تم الحذف كلياً من الكائن | ✅ PASS | VULN-05 / D.1 |
| **SEC-EXAM-02** | سرية إجابات الامتحانات | طالب | استعراض نصوص الأسئلة والدرجات المقررة | بقاء نصوص الأسئلة والخيارات والدرجات سليمة | بقاء البيانات التعليمية | ✅ PASS | UX Integrity |
| **SEC-INP-01** | سلامة المدخلات | مستخدم | إدخال نصوص تحتوي مسافات زائدة وتشويه | تنظيف وقص المسافات الزائدة | تم التنظيف بدقة | ✅ PASS | Input Hygiene |
| **SEC-INP-02** | سلامة المدخلات | مهاجم | إرسال نصوص ضخمة لإحداث Buffer/Memory Exhaustion | تقييد النص بالحد الأقصى (Truncation) | تم اقتصار النص على 500 حرف | ✅ PASS | Denial of Service |
| **SEC-RULE-01** | قواعد `/users/{uid}` | طالب | قراءة وثائق طلاب آخرين عبر قاعدة البيانات | الحظر وعدم السماح بقراءة غير المالك | تم حظر القراءة العامة | ✅ PASS | VULN-01 |
| **SEC-RULE-02** | قواعد `/users/{uid}` | طالب | تعديل دور الطالب إلى `admin` في حسابه | الرفض عبر `affectedKeys` | الحظر التام | ✅ PASS | Privilege Escalation |
| **SEC-RULE-03** | قواعد `/attempts` | طالب | إنشاء محاولة اختبار مع حقن درجة `score: 100` | الرفض لحظر حقول الدرجات عند الإنشاء | الحظر التام | ✅ PASS | VULN-02 |
| **SEC-RULE-04** | قواعد `/officialGrades` | طالب | كتابة أو تعديل وثيقة درجة رسمية معتمدة | الرفض وحصر الكتابة بالمدير والمدرس | الحظر التام | ✅ PASS | Grade Tampering |
| **SEC-RULE-05** | قواعد `/practicalGrades` | طالب | كتابة أو تعديل وثيقة الامتحان العملي الحضوري | الرفض وحصر الكتابة بالمدير والمدرس | الحظر التام | ✅ PASS | Grade Tampering |
| **SEC-RULE-06** | قواعد `/answerKey` | طالب | قراءة وثائق الإجابات النموذجية المخزنة | الحظر التام على الطالب | الحظر التام | ✅ PASS | Answer Secrecy |
| **SEC-RULE-07** | قواعد `/auditLogs` | طالب / مهاجم | إنشاء سجل تدقيق بانتحال صفة مدير `actorRole: admin` | الرفض لاشتراط مطابقة `actorUid` والدور | الحظر التام | ✅ PASS | VULN-04 |
| **SEC-RULE-08** | قواعد Default Catch-all | أي طرف | الوصول لأي مسار غير مصرح به صراحة في القواعد | الحظر التلقائي عبر `allow read, write: if false` | الحظر التام | ✅ PASS | Default Deny |
| **SEC-CERT-01** | محرك الشهادات | طالب | فحص أهلية طالب لم يكمل الدروس ولديه درجة منخفضة | الرفض وتوثيق النواقص بدقة | `isEligible: false` | ✅ PASS | Academic Rules |
| **SEC-CERT-02** | محرك الشهادات | طالب | فحص أهلية طالب استوفى الدروس والاختبارات والعملي | الموافقة على طلب الشهادة | `isEligible: true` | ✅ PASS | Academic Rules |
| **SEC-CERT-03** | محرك الشهادات | مهاجم خارجي | إدخال كود تحقق مفبرك `ASIRA-FAKE-9999` | الرفض وعدم تصديق الكود المزيف | `valid: false` | ✅ PASS | VULN-05 |
| **SEC-CERT-04** | محرك الشهادات | زائر | إدخال كود فارغ في صفحة التحقق | الرفض الفوري | `valid: false` | ✅ PASS | Input Validation |
| **SEC-CERT-05** | محرك الشهادات | صاحب عمل / جهة | إدخال كود شهادة صادر ومعتمد حقيقي | التحقق وإظهار بيانات الطالب المعتمدة | `valid: true` مع بيانات الشهادة | ✅ PASS | Verification |
| **SEC-HEAD-01** | ترويسات المتصفح | متصفح العميل | فحص الحماية من تخمين أنواع الملفات (MIME Sniffing) | وجود ترويسة `X-Content-Type-Options: nosniff` | محققة في `index.html` و `vercel.json` | ✅ PASS | VULN-07 |
| **SEC-HEAD-02** | ترويسات المتصفح | متصفح العميل | فحص سياسة تسريب مسار الإحالة (Referrer-Policy) | وجود `strict-origin-when-cross-origin` | محققة في `index.html` و `vercel.json` | ✅ PASS | Privacy Header |

---
**نتيجة الاختبارات:** 32 / 32 اختبار ناجح بنسبة 100% دون أي حالات إخفاق.
