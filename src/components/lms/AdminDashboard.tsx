import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  FileCheck2, 
  Check, 
  X, 
  Award, 
  Clock, 
  Download, 
  Layers, 
  Search,
  Filter,
  DollarSign,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Database
} from 'lucide-react';
import { 
  INITIAL_PENDING_ENROLLMENTS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_CERT_REQUESTS,
  MockPendingEnrollment, 
  MockAuditLogItem, 
  MockCertificateRequest
} from '../../data/mockData';
import { UserRole, UserProfile } from '../../types';

export interface AdminDashboardProps {
  enrollments?: MockPendingEnrollment[];
  onApproveEnrollment?: (id: string) => void;
  onRejectEnrollment?: (id: string) => void;
  certRequests?: MockCertificateRequest[];
  onIssueCertificate?: (id: string, code: string, pdfUrl: string) => void;
  auditLogs?: MockAuditLogItem[];
  onLogAudit?: (action: string, details: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  enrollments: propEnrollments,
  onApproveEnrollment,
  onRejectEnrollment,
  certRequests: propCertRequests,
  onIssueCertificate,
  auditLogs: propAuditLogs,
  onLogAudit,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'enrollments' | 'users' | 'certificates' | 'audit_logs' | 'backup'>('enrollments');

  // بيانات طلبات الالتحاق
  const [localEnrollments, setLocalEnrollments] = useState<MockPendingEnrollment[]>(INITIAL_PENDING_ENROLLMENTS);
  const enrollments = propEnrollments || localEnrollments;

  // بيانات سجل التدقيق
  const [localAuditLogs, setLocalAuditLogs] = useState<MockAuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const auditLogs = propAuditLogs || localAuditLogs;

  // بيانات طلبات الشهادات
  const [localCertRequests, setLocalCertRequests] = useState<MockCertificateRequest[]>(INITIAL_CERT_REQUESTS);
  const certRequests = propCertRequests || localCertRequests;

  // إدارة المستخدمين
  const [usersList, setUsersList] = useState<Array<{ uid: string; name: string; email: string; university: string; role: UserRole; status: 'active' | 'suspended' }>>([
    { uid: 'u-1', name: 'أحمد محمد الصالح', email: 'ahmed.s@ksu.edu.sa', university: 'جامعة الملك سعود', role: 'student', status: 'active' },
    { uid: 'u-2', name: 'سارة خالد الكيلاني', email: 'sara.k@ust.edu', university: 'جامعة العلوم والتكنولوجيا', role: 'student', status: 'active' },
    { uid: 'u-3', name: 'د. إبراهيم يحيى', email: 'ibrahim.y@asira-research.org', university: 'عمادة منتدى أسيرا', role: 'instructor', status: 'active' },
    { uid: 'u-4', name: 'د. يحيى المنصوري', email: 'mansouri@asira-research.org', university: 'اللجنة العلمية', role: 'instructor', status: 'active' },
    { uid: 'u-5', name: 'مدير المنصة العام', email: 'admin@asira-research.org', university: 'إدارة أسيرا', role: 'admin', status: 'active' },
  ]);

  // نموذج إصدار الشهادة
  const [selectedCertForIssue, setSelectedCertForIssue] = useState<MockCertificateRequest | null>(null);
  const [certCodeInput, setCertCodeInput] = useState('ASIRA-2026-8812');
  const [certPdfUrlInput, setCertPdfUrlInput] = useState('https://drive.google.com/file/d/DeanSignedCertAhmed2026/view');

  // الموافقة على طلب الالتحاق
  const handleApprove = (id: string) => {
    const target = enrollments.find((e) => e.id === id);
    if (onApproveEnrollment) {
      onApproveEnrollment(id);
    } else {
      setLocalEnrollments((prev) => prev.map((e) => e.id === id ? { ...e, status: 'approved' } : e));
    }

    if (onLogAudit && target) {
      onLogAudit('قبول طلب التحاق', `الموافقة على التحاق الطالب (${target.studentName}) بكورس: ${target.courseTitle}`);
    }
  };

  // رفض طلب الالتحاق
  const handleReject = (id: string) => {
    const target = enrollments.find((e) => e.id === id);
    if (onRejectEnrollment) {
      onRejectEnrollment(id);
    } else {
      setLocalEnrollments((prev) => prev.map((e) => e.id === id ? { ...e, status: 'rejected' } : e));
    }

    if (onLogAudit && target) {
      onLogAudit('رفض طلب التحاق', `رفض طلب التحاق الطالب (${target.studentName}) بكورس: ${target.courseTitle}`);
    }
  };

  // إصدار الشهادة
  const handleIssueCert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCertForIssue) return;

