'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Send, Check, X, Clock, RefreshCw } from 'lucide-react';

// Fixed reference date to prevent SSR hydration mismatches
const REFERENCE_DATE = new Date('2026-02-11T12:00:00Z');

interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  dealValue: number;
  dealStage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed';
  lastActivity: Date;
  notes: CRMNote[];
  priorEmails: Email[];
  dealHistory: DealEvent[];
}

interface CRMNote {
  id: string;
  date: Date;
  content: string;
  author: string;
}

interface Email {
  id: string;
  date: Date;
  subject: string;
  snippet: string;
  direction: 'inbound' | 'outbound';
}

interface DealEvent {
  id: string;
  date: Date;
  fromStage: string;
  toStage: string;
  note?: string;
}

type ReviewStatus = 'pending' | 'approved' | 'rejected';
type TabType = 'context' | 'draft' | 'review';

const companies = [
  'Stripe', 'Figma', 'Linear', 'Notion', 'Vercel', 'Supabase', 'Retool', 'Airtable',
  'Amplitude', 'Segment', 'Plaid', 'Brex', 'Ramp', 'Mercury', 'Rippling', 'Gusto'
];

const firstNames = [
  'Sarah', 'Michael', 'Jennifer', 'David', 'Rachel', 'James', 'Emily', 'Robert',
  'Amanda', 'Chris', 'Laura', 'Daniel', 'Michelle', 'Andrew', 'Elizabeth', 'Thomas'
];

const lastNames = [
  'Chen', 'Rodriguez', 'Thompson', 'Williams', 'Martinez', 'Anderson', 'Taylor',
  'Moore', 'Jackson', 'Martin', 'Lee', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker'
];

const roles = [
  'VP of Engineering', 'Director of Operations', 'CTO', 'Head of Product',
  'VP of Sales', 'COO', 'Director of IT', 'Head of Procurement',
  'VP of Business Development', 'Director of Growth'
];

const dealStages: Contact['dealStage'][] = ['lead', 'qualified', 'proposal', 'negotiation', 'closed'];

const stageLabels: Record<Contact['dealStage'], string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed: 'Closed Won',
};

const stageColors: Record<Contact['dealStage'], string> = {
  lead: 'var(--muted)',
  qualified: 'var(--primary)',
  proposal: 'var(--warning)',
  negotiation: 'var(--warning)',
  closed: 'var(--success)',
};

const noteContents = [
  (name: string) => `Call with ${name} went well. They're looking to replace their current vendor by Q2. Main pain points are manual data entry and lack of reporting. Team size is ~50, growing to 80 by year end. Decision committee includes CFO and VP Ops.`,
  (name: string) => `${name} introduced me to their technical lead. They have concerns about API rate limits and data migration from Salesforce. I committed to sending technical documentation and a migration timeline estimate.`,
  (name: string) => `Demo completed with ${name} and 3 team members. Strong interest in the automation features. ${name} asked about enterprise pricing and multi-seat discounts. They're comparing us against HubSpot and Outreach.`,
  (name: string) => `Pricing discussion. ${name} mentioned budget is approved for this quarter but needs CFO sign-off for anything over $100K. Suggested we structure as annual with quarterly billing to ease cash flow concerns.`,
  (name: string) => `${name} shared internal feedback doc. Team loves the UI but worried about learning curve. Offered extended onboarding support and dedicated CSM. Next step is final stakeholder presentation next Tuesday.`,
  (name: string) => `Quick sync with ${name}. They're in final negotiations with us and one competitor. Our differentiator is the integration ecosystem. Need to send case study from similar company in their industry.`,
];

const emailSnippets = [
  { subject: 'Re: Partnership Discussion', snippet: 'Thank you for the detailed proposal. I have shared it with our leadership team and we are reviewing the pricing structure...' },
  { subject: 'Following up on our demo', snippet: 'Great speaking with you yesterday. As discussed, I am attaching the technical requirements document our team put together...' },
  { subject: 'Re: Integration Requirements', snippet: 'Our engineering team reviewed the API documentation. We have a few questions about webhook reliability and rate limiting...' },
  { subject: 'Scheduling final presentation', snippet: 'I have confirmed availability with our CFO and VP of Operations. Would Thursday at 2pm PT work for the final presentation?' },
  { subject: 'Re: Contract review', snippet: 'Legal has reviewed the MSA and has a few redlines. Mainly around the data processing agreement and liability caps...' },
];

