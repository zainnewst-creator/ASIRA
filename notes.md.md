المهمة: تنفيذ نظام Proactive AI + Daily/Weekly Notifications بالكامل في تطبيق كرشتي

أنت تعمل على مشروع Flutter قائم بالفعل باسم كرشتي (Krashati).

المطلوب هو تطوير وتحسين النظام الحالي ودمج المعمارية الجديدة داخل المشروع الموجود، وليس إعادة بناء التطبيق أو إنشاء مشروع جديد.

⚠️ قواعد أساسية قبل البدء

1. لا تعيد بناء التطبيق من الصفر.
2. لا تحذف Features موجودة وتعيد كتابتها بدون ضرورة.
3. لا تغيّر الـUI الحالي إلا إذا كان ذلك ضروريًا لربط Notification → Coach Chat.
4. حافظ على Architecture الحالية قدر الإمكان.
5. افحص الكود الموجود أولًا قبل أي تعديل.
6. أعد استخدام Services / Repositories / Models / Providers الموجودة.
7. لا تنشئ نظامًا موازيًا يؤدي نفس وظيفة نظام موجود.
8. إذا وجدت Stub موجودًا، قم بإكماله وربطه بدل إنشاء Class جديد يؤدي نفس الوظيفة.
9. لا تكسر Gemini integration الحالية.
10. لا تغيّر API/model configuration الحالية بدون سبب تقني واضح.
11. لا تضع API keys أو Firebase secrets داخل التطبيق.
12. لا تستخدم Gemini مباشرة من Flutter في background إذا كان المطلوب AI Proactive حقيقي أثناء إغلاق التطبيق.
13. نفذ العمل على مراحل، وبعد كل مرحلة تحقق من compilation/errors/tests.
14. إذا كان هناك تعارض بين هذا الطلب والكود الحالي، اختر الحل الأقل تدميرًا والأكثر توافقًا مع architecture الموجودة.
15. لا تكتفِ بإنشاء ملفات أو classes غير مستخدمة؛ كل جزء يجب أن يكون مربوطًا فعليًا بالـexecution flow.

---

1. ابدأ بـ Full Architecture Audit

قبل تعديل أي كود:

افحص المشروع كاملًا، وخاصة:

- pubspec.yaml
- NotificationService
- ai_event_engine.dart
- EventDecisionActionEngine
- AI services
- Gemini integration
- Firebase integration
- Firestore repositories
- user/profile models
- nutrition/meal tracking
- water tracking
- weight tracking
- daily progress
- weekly review
- review_service.dart
- weekly_review_screen.dart
- Coach Chat
- navigation/router
- deep-linking إن وجد
- settings
- notification-related code
- background-related code
- existing Firebase Cloud Functions إن وجدت

حدد ما هو موجود بالفعل وما يجب إضافته.

لا تبدأ بإعادة الهيكلة.

---

2. الهدف النهائي

أريد أن يتحول كرشتي من:

Interactive AI Coach

إلى:

Proactive AI Nutrition Coach

بحيث يستطيع النظام:

- متابعة حالة المستخدم.
- اكتشاف أحداث أو أنماط تستحق التدخل.
- تحديد متى يحتاج المستخدم إلى Intervention.
- إنشاء رسالة مناسبة.
- إرسال Notification للمستخدم.
- العمل حتى عندما يكون التطبيق مغلقًا.
- عند الضغط على Notification يتم فتح Coach Chat مباشرة.
- تظهر الرسالة الاستباقية داخل المحادثة مع الحفاظ على Context المستخدم.

---

3. افصل بين أربعة أنواع من Notifications / Interventions

لا تخلط بينها.

A. Scheduled Daily Reminder

تذكير ثابت زمنيًا.

أمثلة:

- تسجيل وجبة.
- شرب الماء.
- تسجيل الوزن.
- مراجعة اليوم.

هذه لا تحتاج Gemini.

يجب أن تعمل باستخدام:

Flutter Local Notifications + OS scheduling.

---

B. Scheduled Weekly Review Reminder

تذكير أسبوعي ثابت.

مثال:

كل جمعة الساعة 8:00 مساءً:

"وقت مراجعة أسبوعك مع كرشتي."

هذا أيضًا لا يحتاج Gemini لإرسال التذكير نفسه.

عند فتح المستخدم التطبيق يمكن تشغيل Weekly Review وتحليل البيانات باستخدام Gemini.

---

C. Event-Based Intervention

تدخل يعتمد على حدث محدد.

أمثلة:

- المستخدم حقق هدف الماء.
- المستخدم سجل وجبة.
- المستخدم تأخر عن تسجيل وجبة.
- حدث Safety Concern.
- حدث متعلق بالسعرات.

يجب إعادة استخدام المنطق الموجود حاليًا في:

EventDecisionActionEngine

وعدم إنشاء Engine آخر يؤدي نفس الوظيفة.

---

D. AI-Generated Proactive Nudge

هذا هو الجزء الأهم.

مثال:

النظام يلاحظ:

- انخفاض البروتين لعدة أيام.
- انخفاض الالتزام.
- تغيرًا في نمط الأكل.
- تكرار تخطي الوجبات.
- تغيرًا في الوزن.
- نقصًا مستمرًا في الماء.

