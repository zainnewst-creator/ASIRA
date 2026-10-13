import React, { useState } from 'react';
import { Search, BookOpen, Award, Users, CheckCircle, ArrowLeft, Plus, Lock } from 'lucide-react';
import { INITIAL_COURSES, INITIAL_CURRICULA, MockCourseCurriculum } from '../data/mockData';
import { CourseCard } from '../components/CourseCard';
import { Course, UserRole } from '../types';
import { AddCourseModal } from '../components/AddCourseModal';

interface CoursesPageProps {
  courses?: Course[];
  curricula?: Record<string, MockCourseCurriculum>;
  currentUser?: { name: string; role: UserRole; email: string } | null;
  onAddCourse?: (course: Course) => void;
  onEnroll: (course: Course) => void;
  onSelectCourse: (course: Course) => void;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({ 
  courses = INITIAL_COURSES,
  curricula,
  currentUser,
  onAddCourse,
  onEnroll, 
  onSelectCourse 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseModal, setSelectedCourseModal] = useState<Course | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const isInstructorOrAdmin = currentUser?.role === 'instructor' || currentUser?.role === 'admin';

  const filteredCourses = courses.filter((course) =>
    course.title.includes(searchTerm) ||
    course.summary.includes(searchTerm) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem' }}>
      {/* الترويسة والبحث */}
      <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 3rem' }}>
        <span className="badge badge-primary" style={{ marginBottom: '0.75rem' }}>
          دليل البرامج الأكاديمية
        </span>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
          كورسات ودورات منتدى أسيرا
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: '1.7' }}>
          برامج تدريبية مكثفة مصممة خصيصاً لسد الفجوة بين التعليم الجامعي النظري والنشر العلمي الفعلي في المجلات الدولية.
        </p>

        {/* أزرار الإجراء والبحث المباشر */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '440px' }}>
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

          {/* محمي أمنياً: لا يظهر للعامة أو الطلاب إطلاقاً — للمشرفين والمديرين فقط */}
          {isInstructorOrAdmin && onAddCourse && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-primary"
              style={{ padding: '0.85rem 1.5rem', borderRadius: 'var(--radius-full)', fontSize: '0.92rem' }}
              title="صلاحية خاصة بالمشرفين والأدمن فقط"
              id="admin-add-course-btn"
            >
              <Plus size={16} />
              <span>إضافة كورس جديد (مشرف)</span>
            </button>
          )}
        </div>
      </div>

      {/* بطاقات الكورسات */}
      {filteredCourses.length > 0 ? (
        <div className="grid-3">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEnroll={onEnroll}
              onSelect={(c) => {
                setSelectedCourseModal(c);
                if (onSelectCourse) onSelectCourse(c);
              }}
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <BookOpen size={48} color="var(--text-subtle)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>لا توجد كورسات مطابقة لبحثك</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>جرب البحث بكلمات أخرى أو تصفح البرامج المتاحة.</p>
        </div>
      )}

      {/* نافذة تفاصيل الكورس والمقرر التفصيلي */}
      {selectedCourseModal && (() => {
        const isComingSoon = selectedCourseModal.status === 'coming_soon';
        const activeCurriculum = (curricula && curricula[selectedCourseModal.id]) || INITIAL_CURRICULA[selectedCourseModal.id];
        const dynamicModules = activeCurriculum?.modules || [];

        return (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(7, 13, 30, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}>
            <div className="card" style={{ maxWidth: '680px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
              <button
                onClick={() => setSelectedCourseModal(null)}
                className="btn btn-ghost"
                style={{ position: 'absolute', top: '12px', left: '12px' }}
              >
                ✕
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-primary">
                  كود الكورس: {selectedCourseModal.code}
                </span>
                {isComingSoon && (
                  <span className="badge" style={{ background: '#f59e0b', color: '#fff', fontWeight: 800 }}>
                    ⏳ قريباً - قيد الإعداد والإعلان
                  </span>
                )}
              </div>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                {selectedCourseModal.title}
              </h2>

              {/* إحصائيات الكورس والمسجلين */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', padding: '0.65rem 0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: isComingSoon ? 'var(--text-muted)' : 'var(--accent-emerald)', fontWeight: 700 }}>
                  <Users size={16} />
                  <span>
                    عدد الطلاب المسجلين: {isComingSoon ? '0 (التسجيل مغلق حالياً)' : `${selectedCourseModal.enrolledCount !== undefined ? selectedCourseModal.enrolledCount : 0} طالباً`}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                  <BookOpen size={15} color="var(--primary-600)" />
                  <span>{selectedCourseModal.totalLessonsCount} محاضرة ودرس</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                  <Award size={15} color="var(--accent-gold)" />
                  <span>درجة النجاح: {selectedCourseModal.passingScore}%</span>
                </div>
              </div>

              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '1.25rem' }}>
                {selectedCourseModal.description || selectedCourseModal.summary}
              </p>

              {/* تنبيه كورس قيد الإعداد */}
              {isComingSoon && (
                <div style={{ padding: '0.85rem 1rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #f59e0b', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#b45309' }}>
                  <Lock size={20} style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.92rem' }}>مسار أكاديمي قيد الإعداد والإعلان</strong>
                    <span style={{ fontSize: '0.82rem' }}>
                      هذا المسار التدريبي قيد التجهيز من قبل العمادة. سيتم فتح باب التسجيل فور الإطلاق الرسمي، ولا يمكن التقديم حالياً.
                    </span>
                  </div>
                </div>
              )}

              {/* المحاور التدريبية التلقائية المستخرجة من مديولات الكورس */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                    محاور ومكونات المنهج (Syllabus Modules):
                  </h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    مستخرجة تلقائياً من وحدات الكورس
                  </span>
                </div>

                {dynamicModules.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {dynamicModules.map((mod, idx) => (
                      <div
                        key={mod.id || idx}
                        style={{
                          padding: '0.65rem 0.85rem',
                          background: 'var(--bg-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <CheckCircle size={16} color="var(--accent-emerald)" />
                          <strong style={{ fontSize: '0.88rem' }}>{mod.title}</strong>
                        </div>
                        <div style={{ display: 'flex', gap: '0.4rem', fontSize: '0.75rem' }}>
                          <span className="badge badge-primary">{mod.lessons?.length || 0} درس</span>
                          {mod.assignments && mod.assignments.length > 0 && (
                            <span className="badge badge-gold">{mod.assignments.length} تكليف</span>
                          )}
                          {mod.exams && mod.exams.length > 0 && (
                            <span className="badge badge-emerald">{mod.exams.length} اختبار</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedCourseModal.syllabusSummary?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <CheckCircle size={16} color="var(--accent-emerald)" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <button onClick={() => setSelectedCourseModal(null)} className="btn btn-outline">
                  إغلاق
                </button>
                {isComingSoon ? (
                  <button
                    disabled
                    className="btn btn-outline"
                    style={{ opacity: 0.65, cursor: 'not-allowed', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    <Lock size={15} />
                    <span>التسجيل مغلق حالياً (قريباً)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const course = selectedCourseModal;
                      setSelectedCourseModal(null);
                      onEnroll(course);
                    }}
                    className="btn btn-primary"
                  >
                    <span>طلب الالتحاق بالدورة الآن</span>
                    <ArrowLeft size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* نافذة إضافة كورس جديد */}
      {onAddCourse && (
        <AddCourseModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddCourse={onAddCourse}
        />
      )}
    </div>
  );
};
