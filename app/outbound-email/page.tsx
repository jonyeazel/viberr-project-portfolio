'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Send, Check, X, Clock } from 'lucide-react';

// Types
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
  timeline: TimelineEvent[];
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
  body: string;
  direction: 'inbound' | 'outbound';
}

interface TimelineEvent {
  id: string;
  date: Date;
  type: 'call' | 'email' | 'meeting' | 'note' | 'deal_update';
  description: string;
}

type ReviewStatus = 'pending' | 'approved' | 'rejected';
type TabType = 'context' | 'draft' | 'review';

// Data generation
const companies = [
  'Meridian Systems', 'Apex Industries', 'Northwind Dynamics', 'Sterling Partners',
  'Cascade Technologies', 'Summit Holdings', 'Ironclad Solutions', 'Vanguard Group',
  'Pinnacle Software', 'Horizon Ventures', 'Atlas Consulting', 'Forge Analytics',
  'Quantum Logistics', 'Evergreen Capital', 'Titan Manufacturing', 'Vertex Labs',
  'Cobalt Enterprises', 'Stratus Networks', 'Keystone Financial', 'Onyx Digital'
];

const firstNames = [
  'Sarah', 'Michael', 'Jennifer', 'David', 'Rachel', 'James', 'Emily', 'Robert',
  'Amanda', 'Christopher', 'Laura', 'Daniel', 'Michelle', 'Andrew', 'Elizabeth',
  'Thomas', 'Nicole', 'Matthew', 'Stephanie', 'Brian'
];

const lastNames = [
  'Chen', 'Rodriguez', 'Thompson', 'Williams', 'Martinez', 'Anderson', 'Taylor',
  'Moore', 'Jackson', 'Martin', 'Lee', 'Harris', 'Clark', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright'
];

const roles = [
  'VP of Engineering', 'Director of Operations', 'Chief Technology Officer',
  'Head of Product', 'Senior Director', 'VP of Sales', 'Chief Operating Officer',
  'Director of IT', 'Head of Procurement', 'VP of Business Development'
];

const dealStages: Contact['dealStage'][] = ['lead', 'qualified', 'proposal', 'negotiation', 'closed'];

const noteTemplates = [
  'Call with {name} - discussed Q{q} priorities. Main concern is integration with existing systems. Follow up on technical requirements.',
  'Met at industry conference. Strong interest in automation capabilities. Decision timeline is end of Q{q}.',
  'Demo completed. {name} brought in technical team. Positive feedback on reporting features. Need to address security questions.',
  'Budget discussion. Looking at {amount}k range. Need to align with their fiscal year planning.',
  'Competitor mentioned - they are also evaluating Salesforce. Our differentiation is the AI capabilities.',
  'Stakeholder mapping: {name} is champion, CFO is economic buyer. Need executive sponsor alignment.',
  'Technical review scheduled for next week. They want to see API documentation and data migration process.',
  'Pricing proposal sent. {name} to review with leadership team. Expected decision within 2 weeks.',
];

const emailSubjects = [
  'Re: Partnership Discussion',
  'Following up on our conversation',
  'Technical Requirements Document',
  'Re: Proposal Review',
  'Next Steps',
  'Re: Demo Scheduling',
];

function generateContacts(): Contact[] {
  return Array.from({ length: 20 }, (_, i) => {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const company = companies[i % companies.length];
    const name = `${firstName} ${lastName}`;
    const daysAgo = Math.floor(Math.random() * 30) + 1;
    
    const notes: CRMNote[] = Array.from({ length: 3 + Math.floor(Math.random() * 3) }, (_, j) => ({
      id: `note-${i}-${j}`,
      date: new Date(Date.now() - (j * 7 + Math.floor(Math.random() * 5)) * 24 * 60 * 60 * 1000),
      content: noteTemplates[j % noteTemplates.length]
        .replace('{name}', firstName)
        .replace('{q}', String(Math.floor(Math.random() * 4) + 1))
        .replace('{amount}', String(Math.floor(Math.random() * 200) + 50)),
      author: ['Alex Morgan', 'Jordan Lee', 'Casey Smith'][j % 3],
    }));

    const priorEmails: Email[] = Array.from({ length: 2 + Math.floor(Math.random() * 3) }, (_, j) => ({
      id: `email-${i}-${j}`,
      date: new Date(Date.now() - (j * 5 + Math.floor(Math.random() * 3)) * 24 * 60 * 60 * 1000),
      subject: emailSubjects[j % emailSubjects.length],
      body: j % 2 === 0 
        ? `Hi ${firstName},\n\nThank you for taking the time to discuss your requirements. I wanted to follow up on the points we covered and outline potential next steps.\n\nBest regards`
        : `Hello,\n\nThank you for the information. We are reviewing internally and will get back to you by end of week with our questions.\n\nBest,\n${firstName}`,
      direction: j % 2 === 0 ? 'outbound' : 'inbound',
    }));

    const timeline: TimelineEvent[] = [
      { id: `t-${i}-1`, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), type: 'email', description: 'Sent follow-up email' },
      { id: `t-${i}-2`, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), type: 'call', description: '30 min discovery call' },
      { id: `t-${i}-3`, date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), type: 'meeting', description: 'Product demo with team' },
      { id: `t-${i}-4`, date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), type: 'deal_update', description: 'Moved to ' + dealStages[(i + 1) % dealStages.length] },
      { id: `t-${i}-5`, date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), type: 'note', description: 'Added CRM notes from call' },
    ];

    return {
      id: `contact-${i}`,
      name,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.toLowerCase().replace(/\s+/g, '')}.com`,
      company,
      role: roles[i % roles.length],
      dealValue: (Math.floor(Math.random() * 20) + 5) * 10000,
      dealStage: dealStages[i % dealStages.length],
      lastActivity: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      notes,
      priorEmails,
      timeline,
    };
  });
}

function generateDraft(contact: Contact): string {
  const latestNote = contact.notes[0];
  const recentContext = latestNote?.content.split('.')[0] || 'our recent discussion';
  
  return `Hi ${contact.name.split(' ')[0]},

