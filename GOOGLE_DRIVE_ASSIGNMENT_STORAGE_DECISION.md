# ASIRA — Google Drive Assignment Storage: Architecture Decision Record

**تاريخ التقرير:** 21 أكتوبر 2026  
**الحالة:** ⏳ في انتظار قرار المالك قبل أي تغيير في الكود

---

## 1. الواقع الفعلي للكود الحالي (Code Reality)

### ❌ ما يطلبه المالك vs ما ينفذه الكود

| المعيار | المطلوب من المالك | الواقع الفعلي في الكود |
|---|---|---|
| **مكان رفع الملف** | مجلد مخصص في Google Drive **المالك** | يبقى في Drive **الطالب الشخصي** |
| **آلية التسليم** | رفع فعلي لبايتات الملف | إدخال رابط URL نصي فقط |
| **من يتحكم بالملف** | المالك/المشرف | الطالب (يمكنه حذفه أو تغيير الصلاحيات) |
| **الخصوصية** | ملفات محمية في حساب المالك | رابط عام "Anyone with the link" |

### التحقق المباشر من الكود:

**ملف:** `StudentDashboard.tsx` سطر 383–427

```typescript
const handleAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // يقبل رابط نصي فقط — لا يرفع أي ملف
    if (!isTrustedStorageUrl(assignmentInputLink.trim())) { ... }
    
    const updatedSub = {
        driveFileUrl: assignmentInputLink.trim(),  // رابط فقط، 0 بايت يُرفع
        status: 'submitted',
    };
};
```

**ملف:** `security.ts` سطر 37–46

```typescript
export const isTrustedStorageUrl = (url?: string | null): boolean => {
    // يتحقق فقط أن الرابط https:// ونطاق drive.google.com/docs.google.com
    // لا يتحقق من وجود الملف أو صلاحيات الوصول
};
```

**النتيجة:** صفر بايت يُرفع إلى حساب المالك. الطالب يلصق رابطاً من حسابه الشخصي، وإذا حذف الملف أو غيّر الصلاحيات يضيع التسليم.

---

## 2. مقارنة خيارات الهندسة المعمارية

### الخيار أ: Service Account مجاني

| المعيار | التقييم |
|---|---|
| **التكلفة** | $0 (IAM مجاني) |
| **المشكلة القاتلة** | Service Account على حساب `@gmail.com` الشخصي يملك **0 بايت** تخزين. حتى لو شاركت مجلداً معه، أي ملف يرفعه يحتسب من حصة الـ SA نفسه (0 GB) = خطأ: Storage quota exceeded |
| **الحل** | Google Workspace ($6+/مستخدم/شهر) مع Domain-Wide Delegation |
| **التوصية** | ❌ **مرفوض** — يتطلب دفع اشتراك |

### الخيار ب: Firebase Storage (Spark Plan)

| المعيار | التقييم |
|---|---|
| **التكلفة** | مجاني حتى 5 GB + 1 GB/يوم تحميل |
| **المشكلة** | الملفات تُخزّن في Firebase Storage، **ليس في Google Drive المالك** |
| **الوصول** | يتطلب Firebase Console أو كود مخصص للتنزيل |
| **التوصية** | ⚠️ ممكن لكن لا يلبي الطلب الصريح (Drive المالك) |

### الخيار ج: Cloudflare R2

| المعيار | التقييم |
|---|---|
| **التكلفة** | مجاني حتى 10 GB + 1M class A ops/شهر |
| **المشكلة** | Object storage مثل S3، ليس Google Drive |
| **التوصية** | ⚠️ ممكن لكن لا يلبي طلب المالك |

### ✅ الخيار د (المُوصى): OAuth 2.0 + Cloudflare Pages Functions + Resumable Upload

