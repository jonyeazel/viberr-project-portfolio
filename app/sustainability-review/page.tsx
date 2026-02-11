'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Check, X, Mail, ChevronDown } from 'lucide-react';

// Types
interface CriteriaScore {
  score: number;
  evidence: string;
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
  submitterName: string;
  submitterEmail: string;
  submittedAt: Date;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Needs Info';
  scores: SustainabilityScores;
  totalScore: number;
}

// 24 unique shop names - no duplicates
const uniqueShops: Array<{
  name: string;
  website: string;
  category: Submission['category'];
  description: string;
}> = [
  // Fashion
  { name: 'Grüne Erde', website: 'gruene-erde.com', category: 'Fashion', description: 'Austrian sustainable fashion house specializing in organic cotton and natural fibers. All production happens in certified facilities across Europe.' },
  { name: 'Naturkind Berlin', website: 'naturkind-berlin.de', category: 'Fashion', description: 'Berlin-based collective producing timeless garments from recycled materials. Known for their transparent supply chain documentation.' },
  { name: 'Everlane', website: 'everlane.com', category: 'Fashion', description: 'Radical transparency in sourcing and pricing. Each product page shows the true cost breakdown and factory conditions.' },
  { name: 'Reformation', website: 'thereformation.com', category: 'Fashion', description: 'Los Angeles label combining vintage-inspired design with sustainable practices. Uses deadstock fabrics and eco-friendly materials.' },
  { name: 'Patagonia Worn Wear', website: 'wornwear.patagonia.com', category: 'Fashion', description: 'Repair and resale program extending garment life. Circular economy model reducing waste through quality repair services.' },
  // Food
  { name: 'EcoVerde Market', website: 'ecoverdemarket.com', category: 'Food', description: 'Zero-waste grocery delivering plastic-free pantry essentials. Partners directly with small organic farms across the region.' },
  { name: 'The Conscious Store', website: 'theconsciousstore.co', category: 'Food', description: 'Curated marketplace for certified organic and fair trade foods. Rigorous vetting process for all supplier relationships.' },
  { name: 'Lichtblick Naturwaren', website: 'lichtblick-natur.de', category: 'Food', description: 'German whole foods cooperative operating since 1978. Member-owned with democratic governance and local sourcing priority.' },
  { name: 'Riverford Organic', website: 'riverford.co.uk', category: 'Food', description: 'Employee-owned farm delivering seasonal organic produce. Pioneered the vegetable box scheme in the United Kingdom.' },
  { name: 'Good Eggs', website: 'goodeggs.com', category: 'Food', description: 'Mission-driven grocer connecting consumers with local farmers. Same-day delivery with reusable packaging program.' },
  // Home
  { name: 'Manufactum', website: 'manufactum.com', category: 'Home', description: 'German retailer of durable goods designed to last generations. Fights disposable culture through quality craftsmanship.' },
  { name: 'Schoolhouse', website: 'schoolhouse.com', category: 'Home', description: 'Portland manufacturer of lighting and home goods. American-made products with full material traceability.' },
  { name: 'Made Trade', website: 'madetrade.com', category: 'Home', description: 'Marketplace for ethical home goods. Every product verified for fair trade, sustainable materials, or artisan craftsmanship.' },
  { name: 'The Citizenry', website: 'the-citizenry.com', category: 'Home', description: 'Partners with artisan communities worldwide for handcrafted home goods. Long-term relationships ensuring fair compensation.' },
  { name: 'Snowe Home', website: 'snowehome.com', category: 'Home', description: 'Direct-to-consumer bedding and tableware. Works with family-owned European mills using traditional techniques.' },
  // Beauty
  { name: 'Aesop', website: 'aesop.com', category: 'Beauty', description: 'Australian skincare with meticulous ingredient sourcing. Stores designed by leading architects, products by leading chemists.' },
  { name: 'Tata Harper', website: 'tataharperskincare.com', category: 'Beauty', description: 'Farm-to-face skincare grown and manufactured on a Vermont farm. Complete vertical integration from seed to bottle.' },
  { name: 'Weleda', website: 'weleda.com', category: 'Beauty', description: 'Biodynamic agriculture pioneer since 1921. Certified B Corp with regenerative farming practices.' },
  { name: 'RMS Beauty', website: 'rmsbeauty.com', category: 'Beauty', description: 'Clean makeup using food-grade organic ingredients. Minimal processing to preserve natural nutrient integrity.' },
  { name: 'Kjaer Weis', website: 'kjaerweis.com', category: 'Beauty', description: 'Luxury refillable makeup reducing packaging waste. Certified organic formulas in reusable metal compacts.' },
  // Electronics
  { name: 'Fairphone', website: 'fairphone.com', category: 'Electronics', description: 'Modular smartphone designed for repairability and longevity. Sources conflict-free minerals with full supply chain transparency.' },
  { name: 'Framework', website: 'frame.work', category: 'Electronics', description: 'Laptop built for upgrades and repairs. Open-source design documentation empowering user maintenance.' },
  { name: 'Nimble', website: 'gonimble.com', category: 'Electronics', description: 'Phone accessories made from recycled and plant-based materials. Carbon neutral operations with e-waste recycling program.' },
  { name: 'Pela Case', website: 'pelacase.com', category: 'Electronics', description: 'Compostable phone cases from flax straw waste. Zero-waste production facility with closed-loop manufacturing.' },
];

