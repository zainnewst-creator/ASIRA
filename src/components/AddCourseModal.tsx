import React, { useState } from 'react';
import { Course, CourseStatus } from '../types';
import { BookOpen, Plus, X, Upload, Image, Award, CheckCircle } from 'lucide-react';

interface AddCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCourse: (course: Course) => void;
}

export const AddCourseModal: React.FC<AddCourseModalProps> = ({
  isOpen,
  onClose,
  onAddCourse,
}) => {
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('RES-');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [instructorNames, setInstructorNames] = useState('');
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80');
  const [passingScore, setPassingScore] = useState(70);
  const [totalLessons, setTotalLessons] = useState(12);
  const [status, setStatus] = useState<CourseStatus>('published');
  const [fileName, setFileName] = useState<string>('');

  if (!isOpen) return null;

  // رفع صورة الغلاف من جهاز المستخدم (File Upload -> Data URL)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً، يرجى اختيار صورة حجمها أقل من 5 ميغابايت');
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCoverUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) return;

    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title: title.trim(),
      code: code.trim(),
      summary: summary.trim() || 'برنامج تدريبي متقدم لنقل المهارات البحثية وإعداد الأوراق للنشر الدولي.',
      description: description.trim() || summary.trim() || 'دورة تدريبية مكثفة معتمدة في منتدى أسيرا لتعليم البحث العلمي.',
      coverUrl: coverUrl.trim() || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
      instructorIds: ['inst-new'],
      instructorNames: instructorNames.split(',').map((s) => s.trim()).filter(Boolean),
      startDate: '2026-11-20',
      endDate: '2026-12-31',
      status: status,
      passingScore: Number(passingScore) || 70,
      totalLessonsCount: Number(totalLessons) || 10,
      enrolledCount: 0,
      features: [
        'محاضرات تفاعلية ومسجلة عبر منصة أسيرا',
        'تطبيق عملي وتصحيح التكليفات بملاحظات مباشرة',
        'شهادة إتمام معتمدة وموقعة من عمادة المبادرة',
      ],
      syllabusSummary: [
        'الوحدة 1: الأساسيات وصياغة السؤال البحثي',
        'الوحدة 2: البحث المتقدم في قواعد البيانات',
        'الوحدة 3: تحليل البيانات والتطبيق العملي',
      ],
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onAddCourse(newCourse);
    onClose();

    // إعادة تعيين الحقول
    setTitle('');
    setCode('RES-');
    setSummary('');
    setDescription('');
    setFileName('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto' }}>
        <button
          onClick={onClose}
          className="btn btn-ghost"
          style={{ position: 'absolute', top: '16px', left: '16px', padding: '0.4rem' }}
          id="close-add-course-modal"
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <div style={{ padding: '0.5rem', background: 'var(--primary-50)', color: 'var(--primary-700)', borderRadius: 'var(--radius-md)' }}>
            <BookOpen size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              إضافة كورس أكاديمي جديد
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              سيتم نشر الكورس فوراً في الدليل العام، الصفحة الرئيسية، ولوحة التعليم
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                عنوان الكورس *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: التحليل البعدي والشبكي Network Meta-Analysis"
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.9rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                كود الكورس *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="RES-301"
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'monospace', fontWeight: 700, direction: 'ltr', textAlign: 'center' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
              الدكتور المشرف والمحاضرون (افصل بينهم بفاصلة) *
            </label>
            <input
              type="text"
              required
              value={instructorNames}
              onChange={(e) => setInstructorNames(e.target.value)}
              placeholder="مثال: د. محمد العبدالله, د. سارة الأحمد"
              style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.9rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
              نبذة مختصرة (تظهر في بطاقة الكورس) *
            </label>
            <textarea
              rows={2}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="موجز عن أهداف الكورس والمخرجات المتوقعة من الطالب..."
              style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.88rem', fontFamily: 'var(--font-arabic)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
              الوصف الشامل للمقرر
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="تفاصيل المنهج، المخرجات الأكاديمية والمهارات المكتسبة..."
              style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.88rem', fontFamily: 'var(--font-arabic)' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.3fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                درجة النجاح (%)
              </label>
              <input
                type="number"
                min={50}
                max={100}
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontWeight: 700, textAlign: 'center' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                المحاضرات الإجمالية
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={totalLessons}
                onChange={(e) => setTotalLessons(Number(e.target.value))}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontWeight: 700, textAlign: 'center' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                حالة إتاحة الكورس *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CourseStatus)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.85rem' }}
              >
                <option value="published">منشور ومتاح للتسجيل والالتحاق</option>
                <option value="coming_soon">قريباً (قيد الإعداد والإعلان - التسجيل مغلق)</option>
                <option value="draft">مسودة داخلية (غير معلن)</option>
              </select>
            </div>
          </div>

          {/* قسم رفع صورة الغلاف والمعاينة المباشرة */}
          <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Image size={16} color="var(--primary-600)" />
                <span>صورة غلاف الكورس (Cover Image):</span>
              </label>

              {/* زر رفع الصورة من الجهاز */}
              <div>
                <input
                  type="file"
                  id="add-course-image-input"
                  accept="image/png, image/jpeg, image/webp"
                  style={{ display: 'none' }}
                  onChange={handleImageFileChange}
                />
                <label
                  htmlFor="add-course-image-input"
                  className="btn btn-primary"
                  style={{ cursor: 'pointer', fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
                >
                  <Upload size={14} />
                  <span>رفع صورة من جهازك</span>
                </label>
              </div>
            </div>

            {/* معاينة الصورة ومربع الرابط */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ width: '130px', height: '80px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)', background: '#000', flexShrink: 0 }}>
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt="معاينة الغلاف"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: '0.75rem' }}>
                    لا توجد صورة
                  </div>
                )}
              </div>

              <div style={{ flex: 1, minWidth: '220px' }}>
                {fileName && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 600, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <CheckCircle size={14} />
                    <span>تم تحديد الملف: {fileName}</span>
                  </div>
                )}
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  أو يمكنك وضع رابط مباشر للصورة:
                </label>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => {
                    setCoverUrl(e.target.value);
                    setFileName('');
                  }}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.82rem', direction: 'ltr', textAlign: 'left' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">
              إلغاء
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
              <Plus size={16} />
              <span>إضافة ونشر الكورس فوراً</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