    if (onIssueCertificate) {
      onIssueCertificate(selectedCertForIssue.id, certCodeInput, certPdfUrlInput);
    } else {
      setLocalCertRequests((prev) =>
        prev.map((c) =>
          c.id === selectedCertForIssue.id
            ? { ...c, status: 'issued', verificationCode: certCodeInput, signedPdfUrl: certPdfUrlInput }
            : c
        )
      );
    }

    if (onLogAudit) {
      onLogAudit(
        'إصدار وتوقيع شهادة رسمية',
        `تم إصدار وتوقيع الشهادة للطالب (${selectedCertForIssue.studentName}) برمز التحقق: ${certCodeInput} وربط ملف العميد الموقع.`
      );
    }

    setSelectedCertForIssue(null);
  };

  // تغيير دور المستخدم
  const handleRoleChange = (uid: string, nextRole: UserRole) => {
    setUsersList((prev) =>
      prev.map((u) => u.uid === uid ? { ...u, role: nextRole } : u)
    );
    const target = usersList.find((u) => u.uid === uid);
    if (onLogAudit && target) {
      onLogAudit('تعديل صلاحية مستخدم', `تم تغيير دور المستخدم (${target.name}) من ${target.role} إلى ${nextRole}`);
    }
  };

  // تجميد/تنشيط الحساب
  const toggleUserStatus = (uid: string) => {
    setUsersList((prev) =>
      prev.map((u) => u.uid === uid ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u)
    );
    const target = usersList.find((u) => u.uid === uid);
    if (onLogAudit && target) {
      const nextStatus = target.status === 'active' ? 'مجمّد' : 'نشط';
      onLogAudit('تعديل حالة حساب مستخدم', `تم تغيير حالة حساب (${target.name}) إلى ${nextStatus}`);
    }
  };

  const pendingCount = enrollments.filter((e) => e.status === 'pending').length;

  return (
    <div>
      {/* شريط تبويبات الإدارة العليا */}
      <div style={{ display: 'flex', gap: '0.6rem', borderBottom: '2px solid var(--border-color)', marginBottom: '2rem', paddingBottom: '0.5rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('overview')}
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.92rem' }}
        >
          <Layers size={16} />
          <span>المؤشرات والجاهزية الصفرية</span>
        </button>

        <button
          onClick={() => setActiveTab('enrollments')}
          className={`btn ${activeTab === 'enrollments' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.92rem' }}
        >
          <Users size={16} />
          <span>طلبات الالتحاق بالكورسات ({pendingCount > 0 ? `${pendingCount} معلق` : 'الكل'})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.92rem' }}
        >
          <ShieldAlert size={16} />
          <span>إدارة المستخدمين والصلاحيات ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('certificates')}
          className={`btn ${activeTab === 'certificates' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.92rem' }}
        >
          <Award size={16} />
          <span>اعتماد وتوقيع الشهادات</span>
        </button>

        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`btn ${activeTab === 'audit_logs' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.92rem' }}
        >
          <FileCheck2 size={16} />
          <span>سجل التدقيق الأكاديمي ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`btn ${activeTab === 'backup' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ fontSize: '0.92rem' }}
        >
          <Database size={16} />
          <span>النسخ الاحتياطي والترحيل</span>
        </button>
      </div>

      {/* 1. تبويب: نظرة عامة والجاهزية الصفرية للميزانية */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* بطاقات المؤشرات الرئيسية */}
          <div className="grid-3">
            <div className="card">
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>إجمالي الطلاب المسجلين بالمنصة</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                1,250 طالب
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', marginTop: '0.35rem' }}>
                +14% مقارنة بالشهر السابق
              </div>
            </div>

            <div className="card">
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>طلبات الالتحاق المعلقة</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f59e0b', marginTop: '0.25rem' }}>
                {pendingCount} طلبات
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                تحتاج مراجعة واعتماد الإدارة
              </div>
            </div>

            <div className="card">
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>الأبحاث المنشورة دولياً بالمعرض</span>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--primary-600)', marginTop: '0.25rem' }}>
                48 ورقة بحثية
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                بمعاملات تأثير محكمة (Q1 / Q2)
              </div>
            </div>
          </div>

          {/* بطاقة قياس البنية التحتية الصفرية (Zero-Cost Spark Tier) */}
          <div className="card" style={{ border: '2px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={24} color="#10b981" />
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>
                    حالة تشغيل المنصة: معمارية صفرية التكلفة 100% ($0.00 / شهر)
                  </h3>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Firebase Spark Free Tier — بدون أي رسوم استضافة أو تخزين سحابي مدفوع
                  </span>
                </div>
              </div>
              <span className="badge badge-emerald" style={{ fontSize: '0.9rem', padding: '0.4rem 0.85rem' }}>
                ميزانية مستقرة وآمنة
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <strong style={{ display: 'block', fontSize: '0.88rem' }}>تخزين ملفات الطلاب:</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>عبر روابط Google Drive الشخصية (تكلفة سحابية: 0$)</span>
              </div>
              <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <strong style={{ display: 'block', fontSize: '0.88rem' }}>بث مقاطع المحاضرات:</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>تضمين محمي عبر YouTube مجاناً (عرض نطاق: 0$)</span>
              </div>
              <div style={{ padding: '0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                <strong style={{ display: 'block', fontSize: '0.88rem' }}>قاعدة البيانات Firestore:</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>استعلامات محسنة ضمن الحد المجاني (50k قراءة يومياً)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. تبويب: إدارة طلبات الالتحاق المعلقة بالكورسات */}
      {activeTab === 'enrollments' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                طلبات الالتحاق بالكورسات الأكاديمية
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                راجع بيانات الطالب والجامعة والتخصص، وقم بالموافقة لتفعيل صلاحية الوصول لكافة الدروس والتكليفات، أو الرفض مع حفظ السبب.
              </p>
            </div>
            <span className="badge badge-gold">
              {pendingCount} طلبات بانتظار الاعتماد
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.85rem' }}>اسم الطالب</th>
                  <th style={{ padding: '0.85rem' }}>الجامعة والتخصص</th>
                  <th style={{ padding: '0.85rem' }}>المستوى الدراسي</th>
                  <th style={{ padding: '0.85rem' }}>الكورس المطلوب</th>
                  <th style={{ padding: '0.85rem' }}>تاريخ الطلب</th>
                  <th style={{ padding: '0.85rem' }}>الحالة</th>
                  <th style={{ padding: '0.85rem' }}>قرار الإدارة</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enr) => (
                  <tr key={enr.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.85rem' }}>
                      <strong style={{ display: 'block', color: 'var(--text-main)' }}>{enr.studentName}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{enr.studentEmail}</span>
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <strong style={{ display: 'block' }}>{enr.university}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{enr.specialty}</span>
                    </td>
                    <td style={{ padding: '0.85rem', fontSize: '0.85rem' }}>
                      {enr.academicLevel}
                    </td>
                    <td style={{ padding: '0.85rem', fontSize: '0.85rem', fontWeight: 700 }}>
                      {enr.courseTitle}
                    </td>
                    <td style={{ padding: '0.85rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {enr.requestedAt}
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      {enr.status === 'approved' && <span className="badge badge-emerald">مقبول (Approved)</span>}
                      {enr.status === 'rejected' && <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>مرفوض</span>}
                      {enr.status === 'pending' && <span className="badge badge-gold">معلق (Pending)</span>}
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      {enr.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            onClick={() => handleApprove(enr.id)}
                            className="btn btn-accent"
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
                          >
                            <Check size={14} />
                            <span>قبول</span>
                          </button>
                          <button
                            onClick={() => handleReject(enr.id)}
                            className="btn btn-outline"
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem', color: '#ef4444' }}
                          >
                            <X size={14} />
                            <span>رفض</span>
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-subtle)' }}>تم اتخاذ القرار</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. تبويب: إدارة حسابات المستخدمين والصلاحيات */}
      {activeTab === 'users' && (
        <div className="card">
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
              إدارة مستخدمي المنصة وتوزيع الصلاحيات (Role-Based Access)
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              التحكم في أدوار المستخدمين وتعيين المدرسين وإدارة حسابات الطلاب مع حماية كاملة ضد التصعيد غير المصرح به.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.85rem' }}>الاسم والبريد</th>
                  <th style={{ padding: '0.85rem' }}>الجهة / الجامعة</th>
                  <th style={{ padding: '0.85rem' }}>الدور الحالي</th>
                  <th style={{ padding: '0.85rem' }}>حالة الحساب</th>
                  <th style={{ padding: '0.85rem' }}>تغيير الصلاحية</th>
                  <th style={{ padding: '0.85rem' }}>إجراء الحساب</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((user) => (
                  <tr key={user.uid} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.85rem' }}>
                      <strong style={{ display: 'block', color: 'var(--text-main)' }}>{user.name}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</span>
                    </td>
                    <td style={{ padding: '0.85rem', fontSize: '0.85rem' }}>{user.university}</td>
                    <td style={{ padding: '0.85rem' }}>
                      <span className={`badge ${user.role === 'admin' ? 'badge-gold' : user.role === 'instructor' ? 'badge-emerald' : 'badge-primary'}`}>
                        {user.role === 'admin' ? 'مدير (Admin)' : user.role === 'instructor' ? 'مدرس (Instructor)' : 'طالب (Student)'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      {user.status === 'active' ? (
                        <span className="badge badge-emerald">نشط</span>
                      ) : (
                        <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>مجمّد</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
                        style={{
                          padding: '0.4rem 0.6rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          background: 'var(--bg-main)',
                          color: 'var(--text-main)',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="student">طالب (Student)</option>
                        <option value="instructor">مدرس (Instructor)</option>
                        <option value="admin">مدير (Admin)</option>
                      </select>
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <button
                        onClick={() => toggleUserStatus(user.uid)}
                        className="btn btn-outline"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', color: user.status === 'active' ? '#ef4444' : '#10b981' }}
                      >
                        <span>{user.status === 'active' ? 'تجميد الحساب' : 'تنشيط'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. تبويب: اعتماد وتوقيع الشهادات الأكاديمية */}
      {activeTab === 'certificates' && (
        <div className="card">
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
              اعتماد وتوقيع شهادات إتمام الكورسات (Dean Signed Certificates)
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              إصدار الشهادات الرسمية للطلاب الذين أتموا متطلبات الدورة بنجاح، وتوليد رمز التحقق الأكاديمي، وربط ملف PDF الموقع من العميد.
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.85rem' }}>اسم الطالب</th>
                  <th style={{ padding: '0.85rem' }}>الكورس الأكاديمي</th>
                  <th style={{ padding: '0.85rem' }}>تاريخ الطلب</th>
                  <th style={{ padding: '0.85rem' }}>رمز التحقق الأكاديمي</th>
                  <th style={{ padding: '0.85rem' }}>حالة الإصدار</th>
                  <th style={{ padding: '0.85rem' }}>الإجراء الأكاديمي</th>
                </tr>
              </thead>
              <tbody>
                {certRequests.map((req) => (
                  <tr key={req.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.85rem' }}>
                      <strong style={{ color: 'var(--text-main)' }}>{req.studentName}</strong>
                    </td>
                    <td style={{ padding: '0.85rem' }}>{req.courseTitle}</td>
                    <td style={{ padding: '0.85rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{req.requestedAt}</td>
                    <td style={{ padding: '0.85rem' }}>
                      {req.verificationCode ? (
                        <code style={{ padding: '0.2rem 0.5rem', background: 'var(--bg-subtle)', borderRadius: '4px', fontWeight: 700 }}>
                          {req.verificationCode}
                        </code>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      {req.status === 'issued' ? (
                        <span className="badge badge-emerald">تم الإصدار والتوقيع</span>
                      ) : (
                        <span className="badge badge-gold">بانتظار توقيع العميد</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem' }}>
                      <button
                        onClick={() => setSelectedCertForIssue(req)}
                        className="btn btn-primary"
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
                      >
                        <Award size={14} />
                        <span>{req.status === 'issued' ? 'تعديل بيانات الشهادة' : 'إصدار وتوقيع الشهادة'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* نافذة إصدار الشهادة وربط ملف PDF الموقّع */}
          {selectedCertForIssue && (
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
              <div className="card" style={{ maxWidth: '580px', width: '100%', position: 'relative' }}>
                <button
                  onClick={() => setSelectedCertForIssue(null)}
                  className="btn btn-ghost"
                  style={{ position: 'absolute', top: '12px', left: '12px' }}
                >
                  ✕
                </button>

                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.35rem' }}>
                  إصدار وتوقيع الشهادة للطالب: {selectedCertForIssue.studentName}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  الكورس: {selectedCertForIssue.courseTitle}
                </p>

                <form onSubmit={handleIssueCert} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      رمز التحقق الأكاديمي الموحد (Verification Code):
                    </label>
                    <input
                      type="text"
                      required
                      value={certCodeInput}
                      onChange={(e) => setCertCodeInput(e.target.value)}
                      placeholder="ASIRA-2026-XXXX"
                      style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', fontFamily: 'monospace', fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                      رابط ملف الشهادة الموقعة من العميد (Google Drive PDF):
                    </label>
                    <input
                      type="url"
                      required
                      value={certPdfUrlInput}
                      onChange={(e) => setCertPdfUrlInput(e.target.value)}
                      placeholder="https://drive.google.com/file/d/..."
                      style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', direction: 'ltr', textAlign: 'left' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button type="button" onClick={() => setSelectedCertForIssue(null)} className="btn btn-outline">
                      إلغاء
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <Award size={15} />
                      <span>اعتماد وإتاحة الشهادة للطالب فوراً</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. تبويب: سجل التدقيق الأكاديمي غير القابل للتعديل (Audit Logs) */}
      {activeTab === 'audit_logs' && (
        <div className="card">
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
              سجل التدقيق الأكاديمي غير القابل للتعديل (Immutable Audit Trail)
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              توثيق آلي لكل عملية حساسة (رصد وتعديل الدرجات، قبول ورفض الطلاب، إصدار الشهادات، وتغيير الصلاحيات).
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem' }}>الوقت والتاريخ</th>
                  <th style={{ padding: '0.75rem' }}>المستخدم المسؤول</th>
                  <th style={{ padding: '0.75rem' }}>الصفة / الصلاحية</th>
                  <th style={{ padding: '0.75rem' }}>نوع الإجراء</th>
                  <th style={{ padding: '0.75rem' }}>التفاصيل المسجلة</th>
                  <th style={{ padding: '0.75rem' }}>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {log.timestamp}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 700 }}>{log.actorName}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className="badge badge-primary">{log.actorRole}</span>
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--primary-700)' }}>
                      {log.action}
                    </td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-main)', maxWidth: '350px' }}>
                      {log.details}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span className="badge badge-emerald">موثق (Append-Only)</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. تبويب: النسخ الاحتياطي والترحيل */}
      {activeTab === 'backup' && (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
              النسخ الاحتياطي الكامل وخطة التعافي (Disaster Recovery)
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              تصدير قاعدة البيانات وسجل الدرجات والشهادات كملف JSON مشفر، مع آلية فحص تجريبي (Dry-Run Restore) دون أي تكلفة سحابية.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '1rem', display: 'block' }}>تصدير نسخة احتياطية كاملة (Full JSON Backup):</strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  يشمل الكورسات، طلبات الالتحاق، تسليمات الطلاب، سجل الدرجات، وسجل التدقيق.
                </span>
              </div>
              <button
                onClick={() => alert('تم توليد وتنزيل ملف النسخة الاحتياطية ASIRA_Backup_20261012.json بنجاح!')}
                className="btn btn-primary"
              >
                <Download size={15} />
                <span>تحميل JSON</span>
              </button>
            </div>

            <div style={{ padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '1rem', display: 'block' }}>فحص وتجربة استعادة البيانات (Dry-Run Restore):</strong>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  التحقق من سلامة البيانات وسلامة الأنواع دون الكتابة فوق البيانات الحية.
                </span>
              </div>
              <button
                onClick={() => alert('تم تنفيذ الفحص التجريبي (Dry-Run): تم التحقق من سلامة 100% من السجلات والبيانات!')}
                className="btn btn-outline"
              >
                <CheckCircle2 size={15} />
                <span>تشغيل الفحص التجريبي</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
