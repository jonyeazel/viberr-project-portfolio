'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ExternalLink, Check, X, MessageCircle } from 'lucide-react';

// Types
interface CriteriaScore {
  score: number;
  evidence: string;
  notes: string;
}

interface SustainabilityScores {
  ethicalSourcing: CriteriaScore;
  environmentalImpact: CriteriaScore;
  fairLabor: CriteriaScore;
  packagingShipping: CriteriaScore;
  certifications: CriteriaScore;
}

interface Submission {
  id: string;
  shopName: string;
  website: string;
  description: string;
  category: 'Fashion' | 'Food' | 'Home' | 'Beauty' | 'Electronics';
  location: string;
  submittedBy: string;
  submittedAt: Date;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Needs Info';
  scores: SustainabilityScores;
  totalScore: number;
}

// Data generation
const shopNames = {
  Fashion: ['Evergreen Threads', 'Moss & Stone Apparel', 'Pure Path Clothing', 'Willow Wear', 'Terra Stitch', 'Canopy Collective', 'Sage & Linen', 'Rootwear Co'],
  Food: ['Harvest Moon Market', 'Green Table Provisions', 'Sprout & Soil', 'The Mindful Pantry', 'Wild Acre Foods', 'Earthbound Grocers', 'Sunflower Kitchen', 'Meadow Fresh Co'],
  Home: ['Nest & Nature', 'Eco Haven Home', 'Birch & Bone', 'Terra Casa', 'Wildwood Living', 'Grove Home Goods', 'Oak & Earth', 'Sustainable Shelter'],
  Beauty: ['Bloom Botanicals', 'Pure Petal', 'Leaf & Root Beauty', 'Verdant Skin', 'Nature\'s Palette', 'Fern & Flora', 'Clarity Cosmetics', 'Essential Earth'],
  Electronics: ['Green Circuit', 'Eco Tech Solutions', 'Sustainable Systems', 'Renewatech', 'Clean Energy Devices', 'Circular Electronics', 'Future Forward Tech', 'Planet Positive Tech']
};

const locations = ['Portland, OR', 'Austin, TX', 'Brooklyn, NY', 'San Francisco, CA', 'Seattle, WA', 'Denver, CO', 'Minneapolis, MN', 'Chicago, IL', 'Boston, MA', 'Los Angeles, CA'];
const submitters = ['sarah.m@email.com', 'james.c@outlook.com', 'eco.advocate@gmail.com', 'green.living@yahoo.com', 'sustainable.shopper@email.com', 'nature.lover@pm.me', 'conscious.consumer@email.com', 'earth.first@outlook.com'];

const evidenceOptions = {
  ethicalSourcing: ['Direct partnerships with artisan cooperatives', 'Transparent supply chain documentation', 'Third-party verified sourcing audits', 'Local supplier preference policy', 'Indigenous community partnerships', 'Small-scale farmer direct trade'],
  environmentalImpact: ['Carbon neutral operations since 2020', 'Renewable energy powered facilities', 'Zero-waste manufacturing process', 'Biodegradable materials only', 'Water recycling systems in place', 'Regenerative agriculture practices'],
  fairLabor: ['Living wage certification', 'Fair Trade USA verified', 'Worker ownership model', 'On-site childcare provided', 'Healthcare benefits for all staff', 'SA8000 certified workplace'],
  packagingShipping: ['100% plastic-free packaging', 'Carbon offset shipping standard', 'Compostable mailers used', 'Reusable packaging program', 'Local delivery by cargo bike', 'Minimal packaging policy'],
  certifications: ['B-Corp Certified', 'USDA Organic', '1% for the Planet member', 'Climate Neutral Certified', 'Cradle to Cradle Certified', 'GOTS certified textiles']
};

const notesOptions = {
  high: ['Exceeds industry standards', 'Exemplary practices documented', 'Strong verification available', 'Industry leader in this area'],
  medium: ['Meets baseline requirements', 'Some documentation provided', 'Improvement roadmap in place', 'Partial implementation noted'],
  low: ['Limited evidence provided', 'Requires further verification', 'Below industry standards', 'Significant gaps identified']
};

function generateScore(): CriteriaScore {
  const score = Math.floor(Math.random() * 21);
  const category = score >= 14 ? 'high' : score >= 8 ? 'medium' : 'low';
  const evidenceKey = ['ethicalSourcing', 'environmentalImpact', 'fairLabor', 'packagingShipping', 'certifications'][Math.floor(Math.random() * 5)] as keyof typeof evidenceOptions;
  return {
    score,
    evidence: evidenceOptions[evidenceKey][Math.floor(Math.random() * evidenceOptions[evidenceKey].length)],
    notes: notesOptions[category][Math.floor(Math.random() * notesOptions[category].length)]
  };
}

