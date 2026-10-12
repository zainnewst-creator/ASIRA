import { Course, ResearchPaper, Testimonial } from '../types';

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