| المعيار | التقييم |
|---|---|
| **التكلفة** | **$0.00 بالكامل** |
| **المكان** | مجلد مخصص في Google Drive **حساب المالك الشخصي** |
| **الحصة** | 15 GB مجاني (مشترك مع Gmail/Photos) |
| **API Quota** | 1,000,000 وحدة/دقيقة — أكثر من كافٍ |
| **Cloudflare Functions** | 100,000 طلب/يوم مجاناً (10ms CPU لكل طلب) |
| **أمان بيانات الاعتماد** | Client Secret + Refresh Token في Cloudflare Secrets — لا تصل للمتصفح أبداً |
| **التوصية** | ✅ **مُوصى بشدة** |

---

## 3. الهندسة المعمارية المُوصاة بالتفصيل

### مخطط تدفق البيانات

```
+-------------+     1. POST /api/upload-init     +----------------------+
|  متصفح      | -------------------------------->| Cloudflare Pages     |
|  الطالب     |     {filename, mimeType,         | Function             |
|             |      courseId, assignmentId}      | (functions/api/      |
|             |                                  |  upload-init.ts)     |
|             |     2. {uploadUrl}                |                      |
|             | <---------------------------------| يستخدم Refresh Token |
|             |                                  | -> Access Token      |
|             |     3. PUT uploadUrl              | -> Resumable Upload  |
|             | ------------> Google Drive        |   Session URI        |
|             |     (مباشرة لـ Google)            +----------------------+
|             |     4. {fileId}                          |
|             | <----------- Google Drive                |
|             |                                         |
|             |     5. POST /api/confirm-upload           |
|             | -------------------------------->  CF Function
|             |     {fileId, courseId, ...}        يحفظ في Firestore
+-------------+
```

### لماذا Resumable Upload؟

| المشكلة | الحل |
|---|---|
| Cloudflare Workers حدود ذاكرة 128 MB | **لا تمر البايتات عبر Worker أصلاً** |
| CPU time 10ms فقط | Worker يجهز session فقط (~2ms CPU)، الطالب يرفع مباشرة لـ Google |
| ملفات كبيرة (Word, PDF) | Resumable Upload يدعم حتى 5 TB |

### تدفق المصادقة (OAuth 2.0)

```
إعداد لمرة واحدة (يقوم به المالك):
==============================================
1. Google Cloud Console -> Create Project
2. Enable Google Drive API
3. Create OAuth 2.0 Client ID (Web application)
4. Authorized redirect: https://your-domain.pages.dev/api/oauth-callback
5. المالك يفتح رابط المصادقة -> يمنح scope: drive.file
6. يستلم Authorization Code -> يُبدّل إلى Refresh Token
7. يُحفظ Refresh Token في Cloudflare Dashboard > Settings > Environment Variables (encrypted)
```

### الأسرار المطلوبة في Cloudflare:

| اسم المتغير | الوصف | مكان التخزين |
|---|---|---|
| `GOOGLE_CLIENT_ID` | OAuth Client ID | Cloudflare Env Var |
| `GOOGLE_CLIENT_SECRET` | OAuth Client Secret | Cloudflare Secret (encrypted) |
| `GOOGLE_REFRESH_TOKEN` | Refresh Token للمالك | Cloudflare Secret (encrypted) |
| `OWNER_DRIVE_FOLDER_ID` | ID مجلد التسليمات | Cloudflare Env Var |

> **تحذير أمني:** ممنوع مطلقاً وضع أي من هذه القيم في متغيرات `VITE_*` أو أي كود يصل للمتصفح. هذا يسرّب بيانات اعتماد المالك لكل زائر.

---

## 4. تحليل الأمان والخصوصية والحصص

### أمان Scope `drive.file`

- هذا الـ scope **الأضيق والأكثر أماناً**:
  - يسمح فقط بإنشاء ملفات جديدة وقراءة الملفات التي أنشأها التطبيق نفسه
  - **لا يستطيع** قراءة أو حذف أو تعديل أي ملف آخر في Drive المالك
  - حتى لو تسرّب الـ Refresh Token، الضرر محدود بالملفات التي أنشأها التطبيق فقط

### خصوصية ملفات الطلاب

