import { Course, ResearchPaper, Testimonial, UserProfile, AssignmentSubmission, ExamAttempt, OfficialGrade } from '../types';

export const INITIAL_STATS = {
  publishedPapers: 48,
  studentsTrained: 1250,
  activeMentors: 24,
  partnerUniversities: 12,
  hoursOfTraining: 3400,
};

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'منهجية وأساسيات البحث العلمي والنشر الدولي',
    code: 'RES-101',
    summary: 'مسار شامل يبدأ من توليد الفكرة البحثية وصياغة السؤال وحتى كتابة مسودة الورقة واختيار المجلة المناسبة.',
    description: 'تم تصميم هذه الدورة التدريبية لتمكين الباحثين والطلاب من الخطوات العملية في البحث العلمي الأكاديمي، بما يشمل صياغة فرضيات البحث، تصميم الدراسات (Cross-sectional, Cohort, Case-Control)، والتعامل مع معايير النزاهة الأكاديمية.',
    coverUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
    instructorIds: ['inst-1'],
    instructorNames: ['د. إبراهيم يحيى', 'د. سارة الكيلاني'],
    startDate: '2026-11-01',
    endDate: '2026-12-15',
    status: 'published',
    passingScore: 70,
    totalLessonsCount: 14,
    enrolledCount: 184,
    features: [
      '14 محاضرة تفاعلية مسجلة عبر YouTube',
      'تطبيق عملي على صياغة بروتوكول بحثي حقيقي',
      'شهادة إتمام معتمدة وموقعة من عمادة المبادرة',
      'متابعة وتصحيح التكليفات مع ملاحظات تفصيلية'
    ],
    syllabusSummary: [
      'الوحدة 1: اختيار الفكرة البحثية وصياغة السؤال بنظام PICO',
      'الوحدة 2: استراتيجيات البحث في PubMed و Scopus و Web of Science',
      'الوحدة 3: تصميم الدراسات الطبية والإكلينيكية',
      'الوحدة 4: أساسيات الكتابة الأكاديمية ومكافحة الانتحال العلمي',
      'الوحدة 5: الامتحان العملي والتقييم النهائي'
    ],
    createdAt: '2026-10-01',
    updatedAt: '2026-10-10',
  },
  {
    id: 'course-2',
    title: 'المراجعات المنهجية والتحليل التلوي (Systematic Reviews & Meta-Analysis)',
    code: 'RES-201',
    summary: 'تعلم كيفية إعداد ونشر المراجعات المنهجية وفق معايير PRISMA والتحليل الإحصائي باستخدام RevMan و R.',
    description: 'دورة متقدمة تركز على قمة هرم الأدلة العلمية (Evidence-Based Medicine). ستتعلم صياغة خطة المراجعة وتسجيلها في PROSPERO، وتقييم جودة الدراسات (Risk of Bias)، واستخراج البيانات والتحليل البعدي.',
    coverUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    instructorIds: ['inst-2'],
    instructorNames: ['د. يحيى المنصوري'],
    startDate: '2026-11-15',
    endDate: '2026-12-30',
    status: 'published',
    passingScore: 75,
    totalLessonsCount: 18,
    enrolledCount: 92,
    features: [
      'تطبيق عملي على تسجيل بروتوكول في PROSPERO',
      'تدريب شامل على برمجية RevMan و R Metafor',
      'ورشة تفاعلية لتقييم انحياز الدراسات ROB-2',
      'إشراف مباشر حتى إعداد المسودة الأولى للنشر'
    ],
    syllabusSummary: [
      'الوحدة 1: مقدمة في أدلة الطب المسند بالبراهين و PRISMA 2020',
      'الوحدة 2: استراتيجيات البحث المتقدم وتصفية المقالات بواسطة Rayyan',
      'الوحدة 3: أدوات تقييم جودة الدراسات (ROB 2 & ROBINS-I)',
      'الوحدة 4: التحليل الإحصائي التلوي (Forest & Funnel Plots)',
      'الوحدة 5: صياغة التقرير النهائي والمناقشة'
    ],
    createdAt: '2026-10-05',
    updatedAt: '2026-10-11',
  },
  {
    id: 'course-3',
    title: 'التحليل الإحصائي الحيوي للأبحاث الطبية (SPSS & R)',
    code: 'RES-103',
    summary: 'من الصفر إلى الاحتراف في تنظيف البيانات واختيار الاختبار الإحصائي المناسب وتفسير النتائج.',
    description: 'مسار عملي يفكك عقدة الإحصاء الحيوي، يغطي الإحصاء الوصفي والاستدلالي، واختبارات الفرضيات (T-test, ANOVA, Chi-Square, Regression models)، وإعداد الجداول وفق معايير المجلات الدولية.',
    coverUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    instructorIds: ['inst-1'],
    instructorNames: ['د. إبراهيم يحيى'],
    startDate: '2026-12-01',
    endDate: '2027-01-15',
    status: 'published',
    passingScore: 70,
    totalLessonsCount: 12,
    enrolledCount: 140,
    features: [
      'مجموعات بيانات طبية حقيقية للتدريب العملي',
      'شرح مبسط لكيفية قراءة وتفسير قيم p-value و Confidence Intervals',
      'قوالب جاهزة لصياغة نتائج الإحصاء في الورقة العلمية'
    ],
    syllabusSummary: [
      'الوحدة 1: تنظيف البيانات وإدارتها في SPSS',
      'الوحدة 2: اختبارات الفروق المعلمية واللامعلمية',
      'الوحدة 3: نماذج الانحدار الخطي واللوجستي',
      'الوحدة 4: إخراج الجداول والرسومات البيانية للنشر'
    ],
    createdAt: '2026-10-08',
    updatedAt: '2026-10-12',
  }
];

