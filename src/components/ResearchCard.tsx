import React from 'react';
import { ExternalLink, BookOpen, Calendar, User, Eye, CheckCircle2, Edit3 } from 'lucide-react';
import { ResearchPaper } from '../types';

interface ResearchCardProps {
  paper: ResearchPaper;
  isInstructorOrAdmin?: boolean;
  onEdit?: (paper: ResearchPaper) => void;
}

export const ResearchCard: React.FC<ResearchCardProps> = ({ 
  paper,
  isInstructorOrAdmin,
  onEdit,
}) => {
  return (
    <article className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* صورة الغلاف إن وجدت أو شارة البحث */}
      {paper.coverImageUrl && (
        <div style={{ height: '160px', width: 'calc(100% + 3rem)', margin: '-1.5rem -1.5rem 1.25rem', overflow: 'hidden', position: 'relative' }}>
          <img 
            src={paper.coverImageUrl} 
            alt={paper.title} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
          <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="badge badge-emerald" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)' }}>
              <CheckCircle2 size={13} color="#059669" /> بحث منشور دولياً
            </span>
          </div>
          {isInstructorOrAdmin && onEdit && (
            <button
              onClick={() => onEdit(paper)}
              className="btn btn-outline"
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                background: 'rgba(255,255,255,0.92)',
                color: 'var(--text-main)',
                backdropFilter: 'blur(4px)',
                borderRadius: 'var(--radius-sm)',
              }}
              title="تعديل تفاصيل الورقة البحثية وصورة الغلاف"
            >
              <Edit3 size={13} />
              <span>تعديل الصورة</span>
            </button>
          )}
        </div>
      )}

      {/* المجال وسنة النشر */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span className="badge badge-primary">{paper.field}</span>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-subtle)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          <Calendar size={13} /> {paper.publicationYear}
        </span>
      </div>

      {/* عنوان البحث العلمي */}
      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: '1.45', marginBottom: '0.75rem', color: 'var(--text-main)', direction: 'ltr', textAlign: 'left' }}>
        {paper.title}
      </h3>

      {/* المجلة المنشور فيها */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-600)', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.75rem', direction: 'ltr', textAlign: 'left' }}>
        <BookOpen size={15} />
        <span>{paper.journal}</span>
      </div>

      {/* المؤلفون والمشرف */}
      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.25rem' }}>
          <User size={14} color="var(--primary-500)" />
          <span><strong>فريق الباحثين:</strong> {paper.authors.join('، ')}</span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
          إشراف: {paper.supervisorName}
        </div>
      </div>

      {/* ملخص البحث */}
      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.25rem', flexGrow: 1 }}>
        {paper.abstract}
      </p>

      {/* روابط النشر والـ DOI */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
        {paper.doiLink && (
          <a
            href={paper.doiLink}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline"
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
          >
            <ExternalLink size={14} />
            <span>رابط الـ DOI</span>
          </a>
        )}
        {paper.pubmedLink && (
          <a
            href={paper.pubmedLink}
            target="_blank"
            rel="noreferrer"
            className="btn btn-ghost"
            style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem', color: 'var(--primary-600)' }}
          >
            <span>PubMed</span>
            <ExternalLink size={13} />
          </a>
        )}
        {paper.viewsCount && (
          <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
            <Eye size={14} />
            <span>{paper.viewsCount} قراءة</span>
          </div>
        )}
      </div>
    </article>
  );
};
