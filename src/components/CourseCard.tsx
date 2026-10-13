import React from 'react';
import { BookOpen, Users, Award, CheckCircle, ArrowLeft, Lock } from 'lucide-react';
import { Course } from '../types';

interface CourseCardProps {
  course: Course;
  onSelect: (course: Course) => void;
  onEnroll: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onSelect, onEnroll }) => {
  const isComingSoon = course.status === 'coming_soon';

  return (
    <article className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* صورة الغلاف */}
      <div style={{ height: '180px', width: 'calc(100% + 3rem)', margin: '-1.5rem -1.5rem 1.25rem', overflow: 'hidden', position: 'relative' }}>
        <img 
          src={course.coverUrl} 
          alt={course.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
        />
        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span className="badge badge-primary" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)', fontWeight: 700 }}>
            {course.code}
          </span>
          {isComingSoon && (
            <span className="badge" style={{ background: '#f59e0b', color: '#fff', fontWeight: 800, boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>
              ⏳ قريباً
            </span>
          )}
        </div>
      </div>

      {/* عنوان الكورس ووصفه الموجز */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: '1.35', marginBottom: '0.6rem', color: 'var(--text-main)' }}>
        {course.title}
      </h3>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.25rem', flexGrow: 1 }}>
        {course.summary}
      </p>

      {/* المدرس والدروس والمسجلين */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <BookOpen size={15} color="var(--primary-600)" />
          <span>{course.totalLessonsCount} درساً ومحاضرة</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Users size={15} color={isComingSoon ? "var(--text-muted)" : "var(--accent-emerald)"} />
          <span>
            {isComingSoon 
              ? 'التسجيل مغلق (قيد الإعداد)' 
              : `${course.enrolledCount !== undefined ? course.enrolledCount : 0} طالباً مسجلاً`}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Award size={15} color="var(--accent-gold)" />
          <span>نسبة النجاح: {course.passingScore}%</span>
        </div>
      </div>

      {/* مميزات سريعة */}
      {course.features && course.features.length > 0 && (
        <ul style={{ listStyle: 'none', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {course.features.slice(0, 2).map((feat, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckCircle size={14} color={isComingSoon ? "#f59e0b" : "#10b981"} />
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      )}

      {/* أزرار الإجراءات */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
        {isComingSoon ? (
          <button
            disabled
            className="btn btn-outline"
            style={{
              flex: 1,
              padding: '0.55rem 0.75rem',
              opacity: 0.65,
              cursor: 'not-allowed',
              color: 'var(--text-muted)',
              borderColor: 'var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
            title="هذا الكورس قيد الإعداد والإعلان قريباً، التسجيل مغلق حالياً"
          >
            <Lock size={15} />
            <span>قريباً (التسجيل مغلق)</span>
          </button>
        ) : (
          <button
            onClick={() => onEnroll(course)}
            className="btn btn-primary"
            style={{ flex: 1, padding: '0.55rem 1rem' }}
          >
            <span>طلب الالتحاق</span>
            <ArrowLeft size={16} />
          </button>
        )}
        <button
          onClick={() => onSelect(course)}
          className="btn btn-outline"
          style={{ padding: '0.55rem 1rem' }}
        >
          <span>التفاصيل</span>
        </button>
      </div>
    </article>
  );
};
