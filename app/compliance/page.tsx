'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  FileText,
  Film,
  Image,
  Mic,
  X,
  Download,
  Eye,
  AlertCircle,
} from 'lucide-react';

// Design system colors - using CSS variables for ShadCN compatibility
const colors = {
  bg: 'var(--background)',
  surface: 'var(--secondary)',
  surface2: 'var(--surface-2)',
  border: 'var(--border)',
  text: 'var(--foreground)',
  muted: 'var(--muted)',
  primary: 'var(--primary)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  destructive: 'var(--destructive)',
};

// Types
type FileType = 'PDF' | 'Video' | 'Audio' | 'Image';
type PolicyType = 'FOIA' | 'HIPAA' | 'FERPA' | 'Custom';
type Status = 'Processed' | 'Pending' | 'In Review' | 'Failed';
type RedactionCategory = 'SSN' | 'PHI' | 'PII' | 'Faces' | 'Names' | 'MRN' | 'DOB' | 'Addresses' | 'StudentID' | 'Grades';

interface RedactionDetail {
  category: RedactionCategory;
  count: number;
  confidence: number;
}

interface CustodyEntry {
  action: string;
  user: string;
  timestamp: Date;
  ip?: string;
}

interface Document {
  id: string;
  fileName: string;
  fileType: FileType;
  policy: PolicyType;
  status: Status;
  redactionsFound: number;
  dateProcessed: Date;
  fileSize: string;
  pages?: number;
  duration?: string;
  redactionDetails: RedactionDetail[];
  chainOfCustody: CustodyEntry[];
  jsonOverlay: object;
}

interface PolicyRule {
  id: string;
  name: string;
  description: string;
  status: 'Active' | 'Draft';
  pattern?: string;
}

interface Policy {
  id: string;
  name: string;
  type: PolicyType;
  status: 'Active' | 'Draft';
  description: string;
  documentCount: number;
  rules: PolicyRule[];
}

interface AuditEntry {
  id: string;
  user: string;
  action: 'Viewed' | 'Downloaded' | 'Processed' | 'Shared' | 'Approved' | 'Rejected' | 'Modified';
  fileName: string;
  policy: PolicyType;
  timestamp: Date;
  ip: string;
  details?: string;
}