export const INITIAL_RESEARCHES: ResearchPaper[] = [
  {
    id: 'res-1',
    title: 'Efficacy and Safety of Novel Antidiabetic Agents in Heart Failure: A Systematic Review and Network Meta-Analysis',
    authors: ['أحمد الصالح', 'محمد البعداني', 'د. يحيى المنصوري'],
    supervisorName: 'د. يحيى المنصوري',
    field: 'طب بشري وباطنة',
    journal: 'European Journal of Clinical Investigation',
    publicationYear: 2026,
    doiLink: 'https://doi.org/10.1111/eci.14200',
    pubmedLink: 'https://pubmed.ncbi.nlm.nih.gov/38200112',
    abstract: 'دراسة تلوي شبكية أجراها فريق من باحثي منتدى أسيرا شملت 24 تجربة سريرية عشوائية لتقييم أثر مثبطات SGLT2 ومستقبلات GLP-1 على مآلات قصور القلب ومعدل الاستشفاء.',
    coverImageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    isFeatured: true,
    viewsCount: 1420,
    createdAt: '2026-09-15',
  },
  {
    id: 'res-2',
    title: 'Adherence to Antibiotic Stewardship Guidelines in Pediatric Intensive Care: A Multicenter Cross-Sectional Study',
    authors: ['سارة اليماني', 'ريم الحكيمي', 'د. إبراهيم يحيى'],
    supervisorName: 'د. إبراهيم يحيى',
    field: 'طب الأطفال والصيدلة السريرية',
    journal: 'BMC Pediatrics',
    publicationYear: 2026,
    doiLink: 'https://doi.org/10.1186/s12887-026-04800-x',
    pubmedLink: 'https://pubmed.ncbi.nlm.nih.gov/38450123',
    abstract: 'دراسة مقطعية لتقييم الالتزام بإرشادات ترشيد استخدام المضادات الحيوية في أقسام العناية المركزة للأطفال في 4 مستشفيات جامعية، قادها طلاب مسار البحث الإكلينيكي في منتدى أسيرا.',
    coverImageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    isFeatured: true,
    viewsCount: 980,
    createdAt: '2026-08-20',
  },
  {
    id: 'res-3',
    title: 'Impact of Academic Research Training on Undergraduate Medical Students Confidence and Productivity',
    authors: ['فريق مبادرة أسيرا للبحث العلمي'],
    supervisorName: 'إدارة المنتدى',
    field: 'التعليم الطبي والمنهجية',
    journal: 'Medical Education Online',
    publicationYear: 2025,
    doiLink: 'https://doi.org/10.1080/10872981.2025.2290110',
    abstract: 'ورقة بحثية توثق مخرجات نموذج تدريب أسيرا على مدار 3 سنوات وأثره في سد الفجوة المعرفية وتمكين طلاب الكليات الصحية من أدوات النشر الدولي قبل التخرج.',
    coverImageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80',
    status: 'published',
    isFeatured: true,
    viewsCount: 2310,
    createdAt: '2025-12-10',
  }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    studentName: 'ط. أحمد الصالح',
    university: 'كلية الطب البشري - جامعة الملك سعود',
    researchTitle: 'باحث مشارك في ورقة منشورة في Q1',
    quote: 'انضمامي لمنتدى أسيرا كان نقطة التحول الحقيقية في مسيرتي الأكاديمية. من فكرة بسيطة وتدريب مكثف على المراجعات المنهجية، نجحنا كفريق في نشر ورقتنا الأولى في مجلة أوروبية محكمة!',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    status: 'published',
  },
  {
    id: 'test-2',
    studentName: 'ص. ريم الحكيمي',
    university: 'دكتور صيدلة - جامعة العلوم والتكنولوجيا',
    researchTitle: 'مؤلفة أولى لبحث مقطعي متعدد المراكز',
    quote: 'كنت أعتقد أن البحث العلمي مجرد متطلب تخرج روتيني، لكن مع أسيرا تعلمت كيف أصيغ البروتوكول وأتعامل مع التحليل الإحصائي باحترافية كاملة ودون خوف.',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    status: 'published',
  },
  {
    id: 'test-3',
    studentName: 'ط. محمد البعداني',
    university: 'كلية الطب والعلوم الصحية',
    researchTitle: 'خريج مسار المراجعات المنهجية والتحليل التلوي',
    quote: 'المتابعة الدقيقة والتصحيح المفصل لكل تكليف هو ما يميز منتدى أسيرا. المدربون لا يعطونك معلومات نظرية فقط، بل يشاركونك خبرة النشر في الميدان خطوة بخطوة.',
    rating: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    status: 'published',
  }
];

