import React, { useState } from 'react';
import { Search, Filter, BookOpen, ExternalLink, Award, FileCheck } from 'lucide-react';
import { INITIAL_RESEARCHES } from '../data/mockData';
import { ResearchCard } from '../components/ResearchCard';

export const ResearchPage: React.FC = () => {
  const [selectedField, setSelectedField] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fields = ['all', 'طب بشري وباطنة', 'طب الأطفال والصيدلة السريرية', 'التعليم الطبي والمنهجية'];

  const filteredPapers = INITIAL_RESEARCHES.filter((paper) => {
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

        {/* فلاتر التخصص وشريط البحث */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '2.5rem' }}>
          <div style={{ position: 'relative', maxWidth: '550px', margin: '0 auto', width: '100%' }}>
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

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {fields.map((f) => (
              <button
                key={f}
                onClick={() => setSelectedField(f)}
                className={`btn ${selectedField === f ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.85rem', padding: '0.45rem 1rem', borderRadius: 'var(--radius-full)' }}
              >
                {f === 'all' ? 'جميع التخصصات' : f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* بطاقات الأبحاث */}
      <div className="grid-3">
        {filteredPapers.map((paper) => (
          <ResearchCard key={paper.id} paper={paper} />
        ))}
      </div>

      {filteredPapers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.1rem' }}>لا توجد أبحاث مطابقة لمعايير البحث في هذا التخصص حالياً.</p>
        </div>
      )}
    </div>
  );
};