فيقرر النظام أن هناك حاجة لتدخل.

ثم:

Rules / Proactive Engine
↓
Context Builder
↓
Gemini
↓
Personalized Intervention
↓
Firestore
↓
FCM
↓
User Notification
↓
Coach Chat

---

4. Client-side Notifications

أضف أو أكمل:

flutter_local_notifications

إذا لم تكن موجودة.

قم بإعدادها بشكل Production-ready.

المطلوب:

- Android
- iOS إذا كان المشروع يدعم iOS
- Notification channels
- Notification importance
- Notification permissions
- scheduled notifications
- cancellation
- rescheduling
- timezone-aware scheduling
- notification click handling
- notification IDs
- duplicate prevention

لا تستخدم DateTime.now() وحده للجدولة الدقيقة إذا كانت المكتبة تحتاج timezone configuration.

أضف timezone package/configuration المناسبة.

---

5. Android Permissions

تأكد من التعامل مع:

Android 13+:

POST_NOTIFICATIONS

والصلاحيات/الإعدادات الضرورية للـscheduled notifications.

لا تفترض أن permission موجود تلقائيًا.

يجب أن يكون هناك flow واضح:

Notification permission
↓
User grants permission
↓
Schedule notifications

وإذا رفض المستخدم:

لا يحدث crash.

---

6. Device Reboot

يجب ألا تختفي التذكيرات بعد إعادة تشغيل الجهاز.

قم بتطبيق الطريقة المناسبة للمكتبة المستخدمة لإعادة جدولة notifications بعد:

BOOT_COMPLETED

ولا تضف implementation مخصصًا إذا كانت المكتبة المستخدمة توفر آلية موثوقة لذلك.

اختبر:

Install
→ Schedule
→ Reboot
→ Notification still scheduled.

---

7. Daily Reminder Scheduler

أنشئ أو أكمل خدمة واضحة مثل:

NotificationScheduler / ReminderScheduler

لكن قبل إنشاء Class جديد، تحقق من وجود NotificationService الحالي.

إذا كان مناسبًا، قم بتطويره بدل إنشاء نظام ثانٍ.

يجب أن تدعم الخدمة:

scheduleDailyReminder()
scheduleWeeklyReminder()
cancelReminder()
cancelAllReminders()
rescheduleAll()

ويجب أن تكون الـIDs deterministic.

مثال:

DAILY_BREAKFAST_REMINDER
DAILY_LUNCH_REMINDER
DAILY_WATER_REMINDER
DAILY_WEIGHT_REMINDER
WEEKLY_REVIEW_REMINDER

لا تستخدم IDs عشوائية.

---

8. Notification Settings

الإعدادات الحالية تحتوي على ساعات هدوء، لكن حسب الـAudit فهي غير فعالة.

حوّلها إلى إعدادات حقيقية.

يجب أن يستطيع المستخدم:

- Enable/Disable Daily Reminders
- Enable/Disable Weekly Review
- تحديد Quiet Hours
- اختيار وقت التذكيرات إن كان التصميم الحالي يسمح بذلك

والـScheduler يجب أن يحترم هذه الإعدادات.

مثال:

Quiet Hours:
23:00 → 07:00

لا ترسل notifications داخل هذه الفترة.

---

9. Weekly Review

احتفظ بـ:

weekly_review_screen.dart

و:

review_service.dart

ولا تعيد كتابتهما.

اربط النظام بحيث:

Weekly scheduled reminder
↓
User taps
↓
Open Weekly Review
↓
Load weekly data
↓
Generate analysis with Gemini
↓
Display report

وإذا كان Weekly Review يُولد حاليًا عند الدخول فقط، حافظ على هذا السلوك لكن اجعل Notification هو trigger للوصول إليه.

---

10. Proactive AI Backend

هذا الجزء يجب أن يكون Server-side.

استخدم Firebase Cloud Functions / Firebase scheduled functions الموجودة أو أنشئها إذا لم تكن موجودة.

لا تنشئ Backend منفصلًا إذا Firebase موجود بالفعل.

المعمارية:

Firebase Scheduler
↓
Scheduled Cloud Function
↓
Find eligible users
↓
Load relevant user data
↓
Evaluate proactive rules
↓
Build minimal AI context
↓
Gemini
↓
Validate response
↓
Store intervention
↓
FCM Push

---

11. لا تستدع Gemini بلا داعٍ

هذه نقطة مهمة جدًا.

لا تجعل Gemini يعمل لكل مستخدم بشكل عشوائي.

استخدم:

Rule Engine / Eligibility Filter

أولًا.

مثال:

if no intervention needed:
do nothing

if user already received similar intervention recently:
do nothing

if quiet hours:
defer

if intervention threshold reached:
call Gemini

بهذا نقلل:

- تكلفة Gemini
- latency
- spam
- unnecessary API calls

---

12. Proactive Rules

أعد استخدام القواعد الموجودة حاليًا، خصوصًا:

- waterBehind
- goalAchieved
- safetyConcern

ولا تحذفها.

لكن اجعلها جزءًا من Proactive Engine واضح.

