'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Grid3X3, List, X, Eye, TrendingUp, ShoppingCart, Heart, ChevronDown } from 'lucide-react';

type Category = 'Trading Cards' | 'Vinyl Records' | 'Comics' | 'Sneakers' | 'Watches' | 'Art';
type Condition = 'Mint' | 'Near Mint' | 'Excellent' | 'Good' | 'Fair';
type Status = 'For Sale' | 'Auction' | 'Sold';
type Tab = 'Marketplace' | 'My Collection' | 'Watchlist';

interface PriceHistory {
  date: string;
  price: number;
  event: string;
}

interface Collectible {
  id: number;
  name: string;
  category: Category;
  condition: Condition;
  price: number;
  seller: string;
  status: Status;
  description: string;
  provenance: string;
  conditionNotes: string;
  priceHistory: PriceHistory[];
  owned: boolean;
  watched: boolean;
  year: number;
  rarity: string;
  auctionEnds?: string;
}

const categories: Category[] = ['Trading Cards', 'Vinyl Records', 'Comics', 'Sneakers', 'Watches', 'Art'];
const conditions: Condition[] = ['Mint', 'Near Mint', 'Excellent', 'Good', 'Fair'];

const categoryColors: Record<Category, { bg: string; text: string }> = {
  'Trading Cards': { bg: '#dbeafe', text: '#1e40af' },
  'Vinyl Records': { bg: '#fce7f3', text: '#9d174d' },
  'Comics': { bg: '#dcfce7', text: '#166534' },
  'Sneakers': { bg: '#fef3c7', text: '#92400e' },
  'Watches': { bg: '#e0e7ff', text: '#3730a3' },
  'Art': { bg: '#ffe4e6', text: '#9f1239' },
};