const submitters = [
  { name: 'Sarah Mitchell', email: 'sarah.mitchell@email.com' },
  { name: 'James Chen', email: 'james.c@outlook.com' },
  { name: 'Emma Rodriguez', email: 'emma.r@gmail.com' },
  { name: 'David Park', email: 'dpark@pm.me' },
  { name: 'Lisa Thompson', email: 'lisa.t@yahoo.com' },
  { name: 'Michael Brown', email: 'm.brown@email.com' },
  { name: 'Anna Kowalski', email: 'anna.k@outlook.com' },
  { name: 'Robert Garcia', email: 'rgarcia@gmail.com' },
];

const evidenceOptions = {
  ethicalSourcing: [
    'Direct partnerships with artisan cooperatives in 12 countries',
    'Transparent supply chain with GPS-tracked sourcing',
    'Third-party verified sourcing audits conducted quarterly',
    'Indigenous community partnerships with profit sharing',
    'Small-scale farmer direct trade agreements',
    'Full supplier list published annually',
  ],
  environmentalImpact: [
    'Carbon neutral operations since 2019',
    'Renewable energy powers all facilities',
    'Zero-waste manufacturing achieved',
    'Biodegradable materials in 90% of products',
    'Water recycling reduces consumption by 60%',
    'Regenerative agriculture practices on owned land',
  ],
  fairLabor: [
    'Living wage certification across supply chain',
    'Fair Trade USA verified facilities',
    'Worker ownership model with profit sharing',
    'Healthcare benefits for all staff globally',
    'SA8000 certified workplace conditions',
    'Annual third-party labor audits published',
  ],
  packagingShipping: [
    '100% plastic-free packaging since 2020',
    'Carbon offset shipping as standard',
    'Compostable mailers from agricultural waste',
    'Reusable packaging return program active',
    'Local delivery by cargo bike where available',
    'Minimal packaging policy reduces materials 40%',
  ],
  certifications: [
    'Certified B Corporation',
    'USDA Organic certified',
    '1% for the Planet member',
    'Climate Neutral Certified',
    'Cradle to Cradle Gold certified',
    'GOTS certified for all textiles',
  ],
};

function generateCriteriaScore(key: keyof typeof evidenceOptions): CriteriaScore {
  const score = Math.floor(Math.random() * 21);
  const evidence = evidenceOptions[key][Math.floor(Math.random() * evidenceOptions[key].length)];
  return { score, evidence };
}