صمم النظام بحيث يمكن إضافة Rules مستقبلًا بدون تعديل Core architecture.

مثال conceptual:

ProactiveRule
├── WaterBehindRule
├── MissedMealRule
├── LowProteinPatternRule
├── WeightTrendRule
├── GoalProgressRule
└── SafetyConcernRule

لا تضف كل هذه القواعد إذا لم تكن بياناتها متوفرة.

استخدم فقط البيانات الموجودة فعليًا.

---

13. Intervention Model

أنشئ Model موحد إذا لم يوجد Model مناسب حاليًا.

مثال conceptual:

ProactiveIntervention

Fields:

- id
- userId
- type
- trigger
- title
- message
- createdAt
- scheduledAt
- sentAt
- openedAt
- status
- priority
- deepLink
- metadata

Status examples:

pending
sent
opened
dismissed
expired

لا تنشئ Model جديدًا إذا كان هناك Model حالي يمكن توسيعه.

---

14. Duplicate Prevention

هذا مهم جدًا.

لا أريد أن يحصل المستخدم على:

"اشرب ماء"

5 مرات في نفس اليوم.

يجب أن يكون هناك:

cooldown

و:

deduplication

مثال:

same intervention type
+
same user
+
recent time window

→ لا ترسل مرة أخرى.

اجعل القواعد قابلة للتعديل.

---

15. Quiet Hours

يجب ألا يرسل Proactive AI notification أثناء Quiet Hours.

إذا قرر الـAI أن هناك Intervention مهمة أثناء Quiet Hours:

لا ترسلها مباشرة.

قم بتخزينها:

pending

ثم أعد تقييمها بعد انتهاء Quiet Hours.

أما الحالات التي تعتبر safety-critical، فيجب أن يكون لها behavior منفصل وواضح بدل معاملتها كتذكير عادي.

---

16. FCM

استخدم Firebase Cloud Messaging للإشعارات القادمة من الـBackend.

يجب أن يكون لكل مستخدم:

FCM token

مع معالجة:

- token refresh
- invalid token
- multiple devices إذا كان النظام يدعم ذلك
- logout
- reinstall

لا تخزن FCM tokens بطريقة غير آمنة أو مرتبطة بمستخدم آخر.

---

17. Notification Payload

اجعل الـFCM payload يحتوي على معلومات كافية لفتح المكان الصحيح.

مثال conceptual:

type:
"proactive_intervention"

interventionId:
"..."

route:
"/coach"

لا ترسل بيانات حساسة غير ضرورية داخل notification payload.

---

18. Deep Linking

عند الضغط على Notification:

Proactive Notification
↓
App launches
↓
Router
↓
Coach Chat
↓
Load intervention
↓
Display proactive message

يجب أن يعمل إذا:

- التطبيق مفتوح.
- التطبيق في الخلفية.
- التطبيق مغلق بالكامل.

ويجب ألا يؤدي الضغط على notification إلى شاشة فارغة أو Chat بدون Context.

---

19. Conversation Integration

لا تجعل الرسالة الاستباقية مجرد Notification فقط.

عند إرسال intervention:

احفظها في Conversation/Coach context المناسب.

مثال:

Coach:
"لاحظت أنك شربت ماء أقل من هدفك اليوم. حاول الآن إضافة كوب ماء."

وعند فتح Chat:

يجب أن يرى المستخدم أن Coach بدأ المحادثة.

لا تجعل المستخدم يرسل:

"مرحبا"

أولًا.

---

20. Gemini Prompt Architecture

لا ترسل كل بيانات المستخدم إلى Gemini.

أنشئ Context Builder / Sanitizer.

أرسل فقط المعلومات اللازمة لاتخاذ القرار أو كتابة النصيحة.

مثال:

Relevant nutrition data
+
recent meals
+
water progress
+
weight trend
+
goal
+
recent interventions

ولا ترسل:

- unnecessary personal identifiers
- unrelated private information
- secrets
- FCM tokens
- internal database identifiers

---

21. Gemini Output

لا تسمح لـGemini بإرجاع نص عشوائي يصعب على النظام التعامل معه.

اجعل الـCloud Function يطلب Structured JSON.

مثال conceptual:

{
"should_intervene": true,
"title": "...",
"message": "...",
"priority": "normal",
"intervention_type": "water",
"suggested_route": "/coach"
}

ثم:

Validate JSON
↓
Validate allowed enum values
↓
Validate message length
↓
Store
↓
Send FCM

إذا فشل Gemini:

لا ترسل notification فاسدة.

---

22. Safety Guardrails

هذا تطبيق Nutrition.

لا تجعل Gemini يرسل تشخيصات أو توصيات طبية خطرة.

خصوصًا في الحالات المتعلقة بالسعرات المنخفضة أو أعراض صحية.

القواعد الحالية مثل:

safetyConcern

يجب أن تمر عبر Safety layer.

لا تسمح للـAI بتجاوز safety constraints.

أي رسالة safety-sensitive يجب أن تستخدم صياغة مناسبة وتوجه المستخدم للرعاية الصحية عند الحاجة بدل تقديم تشخيص.

---

23. AI Initiative Levels

إذا كان النظام الحالي يحتوي على مفهوم:

AI Initiative Level

فلا تحذفه.

اربطه بالـProactive Engine.

مثال conceptual:

LOW
→ تدخلات قليلة

NORMAL
→ التدخل الطبيعي

HIGH
→ تدخلات أكثر عند وجود pattern واضح

CRITICAL
→ safety-related behavior

لكن لا تجعل المستوى العالي يعني spam.

يجب أن تظل هناك:

cooldown
+
deduplication
+
quiet hours
+
eligibility rules

---

24. Scheduling Strategy

لا تستخدم Flutter background execution لتشغيل Gemini بشكل دوري إذا كان يمكن تنفيذ المهمة على Firebase.

استخدم:

LOCAL:

Fixed reminders
→ flutter_local_notifications

CLOUD:

AI proactive evaluation
→ Firebase Scheduled Functions

DELIVERY:

Cloud
→ FCM

NAVIGATION:

FCM tap
→ Deep Link
→ Coach Chat

---

25. Offline Behavior

لا تكسر الـoffline functionality الحالية.

عندما لا يوجد Internet:

- Local reminders يجب أن تستمر.
- التطبيق لا يتعطل.
- Gemini calls تفشل gracefully.
- Cloud proactive intervention تنتظر اتصال المستخدم.
- لا تظهر أخطاء تقنية للمستخدم.

---

26. Firebase Security

راجع Firestore Security Rules المرتبطة بالنظام.

تأكد أن:

User A
لا يستطيع قراءة:

User B

interventions
nutrition data
conversation data
tokens

ولا تجعل Cloud Functions تعتمد على client-provided authorization للعمليات الحساسة.

---

27. Performance

الهدف:

لا تؤثر هذه المعمارية على سرعة Chat الحالية.

خصوصًا:

- لا تجعل التطبيق ينتظر Firebase عند فتح Dashboard.
- لا تشغل heavy background work على الهاتف.
- لا تستدعي Gemini بدون حاجة.
- استخدم batch queries حيث يكون مناسبًا.
- لا تقرأ كامل Firestore لكل مستخدم إذا كانت البيانات المطلوبة يمكن تحديدها.
- استخدم indexes المناسبة عند الحاجة.

---

28. Cost Control

صمم النظام بحيث يكون قابلًا للتوسع.

لا تجعل Scheduled Function تستدعي Gemini لكل مستخدم في كل execution.

استخدم:

eligibility rules
+
cooldowns
+
minimum thresholds
+
recent intervention checks

قبل Gemini.

---

29. Observability

أضف logging واضحًا للـbackend، بدون تسجيل بيانات شخصية حساسة.

أريد أن أستطيع معرفة:

- scheduler executed
- users evaluated
- users eligible
- Gemini calls
- Gemini failures
- interventions created
- FCM sent
- FCM failures

لكن لا تطبع:

API keys
FCM tokens
private user data
full conversations

---

30. Testing

أنشئ اختبارات مناسبة.

Notification tests

اختبر:

- daily scheduling
- weekly scheduling
- cancellation
- rescheduling
- quiet hours
- permissions
- reboot behavior

Proactive Engine tests

اختبر:

- waterBehind
- goalAchieved
- safetyConcern
- no intervention
- cooldown
- duplicate prevention

Backend tests

اختبر:

- eligible user
- ineligible user
- Gemini failure
- invalid Gemini JSON
- FCM failure
- duplicate prevention

Navigation tests

اختبر:

Notification tap
→ Coach Chat

في:

foreground
background
terminated

---

31. Do not fake functionality

ممنوع اعتبار أي Feature مكتملة إذا كانت فقط:

debugPrint()

أو:

TODO

أو:

stub

أو:

mock notification

أو:

fake scheduler

يجب أن تكون functionality مربوطة فعليًا بالـOS/Firebase.

---

32. Migration Strategy

نفذ التغيير تدريجيًا:

PHASE 1
Audit + dependency setup

PHASE 2
Local notification infrastructure

PHASE 3
Daily/Weekly scheduler

PHASE 4
Notification settings + permissions

PHASE 5
FCM infrastructure

PHASE 6
Proactive intervention backend

PHASE 7
Gemini structured generation

PHASE 8
Firestore intervention storage

PHASE 9
Deep linking + Coach Chat integration

PHASE 10
Testing + reliability + security audit

---

33. Important: Preserve Existing Architecture

إذا كان المشروع يحتوي بالفعل على:

NotificationService

فطوره.

إذا كان يحتوي على:

EventDecisionActionEngine

اربطه.

إذا كان يحتوي على:

review_service.dart

احتفظ به.

إذا كان يحتوي على:

Coach Chat

اربطه.

إذا كان يحتوي على:

Firebase repositories

أعد استخدامها.

إذا كان هناك existing AI Core abstraction:

لا تجعل Firebase Functions تعتمد على تفاصيل Flutter implementation.

افصل:

AI Core
Decision Engine
Notification Delivery
Conversation

بحيث يمكن تطوير كل جزء مستقبلًا.

---

34. Final Acceptance Criteria

اعتبر المهمة ناجحة فقط إذا أصبحت السيناريوهات التالية ممكنة فعليًا:

