import React, { useState, useEffect } from 'react';
import { ResearchPaper } from '../types';
import { Edit3, X, Upload, Image, Check, Trash2 } from 'lucide-react';
import { sanitizeUrl } from '../utils/security';

const RESEARCH_IMAGE_PRESETS = [
  {
    title: 'مختبر أبحاث وتحاليل',
    url: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'إحصاء وتحليل بيانات',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'جينوم ووراثة خلوية',
    url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'طب باطنة وقلب وأوعية',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'مكتبة مراجع علمية',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: 'أبحاث سريرية وطب أطفال',
    url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
  },
];

interface EditResearchModalProps {
  isOpen: boolean;
  paper: ResearchPaper | null;
  onClose: () => void;
  onUpdateResearch: (research: ResearchPaper) => void;
  onDeleteResearch?: (id: string) => void;
}

export const EditResearchModal: React.FC<EditResearchModalProps> = ({
  isOpen,
  paper,
  onClose,
  onUpdateResearch,
  onDeleteResearch,
}) => {
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [field, setField] = useState('طب بشري وباطنة');
  const [journal, setJournal] = useState('');
  const [publicationYear, setPublicationYear] = useState(2026);
  const [doiLink, setDoiLink] = useState('');
  const [pubmedLink, setPubmedLink] = useState('');
  const [abstract, setAbstract] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  useEffect(() => {
    if (paper) {
      setTitle(paper.title || '');
      setAuthors(paper.authors ? paper.authors.join(', ') : '');
      setSupervisorName(paper.supervisorName || 'د. إبراهيم يحيى');
      setField(paper.field || 'طب بشري وباطنة');
      setJournal(paper.journal || '');
      setPublicationYear(paper.publicationYear || 2026);
      setDoiLink(paper.doiLink || '');
      setPubmedLink(paper.pubmedLink || '');
      setAbstract(paper.abstract || '');
      setCoverImageUrl(paper.coverImageUrl || RESEARCH_IMAGE_PRESETS[0].url);
      setUploadedFileName('');
    }
  }, [paper]);

  if (!isOpen || !paper) return null;

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 5 ميجابايت');
        return;
      }
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCoverImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !journal.trim()) return;

    const updatedPaper: ResearchPaper = {
      ...paper,
      title: title.trim(),
      authors: authors.split(',').map((a) => a.trim()).filter(Boolean).length > 0
        ? authors.split(',').map((a) => a.trim()).filter(Boolean)
        : paper.authors,
      supervisorName: supervisorName.trim() || 'د. إبراهيم يحيى',
      field: field.trim(),
      journal: journal.trim(),
      publicationYear: Number(publicationYear) || 2026,
      doiLink: sanitizeUrl(doiLink.trim() || paper.doiLink),
      pubmedLink: pubmedLink.trim() ? sanitizeUrl(pubmedLink.trim()) : undefined,
      abstract: abstract.trim() || paper.abstract,
      coverImageUrl: coverImageUrl.trim() ? (coverImageUrl.startsWith('data:image/') ? coverImageUrl : sanitizeUrl(coverImageUrl.trim())) : RESEARCH_IMAGE_PRESETS[0].url,
    };

    onUpdateResearch(updatedPaper);
    onClose();
  };

  const handleDelete = () => {
    if (onDeleteResearch && window.confirm(`هل أنت متأكد من حذف البحث: "${paper.title}"؟`)) {
      onDeleteResearch(paper.id);
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
        <button
          onClick={onClose}
          className="btn btn-ghost"
          style={{ position: 'absolute', top: '16px', left: '16px', padding: '0.4rem' }}
          id="close-edit-research-modal"
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <div style={{ padding: '0.5rem', background: 'var(--primary-50)', color: 'var(--primary-700)', borderRadius: 'var(--radius-md)' }}>
            <Edit3 size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              تعديل تفاصيل وصورة البحث المنشور
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              تحديث بيانات الورقة البحثية وصورة الغلاف في المعرض العام
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
              عنوان البحث باللغة الإنجليزية / العربية *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                أسماء الباحثين والطلاب (افصل بينهم بفاصلة)
              </label>
              <input
                type="text"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.88rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                المشرف الأكاديمي
              </label>
              <input
                type="text"
                value={supervisorName}
                onChange={(e) => setSupervisorName(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.88rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                اسم المجلة العلمية المحكمة *
              </label>
              <input
                type="text"
                required
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.88rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                المجال والتخصص
              </label>
              <select
                value={field}
                onChange={(e) => setField(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.88rem' }}
              >
                <option value="طب بشري وباطنة">طب بشري وباطنة</option>
                <option value="طب الأطفال والصيدلة السريرية">طب الأطفال والصيدلة السريرية</option>
                <option value="التعليم الطبي والمنهجية">التعليم الطبي والمنهجية</option>
                <option value="جراحة عامة وتخصصية">جراحة عامة وتخصصية</option>
                <option value="صحة عامة ووبائيات">صحة عامة ووبائيات</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                سنة النشر
              </label>
              <input
                type="number"
                value={publicationYear}
                onChange={(e) => setPublicationYear(Number(e.target.value))}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', textAlign: 'center', fontWeight: 700 }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                رابط DOI الرقمي
              </label>
              <input
                type="url"
                value={doiLink}
                onChange={(e) => setDoiLink(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', direction: 'ltr', textAlign: 'left', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                رابط PubMed
              </label>
              <input
                type="url"
                value={pubmedLink}
                onChange={(e) => setPubmedLink(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', direction: 'ltr', textAlign: 'left', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
              ملخص البحث (Abstract)
            </label>
            <textarea
              rows={3}
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.88rem', fontFamily: 'var(--font-arabic)' }}
            />
          </div>

          {/* قسم رفع وتعديل صورة البحث */}
          <div style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Image size={16} color="var(--primary-600)" />
                <span>صورة غلاف البحث العلمي:</span>
              </label>

              <div>
                <input
                  type="file"
                  id="edit-research-image-input"
                  accept="image/png, image/jpeg, image/webp"
                  style={{ display: 'none' }}
                  onChange={handleImageFileChange}
                />
                <label
                  htmlFor="edit-research-image-input"
                  className="btn btn-outline"
                  style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                  id="edit-upload-research-image-btn"
                >
                  <Upload size={14} />
                  <span>رفع صورة جديدة من الجهاز</span>
                </label>
              </div>
            </div>

            {uploadedFileName && (
              <div style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Check size={14} />
                <span>تم اختيار الملف الجديد: <strong>{uploadedFileName}</strong></span>
              </div>
            )}

            {/* معاينة الصورة المحدثة */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.75rem', background: 'var(--bg-card)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div style={{ width: '90px', height: '60px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border-color)' }}>
                <img
                  src={coverImageUrl}
                  alt="Research Cover Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = RESEARCH_IMAGE_PRESETS[0].url;
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                  رابط صورة الغلاف الحالي أو الجديد:
                </span>
                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.8rem', direction: 'ltr', textAlign: 'left' }}
                />
              </div>
            </div>

            {/* النماذج الجاهزة */}
            <div>
              <span style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                أو اختر صورة علمية بديلة بنقرة واحدة:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))', gap: '0.5rem' }}>
                {RESEARCH_IMAGE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCoverImageUrl(preset.url);
                      setUploadedFileName('');
                    }}
                    style={{
                      border: coverImageUrl === preset.url ? '2px solid var(--primary-600)' : '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      padding: '0',
                      background: 'none',
                      cursor: 'pointer',
                      textAlign: 'center',
                      position: 'relative'
                    }}
                    title={preset.title}
                  >
                    <img
                      src={preset.url}
                      alt={preset.title}
                      style={{ width: '100%', height: '50px', objectFit: 'cover', display: 'block' }}
                    />
                    <span style={{ display: 'block', fontSize: '0.68rem', padding: '0.2rem 0.1rem', background: 'var(--bg-subtle)', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {preset.title}
                    </span>
                    {coverImageUrl === preset.url && (
                      <div style={{ position: 'absolute', top: '2px', right: '2px', background: 'var(--primary-600)', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Check size={10} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
            {onDeleteResearch && (
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-ghost"
                style={{ color: '#ef4444', fontSize: '0.85rem' }}
              >
                <Trash2 size={15} />
                <span>حذف الورقة</span>
              </button>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginRight: 'auto' }}>
              <button type="button" onClick={onClose} className="btn btn-outline">
                إلغاء
              </button>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.5rem' }}>
                <span>حفظ التعديلات وتحديث الصورة</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