// ===================================================
// بيانات محاكاة لوحات التحكم الأكاديمية (LMS Portal Data)
// ===================================================

export interface MockStudentSubmission {
  id: string;
  studentUid: string;
  studentName: string;
  university: string;
  assignmentTitle: string;
  version: number;
  driveFileUrl: string;
  submittedAt: string;
  status: 'submitted' | 'graded' | 'revision_required';
  grade?: number;
  maxScore: number;
  instructorFeedback?: string;
  revisionNotes?: string;
}

export const INITIAL_STUDENT_SUBMISSIONS: MockStudentSubmission[] = [
  {
    id: 'sub-1',
    studentUid: 'student-1',
    studentName: 'أحمد محمد الصالح',
    university: 'جامعة الملك سعود - كلية الطب',
    assignmentTitle: 'صياغة بروتوكول بحثي وتحديد استراتيجية MeSH',
    version: 2,
    driveFileUrl: 'https://drive.google.com/file/d/1ExampleStudentSubmissionAhmed/view',
    submittedAt: '2026-10-12 14:30',
    status: 'graded',
    grade: 18,
    maxScore: 20,
    instructorFeedback: 'عمل متقن جداً في صياغة PICO، تم تعديل كلمات MeSH وفق الملاحظة السابقة. أحسنت!',
  },
  {
    id: 'sub-2',
    studentUid: 'student-2',
    studentName: 'سارة خالد الكيلاني',
    university: 'جامعة العلوم والتكنولوجيا - دكتور صيدلة',
    assignmentTitle: 'صياغة بروتوكول بحثي وتحديد استراتيجية MeSH',
    version: 1,
    driveFileUrl: 'https://drive.google.com/file/d/1ExampleStudentSubmissionSara/view',
    submittedAt: '2026-10-12 11:15',
    status: 'submitted',
    grade: undefined,
    maxScore: 20,
    instructorFeedback: undefined,
  },
  {
    id: 'sub-3',
    studentUid: 'student-3',
    studentName: 'عمر ياسين الدوسري',
    university: 'جامعة الملك فيصل - كلية الطب',
    assignmentTitle: 'صياغة بروتوكول بحثي وتحديد استراتيجية MeSH',
    version: 1,
    driveFileUrl: 'https://drive.google.com/file/d/1ExampleStudentSubmissionOmar/view',
    submittedAt: '2026-10-11 19:40',
    status: 'revision_required',
    grade: undefined,
    maxScore: 20,
    instructorFeedback: 'البروتوكول ممتاز، لكنك نسيت تحديد معايير الاستبعاد (Exclusion criteria). يرجى مراجعتها وإعادة إرسال الملف.',
    revisionNotes: 'مطلوب توضيح معايير الاستبعاد في الصفحة 3.',
  },
  {
    id: 'sub-4',
    studentUid: 'student-4',
    studentName: 'فاطمة الزهراء المنصور',
    university: 'جامعة القاهرة - كلية التمريض',
    assignmentTitle: 'صياغة بروتوكول بحثي وتحديد استراتيجية MeSH',
    version: 1,
    driveFileUrl: 'https://drive.google.com/file/d/1ExampleStudentSubmissionFatima/view',
    submittedAt: '2026-10-12 16:05',
    status: 'submitted',
    grade: undefined,
    maxScore: 20,
    instructorFeedback: undefined,
  }
];

