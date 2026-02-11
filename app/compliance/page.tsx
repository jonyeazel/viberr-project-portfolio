'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  FileText,
  X,
} from 'lucide-react';

// Design system colors
const colors = {
  bg: '#fafaf9',
  surface: '#f5f5f4',
  surface2: '#eeeeec',
  border: '#e5e5e3',
  text: '#191919',
  muted: '#737373',
  blue: '#2563eb',
  green: '#16a34a',
  amber: '#d97706',
  red: '#dc2626',
};

// Data generation
const fileTypes = ['PDF', 'Video', 'Audio', 'Image', 'Text'] as const;
const policyTypes = ['FOIA', 'HIPAA', 'FERPA'] as const;
const statuses = ['Processed', 'Pending', 'Failed', 'In Review'] as const;

type FileType = (typeof fileTypes)[number];
type PolicyType = (typeof policyTypes)[number];
type Status = (typeof statuses)[number];

interface Document {
  id: string;
  fileName: string;
  fileType: FileType;
  policy: PolicyType;
  status: Status;
  redactionsFound: number;
  dateProcessed: Date;
  fileSize: string;
  redactionDetails: RedactionDetail[];
  chainOfCustody: CustodyEntry[];
}

interface RedactionDetail {
  type: string;
  count: number;
  confidence: number;
}

interface CustodyEntry {
  action: string;
  user: string;
  timestamp: Date;
}

interface Policy {
  id: string;
  name: string;
  type: PolicyType;
  status: 'Active' | 'Draft';
  description: string;
  rules: PolicyRule[];
}

interface PolicyRule {
  id: string;
  name: string;
  pattern: string;
  action: string;
}

interface AuditEntry {
  id: string;
  user: string;
  action: string;
  fileName: string;
  policy: PolicyType;
  timestamp: Date;
}