function generateSubmissions(): Submission[] {
  return uniqueShops.map((shop, i) => {
    const scores: SustainabilityScores = {
      ethicalSourcing: generateCriteriaScore('ethicalSourcing'),
      environmentalImpact: generateCriteriaScore('environmentalImpact'),
      fairLabor: generateCriteriaScore('fairLabor'),
      packagingShipping: generateCriteriaScore('packagingShipping'),
      certifications: generateCriteriaScore('certifications'),
    };
    
    const totalScore = 
      scores.ethicalSourcing.score +
      scores.environmentalImpact.score +
      scores.fairLabor.score +
      scores.packagingShipping.score +
      scores.certifications.score;
    
    let status: Submission['status'];
    if (i < 8) status = 'Pending';
    else if (i < 14) status = 'Approved';
    else if (i < 20) status = 'Rejected';
    else status = 'Needs Info';
    
    const submitter = submitters[i % submitters.length];
    
    return {
      id: `sub-${i + 1}`,
      shopName: shop.name,
      website: `https://${shop.website}`,
      description: shop.description,
      category: shop.category,
      submitterName: submitter.name,
      submitterEmail: submitter.email,
      submittedAt: new Date(Date.now() - (i * 1.5 + Math.random()) * 24 * 60 * 60 * 1000),
      status,
      scores,
      totalScore,
    };
  }).sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
}

const initialSubmissions = generateSubmissions();

function generateEmail(submission: Submission): string {
  const firstName = submission.submitterName.split(' ')[0];
  
  if (submission.status === 'Approved') {
    return `Dear ${firstName},

Thank you for submitting ${submission.shopName} for inclusion in our sustainable marketplace.

We are pleased to inform you that after review, ${submission.shopName} has been approved for listing with an overall sustainability score of ${submission.totalScore}/100.

Key strengths identified:
${submission.scores.ethicalSourcing.score >= 14 ? `• Ethical Sourcing: ${submission.scores.ethicalSourcing.evidence}\n` : ''}${submission.scores.environmentalImpact.score >= 14 ? `• Environmental Impact: ${submission.scores.environmentalImpact.evidence}\n` : ''}${submission.scores.certifications.score >= 14 ? `• Certifications: ${submission.scores.certifications.evidence}\n` : ''}
${submission.shopName} will appear in our directory within 48 hours.

Best regards,
Sustainability Review Team`;
  } else if (submission.status === 'Needs Info') {
    return `Dear ${firstName},

Thank you for submitting ${submission.shopName} for review.

To complete our evaluation, we require additional information:

${submission.scores.ethicalSourcing.score < 10 ? '• Ethical Sourcing: Please provide documentation of supplier relationships.\n' : ''}${submission.scores.environmentalImpact.score < 10 ? '• Environmental Impact: We need verification of environmental claims.\n' : ''}${submission.scores.certifications.score < 10 ? '• Certifications: Please submit copies of sustainability certifications.\n' : ''}
Please reply with the requested documentation within 14 days.

Best regards,
Sustainability Review Team`;
  } else {
    return `Dear ${firstName},

Thank you for submitting ${submission.shopName} for consideration.

After review, we are unable to approve the listing at this time. The submission achieved ${submission.totalScore}/100, below our minimum threshold of 70 points.

Areas requiring improvement:
${submission.scores.ethicalSourcing.score < 14 ? `• Ethical Sourcing (${submission.scores.ethicalSourcing.score}/20)\n` : ''}${submission.scores.environmentalImpact.score < 14 ? `• Environmental Impact (${submission.scores.environmentalImpact.score}/20)\n` : ''}${submission.scores.fairLabor.score < 14 ? `• Fair Labor (${submission.scores.fairLabor.score}/20)\n` : ''}${submission.scores.packagingShipping.score < 14 ? `• Packaging & Shipping (${submission.scores.packagingShipping.score}/20)\n` : ''}${submission.scores.certifications.score < 14 ? `• Certifications (${submission.scores.certifications.score}/20)\n` : ''}
We encourage resubmission after addressing these areas.

Best regards,
Sustainability Review Team`;
  }
}