export interface MockExamAttemptForInstructor {
  id: string;
  studentUid: string;
  studentName: string;
  university: string;
  examTitle: string;
  submittedAt: string;
  calculatedScore: number;
  officialGrade?: number;
  maxScore: number;
  status: 'pending_review' | 'approved';
  instructorRemarks?: string;
  studentAnswers: {
    qId: string;
    questionText: string;
    studentAnswer: string;
    correctAnswer: string;
    points: number;
    maxPoints: number;
    isCorrect: boolean;
  }[];
}

export const INITIAL_EXAM_ATTEMPTS: MockExamAttemptForInstructor[] = [
  {
    id: 'attempt-1',
    studentUid: 'student-1',
    studentName: 'أحمد محمد الصالح',
    university: 'جامعة الملك سعود - كلية الطب',
    examTitle: 'اختبار منتصف المسار النظري (Mid-term MCQ)',
    submittedAt: '2026-10-12 12:20',
    calculatedScore: 26,
    officialGrade: 26,
    maxScore: 30,
    status: 'approved',
    instructorRemarks: 'إجابات ممتازة، خطأ وحيد في سؤال حساب حجم العينة.',
    studentAnswers: [
      {
        qId: 'q1',
        questionText: 'أي من التصاميم يعتبر المعيار الذهبي لتقييم كفاءة الأدوية؟',
        studentAnswer: 'التجارب السريرية العشوائية (RCT)',
        correctAnswer: 'التجارب السريرية العشوائية (RCT)',
        points: 5,
        maxPoints: 5,
        isCorrect: true,
      },
      {
        qId: 'q2',
        questionText: 'ما هو الإصدار الأحدث لدليل معايير المراجعات المنهجية؟',
        studentAnswer: 'PRISMA 2020',
        correctAnswer: 'PRISMA 2020',
        points: 5,
        maxPoints: 5,
        isCorrect: true,
      },
      {
        qId: 'q3',
        questionText: 'في أي مرحلة يتم تسجيل البروتوكول في منصة PROSPERO؟',
        studentAnswer: 'قبل بدء استخلاص البيانات وتصفية النتائج',
        correctAnswer: 'قبل بدء استخلاص البيانات وتصفية النتائج',
        points: 5,
        maxPoints: 5,
        isCorrect: true,
      },
      {
        qId: 'q4',
        questionText: 'ما الدلالة الإحصائية لقيمة p-value أقل من 0.05؟',
        studentAnswer: 'رفض الفرضية الصفرية ووجود دلالة إحصائية',
        correctAnswer: 'رفض الفرضية الصفرية ووجود دلالة إحصائية',
        points: 5,
        maxPoints: 5,
        isCorrect: true,
      },
      {
        qId: 'q5',
        questionText: 'ما هو الاختبار الإحصائي المناسب لمقارنة متوسطين لعينتين مستقلتين؟',
        studentAnswer: 'One-Way ANOVA',
        correctAnswer: 'Independent Samples t-test',
        points: 0,
        maxPoints: 5,
        isCorrect: false,
      },
      {
        qId: 'q6',
        questionText: 'ما هي الأداة المعتمدة لتقييم انحياز التجارب السريرية العشوائية؟',
        studentAnswer: 'RoB 2 (Risk of Bias 2)',
        correctAnswer: 'RoB 2 (Risk of Bias 2)',
        points: 6,
        maxPoints: 6,
        isCorrect: true,
      }
    ]
  },
  {
    id: 'attempt-2',
    studentUid: 'student-2',
    studentName: 'سارة خالد الكيلاني',
    university: 'جامعة العلوم والتكنولوجيا - دكتور صيدلة',
    examTitle: 'اختبار منتصف المسار النظري (Mid-term MCQ)',
    submittedAt: '2026-10-12 15:45',
    calculatedScore: 24,
    officialGrade: undefined,
    maxScore: 30,
    status: 'pending_review',
    instructorRemarks: undefined,
    studentAnswers: [
      {
        qId: 'q1',
        questionText: 'أي من التصاميم يعتبر المعيار الذهبي لتقييم كفاءة الأدوية؟',
        studentAnswer: 'التجارب السريرية العشوائية (RCT)',
        correctAnswer: 'التجارب السريرية العشوائية (RCT)',
        points: 5,
        maxPoints: 5,
        isCorrect: true,
      },
      {
        qId: 'q2',
        questionText: 'ما هو الإصدار الأحدث لدليل معايير المراجعات المنهجية؟',
        studentAnswer: 'PRISMA 2015',
        correctAnswer: 'PRISMA 2020',
        points: 0,
        maxPoints: 5,
        isCorrect: false,
      },
      {
        qId: 'q3',
        questionText: 'في أي مرحلة يتم تسجيل البروتوكول في منصة PROSPERO؟',
        studentAnswer: 'قبل بدء استخلاص البيانات وتصفية النتائج',
        correctAnswer: 'قبل بدء استخلاص البيانات وتصفية النتائج',
        points: 5,
        maxPoints: 5,
        isCorrect: true,
      },
      {
        qId: 'q4',
        questionText: 'ما الدلالة الإحصائية لقيمة p-value أقل من 0.05؟',
        studentAnswer: 'رفض الفرضية الصفرية ووجود دلالة إحصائية',
        correctAnswer: 'رفض الفرضية الصفرية ووجود دلالة إحصائية',
        points: 5,
        maxPoints: 5,
        isCorrect: true,
      },
      {
        qId: 'q5',
        questionText: 'ما هو الاختبار الإحصائي المناسب لمقارنة متوسطين لعينتين مستقلتين؟',
        studentAnswer: 'Independent Samples t-test',
        correctAnswer: 'Independent Samples t-test',
        points: 5,
        maxPoints: 5,
        isCorrect: true,
      },
      {
        qId: 'q6',
        questionText: 'ما هي الأداة المعتمدة لتقييم انحياز التجارب السريرية العشوائية؟',
        studentAnswer: 'ROBINS-I',
        correctAnswer: 'RoB 2 (Risk of Bias 2)',
        points: 0,
        maxPoints: 6,
        isCorrect: false,
      }
    ]
  }
];

