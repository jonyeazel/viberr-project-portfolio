'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Grid3X3, List, X, Eye } from 'lucide-react';

type Category = 'Trading Cards' | 'Vinyl' | 'Comics' | 'Sneakers' | 'Watches' | 'Art';
type Condition = 'Mint' | 'Near Mint' | 'Good' | 'Fair';
type Status = 'For Sale' | 'Auction' | 'Sold' | 'In Collection';
type Tab = 'Marketplace' | 'My Collection' | 'Watchlist';

interface PriceHistory {
  date: string;
  price: number;
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
  imageHue: number;
}

const categories: Category[] = ['Trading Cards', 'Vinyl', 'Comics', 'Sneakers', 'Watches', 'Art'];
const conditions: Condition[] = ['Mint', 'Near Mint', 'Good', 'Fair'];
const statuses: Status[] = ['For Sale', 'Auction', 'Sold', 'In Collection'];

const firstNames = ['James', 'Michael', 'David', 'Robert', 'Sarah', 'Emily', 'Jessica', 'Amanda', 'Chris', 'Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Martinez', 'Anderson', 'Wilson', 'Moore', 'Taylor', 'Thomas', 'Lee'];

const tradingCards = [
  '1989 Upper Deck Ken Griffey Jr. PSA 9',
  '1986 Fleer Michael Jordan Rookie PSA 8',
  '1952 Topps Mickey Mantle PSA 4',
  '1993 SP Foil Derek Jeter Rookie PSA 10',
  '2003 Topps Chrome LeBron James Refractor',
  '1996 Pokemon Base Set Charizard Holo PSA 9',
  '1999 Pokemon 1st Edition Shadowless Pikachu',
  '2020 Panini Prizm Justin Herbert Silver',
  '1984 Topps Don Mattingly Rookie PSA 9',
  '2018 Panini National Treasures Luka Doncic /99',
];

const vinyls = [
  'The Beatles - Abbey Road (1969 UK First Press)',
  'Pink Floyd - Dark Side of the Moon (1973 UK)',
  'Led Zeppelin - IV (1971 Atlantic First Press)',
  'Nirvana - Nevermind (1991 DGC Original)',
  'Miles Davis - Kind of Blue (1959 Columbia 6-Eye)',
  'Radiohead - OK Computer (1997 UK First Press)',
  'Fleetwood Mac - Rumours (1977 Warner Bros)',
  'David Bowie - Ziggy Stardust (1972 RCA First)',
  'Prince - Purple Rain (1984 Warner Bros Sealed)',
  'Kendrick Lamar - To Pimp a Butterfly (2015 Ltd)',
];

const comics = [
  'Amazing Fantasy #15 (First Spider-Man) CGC 4.0',
  'Action Comics #1 (First Superman) CGC 1.8',
  'Detective Comics #27 (First Batman) CGC 3.0',
  'X-Men #1 (1963) CGC 7.5',
  'Incredible Hulk #181 (First Wolverine) CGC 9.0',
  'Giant-Size X-Men #1 CGC 9.6',
  'Amazing Spider-Man #129 (First Punisher) CGC 8.5',
  'Batman #1 (1940) CGC 5.5',
  'Tales of Suspense #39 (First Iron Man) CGC 6.0',
  'Fantastic Four #1 CGC 4.5',
];

const sneakers = [
  'Air Jordan 1 Retro High OG Chicago 2015',
  'Nike Air Mag Back to the Future 2016',
  'Air Jordan 11 Concord 2018 DS',
  'Nike Dunk Low Off-White Lot 01',
  'Yeezy Boost 350 V2 Zebra DS',
  'Air Jordan 4 Retro OG White Cement 2016',
  'Nike SB Dunk Low Paris Special Box',
  'Air Jordan 3 Retro Black Cement 2018',
  'Travis Scott x Air Jordan 1 High OG',
  'Nike Air Force 1 Low Supreme Box Logo',
];

const watches = [
  'Rolex Submariner 5513 Gilt Dial 1966',
  'Patek Philippe Nautilus 5711/1A Blue',
  'Omega Speedmaster Professional Moonwatch',
  'Audemars Piguet Royal Oak 15400ST',
  'Rolex Daytona 116500LN Panda Dial',
  'Cartier Santos de Cartier Large',
  'IWC Portugieser Chronograph IW371446',
  'Tudor Black Bay 58 Blue',
  'Jaeger-LeCoultre Reverso Classic',
  'Grand Seiko Snowflake SBGA211',
];