I wanted to follow up on ${recentContext.toLowerCase()}. Given ${contact.company}'s focus on operational efficiency, I believe there are a few specific areas where we could provide significant value.

Based on our conversation, I understand your team is evaluating solutions for Q2 implementation. I have prepared a tailored proposal that addresses the integration requirements you mentioned and includes the security documentation your technical team requested.

Would you have 20 minutes this week for a brief call to walk through the key points? I am available Thursday or Friday afternoon.

Looking forward to hearing from you.

Best regards`;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

const stageLabels: Record<Contact['dealStage'], string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed: 'Closed',
};

export default function OutboundEmailPage() {
  const contacts = useMemo(() => generateContacts(), []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('context');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [reviewStatuses, setReviewStatuses] = useState<Record<string, ReviewStatus>>({});

  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contacts;
    const q = searchQuery.toLowerCase();
    return contacts.filter(c => 
      c.name.toLowerCase().includes(q) || 
      c.company.toLowerCase().includes(q)
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

  const handleDraftChange = (value: string) => {
    if (selectedContact) {
      setDrafts(prev => ({ ...prev, [selectedContact.id]: value }));
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
    }
  };

  return (
    <div className="h-screen w-screen bg-[#fafaf9] text-[#191919] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-12 border-b border-[#e5e5e3] flex items-center px-4 shrink-0">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-[#737373] hover:text-[#191919] transition-colors duration-150"
        >
          <ArrowLeft size={16} />
          <span className="text-[13px]">Back</span>
        </Link>
        <span className="ml-6 text-[15px] font-medium">Outbound Email</span>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Contact list */}
        <aside className="w-72 border-r border-[#e5e5e3] flex flex-col shrink-0">
          <div className="p-3 border-b border-[#e5e5e3]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-[#fafaf9] border border-[#e5e5e3] rounded text-[13px] text-[#191919] placeholder-[#737373] focus:outline-none focus:border-[#2563eb] transition-colors duration-150"
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
                className={`w-full text-left p-3 border-b border-[#e5e5e3] transition-colors duration-150 ${
                  selectedId === contact.id 
                    ? 'bg-[#eeeeec]' 
                    : 'hover:bg-[#fafaf9]'
                }`}
              >
                <div className="text-[13px] font-medium truncate">{contact.name}</div>
                <div className="text-[11px] text-[#737373] truncate mt-0.5">{contact.company}</div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-[#737373]">{stageLabels[contact.dealStage]}</span>
                  <span className="text-[11px] text-[#737373]">{formatDate(contact.lastActivity)}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Main area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {selectedContact ? (
            <>
              {/* Contact header */}
              <div className="p-4 border-b border-[#e5e5e3] shrink-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-[18px] font-medium">{selectedContact.name}</h1>
                    <div className="text-[13px] text-[#737373] mt-1">
                      {selectedContact.role} at {selectedContact.company}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[15px] font-medium">{formatCurrency(selectedContact.dealValue)}</div>
                    <div className="text-[11px] text-[#737373] mt-1">{stageLabels[selectedContact.dealStage]}</div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-[#e5e5e3] shrink-0">
                {(['context', 'draft', 'review'] as TabType[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-[13px] transition-colors duration-150 border-b-2 -mb-px ${
                      activeTab === tab
                        ? 'text-[#191919] border-[#191919]'
                        : 'text-[#737373] border-transparent hover:text-[#191919]'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'context' && (
                  <div className="space-y-6">
                    {/* CRM Notes */}
                    <section>
                      <h2 className="text-[13px] text-[#737373] mb-3">CRM Notes</h2>
                      <div className="space-y-3">
                        {selectedContact.notes.map(note => (
                          <div key={note.id} className="bg-[#fafaf9] border border-[#e5e5e3] rounded p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] text-[#737373]">{note.author}</span>
                              <span className="text-[11px] text-[#737373]">{formatDate(note.date)}</span>
                            </div>
                            <p className="text-[13px] leading-relaxed">{note.content}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* Prior Emails */}
                    <section>
                      <h2 className="text-[13px] text-[#737373] mb-3">Prior Emails</h2>
                      <div className="space-y-3">
                        {selectedContact.priorEmails.map(email => (
                          <div key={email.id} className="bg-[#fafaf9] border border-[#e5e5e3] rounded p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[11px] text-[#737373]">
                                {email.direction === 'outbound' ? 'Sent' : 'Received'}
                              </span>
                              <span className="text-[11px] text-[#737373]">{formatDate(email.date)}</span>
                            </div>
                            <div className="text-[13px] font-medium mb-2">{email.subject}</div>
                            <p className="text-[13px] text-[#737373] leading-relaxed whitespace-pre-line">{email.body}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                )}

                {activeTab === 'draft' && (
                  <div className="h-full flex flex-col">
                    <div className="text-[13px] text-[#737373] mb-3">AI-generated draft based on CRM context</div>
                    <textarea
                      value={currentDraft}
                      onChange={(e) => handleDraftChange(e.target.value)}
                      className="flex-1 w-full bg-[#fafaf9] border border-[#e5e5e3] rounded p-4 text-[13px] leading-relaxed resize-none focus:outline-none focus:border-[#2563eb] transition-colors duration-150"
                    />
                  </div>
                )}

                {activeTab === 'review' && (
                  <div className="space-y-6">
                    {/* Status */}
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] text-[#737373]">Status:</span>
                      <span className={`inline-flex items-center gap-1.5 text-[13px] ${
                        currentStatus === 'approved' ? 'text-[#16a34a]' :
                        currentStatus === 'rejected' ? 'text-[#dc2626]' :
                        'text-[#d97706]'
                      }`}>
                        {currentStatus === 'approved' && <Check size={14} />}
                        {currentStatus === 'rejected' && <X size={14} />}
                        {currentStatus === 'pending' && <Clock size={14} />}
                        {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                      </span>
                    </div>

                    {/* Email preview */}
                    <div className="bg-[#fafaf9] border border-[#e5e5e3] rounded p-4">
                      <div className="text-[11px] text-[#737373] mb-1">To: {selectedContact.email}</div>
                      <div className="text-[11px] text-[#737373] mb-3">Subject: Following up on our conversation</div>
                      <div className="text-[13px] leading-relaxed whitespace-pre-line">{currentDraft}</div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      {currentStatus === 'pending' ? (
                        <>
                          <button
                            onClick={handleApprove}
                            className="h-9 px-4 bg-[#16a34a] text-[#191919] text-[13px] font-medium rounded hover:opacity-90 transition-opacity duration-150 flex items-center gap-2"
                          >
                            <Send size={14} />
                            Approve & Send
                          </button>
                          <button
                            onClick={handleReject}
                            className="h-9 px-4 bg-[#eeeeec] border border-[#e5e5e3] text-[13px] rounded hover:bg-[#e5e5e3] transition-colors duration-150"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => setActiveTab('draft')}
                            className="h-9 px-4 bg-[#eeeeec] border border-[#e5e5e3] text-[13px] rounded hover:bg-[#e5e5e3] transition-colors duration-150"
                          >
                            Edit Draft
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleReset}
                          className="h-9 px-4 bg-[#eeeeec] border border-[#e5e5e3] text-[13px] rounded hover:bg-[#e5e5e3] transition-colors duration-150"
                        >
                          Reset Status
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#737373] text-[13px]">
              Select a contact to view details
            </div>
          )}
        </main>

        {/* Right panel - Timeline */}
        {selectedContact && (
          <aside className="w-64 border-l border-[#e5e5e3] flex flex-col shrink-0">
            <div className="p-3 border-b border-[#e5e5e3]">
              <span className="text-[13px] text-[#737373]">Activity</span>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-4">
                {selectedContact.timeline.map((event, index) => (
                  <div key={event.id} className="relative pl-4">
                    {index < selectedContact.timeline.length - 1 && (
                      <div className="absolute left-[3px] top-3 bottom-0 w-px bg-[#e5e5e3]" />
                    )}
                    <div className="absolute left-0 top-1.5 w-[7px] h-[7px] rounded-full bg-[#e5e5e3]" />
                    <div className="text-[11px] text-[#737373]">{formatDate(event.date)}</div>
                    <div className="text-[13px] mt-0.5">{event.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