Scenario 1 — Daily Reminder

User schedules lunch reminder.

App closes.

At scheduled time:

📱 OS Notification appears.

User taps.

App opens.

Correct destination opens.

---

Scenario 2 — Weekly Review

Friday 8 PM.

App is closed.

📱 Weekly Review notification appears.

User taps.

Weekly Review opens.

Current week's data is loaded.

Gemini generates the review.

---

Scenario 3 — Proactive AI

User has:

low water intake
+
time threshold reached.

Scheduled Cloud Function runs.

Rules detect eligibility.

Gemini generates personalized intervention.

Intervention stored in Firestore.

FCM sent.

App is completely closed.

📱 User receives notification.

User taps notification.

Coach Chat opens.

Coach message is already present.

---

Scenario 4 — Duplicate Prevention

Same condition remains true.

Next scheduler execution occurs.

System detects recent intervention.

No duplicate notification is sent.

---

Scenario 5 — Quiet Hours

Condition occurs at 2 AM.

System detects Quiet Hours.

No normal notification is sent.

Intervention is deferred/re-evaluated later.

---

Scenario 6 — Reboot

Notifications are scheduled.

Device restarts.

Scheduled notifications remain functional.

---

35. Final Report

بعد التنفيذ، لا تقل فقط:

"تم التنفيذ."

أعطني تقريرًا منظمًا يحتوي على:

Changed Files

كل ملف تم تعديله أو إنشاؤه.

Dependencies Added

كل package جديدة ولماذا.

Firebase Changes

Cloud Functions
Firestore
FCM
Security Rules
Indexes

Architecture

ارسم flow النهائي.

User Flow

وضح ماذا يحدث من لحظة اكتشاف المشكلة حتى ظهورها للمستخدم.

Testing

اذكر الاختبارات التي تم تشغيلها ونتائجها.

Known Limitations

أي limitation حقيقية يجب ذكرها بوضوح.

Production Readiness

وضح ما إذا كان النظام:

- Development-ready
- Test-ready
- Production-ready

ولا تدّعِ Production-ready إذا كانت هناك أجزاء غير مختبرة.

---

أهم شرط في المهمة

لا أريد مجرد إضافة packages وكتابة classes.

أريد End-to-End Working Proactive System.

يجب أن يكون الـflow الحقيقي:

User Data
→ Decision
→ AI
→ Intervention
→ Firestore
→ FCM / Local Notification
→ Notification Tap
→ Deep Link
→ Coach Chat
→ Conversation Context

مع الحفاظ على التطبيق الحالي وعدم إعادة بنائه.

ابدأ أولًا بالـAudit، ثم نفذ الخطة تدريجيًا، وبعد كل مرحلة أصلح أي compilation/runtime/test errors قبل الانتقال للمرحلة التالية.


then phase 2 

أنت تعمل داخل مشروع Flutter قائم اسمه كرشتي.

مهم جدًا: لا تعِد بناء التطبيق، ولا تستبدل المعمارية الحالية، ولا تحذف أو تعيد كتابة الكود الموجود بدون ضرورة.

هدفك هو فحص المشروع الحالي أولًا، فهم المعمارية والخدمات وقاعدة البيانات ونظام الإشعارات والـAI الموجود حاليًا، ثم دمج وتحسين نظام Proactive AI فوق الموجود بأقل تغييرات ممكنة.

---

1. ابدأ بالفحص وليس بالتنفيذ

قبل تعديل أي ملف:

1. افحص هيكل المشروع كاملًا.
2. حدد:
   - Database / Models
   - User profile
   - Goals
   - Weight / Measurements
   - Food logging
   - Activity tracking
   - Notifications
   - Gemini / AI service
   - Chat / Conversation system
   - Providers / Controllers
   - Background services
   - Existing reminder system
3. ابحث عن أي كود موجود بالفعل للتذكيرات اليومية والأسبوعية.
4. ابحث عن أي Proactive AI أو Coach logic موجود حاليًا.
5. حدد ما هو مكتمل، وما هو Stub، وما هو ناقص.
6. لا تنشئ نظامًا موازيًا إذا كان هناك نظام قائم يمكن توسيعه.

بعد الفحص، نفذ الحل على المشروع الحالي.

---

2. الهدف الأساسي

أريد أن يصبح كرشتي AI Nutrition Coach حقيقيًا استباقيًا.

أي أن الـCoach لا ينتظر دائمًا أن يفتح المستخدم المحادثة ويسأله.

بل يستطيع:

- تذكير المستخدم.
- اكتشاف أحداث مهمة.
- فهم البيانات الجديدة.
- تحليل التغيرات.
- تحديد ما إذا كان التدخل مناسبًا.
- إرسال رسالة استباقية للمستخدم.
- فتح المحادثة عند تفاعل المستخدم مع الرسالة.
- الاحتفاظ بالسياق ومتابعة الحالة.

لكن بدون تحويل التطبيق إلى نظام مزعج بكثرة الإشعارات.

---

3. افصل بين Local Reminders وProactive AI

لا تخلط بين الاثنين.

A. Local Reminder System

التذكيرات الروتينية مثل:

- تذكير القياسات الأسبوعية.
- تذكير شرب الماء إذا كان موجودًا.
- تذكيرات الوجبات أو النشاط إذا كانت موجودة.
- التذكيرات اليومية/الأسبوعية الحالية.

هذه يجب أن تعتمد على النظام المحلي الموجود في التطبيق، ويمكن استخدام "flutter_local_notifications" إذا كان مناسبًا للبنية الحالية.

المهم:

لا تجعل Gemini مسؤولًا عن تشغيل كل Reminder.

التذكير الروتيني لا يحتاج AI.

مثال:

«"حان وقت تسجيل قياساتك الأسبوعية 📏"»

يمكن أن يعمل حتى عندما يكون التطبيق مغلقًا.

---

4. Weekly Measurements Flow — مهم جدًا

هذا جزء أساسي من النظام.

عند وصول وقت القياسات الأسبوعية:

Weekly Scheduler
      ↓
Local Notification
      ↓
User opens app
      ↓
User enters measurements
      ↓
Measurements saved to database

لكن العملية لا تنتهي عند حفظ القياسات.

يجب اعتبار إضافة القياسات حدثًا مهمًا:

MeasurementsAdded

أو Event equivalent مناسب للمعمارية الحالية.

---

5. عندما تتم إضافة القياسات، يجب أن يعرف الـAI بذلك

عند حفظ قياسات جديدة بنجاح:

Measurements Added
        ↓
Create / Emit Event
        ↓
Proactive AI Engine

الـProactive AI Engine يجب أن يحصل على:

Current measurements

- Current weight
- Waist
- Chest
- Hip
- Other measurements الموجودة في التطبيق

Previous measurements

- القياسات السابقة
- تاريخ القياسات
- مقدار التغير
- اتجاه التغير

User goals

- Weight goal
- Fat-loss goal
- Muscle goal
- Target measurements
- أي أهداف أخرى موجودة

Recent context

حسب ما هو متوفر في المشروع:

- Food logs
- Activity
- Exercise
- Habits
- Sleep
- Adherence
- Recent conversations
- Previous Coach recommendations

ولا ترسل بيانات لا يحتاجها التحليل.

---

6. AI Weekly Measurement Analysis

بعد وصول Event:

"MeasurementsAdded"

يجب أن يستطيع الـAI تحليل المستجدات.

مثال:

Previous:
Weight = 83.1 kg
Waist = 92 cm

Current:
Weight = 82.4 kg
Waist = 91 cm

الـAI يفهم:

- الوزن تغير -0.7 kg
- الخصر تغير -1 cm
- الاتجاه الحالي
- هل التغير متوافق مع الهدف
- هل يوجد شيء يستحق النقاش
- هل يحتاج المستخدم إلى تعديل أو متابعة

لا تجعل الـAI يرسل رسالة عشوائية كل أسبوع.

يجب أن يكون هناك Intervention Decision.

---

7. AI Initiative Level

استخدم مفهوم:

LOW
NORMAL
HIGH
CRITICAL

بحسب النظام الموجود أو أضفه بطريقة متوافقة مع المعمارية.

مثال:

LOW

لا يوجد شيء مهم.

لا ترسل رسالة AI إضافية.

NORMAL

يوجد تحديث مفيد يستحق المتابعة.

يمكن إرسال رسالة قصيرة.

HIGH

يوجد تغير واضح أو مشكلة تستحق النقاش.

أرسل رسالة استباقية أكثر وضوحًا.

CRITICAL

حالة تستدعي تنبيهًا مهمًا أو تدخلًا مناسبًا ضمن حدود التطبيق.

لا تجعل الـAI يستخدم لغة تشخيصية أو طبية غير مبررة.

---

8. إرسال رسالة بعد القياسات

إذا قرر الـProactive AI أن التدخل مناسب، يجب أن يتم إنشاء Coach Message تلقائيًا.

مثال:

«"بطل، شفت قياساتك الأسبوعية 👀
وزنك نزل 0.7 كجم ومحيط خصرك نزل 1 سم مقارنة بالأسبوع الماضي.
خلينا نراجع أسبوعك ونشوف إيش اللي ساعدك تحقق هذا التقدم."»

أو إذا كان هناك شيء يحتاج نقاشًا:

«"شفت قياساتك الجديدة. وزنك ارتفع قليلًا هذا الأسبوع، بينما محيط الخصر لم يتغير كثيرًا. قبل ما نستنتج أي شيء، خلينا نراجع أكلك ونشاطك خلال الأسبوع ونشوف الصورة كاملة."»

يجب أن تكون الرسالة مبنية على البيانات الفعلية، وليست رسالة Template ثابتة دائمًا.

---

9. مهم جدًا: Notification vs AI Message

فرق واضح بين:

Reminder

"حان وقت تسجيل قياساتك الأسبوعية."

و

AI Proactive Message

"شفت قياساتك الجديدة...
خلينا نراجع التغيرات هذا الأسبوع."

الأول Scheduler/Reminder.

الثاني نتيجة:

Event
→ Context
→ Analysis
→ Decision
→ AI Message
→ Notification

---

10. عندما يكون التطبيق مغلقًا

صمم النظام بحيث يكون واضحًا أن:

Local reminders