const artPieces = [
  'KAWS - Companion (Open Edition) Grey',
  'Banksy - Girl with Balloon Print /600',
  'Takashi Murakami - Flower Ball Print',
  'Daniel Arsham - Eroded Porsche 911',
  'Invader - Rubik Kubrick Print /400',
  'Shepard Fairey - Hope Print Signed',
  'RETNA - Marquis Lewis Original',
  'Jean-Michel Basquiat - Skull Lithograph',
  'Keith Haring - Pop Shop Quad Print',
  'Jeff Koons - Balloon Dog (Yellow) Replica',
];

const itemsByCategory: Record<Category, string[]> = {
  'Trading Cards': tradingCards,
  'Vinyl': vinyls,
  'Comics': comics,
  'Sneakers': sneakers,
  'Watches': watches,
  'Art': artPieces,
};

const priceRanges: Record<Category, [number, number]> = {
  'Trading Cards': [50, 50000],
  'Vinyl': [30, 5000],
  'Comics': [100, 100000],
  'Sneakers': [150, 15000],
  'Watches': [500, 150000],
  'Art': [200, 50000],
};

function generateCollectibles(): Collectible[] {
  const items: Collectible[] = [];
  let id = 1;

  categories.forEach((category) => {
    const categoryItems = itemsByCategory[category];
    const [minPrice, maxPrice] = priceRanges[category];

    categoryItems.forEach((name, idx) => {
      const condition = conditions[Math.floor((idx * 7) % conditions.length)];
      const status = statuses[Math.floor((idx * 3) % statuses.length)];
      const basePrice = minPrice + ((idx * 1337) % (maxPrice - minPrice));
      const price = Math.round(basePrice / 10) * 10;
      const seller = `${firstNames[idx % firstNames.length]} ${lastNames[(idx * 3) % lastNames.length]}`;

      const priceHistory: PriceHistory[] = [];
      let historyPrice = price * 0.6;
      for (let i = 0; i < 4; i++) {
        const year = 2022 + i;
        const month = ((idx * 2 + i * 3) % 12) + 1;
        priceHistory.push({
          date: `${year}-${month.toString().padStart(2, '0')}`,
          price: Math.round(historyPrice),
        });
        historyPrice *= 1.1 + (idx % 3) * 0.05;
      }

      items.push({
        id: id++,
        name,
        category,
        condition,
        price,
        seller,
        status,
        description: `Authentic ${name}. ${condition} condition with original packaging. Verified by certified graders.`,
        provenance: `Originally purchased from ${['Heritage Auctions', 'Sotheby\'s', 'Christie\'s', 'Private Collection', 'Estate Sale'][idx % 5]} in ${2015 + (idx % 8)}. Chain of custody documented.`,
        conditionNotes: condition === 'Mint' ? 'Perfect condition. No visible flaws.' : condition === 'Near Mint' ? 'Minor surface wear only. Excellent presentation.' : condition === 'Good' ? 'Light wear consistent with age. No major defects.' : 'Moderate wear. Some visible imperfections.',
        priceHistory,
        owned: (idx * 7) % 10 === 0,
        watched: (idx * 11) % 8 === 0,
        imageHue: (idx * 37) % 360,
      });
    });
  });

  return items;
}

const initialCollectibles = generateCollectibles();

