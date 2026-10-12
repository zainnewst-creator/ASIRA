import React, { useState } from 'react';
import { ResearchPaper } from '../types';
import { FileText, Plus, X, ExternalLink } from 'lucide-react';

interface AddResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddResearch: (research: ResearchPaper) => void;
}

export const AddResearchModal: React.FC<AddResearchModalProps> = ({
  isOpen,
  onClose,
  onAddResearch,
}) => {
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [supervisorName, setSupervisorName] = useState('د. إبراهيم يحيى');
  const [field, setField] = useState('طب بشري وباطنة');
  const [journal, setJournal] = useState('');
  const [publicationYear, setPublicationYear] = useState(2026);
  const [doiLink, setDoiLink] = useState('https://doi.org/10.1016/j.');
  const [pubmedLink, setPubmedLink] = useState('');
  const [abstract, setAbstract] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !journal.trim()) return;

    const newPaper: ResearchPaper = {
      id: `res-${Date.now()}`,
      title: title.trim(),
      authors: authors.split(',').map((a) => a.trim()).filter(Boolean).length > 0
        ? authors.split(',').map((a) => a.trim()).filter(Boolean)
        : ['فريق باحثي منتدى أسيرا للبحث العلمي'],
      supervisorName: supervisorName.trim() || 'د. إبراهيم يحيى',
      field: field.trim(),
      journal: journal.trim(),
      publicationYear: Number(publicationYear) || 2026,
      doiLink: doiLink.trim() || 'https://doi.org/10.1000/182',
      pubmedLink: pubmedLink.trim() || undefined,
      abstract: abstract.trim() || 'دراسة بحثية علمية محكمة أنجزها باحثو منتدى أسيرا وفق المعايير الأكاديمية الدولية.',
      coverImageUrl: coverImageUrl.trim() || 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
      status: 'published',
      isFeatured: true,
      viewsCount: 150,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddResearch(newPaper);
    onClose();

    setTitle('');
    setAuthors('');
    setJournal('');
    setAbstract('');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '680px' }}>
        <button
          onClick={onClose}
          className="btn btn-ghost"
          style={{ position: 'absolute', top: '16px', left: '16px', padding: '0.4rem' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
          <div style={{ padding: '0.5rem', background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald-dark)', borderRadius: 'var(--radius-md)' }}>
            <FileText size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              إضافة بحث علمي منشور بالمعرض
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              توثيق ونشر أوراق طلاب وباحثي منتدى أسيرا المنشورة في المجلات الدولية المحكمة
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
              placeholder="E.g. Assessment of Clinical Practice Guidelines Adherence in Critical Care"
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
                placeholder="أحمد الصالح, ريم الحكيمي, عمر الدوسري"
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
                placeholder="د. إبراهيم يحيى"
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
                placeholder="European Journal of Clinical Investigation"
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
                رابط DOI الرقمي (Digital Object Identifier)
              </label>
              <input
                type="url"
                value={doiLink}
                onChange={(e) => setDoiLink(e.target.value)}
                placeholder="https://doi.org/10.1186/..."
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', direction: 'ltr', textAlign: 'left', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
                رابط البحث في PubMed (اختياري)
              </label>
              <input
                type="url"
                value={pubmedLink}
                onChange={(e) => setPubmedLink(e.target.value)}
                placeholder="https://pubmed.ncbi.nlm.nih.gov/..."
                style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', direction: 'ltr', textAlign: 'left', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--text-main)' }}>
              ملخص البحث الأكاديمي (Abstract)
            </label>
            <textarea
              rows={3}
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              placeholder="اكتب ملخصاً للدراسة يشمل الأهداف والمنهجية والنتائج الرئيسية..."
              style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-main)', fontSize: '0.88rem', fontFamily: 'var(--font-arabic)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">
              إلغاء
            </button>
            <button type="submit" className="btn btn-accent" style={{ padding: '0.65rem 1.5rem' }}>
              <Plus size={16} />
              <span>نشر الورقة البحثية بالمعرض</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