function generateSubmissions(): Submission[] {
  const submissions: Submission[] = [];
  const categories: Array<'Fashion' | 'Food' | 'Home' | 'Beauty' | 'Electronics'> = ['Fashion', 'Food', 'Home', 'Beauty', 'Electronics'];
  const statuses: Array<'Pending' | 'Approved' | 'Rejected' | 'Needs Info'> = ['Pending', 'Approved', 'Rejected', 'Needs Info'];
  
  for (let i = 0; i < 24; i++) {
    const category = categories[i % 5];
    const shopName = shopNames[category][Math.floor(Math.random() * shopNames[category].length)];
    const scores: SustainabilityScores = {
      ethicalSourcing: generateScore(),
      environmentalImpact: generateScore(),
      fairLabor: generateScore(),
      packagingShipping: generateScore(),
      certifications: generateScore()
    };
    const totalScore = scores.ethicalSourcing.score + scores.environmentalImpact.score + scores.fairLabor.score + scores.packagingShipping.score + scores.certifications.score;
    
    let status: 'Pending' | 'Approved' | 'Rejected' | 'Needs Info';
    if (i < 8) status = 'Pending';
    else if (i < 14) status = 'Approved';
    else if (i < 20) status = 'Rejected';
    else status = 'Needs Info';
    
    submissions.push({
      id: `sub-${i + 1}`,
      shopName: `${shopName}${i > 7 ? ` ${Math.floor(i / 8) + 1}` : ''}`,
      website: `https://${shopName.toLowerCase().replace(/[^a-z]/g, '')}.com`,
      description: `A ${category.toLowerCase()} retailer committed to sustainable practices and ethical business operations. Founded with the mission to provide environmentally conscious products without compromising on quality.`,
      category,
      location: locations[i % locations.length],
      submittedBy: submitters[i % submitters.length],
      submittedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      status,
      scores,
      totalScore
    });
  }
  
  return submissions.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
}

const initialSubmissions = generateSubmissions();

// Email templates
function generateEmail(submission: Submission): string {
  if (submission.status === 'Approved' || submission.totalScore >= 70) {
    return `Dear ${submission.submittedBy.split('@')[0]},

Thank you for submitting ${submission.shopName} for inclusion in our sustainable marketplace.

We are pleased to inform you that after a thorough review of the sustainability practices, ${submission.shopName} has been approved for listing. The shop achieved an overall sustainability score of ${submission.totalScore}/100.

Key strengths identified:
${submission.scores.ethicalSourcing.score >= 14 ? `- Ethical Sourcing: ${submission.scores.ethicalSourcing.evidence}\n` : ''}${submission.scores.environmentalImpact.score >= 14 ? `- Environmental Impact: ${submission.scores.environmentalImpact.evidence}\n` : ''}${submission.scores.certifications.score >= 14 ? `- Certifications: ${submission.scores.certifications.evidence}\n` : ''}
${submission.shopName} will appear in our directory within 48 hours. We will reach out regarding profile optimization and promotional opportunities.

Welcome to our community of sustainable businesses.

Best regards,
Sustainability Review Team`;
  } else if (submission.status === 'Needs Info') {
    return `Dear ${submission.submittedBy.split('@')[0]},

Thank you for submitting ${submission.shopName} for review.

To complete our evaluation, we require additional information in the following areas:

${submission.scores.ethicalSourcing.score < 10 ? `- Ethical Sourcing: Please provide documentation of supplier relationships and sourcing practices.\n` : ''}${submission.scores.environmentalImpact.score < 10 ? `- Environmental Impact: We need verification of environmental claims and impact assessments.\n` : ''}${submission.scores.certifications.score < 10 ? `- Certifications: Please submit copies of any sustainability certifications held.\n` : ''}
Please reply to this email with the requested documentation within 14 days. Applications without response will be archived.

Best regards,
Sustainability Review Team`;
  } else {
    return `Dear ${submission.submittedBy.split('@')[0]},

Thank you for submitting ${submission.shopName} for consideration in our sustainable marketplace.

After careful review, we are unable to approve the listing at this time. The submission achieved a score of ${submission.totalScore}/100, which falls below our minimum threshold of 70 points.

Areas requiring improvement:
${submission.scores.ethicalSourcing.score < 14 ? `- Ethical Sourcing (${submission.scores.ethicalSourcing.score}/20): ${submission.scores.ethicalSourcing.notes}\n` : ''}${submission.scores.environmentalImpact.score < 14 ? `- Environmental Impact (${submission.scores.environmentalImpact.score}/20): ${submission.scores.environmentalImpact.notes}\n` : ''}${submission.scores.fairLabor.score < 14 ? `- Fair Labor (${submission.scores.fairLabor.score}/20): ${submission.scores.fairLabor.notes}\n` : ''}${submission.scores.packagingShipping.score < 14 ? `- Packaging & Shipping (${submission.scores.packagingShipping.score}/20): ${submission.scores.packagingShipping.notes}\n` : ''}${submission.scores.certifications.score < 14 ? `- Certifications (${submission.scores.certifications.score}/20): ${submission.scores.certifications.notes}\n` : ''}
We encourage resubmission after addressing these areas. Our sustainability guidelines are available at our website.

Best regards,
Sustainability Review Team`;
  }
}