export interface MockCourseCurriculum {
  courseId: string;
  modules: {
    id: string;
    title: string;
    lessons: {
      id: string;
      title: string;
      youtubeId: string;
      durationMinutes: number;
      isMandatory: boolean;
      drivePdfUrl?: string;
    }[];
  }[];
}

export const INITIAL_CURRICULUM: MockCourseCurriculum = {
  courseId: 'course-1',
  modules: [
    {
      id: 'mod-1',
      title: 'الوحدة الأولى: أساسيات البحث العلمي وصياغة السؤال (PICO Framework)',
      lessons: [
        {
          id: 'les-1',
          title: 'الدرس 1: مقدمة في البحث الأكاديمي وهرم الأدلة الطبية (Evidence Pyramid)',
          youtubeId: 'dQw4w9WgXcQ',
          durationMinutes: 45,
          isMandatory: true,
          drivePdfUrl: 'https://drive.google.com/file/d/sampleSlideModule1/view'
        },
        {
          id: 'les-2',
          title: 'الدرس 2: صياغة سؤال البحث الإكلينيكي بنظام PICO و PEO',
          youtubeId: 'dQw4w9WgXcQ',
          durationMinutes: 50,
          isMandatory: true,
          drivePdfUrl: 'https://drive.google.com/file/d/sampleSlideModule2/view'
        }
      ]
    },
    {
      id: 'mod-2',
      title: 'الوحدة الثانية: استراتيجيات البحث في قواعد البيانات الطبية المتقدمة',
      lessons: [
        {
          id: 'les-3',
          title: 'الدرس 3: استراتيجيات البحث في PubMed ومصطلحات MeSH Terms',
          youtubeId: 'dQw4w9WgXcQ',
          durationMinutes: 60,
          isMandatory: true,
          drivePdfUrl: 'https://drive.google.com/file/d/sampleSlideModule3/view'
        },
        {
          id: 'les-4',
          title: 'الدرس 4: التصفية المزدوجة وإدارة المراجع بواسطة EndNote و Rayyan',
          youtubeId: 'dQw4w9WgXcQ',
          durationMinutes: 40,
          isMandatory: true,
          drivePdfUrl: 'https://drive.google.com/file/d/sampleSlideModule4/view'
        }
      ]
    },
    {
      id: 'mod-3',
      title: 'الوحدة الثالثة: تصميم الدراسات الإكلينيكية وأدوات تقييم الانحياز',
      lessons: [
        {
          id: 'les-5',
          title: 'الدرس 5: تصاميم الدراسات المقطعية وحالات الشواهد (Observational Studies)',
          youtubeId: 'dQw4w9WgXcQ',
          durationMinutes: 55,
          isMandatory: true,
          drivePdfUrl: 'https://drive.google.com/file/d/sampleSlideModule5/view'
        },
        {
          id: 'les-6',
          title: 'الدرس 6: التجارب السريرية العشوائية المزدوجة التعمية (RCT Design)',
          youtubeId: 'dQw4w9WgXcQ',
          durationMinutes: 65,
          isMandatory: true,
          drivePdfUrl: 'https://drive.google.com/file/d/sampleSlideModule6/view'
        }
      ]
    }
  ]
};