const firstNames = ['James', 'Michael', 'David', 'Robert', 'Sarah', 'Emily', 'Jessica', 'Amanda', 'Chris', 'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Marcus', 'Elena', 'Nathan', 'Sophia', 'William'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Anderson', 'Wilson', 'Moore', 'Taylor', 'Thomas', 'Lee', 'Chen', 'Rivera', 'Kim', 'Patel', 'Cohen'];

const tradingCards = [
  { name: '1989 Upper Deck Ken Griffey Jr. Rookie', grade: 'PSA 9', year: 1989 },
  { name: '1986 Fleer Michael Jordan Rookie', grade: 'PSA 8', year: 1986 },
  { name: '1952 Topps Mickey Mantle', grade: 'PSA 4', year: 1952 },
  { name: '1993 SP Foil Derek Jeter Rookie', grade: 'PSA 10', year: 1993 },
  { name: '2003 Topps Chrome LeBron James Refractor', grade: 'BGS 9.5', year: 2003 },
  { name: '1996 Pokemon Base Set Charizard Holo', grade: 'PSA 9', year: 1996 },
  { name: '1999 Pokemon 1st Edition Shadowless Pikachu', grade: 'PSA 10', year: 1999 },
  { name: '2020 Panini Prizm Justin Herbert Silver', grade: 'PSA 10', year: 2020 },
  { name: '1984 Topps Don Mattingly Rookie', grade: 'PSA 9', year: 1984 },
  { name: '2018 Panini National Treasures Luka Doncic', grade: '/99', year: 2018 },
];

const vinylRecords = [
  { name: 'The Beatles - Abbey Road', press: 'UK First Press', year: 1969 },
  { name: 'Pink Floyd - Dark Side of the Moon', press: 'UK Original', year: 1973 },
  { name: 'Led Zeppelin - IV', press: 'Atlantic First Press', year: 1971 },
  { name: 'Nirvana - Nevermind', press: 'DGC Original', year: 1991 },
  { name: 'Miles Davis - Kind of Blue', press: 'Columbia 6-Eye', year: 1959 },
  { name: 'Radiohead - OK Computer', press: 'UK First Press', year: 1997 },
  { name: 'Fleetwood Mac - Rumours', press: 'Warner Bros Original', year: 1977 },
  { name: 'David Bowie - Ziggy Stardust', press: 'RCA First Press', year: 1972 },
  { name: 'Prince - Purple Rain', press: 'Warner Bros Sealed', year: 1984 },
  { name: 'Kendrick Lamar - To Pimp a Butterfly', press: 'Limited Edition', year: 2015 },
];

const comics = [
  { name: 'Amazing Fantasy #15', note: 'First Spider-Man', grade: 'CGC 4.0', year: 1962 },
  { name: 'Action Comics #1', note: 'First Superman', grade: 'CGC 1.8', year: 1938 },
  { name: 'Detective Comics #27', note: 'First Batman', grade: 'CGC 3.0', year: 1939 },
  { name: 'X-Men #1', note: 'Original Team', grade: 'CGC 7.5', year: 1963 },
  { name: 'Incredible Hulk #181', note: 'First Wolverine', grade: 'CGC 9.0', year: 1974 },
  { name: 'Giant-Size X-Men #1', note: 'New Team Debut', grade: 'CGC 9.6', year: 1975 },
  { name: 'Amazing Spider-Man #129', note: 'First Punisher', grade: 'CGC 8.5', year: 1974 },
  { name: 'Batman #1', note: 'First Joker', grade: 'CGC 5.5', year: 1940 },
  { name: 'Tales of Suspense #39', note: 'First Iron Man', grade: 'CGC 6.0', year: 1963 },
  { name: 'Fantastic Four #1', note: 'Team Origin', grade: 'CGC 4.5', year: 1961 },
];

const sneakers = [
  { name: 'Air Jordan 1 Retro High OG Chicago', size: '10.5', year: 2015 },
  { name: 'Nike Air Mag Back to the Future', size: '10', year: 2016 },
  { name: 'Air Jordan 11 Concord', size: '11', year: 2018 },
  { name: 'Nike Dunk Low Off-White Lot 01', size: '9.5', year: 2021 },
  { name: 'Yeezy Boost 350 V2 Zebra', size: '10', year: 2017 },
  { name: 'Air Jordan 4 Retro OG White Cement', size: '10.5', year: 2016 },
  { name: 'Nike SB Dunk Low Paris', size: '9', year: 2003 },
  { name: 'Air Jordan 3 Retro Black Cement', size: '11', year: 2018 },
  { name: 'Travis Scott x Air Jordan 1 High OG', size: '10', year: 2019 },
  { name: 'Nike Air Force 1 Low Supreme', size: '10.5', year: 2020 },
];

const watches = [
  { name: 'Rolex Submariner 5513 Gilt Dial', ref: 'Ref. 5513', year: 1966 },
  { name: 'Patek Philippe Nautilus', ref: 'Ref. 5711/1A', year: 2020 },
  { name: 'Omega Speedmaster Professional Moonwatch', ref: 'Ref. 311.30.42.30', year: 2019 },
  { name: 'Audemars Piguet Royal Oak', ref: 'Ref. 15400ST', year: 2018 },
  { name: 'Rolex Daytona Panda Dial', ref: 'Ref. 116500LN', year: 2021 },
  { name: 'Cartier Santos de Cartier Large', ref: 'WSSA0018', year: 2022 },
  { name: 'IWC Portugieser Chronograph', ref: 'Ref. IW371446', year: 2017 },
  { name: 'Tudor Black Bay 58 Blue', ref: 'Ref. M79030B', year: 2020 },
  { name: 'Jaeger-LeCoultre Reverso Classic', ref: 'Ref. Q3858520', year: 2019 },
  { name: 'Grand Seiko Snowflake', ref: 'Ref. SBGA211', year: 2021 },
];

const artPieces = [
  { name: 'KAWS - Companion (Open Edition)', edition: 'Grey Colorway', year: 2020 },
  { name: 'Banksy - Girl with Balloon', edition: 'Print /600', year: 2004 },
  { name: 'Takashi Murakami - Flower Ball', edition: 'Offset Print', year: 2017 },
  { name: 'Daniel Arsham - Eroded Porsche 911', edition: 'Limited /500', year: 2020 },
  { name: 'Invader - Rubik Kubrick', edition: 'Print /400', year: 2018 },
  { name: 'Shepard Fairey - Hope', edition: 'Signed Print', year: 2008 },
  { name: 'RETNA - Marquis Lewis', edition: 'Original Work', year: 2019 },
  { name: 'Jean-Michel Basquiat - Skull', edition: 'Lithograph', year: 1982 },
  { name: 'Keith Haring - Pop Shop Quad', edition: 'Screen Print', year: 1989 },
  { name: 'Jeff Koons - Balloon Dog', edition: 'Yellow Replica', year: 2021 },
];

const priceRanges: Record<Category, [number, number]> = {
  'Trading Cards': [150, 75000],
  'Vinyl Records': [45, 8500],
  'Comics': [250, 250000],
  'Sneakers': [180, 25000],
  'Watches': [2500, 185000],
  'Art': [350, 85000],
};

const events = ['Listed', 'Sold', 'Auction', 'Price Drop'];

function generateCollectibles(): Collectible[] {
  const items: Collectible[] = [];
  let id = 1;

  const allItems: { category: Category; data: { name: string; detail: string; year: number }[] }[] = [
    { category: 'Trading Cards', data: tradingCards.map(c => ({ name: c.name, detail: c.grade, year: c.year })) },
    { category: 'Vinyl Records', data: vinylRecords.map(v => ({ name: v.name, detail: v.press, year: v.year })) },
    { category: 'Comics', data: comics.map(c => ({ name: `${c.name} (${c.note})`, detail: c.grade, year: c.year })) },
    { category: 'Sneakers', data: sneakers.map(s => ({ name: s.name, detail: `Size ${s.size}`, year: s.year })) },
    { category: 'Watches', data: watches.map(w => ({ name: w.name, detail: w.ref, year: w.year })) },
    { category: 'Art', data: artPieces.map(a => ({ name: a.name, detail: a.edition, year: a.year })) },
  ];

  allItems.forEach(({ category, data }) => {
    const [minPrice, maxPrice] = priceRanges[category];

    data.forEach((item, idx) => {
      const conditionIdx = (idx * 7 + category.length) % conditions.length;
      const condition = conditions[conditionIdx];
      const statusOptions: Status[] = ['For Sale', 'Auction', 'Sold'];
      const status = statusOptions[(idx * 3 + category.charCodeAt(0)) % statusOptions.length];
      const basePrice = minPrice + ((idx * 2137 + category.charCodeAt(0) * 100) % (maxPrice - minPrice));
      const price = Math.round(basePrice / 50) * 50;
      const sellerIdx = (idx * 3 + category.length) % firstNames.length;
      const seller = `${firstNames[sellerIdx]} ${lastNames[(sellerIdx * 2) % lastNames.length]}`;

      const priceHistory: PriceHistory[] = [];
      let historyPrice = price * 0.55;
      for (let i = 0; i < 4; i++) {
        const year = 2022 + i;
        const month = ((idx * 2 + i * 4) % 12) + 1;
        priceHistory.push({
          date: `${year}-${month.toString().padStart(2, '0')}-${((idx * 5 + i * 7) % 28 + 1).toString().padStart(2, '0')}`,
          price: Math.round(historyPrice),
          event: events[(idx + i) % events.length],
        });
        historyPrice *= 1.12 + (idx % 4) * 0.03;
      }

      const conditionDescriptions: Record<Condition, string> = {
        'Mint': 'Flawless condition. Factory perfect with no visible wear, marks, or imperfections. Original packaging intact.',
        'Near Mint': 'Exceptional condition with only the most minor signs of handling. No significant flaws visible.',
        'Excellent': 'Very good overall condition with light wear consistent with careful ownership. Minor surface marks possible.',
        'Good': 'Solid condition showing normal wear from regular use. All functions intact. Some visible aging.',
        'Fair': 'Usable condition with notable wear. May have scratches, marks, or other cosmetic issues. Functional.',
      };

      const provenanceOptions = [
        `Acquired from Heritage Auctions in ${2015 + (idx % 8)}. Complete documentation and certificate of authenticity included.`,
        `Purchased directly from Sotheby's ${['Spring', 'Fall'][idx % 2]} ${2016 + (idx % 7)} auction. Full provenance chain available.`,
        `Estate sale acquisition from noted collector. Previously exhibited at major conventions.`,
        `Private collection purchase with original receipt and authentication papers from ${2014 + (idx % 9)}.`,
        `Certified by leading industry experts. Comes with detailed condition report and insurance valuation.`,
      ];

      items.push({
        id: id++,
        name: item.name,
        category,
        condition,
        price,
        seller,
        status,
        description: `${item.name} - ${item.detail}. A remarkable example from ${item.year}. ${condition} condition verified by professional graders. This piece represents a significant opportunity for serious collectors.`,
        provenance: provenanceOptions[(idx * 3 + category.length) % provenanceOptions.length],
        conditionNotes: conditionDescriptions[condition],
        priceHistory,
        owned: (idx * 7 + category.charCodeAt(0)) % 12 === 0,
        watched: (idx * 11 + category.charCodeAt(0)) % 9 === 0,
        year: item.year,
        rarity: item.detail,
        auctionEnds: status === 'Auction' ? `${2 + (idx % 5)}d ${12 + (idx % 12)}h` : undefined,
      });
    });
  });

  // Deterministic interleave: round-robin across categories for visual variety
  const byCategory: Record<string, Collectible[]> = {};
  items.forEach(item => {
    if (!byCategory[item.category]) byCategory[item.category] = [];
    byCategory[item.category].push(item);
  });
  const categoryKeys = Object.keys(byCategory);
  const interleaved: Collectible[] = [];
  const maxLen = Math.max(...categoryKeys.map(k => byCategory[k].length));
  for (let i = 0; i < maxLen; i++) {
    for (const key of categoryKeys) {
      if (i < byCategory[key].length) {
        interleaved.push(byCategory[key][i]);
      }
    }
  }
  return interleaved;
}

const initialCollectibles = generateCollectibles();

function getInitials(name: string): string {
  const words = name.split(' ').filter(w => w.length > 0);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export default function CollectablesPage() {
  const [isEmbedded, setIsEmbedded] = useState(false);
  useEffect(() => { try { setIsEmbedded(window.self !== window.top); } catch { setIsEmbedded(true); } }, []);

  const [collectibles, setCollectibles] = useState<Collectible[]>(initialCollectibles);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedCondition, setSelectedCondition] = useState<Condition | 'All'>('All');
  const [priceRange, setPriceRange] = useState<'All' | 'Under $500' | '$500-$5000' | '$5000+'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<Tab>('Marketplace');
  const [selectedItem, setSelectedItem] = useState<Collectible | null>(null);

  const filteredItems = useMemo(() => {
    let items = collectibles;

    if (activeTab === 'My Collection') {
      items = items.filter((item) => item.owned);
    } else if (activeTab === 'Watchlist') {
      items = items.filter((item) => item.watched);
    } else {
      items = items.filter((item) => !item.owned);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.seller.toLowerCase().includes(query) ||
          item.rarity.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'All') {
      items = items.filter((item) => item.category === selectedCategory);
    }

    if (selectedCondition !== 'All') {
      items = items.filter((item) => item.condition === selectedCondition);
    }

    if (priceRange !== 'All') {
      items = items.filter((item) => {
        if (priceRange === 'Under $500') return item.price < 500;
        if (priceRange === '$500-$5000') return item.price >= 500 && item.price <= 5000;
        if (priceRange === '$5000+') return item.price > 5000;
        return true;
      });
    }

    return items;
  }, [collectibles, searchQuery, selectedCategory, selectedCondition, priceRange, activeTab]);

  const handleBuy = (item: Collectible) => {
    setCollectibles((prev) =>
      prev.map((c) =>
        c.id === item.id ? { ...c, owned: true, status: 'Sold' as Status } : c
      )
    );
    setSelectedItem(null);
  };

  const handleWatch = (item: Collectible) => {
    setCollectibles((prev) =>
      prev.map((c) => (c.id === item.id ? { ...c, watched: !c.watched } : c))
    );
    if (selectedItem?.id === item.id) {
      setSelectedItem({ ...item, watched: !item.watched });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusStyle = (status: Status) => {
    switch (status) {
      case 'For Sale':
        return { color: 'var(--success)', bg: 'rgba(22, 163, 74, 0.08)' };
      case 'Auction':
        return { color: 'var(--warning)', bg: 'rgba(217, 119, 6, 0.08)' };
      case 'Sold':
        return { color: 'var(--destructive)', bg: 'rgba(220, 38, 38, 0.08)' };
    }
  };

  const getConditionStyle = (condition: Condition) => {
    switch (condition) {
      case 'Mint':
        return { color: 'var(--success)', bg: 'rgba(22, 163, 74, 0.08)' };
      case 'Near Mint':
        return { color: 'var(--primary)', bg: 'rgba(37, 99, 235, 0.08)' };
      case 'Excellent':
        return { color: 'var(--muted)', bg: 'rgba(82, 82, 82, 0.08)' };
      case 'Good':
        return { color: 'var(--warning)', bg: 'rgba(217, 119, 6, 0.08)' };
      case 'Fair':
        return { color: 'var(--muted)', bg: 'rgba(115, 115, 115, 0.08)' };
    }
  };

  const tabs: Tab[] = ['Marketplace', 'My Collection', 'Watchlist'];

  const tabCounts = useMemo(() => ({
    'Marketplace': collectibles.filter((c) => !c.owned).length,
    'My Collection': collectibles.filter((c) => c.owned).length,
    'Watchlist': collectibles.filter((c) => c.watched).length,
  }), [collectibles]);

  return (
    <div
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {isEmbedded && <div style={{ height: 47, flexShrink: 0, background: 'var(--background)' }} />}
      <header
        style={{
          borderBottom: '1px solid var(--border)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
          flexWrap: 'wrap',
        }}
      >
        <Link
          href="/"
          onClick={(e) => { try { if (window.self !== window.top) { e.preventDefault(); window.parent.postMessage('close-preview', '*'); } } catch { e.preventDefault(); } }}
          style={{
            color: 'var(--muted)',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            transition: 'color 150ms ease-out',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back
        </Link>
        <div style={{ width: 1, height: 16, backgroundColor: 'var(--border)' }} />
        <span style={{ fontSize: 15, fontWeight: 500 }}>Collectibles</span>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--secondary)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '8px 12px',
            flex: '1',
            maxWidth: '320px',
          }}
        >
          <Search size={16} strokeWidth={1.5} style={{ color: 'var(--muted)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search collectibles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--foreground)',
              fontSize: '13px',
              width: '100%',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category | 'All')}
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '7px 36px 7px 12px',
                color: 'var(--foreground)',
                fontSize: '13px',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown size={14} strokeWidth={1.5} style={{ position: 'absolute', right: '12px', pointerEvents: 'none', color: 'var(--muted)' }} />
          </div>

          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value as Condition | 'All')}
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '7px 36px 7px 12px',
                color: 'var(--foreground)',
                fontSize: '13px',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="All">All Conditions</option>
              {conditions.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
            <ChevronDown size={14} strokeWidth={1.5} style={{ position: 'absolute', right: '12px', pointerEvents: 'none', color: 'var(--muted)' }} />
          </div>

          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
            <select
              value={priceRange}
              onChange={(e) =>
                setPriceRange(e.target.value as 'All' | 'Under $500' | '$500-$5000' | '$5000+')
              }
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '7px 36px 7px 12px',
                color: 'var(--foreground)',
                fontSize: '13px',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
            <option value="All">All Prices</option>
            <option value="Under $500">Under $500</option>
            <option value="$500-$5000">$500 - $5,000</option>
            <option value="$5000+">$5,000+</option>
          </select>
            <ChevronDown size={14} strokeWidth={1.5} style={{ position: 'absolute', right: '12px', pointerEvents: 'none', color: 'var(--muted)' }} />
          </div>

          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--secondary)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '2px',
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              style={{
                background: viewMode === 'grid' ? 'var(--background)' : 'transparent',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 8px',
                cursor: 'pointer',
                color: viewMode === 'grid' ? 'var(--foreground)' : 'var(--muted)',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 150ms ease-out',
              }}
            >
              <Grid3X3 size={16} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                background: viewMode === 'list' ? 'var(--background)' : 'transparent',
                border: 'none',
                borderRadius: '4px',
                padding: '6px 8px',
                cursor: 'pointer',
                color: viewMode === 'list' ? 'var(--foreground)' : 'var(--muted)',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 150ms ease-out',
              }}
            >
              <List size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <nav
        style={{
          borderBottom: '1px solid var(--border)',
          padding: '0 24px',
          display: 'flex',
          gap: '24px',
          flexShrink: 0,
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--foreground)' : '2px solid transparent',
              padding: '12px 0',
              marginBottom: '-1px',
              color: activeTab === tab ? 'var(--foreground)' : 'var(--muted)',
              fontSize: '13px',
              fontWeight: activeTab === tab ? 500 : 400,
              cursor: 'pointer',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
              transition: 'color 150ms ease-out',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {tab}
            <span
              style={{
                backgroundColor: activeTab === tab ? 'var(--surface-2)' : 'var(--secondary)',
                color: activeTab === tab ? 'var(--foreground)' : 'var(--muted)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 400,
              }}
            >
              {tabCounts[tab]}
            </span>
          </button>
        ))}
      </nav>

      <main style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
        {filteredItems.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: 'var(--muted)',
            }}
          >
            <p style={{ fontSize: '15px' }}>No items found</p>
            <p style={{ fontSize: '13px', marginTop: '8px' }}>Try adjusting your filters</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))',
              gap: '16px',
            }}
          >
            {filteredItems.map((item) => {
              const catColor = categoryColors[item.category];
              const statusStyle = getStatusStyle(item.status);
              const condStyle = getConditionStyle(item.condition);
              return (
                <article
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'border-color 150ms ease-out, box-shadow 150ms ease-out',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '140px',
                      backgroundColor: 'var(--surface)',
                      background: 'repeating-linear-gradient(-45deg, transparent, transparent 8px, var(--surface-2) 8px, var(--surface-2) 9px)',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '8px',
                        left: '10px',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: catColor.bg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          color: catColor.text,
                          letterSpacing: '-0.02em',
                          userSelect: 'none',
                        }}
                      >
                        {getInitials(item.name)}
                      </span>
                    </div>
                    {item.watched && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          backgroundColor: 'var(--background)',
                          borderRadius: '4px',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Eye size={14} strokeWidth={1.5} style={{ color: 'var(--primary)' }} />
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '12px 14px 14px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '6px',
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: catColor.text,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        {item.category}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--muted)', marginLeft: 'auto' }}>
                        {item.year}
                      </span>
                    </div>
                    <h3
                      style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        marginBottom: '8px',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        minHeight: '36px',
                      }}
                    >
                      {item.name}
                    </h3>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '6px',
                      }}
                    >
                      <span style={{ fontSize: '15px', fontWeight: 600 }}>{formatPrice(item.price)}</span>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        {item.condition}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{item.seller}</span>
                      <span style={{ fontSize: '11px', color: statusStyle.color }}>
                        {item.status}
                        {item.auctionEnds && ` - ${item.auctionEnds}`}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredItems.map((item) => {
              const catColor = categoryColors[item.category];
              const statusStyle = getStatusStyle(item.status);
              const condStyle = getConditionStyle(item.condition);
              return (
                <article
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'border-color 150ms ease-out',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: 'var(--surface)',
                      background: 'repeating-linear-gradient(-45deg, transparent, transparent 8px, var(--surface-2) 8px, var(--surface-2) 9px)',
                      borderRadius: '6px',
                      flexShrink: 0,
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '4px',
                        right: '4px',
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        backgroundColor: catColor.text,
                      }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        marginBottom: '4px',
                        alignItems: 'center',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '11px',
                          color: catColor.text,
                          backgroundColor: catColor.bg,
                          padding: '1px 5px',
                          borderRadius: '3px',
                          fontWeight: 500,
                        }}
                      >
                        {item.category}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          color: condStyle.color,
                          backgroundColor: condStyle.bg,
                          padding: '1px 5px',
                          borderRadius: '3px',
                        }}
                      >
                        {item.condition}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{item.year}</span>
                    </div>
                    <h3
                      style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.name}
                    </h3>
                    <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{item.seller}</p>
                  </div>
                  <div
                    style={{
                      textAlign: 'right',
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        color: statusStyle.color,
                        backgroundColor: statusStyle.bg,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        display: 'inline-block',
                        marginBottom: '4px',
                      }}
                    >
                      {item.status}
                    </span>
                    <p style={{ fontSize: '15px', fontWeight: 600 }}>{formatPrice(item.price)}</p>
                  </div>
                  {item.watched && (
                    <Eye size={16} strokeWidth={1.5} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  )}
                </article>
              );
            })}
          </div>
        )}
      </main>

      {selectedItem && (
        <>
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              zIndex: 99,
            }}
            onClick={() => setSelectedItem(null)}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(480px, 100%)',
              backgroundColor: 'var(--background)',
              borderLeft: '1px solid var(--border)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  marginRight: '12px',
                  transition: 'color 150ms ease-out',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
              >
                <ArrowLeft size={20} strokeWidth={1.5} />
              </button>
              <div style={{ flex: 1, minWidth: 0, paddingRight: '16px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      color: categoryColors[selectedItem.category].text,
                      backgroundColor: categoryColors[selectedItem.category].bg,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 500,
                    }}
                  >
                    {selectedItem.category}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      color: getConditionStyle(selectedItem.condition).color,
                      backgroundColor: getConditionStyle(selectedItem.condition).bg,
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {selectedItem.condition}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      color: getStatusStyle(selectedItem.status).color,
                      backgroundColor: getStatusStyle(selectedItem.status).bg,
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    {selectedItem.status}
                  </span>
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 500, lineHeight: 1.4 }}>
                  {selectedItem.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  transition: 'color 150ms ease-out',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--foreground)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <div style={{ flex: 1, overflow: 'auto' }}>
              <div
                style={{
                  width: '100%',
                  height: '180px',
                  backgroundColor: 'var(--surface)',
                  background: 'repeating-linear-gradient(-45deg, transparent, transparent 8px, var(--surface-2) 8px, var(--surface-2) 9px)',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: categoryColors[selectedItem.category].bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '3px solid var(--background)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: categoryColors[selectedItem.category].text,
                      letterSpacing: '-0.02em',
                      userSelect: 'none',
                    }}
                  >
                    {getInitials(selectedItem.name)}
                  </span>
                </div>
              </div>

              <div style={{ padding: '20px', marginTop: '24px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    marginBottom: '24px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div>
                    <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Price</p>
                    <p style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.02em' }}>{formatPrice(selectedItem.price)}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>{selectedItem.year}</p>
                    <p style={{ fontSize: '13px', color: 'var(--foreground)' }}>{selectedItem.rarity}</p>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--foreground)' }}>{selectedItem.description}</p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Provenance</p>
                  <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--muted)' }}>
                    {selectedItem.provenance}
                  </p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Condition Notes
                  </p>
                  <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--muted)' }}>
                    {selectedItem.conditionNotes}
                  </p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                    <TrendingUp size={14} strokeWidth={1.5} style={{ color: 'var(--muted)' }} />
                    <p style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Price History
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selectedItem.priceHistory.map((ph, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '13px',
                          padding: '10px 12px',
                          backgroundColor: 'var(--secondary)',
                          borderRadius: '4px',
                        }}
                      >
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <span style={{ color: 'var(--muted)', fontSize: '12px', fontVariantNumeric: 'tabular-nums' }}>{ph.date}</span>
                          <span style={{ color: 'var(--muted)', fontSize: '11px' }}>{ph.event}</span>
                        </div>
                        <span style={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{formatPrice(ph.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    backgroundColor: 'var(--secondary)',
                    borderRadius: '6px',
                    marginBottom: '20px',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: 'var(--border)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: 'var(--muted)',
                    }}
                  >
                    {getInitials(selectedItem.seller)}
                  </div>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 500 }}>{selectedItem.seller}</p>
                    <p style={{ fontSize: '11px', color: 'var(--muted)' }}>Verified Seller</p>
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                padding: '16px 20px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                gap: '10px',
                flexShrink: 0,
                backgroundColor: 'var(--background)',
              }}
            >
              {selectedItem.owned ? (
                <div
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '12px 16px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--primary)',
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    borderRadius: '6px',
                  }}
                >
                  In Your Collection
                </div>
              ) : (
                <>
                  {selectedItem.status === 'For Sale' && (
                    <button
                      onClick={() => handleBuy(selectedItem)}
                      style={{
                        flex: 1,
                        backgroundColor: 'var(--foreground)',
                        color: 'var(--background)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '12px 16px',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'opacity 150ms ease-out',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      <ShoppingCart size={16} strokeWidth={1.5} />
                      Buy Now
                    </button>
                  )}
                  {selectedItem.status === 'Auction' && (
                    <button
                      style={{
                        flex: 1,
                        backgroundColor: 'var(--foreground)',
                        color: 'var(--background)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '12px 16px',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'opacity 150ms ease-out',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      Place Bid
                    </button>
                  )}
                  {selectedItem.status !== 'Sold' && (
                    <button
                      style={{
                        flex: selectedItem.status === 'Sold' ? 1 : 0,
                        minWidth: '100px',
                        backgroundColor: 'transparent',
                        color: 'var(--foreground)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        padding: '12px 16px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'border-color 150ms ease-out',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                    >
                      Make Offer
                    </button>
                  )}
                  <button
                    onClick={() => handleWatch(selectedItem)}
                    style={{
                      width: '44px',
                      height: '44px',
                      backgroundColor: selectedItem.watched ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                      color: selectedItem.watched ? 'var(--primary)' : 'var(--muted)',
                      border: `1px solid ${selectedItem.watched ? 'rgba(37, 99, 235, 0.2)' : 'var(--border)'}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 150ms ease-out',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedItem.watched) {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.color = 'var(--foreground)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedItem.watched) {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.color = 'var(--muted)';
                      }
                    }}
                  >
                    {selectedItem.watched ? <Heart size={18} strokeWidth={1.5} fill="var(--primary)" /> : <Heart size={18} strokeWidth={1.5} />}
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
      {isEmbedded && <div style={{ height: 34, flexShrink: 0, background: 'var(--background)' }} />}
    </div>
  );
}
