import React, { useState } from 'react';
import { Search, Filter, BookOpen, Clock, Award, Users, CheckCircle, ArrowLeft } from 'lucide-react';
import { INITIAL_COURSES } from '../data/mockData';
import { CourseCard } from '../components/CourseCard';
import { Course } from '../types';

interface CoursesPageProps {
  onEnroll: (course: Course) => void;
  onSelectCourse: (course: Course) => void;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({ onEnroll, onSelectCourse }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseModal, setSelectedCourseModal] = useState<Course | null>(null);

  const filteredCourses = INITIAL_COURSES.filter((course) =>
    course.title.includes(searchTerm) ||
    course.summary.includes(searchTerm) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem' }}>
      {/* الترويسة والبحث */}
      <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem' }}>
        <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
          دليل البرامج الأكاديمية
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
          كورسات ودورات منتدى أسيرا
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.7' }}>
          برامج تدريبية مكثفة مصممة خصيصاً لسد الفجوة بين التعليم الجامعي النظري والنشر العلمي الفعلي في المجلات الدولية.
        </p>

        {/* شريط البحث المباشر */}
        <div style={{ marginTop: '2rem', position: 'relative', maxWidth: '500px', margin: '2rem auto 0' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث عن اسم الكورس أو الرمز (مثال: RES-101)..."
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
      </div>

      {/* شبكة الكورسات */}
      <div className="grid-3">
        {filteredCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onSelect={(c) => setSelectedCourseModal(c)}
            onEnroll={onEnroll}
          />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.1rem' }}>لا توجد دورات مطابقة لبحثك في الوقت الحالي.</p>
        </div>
      )}

      {/* نافذة التفاصيل التفصيلية للكورس (Course Details Modal) */}
      {selectedCourseModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1.5rem',
        }}>
          <div className="card" style={{ maxWidth: '750px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span className="badge badge-primary">{selectedCourseModal.code}</span>
              <button
                onClick={() => setSelectedCourseModal(null)}
                className="btn btn-ghost"
                style={{ fontSize: '1.2rem', padding: '0.2rem 0.6rem' }}
              >
                ✕
              </button>
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
              {selectedCourseModal.title}
            </h2>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '1.5rem' }}>
              {selectedCourseModal.description}
            </p>

            {/* محاور الدورة (Syllabus) */}
            {selectedCourseModal.syllabusSummary && (
              <div style={{ marginBottom: '1.75rem' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                  محاور وخطة الدورة التفصيلية:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {selectedCourseModal.syllabusSummary.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '0.65rem 1rem',
                        background: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <CheckCircle size={16} color="var(--primary-600)" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* تفاصيل القبول والشهادة */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div>
                <strong>الدروس والمحاضرات:</strong> {selectedCourseModal.totalLessonsCount} درس
              </div>
              <div>
                <strong>نسبة النجاح المطلوبة:</strong> {selectedCourseModal.passingScore}%
              </div>
              <div>
                <strong>تاريخ البداية:</strong> {selectedCourseModal.startDate}
              </div>
              <div>
                <strong>المشرفون:</strong> {selectedCourseModal.instructorNames?.join('، ')}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedCourseModal(null)}
                className="btn btn-outline"
              >
                إغلاق
              </button>
              <button
                onClick={() => {
                  const c = selectedCourseModal;
                  setSelectedCourseModal(null);
                  onEnroll(c);
                }}
                className="btn btn-primary"
              >
                <span>طلب الالتحاق بالدورة</span>
                <ArrowLeft size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