// Generate mock data
const generateDocuments = (): Document[] => {
  const foiaNames = [
    'DOJ-2024-001234_Records_Request.pdf',
    'FBI_Declassified_Memo_2023.pdf',
    'DHS_Incident_Report_Q3.pdf',
    'EPA_Environmental_Assessment.pdf',
    'DOD_Contractor_Communications.pdf',
    'State_Dept_Cable_Archive.pdf',
    'Treasury_Financial_Records.pdf',
    'ICE_Detention_Statistics.pdf',
    'USDA_Food_Safety_Audit.pdf',
    'FTC_Investigation_Summary.pdf',
  ];
  const hipaaNames = [
    'Patient_Records_Batch_2024.pdf',
    'Medical_Imaging_Session_001.video',
    'Clinical_Trial_Data_Extract.pdf',
    'Telehealth_Recording_03152024.audio',
    'Lab_Results_Compilation.pdf',
    'Radiology_Scan_Archive.image',
    'Prescription_History_Export.pdf',
    'Insurance_Claims_Batch.pdf',
    'Mental_Health_Assessment.pdf',
    'Emergency_Room_Intake.video',
  ];
  const ferpaNames = [
    'Student_Transcript_Batch.pdf',
    'Financial_Aid_Applications.pdf',
    'Disciplinary_Records_2024.pdf',
    'Enrollment_Verification.pdf',
    'Grade_Report_Export.pdf',
    'Counseling_Session_Notes.pdf',
    'Special_Education_IEP.pdf',
    'Parent_Contact_Records.pdf',
    'Attendance_Report_Q1.pdf',
    'Academic_Probation_List.pdf',
  ];

  const allNames = [...foiaNames, ...hipaaNames, ...ferpaNames];
  const documents: Document[] = [];

  for (let i = 0; i < 24; i++) {
    const fileName = allNames[i % allNames.length];
    const isVideo = fileName.includes('.video');
    const isAudio = fileName.includes('.audio');
    const isImage = fileName.includes('.image');
    const fileType: FileType = isVideo
      ? 'Video'
      : isAudio
        ? 'Audio'
        : isImage
          ? 'Image'
          : Math.random() > 0.7
            ? 'Text'
            : 'PDF';

    const policy: PolicyType = fileName.includes('Patient') ||
      fileName.includes('Medical') ||
      fileName.includes('Clinical') ||
      fileName.includes('Telehealth') ||
      fileName.includes('Lab') ||
      fileName.includes('Radiology') ||
      fileName.includes('Prescription') ||
      fileName.includes('Insurance') ||
      fileName.includes('Mental') ||
      fileName.includes('Emergency')
      ? 'HIPAA'
      : fileName.includes('Student') ||
          fileName.includes('Financial_Aid') ||
          fileName.includes('Disciplinary') ||
          fileName.includes('Enrollment') ||
          fileName.includes('Grade') ||
          fileName.includes('Counseling') ||
          fileName.includes('Special_Education') ||
          fileName.includes('Parent_Contact') ||
          fileName.includes('Attendance') ||
          fileName.includes('Academic')
        ? 'FERPA'
        : 'FOIA';

    const statusWeights = [0.65, 0.2, 0.05, 0.1];
    const rand = Math.random();
    let statusIndex = 0;
    let cumulative = 0;
    for (let j = 0; j < statusWeights.length; j++) {
      cumulative += statusWeights[j];
      if (rand < cumulative) {
        statusIndex = j;
        break;
      }
    }
    const status = statuses[statusIndex];

    const redactionTypes =
      policy === 'HIPAA'
        ? [
            { type: 'PHI - Patient Names', count: Math.floor(Math.random() * 15) + 1, confidence: 0.94 + Math.random() * 0.05 },
            { type: 'PHI - SSN', count: Math.floor(Math.random() * 5), confidence: 0.98 + Math.random() * 0.02 },
            { type: 'PHI - Medical Record Numbers', count: Math.floor(Math.random() * 8) + 1, confidence: 0.92 + Math.random() * 0.07 },
            { type: 'PHI - Dates of Service', count: Math.floor(Math.random() * 20) + 5, confidence: 0.88 + Math.random() * 0.1 },
          ]
        : policy === 'FERPA'
          ? [
              { type: 'PII - Student Names', count: Math.floor(Math.random() * 25) + 5, confidence: 0.95 + Math.random() * 0.04 },
              { type: 'PII - Student IDs', count: Math.floor(Math.random() * 25) + 5, confidence: 0.97 + Math.random() * 0.03 },
              { type: 'PII - Parent Information', count: Math.floor(Math.random() * 10) + 1, confidence: 0.91 + Math.random() * 0.08 },
              { type: 'PII - Grades/GPA', count: Math.floor(Math.random() * 30) + 10, confidence: 0.89 + Math.random() * 0.1 },
            ]
          : [
              { type: 'PII - Names', count: Math.floor(Math.random() * 20) + 2, confidence: 0.93 + Math.random() * 0.06 },
              { type: 'PII - SSN', count: Math.floor(Math.random() * 3), confidence: 0.99 },
              { type: 'Classified Markers', count: Math.floor(Math.random() * 5), confidence: 0.96 + Math.random() * 0.04 },
              { type: 'Internal Reference Numbers', count: Math.floor(Math.random() * 15) + 3, confidence: 0.87 + Math.random() * 0.12 },
            ];

    const redactionDetails = redactionTypes.filter((r) => r.count > 0);
    const totalRedactions = redactionDetails.reduce((sum, r) => sum + r.count, 0);

    const baseDate = new Date('2024-12-01');
    const dateOffset = Math.floor(Math.random() * 60);
    const processedDate = new Date(baseDate);
    processedDate.setDate(processedDate.getDate() + dateOffset);

    const users = ['system', 'j.martinez', 'a.chen', 's.johnson', 'compliance-bot'];
    const chainOfCustody: CustodyEntry[] = [
      { action: 'File ingested', user: 'system', timestamp: new Date(processedDate.getTime() - 3600000 * 24) },
      { action: 'Policy analysis started', user: 'compliance-bot', timestamp: new Date(processedDate.getTime() - 3600000 * 12) },
      { action: 'Redaction patterns identified', user: 'compliance-bot', timestamp: new Date(processedDate.getTime() - 3600000 * 6) },
      { action: 'Redactions applied', user: 'system', timestamp: new Date(processedDate.getTime() - 3600000 * 2) },
      { action: 'Review completed', user: users[Math.floor(Math.random() * 3) + 1], timestamp: processedDate },
    ];

    documents.push({
      id: `doc-${i + 1}`,
      fileName: fileName.replace('.video', '.mp4').replace('.audio', '.wav').replace('.image', '.jpg'),
      fileType,
      policy,
      status,
      redactionsFound: totalRedactions,
      dateProcessed: processedDate,
      fileSize: fileType === 'Video' ? `${(Math.random() * 500 + 100).toFixed(1)} MB` : fileType === 'Audio' ? `${(Math.random() * 50 + 10).toFixed(1)} MB` : `${(Math.random() * 5 + 0.5).toFixed(2)} MB`,
      redactionDetails,
      chainOfCustody,
    });
  }

  return documents.sort((a, b) => b.dateProcessed.getTime() - a.dateProcessed.getTime());
};