export interface MockPendingEnrollment {
  id: string;
  studentUid: string;
  studentName: string;
  studentEmail: string;
  university: string;
  specialty: string;
  academicLevel: string;
  courseId: string;
  courseTitle: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const INITIAL_PENDING_ENROLLMENTS: MockPendingEnrollment[] = [
  {
    id: 'enr-1',
    studentUid: 'student-2',
    studentName: 'سارة خالد الكيلاني',
    studentEmail: 'sara.k@ust.edu',
    university: 'جامعة العلوم والتكنولوجيا',
    specialty: 'دكتور صيدلة (PharmD)',
    academicLevel: 'سنة خامسة (امتياز)',
    courseId: 'course-1',
    courseTitle: 'منهجية وأساسيات البحث العلمي والنشر الدولي',
    requestedAt: '2026-10-12 10:15',
    status: 'pending',
  },
  {
    id: 'enr-2',
    studentUid: 'student-3',
    studentName: 'عمر ياسين الدوسري',
    studentEmail: 'omar.d@kfu.edu.sa',
    university: 'جامعة الملك فيصل',
    specialty: 'طب وجراحة',
    academicLevel: 'سنة رابعة',
    courseId: 'course-1',
    courseTitle: 'منهجية وأساسيات البحث العلمي والنشر الدولي',
    requestedAt: '2026-10-12 11:40',
    status: 'pending',
  },
  {
    id: 'enr-3',
    studentUid: 'student-5',
    studentName: 'يوسف عبد الرحمن العتيبي',
    studentEmail: 'yousef.o@ksu.edu.sa',
    university: 'جامعة الملك سعود',
    specialty: 'الصيدلة الإكلينيكية',
    academicLevel: 'دراسات عليا (ماجستير)',
    courseId: 'course-2',
    courseTitle: 'المراجعات المنهجية والتحليل التلوي',
    requestedAt: '2026-10-12 09:20',
    status: 'pending',
  }
];

export interface MockCertificateRequest {
  id: string;
  studentUid: string;
  studentName: string;
  courseTitle: string;
  requestedAt: string;
  status: 'pending' | 'issued';
  signedPdfUrl?: string;
  verificationCode?: string;
}

export const INITIAL_CERT_REQUESTS: MockCertificateRequest[] = [
  {
    id: 'cert-req-1',
    studentUid: 'student-1',
    studentName: 'أحمد محمد الصالح',
    courseTitle: 'منهجية وأساسيات البحث العلمي والنشر الدولي',
    requestedAt: '2026-10-12 13:00',
    status: 'pending',
    signedPdfUrl: undefined,
    verificationCode: undefined,
  }
];

export interface MockAuditLogItem {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  details: string;
}

export const INITIAL_AUDIT_LOGS: MockAuditLogItem[] = [
  {
    id: 'audit-1',
    timestamp: '2026-10-12 15:40:12',
    actorName: 'د. إبراهيم يحيى',
    actorRole: 'مدرس مسند (Instructor)',
    action: 'اعتماد درجة الاختبار النظري (Official Grade Commitment)',
    details: 'اعتماد درجة الطالب أحمد الصالح: 26/30 في اختبار Mid-term MCQ.',
  },
  {
    id: 'audit-2',
    timestamp: '2026-10-12 14:10:05',
    actorName: 'د. إبراهيم يحيى',
    actorRole: 'مدرس مسند (Instructor)',
    action: 'تصحيح تكليف بروتوكول PICO (Assignment Graded)',
    details: 'رصد 18/20 للطالب أحمد الصالح مع ملاحظات التعديل النسخة 2.',
  },
  {
    id: 'audit-3',
    timestamp: '2026-10-12 11:30:45',
    actorName: 'admin@asira-research.org',
    actorRole: 'مدير المنصة (Admin)',
    action: 'قبول طلب التحاق (Enrollment Approved)',
    details: 'الموافقة على التحاق الطالب أحمد الصالح بكورس RES-101.',
  },
  {
    id: 'audit-4',
    timestamp: '2026-10-12 09:15:00',
    actorName: 'admin@asira-research.org',
    actorRole: 'مدير المنصة (Admin)',
    action: 'نشر بحث علمي في المعرض العام (Research Published)',
    details: 'اعتماد ونشر ورقة European Journal of Clinical Investigation في واجهة المنتدى.',
  }
];