// Score color helper
function getScoreColor(score: number, max: number = 100): string {
  const pct = (score / max) * 100;
  if (pct >= 70) return '#16a34a';
  if (pct >= 40) return '#d97706';
  return '#dc2626';
}

function getStatusColor(status: Submission['status']): string {
  switch (status) {
    case 'Approved': return '#16a34a';
    case 'Rejected': return '#dc2626';
    case 'Needs Info': return '#d97706';
    default: return '#737373';
  }
}

// Components
function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = getScoreColor(score);
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e5e3"
          strokeWidth={4}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
        />
      </svg>
      <div 
        className="absolute inset-0 flex items-center justify-center text-[18px] font-semibold"
        style={{ color }}
      >
        {score}
      </div>
    </div>
  );
}

function CriteriaBar({ label, score, evidence }: { label: string; score: number; evidence: string }) {
  const pct = (score / 20) * 100;
  const color = getScoreColor(score, 20);
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[13px]" style={{ color: '#191919' }}>{label}</span>
        <span className="text-[13px] font-medium" style={{ color }}>{score}/20</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ backgroundColor: '#e5e5e3' }}>
        <div 
          className="h-full rounded-full transition-all duration-150 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-[11px] leading-relaxed" style={{ color: '#737373' }}>{evidence}</p>
    </div>
  );
}

function FilterSelect({ 
  value, 
  onChange, 
  options, 
  label 
}: { 
  value: string; 
  onChange: (v: string) => void; 
  options: { value: string; label: string }[];
  label: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none text-[13px] pl-3 pr-7 py-1.5 rounded cursor-pointer"
        style={{ 
          backgroundColor: '#f5f5f4', 
          color: '#191919', 
          border: '1px solid #e5e5e3' 
        }}
        aria-label={label}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown 
        size={14} 
        className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" 
        style={{ color: '#737373' }} 
      />
    </div>
  );
}