// Seeded random for consistency
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Data generation
const generateDocuments = (): Document[] => {
  const fileNames: { name: string; type: FileType; policy: PolicyType }[] = [
    // FOIA - Government documents
    { name: 'DOJ-2024-001234_Records_Request.pdf', type: 'PDF', policy: 'FOIA' },
    { name: 'FBI_Declassified_Memo_2023.pdf', type: 'PDF', policy: 'FOIA' },
    { name: 'DHS_Incident_Report_Q3_2024.pdf', type: 'PDF', policy: 'FOIA' },
    { name: 'EPA_Environmental_Assessment_Region4.pdf', type: 'PDF', policy: 'FOIA' },
    { name: 'DOD_Contractor_Communications_Archive.pdf', type: 'PDF', policy: 'FOIA' },
    { name: 'State_Dept_Cable_2024_0892.pdf', type: 'PDF', policy: 'FOIA' },
    { name: 'Treasury_Financial_Disclosure_2024.pdf', type: 'PDF', policy: 'FOIA' },
    { name: 'ICE_Detention_Statistics_FY2024.pdf', type: 'PDF', policy: 'FOIA' },
    // HIPAA - Healthcare documents
    { name: 'Patient_Records_Batch_2024_Q4.pdf', type: 'PDF', policy: 'HIPAA' },
    { name: 'Surgical_Procedure_Recording_001.mp4', type: 'Video', policy: 'HIPAA' },
    { name: 'Clinical_Trial_NCT00892347_Data.pdf', type: 'PDF', policy: 'HIPAA' },
    { name: 'Telehealth_Session_03152024.wav', type: 'Audio', policy: 'HIPAA' },
    { name: 'Radiology_Scan_MRI_0234.jpg', type: 'Image', policy: 'HIPAA' },
    { name: 'Lab_Results_Compilation_Feb2024.pdf', type: 'PDF', policy: 'HIPAA' },
    { name: 'Emergency_Room_Intake_Video.mp4', type: 'Video', policy: 'HIPAA' },
    { name: 'Mental_Health_Assessment_Batch.pdf', type: 'PDF', policy: 'HIPAA' },
    // FERPA - Education documents
    { name: 'Student_Transcript_Batch_Spring2024.pdf', type: 'PDF', policy: 'FERPA' },
    { name: 'Financial_Aid_Applications_2024.pdf', type: 'PDF', policy: 'FERPA' },
    { name: 'Disciplinary_Records_AY2024.pdf', type: 'PDF', policy: 'FERPA' },
    { name: 'Enrollment_Verification_Requests.pdf', type: 'PDF', policy: 'FERPA' },
    { name: 'Grade_Report_Export_Fall2024.pdf', type: 'PDF', policy: 'FERPA' },
    { name: 'Special_Education_IEP_Collection.pdf', type: 'PDF', policy: 'FERPA' },
    // Custom policy documents
    { name: 'Internal_HR_Investigation_2024.pdf', type: 'PDF', policy: 'Custom' },
    { name: 'Board_Meeting_Recording_Q4.mp4', type: 'Video', policy: 'Custom' },
  ];

  const documents: Document[] = [];
  const statusWeights: { status: Status; weight: number }[] = [
    { status: 'Processed', weight: 0.65 },
    { status: 'Pending', weight: 0.15 },
    { status: 'In Review', weight: 0.15 },
    { status: 'Failed', weight: 0.05 },
  ];

  for (let i = 0; i < 24; i++) {
    const file = fileNames[i];
    const seed = i * 1000;
    
    // Determine status with weighted random
    const statusRand = seededRandom(seed + 1);
    let cumulative = 0;
    let status: Status = 'Processed';
    for (const sw of statusWeights) {
      cumulative += sw.weight;
      if (statusRand < cumulative) {
        status = sw.status;
        break;
      }
    }

    // Generate redaction details based on policy
    const redactionDetails: RedactionDetail[] = [];
    if (file.policy === 'HIPAA') {
      redactionDetails.push(
        { category: 'PHI', count: Math.floor(seededRandom(seed + 10) * 20) + 5, confidence: 0.94 + seededRandom(seed + 11) * 0.05 },
        { category: 'Names', count: Math.floor(seededRandom(seed + 12) * 15) + 3, confidence: 0.92 + seededRandom(seed + 13) * 0.07 },
        { category: 'SSN', count: Math.floor(seededRandom(seed + 14) * 4), confidence: 0.98 + seededRandom(seed + 15) * 0.02 },
        { category: 'MRN', count: Math.floor(seededRandom(seed + 16) * 10) + 2, confidence: 0.95 + seededRandom(seed + 17) * 0.04 },
        { category: 'DOB', count: Math.floor(seededRandom(seed + 18) * 12) + 1, confidence: 0.91 + seededRandom(seed + 19) * 0.08 },
      );
      if (file.type === 'Video' || file.type === 'Image') {
        redactionDetails.push(
          { category: 'Faces', count: Math.floor(seededRandom(seed + 20) * 8) + 1, confidence: 0.89 + seededRandom(seed + 21) * 0.1 }
        );
      }
    } else if (file.policy === 'FERPA') {
      redactionDetails.push(
        { category: 'PII', count: Math.floor(seededRandom(seed + 22) * 25) + 10, confidence: 0.93 + seededRandom(seed + 23) * 0.06 },
        { category: 'Names', count: Math.floor(seededRandom(seed + 24) * 30) + 5, confidence: 0.95 + seededRandom(seed + 25) * 0.04 },
        { category: 'StudentID', count: Math.floor(seededRandom(seed + 26) * 25) + 5, confidence: 0.97 + seededRandom(seed + 27) * 0.03 },
        { category: 'Grades', count: Math.floor(seededRandom(seed + 28) * 40) + 10, confidence: 0.88 + seededRandom(seed + 29) * 0.11 },
        { category: 'Addresses', count: Math.floor(seededRandom(seed + 30) * 8) + 1, confidence: 0.90 + seededRandom(seed + 31) * 0.09 },
      );
    } else if (file.policy === 'FOIA') {
      redactionDetails.push(
        { category: 'PII', count: Math.floor(seededRandom(seed + 32) * 20) + 5, confidence: 0.92 + seededRandom(seed + 33) * 0.07 },
        { category: 'Names', count: Math.floor(seededRandom(seed + 34) * 25) + 3, confidence: 0.94 + seededRandom(seed + 35) * 0.05 },
        { category: 'SSN', count: Math.floor(seededRandom(seed + 36) * 3), confidence: 0.99 },
        { category: 'Addresses', count: Math.floor(seededRandom(seed + 37) * 10) + 2, confidence: 0.87 + seededRandom(seed + 38) * 0.12 },
      );
    } else {
      redactionDetails.push(
        { category: 'PII', count: Math.floor(seededRandom(seed + 39) * 15) + 5, confidence: 0.91 + seededRandom(seed + 40) * 0.08 },
        { category: 'Names', count: Math.floor(seededRandom(seed + 41) * 20) + 2, confidence: 0.93 + seededRandom(seed + 42) * 0.06 },
      );
      if (file.type === 'Video') {
        redactionDetails.push(
          { category: 'Faces', count: Math.floor(seededRandom(seed + 43) * 12) + 2, confidence: 0.88 + seededRandom(seed + 44) * 0.11 }
        );
      }
    }

    // Filter out zero counts
    const filteredRedactions = redactionDetails.filter(r => r.count > 0);
    const totalRedactions = filteredRedactions.reduce((sum, r) => sum + r.count, 0);

    // Generate dates
    const baseDate = new Date('2026-01-15');
    const dateOffset = Math.floor(seededRandom(seed + 50) * 45);
    const processedDate = new Date(baseDate);
    processedDate.setDate(processedDate.getDate() - dateOffset);

    // Generate chain of custody
    const users = ['j.martinez', 'a.chen', 's.johnson', 'm.williams', 'r.patel'];
    const chainOfCustody: CustodyEntry[] = [
      { action: 'File uploaded', user: 'system', timestamp: new Date(processedDate.getTime() - 86400000 * 2), ip: '10.0.1.50' },
      { action: 'Automated scan initiated', user: 'compliance-bot', timestamp: new Date(processedDate.getTime() - 86400000), ip: '10.0.1.100' },
      { action: 'Redaction patterns identified', user: 'compliance-bot', timestamp: new Date(processedDate.getTime() - 43200000), ip: '10.0.1.100' },
      { action: 'Redactions applied', user: 'system', timestamp: new Date(processedDate.getTime() - 7200000), ip: '10.0.1.50' },
      { action: status === 'Processed' ? 'Review completed' : status === 'In Review' ? 'Pending review' : status === 'Failed' ? 'Processing failed' : 'Awaiting processing', user: users[Math.floor(seededRandom(seed + 60) * users.length)], timestamp: processedDate, ip: `192.168.1.${Math.floor(seededRandom(seed + 61) * 254) + 1}` },
    ];

    // Generate JSON overlay preview
    const jsonOverlay = {
      documentId: `doc-${String(i + 1).padStart(4, '0')}`,
      processingVersion: '2.4.1',
      policy: file.policy,
      redactions: filteredRedactions.map(r => ({
        type: r.category,
        instances: r.count,
        confidence: Number(r.confidence.toFixed(3)),
        locations: Array.from({ length: Math.min(r.count, 3) }, (_, j) => ({
          page: file.type === 'PDF' ? Math.floor(seededRandom(seed + 70 + j) * 10) + 1 : null,
          bbox: file.type !== 'Audio' ? [
            Math.floor(seededRandom(seed + 71 + j) * 400) + 50,
            Math.floor(seededRandom(seed + 72 + j) * 600) + 50,
            Math.floor(seededRandom(seed + 73 + j) * 100) + 50,
            20
          ] : null,
          timestamp: file.type === 'Video' || file.type === 'Audio' ? `${String(Math.floor(seededRandom(seed + 74 + j) * 59)).padStart(2, '0')}:${String(Math.floor(seededRandom(seed + 75 + j) * 59)).padStart(2, '0')}` : null
        }))
      })),
      metadata: {
        originalHash: `sha256:${Array.from({ length: 16 }, (_, j) => Math.floor(seededRandom(seed + 80 + j) * 16).toString(16)).join('')}...`,
        redactedHash: `sha256:${Array.from({ length: 16 }, (_, j) => Math.floor(seededRandom(seed + 96 + j) * 16).toString(16)).join('')}...`,
        processedAt: processedDate.toISOString(),
      }
    };

    documents.push({
      id: `doc-${i + 1}`,
      fileName: file.name,
      fileType: file.type,
      policy: file.policy,
      status,
      redactionsFound: totalRedactions,
      dateProcessed: processedDate,
      fileSize: file.type === 'Video' 
        ? `${(seededRandom(seed + 100) * 400 + 100).toFixed(1)} MB` 
        : file.type === 'Audio' 
          ? `${(seededRandom(seed + 101) * 40 + 10).toFixed(1)} MB` 
          : file.type === 'Image'
            ? `${(seededRandom(seed + 102) * 8 + 2).toFixed(1)} MB`
            : `${(seededRandom(seed + 103) * 4 + 0.5).toFixed(2)} MB`,
      pages: file.type === 'PDF' ? Math.floor(seededRandom(seed + 104) * 50) + 5 : undefined,
      duration: file.type === 'Video' 
        ? `${Math.floor(seededRandom(seed + 105) * 45) + 5}:${String(Math.floor(seededRandom(seed + 106) * 59)).padStart(2, '0')}`
        : file.type === 'Audio'
          ? `${Math.floor(seededRandom(seed + 107) * 30) + 10}:${String(Math.floor(seededRandom(seed + 108) * 59)).padStart(2, '0')}`
          : undefined,
      redactionDetails: filteredRedactions,
      chainOfCustody,
      jsonOverlay,
    });
  }

  return documents.sort((a, b) => b.dateProcessed.getTime() - a.dateProcessed.getTime());
};