يمكنها العمل والتشغيل عندما يكون التطبيق مغلقًا.

أما تشغيل Gemini نفسه في الخلفية والتواصل معه أثناء إغلاق التطبيق فلا تفترض أنه مضمون من Flutter فقط.

إذا كان التطبيق يحتاج:

App Closed
→ Cloud Event
→ Gemini
→ Generate AI message
→ Push Notification

فأنشئ abstraction مناسبة للـCloud/Backend بحيث يمكن دعم ذلك، بدل وضع Gemini API call عشوائي داخل Local Notification callback.

إذا كان المشروع حاليًا لا يحتوي Backend، لا تضف Backend كاملًا أو Firebase architecture جديدًا إلا إذا كان ضروريًا فعلًا ومتماشيًا مع الموجود.

اجعل التصميم قابلًا للتوسع.

---

11. Proactive AI Engine

أنشئ أو طوّر خدمة مركزية مثل:

ProactiveAIEngine

أو الاسم الأنسب للمعمارية الحالية.

مسؤوليتها:

Receive Event
      ↓
Load relevant context
      ↓
Sanitize context
      ↓
Determine initiative level
      ↓
Decide whether intervention is needed
      ↓
Generate Coach message if needed
      ↓
Persist event/message state
      ↓
Trigger notification

لا تجعل الـUI مسؤولًا عن هذا المنطق.

---

12. Event-driven architecture

صمم النظام بحيث يمكن إضافة Events مستقبلًا.

أمثلة:

MeasurementsAdded
MealLogged
ActivityLogged
GoalChanged
LongInactivityDetected
WeeklyReviewDue
TaskOverdue
HabitMissed
UserReturned

ليس مطلوبًا أن تجعل كل هذه الأحداث تستخدم AI الآن إذا لم تكن موجودة.

لكن البنية يجب أن تسمح بإضافتها بسهولة.

---

13. منع التكرار والـSpam

هذا مهم جدًا.

يجب أن يعرف النظام:

- هل سبق أن أرسل رسالة لهذا الحدث؟
- هل أرسل رسالة مشابهة مؤخرًا؟
- هل المستخدم تلقى تدخلًا AI قريبًا؟
- هل هذه الرسالة ضرورية؟
- هل يجب الانتظار؟
- هل المستخدم فتح التطبيق بالفعل وعالج الموضوع؟

أضف آلية مناسبة مثل:

ProactiveActionLog

أو ما يعادلها في الـdatabase الحالية.

يجب أن تمنع:

Same Event
→ Multiple AI Messages
→ Multiple Notifications

---

14. Notification Architecture

افصل:

Reminder Notification

عن:

AI Proactive Notification

حتى يمكن معرفة مصدر كل إشعار.

مثال:

NotificationType:
- reminder
- proactive_ai
- system

واستخدم deep linking إذا كان موجودًا في المشروع أو أضفه بشكل متوافق.

مثلاً:

AI Notification
→ Open Coach Conversation

---

15. Context Management

لا ترسل Database كاملة إلى Gemini.

أنشئ Context Builder/Context Engine يستخرج فقط المعلومات المناسبة.

مثال:

User Goal
+
Current Measurements
+
Previous Measurements
+
Recent Trends
+
Relevant Food Data
+
Relevant Activity Data
+
Recent Coach Context

ثم يرسل Context منظمًا إلى Gemini.

احترم الـprivacy architecture الموجودة في المشروع.

---

16. Gemini Integration

استخدم Gemini الموجود حاليًا في المشروع.

لا تستبدل API implementation إذا كان يعمل.

لا تضع API keys داخل الكود.

لا تنشئ Gemini client جديدًا لكل Feature إذا كان هناك Service مركزي.

اجعل:

ProactiveAIEngine
        ↓
AI Service / Gemini Service

وليس:

Every Feature
        ↓
Direct Gemini API

---

17. AI يجب ألا يختلق بيانات

الـAI ممنوع من:

- اختراع قياسات.
- اختراع وزن سابق.
- افتراض أن المستخدم أكل شيئًا لم يسجله.
- افتراض نشاط لم يتم تسجيله.
- الادعاء بأنه لاحظ نمطًا غير موجود في البيانات.

إذا كانت البيانات غير كافية:

Insufficient Context

يجب أن يطلب المعلومات المناسبة أو يتجنب التدخل.

---

18. Weekly Review

أريد أن يكون النظام قابلًا للتوسع لاحقًا إلى:

Weekly Review

بحيث يجمع:

- Weight trend
- Measurements trend
- Food adherence
- Activity
- Habits
- Goal progress
- Previous Coach interactions

ثم يستطيع الـCoach بدء مراجعة أسبوعية مع المستخدم.

مثال:

"جاهز نراجع أسبوعك؟ شفت قياساتك الجديدة، وعندي كم ملاحظة عن تقدمك."

---

19. Data consistency

تأكد من أن:

Measurement saved

لا يعني فقط تحديث UI.

بل يجب أن يكون هناك مصدر بيانات واضح يمكن للـProactive Engine قراءته.

تأكد من:

- timestamps
- previous measurement lookup
- current measurement lookup
- units
- validation
- null handling
- user ownership
- database persistence