// Components
function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="p-4" style={{ backgroundColor: '#fafaf9', borderRadius: '6px' }}>
      <div className="text-[13px]" style={{ color: '#737373' }}>{label}</div>
      <div className="text-[24px] font-semibold mt-1" style={{ color: accent || '#191919' }}>{value}</div>
    </div>
  );
}

function ScoreBar({ score, max = 20 }: { score: number; max?: number }) {
  const percentage = (score / max) * 100;
  const color = percentage >= 70 ? '#16a34a' : percentage >= 50 ? '#d97706' : '#dc2626';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: '#e5e5e3' }}>
        <div 
          className="h-full rounded-full transition-all duration-150 ease-out" 
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[13px] w-8 text-right" style={{ color: '#191919' }}>{score}/{max}</span>
    </div>
  );
}

export default function SustainabilityReviewPage() {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [scoreFilter, setScoreFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<'date' | 'score' | 'name'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [editedEmail, setEditedEmail] = useState<string>('');
  
  const selected = useMemo(() => submissions.find(s => s.id === selectedId), [submissions, selectedId]);
  
  const filteredSubmissions = useMemo(() => {
    let result = [...submissions];
    
    if (statusFilter !== 'All') {
      result = result.filter(s => s.status === statusFilter);
    }
    if (categoryFilter !== 'All') {
      result = result.filter(s => s.category === categoryFilter);
    }
    if (scoreFilter !== 'All') {
      if (scoreFilter === 'High') result = result.filter(s => s.totalScore >= 70);
      else if (scoreFilter === 'Medium') result = result.filter(s => s.totalScore >= 40 && s.totalScore < 70);
      else if (scoreFilter === 'Low') result = result.filter(s => s.totalScore < 40);
    }
    
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') cmp = a.submittedAt.getTime() - b.submittedAt.getTime();
      else if (sortField === 'score') cmp = a.totalScore - b.totalScore;
      else cmp = a.shopName.localeCompare(b.shopName);
      return sortDir === 'desc' ? -cmp : cmp;
    });
    
    return result;
  }, [submissions, statusFilter, categoryFilter, scoreFilter, sortField, sortDir]);
  
  const stats = useMemo(() => ({
    total: submissions.length,
    approved: submissions.filter(s => s.status === 'Approved').length,
    rejected: submissions.filter(s => s.status === 'Rejected').length,
    pending: submissions.filter(s => s.status === 'Pending').length,
    avgScore: Math.round(submissions.reduce((acc, s) => acc + s.totalScore, 0) / submissions.length)
  }), [submissions]);
  
  const handleSelect = (submission: Submission) => {
    setSelectedId(submission.id);
    setEditedEmail(generateEmail(submission));
  };
  
  const handleStatusChange = (newStatus: 'Approved' | 'Rejected' | 'Needs Info') => {
    if (!selectedId) return;
    setSubmissions(prev => prev.map(s => 
      s.id === selectedId ? { ...s, status: newStatus } : s
    ));
    const updated = submissions.find(s => s.id === selectedId);
    if (updated) {
      setEditedEmail(generateEmail({ ...updated, status: newStatus }));
    }
  };
  
  const toggleSort = (field: 'date' | 'score' | 'name') => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return '#16a34a';
      case 'Rejected': return '#dc2626';
      case 'Needs Info': return '#d97706';
      default: return '#737373';
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#fafaf9', color: '#191919' }}>
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 border-b" style={{ borderColor: '#e5e5e3' }}>
        <Link 
          href="/" 
          className="flex items-center gap-2 text-[13px] transition-opacity duration-150 ease-out hover:opacity-70"
          style={{ color: '#737373' }}
        >
          <ArrowLeft size={16} />
          Back
        </Link>
        <div className="h-4 w-px" style={{ backgroundColor: '#e5e5e3' }} />
        <h1 className="text-[18px] font-semibold">Sustainability Review</h1>
      </header>
      
      {/* Stats */}
      <div className="px-6 py-4 grid grid-cols-5 gap-4">
        <StatCard label="Submissions This Month" value={stats.total} />
        <StatCard label="Approved" value={stats.approved} accent="#16a34a" />
        <StatCard label="Rejected" value={stats.rejected} accent="#dc2626" />
        <StatCard label="Pending Review" value={stats.pending} accent="#d97706" />
        <StatCard label="Avg Score" value={stats.avgScore} accent="#2563eb" />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex min-h-0 px-6 pb-6 gap-4">
        {/* Submission queue */}
        <div className="flex-1 flex flex-col min-w-0 rounded-md overflow-hidden" style={{ backgroundColor: '#fafaf9' }}>
          {/* Filters */}
          <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: '#e5e5e3' }}>
            <span className="text-[13px]" style={{ color: '#737373' }}>Filter:</span>
            
            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="appearance-none text-[13px] px-3 py-1.5 pr-8 rounded cursor-pointer transition-colors duration-150 ease-out"
                style={{ backgroundColor: '#eeeeec', color: '#191919', border: '1px solid #e5e5e3' }}
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Needs Info">Needs Info</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#737373' }} />
            </div>
            
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="appearance-none text-[13px] px-3 py-1.5 pr-8 rounded cursor-pointer transition-colors duration-150 ease-out"
                style={{ backgroundColor: '#eeeeec', color: '#191919', border: '1px solid #e5e5e3' }}
              >
                <option value="All">All Categories</option>
                <option value="Fashion">Fashion</option>
                <option value="Food">Food</option>
                <option value="Home">Home</option>
                <option value="Beauty">Beauty</option>
                <option value="Electronics">Electronics</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#737373' }} />
            </div>
            
            <div className="relative">
              <select
                value={scoreFilter}
                onChange={e => setScoreFilter(e.target.value)}
                className="appearance-none text-[13px] px-3 py-1.5 pr-8 rounded cursor-pointer transition-colors duration-150 ease-out"
                style={{ backgroundColor: '#eeeeec', color: '#191919', border: '1px solid #e5e5e3' }}
              >
                <option value="All">All Scores</option>
                <option value="High">High (70+)</option>
                <option value="Medium">Medium (40-69)</option>
                <option value="Low">Low (&lt;40)</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#737373' }} />
            </div>
            
            <div className="flex-1" />
            
            <span className="text-[13px]" style={{ color: '#737373' }}>{filteredSubmissions.length} submissions</span>
          </div>
          
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_80px_100px] gap-4 px-4 py-2 text-[11px] uppercase tracking-wider border-b" style={{ borderColor: '#e5e5e3', color: '#737373' }}>
            <button onClick={() => toggleSort('name')} className="text-left hover:opacity-70 transition-opacity duration-150">
              Shop Name {sortField === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
            </button>
            <span>Category</span>
            <span>Submitted By</span>
            <button onClick={() => toggleSort('date')} className="text-left hover:opacity-70 transition-opacity duration-150">
              Date {sortField === 'date' && (sortDir === 'asc' ? '↑' : '↓')}
            </button>
            <button onClick={() => toggleSort('score')} className="text-left hover:opacity-70 transition-opacity duration-150">
              Score {sortField === 'score' && (sortDir === 'asc' ? '↑' : '↓')}
            </button>
            <span>Status</span>
          </div>
          
          {/* Table body */}
          <div className="flex-1 overflow-y-auto">
            {filteredSubmissions.map(submission => (
              <button
                key={submission.id}
                onClick={() => handleSelect(submission)}
                className="w-full grid grid-cols-[2fr_1fr_1fr_1fr_80px_100px] gap-4 px-4 py-3 text-left border-b transition-colors duration-150 ease-out"
                style={{ 
                  borderColor: '#e5e5e3',
                  backgroundColor: selectedId === submission.id ? '#eeeeec' : 'transparent'
                }}
              >
                <div>
                  <div className="text-[15px]" style={{ color: '#191919' }}>{submission.shopName}</div>
                  <div className="text-[11px] truncate" style={{ color: '#737373' }}>{submission.website}</div>
                </div>
                <div className="text-[13px] self-center" style={{ color: '#737373' }}>{submission.category}</div>
                <div className="text-[13px] self-center truncate" style={{ color: '#737373' }}>{submission.submittedBy}</div>
                <div className="text-[13px] self-center" style={{ color: '#737373' }}>
                  {submission.submittedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-[15px] font-semibold self-center" style={{ 
                  color: submission.totalScore >= 70 ? '#16a34a' : submission.totalScore >= 40 ? '#d97706' : '#dc2626' 
                }}>
                  {submission.totalScore}
                </div>
                <div 
                  className="text-[13px] self-center"
                  style={{ color: getStatusColor(submission.status) }}
                >
                  {submission.status}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Detail panel */}
        {selected ? (
          <div className="w-[480px] flex flex-col gap-4">
            {/* Shop info */}
            <div className="rounded-md p-4" style={{ backgroundColor: '#fafaf9' }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-[18px] font-semibold">{selected.shopName}</h2>
                  <a 
                    href={selected.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[13px] flex items-center gap-1 mt-1 transition-opacity duration-150 hover:opacity-70"
                    style={{ color: '#2563eb' }}
                  >
                    {selected.website} <ExternalLink size={12} />
                  </a>
                </div>
                <span 
                  className="text-[24px] font-semibold"
                  style={{ color: selected.totalScore >= 70 ? '#16a34a' : selected.totalScore >= 40 ? '#d97706' : '#dc2626' }}
                >
                  {selected.totalScore}
                </span>
              </div>
              <p className="text-[13px] leading-relaxed mb-4" style={{ color: '#737373' }}>{selected.description}</p>
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div>
                  <span style={{ color: '#737373' }}>Category</span>
                  <div style={{ color: '#191919' }}>{selected.category}</div>
                </div>
                <div>
                  <span style={{ color: '#737373' }}>Location</span>
                  <div style={{ color: '#191919' }}>{selected.location}</div>
                </div>
              </div>
            </div>
            
            {/* Scorecard */}
            <div className="rounded-md p-4" style={{ backgroundColor: '#fafaf9' }}>
              <h3 className="text-[15px] font-semibold mb-4">Sustainability Scorecard</h3>
              <div className="space-y-4">
                {[
                  { key: 'ethicalSourcing', label: 'Ethical Sourcing' },
                  { key: 'environmentalImpact', label: 'Environmental Impact' },
                  { key: 'fairLabor', label: 'Fair Labor Practices' },
                  { key: 'packagingShipping', label: 'Packaging & Shipping' },
                  { key: 'certifications', label: 'Certifications & Transparency' }
                ].map(({ key, label }) => {
                  const criteria = selected.scores[key as keyof SustainabilityScores];
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[13px]" style={{ color: '#191919' }}>{label}</span>
                      </div>
                      <ScoreBar score={criteria.score} />
                      <div className="mt-1 text-[11px]" style={{ color: '#737373' }}>
                        {criteria.evidence}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusChange('Approved')}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded text-[13px] font-semibold transition-opacity duration-150 hover:opacity-80"
                style={{ backgroundColor: '#16a34a', color: '#191919' }}
              >
                <Check size={16} /> Approve
              </button>
              <button
                onClick={() => handleStatusChange('Rejected')}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded text-[13px] font-semibold transition-opacity duration-150 hover:opacity-80"
                style={{ backgroundColor: '#dc2626', color: '#191919' }}
              >
                <X size={16} /> Reject
              </button>
              <button
                onClick={() => handleStatusChange('Needs Info')}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded text-[13px] font-semibold transition-opacity duration-150 hover:opacity-80"
                style={{ backgroundColor: '#d97706', color: '#191919' }}
              >
                <MessageCircle size={16} /> Request Info
              </button>
            </div>
            
            {/* Email preview */}
            <div className="flex-1 flex flex-col min-h-0 rounded-md overflow-hidden" style={{ backgroundColor: '#fafaf9' }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: '#e5e5e3' }}>
                <h3 className="text-[15px] font-semibold">Response Email</h3>
              </div>
              <textarea
                value={editedEmail}
                onChange={e => setEditedEmail(e.target.value)}
                className="flex-1 p-4 text-[13px] leading-relaxed resize-none focus:outline-none"
                style={{ backgroundColor: '#fafaf9', color: '#191919' }}
              />
              <div className="px-4 py-3 border-t flex justify-end" style={{ borderColor: '#e5e5e3' }}>
                <button
                  className="px-4 py-2 rounded text-[13px] font-semibold transition-opacity duration-150 hover:opacity-80"
                  style={{ backgroundColor: '#2563eb', color: '#191919' }}
                >
                  Send Response
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-[480px] flex items-center justify-center rounded-md" style={{ backgroundColor: '#fafaf9' }}>
            <p className="text-[15px]" style={{ color: '#737373' }}>Select a submission to review</p>
          </div>
        )}
      </div>
    </div>
  );
}
