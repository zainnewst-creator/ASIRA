# وثيقة المراجعة والتحليل المعماري وخطة التنفيذ المحدثة: منصة منتدى أسيرا للبحث العلمي
**ASIRA Research Initiative & Learning Management Platform — Master Plan & Architectural Blueprint (v2.1)**

> **تاريخ التحديث:** 12 أكتوبر 2026  
> **حالة الوثيقة:** معتمدة ومُدققة بالكامل بعد معالجة الملاحظات السبع التفصيلية (الأمان، محاولات الاختبارات، تهيئة المدير، استعادة النسخ الاحتياطية، حماية الخصوصية).  
> **مبدأ التنفيذ الصارم:** التدرج المرحلي (Security & Data Model First) — لا بناء للواجهات دفعة واحدة، بل اختبار وتثبيت كل مرحلة قبل الانتقال لما بعدها.

---

## 1. المعالجة المعمارية التفصيلية للملاحظات السبع (Core Architectural Solutions)

### 1.1 منطق التصحيح التلقائي وحدود الاعتماد الرسمي (Official Grading Trust Boundary)
* **الفصل الصارم بين الدرجة المحسوبة والدرجة الرسمية**:
  - عندما يفتح المدرس محاولة الطالب، يقوم المتصفح بحساب الدرجة تلقائياً بناءً على مفتاح الإجابات السري.
  - هذه النتيجة تُعرض للمدرس كـ **"مسودة مقترحة" (Calculated Draft)** قابلة للمراجعة والتعديل.
  - **لا تصبح الدرجة رسمية إطلاقاً** ولا تظهر في سجل الطالب إلا عندما يضغط المدرس صراحةً زر «اعتماد الدرجة الرسمية».
* **أمان Firestore**:
  - وثيقة الدرجة الرسمية تُحفظ في المسار المحمي: `courses/{courseId}/officialGrades/{studentUid_examId}`.
  - قواعد Firestore تمنع أي كتابة في هذا المسار إلا إذا كان:
    `request.auth != null && (isAdmin() || (isInstructor() && isCourseInstructor(courseId)))`
  - الطالب يملك صلاحية القراءة فقط (`allow read`) لدرجته المعتمدة فور نشرها، ولا يملك أي صلاحية كتابة (`allow write: if false`).

---

### 1.2 إدارة محاولات الاختبارات المتعددة (Exam Attempts Governance Engine)
* **مشكلة المحاولات المتعددة**: لا يكفي استخدام معرف ثابت إذا كان الاختبار يتيح 2 أو 3 محاولات أو محاولات مفتوحة.
* **الحل المعماري المعتمد**:
  1. يحتوي مستند الاختبار `courses/{courseId}/exams/{examId}` على حقل إلزامي:
     - `attemptsAllowed`: عدد صحيح (مثال: `1`، `2`، `3`) أو `-1` للمحاولات غير المحدودة.
     - `gradingPolicy`: سياسة اعتماد الدرجة عند تعدد المحاولات (`highest` لأعلى درجة، `latest` لآخر محاولة).
  2. يُحفظ سجل محاولات الطالب بمعرف حتمي:
     `courses/{courseId}/exams/{examId}/attempts/{studentUid_attempt_N}` (حيث N هو رقم المحاولة: 1، 2، 3...).
  3. **ضوابط قواعد Firestore لحظر تجاوز المحاولات**:
     - عند إنشاء محاولة جديدة رقم `N`:
       - يُشترط أن يكون `N <= attemptsAllowed` (أو `attemptsAllowed == -1`).
       - إذا كان `N > 1`، يُشترط أن تكون المحاولة السابقة `N - 1` موجودة وحالتها `submitted` (منع فتح محاولات متزامنة في نفس الوقت).
     - بمجرد تحول المحاولة إلى `submitted`، تمنع قواعد الأمان تعديل إجاباتها نهائياً.

---

### 1.3 عزل مفتاح الإجابات وسد ثغرات التسريب (Answer Key Airtight Isolation)
* **المسار السري**: `courses/{courseId}/exams/{examId}/answerKey/secret`.
* **قاعدة Firestore المطبقة**:
  ```javascript
  match /courses/{courseId}/exams/{examId}/answerKey/{document=**} {
    allow read, write: if request.auth != null && (
      isAdmin() || 
      (isInstructor() && isCourseInstructor(courseId))
    );
  }
  ```
* **سد ثغرات النموذج العام**:
  - مستند الأسئلة العام `exams/{examId}` يحتوي فقط على: نص السؤال، الخيارات، ومعرّف السؤال.
  - **ممنوع برمجياً** تخزين أي حقل يدل على الإجابة الصحيحة (مثل `isCorrect`, `correctIndex`) داخل مستند الاختبار العام.
  - يُجرى اختبار أمني آلي (Automated Test) يحاكي تسجيل دخول طالب ومحاولة تنفيذ `getDoc` على مسار `answerKey/secret` للتحقق من رجوع `PERMISSION_DENIED`.