const generatePolicies = (): Policy[] => {
  return [
    {
      id: 'policy-1',
      name: 'FOIA Standard Release',
      type: 'FOIA',
      status: 'Active',
      description: 'Standard policy for Freedom of Information Act requests. Identifies and redacts personal identifiers, classified information, and deliberative process content.',
      rules: [
        { id: 'r1', name: 'SSN Pattern Detection', pattern: '\\d{3}-\\d{2}-\\d{4}', action: 'Redact with [SSN REDACTED]' },
        { id: 'r2', name: 'Name Entity Recognition', pattern: 'NER: PERSON', action: 'Review for exemption 6/7(C)' },
        { id: 'r3', name: 'Classification Markers', pattern: 'SECRET|CONFIDENTIAL|TOP SECRET', action: 'Withhold under exemption 1' },
        { id: 'r4', name: 'Internal Phone Numbers', pattern: '\\(\\d{3}\\) \\d{3}-\\d{4}', action: 'Redact internal extensions' },
      ],
    },
    {
      id: 'policy-2',
      name: 'HIPAA PHI Protection',
      type: 'HIPAA',
      status: 'Active',
      description: 'Comprehensive Protected Health Information detection and redaction for HIPAA compliance. Covers all 18 PHI identifiers.',
      rules: [
        { id: 'r5', name: 'Patient Name Detection', pattern: 'NER: PERSON + medical context', action: 'Replace with [PATIENT]' },
        { id: 'r6', name: 'Medical Record Number', pattern: 'MRN:\\s*\\d+', action: 'Redact completely' },
        { id: 'r7', name: 'Date of Birth', pattern: 'DOB|Birth Date + date pattern', action: 'Generalize to year only' },
        { id: 'r8', name: 'Address Detection', pattern: 'NER: ADDRESS', action: 'Redact to state level' },
        { id: 'r9', name: 'Phone/Fax Numbers', pattern: 'Phone|Fax + number pattern', action: 'Redact completely' },
        { id: 'r10', name: 'Email Addresses', pattern: 'Email regex pattern', action: 'Redact completely' },
      ],
    },
    {
      id: 'policy-3',
      name: 'FERPA Education Records',
      type: 'FERPA',
      status: 'Active',
      description: 'Family Educational Rights and Privacy Act compliance for student education records.',
      rules: [
        { id: 'r11', name: 'Student ID Detection', pattern: 'Student ID|SID + alphanumeric', action: 'Replace with [STUDENT ID]' },
        { id: 'r12', name: 'Grade Information', pattern: 'GPA|Grade + numeric', action: 'Redact from third-party disclosures' },
        { id: 'r13', name: 'Disciplinary Records', pattern: 'Disciplinary|Violation context', action: 'Withhold unless authorized' },
        { id: 'r14', name: 'Parent/Guardian Info', pattern: 'Parent|Guardian + contact info', action: 'Redact contact details' },
      ],
    },
    {
      id: 'policy-4',
      name: 'HIPAA Video Redaction',
      type: 'HIPAA',
      status: 'Active',
      description: 'Automated facial detection and blurring for video content containing patient imagery.',
      rules: [
        { id: 'r15', name: 'Facial Detection', pattern: 'ML: Face detection model', action: 'Apply blur filter' },
        { id: 'r16', name: 'Name Badge Detection', pattern: 'ML: Text in badge region', action: 'Apply blur filter' },
        { id: 'r17', name: 'Audio PHI', pattern: 'Speech-to-text + PHI patterns', action: 'Mute audio segment' },
      ],
    },
    {
      id: 'policy-5',
      name: 'FOIA Audio Transcription',
      type: 'FOIA',
      status: 'Draft',
      description: 'Transcription and redaction pipeline for audio recordings subject to FOIA requests.',
      rules: [
        { id: 'r18', name: 'Speaker Identification', pattern: 'Voice fingerprint matching', action: 'Label speakers by role' },
        { id: 'r19', name: 'Name Mentions', pattern: 'NER: PERSON in transcript', action: 'Review for disclosure' },
        { id: 'r20', name: 'Sensitive Topics', pattern: 'Keyword: classified, secret, confidential', action: 'Flag for manual review' },
      ],
    },
  ];
};