export default function CollectablesPage() {
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
      items = items.filter((item) => item.status !== 'In Collection' || item.owned);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.seller.toLowerCase().includes(query)
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
        c.id === item.id ? { ...c, owned: true, status: 'In Collection' as Status } : c
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

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'For Sale':
        return '#16a34a';
      case 'Auction':
        return '#d97706';
      case 'Sold':
        return '#dc2626';
      case 'In Collection':
        return '#2563eb';
    }
  };

  const tabs: Tab[] = ['Marketplace', 'My Collection', 'Watchlist'];

  return (
    <div
      style={{
        backgroundColor: '#fafaf9',
        color: '#191919',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Bar */}
      <header
        style={{
          borderBottom: '1px solid #e5e5e3',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          flexWrap: 'wrap',
        }}
      >
        <Link
          href="/"
          style={{
            color: '#737373',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            transition: 'color 150ms ease-out',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#191919')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#737373')}
        >
          <ArrowLeft size={18} strokeWidth={1.5} />
          Back
        </Link>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#fafaf9',
            border: '1px solid #e5e5e3',
            borderRadius: '6px',
            padding: '8px 12px',
            flex: '1',
            maxWidth: '400px',
          }}
        >
          <Search size={18} strokeWidth={1.5} style={{ color: '#737373' }} />
          <input
            type="text"
            placeholder="Search collectibles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#191919',
              fontSize: '13px',
              width: '100%',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as Category | 'All')}
            style={{
              backgroundColor: '#fafaf9',
              border: '1px solid #e5e5e3',
              borderRadius: '6px',
              padding: '8px 12px',
              color: '#191919',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value as Condition | 'All')}
            style={{
              backgroundColor: '#fafaf9',
              border: '1px solid #e5e5e3',
              borderRadius: '6px',
              padding: '8px 12px',
              color: '#191919',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <option value="All">All Conditions</option>
            {conditions.map((cond) => (
              <option key={cond} value={cond}>
                {cond}
              </option>
            ))}
          </select>

          <select
            value={priceRange}
            onChange={(e) =>
              setPriceRange(e.target.value as 'All' | 'Under $500' | '$500-$5000' | '$5000+')
            }
            style={{
              backgroundColor: '#fafaf9',
              border: '1px solid #e5e5e3',
              borderRadius: '6px',
              padding: '8px 12px',
              color: '#191919',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <option value="All">All Prices</option>
            <option value="Under $500">Under $500</option>
            <option value="$500-$5000">$500 - $5,000</option>
            <option value="$5000+">$5,000+</option>
          </select>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '4px',
            backgroundColor: '#fafaf9',
            border: '1px solid #e5e5e3',
            borderRadius: '6px',
            padding: '4px',
          }}
        >
          <button
            onClick={() => setViewMode('grid')}
            style={{
              background: viewMode === 'grid' ? '#eeeeec' : 'transparent',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 8px',
              cursor: 'pointer',
              color: viewMode === 'grid' ? '#191919' : '#737373',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 150ms ease-out',
            }}
          >
            <Grid3X3 size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              background: viewMode === 'list' ? '#eeeeec' : 'transparent',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 8px',
              cursor: 'pointer',
              color: viewMode === 'list' ? '#191919' : '#737373',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 150ms ease-out',
            }}
          >
            <List size={18} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav
        style={{
          borderBottom: '1px solid #e5e5e3',
          padding: '0 24px',
          display: 'flex',
          gap: '32px',
        }}
      >
        {tabs.map((tab) => {
          const count =
            tab === 'Marketplace'
              ? collectibles.filter((c) => c.status !== 'In Collection' || c.owned).length
              : tab === 'My Collection'
                ? collectibles.filter((c) => c.owned).length
                : collectibles.filter((c) => c.watched).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid #191919' : '2px solid transparent',
                padding: '16px 0',
                color: activeTab === tab ? '#191919' : '#737373',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
                transition: 'all 150ms ease-out',
              }}
            >
              {tab}
              <span
                style={{
                  backgroundColor: '#eeeeec',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '24px', overflow: 'auto' }}>
        {filteredItems.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '300px',
              color: '#737373',
            }}
          >
            <p style={{ fontSize: '15px' }}>No items found</p>
            <p style={{ fontSize: '13px', marginTop: '8px' }}>Try adjusting your filters</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {filteredItems.map((item) => (
              <article
                key={item.id}
                onClick={() => setSelectedItem(item)}
                style={{
                  backgroundColor: '#fafaf9',
                  border: '1px solid #e5e5e3',
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'border-color 150ms ease-out',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#d4d4d2')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e5e5e3')}
              >
                <div
                  style={{
                    width: '100%',
                    height: '160px',
                    backgroundColor: `hsl(${item.imageHue}, 15%, 12%)`,
                    borderRadius: '4px',
                    marginBottom: '12px',
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#737373',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {item.category}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      color: getStatusColor(item.status),
                    }}
                  >
                    {item.status}
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
                  }}
                >
                  {item.name}
                </h3>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <span style={{ fontSize: '11px', color: '#737373' }}>{item.condition}</span>
                  <span style={{ fontSize: '15px', fontWeight: 500 }}>{formatPrice(item.price)}</span>
                </div>
                <p style={{ fontSize: '11px', color: '#737373' }}>{item.seller}</p>
              </article>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredItems.map((item) => (
              <article
                key={item.id}
                onClick={() => setSelectedItem(item)}
                style={{
                  backgroundColor: '#fafaf9',
                  border: '1px solid #e5e5e3',
                  borderRadius: '8px',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  transition: 'border-color 150ms ease-out',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#d4d4d2')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e5e5e3')}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: `hsl(${item.imageHue}, 15%, 12%)`,
                    borderRadius: '4px',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      gap: '12px',
                      marginBottom: '4px',
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '11px',
                        color: '#737373',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {item.category}
                    </span>
                    <span style={{ fontSize: '11px', color: '#737373' }}>{item.condition}</span>
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
                  <p style={{ fontSize: '11px', color: '#737373', marginTop: '4px' }}>{item.seller}</p>
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
                      color: getStatusColor(item.status),
                      display: 'block',
                      marginBottom: '4px',
                    }}
                  >
                    {item.status}
                  </span>
                  <span style={{ fontSize: '15px', fontWeight: 500 }}>{formatPrice(item.price)}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 100,
          }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            style={{
              backgroundColor: '#fafaf9',
              border: '1px solid #e5e5e3',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '20px',
                borderBottom: '1px solid #e5e5e3',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#737373',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {selectedItem.category}
                  </span>
                  <span style={{ fontSize: '11px', color: getStatusColor(selectedItem.status) }}>
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
                  color: '#737373',
                  cursor: 'pointer',
                  padding: '4px',
                  transition: 'color 150ms ease-out',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#191919')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#737373')}
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <div
              style={{
                width: '100%',
                height: '200px',
                backgroundColor: `hsl(${selectedItem.imageHue}, 15%, 12%)`,
              }}
            />

            <div style={{ padding: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '24px',
                }}
              >
                <div>
                  <p style={{ fontSize: '11px', color: '#737373', marginBottom: '4px' }}>Price</p>
                  <p style={{ fontSize: '24px', fontWeight: 500 }}>{formatPrice(selectedItem.price)}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '11px', color: '#737373', marginBottom: '4px' }}>Condition</p>
                  <p style={{ fontSize: '15px' }}>{selectedItem.condition}</p>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '11px', color: '#737373', marginBottom: '8px' }}>Description</p>
                <p style={{ fontSize: '13px', lineHeight: 1.6 }}>{selectedItem.description}</p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '11px', color: '#737373', marginBottom: '8px' }}>Provenance</p>
                <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#737373' }}>
                  {selectedItem.provenance}
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '11px', color: '#737373', marginBottom: '8px' }}>
                  Condition Notes
                </p>
                <p style={{ fontSize: '13px', lineHeight: 1.6, color: '#737373' }}>
                  {selectedItem.conditionNotes}
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '11px', color: '#737373', marginBottom: '12px' }}>
                  Price History
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedItem.priceHistory.map((ph, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '13px',
                        padding: '8px 12px',
                        backgroundColor: '#eeeeec',
                        borderRadius: '4px',
                      }}
                    >
                      <span style={{ color: '#737373' }}>{ph.date}</span>
                      <span>{formatPrice(ph.price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p style={{ fontSize: '11px', color: '#737373', marginBottom: '16px' }}>
                Seller: {selectedItem.seller}
              </p>

              <div style={{ display: 'flex', gap: '12px' }}>
                {selectedItem.status === 'For Sale' && !selectedItem.owned && (
                  <button
                    onClick={() => handleBuy(selectedItem)}
                    style={{
                      flex: 1,
                      backgroundColor: '#fafaf9',
                      color: '#191919',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '12px 16px',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'opacity 150ms ease-out',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    Buy Now
                  </button>
                )}
                {selectedItem.status === 'Auction' && !selectedItem.owned && (
                  <button
                    style={{
                      flex: 1,
                      backgroundColor: '#fafaf9',
                      color: '#191919',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '12px 16px',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'opacity 150ms ease-out',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    Make Offer
                  </button>
                )}
                {!selectedItem.owned && (
                  <button
                    onClick={() => handleWatch(selectedItem)}
                    style={{
                      flex: selectedItem.status === 'Sold' ? 1 : 0,
                      minWidth: selectedItem.status === 'Sold' ? 'auto' : '120px',
                      backgroundColor: 'transparent',
                      color: selectedItem.watched ? '#2563eb' : '#191919',
                      border: `1px solid ${selectedItem.watched ? '#2563eb' : '#e5e5e3'}`,
                      borderRadius: '6px',
                      padding: '12px 16px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 150ms ease-out',
                    }}
                  >
                    <Eye size={16} strokeWidth={1.5} />
                    {selectedItem.watched ? 'Watching' : 'Watch'}
                  </button>
                )}
                {selectedItem.owned && (
                  <div
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '12px 16px',
                      fontSize: '13px',
                      color: '#2563eb',
                      backgroundColor: 'rgba(74, 158, 255, 0.1)',
                      borderRadius: '6px',
                    }}
                  >
                    In Your Collection
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