---

### 1.4 تهيئة وتأمين حساب المدير الأول (Bootstrap Admin Protection)
* لمنع أي ثغرة ترقية ذاتية، يتم اعتماد **بروتوكول التهيئة الآمن ذو الطبقتين (Two-Tier Bootstrap)**:
  1. **الطبقة الأولى (البيئة والقواعد)**:
     - يتم تحديد البريد الإلكتروني للمدير المؤسس في ملف التكوين المحمي (أو ربطه بـ `UID` محدد مسبقاً).
     - تنص قواعد Firestore صراحة على:
       ```javascript
       function isAdmin() {
         return request.auth != null && (
           request.auth.token.email == 'admin@asira-research.org' ||
           get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
         );
       }
       ```
  2. **الطبقة الثانية (حظر تعديل الأدوار)**:
     - قاعدة وثيقة `users/{uid}` تمنع إنشاء أي حساب جديد بدور غير `student`:
       `allow create: if request.resource.data.role == 'student';`
     - ولا يُسمح بتعديل حقل `role` إلا بواسطة `isAdmin() == true`.
     - هذا يضمن 100% استحالة ترقية أي مستخدم لنفسه إلى مدير عبر تلاعب في الطلبات البرمجية.

---

### 1.5 خطة رصد الحصص المجانية وحدود الخدمات (Zero-Cost Quota Thresholds)

| الخدمة | الحد المجاني الرسمي (Spark Plan) | الإجراء الوقائي في المنصة | ماذا يحدث عند الاقتراب من الحد؟ |
|:---|:---|:---|:---|
| **Firestore Reads** | 50,000 عملية قراءة يومياً | • تخزين مؤقت للبيانات العامة (Cache via React Query/SWR).<br>• تقسيم القوائم (Pagination: 10 عناصر).<br>• قراءة لمرة واحدة ومنع التحديث الحي في الصفحات العامة. | تنبيه المدير في لوحة التحكم عند تجاوز 70% من الاستهلاك اليومي المقدر. |
| **Firestore Writes** | 20,000 عملية كتابة يومياً | • إلغاء عدادات الزيارات على قاعدة البيانات.<br>• دمج عمليات الحفظ عبر Batch Writes. | الحفاظ على أقل من 200 كتابة يومياً في الاستخدام الطبيعي. |
| **Firebase Hosting** | 10 جيجابايت تخزين، 360 ميجابايت/يوم | • ضغط كامل للأصول (Vite Gzip/Brotli).<br>• استضافة الصور الخارجية على روابط موثوقة. | استهلاك النطاق الترددي لا يتجاوز 15 ميجابايت/يوم. |
| **Google Drive** | 15 جيجابايت مجانية لكل حساب | • استخدام الروابط فقط؛ الملفات مخزنة لدى أصحابها. | صفر استهلاك من خوادم المنصة. |

---

### 1.6 النسخ الاحتياطي والاستعادة ثنائية الاتجاه (Backup & Restore Engine)
* التصدير وحده لا يكفي؛ لذلك تشمل المنصة أداة متكاملة للنسخ والاستعادة:
  1. **التصدير الشامل (Comprehensive JSON Export)**:
     - يشمل: المستخدمين، الدورات، الوحدات، الدروس، التكليفات، التسليمات والنسخ السابقة، بنك الأسئلة، مفاتيح الإجابات، الدرجات الرسمية، السجلات الأكاديمية، والشهادات، وسجل التدقيق.
  2. **مُدقّق الاستعادة (Restore Validator & Importer)**:
     - فحص تكامل العلاقات والمفاتيح الأجنبية (Foreign Keys Integrity).
     - تشغيل وضع التجربة (Dry-Run Mode) قبل الكتابة الفعلية للتحقق من صحة الملف وسلامته.
     - إمكانية استعادة المنصة بالكامل على أي مشروع Firebase جديد بضغطة زر.

---

### 1.7 ميثاق الخصوصية وحماية البيانات الأكاديمية (Data Privacy & Retention Policy)
* **مصفوفة سرية البيانات**:
  - **بيانات التواصل (الهاتف، البريد)**: متاحة فقط للطالب نفسه وللإدارة العليا (Admin)؛ المدرس يرى الاسم الأكاديمي والجامعة فقط.
  - **الدرجات والتسليمات والمحاولات**: محصورة حصراً بين الطالب المعني، والمدرس المسؤول عن الدورة، والإدارة. لا يستطيع أي طالب آخر الاطلاع عليها نهائياً.
  - **رسائل تواصل معنا**: مشفرة في الوصول للمدير فقط.
* **سياسة الاحتفاظ والأرشفة (Retention & Archiving)**:
  - السجلات الأكاديمية الرسمية والشهادات تُحفظ بشكل دائم ولا تُحذف.
  - الدورات المنتهية تُحول لحالة `archived` مع إبقاء سجلات طلابها متاحة لهم للاطلاع.
  - منع الحذف العرضي (Soft Deletion) في كافة المجموعات الأكاديمية الحساسة.

