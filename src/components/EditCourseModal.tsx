import React, { useState, useEffect } from 'react';
import { Course, CourseStatus } from '../types';
import { Edit3, X, Upload, Image, Save, CheckCircle } from 'lucide-react';

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onUpdateCourse: (updated: Course) => void;
}

export const EditCourseModal: React.FC<EditCourseModalProps> = ({
  isOpen,
  onClose,
  course,
  onUpdateCourse,
}) => {
  const [title, setTitle] = useState(course.title);
  const [code, setCode] = useState(course.code);
  const [summary, setSummary] = useState(course.summary);
  const [description, setDescription] = useState(course.description || course.summary);
  const [instructorNames, setInstructorNames] = useState(course.instructorNames?.join(', ') || '');
  const [coverUrl, setCoverUrl] = useState(course.coverUrl);
  const [passingScore, setPassingScore] = useState(course.passingScore || 70);
  const [totalLessonsCount, setTotalLessonsCount] = useState(course.totalLessonsCount || 10);
  const [status, setStatus] = useState<CourseStatus>(course.status || 'published');
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setCode(course.code);
      setSummary(course.summary);
      setDescription(course.description || course.summary);
      setInstructorNames(course.instructorNames?.join(', ') || '');
      setCoverUrl(course.coverUrl);
      setPassingScore(course.passingScore || 70);
      setTotalLessonsCount(course.totalLessonsCount || 10);
      setStatus(course.status || 'published');
      setFileName('');
    }
  }, [course]);

  if (!isOpen) return null;

  // رفع صورة الغلاف من جهاز المستخدم (FileReader -> Data URL)
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

    const updated: Course = {
      ...course,
      title: title.trim(),
      code: code.trim(),
      summary: summary.trim(),
      description: description.trim(),
      instructorNames: instructorNames.split(',').map((s) => s.trim()).filter(Boolean),
      coverUrl: coverUrl.trim(),
      passingScore: Number(passingScore) || 70,
      totalLessonsCount: Number(totalLessonsCount) || 10,
      status,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    onUpdateCourse(updated);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }}>
        <button
          onClick={onClose}
          className="btn btn-ghost"
          style={{ position: 'absolute', top: '16px', left: '16px', padding: '0.4rem' }}
          id="close-edit-course-modal"
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
          <div style={{ padding: '0.55rem', background: 'var(--primary-50)', color: 'var(--primary-700)', borderRadius: 'var(--radius-md)' }}>
            <Edit3 size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              تعديل تفاصيل وإعدادات الكورس
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              تعديل العنوان، الوصف، الدكاترة المشرفين، صورة الغلاف، ودرجة النجاح لكورس ({course.code})
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginTop: '1.25rem' }}>
          {/* عنوان الكورس وكوده */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                عنوان الكورس *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.9rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                كود الكورس *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontFamily: 'monospace', fontWeight: 700, direction: 'ltr', textAlign: 'center' }}
              />
            </div>
          </div>

          {/* الدكاترة والمشرفون وحالة الكورس */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
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
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                حالة النشر
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'published' | 'draft' | 'archived')}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.9rem' }}
              >
                <option value="published">منشور متاح للطلاب (Published)</option>
                <option value="draft">مسودة قيد الإعداد (Draft)</option>
                <option value="archived">مؤرشف (Archived)</option>
              </select>
            </div>
          </div>

          {/* نبذة مختصرة */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
              نبذة مختصرة (تظهر في بطاقة الكورس وقوائم التصفح) *
            </label>
            <textarea
              rows={2}
              required
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.88rem', fontFamily: 'var(--font-arabic)' }}
            />
          </div>

          {/* الوصف التفصيلي والمنهج */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
              الوصف الشامل للمقرر ومخرجات التعلم الأكاديمية
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب الأهداف الأكاديمية التفصيلية والمهارات التي سيكتسبها الباحث..."
              style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.88rem', fontFamily: 'var(--font-arabic)' }}
            />
          </div>

          {/* درجة النجاح وعدد المحاضرات وحالة الكورس */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.3fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
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
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                المحاضرات الإجمالية
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={totalLessonsCount}
                onChange={(e) => setTotalLessonsCount(Number(e.target.value))}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontWeight: 700, textAlign: 'center' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
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
                <option value="archived">مؤرشف</option>
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
                  id="edit-course-image-input"
                  accept="image/png, image/jpeg, image/webp"
                  style={{ display: 'none' }}
                  onChange={handleImageFileChange}
                />
                <label
                  htmlFor="edit-course-image-input"
                  className="btn btn-primary"
                  style={{ cursor: 'pointer', fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
                >
                  <Upload size={14} />
                  <span>رفع صورة جديدة من جهازك</span>
                </label>
              </div>
            </div>

            {/* معاينة الصورة الحالية ومربع الرابط */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ width: '140px', height: '85px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)', background: '#000', flexShrink: 0 }}>
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
                  أو يمكنك إدخال / تعديل رابط الصورة المباشر:
                </label>
                <input
                  type="url"
                  value={coverUrl}
                  onChange={(e) => {
                    setCoverUrl(e.target.value);
                    setFileName('');
                  }}
                  placeholder="https://images.unsplash.com/..."
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.82rem', direction: 'ltr', textAlign: 'left' }}
                />
              </div>
            </div>
          </div>

          {/* أزرار الإجراء */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">
              إلغاء
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.75rem' }} id="save-course-changes-btn">
              <Save size={16} />
              <span>حفظ وتحديث بيانات الكورس</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
