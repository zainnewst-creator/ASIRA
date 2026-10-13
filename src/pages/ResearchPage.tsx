import React, { useState } from 'react';
import { Search, FileCheck, Plus } from 'lucide-react';
import { INITIAL_RESEARCHES } from '../data/mockData';
import { ResearchCard } from '../components/ResearchCard';
import { ResearchPaper } from '../types';
import { AddResearchModal } from '../components/AddResearchModal';
import { EditResearchModal } from '../components/EditResearchModal';

interface ResearchPageProps {
  researches?: ResearchPaper[];
  currentUser?: { name: string; role: string; email: string } | null;
  onAddResearch?: (research: ResearchPaper) => void;
  onUpdateResearch?: (research: ResearchPaper) => void;
  onDeleteResearch?: (id: string) => void;
}

export const ResearchPage: React.FC<ResearchPageProps> = ({ 
  researches = INITIAL_RESEARCHES,
  currentUser,
  onAddResearch,
  onUpdateResearch,
  onDeleteResearch,
}) => {
  const [selectedField, setSelectedField] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState<ResearchPaper | null>(null);

  const isInstructorOrAdmin = currentUser?.role === 'instructor' || currentUser?.role === 'admin';

  const fields = ['all', 'طب بشري وباطنة', 'طب الأطفال والصيدلة السريرية', 'التعليم الطبي والمنهجية'];

  const filteredPapers = researches.filter((paper) => {
    const matchesField = selectedField === 'all' || paper.field === selectedField;
    const matchesSearch =
      paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.journal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.authors.some((author) => author.includes(searchTerm));
    return matchesField && matchesSearch;
  });

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem' }}>
      {/* الترويسة */}
      <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3rem' }}>
        <span className="badge badge-emerald" style={{ marginBottom: '0.75rem' }}>
          معرض الأبحاث المنشورة (Research Showcase)
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
          أبحاث ومشاريع طلاب منتدى أسيرا
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.7' }}>
          أوراق بحثية أصلية ومراجعات منهجية أعدها طلاب وخريجو منتدى أسيرا تحت إشراف نخبة من الأكاديميين ونُشرت في مجلات عالمية مفهرسة في Web of Science و Scopus و PubMed.
        </p>

        {/* فلاتر التخصص وشريط البحث وأزرار الإضافة */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '440px' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث بالعنوان، اسم الباحث، أو المجلة العلمية..."
                style={{
                  width: '100%',
                  padding: '0.85rem 3rem 0.85rem 1.25rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontFamily: 'var(--font-arabic)',
                  fontSize: '0.95rem',
                  boxShadow: 'var(--shadow-sm)',
                  outline: 'none',
                }}
              />
              <Search
                size={19}
                color="var(--text-subtle)"
                style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>

            {/* محمي أمنياً: للمشرفين والمديرين فقط */}
            {isInstructorOrAdmin && onAddResearch && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn btn-accent"
                style={{ padding: '0.85rem 1.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.92rem' }}
                title="صلاحية خاصة بالمشرفين والأدمن فقط"
                id="admin-add-research-btn"
              >
                <Plus size={16} />
                <span>إضافة بحث منشور (مشرف)</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {fields.map((field) => (
              <button
                key={field}
                onClick={() => setSelectedField(field)}
                className={`btn ${selectedField === field ? 'btn-primary' : 'btn-ghost'}`}
                style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}
              >
                {field === 'all' ? 'جميع التخصصات' : field}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* بطاقات الأبحاث */}
      {filteredPapers.length > 0 ? (
        <div className="grid-3">
          {filteredPapers.map((paper) => (
            <ResearchCard
              key={paper.id}
              paper={paper}
              isInstructorOrAdmin={isInstructorOrAdmin}
              onEdit={(p) => setEditingPaper(p)}
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <FileCheck size={48} color="var(--text-subtle)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>لا توجد أبحاث منشورة مطابقة للبحث</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>جرب اختيار تخصص آخر أو البحث باسم باحث آخر.</p>
        </div>
      )}

      {/* نافذة إضافة بحث منشور */}
      {onAddResearch && (
        <AddResearchModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddResearch={onAddResearch}
        />
      )}

      {/* نافذة تعديل تفاصيل وصورة البحث المنشور */}
      {editingPaper && onUpdateResearch && (
        <EditResearchModal
          isOpen={Boolean(editingPaper)}
          paper={editingPaper}
          onClose={() => setEditingPaper(null)}
          onUpdateResearch={onUpdateResearch}
          onDeleteResearch={onDeleteResearch}
        />
      )}
    </div>
  );
};