export default function SustainabilityReviewPage() {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [selectedId, setSelectedId] = useState<string | null>(initialSubmissions[0]?.id || null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [editedEmail, setEditedEmail] = useState(() => 
    initialSubmissions[0] ? generateEmail(initialSubmissions[0]) : ''
  );
  
  const selected = useMemo(
    () => submissions.find(s => s.id === selectedId) || null,
    [submissions, selectedId]
  );
  
  const filteredSubmissions = useMemo(() => {
    let result = [...submissions];
    if (statusFilter !== 'All') {
      result = result.filter(s => s.status === statusFilter);
    }
    if (categoryFilter !== 'All') {
      result = result.filter(s => s.category === categoryFilter);
    }
    return result;
  }, [submissions, statusFilter, categoryFilter]);
  
  const stats = useMemo(() => ({
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'Pending').length,
    approved: submissions.filter(s => s.status === 'Approved').length,
    rejected: submissions.filter(s => s.status === 'Rejected').length,
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

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#fafaf9', color: '#191919' }}>
      {/* Header */}
      <header 
        className="flex-shrink-0 flex items-center gap-4 px-6 h-14 border-b"
        style={{ borderColor: '#e5e5e3' }}
      >
        <Link 
          href="/" 
          className="flex items-center gap-2 text-[13px] transition-opacity duration-150 hover:opacity-60"
          style={{ color: '#737373' }}
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back
        </Link>
        <div className="h-4 w-px" style={{ backgroundColor: '#e5e5e3' }} />
        <span className="text-[15px] font-semibold">Sustainability Review</span>
        <div className="flex-1" />
        <div className="flex items-center gap-6 text-[13px]">
          <div>
            <span style={{ color: '#737373' }}>Pending </span>
            <span className="font-medium" style={{ color: '#d97706' }}>{stats.pending}</span>
          </div>
          <div>
            <span style={{ color: '#737373' }}>Approved </span>
            <span className="font-medium" style={{ color: '#16a34a' }}>{stats.approved}</span>
          </div>
          <div>
            <span style={{ color: '#737373' }}>Rejected </span>
            <span className="font-medium" style={{ color: '#dc2626' }}>{stats.rejected}</span>
          </div>
        </div>
      </header>
      
      {/* Main content - two panel layout */}
      <div className="flex-1 flex min-h-0">
        {/* Left panel - submission list */}
        <div 
          className="w-[480px] flex-shrink-0 flex flex-col border-r"
          style={{ borderColor: '#e5e5e3' }}
        >
          {/* Filters */}
          <div 
            className="flex-shrink-0 flex items-center gap-2 px-4 py-3 border-b"
            style={{ borderColor: '#e5e5e3' }}
          >
            <FilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              label="Filter by status"
              options={[
                { value: 'All', label: 'All Status' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Approved', label: 'Approved' },
                { value: 'Rejected', label: 'Rejected' },
                { value: 'Needs Info', label: 'Needs Info' },
              ]}
            />
            <FilterSelect
              value={categoryFilter}
              onChange={setCategoryFilter}
              label="Filter by category"
              options={[
                { value: 'All', label: 'All Categories' },
                { value: 'Fashion', label: 'Fashion' },
                { value: 'Food', label: 'Food' },
                { value: 'Home', label: 'Home' },
                { value: 'Beauty', label: 'Beauty' },
                { value: 'Electronics', label: 'Electronics' },
              ]}
            />
            <div className="flex-1" />
            <span className="text-[13px]" style={{ color: '#737373' }}>
              {filteredSubmissions.length} submissions
            </span>
          </div>
          
          {/* Submission list */}
          <div className="flex-1 overflow-y-auto">
            {filteredSubmissions.map(submission => (
              <button
                key={submission.id}
                onClick={() => handleSelect(submission)}
                className="w-full text-left px-4 py-3 border-b transition-colors duration-150"
                style={{ 
                  borderColor: '#e5e5e3',
                  backgroundColor: selectedId === submission.id ? '#f5f5f4' : 'transparent'
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-medium truncate" style={{ color: '#191919' }}>
                        {submission.shopName}
                      </span>
                      <span 
                        className="text-[11px] px-1.5 py-0.5 rounded flex-shrink-0"
                        style={{ 
                          backgroundColor: getStatusColor(submission.status) + '15',
                          color: getStatusColor(submission.status)
                        }}
                      >
                        {submission.status}
                      </span>
                    </div>
                    <div className="text-[13px] mt-0.5" style={{ color: '#737373' }}>
                      {submission.category}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px]" style={{ color: '#737373' }}>
                      <span>{submission.submitterName}</span>
                      <span>·</span>
                      <span>
                        {submission.submittedAt.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                  <div 
                    className="text-[18px] font-semibold flex-shrink-0"
                    style={{ color: getScoreColor(submission.totalScore) }}
                  >
                    {submission.totalScore}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Right panel - detail view */}
        {selected ? (
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            {/* Shop header */}
            <div className="flex-shrink-0 px-8 py-6 border-b" style={{ borderColor: '#e5e5e3' }}>
              <div className="flex items-start gap-6">
                <ScoreRing score={selected.totalScore} size={72} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h2 className="text-[24px] font-semibold" style={{ color: '#191919' }}>
                      {selected.shopName}
                    </h2>
                    <span 
                      className="text-[11px] px-2 py-1 rounded"
                      style={{ 
                        backgroundColor: getStatusColor(selected.status) + '15',
                        color: getStatusColor(selected.status)
                      }}
                    >
                      {selected.status}
                    </span>
                  </div>
                  <a 
                    href={selected.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[13px] mt-1 transition-opacity duration-150 hover:opacity-60"
                    style={{ color: '#2563eb' }}
                  >
                    {selected.website.replace('https://', '')}
                    <ExternalLink size={12} strokeWidth={1.5} />
                  </a>
                  <p className="text-[13px] leading-relaxed mt-3" style={{ color: '#737373' }}>
                    {selected.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-8 mt-6 text-[13px]">
                <div>
                  <div style={{ color: '#737373' }}>Category</div>
                  <div className="mt-0.5" style={{ color: '#191919' }}>{selected.category}</div>
                </div>
                <div>
                  <div style={{ color: '#737373' }}>Submitted by</div>
                  <div className="mt-0.5" style={{ color: '#191919' }}>{selected.submitterName}</div>
                </div>
                <div>
                  <div style={{ color: '#737373' }}>Date</div>
                  <div className="mt-0.5" style={{ color: '#191919' }}>
                    {selected.submittedAt.toLocaleDateString('en-US', { 
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Scorecard */}
            <div className="flex-shrink-0 px-8 py-6 border-b" style={{ borderColor: '#e5e5e3' }}>
              <h3 className="text-[13px] font-medium mb-4" style={{ color: '#737373' }}>
                Sustainability Scorecard
              </h3>
              <div className="space-y-4">
                <CriteriaBar 
                  label="Ethical Sourcing" 
                  score={selected.scores.ethicalSourcing.score}
                  evidence={selected.scores.ethicalSourcing.evidence}
                />
                <CriteriaBar 
                  label="Environmental Impact" 
                  score={selected.scores.environmentalImpact.score}
                  evidence={selected.scores.environmentalImpact.evidence}
                />
                <CriteriaBar 
                  label="Fair Labor" 
                  score={selected.scores.fairLabor.score}
                  evidence={selected.scores.fairLabor.evidence}
                />
                <CriteriaBar 
                  label="Packaging & Shipping" 
                  score={selected.scores.packagingShipping.score}
                  evidence={selected.scores.packagingShipping.evidence}
                />
                <CriteriaBar 
                  label="Certifications" 
                  score={selected.scores.certifications.score}
                  evidence={selected.scores.certifications.evidence}
                />
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex-shrink-0 px-8 py-4 border-b" style={{ borderColor: '#e5e5e3' }}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStatusChange('Approved')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded text-[13px] font-medium transition-opacity duration-150 hover:opacity-80"
                  style={{ backgroundColor: '#16a34a', color: '#ffffff' }}
                >
                  <Check size={16} strokeWidth={1.5} />
                  Approve
                </button>
                <button
                  onClick={() => handleStatusChange('Rejected')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded text-[13px] font-medium transition-opacity duration-150 hover:opacity-80"
                  style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                >
                  <X size={16} strokeWidth={1.5} />
                  Reject
                </button>
                <button
                  onClick={() => handleStatusChange('Needs Info')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded text-[13px] font-medium transition-opacity duration-150 hover:opacity-80"
                  style={{ backgroundColor: '#f5f5f4', color: '#191919', border: '1px solid #e5e5e3' }}
                >
                  <Mail size={16} strokeWidth={1.5} />
                  Request Info
                </button>
              </div>
            </div>
            
            {/* Email preview */}
            <div className="flex-1 flex flex-col min-h-[300px] px-8 py-6">
              <h3 className="text-[13px] font-medium mb-3" style={{ color: '#737373' }}>
                Response Email
              </h3>
              <textarea
                value={editedEmail}
                onChange={e => setEditedEmail(e.target.value)}
                className="flex-1 p-4 rounded text-[13px] leading-relaxed resize-none focus:outline-none"
                style={{ 
                  backgroundColor: '#f5f5f4', 
                  color: '#191919',
                  border: '1px solid #e5e5e3'
                }}
              />
              <div className="flex justify-end mt-4">
                <button
                  className="px-4 py-2 rounded text-[13px] font-medium transition-opacity duration-150 hover:opacity-80"
                  style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
                >
                  Send Response
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div 
            className="flex-1 flex items-center justify-center"
            style={{ backgroundColor: '#f5f5f4' }}
          >
            <p className="text-[15px]" style={{ color: '#737373' }}>
              Select a submission to review
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