| الجانب | الوضع |
|---|---|
| **من يملك الملف** | حساب المالك (الملف في Drive المالك) |
| **من يستطيع الوصول** | المالك فقط افتراضياً |
| **وصول المدرس** | عبر endpoint مؤمّن `/api/view-submission?id=...` يولّد رابط مؤقت |
| **وصول الطالب لملفه** | لا يستطيع تعديله أو حذفه بعد الرفع (ميزة أمنية) |

### حدود الحصة المجانية

| المورد | الحد المجاني | كفاية لـ ASIRA |
|---|---|---|
| Google Drive Storage | 15 GB (مشترك) | ✅ ~150 ملف Word بحجم 100 KB = ~15 MB |
| Drive API | 1M وحدة/دقيقة | ✅ لن يصل حتى لـ 100 طلب/يوم |
| Cloudflare Functions | 100,000 طلب/يوم | ✅ أكثر من كافٍ |
| Cloudflare CPU | 10ms/طلب | ✅ Token exchange = ~2ms CPU |
| Daily Upload | 750 GB/يوم | ✅ مستحيل الوصول |

---

## 5. خطة التنفيذ التفصيلية (بعد موافقة المالك)

### المرحلة 1: إعداد Google Cloud (يقوم بها المالك)

1. إنشاء مشروع في Google Cloud Console
2. تفعيل Google Drive API
3. إنشاء OAuth 2.0 Client ID (نوع: Web application)
4. إضافة Authorized Redirect URI
5. تنفيذ OAuth flow لمرة واحدة والحصول على Refresh Token

### المرحلة 2: Cloudflare Pages Functions

إنشاء الملفات التالية في المشروع:

```
e:/ASIRA/
  functions/
    api/
      upload-init.ts        <- يبدأ Resumable Upload session
      confirm-upload.ts     <- يسجل الملف في Firestore
      view-submission.ts    <- رابط مؤقت للمدرس
      oauth-callback.ts     <- (إعداد لمرة واحدة)
```

### المرحلة 3: تحديث الواجهة الأمامية

- **استبدال** حقل إدخال الرابط بـ File Dropzone في `StudentDashboard.tsx`
- إضافة شريط تقدم الرفع (Progress Bar)
- عند النجاح: حفظ `fileId` في Firestore بدلاً من `driveFileUrl`

### المرحلة 4: تحديث لوحة المدرس

- **استبدال** فتح رابط Drive مباشر بطلب `/api/view-submission?id=...`
- عرض الملف في إطار مضمّن (iframe) أو تنزيل مؤقت

---

## 6. تدقيق البيانات المضمّنة في الكود (Mock Data Audit)

### أ. بيانات العرض التسويقي (مقبولة كما هي)

| الثابت | الملف | الوصف | التقييم |
|---|---|---|---|
| `INITIAL_STATS` | `mockData.ts:3` | أرقام إنجازات (48 بحث، 1250 طالب...) | ✅ بيانات تسويقية تمثل تاريخ المبادرة |
| `INITIAL_TESTIMONIALS` | `mockData.ts:187` | شهادات طلاب | ✅ محتوى عرض ثابت |

### ب. بيانات كورسات وأبحاث (مقبولة كـ fallback، تحتاج ترحيل لاحقاً)

| الثابت | الاستخدام | التقييم |
|---|---|---|
| `INITIAL_COURSES` (3 كورسات) | Default في StudentDashboard، InstructorDashboard، App.tsx | ⚠️ بيانات حقيقية لكن يجب ترحيلها لـ Firestore |
| `INITIAL_RESEARCHES` (3 أبحاث) | عرض في HomePage، ResearchPage | ⚠️ كذلك |
| `INITIAL_CURRICULA` | هيكل المنهج الدراسي | ⚠️ كذلك |

### ج. بيانات طلاب وهمية (يجب إفراغها من الكود)