ولا تكسر البيانات القديمة.

---

20. Offline behavior

التطبيق يجب أن يستمر في العمل بشكل طبيعي عند عدم وجود الإنترنت.

مثلاً:

User enters measurements
        ↓
Save locally
        ↓
Event recorded locally

إذا لم يوجد Internet:

AI analysis unavailable

فلا تفقد الـEvent.

اجعله:

Pending AI Action

بحيث يمكن معالجته عندما يصبح الاتصال متاحًا، إذا كانت البنية الحالية تسمح بذلك.

---

21. Background execution

افحص ما هو موجود حاليًا في المشروع قبل إضافة أي package.

إذا كان هناك background mechanism موجود، استخدمه.

إذا احتجت package جديدة:

- اختر أقل حل مناسب.
- لا تضف packages غير ضرورية.
- تأكد من Android compatibility.
- تعامل مع battery restrictions.
- لا تفترض أن background Dart execution مضمون في جميع حالات Android.

---

22. Android notification requirements

تأكد من:

- Notification channels
- permissions
- scheduling
- timezone handling
- notification IDs
- cancellation
- rescheduling
- app restart behavior

خصوصًا أن التذكير الأسبوعي يجب ألا يختفي بعد:

- إغلاق التطبيق.
- إعادة تشغيل الهاتف.
- إعادة فتح التطبيق.

إذا كان Android يتطلب إعادة جدولة بعد reboot، نفذ ذلك بطريقة مناسبة للمعمارية الحالية.

---

23. لا تكسر الموجود

هذه قاعدة أساسية.

قبل كل تعديل:

Understand existing code
→ Reuse existing service
→ Extend existing model
→ Preserve existing API
→ Preserve existing UI

ولا:

Delete everything
→ Build new architecture

---

24. Database Migration

إذا احتجت Models أو Fields جديدة:

- استخدم migration آمنة.
- لا تمسح بيانات المستخدم.
- حافظ على backward compatibility قدر الإمكان.
- افحص Isar schema الحالية قبل تعديلها.

خصوصًا للـ:

Measurement
ProactiveAction
AI Event
Notification
Conversation

---

25. Testing

بعد التنفيذ، لا تكتفِ بـ"flutter analyze".

اختبر على الأقل:

Test 1

Weekly reminder appears.

Test 2

User enters measurements.

Test 3

Measurements are persisted.

Test 4

"MeasurementsAdded" event is created.

Test 5

Proactive AI receives the event.

Test 6

AI receives current + previous measurements.

Test 7

AI does not invent missing data.

Test 8

AI decides whether intervention is needed.

Test 9

If intervention is needed → message created.

Test 10

Notification is generated.

Test 11

Clicking notification opens the correct Coach context.

Test 12

Same event does not create duplicate messages.

Test 13

Offline event is not lost.

Test 14

App restart does not destroy scheduled reminders.

Test 15

Existing app features continue working.

---

26. Performance

لا تجعل إضافة Proactive AI تبطئ التطبيق.

خصوصًا:

- لا تستدع Gemini عند كل database write.
- لا تحمل كامل history.
- لا ترسل context ضخم.
- استخدم debouncing/deduplication حيث يلزم.
- لا تنتظر AI response على UI thread.
- لا تجعل فتح Dashboard ينتظر Proactive Engine.

---

27. Deliverables

بعد التنفيذ أعطني تقريرًا واضحًا يتضمن:

A. Existing Architecture

ما الذي كان موجودًا؟

B. Changes Made

كل ملف تم تعديله ولماذا.

C. New Components

ما الذي تمت إضافته؟

D. Event Flow

وضح التدفق:

Weekly Reminder
→ User enters measurements
→ Save
→ MeasurementsAdded
→ Proactive AI
→ Context Builder
→ AI Analysis
→ Intervention Decision
→ Coach Message
→ Notification
→ Conversation

E. Background Behavior

ما الذي يعمل والتطبيق مغلق، وما الذي يحتاج Backend/Internet؟

F. Database Changes

أي migrations أو fields جديدة.

G. Packages Added

فقط الحزم الجديدة ولماذا.

H. Tests

ما الذي تم اختباره ونتيجته.

I. Remaining Limitations

أي شيء لا يمكن للتطبيق الحالي تنفيذه بشكل موثوق بدون Backend/Cloud.

---

28. أهم قاعدة

لا تعتبر المهمة مكتملة بمجرد أن يظهر Notification.

المطلوب هو بناء الحلقة الكاملة:

REMINDER
   ↓
USER ACTION
   ↓
DATA EVENT
   ↓
AI AWARENESS
   ↓
CONTEXT
   ↓
ANALYSIS
   ↓
INTERVENTION DECISION
   ↓
PROACTIVE COACH MESSAGE
   ↓
NOTIFICATION
   ↓
CONVERSATION
   ↓
NEW CONTEXT

هذه هي الحلقة الأساسية التي نريدها في كرشتي.

نفذ ذلك فوق المشروع الحالي، وليس بإعادة بناء المشروع من الصفر.

قبل أي destructive change أو حذف architecture موجودة، توقف ووضح السبب والحل الأقل خطورة.