const generateAuditLog = (documents: Document[]): AuditEntry[] => {
  const users = ['j.martinez', 'a.chen', 's.johnson', 'm.williams', 'r.patel', 'compliance-bot', 'system'];
  const actions = [
    'Viewed document',
    'Downloaded redacted version',
    'Approved redactions',
    'Requested additional review',
    'Modified policy assignment',
    'Exported audit trail',
    'Initiated reprocessing',
    'Updated classification',
  ];

  const entries: AuditEntry[] = [];
  const baseDate = new Date();

  for (let i = 0; i < 50; i++) {
    const doc = documents[Math.floor(Math.random() * documents.length)];
    const timestamp = new Date(baseDate.getTime() - Math.random() * 7 * 24 * 3600000);

    entries.push({
      id: `audit-${i + 1}`,
      user: users[Math.floor(Math.random() * users.length)],
      action: actions[Math.floor(Math.random() * actions.length)],
      fileName: doc.fileName,
      policy: doc.policy,
      timestamp,
    });
  }

  return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Components
const StatusBadge = ({ status }: { status: Status }) => {
  const statusColors: Record<Status, string> = {
    Processed: colors.green,
    Pending: colors.amber,
    Failed: colors.red,
    'In Review': colors.blue,
  };

  return (
    <span
      style={{
        color: statusColors[status],
        fontSize: 11,
        fontWeight: 500,
      }}
    >
      {status}
    </span>
  );
};

const PolicyBadge = ({ policy }: { policy: PolicyType }) => {
  return (
    <span
      style={{
        color: colors.muted,
        fontSize: 11,
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}
    >
      {policy}
    </span>
  );
};

export default function ComplianceDashboard() {
  const [documents] = useState<Document[]>(() => generateDocuments());
  const [policies] = useState<Policy[]>(() => generatePolicies());
  const [auditLog] = useState<AuditEntry[]>(() => generateAuditLog(documents));

  const [activeTab, setActiveTab] = useState<'documents' | 'policies' | 'audit'>('documents');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [expandedPolicies, setExpandedPolicies] = useState<Set<string>>(new Set());

  const [sortField, setSortField] = useState<keyof Document>('dateProcessed');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterPolicy, setFilterPolicy] = useState<PolicyType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [filterType, setFilterType] = useState<FileType | 'all'>('all');

  // Stats
  const stats = useMemo(() => {
    const totalProcessed = documents.filter((d) => d.status === 'Processed').length;
    const activePolicies = policies.filter((p) => p.status === 'Active').length;
    const totalRedactions = documents.reduce((sum, d) => sum + d.redactionsFound, 0);
    const pendingReview = documents.filter((d) => d.status === 'In Review' || d.status === 'Pending').length;
    return { totalProcessed, activePolicies, totalRedactions, pendingReview };
  }, [documents, policies]);

  // Filtered and sorted documents
  const filteredDocuments = useMemo(() => {
    let filtered = [...documents];

    if (filterPolicy !== 'all') {
      filtered = filtered.filter((d) => d.policy === filterPolicy);
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter((d) => d.status === filterStatus);
    }
    if (filterType !== 'all') {
      filtered = filtered.filter((d) => d.fileType === filterType);
    }

    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal instanceof Date && bVal instanceof Date) {
        return sortDirection === 'asc' ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return 0;
    });

    return filtered;
  }, [documents, filterPolicy, filterStatus, filterType, sortField, sortDirection]);

  const handleSort = (field: keyof Document) => {
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const togglePolicyExpand = (policyId: string) => {
    setExpandedPolicies((prev) => {
      const next = new Set(prev);
      if (next.has(policyId)) {
        next.delete(policyId);
      } else {
        next.add(policyId);
      }
      return next;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '16px 24px',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <Link
          href="/"
          style={{
            color: colors.muted,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            transition: 'color 150ms ease-out',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = colors.text)}
          onMouseLeave={(e) => (e.currentTarget.style.color = colors.muted)}
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <div style={{ width: 1, height: 16, backgroundColor: colors.border }} />
        <span style={{ fontSize: 15, fontWeight: 500 }}>Compliance Automation</span>
      </header>

      {/* Stats */}
      <div
        style={{
          padding: '24px',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          gap: 48,
        }}
      >
        <div>
          <div style={{ fontSize: 32, fontWeight: 500, lineHeight: 1 }}>{stats.totalProcessed}</div>
          <div style={{ fontSize: 11, color: colors.muted, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Files Processed</div>
        </div>
        <div>
          <div style={{ fontSize: 32, fontWeight: 500, lineHeight: 1 }}>{stats.activePolicies}</div>
          <div style={{ fontSize: 11, color: colors.muted, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Policies Active</div>
        </div>
        <div>
          <div style={{ fontSize: 32, fontWeight: 500, lineHeight: 1 }}>{stats.totalRedactions.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: colors.muted, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Redactions Applied</div>
        </div>
        <div>
          <div style={{ fontSize: 32, fontWeight: 500, lineHeight: 1, color: stats.pendingReview > 0 ? colors.amber : colors.text }}>{stats.pendingReview}</div>
          <div style={{ fontSize: 11, color: colors.muted, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Review</div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          padding: '0 24px',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          gap: 24,
        }}
      >
        {(['documents', 'policies', 'audit'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none',
              border: 'none',
              padding: '12px 0',
              fontSize: 13,
              fontWeight: 500,
              color: activeTab === tab ? colors.text : colors.muted,
              cursor: 'pointer',
              borderBottom: activeTab === tab ? `2px solid ${colors.text}` : '2px solid transparent',
              marginBottom: -1,
              transition: 'color 150ms ease-out',
              textTransform: 'capitalize',
            }}
          >
            {tab === 'audit' ? 'Audit Log' : tab}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Document list / Policies / Audit */}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'documents' && (
            <>
              {/* Filters */}
              <div
                style={{
                  padding: '12px 24px',
                  borderBottom: `1px solid ${colors.border}`,
                  display: 'flex',
                  gap: 16,
                  alignItems: 'center',
                }}
              >
                <select
                  value={filterPolicy}
                  onChange={(e) => setFilterPolicy(e.target.value as PolicyType | 'all')}
                  style={{
                    background: colors.surface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 4,
                    padding: '6px 12px',
                    color: colors.text,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">All Policies</option>
                  {policyTypes.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as Status | 'all')}
                  style={{
                    background: colors.surface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 4,
                    padding: '6px 12px',
                    color: colors.text,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">All Statuses</option>
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as FileType | 'all')}
                  style={{
                    background: colors.surface,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 4,
                    padding: '6px 12px',
                    color: colors.text,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  <option value="all">All Types</option>
                  {fileTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <span style={{ fontSize: 11, color: colors.muted, marginLeft: 'auto' }}>{filteredDocuments.length} documents</span>
              </div>

              {/* Table */}
              <div style={{ flex: 1, overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <th
                        onClick={() => handleSort('fileName')}
                        style={{
                          padding: '12px 24px',
                          textAlign: 'left',
                          fontWeight: 500,
                          color: colors.muted,
                          fontSize: 11,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        File Name {sortField === 'fileName' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th
                        onClick={() => handleSort('fileType')}
                        style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          fontWeight: 500,
                          color: colors.muted,
                          fontSize: 11,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        Type {sortField === 'fileType' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th
                        style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          fontWeight: 500,
                          color: colors.muted,
                          fontSize: 11,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        Policy
                      </th>
                      <th
                        onClick={() => handleSort('status')}
                        style={{
                          padding: '12px 16px',
                          textAlign: 'left',
                          fontWeight: 500,
                          color: colors.muted,
                          fontSize: 11,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th
                        onClick={() => handleSort('redactionsFound')}
                        style={{
                          padding: '12px 16px',
                          textAlign: 'right',
                          fontWeight: 500,
                          color: colors.muted,
                          fontSize: 11,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        Redactions {sortField === 'redactionsFound' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                      <th
                        onClick={() => handleSort('dateProcessed')}
                        style={{
                          padding: '12px 24px',
                          textAlign: 'right',
                          fontWeight: 500,
                          color: colors.muted,
                          fontSize: 11,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          cursor: 'pointer',
                          userSelect: 'none',
                        }}
                      >
                        Date {sortField === 'dateProcessed' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map((doc) => (
                      <tr
                        key={doc.id}
                        onClick={() => setSelectedDocument(doc)}
                        style={{
                          borderBottom: `1px solid ${colors.border}`,
                          cursor: 'pointer',
                          backgroundColor: selectedDocument?.id === doc.id ? colors.surface : 'transparent',
                          transition: 'background-color 150ms ease-out',
                        }}
                        onMouseEnter={(e) => {
                          if (selectedDocument?.id !== doc.id) {
                            e.currentTarget.style.backgroundColor = colors.surface;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedDocument?.id !== doc.id) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <td style={{ padding: '12px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FileText size={16} style={{ color: colors.muted, flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.fileName}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: colors.muted }}>{doc.fileType}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <PolicyBadge policy={doc.policy} />
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <StatusBadge status={doc.status} />
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>{doc.redactionsFound}</td>
                        <td style={{ padding: '12px 24px', textAlign: 'right', color: colors.muted }}>{formatDate(doc.dateProcessed)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'policies' && (
            <div style={{ padding: 24 }}>
              {policies.map((policy) => (
                <div
                  key={policy.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 4,
                    marginBottom: 8,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <div
                    onClick={() => togglePolicyExpand(policy.id)}
                    style={{
                      padding: 16,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    {expandedPolicies.has(policy.id) ? <ChevronDown size={16} style={{ color: colors.muted }} /> : <ChevronRight size={16} style={{ color: colors.muted }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 15, fontWeight: 500 }}>{policy.name}</span>
                        <PolicyBadge policy={policy.type} />
                        <span
                          style={{
                            fontSize: 11,
                            color: policy.status === 'Active' ? colors.green : colors.muted,
                          }}
                        >
                          {policy.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: colors.muted, marginTop: 4 }}>{policy.description}</div>
                    </div>
                    <span style={{ fontSize: 11, color: colors.muted }}>{policy.rules.length} rules</span>
                  </div>
                  {expandedPolicies.has(policy.id) && (
                    <div style={{ borderTop: `1px solid ${colors.border}`, padding: 16 }}>
                      {policy.rules.map((rule) => (
                        <div
                          key={rule.id}
                          style={{
                            padding: '12px 16px',
                            backgroundColor: colors.surface2,
                            borderRadius: 4,
                            marginBottom: 8,
                          }}
                        >
                          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{rule.name}</div>
                          <div style={{ fontSize: 11, color: colors.muted, fontFamily: 'monospace' }}>{rule.pattern}</div>
                          <div style={{ fontSize: 11, color: colors.muted, marginTop: 4 }}>{rule.action}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'audit' && (
            <div style={{ flex: 1, overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <th
                      style={{
                        padding: '12px 24px',
                        textAlign: 'left',
                        fontWeight: 500,
                        color: colors.muted,
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Timestamp
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontWeight: 500,
                        color: colors.muted,
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      User
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontWeight: 500,
                        color: colors.muted,
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Action
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontWeight: 500,
                        color: colors.muted,
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      File
                    </th>
                    <th
                      style={{
                        padding: '12px 24px',
                        textAlign: 'left',
                        fontWeight: 500,
                        color: colors.muted,
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Policy
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {auditLog.map((entry) => (
                    <tr
                      key={entry.id}
                      style={{
                        borderBottom: `1px solid ${colors.border}`,
                      }}
                    >
                      <td style={{ padding: '12px 24px', color: colors.muted, whiteSpace: 'nowrap' }}>
                        {formatDate(entry.timestamp)} {formatTime(entry.timestamp)}
                      </td>
                      <td style={{ padding: '12px 16px' }}>{entry.user}</td>
                      <td style={{ padding: '12px 16px' }}>{entry.action}</td>
                      <td style={{ padding: '12px 16px', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.fileName}</td>
                      <td style={{ padding: '12px 24px' }}>
                        <PolicyBadge policy={entry.policy} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Document detail panel */}
        {selectedDocument && activeTab === 'documents' && (
          <div
            style={{
              width: 400,
              borderLeft: `1px solid ${colors.border}`,
              backgroundColor: colors.surface,
              overflow: 'auto',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                padding: 16,
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Document Details</span>
              <button
                onClick={() => setSelectedDocument(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.muted,
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4, wordBreak: 'break-word' }}>{selectedDocument.fileName}</div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <StatusBadge status={selectedDocument.status} />
                <PolicyBadge policy={selectedDocument.policy} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 11, color: colors.muted, marginBottom: 4 }}>Type</div>
                  <div style={{ fontSize: 13 }}>{selectedDocument.fileType}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: colors.muted, marginBottom: 4 }}>Size</div>
                  <div style={{ fontSize: 13 }}>{selectedDocument.fileSize}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: colors.muted, marginBottom: 4 }}>Processed</div>
                  <div style={{ fontSize: 13 }}>{formatDate(selectedDocument.dateProcessed)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: colors.muted, marginBottom: 4 }}>Redactions</div>
                  <div style={{ fontSize: 13 }}>{selectedDocument.redactionsFound}</div>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Redaction Summary</div>
                {selectedDocument.redactionDetails.map((detail, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      backgroundColor: colors.surface2,
                      borderRadius: 4,
                      marginBottom: 4,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13 }}>{detail.type}</div>
                      <div style={{ fontSize: 11, color: colors.muted }}>{(detail.confidence * 100).toFixed(0)}% confidence</div>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{detail.count}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Chain of Custody</div>
                <div style={{ position: 'relative' }}>
                  {selectedDocument.chainOfCustody.map((entry, i) => (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        gap: 12,
                        paddingBottom: 12,
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: colors.muted,
                          marginTop: 4,
                          flexShrink: 0,
                          position: 'relative',
                          zIndex: 1,
                        }}
                      />
                      {i < selectedDocument.chainOfCustody.length - 1 && (
                        <div
                          style={{
                            position: 'absolute',
                            left: 3,
                            top: 12,
                            bottom: 0,
                            width: 2,
                            backgroundColor: colors.border,
                          }}
                        />
                      )}
                      <div>
                        <div style={{ fontSize: 13 }}>{entry.action}</div>
                        <div style={{ fontSize: 11, color: colors.muted }}>
                          {entry.user} - {formatDate(entry.timestamp)} {formatTime(entry.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    backgroundColor: colors.text,
                    color: colors.bg,
                    border: 'none',
                    borderRadius: 4,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'opacity 150ms ease-out',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  Download Redacted
                </button>
                <button
                  style={{
                    padding: '10px 16px',
                    backgroundColor: 'transparent',
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 4,
                    fontSize: 13,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background-color 150ms ease-out',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.surface2)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  View JSON
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
