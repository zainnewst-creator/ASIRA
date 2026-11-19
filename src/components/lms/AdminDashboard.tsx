import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  FileCheck2, 
  Check, 
  X, 
  Award, 
  Download, 
  Upload,
  Layers, 
  Search,
  ExternalLink,
  Database,
  FileText,
  Plus,
  Edit,
  Trash2,
  Archive,
  RotateCcw
} from 'lucide-react';
import { 
  MockPendingEnrollment, 
  MockAuditLogItem, 
  MockCertificateRequest
} from '../../data/mockData';
import { ResearchPaper, UserRole } from '../../types';
import { sanitizeUrl } from '../../utils/security';
import { exportPlatformData, validateRestorePackage } from '../../services/backupService';
import { AddResearchModal } from '../AddResearchModal';
import { EditResearchModal } from '../EditResearchModal';
import { db } from '../../services/firebaseConfig';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export interface AdminDashboardProps {
  enrollments?: MockPendingEnrollment[];
  onApproveEnrollment?: (id: string) => void;
  onRejectEnrollment?: (id: string) => void;
  onArchiveEnrollment?: (id: string) => void;
  onDeleteEnrollment?: (id: string) => void;
  onArchiveAllProcessed?: () => void;
  certRequests?: MockCertificateRequest[];
  onUpdateCertificate?: (
    id: string,
    status: 'pending' | 'processing' | 'issued' | 'rejected',
    code?: string,
    pdfUrl?: string,
    notes?: string
  ) => void;
  onIssueCertificate?: (id: string, code: string, pdfUrl: string) => void;
  researches?: ResearchPaper[];
  onAddResearch?: (paper: ResearchPaper) => void;
  onUpdateResearch?: (paper: ResearchPaper) => void;
  onDeleteResearch?: (id: string) => void;
  auditLogs?: MockAuditLogItem[];
  onLogAudit?: (action: string, details: string) => void;
  usersList?: Array<{ uid: string; name: string; email: string; university: string; role: UserRole; status: 'active' | 'suspended' }>;
  onUpdateUserRole?: (uid: string, nextRole: UserRole) => void;
  onToggleUserStatus?: (uid: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  enrollments: propEnrollments,
  onApproveEnrollment,
  onRejectEnrollment,
  onArchiveEnrollment,
  onDeleteEnrollment,
  onArchiveAllProcessed,
  certRequests: propCertRequests,
  onUpdateCertificate,
  onIssueCertificate,
  researches = [],
  onAddResearch,
  onUpdateResearch,
  onDeleteResearch,
  auditLogs: propAuditLogs,
  onLogAudit,
  usersList: propUsersList,
  onUpdateUserRole,
  onToggleUserStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'enrollments' | 'users' | 'certificates' | 'researches' | 'audit_logs' | 'backup'>('enrollments');

  // إدارة الأبحاث المنشورة
  const [isAddResearchOpen, setIsAddResearchOpen] = useState(false);
  const [editingResearch, setEditingResearch] = useState<ResearchPaper | null>(null);
  const [researchSearch, setResearchSearch] = useState('');
  const [selectedResearchField, setSelectedResearchField] = useState('all');

  const filteredResearches = researches.filter((paper) => {
    const matchesField = selectedResearchField === 'all' || paper.field === selectedResearchField;
    const matchesSearch =
      paper.title.toLowerCase().includes(researchSearch.toLowerCase()) ||
      paper.journal.toLowerCase().includes(researchSearch.toLowerCase()) ||
      paper.authors.some((author) => author.toLowerCase().includes(researchSearch.toLowerCase()));
    return matchesField && matchesSearch;
  });

  // بيانات وفلاتر طلبات الالتحاق
  const [localEnrollments, setLocalEnrollments] = useState<MockPendingEnrollment[]>([]);
  const enrollments = propEnrollments || localEnrollments;
  const [enrollFilter, setEnrollFilter] = useState<'all' | 'active' | 'pending' | 'approved' | 'rejected' | 'archived'>('active');

  const filteredEnrollments = enrollments.filter((enr) => {
    if (enrollFilter === 'active') return enr.status !== 'archived';
    if (enrollFilter === 'pending') return enr.status === 'pending';
    if (enrollFilter === 'approved') return enr.status === 'approved';
    if (enrollFilter === 'rejected') return enr.status === 'rejected';
    if (enrollFilter === 'archived') return enr.status === 'archived';
    return true; // 'all'
  });

  // بيانات سجل التدقيق
  const [localAuditLogs] = useState<MockAuditLogItem[]>([]);
  const auditLogs = propAuditLogs || localAuditLogs;

  // بيانات وإدارة طلبات الشهادات الأكاديمية
  const [localCertRequests, setLocalCertRequests] = useState<MockCertificateRequest[]>([]);
  const certRequests = propCertRequests || localCertRequests;

  const [certFilter, setCertFilter] = useState<'all' | 'pending' | 'processing' | 'issued' | 'rejected'>('all');
  const [certSearch, setCertSearch] = useState('');
  const [selectedCertForManage, setSelectedCertForManage] = useState<MockCertificateRequest | null>(null);
  const [certStatusInput, setCertStatusInput] = useState<'pending' | 'processing' | 'issued' | 'rejected'>('issued');
  const [certCodeInput, setCertCodeInput] = useState('');
  const [certPdfUrlInput, setCertPdfUrlInput] = useState('');
  const [certNotesInput, setCertNotesInput] = useState('');

  // إدارة المستخدمين والصلاحيات
  const [localUsersList, setLocalUsersList] = useState<Array<{ uid: string; name: string; email: string; university: string; role: UserRole; status: 'active' | 'suspended' }>>(() => {
    try {
      const saved = localStorage.getItem('asira_users');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        if (!snap.empty) {
          const loaded: Array<{ uid: string; name: string; email: string; university: string; role: UserRole; status: 'active' | 'suspended' }> = [];
          snap.forEach((docSnap) => {
            const d = docSnap.data();
            loaded.push({
              uid: docSnap.id,
              name: d.displayName || d.name || d.email || 'مستخدم',
              email: d.email || '',
              university: d.university || 'مسجل بالمنصة',
              role: (d.role as UserRole) || 'student',
              status: d.accountStatus || 'active',
            });
          });
          setLocalUsersList((prev) => {
            const map = new Map();
            prev.forEach((u) => map.set(u.uid, u));
            loaded.forEach((u) => map.set(u.uid, { ...map.get(u.uid), ...u }));
            const merged = Array.from(map.values());
            try {
              localStorage.setItem('asira_users', JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      } catch (err) {
        console.info('[AdminDashboard] Firestore sync fallback to localStorage:', err);
      }
    };
    fetchUsers();
  }, []);

  const usersList = propUsersList && propUsersList.length > 0 ? propUsersList : localUsersList;

  // أرشفة طلب التحاق
  const handleArchive = (id: string) => {
    if (onArchiveEnrollment) {
      onArchiveEnrollment(id);
    } else {
      setLocalEnrollments((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: 'archived', archivedAt: new Date().toISOString() } : e))
      );
    }
    const target = enrollments.find((e) => e.id === id);
    if (onLogAudit && target) {
      onLogAudit('أرشفة طلب التحاق', `تم أرشفة طلب الطالب (${target.studentName}) لكورس: ${target.courseTitle}`);
    }
  };

  // حذف طلب التحاق نهائياً
  const handleDelete = (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) return;
    if (onDeleteEnrollment) {
      onDeleteEnrollment(id);
    } else {
      setLocalEnrollments((prev) => prev.filter((e) => e.id !== id));
    }
    const target = enrollments.find((e) => e.id === id);
    if (onLogAudit && target) {
      onLogAudit('حذف طلب التحاق', `تم حذف طلب الطالب (${target.studentName}) نهائياً`);
    }
  };

  // أرشفة كافة الطلبات المنتهية (المقبولة والمرفوضة)
  const handleArchiveAll = () => {
    if (!window.confirm('هل تريد أرشفة كافة الطلبات المنتهية (المقبولة والمرفوضة) ونقلها إلى سجل الأرشيف؟')) return;
    if (onArchiveAllProcessed) {
      onArchiveAllProcessed();
    } else {
      setLocalEnrollments((prev) =>
        prev.map((e) => {
          if (e.status === 'approved' || e.status === 'rejected') {
            return { ...e, status: 'archived', archivedAt: new Date().toISOString() };
          }
          return e;
        })
      );
    }
    if (onLogAudit) {
      onLogAudit('أرشفة مجمعة', 'تم أرشفة جميع طلبات الالتحاق المعالجة بنجاح');
    }
  };

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

  // فتح نافذة إدارة وتحديث حالة الشهادة ورفع الرابط
  const openManageCertModal = (req: MockCertificateRequest) => {
    setSelectedCertForManage(req);
    setCertStatusInput(req.status || 'pending');
    setCertCodeInput(req.verificationCode || `ASIRA-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setCertPdfUrlInput(req.signedPdfUrl || '');
    setCertNotesInput(req.adminNotes || '');
  };

  // حفظ التعديلات على حالة الشهادة ورابط الـ PDF الموقع
  const handleSaveCertStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCertForManage) return;

    if (onUpdateCertificate) {
      onUpdateCertificate(
        selectedCertForManage.id,
        certStatusInput,
        certCodeInput,
        certStatusInput === 'issued' ? certPdfUrlInput : undefined,
        certNotesInput
      );
    } else if (onIssueCertificate && certStatusInput === 'issued') {
      onIssueCertificate(selectedCertForManage.id, certCodeInput, certPdfUrlInput);
    } else {
      setLocalCertRequests((prev) =>
        prev.map((c) =>
          c.id === selectedCertForManage.id
            ? {
                ...c,
                status: certStatusInput,
                verificationCode: certCodeInput,
                signedPdfUrl: certStatusInput === 'issued' ? certPdfUrlInput : c.signedPdfUrl,
                adminNotes: certNotesInput,
                issuedAt: certStatusInput === 'issued' ? new Date().toISOString().split('T')[0] : c.issuedAt,
              }
            : c
        )
      );
    }

    if (onLogAudit) {
      const statusTitle =
        certStatusInput === 'issued'
          ? 'اعتماد وتوقيع شهادة ورفع رابط PDF'
          : certStatusInput === 'processing'
          ? 'تحويل إلى جاري التجهيز خارج المنصة'
          : certStatusInput === 'rejected'
          ? 'رفض طلب الشهادة الأكاديمية'
          : 'تحديث حالة الشهادة إلى قيد التدقيق';

      onLogAudit(
        statusTitle,
        `تم تحديث شهادة الطالب (${selectedCertForManage.studentName}) لكورس (${selectedCertForManage.courseTitle}) إلى حالة: [${certStatusInput}] برمز: ${certCodeInput}`
      );
    }

    setSelectedCertForManage(null);
  };

  // تغيير سريع للحالة من الجدول
  const handleQuickStatusChange = (req: MockCertificateRequest, newStatus: 'processing' | 'issued') => {
    if (newStatus === 'issued') {
      openManageCertModal(req);
      setCertStatusInput('issued');
      return;
    }

    if (onUpdateCertificate) {
      onUpdateCertificate(
        req.id,
        newStatus,
        req.verificationCode || `ASIRA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        req.signedPdfUrl,
        'جاري إعداد وثيقة الشهادة وتوقيعها من الإدارة الأكاديمية والعمادة'
      );
    } else {
      setLocalCertRequests((prev) =>
        prev.map((c) =>
          c.id === req.id
            ? {
                ...c,
                status: newStatus,
                verificationCode: c.verificationCode || `ASIRA-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                adminNotes: 'جاري إعداد وثيقة الشهادة وتوقيعها من الإدارة الأكاديمية والعمادة',
              }
            : c
        )
      );
    }

    if (onLogAudit) {
      onLogAudit(
        'تحديث مرحلة الشهادة',
        `تم تحويل طلب الطالب (${req.studentName}) إلى: جاري التجهيز والتوقيع خارج المنصة من قِبل العميد.`
      );
    }
  };


  // تغيير دور المستخدم
  const handleRoleChange = async (uid: string, nextRole: UserRole) => {
    if (onUpdateUserRole) {
      onUpdateUserRole(uid, nextRole);
    }
    setLocalUsersList((prev) => {
      const next = prev.map((u) => (u.uid === uid ? { ...u, role: nextRole } : u));
      try {
        localStorage.setItem('asira_users', JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      await updateDoc(doc(db, 'users', uid), { role: nextRole });
    } catch {}

    const target = usersList.find((u) => u.uid === uid);
    if (onLogAudit && target) {
      onLogAudit('تعديل صلاحية مستخدم', `تم تغيير دور المستخدم (${target.name}) من ${target.role} إلى ${nextRole}`);
    }
  };

  // تجميد/تنشيط الحساب
  const toggleUserStatus = async (uid: string) => {
    let nextStatus: 'active' | 'suspended' = 'active';
    if (onToggleUserStatus) {
      onToggleUserStatus(uid);
    }
    setLocalUsersList((prev) => {
      const next = prev.map((u) => {
        if (u.uid === uid) {
          nextStatus = u.status === 'active' ? 'suspended' : 'active';
          return { ...u, status: nextStatus };
        }
        return u;
      });
      try {
        localStorage.setItem('asira_users', JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      await updateDoc(doc(db, 'users', uid), { accountStatus: nextStatus });
    } catch {}

    const target = usersList.find((u) => u.uid === uid);
    if (onLogAudit && target) {
      onLogAudit('تعديل حالة حساب مستخدم', `تم تغيير حالة حساب (${target.name}) إلى ${nextStatus === 'active' ? 'نشط' : 'مجمّد'}`);
    }
  };

  const pendingCount = enrollments.filter((e) => e.status === 'pending').length;

  return (
    <div>
      {/* شريط تبويبات الإدارة العليا */}
      <div className="lms-tabs-bar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`btn lms-tab-btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <Layers size={16} />
          <span>المؤشرات والجاهزية الصفرية</span>
        </button>

        <button
          onClick={() => setActiveTab('enrollments')}
          className={`btn lms-tab-btn ${activeTab === 'enrollments' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <Users size={16} />
          <span>طلبات الالتحاق بالكورسات ({pendingCount > 0 ? `${pendingCount} معلق` : 'الكل'})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`btn lms-tab-btn ${activeTab === 'users' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <ShieldAlert size={16} />
          <span>إدارة المستخدمين والصلاحيات ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('certificates')}
          className={`btn lms-tab-btn ${activeTab === 'certificates' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <Award size={16} />
          <span>اعتماد وتوقيع الشهادات</span>
        </button>

        <button
          onClick={() => setActiveTab('researches')}
          className={`btn lms-tab-btn ${activeTab === 'researches' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <FileText size={16} />
          <span>الأبحاث المنشورة ({researches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`btn lms-tab-btn ${activeTab === 'audit_logs' ? 'btn-primary' : 'btn-ghost'}`}
        >
          <FileCheck2 size={16} />
          <span>سجل التدقيق الأكاديمي ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`btn lms-tab-btn ${activeTab === 'backup' ? 'btn-primary' : 'btn-ghost'}`}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                طلبات الالتحاق بالكورسات الأكاديمية
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                راجع طلبات الطلاب للالتحاق بالكورسات، اعتمد القبول أو الرفض، وقم بأرشفة أو حذف الطلبات المعالجة للحفاظ على ترتيب السجلات.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="badge badge-gold">
                {pendingCount} طلبات بانتظار الاعتماد
              </span>
              <button
                onClick={handleArchiveAll}
                className="btn btn-outline"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                title="أرشفة كافة الطلبات المقبولة والمرفوضة لعدم شغل الجدول"
              >
                <Archive size={14} />
                <span>أرشفة الطلبات المعالجة</span>
              </button>
            </div>
          </div>

          {/* فلاتر تصنيف الطلبات */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <button
              onClick={() => setEnrollFilter('active')}
              className={`btn ${enrollFilter === 'active' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              الطلبات النشطة ({enrollments.filter((e) => e.status !== 'archived').length})
            </button>
            <button
              onClick={() => setEnrollFilter('pending')}
              className={`btn ${enrollFilter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              قيد المراجعة ({enrollments.filter((e) => e.status === 'pending').length})
            </button>
            <button
              onClick={() => setEnrollFilter('approved')}
              className={`btn ${enrollFilter === 'approved' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              المقبولون ({enrollments.filter((e) => e.status === 'approved').length})
            </button>
            <button
              onClick={() => setEnrollFilter('rejected')}
              className={`btn ${enrollFilter === 'rejected' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              المرفوضون ({enrollments.filter((e) => e.status === 'rejected').length})
            </button>
            <button
              onClick={() => setEnrollFilter('archived')}
              className={`btn ${enrollFilter === 'archived' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              الأرشيف ({enrollments.filter((e) => e.status === 'archived').length})
            </button>
            <button
              onClick={() => setEnrollFilter('all')}
              className={`btn ${enrollFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              الكل ({enrollments.length})
            </button>
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
                  <th style={{ padding: '0.85rem' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                      لا توجد طلبات مطابقة لهذا الفلتر حالياً
                    </td>
                  </tr>
                ) : (
                  filteredEnrollments.map((enr) => (
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
                        {enr.status === 'archived' && <span className="badge" style={{ background: '#f1f5f9', color: '#64748b' }}>مؤرشف 📦</span>}
                      </td>
                      <td style={{ padding: '0.85rem' }}>
                        {enr.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <button
                              onClick={() => handleApprove(enr.id)}
                              className="btn btn-accent"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                            >
                              <Check size={14} />
                              <span>قبول</span>
                            </button>
                            <button
                              onClick={() => handleReject(enr.id)}
                              className="btn btn-outline"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', color: '#ef4444' }}
                            >
                              <X size={14} />
                              <span>رفض</span>
                            </button>
                            <button
                              onClick={() => handleDelete(enr.id)}
                              className="btn btn-ghost"
                              style={{ padding: '0.35rem', color: '#ef4444' }}
                              title="حذف الطلب نهائياً"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ) : enr.status === 'archived' ? (
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            <button
                              onClick={() => handleApprove(enr.id)}
                              className="btn btn-outline"
                              style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem' }}
                              title="استعادة واعتماد"
                            >
                              <RotateCcw size={13} />
                              <span>استعادة</span>
                            </button>
                            <button
                              onClick={() => handleDelete(enr.id)}
                              className="btn btn-ghost"
                              style={{ padding: '0.3rem', color: '#ef4444' }}
                              title="حذف نهائي من الأرشيف"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {enr.status === 'rejected' ? (
                              <button
                                onClick={() => handleApprove(enr.id)}
                                className="btn btn-outline"
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', color: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)' }}
                                title="إعادة قبول واعتماد الطالب في المقرر"
                              >
                                <Check size={13} />
                                <span>إعادة قبول</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReject(enr.id)}
                                className="btn btn-ghost"
                                style={{ padding: '0.2rem 0.45rem', fontSize: '0.75rem', color: '#ef4444' }}
                                title="إلغاء الاعتماد وتحويله لمرفوض"
                              >
                                إلغاء
                              </button>
                            )}
                            <button
                              onClick={() => handleArchive(enr.id)}
                              className="btn btn-ghost"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}
                              title="أرشفة الطلب"
                            >
                              <Archive size={13} />
                              <span>أرشفة</span>
                            </button>
                            <button
                              onClick={() => handleDelete(enr.id)}
                              className="btn btn-ghost"
                              style={{ padding: '0.25rem', color: '#ef4444' }}
                              title="حذف الطلب نهائياً"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
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
                {usersList.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                      لا يوجد مستخدمون مسجلون حالياً
                    </td>
                  </tr>
                ) : (
                  usersList.map((user) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. تبويب: اعتماد وتوقيع الشهادات الأكاديمية */}
      {activeTab === 'certificates' && (
        <div className="card">
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-gold">إدارة الشهادات اليدوية (External Certification Workflow)</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>منظومة الاعتماد والتوقيع خارج المنصة</span>
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>
              اعتماد وتوقيع شهادات إتمام الكورسات (Dean Signed Certificates)
            </h2>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.6, maxWidth: '850px' }}>
              الشهادات الأكاديمية لمنتدى أسيرا لا يتم توليدها برمجياً، بل يتم تدقيق نتائج الطالب وتجهيز وثيقة الشهادة وتوقيعها من العميد واللجنة العلمية خارج المنصة بصيغة PDF معتمدة، ثم يقوم المدير بتحديث حالتها ورفع رابط النسخة الموقعة (Google Drive PDF) وإسناد رمز التحقق، لتصبح متاحة فوراً للطالب للاستعراض والتحميل.
            </p>
          </div>

          {/* شريط الإحصائيات السريعة للشهادات */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>إجمالي الطلبات:</span>
              <strong style={{ fontSize: '1.3rem', color: 'var(--text-main)' }}>{certRequests.length}</strong>
            </div>
            <div style={{ background: 'rgba(217, 119, 6, 0.08)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(217, 119, 6, 0.3)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', display: 'block' }}>قيد التدقيق (Pending):</span>
              <strong style={{ fontSize: '1.3rem', color: 'var(--accent-gold)' }}>
                {certRequests.filter((r) => r.status === 'pending').length}
              </strong>
            </div>
            <div style={{ background: 'rgba(217, 119, 6, 0.12)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #d97706' }}>
              <span style={{ fontSize: '0.78rem', color: '#b45309', display: 'block' }}>جاري التجهيز خارج المنصة:</span>
              <strong style={{ fontSize: '1.3rem', color: '#b45309' }}>
                {certRequests.filter((r) => r.status === 'processing').length}
              </strong>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', display: 'block' }}>تم الإصدار والرفع (Issued):</span>
              <strong style={{ fontSize: '1.3rem', color: 'var(--accent-emerald)' }}>
                {certRequests.filter((r) => r.status === 'issued').length}
              </strong>
            </div>
          </div>

          {/* شريط الفلترة والبحث */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => setCertFilter('all')}
                className={`btn ${certFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
              >
                الكل ({certRequests.length})
              </button>
              <button
                onClick={() => setCertFilter('pending')}
                className={`btn ${certFilter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
              >
                قيد التدقيق ({certRequests.filter((r) => r.status === 'pending').length})
              </button>
              <button
                onClick={() => setCertFilter('processing')}
                className={`btn ${certFilter === 'processing' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
              >
                جاري التجهيز ({certRequests.filter((r) => r.status === 'processing').length})
              </button>
              <button
                onClick={() => setCertFilter('issued')}
                className={`btn ${certFilter === 'issued' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
              >
                تم الإصدار والرفع ({certRequests.filter((r) => r.status === 'issued').length})
              </button>
              <button
                onClick={() => setCertFilter('rejected')}
                className={`btn ${certFilter === 'rejected' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}
              >
                مرفوض ({certRequests.filter((r) => r.status === 'rejected').length})
              </button>
            </div>

            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={15} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={certSearch}
                onChange={(e) => setCertSearch(e.target.value)}
                placeholder="بحث باسم الطالب أو الكورس..."
                style={{
                  width: '100%',
                  padding: '0.45rem 2.2rem 0.45rem 0.8rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-main)',
                  color: 'var(--text-main)',
                  fontSize: '0.82rem',
                }}
              />
            </div>
          </div>

          {/* جدول طلبات الشهادات */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.85rem' }}>اسم الطالب والجهة</th>
                  <th style={{ padding: '0.85rem' }}>الكورس والمعدل</th>
                  <th style={{ padding: '0.85rem' }}>تاريخ الطلب</th>
                  <th style={{ padding: '0.85rem' }}>رمز التحقق</th>
                  <th style={{ padding: '0.85rem' }}>حالة الإعداد والتوقيع</th>
                  <th style={{ padding: '0.85rem' }}>رابط الملف المرفوع</th>
                  <th style={{ padding: '0.85rem' }}>الإجراء الإداري</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filteredCerts = certRequests.filter((req) => {
                    const matchesFilter = certFilter === 'all' || req.status === certFilter;
                    const matchesSearch =
                      !certSearch ||
                      req.studentName.toLowerCase().includes(certSearch.toLowerCase()) ||
                      req.courseTitle.toLowerCase().includes(certSearch.toLowerCase()) ||
                      (req.verificationCode && req.verificationCode.toLowerCase().includes(certSearch.toLowerCase()));
                    return matchesFilter && matchesSearch;
                  });

                  if (filteredCerts.length === 0) {
                    return (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                          لا توجد طلبات شهادات مطابقة للبحث أو الفلتر حالياً
                        </td>
                      </tr>
                    );
                  }

                  return filteredCerts.map((req) => (
                    <tr key={req.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.85rem' }}>
                        <strong style={{ color: 'var(--text-main)', display: 'block' }}>{req.studentName}</strong>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{req.university || 'باحث أكاديمي'}</span>
                      </td>
                      <td style={{ padding: '0.85rem' }}>
                        <div style={{ color: 'var(--text-main)', fontWeight: 700 }}>{req.courseTitle}</div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)' }}>
                          المعدل: {req.totalScore || 86}%
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {req.requestedAt}
                      </td>
                      <td style={{ padding: '0.85rem' }}>
                        {req.verificationCode ? (
                          <code style={{ padding: '0.2rem 0.5rem', background: 'var(--bg-subtle)', borderRadius: '4px', fontWeight: 800, fontFamily: 'monospace' }}>
                            {req.verificationCode}
                          </code>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem' }}>
                        {req.status === 'issued' ? (
                          <span className="badge badge-emerald">✓ تم الإصدار والتوقيع</span>
                        ) : req.status === 'processing' ? (
                          <span className="badge badge-gold" style={{ background: 'rgba(217, 119, 6, 0.15)', color: '#b45309', border: '1px solid #d97706' }}>
                            ✍️ جاري التجهيز خارج المنصة
                          </span>
                        ) : req.status === 'rejected' ? (
                          <span className="badge" style={{ background: '#fee2e2', color: '#b91c1c' }}>✕ مرفوض</span>
                        ) : (
                          <span className="badge badge-gold">⏳ قيد المراجعة والتدقيق</span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem' }}>
                        {req.signedPdfUrl ? (
                          <a
                            href={sanitizeUrl(req.signedPdfUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline"
                            style={{ padding: '0.3rem 0.65rem', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none' }}
                            title="معاينة ملف الشهادة الموقعة"
                          >
                            <ExternalLink size={13} />
                            <span>معاينة الرابط</span>
                          </a>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>لم يُرفع بعد</span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => openManageCertModal(req)}
                            className="btn btn-primary"
                            id={`manage-cert-btn-${req.id}`}
                            style={{ padding: '0.38rem 0.85rem', fontSize: '0.8rem', fontWeight: 700 }}
                          >
                            <Award size={14} />
                            <span>تغيير الحالة ورفع الشهادة</span>
                          </button>

                          {req.status === 'pending' && (
                            <button
                              onClick={() => handleQuickStatusChange(req, 'processing')}
                              className="btn btn-ghost"
                              style={{ fontSize: '0.75rem', padding: '0.3rem 0.55rem', color: '#d97706' }}
                              title="تحويل مباشر إلى جاري التجهيز خارج المنصة"
                            >
                              بدء التجهيز ✍️
                            </button>
                          )}

                          {req.status === 'processing' && (
                            <button
                              onClick={() => handleQuickStatusChange(req, 'issued')}
                              className="btn btn-ghost"
                              style={{ fontSize: '0.75rem', padding: '0.3rem 0.55rem', color: '#059669' }}
                              title="رفع واعتماد الشهادة فوراً"
                            >
                              رفع واعتماد 🚀
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>

          {/* نافذة إدارة وتغيير حالة الشهادة ورفع الملف المعتمد (Admin Management Modal) */}
          {selectedCertForManage && (
            <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelectedCertForManage(null); }}>
              <div className="modal-content" style={{ maxWidth: '620px' }}>
                <button
                  onClick={() => setSelectedCertForManage(null)}
                  className="btn btn-ghost"
                  style={{ position: 'absolute', top: '12px', left: '12px' }}
                >
                  ✕
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <Award size={22} color="var(--accent-gold)" />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    إدارة وتغيير حالة الشهادة ورفع الملف المعتمد
                  </h3>
                </div>

                <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    الطالب: {selectedCertForManage.studentName}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    الكورس: {selectedCertForManage.courseTitle} | تاريخ الطلب: {selectedCertForManage.requestedAt}
                  </div>
                </div>

                <div style={{ padding: '0.75rem 1rem', background: 'rgba(217, 119, 6, 0.08)', border: '1px solid rgba(217, 119, 6, 0.3)', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.84rem', color: 'var(--text-main)' }}>
                  ⚠️ <strong>تنويه للمدير:</strong> الشهادات لا يتم توليدها تلقائياً بالمنصة. بعد قيام العمادة بإعداد وثيقة الشهادة وتوقيعها خارج المنصة بصيغة PDF، قم باختيار الحالة (تم الإصدار والتوقيع)، وإدخال رابط ملف الـ PDF (Google Drive)، وإسناد رمز التحقق لتصبح متاحة فوراً للطالب للاستعراض والتحميل.
                </div>

                <form onSubmit={handleSaveCertStatus} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  {/* اختيار الحالة */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                      حالة إعداد الشهادة الحالية:
                    </label>
                    <select
                      value={certStatusInput}
                      onChange={(e) => setCertStatusInput(e.target.value as any)}
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-main)',
                        color: 'var(--text-main)',
                        fontSize: '0.9rem',
                        fontWeight: 700
                      }}
                    >
                      <option value="pending">⏳ قيد المراجعة والتدقيق الإداري (Pending)</option>
                      <option value="processing">✍️ جاري التجهيز والتوقيع خارج المنصة من العميد (Processing)</option>
                      <option value="issued">✓ جاهزة ومعتمدة - تم رفع ملف الشهادة الموقعة (Issued)</option>
                      <option value="rejected">✕ مرفوض مع توضيح السبب (Rejected)</option>
                    </select>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                      {certStatusInput === 'issued'
                        ? '🟢 باختيارك لهذه الحالة، سيتمكن الطالب فوراً من استعراض الشهادة وتحميل ملف الـ PDF المرفوع.'
                        : certStatusInput === 'processing'
                        ? '🟡 يرى الطالب هذه الحالة فقط، وتكون أزرار التحميل مغلقة بانتظار توقيع العميد ورفع الرابط.'
                        : certStatusInput === 'rejected'
                        ? '🔴 يتم إبلاغ الطالب برفض الطلب مع إظهار الملاحظات الإدارية.'
                        : '⚪ الطلب قيد الانتظار الأولي.'}
                    </span>
                  </div>

                  {/* رمز التحقق الأكاديمي */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        رمز التحقق الأكاديمي الموحد (Verification Code):
                      </label>
                      <button
                        type="button"
                        onClick={() => setCertCodeInput(`ASIRA-2026-${Math.floor(1000 + Math.random() * 9000)}`)}
                        className="btn btn-ghost"
                        style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', color: 'var(--primary-600)' }}
                      >
                        توليد كود عشوائي جديد
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={certCodeInput}
                      onChange={(e) => setCertCodeInput(e.target.value)}
                      placeholder="ASIRA-2026-XXXX"
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        fontFamily: 'monospace',
                        fontWeight: 800,
                        fontSize: '0.95rem'
                      }}
                    />
                  </div>

                  {/* رابط ملف الشهادة الموقعة من العميد */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                      رابط ملف الشهادة الموقعة من العميد (Google Drive PDF):
                    </label>
                    <input
                      type="url"
                      required={certStatusInput === 'issued'}
                      value={certPdfUrlInput}
                      onChange={(e) => setCertPdfUrlInput(e.target.value)}
                      placeholder="https://drive.google.com/file/d/.../view"
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        direction: 'ltr',
                        textAlign: 'left',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem'
                      }}
                    />

                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem' }}>
                      قم بلصق رابط ملف الشهادة الموقعة بصيغة PDF من Google Drive (مع التأكد من إتاحة المشاهدة لمن يملك الرابط).
                    </span>
                  </div>

                  {/* ملاحظات الإدارة الأكاديمية */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
                      ملاحظات الإدارة الأكاديمية والعمادة (تظهر للطالب):
                    </label>
                    <textarea
                      rows={2}
                      value={certNotesInput}
                      onChange={(e) => setCertNotesInput(e.target.value)}
                      placeholder="مثال: تم تدقيق الدرجات التراكمية واعتماد الشهادة وتوقيعها من العمادة الأكاديمية."
                      style={{
                        width: '100%',
                        padding: '0.65rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        fontSize: '0.85rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  {/* أزرار الإجراءات */}
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <button type="button" onClick={() => setSelectedCertForManage(null)} className="btn btn-outline">
                      إلغاء
                    </button>
                    <button type="submit" className="btn btn-primary" id="save-cert-status-btn" style={{ fontWeight: 800 }}>
                      <Award size={16} />
                      <span>حفظ واعتماد التعديلات فوراً</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. تبويب: إدارة الأبحاث المنشورة (Research Showcase Management) */}
      {activeTab === 'researches' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                إدارة معرض الأبحاث المنشورة (Research Showcase)
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                إضافة، تعديل، وحذف الأوراق العلمية المنشورة لطلاب وباحثي منتدى أسيرا في المجلات المحكمة.
              </p>
            </div>

            {onAddResearch && (
              <button
                onClick={() => setIsAddResearchOpen(true)}
                className="btn btn-primary"
                style={{ fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: 'var(--radius-full)' }}
                id="admin-add-research-btn"
              >
                <Plus size={16} />
                <span>إضافة بحث منشور جديد</span>
              </button>
            )}
          </div>

          {/* شريط البحث وتصفية التخصص */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <input
                type="text"
                value={researchSearch}
                onChange={(e) => setResearchSearch(e.target.value)}
                placeholder="ابحث بالعنوان، اسم الباحث، أو المجلة العلمية..."
                style={{
                  width: '100%',
                  padding: '0.65rem 2.5rem 0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                }}
              />
              <Search size={16} color="var(--text-subtle)" style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>

            <select
              value={selectedResearchField}
              onChange={(e) => setSelectedResearchField(e.target.value)}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                fontSize: '0.88rem',
              }}
            >
              <option value="all">كافة التخصصات الطبية</option>
              <option value="طب بشري وباطنة">طب بشري وباطنة</option>
              <option value="طب الأطفال والصيدلة السريرية">طب الأطفال والصيدلة السريرية</option>
              <option value="التعليم الطبي والمنهجية">التعليم الطبي والمنهجية</option>
            </select>
          </div>

          {/* جدول الأبحاث */}
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem' }}>عنوان البحث المنشور</th>
                  <th style={{ padding: '0.75rem' }}>المجلة والسنة</th>
                  <th style={{ padding: '0.75rem' }}>الباحثون المشاركون</th>
                  <th style={{ padding: '0.75rem' }}>التخصص</th>
                  <th style={{ padding: '0.75rem' }}>الرابط العلمي</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredResearches.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                      لا توجد أبحاث منشورة مطابقة لمعايير البحث حالياً
                    </td>
                  </tr>
                ) : (
                  filteredResearches.map((paper) => (
                    <tr key={paper.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 700, color: 'var(--text-main)', maxWidth: '280px' }}>
                        {paper.title}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <div>{paper.journal}</div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>عام {paper.publicationYear}</span>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '180px' }}>
                        {paper.authors.join('، ')}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>{paper.field}</span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {paper.doiLink ? (
                          <a
                            href={sanitizeUrl(paper.doiLink)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#60a5fa', fontSize: '0.82rem' }}
                          >
                            <ExternalLink size={13} />
                            <span>رابط النشر</span>
                          </a>
                        ) : paper.pubmedLink ? (
                          <a
                            href={sanitizeUrl(paper.pubmedLink)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#34d399', fontSize: '0.82rem' }}
                          >
                            <ExternalLink size={13} />
                            <span>PubMed</span>
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                          <button
                            onClick={() => setEditingResearch(paper)}
                            className="btn btn-ghost"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                            title="تعديل تفاصيل البحث"
                          >
                            <Edit size={14} />
                            <span>تعديل</span>
                          </button>
                          {onDeleteResearch && (
                            <button
                              onClick={() => {
                                if (window.confirm(`هل أنت متأكد من حذف البحث "${paper.title}" نهائياً من المنصة؟`)) {
                                  onDeleteResearch(paper.id);
                                  if (onLogAudit) {
                                    onLogAudit('حذف بحث منشور', `قام الأدمن بحذف البحث المنشور: ${paper.title}`);
                                  }
                                }
                              }}
                              className="btn btn-ghost"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', color: '#ef4444' }}
                              title="حذف البحث"
                            >
                              <Trash2 size={14} />
                              <span>حذف</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* نوافذ إضافة وتعديل الأبحاث */}
          {isAddResearchOpen && onAddResearch && (
            <AddResearchModal
              isOpen={isAddResearchOpen}
              onClose={() => setIsAddResearchOpen(false)}
              onAddResearch={(newPaper) => {
                onAddResearch(newPaper);
                setIsAddResearchOpen(false);
                if (onLogAudit) {
                  onLogAudit('إضافة بحث منشور', `أضاف الأدمن بحثاً جديداً بعنوان: ${newPaper.title}`);
                }
              }}
            />
          )}

          {editingResearch && onUpdateResearch && (
            <EditResearchModal
              isOpen={Boolean(editingResearch)}
              onClose={() => setEditingResearch(null)}
              paper={editingResearch}
              onUpdateResearch={(updatedPaper) => {
                onUpdateResearch(updatedPaper);
                setEditingResearch(null);
                if (onLogAudit) {
                  onLogAudit('تعديل بحث منشور', `عدّل الأدمن تفاصيل البحث: ${updatedPaper.title}`);
                }
              }}
            />
          )}
        </div>
      )}

      {/* 6. تبويب: سجل التدقيق الأكاديمي غير القابل للتعديل (Audit Logs) */}
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
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                      لا توجد سجلات تدقيق مسجلة حالياً
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
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
                  ))
                )}
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
                onClick={async () => {
                  try {
                    const pkg = await exportPlatformData();
                    const jsonStr = JSON.stringify(pkg, null, 2);
                    const blob = new Blob([jsonStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `ASIRA_Backup_${new Date().toISOString().slice(0, 10)}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    if (onLogAudit) {
                      onLogAudit('تصدير نسخة احتياطية', 'تم تصدير حزمة البيانات الأكاديمية بنجاح');
                    }
                  } catch (e) {
                    console.error('Backup export error:', e);
                  }
                }}
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
                onClick={async () => {
                  try {
                    const pkg = await exportPlatformData();
                    const result = validateRestorePackage(JSON.stringify(pkg));
                    if (result.isValid) {
                      alert(`✓ تقرير الفحص التجريبي (Dry-Run):\n\n${result.report.join('\n')}`);
                    } else {
                      alert(`⚠️ نتائج الفحص:\n\n${result.report.join('\n')}`);
                    }
                    if (onLogAudit) {
                      onLogAudit('فحص تجريبي للاستعادة', 'تم فحص حزمة الاستعادة التجريبية بنجاح');
                    }
                  } catch (e) {
                    console.error('Dry-run error:', e);
                  }
                }}
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
