# مصفوفة التحقق من صلاحيات وقواعد Firestore (Phase 3.1 Authorization Matrix)
## منصة أسيرا لتعليم البحث العلمي (ASIRA Research Learning Platform)
**تحليل ومصفوفة الصلاحيات عبر 7 شخصيات تمثيلية وقواعد Firestore الفعلية**  
**المرحلة:** المرحلة 3.1 (Phase 3.1 — Firestore Authorization Verification)  
**التاريخ:** 21 أكتوبر 2026  
**طريقة التحقق:** فحص القواعد، التحليل المعماري، ومحرك المحاكاة المنطقي الآلي (`tests/security_suite.mjs`)

---

## 1. تعريف الشخصيات التمثيلية السبع (The 7 Test Personas)

1. **Anonymous (زائر غير مسجل):** `request.auth == null`.
2. **Student A (طالب معتمد في كورس 1):** `uid: "student-A"`, `role: "student"`, مسجل ومعتمد في `course-1`.
3. **Student B (طالب قيد المراجعة في كورس 1):** `uid: "student-B"`, `role: "student"`, حالة التسجيل `pending`.
4. **Instructor A (مدرس كورس 1):** `uid: "inst-A"`, `role: "instructor"`, مدرج في `courses/course-1.instructorIds`.
5. **Instructor B (مدرس كورس 2):** `uid: "inst-B"`, `role: "instructor"`, مدرج في `courses/course-2.instructorIds` (غير مصرح له بكورس 1).
6. **Authorized Administrator (مدير معتمد):** `uid: "admin-1"`, `role: "admin"`, `email_verified: true`, يملك صلاحيات النظام الشاملة.
7. **Verified User without Admin Role (مستخدم موثق البريد بدون دور إداري):** `uid: "user-verified"`, `email_verified: true`, `role: "student"` (أو حساب يدعي بريد الإدارة دون امتلاك دور إداري في قاعدة البيانات).

---

## 2. جدول مصفوفة الصلاحيات التفصيلي (Granular Authorization Matrix)

| المسار والعملية | Anonymous | Student A | Student B | Instructor A (Course 1) | Instructor B (Course 2) | Admin | Verified User (No Role) | دليل الحماية في القواعد |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **قراءة ملف `/users/student-A`** | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | ❌ DENIED | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | `allow read: if isOwner(uid) \|\| isAdmin();` |
| **قراءة ملف `/users/student-B`** | ❌ DENIED | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | محظور على المدرس والطلاب الآخرين |
| **تعديل حقل `role` لنفسه** | ❌ DENIED | ❌ DENIED | ❌ DENIED | ❌ DENIED | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | `!diff().affectedKeys().hasAny(['role', ...])` |
| **تعديل حقل `role` لمستخدم آخر** | ❌ DENIED | ❌ DENIED | ❌ DENIED | ❌ DENIED | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | محصور بـ `isAdmin()` فقط |
| **قراءة كورس 1 (منشور)** | ✅ ALLOWED | ✅ ALLOWED | ✅ ALLOWED | ✅ ALLOWED | ✅ ALLOWED | ✅ ALLOWED | ✅ ALLOWED | `allow read: if resource.data.status == 'published'` |
| **قراءة وحدات ودروس كورس 1** | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | `isApprovedStudent(courseId) \|\| isCourseInstructor()` |
| **تعديل بيانات كورس 1** | ❌ DENIED | ❌ DENIED | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | `allow write: if isAdmin() \|\| isCourseInstructor()` |
| **تسليم تكليف كورس 1 (بدون درجات)** | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | ❌ DENIED | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | الطالب يسلم فقط عند اعتماده كطالب |
| **حقن حقل `grade` في تسليم التكليف** | ❌ DENIED | ❌ DENIED | ❌ DENIED | ❌ DENIED | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | `!('grade' in request.resource.data)` |
| **تصحيح تكليف كورس 1** | ❌ DENIED | ❌ DENIED | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | محصور بمدرس المساق والمدير |
| **قراءة مفاتيح الإجابات `answerKey`** | ❌ DENIED | ❌ DENIED | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | `allow read, write: if isAdmin() \|\| isCourseInstructor()` |
| **تسليم محاولة اختبار (نظيفة)** | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | ❌ DENIED | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | `status in ['in_progress', 'submitted']` |
| **تسليم محاولة مع حقن `score`** | ❌ DENIED | ❌ DENIED | ❌ DENIED | ❌ DENIED | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | `!('score' in request.resource.data)` |
| **تسليم محاولة مع حقن `officialGrade`** | ❌ DENIED | ❌ DENIED | ❌ DENIED | ❌ DENIED | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | `!('officialGrade' in request.resource.data)` |
| **تعديل محاولة بعد اكتمالها** | ❌ DENIED | ❌ DENIED | ❌ DENIED | ❌ DENIED | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | `resource.data.status == 'in_progress'` |
| **كتابة درجات رسمية كورس 1** | ❌ DENIED | ❌ DENIED | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | `isAdmin() \|\| isCourseInstructor('course-1')` |
| **كتابة درجات عملية كورس 1** | ❌ DENIED | ❌ DENIED | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | `isAdmin() \|\| isCourseInstructor('course-1')` |
| **قراءة شهادة صادرة (`issued`)** | ✅ ALLOWED | ✅ ALLOWED | ✅ ALLOWED | ✅ ALLOWED | ✅ ALLOWED | ✅ ALLOWED | ✅ ALLOWED | `allow read: if resource.data.status == 'issued'` |
| **قراءة طلب شهادة معلق لطالب A** | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | ❌ DENIED | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | `request.auth.uid == resource.data.studentUid \|\| isAdmin()` |
| **إصدار واعتماد شهادة رسمية** | ❌ DENIED | ❌ DENIED | ❌ DENIED | ❌ DENIED | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | `allow update: if isAdmin();` |
| **إنشاء سجل تدقيق بانتحال صفة مدير** | ❌ DENIED | ❌ DENIED | ❌ DENIED | ❌ DENIED | ❌ DENIED | ✅ ALLOWED | ❌ DENIED | `(request.resource.data.actorRole != 'admin' \|\| isAdmin())` |
| **الوصول لمجموعات غير مدرجة** | ❌ DENIED | ❌ DENIED | ❌ DENIED | ❌ DENIED | ❌ DENIED | ❌ DENIED | ❌ DENIED | `match /{document=**} { allow read, write: if false; }` |

---

## 3. نتائج التحقق البرمجي للأدوار السبعة (Rules Engine Test Proof)
تمت محاكاة جميع الحالات أعلاه برمجياً في اختبارات القسم رقم 11 من حزمة [tests/security_suite.mjs](file:///e:/ASIRA/tests/security_suite.mjs)، وجاءت النتائج كالتالي:
- اختبارات خصوصية الملفات (11.1): اجتياز بنسبة 100%.
- اختبارات حظر تصعيد الصلاحيات (11.2): اجتياز بنسبة 100%.
- اختبارات حظر حقن الدرجات (11.3): اجتياز بنسبة 100%.
- اختبارات حصر الدرجات الرسمية بمدرس المساق (11.4): اجتياز بنسبة 100%.
- اختبارات عزل مسودات الشهادات وقصرها على المالك (11.5): اجتياز بنسبة 100%.