const generatePolicies = (documents: Document[]): Policy[] => {
  const countByPolicy = (policy: PolicyType) => documents.filter(d => d.policy === policy).length;
  
  return [
    {
      id: 'policy-1',
      name: 'FOIA Standard Release',
      type: 'FOIA',
      status: 'Active',
      description: 'Freedom of Information Act request processing. Identifies and redacts personal identifiers, classified markers, and deliberative process content.',
      documentCount: countByPolicy('FOIA'),
      rules: [
        { id: 'r1', name: 'Redact SSN Patterns', description: 'Detects and redacts Social Security Numbers in XXX-XX-XXXX format', status: 'Active', pattern: '\\d{3}-\\d{2}-\\d{4}' },
        { id: 'r2', name: 'Remove Personal Names', description: 'Uses NER to identify and flag personal names for exemption 6/7(C) review', status: 'Active' },
        { id: 'r3', name: 'Classification Markers', description: 'Detects SECRET, CONFIDENTIAL, TOP SECRET markings for exemption 1 withholding', status: 'Active', pattern: 'SECRET|CONFIDENTIAL|TOP SECRET' },
        { id: 'r4', name: 'Internal Phone Numbers', description: 'Redacts government agency internal phone extensions', status: 'Active' },
        { id: 'r5', name: 'Email Address Detection', description: 'Identifies and redacts .gov and .mil email addresses', status: 'Draft' },
      ],
    },
    {
      id: 'policy-2',
      name: 'HIPAA PHI Protection',
      type: 'HIPAA',
      status: 'Active',
      description: 'Comprehensive Protected Health Information detection covering all 18 HIPAA identifiers for healthcare data.',
      documentCount: countByPolicy('HIPAA'),
      rules: [
        { id: 'r6', name: 'Patient Name Detection', description: 'Identifies patient names in medical context using contextual NER', status: 'Active' },
        { id: 'r7', name: 'Medical Record Numbers', description: 'Detects MRN patterns and hospital-specific identifiers', status: 'Active', pattern: 'MRN:\\s*\\d+' },
        { id: 'r8', name: 'Remove Facial Data', description: 'ML-based face detection and blurring for images and video', status: 'Active' },
        { id: 'r9', name: 'Strip PHI from Transcripts', description: 'Audio transcription pipeline with PHI pattern matching', status: 'Active' },
        { id: 'r10', name: 'Date Generalization', description: 'Converts specific dates to year-only format per Safe Harbor', status: 'Active' },
        { id: 'r11', name: 'Geographic Subdivision', description: 'Truncates geographic data to state level', status: 'Active' },
      ],
    },
    {
      id: 'policy-3',
      name: 'FERPA Education Records',
      type: 'FERPA',
      status: 'Active',
      description: 'Family Educational Rights and Privacy Act compliance for student education records and academic data.',
      documentCount: countByPolicy('FERPA'),
      rules: [
        { id: 'r12', name: 'Student ID Detection', description: 'Identifies student identification numbers in various formats', status: 'Active' },
        { id: 'r13', name: 'Grade Information Redaction', description: 'Removes GPA, letter grades, and academic standing from third-party disclosures', status: 'Active' },
        { id: 'r14', name: 'Disciplinary Record Protection', description: 'Withholds disciplinary actions unless authorized under exception', status: 'Active' },
        { id: 'r15', name: 'Parent/Guardian Info', description: 'Redacts parent contact information and financial data', status: 'Active' },
        { id: 'r16', name: 'Special Education Records', description: 'Enhanced protection for IEP and disability-related documentation', status: 'Draft' },
      ],
    },
    {
      id: 'policy-4',
      name: 'Custom Internal Policy',
      type: 'Custom',
      status: 'Active',
      description: 'Organization-specific redaction rules for internal documents, HR records, and confidential communications.',
      documentCount: countByPolicy('Custom'),
      rules: [
        { id: 'r17', name: 'Employee SSN Redaction', description: 'Removes employee Social Security Numbers from HR documents', status: 'Active' },
        { id: 'r18', name: 'Salary Information', description: 'Redacts compensation data except for required disclosures', status: 'Active' },
        { id: 'r19', name: 'Board Member Names', description: 'Option to anonymize board member identities in meeting recordings', status: 'Draft' },
        { id: 'r20', name: 'Trade Secret Markers', description: 'Detects and flags proprietary information markers', status: 'Active' },
      ],
    },
  ];
};