function generateContacts(): Contact[] {
  const dealValues = [15000, 24000, 36000, 48000, 75000, 95000, 120000, 150000, 185000, 225000, 280000, 340000, 425000, 500000, 65000, 88000];
  
  return Array.from({ length: 16 }, (_, i) => {
    const firstName = firstNames[i];
    const lastName = lastNames[i];
    const company = companies[i];
    const name = `${firstName} ${lastName}`;
    const daysAgo = [1, 2, 3, 5, 7, 10, 14, 21, 4, 6, 8, 12, 16, 18, 9, 11][i];
    const stage = dealStages[i % 5];
    
    const notes: CRMNote[] = Array.from({ length: 4 }, (_, j) => ({
      id: `note-${i}-${j}`,
      date: new Date(REFERENCE_DATE.getTime() - (j * 7 + j * 2) * 24 * 60 * 60 * 1000),
      content: noteContents[(i + j) % noteContents.length](firstName),
      author: ['Alex Morgan', 'Jordan Lee', 'Casey Smith', 'Taylor Kim'][j % 4],
    }));

    const priorEmails: Email[] = Array.from({ length: 3 }, (_, j) => {
      const template = emailSnippets[(i + j) % emailSnippets.length];
      return {
        id: `email-${i}-${j}`,
        date: new Date(REFERENCE_DATE.getTime() - (j * 4 + 2) * 24 * 60 * 60 * 1000),
        subject: template.subject,
        snippet: template.snippet,
        direction: j % 2 === 0 ? 'inbound' : 'outbound',
      };
    });

    const stageIndex = dealStages.indexOf(stage);
    const dealHistory: DealEvent[] = Array.from({ length: Math.min(stageIndex + 1, 3) }, (_, j) => ({
      id: `deal-${i}-${j}`,
      date: new Date(REFERENCE_DATE.getTime() - (30 - j * 10) * 24 * 60 * 60 * 1000),
      fromStage: stageLabels[dealStages[Math.max(0, stageIndex - j - 1)]],
      toStage: stageLabels[dealStages[Math.max(0, stageIndex - j)]],
      note: j === 0 ? 'Moved after successful demo' : undefined,
    })).reverse();

    return {
      id: `contact-${i}`,
      name,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase()}.com`,
      company,
      role: roles[i % roles.length],
      dealValue: dealValues[i],
      dealStage: stage,
      lastActivity: new Date(REFERENCE_DATE.getTime() - daysAgo * 24 * 60 * 60 * 1000),
      notes,
      priorEmails,
      dealHistory,
    };
  });
}

function generateDraft(contact: Contact): string {
  const firstName = contact.name.split(' ')[0];
  const latestNote = contact.notes[0];
  
  const contextPhrases: Record<Contact['dealStage'], string> = {
    lead: `I noticed ${contact.company} has been growing rapidly and wanted to reach out about how we might be able to help with your operational efficiency.`,
    qualified: `Following up on our initial conversation about ${contact.company}'s needs around automation and reporting.`,
    proposal: `I wanted to check in on the proposal I sent over last week. I know your team had some questions about the integration timeline.`,
    negotiation: `Thank you for the productive discussion with your team. I have incorporated the feedback from your CFO regarding the payment terms.`,
    closed: `Congratulations on the decision to move forward. I wanted to confirm next steps for onboarding.`,
  };

  const contextDetail = latestNote 
    ? latestNote.content.split('.')[0].toLowerCase()
    : 'our recent discussion';

  return `Hi ${firstName},

${contextPhrases[contact.dealStage]}

Based on ${contextDetail}, I believe there are a few specific areas where we can provide significant value to ${contact.company}:

1. Reducing manual data entry by 80% through our automation workflows
2. Real-time reporting dashboards that integrate with your existing tools
3. Dedicated onboarding support to ensure smooth adoption across your team

I have prepared a tailored summary that addresses the integration requirements your technical team mentioned. Would you have 20 minutes this Thursday or Friday for a brief call to walk through the key points?

Looking forward to hearing from you.

Best regards`;
}

function formatDate(date: Date): string {
  const diffDays = Math.floor((REFERENCE_DATE.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateFull(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}K`;
  }
  return `$${value}`;
}

export default function OutboundEmailPage() {

  const contacts = useMemo(() => generateContacts(), []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('context');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [reviewStatuses, setReviewStatuses] = useState<Record<string, ReviewStatus>>({});
  const [reviewerNotes, setReviewerNotes] = useState<Record<string, string>>({});

  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contacts;
    const q = searchQuery.toLowerCase();
    return contacts.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.company.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q)
    );
  }, [contacts, searchQuery]);

  const selectedContact = useMemo(() => 
    contacts.find(c => c.id === selectedId) || null
  , [contacts, selectedId]);

  const currentDraft = selectedContact 
    ? (drafts[selectedContact.id] ?? generateDraft(selectedContact))
    : '';

  const currentStatus = selectedContact 
    ? (reviewStatuses[selectedContact.id] ?? 'pending')
    : 'pending';

  const currentReviewerNote = selectedContact
    ? (reviewerNotes[selectedContact.id] ?? '')
    : '';

  const handleDraftChange = (value: string) => {
    if (selectedContact) {
      setDrafts(prev => ({ ...prev, [selectedContact.id]: value }));
    }
  };

  const handleRegenerate = () => {
    if (selectedContact) {
      setDrafts(prev => {
        const newDrafts = { ...prev };
        delete newDrafts[selectedContact.id];
        return newDrafts;
      });
    }
  };

  const handleApprove = () => {
    if (selectedContact) {
      setReviewStatuses(prev => ({ ...prev, [selectedContact.id]: 'approved' }));
    }
  };

  const handleReject = () => {
    if (selectedContact) {
      setReviewStatuses(prev => ({ ...prev, [selectedContact.id]: 'rejected' }));
    }
  };

  const handleReset = () => {
    if (selectedContact) {
      setReviewStatuses(prev => ({ ...prev, [selectedContact.id]: 'pending' }));
      setReviewerNotes(prev => ({ ...prev, [selectedContact.id]: '' }));
    }
  };

  return (
    <div className="h-screen w-screen bg-background text-foreground flex flex-col overflow-hidden">
      <header className="h-12 border-b border-border flex items-center gap-4 px-4 shrink-0 bg-background">
        <Link 
          href="/" 
          onClick={(e) => { try { if (window.self !== window.top) { e.preventDefault(); window.parent.postMessage('close-preview', '*'); } } catch { e.preventDefault(); } }}
          className="flex items-center gap-2 text-[13px] text-muted hover:text-foreground transition-colors duration-150"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back
        </Link>
        <div className="w-px h-4 bg-border" />
        <span className="text-[15px] font-medium">Outbound Email</span>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className={`w-full md:w-80 md:shrink-0 border-r border-border flex flex-col bg-background ${selectedId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-secondary border border-border rounded text-[13px] text-foreground placeholder-muted focus:outline-none focus:border-primary transition-colors duration-150"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredContacts.map(contact => (
              <button
                key={contact.id}
                onClick={() => {
                  setSelectedId(contact.id);
                  setActiveTab('context');
                }}
                className={`w-full text-left px-4 py-3 border-b border-border transition-colors duration-150 ${
                  selectedId === contact.id 
                    ? 'bg-surface-2' 
                    : 'hover:bg-secondary'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium truncate">{contact.name}</div>
                    <div className="text-[11px] text-muted truncate mt-0.5">{contact.company}</div>
                  </div>
                  <div className="text-[13px] font-medium text-foreground shrink-0">
                    {formatCurrency(contact.dealValue)}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span 
                    className="text-[11px] px-1.5 py-0.5 rounded"
                    style={{ 
                      color: stageColors[contact.dealStage],
                      backgroundColor: `${stageColors[contact.dealStage]}14`
                    }}
                  >
                    {stageLabels[contact.dealStage]}
                  </span>
                  <span className="text-[11px] text-muted">{formatDate(contact.lastActivity)}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <main className={`flex-1 flex flex-col overflow-hidden bg-background ${selectedId ? 'flex' : 'hidden md:flex'}`}>
          {selectedContact ? (
            <>
              <div className="px-4 md:px-6 py-4 border-b border-border shrink-0">
                <div className="flex items-start justify-between">
                  <div>
                    <button
                      onClick={() => setSelectedId(null)}
                      className="md:hidden flex items-center gap-1.5 text-[13px] text-muted hover:text-foreground mb-2 transition-colors duration-150"
                    >
                      <ArrowLeft size={14} strokeWidth={1.5} />
                      All contacts
                    </button>
                    <h1 className="text-[18px] font-medium">{selectedContact.name}</h1>
                    <div className="text-[13px] text-muted mt-1">
                      {selectedContact.role} at {selectedContact.company}
                    </div>
                    <div className="text-[11px] text-muted mt-0.5">
                      {selectedContact.email}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[18px] font-medium">{formatCurrency(selectedContact.dealValue)}</div>
                    <span 
                      className="inline-block text-[11px] px-1.5 py-0.5 rounded mt-1"
                      style={{ 
                        color: stageColors[selectedContact.dealStage],
                        backgroundColor: `${stageColors[selectedContact.dealStage]}14`
                      }}
                    >
                      {stageLabels[selectedContact.dealStage]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex border-b border-border shrink-0 px-6 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {(['context', 'draft', 'review'] as TabType[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-3 text-[13px] transition-colors duration-150 border-b-2 -mb-px whitespace-nowrap shrink-0 ${
                      activeTab === tab
                        ? 'text-foreground border-foreground'
                        : 'text-muted border-transparent hover:text-foreground'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto">
                {activeTab === 'context' && (
                  <div className="p-6 max-w-3xl">
                    <section className="mb-8">
                      <div className="text-[11px] text-muted uppercase tracking-wide mb-3">CRM Notes</div>
                      <div className="space-y-4">
                        {selectedContact.notes.map(note => (
                          <div key={note.id} className="border-l-2 border-border pl-4">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[13px] font-medium">{note.author}</span>
                              <span className="text-[11px] text-muted">{formatDateFull(note.date)}</span>
                            </div>
                            <p className="text-[13px] leading-relaxed text-foreground">{note.content}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="mb-8">
                      <div className="text-[11px] text-muted uppercase tracking-wide mb-3">Email History</div>
                      <div className="space-y-3">
                        {selectedContact.priorEmails.map(email => (
                          <div key={email.id} className="bg-secondary rounded p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[13px] font-medium">{email.subject}</span>
                              <span className="text-[11px] text-muted">{formatDateFull(email.date)}</span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-[11px] ${email.direction === 'inbound' ? 'text-primary' : 'text-muted'}`}>
                                {email.direction === 'inbound' ? 'Received' : 'Sent'}
                              </span>
                            </div>
                            <p className="text-[13px] text-muted leading-relaxed">{email.snippet}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section>
                      <div className="text-[11px] text-muted uppercase tracking-wide mb-3">Deal History</div>
                      <div className="space-y-2">
                        {selectedContact.dealHistory.map(event => (
                          <div key={event.id} className="flex items-center gap-3 text-[13px]">
                            <span className="text-[11px] text-muted w-24 shrink-0">{formatDateFull(event.date)}</span>
                            <span className="text-muted">{event.fromStage}</span>
                            <span className="text-muted">→</span>
                            <span className="font-medium">{event.toStage}</span>
                            {event.note && <span className="text-muted">· {event.note}</span>}
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                )}

                {activeTab === 'draft' && (
                  <div className="p-6 h-full flex flex-col max-w-3xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-[11px] text-muted uppercase tracking-wide">AI-Generated Draft</div>
                      <button
                        onClick={handleRegenerate}
                        className="flex items-center gap-1.5 text-[13px] text-muted hover:text-foreground transition-colors duration-150"
                      >
                        <RefreshCw size={14} strokeWidth={1.5} />
                        Regenerate
                      </button>
                    </div>
                    <div className="bg-secondary rounded p-4 mb-4">
                      <div className="text-[11px] text-muted mb-1">To: {selectedContact.email}</div>
                      <div className="text-[11px] text-muted">Subject: Following up on our conversation</div>
                    </div>
                    <textarea
                      value={currentDraft}
                      onChange={(e) => handleDraftChange(e.target.value)}
                      className="flex-1 min-h-[300px] w-full bg-secondary border border-border rounded p-4 text-[13px] leading-relaxed resize-none focus:outline-none focus:border-primary transition-colors duration-150"
                    />
                  </div>
                )}

                {activeTab === 'review' && (
                  <div className="p-6 max-w-3xl">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="text-[11px] text-muted uppercase tracking-wide">Status</div>
                      <span className={`inline-flex items-center gap-1.5 text-[13px] font-medium ${
                        currentStatus === 'approved' ? 'text-success' :
                        currentStatus === 'rejected' ? 'text-destructive' :
                        'text-warning'
                      }`}>
                        {currentStatus === 'approved' && <Check size={14} strokeWidth={2} />}
                        {currentStatus === 'rejected' && <X size={14} strokeWidth={2} />}
                        {currentStatus === 'pending' && <Clock size={14} strokeWidth={1.5} />}
                        {currentStatus === 'approved' ? 'Approved' : currentStatus === 'rejected' ? 'Rejected' : 'Pending Review'}
                      </span>
                    </div>

                    <div className="bg-secondary rounded p-4 mb-6">
                      <div className="text-[11px] text-muted mb-1">To: {selectedContact.email}</div>
                      <div className="text-[11px] text-muted mb-4">Subject: Following up on our conversation</div>
                      <div className="text-[13px] leading-relaxed whitespace-pre-line border-t border-border pt-4">{currentDraft}</div>
                    </div>

                    {currentStatus === 'pending' && (
                      <>
                        <div className="mb-4">
                          <div className="text-[11px] text-muted uppercase tracking-wide mb-2">Reviewer Notes (optional)</div>
                          <textarea
                            value={currentReviewerNote}
                            onChange={(e) => {
                              if (selectedContact) {
                                setReviewerNotes(prev => ({ ...prev, [selectedContact.id]: e.target.value }));
                              }
                            }}
                            placeholder="Add notes for the sender..."
                            className="w-full h-20 bg-secondary border border-border rounded p-3 text-[13px] resize-none focus:outline-none focus:border-primary transition-colors duration-150 placeholder-muted"
                          />
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={handleApprove}
                            className="h-10 px-5 bg-success text-white text-[13px] font-medium rounded hover:bg-success/90 transition-colors duration-150 flex items-center gap-2"
                          >
                            <Send size={14} strokeWidth={1.5} />
                            Approve & Send
                          </button>
                          <button
                            onClick={handleReject}
                            className="h-10 px-5 bg-secondary border border-border text-[13px] rounded hover:bg-surface-2 transition-colors duration-150"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => setActiveTab('draft')}
                            className="h-10 px-5 bg-secondary border border-border text-[13px] rounded hover:bg-surface-2 transition-colors duration-150"
                          >
                            Edit Draft
                          </button>
                        </div>
                      </>
                    )}

                    {currentStatus !== 'pending' && (
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={handleReset}
                          className="h-10 px-5 bg-secondary border border-border text-[13px] rounded hover:bg-surface-2 transition-colors duration-150"
                        >
                          Reset to Pending
                        </button>
                        {currentStatus === 'rejected' && (
                          <button
                            onClick={() => setActiveTab('draft')}
                            className="h-10 px-5 bg-secondary border border-border text-[13px] rounded hover:bg-surface-2 transition-colors duration-150"
                          >
                            Revise Draft
                          </button>
                        )}
                      </div>
                    )}

                    {currentReviewerNote && currentStatus !== 'pending' && (
                      <div className="mt-6 p-4 bg-secondary rounded">
                        <div className="text-[11px] text-muted uppercase tracking-wide mb-2">Reviewer Notes</div>
                        <p className="text-[13px]">{currentReviewerNote}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                <Send size={20} strokeWidth={1.5} className="text-muted" />
              </div>
              <div className="text-[15px] text-foreground mb-1">No contact selected</div>
              <div className="text-[13px] text-muted max-w-xs">
                Select a contact from the list to view their CRM context and draft an outbound email.
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