| الثابت | السطر | المحتوى | التقييم |
|---|---|---|---|
| `INITIAL_STUDENT_SUBMISSIONS` | `240` | 4 تسليمات وهمية لطلاب غير حقيقيين | لا تُستخدم حالياً في أي import |
| `INITIAL_EXAM_ATTEMPTS` | `323` | محاولتا اختبار وهميتان | لا تُستخدم حالياً |
| `INITIAL_PENDING_ENROLLMENTS` | `811` | 3 طلبات التحاق وهمية | لا تُستخدم حالياً |
| `INITIAL_CERT_REQUESTS` | `870` | طلبا شهادة وهميان | لا تُستخدم حالياً |
| `INITIAL_AUDIT_LOGS` | `913` | 4 سجلات تدقيق وهمية | لا تُستخدم حالياً |

> **ملاحظة:** التنظيف السابق أزال استيراد هذه الثوابت من الداشبوردات بنجاح، لكن البيانات نفسها لا تزال معرّفة في `mockData.ts`. يمكن حذفها أو الإبقاء عليها كمرجع للأنواع (interfaces).

### د. التحقق من أمان الصلاحيات عند فشل Firestore

**ملف:** `AuthModal.tsx` سطر 84–97

```typescript
let role: UserRole = 'student';  // fallback افتراضي
try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
        role = (data.role as UserRole) || 'student';
    }
} catch {
    console.info('[Auth] Could not fetch user document, defaulting to student role.');
}
```

**الحكم: آمن.** إذا فشلت قراءة Firestore، الدور يبقى `student`. قواعد Firestore تمنع أي وصول أدمن أو مدرس بدون Custom Claims أو وثيقة `role == 'admin'` مع `email_verified == true`. لا يمكن تصعيد صلاحيات عبر تزوير الدور في الواجهة لأن الحماية الفعلية في قواعد Firestore الخلفية.

---

## 7. قرارات مطلوبة من المالك

**لن يتم تعديل أي كود حتى تتم الموافقة على النقاط التالية:**

### القرار 1: هندسة رفع الملفات

- [ ] **الخيار د (مُوصى):** OAuth 2.0 + Cloudflare Pages Functions + Google Drive Resumable Upload ($0)
- [ ] **الخيار ب:** Firebase Storage (Spark plan) — مجاني لكن ليس في Drive المالك
- [ ] **خيار آخر:** (يرجى التوضيح)

### القرار 2: تنظيف البيانات الوهمية المتبقية

- [ ] **حذف** الثوابت الخمس غير المستخدمة من `mockData.ts` (الأنواع/interfaces تبقى)
- [ ] **الإبقاء** عليها كمرجع حتى اكتمال ترحيل Firestore

### القرار 3: ترحيل محتوى الكورسات

- [ ] **ترحيل** INITIAL_COURSES و INITIAL_RESEARCHES و INITIAL_CURRICULA إلى مستندات Firestore مع إبقاء الكود الحالي كـ fallback
- [ ] **الإبقاء** على البيانات المضمّنة في الكود كوضع مبدئي حتى إشعار آخر

### القرار 4: هل المالك مستعد لإعداد Google Cloud Console؟

- [ ] **نعم** — سأقوم بإنشاء المشروع وتفعيل Drive API وتشغيل OAuth flow
- [ ] **لا حالياً** — نؤجل رفع الملفات لمرحلة لاحقة
- [ ] **أحتاج مساعدة** — أريد شرحاً مصوراً خطوة بخطوة

---

## 8. ملخص تنفيذي

| البند | الحالة |
|---|---|
| التحقق من كود التسليم الحالي | ✅ مكتمل — 0 بايت يُرفع للمالك |
| تحليل خيارات الهندسة | ✅ مكتمل — 4 خيارات مقارنة |
| التوصية المعمارية | ✅ OAuth + CF Functions + Resumable Upload |
| التكلفة الشهرية | **$0.00** |
| أمان الصلاحيات (AuthModal + Firestore) | ✅ آمن — لا يمكن تصعيد |
| بيانات وهمية غير مستخدمة في mockData.ts | 5 مصفوفات لا تزال معرّفة (غير مستوردة) |
| الخطوة التالية | ⏳ **انتظار قرار المالك** |