const generateAuditLog = (documents: Document[]): AuditEntry[] => {
  const users = ['j.martinez', 'a.chen', 's.johnson', 'm.williams', 'r.patel', 'k.thompson', 'compliance-bot', 'system'];
  const actions: AuditEntry['action'][] = ['Viewed', 'Downloaded', 'Processed', 'Shared', 'Approved', 'Rejected', 'Modified'];
  const actionWeights = [0.3, 0.2, 0.2, 0.1, 0.1, 0.05, 0.05];

  const entries: AuditEntry[] = [];
  const baseDate = new Date('2026-02-10T18:00:00');

  for (let i = 0; i < 35; i++) {
    const seed = i * 500;
    const doc = documents[Math.floor(seededRandom(seed) * documents.length)];
    
    // Weighted action selection
    const actionRand = seededRandom(seed + 1);
    let cumulative = 0;
    let action: AuditEntry['action'] = 'Viewed';
    for (let j = 0; j < actions.length; j++) {
      cumulative += actionWeights[j];
      if (actionRand < cumulative) {
        action = actions[j];
        break;
      }
    }

    const hoursAgo = seededRandom(seed + 2) * 168; // up to 7 days
    const timestamp = new Date(baseDate.getTime() - hoursAgo * 3600000);

    const user = action === 'Processed' ? 'compliance-bot' : users[Math.floor(seededRandom(seed + 3) * (users.length - 1))];

    let details: string | undefined;
    if (action === 'Downloaded') {
      details = seededRandom(seed + 4) > 0.5 ? 'Redacted version' : 'Original version';
    } else if (action === 'Shared') {
      details = `Shared with external: ${['legal@partner.com', 'auditor@firm.com', 'regulator@agency.gov'][Math.floor(seededRandom(seed + 5) * 3)]}`;
    } else if (action === 'Rejected') {
      details = 'Insufficient redaction coverage';
    }

    entries.push({
      id: `audit-${i + 1}`,
      user,
      action,
      fileName: doc.fileName,
      policy: doc.policy,
      timestamp,
      ip: `192.168.${Math.floor(seededRandom(seed + 6) * 10)}.${Math.floor(seededRandom(seed + 7) * 254) + 1}`,
      details,
    });
  }

  return entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

// Components
const FileIcon = ({ type }: { type: FileType }) => {
  const iconProps = { size: 16, style: { color: colors.muted, flexShrink: 0 } };
  switch (type) {
    case 'Video': return <Film {...iconProps} />;
    case 'Audio': return <Mic {...iconProps} />;
    case 'Image': return <Image {...iconProps} />;
    default: return <FileText {...iconProps} />;
  }
};

const StatusBadge = ({ status }: { status: Status }) => {
  const statusColors: Record<Status, string> = {
    Processed: colors.success,
    Pending: colors.warning,
    Failed: colors.destructive,
    'In Review': colors.primary,
  };

  return (
    <span style={{ color: statusColors[status], fontSize: 11, fontWeight: 500 }}>
      {status}
    </span>
  );
};

const PolicyBadge = ({ policy }: { policy: PolicyType }) => {
  return (
    <span style={{
      color: colors.muted,
      fontSize: 11,
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    }}>
      {policy}
    </span>
  );
};

const ActionBadge = ({ action }: { action: AuditEntry['action'] }) => {
  const actionColors: Record<AuditEntry['action'], string> = {
    Viewed: colors.muted,
    Downloaded: colors.primary,
    Processed: colors.success,
    Shared: colors.warning,
    Approved: colors.success,
    Rejected: colors.destructive,
    Modified: colors.warning,
  };

  return (
    <span style={{ color: actionColors[action], fontSize: 13 }}>
      {action}
    </span>
  );
};

const SortIndicator = ({ field, sortField, sortDirection }: { field: string; sortField: string; sortDirection: 'asc' | 'desc' }) => {
  if (sortField !== field) return null;
  return <span style={{ marginLeft: 4 }}>{sortDirection === 'asc' ? '↑' : '↓'}</span>;
};

export default function ComplianceDashboard() {
  const [documents] = useState<Document[]>(() => generateDocuments());
  const [policies] = useState<Policy[]>(() => generatePolicies(documents));
  const [auditLog] = useState<AuditEntry[]>(() => generateAuditLog(documents));

  const [activeTab, setActiveTab] = useState<'documents' | 'policies' | 'audit'>('documents');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showJsonOverlay, setShowJsonOverlay] = useState(false);
  const [expandedPolicies, setExpandedPolicies] = useState<Set<string>>(new Set());

  const [sortField, setSortField] = useState<keyof Document>('dateProcessed');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterPolicy, setFilterPolicy] = useState<PolicyType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<Status | 'all'>('all');
  const [filterType, setFilterType] = useState<FileType | 'all'>('all');

  const [auditFilterAction, setAuditFilterAction] = useState<AuditEntry['action'] | 'all'>('all');
  const [auditFilterUser, setAuditFilterUser] = useState<string>('all');

  // Stats - accurate counts
  const stats = useMemo(() => {
    const totalFiles = documents.length;
    const processedCount = documents.filter(d => d.status === 'Processed').length;
    const activePolicies = policies.filter(p => p.status === 'Active').length;
    const totalRedactions = documents.reduce((sum, d) => sum + d.redactionsFound, 0);
    const pendingReview = documents.filter(d => d.status === 'In Review' || d.status === 'Pending').length;
    return { totalFiles, processedCount, activePolicies, totalRedactions, pendingReview };
  }, [documents, policies]);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    let filtered = [...documents];
    if (filterPolicy !== 'all') filtered = filtered.filter(d => d.policy === filterPolicy);
    if (filterStatus !== 'all') filtered = filtered.filter(d => d.status === filterStatus);
    if (filterType !== 'all') filtered = filtered.filter(d => d.fileType === filterType);

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

  // Filtered audit log
  const filteredAuditLog = useMemo(() => {
    let filtered = [...auditLog];
    if (auditFilterAction !== 'all') filtered = filtered.filter(e => e.action === auditFilterAction);
    if (auditFilterUser !== 'all') filtered = filtered.filter(e => e.user === auditFilterUser);
    return filtered;
  }, [auditLog, auditFilterAction, auditFilterUser]);

  const auditUsers = useMemo(() => [...new Set(auditLog.map(e => e.user))].sort(), [auditLog]);

  const handleSort = (field: keyof Document) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const togglePolicyExpand = (policyId: string) => {
    setExpandedPolicies(prev => {
      const next = new Set(prev);
      if (next.has(policyId)) next.delete(policyId);
      else next.add(policyId);
      return next;
    });
  };

  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (date: Date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const formatDateTime = (date: Date) => `${formatDate(date)} ${formatTime(date)}`;

  const thStyle: React.CSSProperties = {
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: 500,
    color: colors.muted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    cursor: 'pointer',
    userSelect: 'none',
  };

  const tdStyle: React.CSSProperties = {
    padding: '12px 16px',
  };

  const selectStyle: React.CSSProperties = {
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: 4,
    padding: '6px 12px',
    color: colors.text,
    fontSize: 13,
    cursor: 'pointer',
  };

  return (
    <div style={{
      backgroundColor: colors.bg,
      color: colors.text,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <header style={{
        padding: '16px 24px',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
      }}>
        <Link
          href="/"
          style={{
            color: colors.muted,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
          }}
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <div style={{ width: 1, height: 16, backgroundColor: colors.border }} />
        <span style={{ fontSize: 15, fontWeight: 500 }}>Compliance Automation</span>
      </header>

      {/* Stats */}
      <div style={{
        padding: '24px',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        gap: 48,
      }}>
        <div>
          <div style={{ fontSize: 32, fontWeight: 500, lineHeight: 1 }}>{stats.totalFiles}</div>
          <div style={{ fontSize: 11, color: colors.muted, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Files</div>
        </div>
        <div>
          <div style={{ fontSize: 32, fontWeight: 500, lineHeight: 1, color: colors.success }}>{stats.processedCount}</div>
          <div style={{ fontSize: 11, color: colors.muted, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Processed</div>
        </div>
        <div>
          <div style={{ fontSize: 32, fontWeight: 500, lineHeight: 1 }}>{stats.activePolicies}</div>
          <div style={{ fontSize: 11, color: colors.muted, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Policies</div>
        </div>
        <div>
          <div style={{ fontSize: 32, fontWeight: 500, lineHeight: 1 }}>{stats.totalRedactions.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: colors.muted, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Redactions</div>
        </div>
        <div>
          <div style={{ fontSize: 32, fontWeight: 500, lineHeight: 1, color: stats.pendingReview > 0 ? colors.warning : colors.text }}>{stats.pendingReview}</div>
          <div style={{ fontSize: 11, color: colors.muted, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Review</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        padding: '0 24px',
        borderBottom: `1px solid ${colors.border}`,
        display: 'flex',
        gap: 24,
      }}>
        {(['documents', 'policies', 'audit'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab !== 'documents') setSelectedDocument(null);
            }}
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
              textTransform: 'capitalize',
            }}
          >
            {tab === 'audit' ? 'Audit Log' : tab}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Content area */}
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'documents' && (
            <>
              {/* Filters */}
              <div style={{
                padding: '12px 24px',
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex',
                gap: 12,
                alignItems: 'center',
              }}>
                <select value={filterPolicy} onChange={e => setFilterPolicy(e.target.value as PolicyType | 'all')} style={selectStyle}>
                  <option value="all">All Policies</option>
                  <option value="FOIA">FOIA</option>
                  <option value="HIPAA">HIPAA</option>
                  <option value="FERPA">FERPA</option>
                  <option value="Custom">Custom</option>
                </select>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as Status | 'all')} style={selectStyle}>
                  <option value="all">All Statuses</option>
                  <option value="Processed">Processed</option>
                  <option value="Pending">Pending</option>
                  <option value="In Review">In Review</option>
                  <option value="Failed">Failed</option>
                </select>
                <select value={filterType} onChange={e => setFilterType(e.target.value as FileType | 'all')} style={selectStyle}>
                  <option value="all">All Types</option>
                  <option value="PDF">PDF</option>
                  <option value="Video">Video</option>
                  <option value="Audio">Audio</option>
                  <option value="Image">Image</option>
                </select>
                <span style={{ fontSize: 11, color: colors.muted, marginLeft: 'auto' }}>
                  {filteredDocuments.length} of {documents.length} documents
                </span>
              </div>

              {/* Table */}
              <div style={{ flex: 1, overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <th onClick={() => handleSort('fileName')} style={{ ...thStyle, paddingLeft: 24 }}>
                        File Name<SortIndicator field="fileName" sortField={sortField} sortDirection={sortDirection} />
                      </th>
                      <th onClick={() => handleSort('fileType')} style={thStyle}>
                        Type<SortIndicator field="fileType" sortField={sortField} sortDirection={sortDirection} />
                      </th>
                      <th style={{ ...thStyle, cursor: 'default' }}>Policy</th>
                      <th onClick={() => handleSort('status')} style={thStyle}>
                        Status<SortIndicator field="status" sortField={sortField} sortDirection={sortDirection} />
                      </th>
                      <th onClick={() => handleSort('redactionsFound')} style={{ ...thStyle, textAlign: 'right' }}>
                        Redactions<SortIndicator field="redactionsFound" sortField={sortField} sortDirection={sortDirection} />
                      </th>
                      <th onClick={() => handleSort('dateProcessed')} style={{ ...thStyle, textAlign: 'right', paddingRight: 24 }}>
                        Date<SortIndicator field="dateProcessed" sortField={sortField} sortDirection={sortDirection} />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocuments.map(doc => (
                      <tr
                        key={doc.id}
                        onClick={() => { setSelectedDocument(doc); setShowJsonOverlay(false); }}
                        style={{
                          borderBottom: `1px solid ${colors.border}`,
                          cursor: 'pointer',
                          backgroundColor: selectedDocument?.id === doc.id ? colors.surface : 'transparent',
                        }}
                        onMouseEnter={e => { if (selectedDocument?.id !== doc.id) e.currentTarget.style.backgroundColor = colors.surface; }}
                        onMouseLeave={e => { if (selectedDocument?.id !== doc.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <td style={{ ...tdStyle, paddingLeft: 24 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FileIcon type={doc.fileType} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.fileName}</span>
                          </div>
                        </td>
                        <td style={{ ...tdStyle, color: colors.muted }}>{doc.fileType}</td>
                        <td style={tdStyle}><PolicyBadge policy={doc.policy} /></td>
                        <td style={tdStyle}><StatusBadge status={doc.status} /></td>
                        <td style={{ ...tdStyle, textAlign: 'right' }}>{doc.redactionsFound}</td>
                        <td style={{ ...tdStyle, textAlign: 'right', paddingRight: 24, color: colors.muted }}>{formatDate(doc.dateProcessed)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'policies' && (
            <div style={{ padding: 24, overflow: 'auto' }}>
              {policies.map(policy => (
                <div
                  key={policy.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 4,
                    marginBottom: 12,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <div
                    onClick={() => togglePolicyExpand(policy.id)}
                    style={{
                      padding: 16,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                    }}
                  >
                    <div style={{ marginTop: 2 }}>
                      {expandedPolicies.has(policy.id) 
                        ? <ChevronDown size={16} style={{ color: colors.muted }} /> 
                        : <ChevronRight size={16} style={{ color: colors.muted }} />
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 15, fontWeight: 500 }}>{policy.name}</span>
                        <span style={{
                          fontSize: 11,
                          color: policy.status === 'Active' ? colors.success : colors.muted,
                          fontWeight: 500,
                        }}>
                          {policy.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: colors.muted, marginTop: 4 }}>{policy.description}</div>
                      <div style={{ fontSize: 11, color: colors.muted, marginTop: 8 }}>
                        {policy.documentCount} documents · {policy.rules.length} rules
                      </div>
                    </div>
                  </div>
                  
                  {expandedPolicies.has(policy.id) && (
                    <div style={{ borderTop: `1px solid ${colors.border}`, padding: 16 }}>
                      <div style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                        Rules
                      </div>
                      {policy.rules.map(rule => (
                        <div
                          key={rule.id}
                          style={{
                            padding: 12,
                            backgroundColor: colors.surface2,
                            borderRadius: 4,
                            marginBottom: 8,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>{rule.name}</span>
                            <span style={{
                              fontSize: 11,
                              color: rule.status === 'Active' ? colors.success : colors.muted,
                            }}>
                              {rule.status}
                            </span>
                          </div>
                          <div style={{ fontSize: 13, color: colors.muted }}>{rule.description}</div>
                          {rule.pattern && (
                            <div style={{
                              fontSize: 11,
                              color: colors.muted,
                              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                              marginTop: 8,
                              padding: '4px 8px',
                              backgroundColor: colors.bg,
                              borderRadius: 2,
                              display: 'inline-block',
                            }}>
                              {rule.pattern}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'audit' && (
            <>
              {/* Audit Filters */}
              <div style={{
                padding: '12px 24px',
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex',
                gap: 12,
                alignItems: 'center',
              }}>
                <select value={auditFilterAction} onChange={e => setAuditFilterAction(e.target.value as AuditEntry['action'] | 'all')} style={selectStyle}>
                  <option value="all">All Actions</option>
                  <option value="Viewed">Viewed</option>
                  <option value="Downloaded">Downloaded</option>
                  <option value="Processed">Processed</option>
                  <option value="Shared">Shared</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Modified">Modified</option>
                </select>
                <select value={auditFilterUser} onChange={e => setAuditFilterUser(e.target.value)} style={selectStyle}>
                  <option value="all">All Users</option>
                  {auditUsers.map(user => (
                    <option key={user} value={user}>{user}</option>
                  ))}
                </select>
                <span style={{ fontSize: 11, color: colors.muted, marginLeft: 'auto' }}>
                  {filteredAuditLog.length} entries
                </span>
              </div>

              {/* Audit Table */}
              <div style={{ flex: 1, overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <th style={{ ...thStyle, paddingLeft: 24, cursor: 'default' }}>Timestamp</th>
                      <th style={{ ...thStyle, cursor: 'default' }}>User</th>
                      <th style={{ ...thStyle, cursor: 'default' }}>Action</th>
                      <th style={{ ...thStyle, cursor: 'default' }}>File</th>
                      <th style={{ ...thStyle, cursor: 'default' }}>Policy</th>
                      <th style={{ ...thStyle, paddingRight: 24, cursor: 'default' }}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAuditLog.map(entry => (
                      <tr key={entry.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                        <td style={{ ...tdStyle, paddingLeft: 24, color: colors.muted, whiteSpace: 'nowrap' }}>
                          {formatDateTime(entry.timestamp)}
                        </td>
                        <td style={tdStyle}>{entry.user}</td>
                        <td style={tdStyle}><ActionBadge action={entry.action} /></td>
                        <td style={{ ...tdStyle, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {entry.fileName}
                        </td>
                        <td style={tdStyle}><PolicyBadge policy={entry.policy} /></td>
                        <td style={{ ...tdStyle, paddingRight: 24, color: colors.muted, fontSize: 12 }}>
                          {entry.details || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Document detail panel */}
        {selectedDocument && activeTab === 'documents' && (
          <div style={{
            width: 420,
            borderLeft: `1px solid ${colors.border}`,
            backgroundColor: colors.surface,
            overflow: 'auto',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Panel header */}
            <div style={{
              padding: '12px 16px',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setShowJsonOverlay(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px 8px',
                    fontSize: 11,
                    fontWeight: 500,
                    color: !showJsonOverlay ? colors.text : colors.muted,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Details
                </button>
                <button
                  onClick={() => setShowJsonOverlay(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '4px 8px',
                    fontSize: 11,
                    fontWeight: 500,
                    color: showJsonOverlay ? colors.text : colors.muted,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  JSON
                </button>
              </div>
              <button
                onClick={() => setSelectedDocument(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.muted,
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {!showJsonOverlay ? (
              <div style={{ padding: 16, overflow: 'auto', flex: 1 }}>
                {/* File info */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                    <FileIcon type={selectedDocument.fileType} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 500, wordBreak: 'break-word', lineHeight: 1.4 }}>
                        {selectedDocument.fileName}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    <StatusBadge status={selectedDocument.status} />
                    <PolicyBadge policy={selectedDocument.policy} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: colors.muted, marginBottom: 2 }}>Type</div>
                      <div style={{ fontSize: 13 }}>{selectedDocument.fileType}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: colors.muted, marginBottom: 2 }}>Size</div>
                      <div style={{ fontSize: 13 }}>{selectedDocument.fileSize}</div>
                    </div>
                    {selectedDocument.pages && (
                      <div>
                        <div style={{ fontSize: 11, color: colors.muted, marginBottom: 2 }}>Pages</div>
                        <div style={{ fontSize: 13 }}>{selectedDocument.pages}</div>
                      </div>
                    )}
                    {selectedDocument.duration && (
                      <div>
                        <div style={{ fontSize: 11, color: colors.muted, marginBottom: 2 }}>Duration</div>
                        <div style={{ fontSize: 13 }}>{selectedDocument.duration}</div>
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: 11, color: colors.muted, marginBottom: 2 }}>Processed</div>
                      <div style={{ fontSize: 13 }}>{formatDate(selectedDocument.dateProcessed)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: colors.muted, marginBottom: 2 }}>Total Redactions</div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{selectedDocument.redactionsFound}</div>
                    </div>
                  </div>
                </div>

                {/* Redaction summary */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                    Redaction Summary
                  </div>
                  {selectedDocument.status === 'Failed' ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: 12,
                      backgroundColor: colors.surface2,
                      borderRadius: 4,
                      color: colors.destructive,
                    }}>
                      <AlertCircle size={16} />
                      <span style={{ fontSize: 13 }}>Processing failed. Please retry or contact support.</span>
                    </div>
                  ) : selectedDocument.redactionDetails.length === 0 ? (
                    <div style={{
                      padding: 12,
                      backgroundColor: colors.surface2,
                      borderRadius: 4,
                      color: colors.muted,
                      fontSize: 13,
                    }}>
                      No redactions detected.
                    </div>
                  ) : (
                    selectedDocument.redactionDetails.map((detail, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px 12px',
                          backgroundColor: colors.surface2,
                          borderRadius: 4,
                          marginBottom: 6,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>{detail.category}</div>
                          <div style={{ fontSize: 11, color: colors.muted }}>{(detail.confidence * 100).toFixed(0)}% confidence</div>
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 500 }}>{detail.count}</div>
                      </div>
                    ))
                  )}
                </div>

                {/* Chain of custody */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                    Chain of Custody
                  </div>
                  <div style={{ position: 'relative' }}>
                    {selectedDocument.chainOfCustody.map((entry, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          gap: 12,
                          paddingBottom: i < selectedDocument.chainOfCustody.length - 1 ? 16 : 0,
                          position: 'relative',
                        }}
                      >
                        <div style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: i === selectedDocument.chainOfCustody.length - 1 ? colors.primary : colors.muted,
                          marginTop: 5,
                          flexShrink: 0,
                          position: 'relative',
                          zIndex: 1,
                        }} />
                        {i < selectedDocument.chainOfCustody.length - 1 && (
                          <div style={{
                            position: 'absolute',
                            left: 3,
                            top: 13,
                            bottom: 0,
                            width: 2,
                            backgroundColor: colors.border,
                          }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13 }}>{entry.action}</div>
                          <div style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                            {entry.user} · {formatDateTime(entry.timestamp)}
                          </div>
                          {entry.ip && (
                            <div style={{ fontSize: 11, color: colors.muted }}>IP: {entry.ip}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
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
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <Download size={14} />
                    Download Redacted
                  </button>
                  <button
                    style={{
                      padding: '10px 12px',
                      backgroundColor: 'transparent',
                      color: colors.text,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 4,
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    title="View Original"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            ) : (
              /* JSON Overlay View */
              <div style={{ padding: 16, overflow: 'auto', flex: 1 }}>
                <div style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                  Processing Output
                </div>
                <pre style={{
                  backgroundColor: colors.surface2,
                  borderRadius: 4,
                  padding: 12,
                  fontSize: 11,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: 1.5,
                  color: colors.text,
                  margin: 0,
                }}>
                  {JSON.stringify(selectedDocument.jsonOverlay, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