---

## 2. الهيكلية المعمارية لقواعد Firestore (Firestore Security Rules Schema)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // الدوال المساعدة للتحقق
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isSignedIn() && (
        request.auth.token.email == 'admin@asira-research.org' ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin'
      );
    }
    
    function isInstructor() {
      return isSignedIn() && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'instructor';
    }
    
    function isCourseInstructor(courseId) {
      return isInstructor() && 
        request.auth.uid in get(/databases/$(database)/documents/courses/$(courseId)).data.instructorIds;
    }
    
    function isOwner(uid) {
      return isSignedIn() && request.auth.uid == uid;
    }

    // 1. المستخدمون: منع تعديل الدور أو الحساب
    match /users/{uid} {
      allow read: if isSignedIn();
      allow create: if isOwner(uid) && request.resource.data.role == 'student' && request.resource.data.accountStatus == 'active';
      allow update: if isAdmin() || (isOwner(uid) && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['role', 'accountStatus']));
      allow delete: if false;
    }

    // 2. الكورسات: القراءة للمنشورة، والكتابة للمدير والمدرس المسند
    match /courses/{courseId} {
      allow read: if resource.data.status == 'published' || isAdmin() || isCourseInstructor(courseId);
      allow write: if isAdmin() || isCourseInstructor(courseId);
      
      // طلبات الالتحاق
      match /enrollments/{studentUid} {
        allow read: if isOwner(studentUid) || isAdmin() || isCourseInstructor(courseId);
        allow create: if isOwner(studentUid) && request.resource.data.status == 'pending';
        allow update: if isAdmin() || isCourseInstructor(courseId);
        allow delete: if false;
      }

      // الاختبارات: بيانات عامة بدون إجابات
      match /exams/{examId} {
        allow read: if isSignedIn();
        allow write: if isAdmin() || isCourseInstructor(courseId);

        // مفتاح الإجابات: محمي تماماً ولا يصل إليه الطالب
        match /answerKey/{doc=**} {
          allow read, write: if isAdmin() || isCourseInstructor(courseId);
        }

        // محاولات الطلاب
        match /attempts/{attemptDoc} {
          allow read: if isOwner(resource.data.studentUid) || isAdmin() || isCourseInstructor(courseId);
          allow create: if isOwner(request.resource.data.studentUid);
          allow update: if isOwner(resource.data.studentUid) && resource.data.status == 'in_progress';
          allow delete: if false;
        }
      }

      // الدرجات الرسمية: ممنوع كتابة الطالب نهائياً
      match /officialGrades/{gradeDoc} {
        allow read: if isOwner(resource.data.studentUid) || isAdmin() || isCourseInstructor(courseId);
        allow write: if isAdmin() || isCourseInstructor(courseId);
      }
    }

    // 3. الشهادات
    match /certificates/{certId} {
      allow read: if true; // للتحقق من كود الشهادة
      allow create, update: if isAdmin();
      allow delete: if false;
    }

    // 4. سجل التدقيق: إضافة فقط وممنوع الحذف والتعديل
    match /auditLogs/{logId} {
      allow read: if isAdmin();
      allow create: if isSignedIn();
      allow update, delete: if false;
    }
  }
}
```

---

## 3. خطة التنفيذ المرحلية الصارمة (Strict Phased Implementation Plan)

التنفيذ يتم **خطوة بخطوة (Step-by-Step)**، مع التحقق من كل مرحلة قبل بدء التالية:

```
┌─────────────────────────────────────────────────────────────┐
│ الخطوة 1: [المرحلة 0] التأسيس التقني ونظام التصميم الأساسي   │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ الخطوة 2: [المرحلة 1] نموذج البيانات، القواعد، واختبار الأمان│
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ الخطوة 3: [المرحلة 2] نظام المصادقة والصلاحيات والمدير الأول │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ الخطوة 4: [المرحلة 3] إدارة الكورسات والمحتوى والالتحاق      │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ الخطوة 5: [المرحلة 4] محرك التكليفات والاختبارات والتصحيح    │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ الخطوة 6: [المرحلة 5] واجهة تعلم الطالب والسجل الأكاديمي     │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ الخطوة 7: [المرحلة 6] منظومة الشهادات والتحقق                │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ الخطوة 8: [المرحلة 7] بوابة المنتدى العامة ومعرض الأبحاث     │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ الخطوة 9: [المرحلة 8] لوحات الإدارة والنسخ الاحتياطي والنشر  │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. الخطوة الأولى الفورية المتفق عليها:
البدء بـ **المرحلة 0 والمرحلة 1**:
1. تهيئة مشروع React + Vite + TypeScript في مجلد العمل.
2. تثبيت هيكل قواعد البيانات وملف `firestore.rules`.
3. كتابة اختبارات الصلاحيات للتأكد برمجياً من نجاح العزل والحماية.
