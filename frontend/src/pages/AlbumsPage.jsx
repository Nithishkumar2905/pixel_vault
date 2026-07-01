import { useState } from 'react'
import { Search, Sparkles, LayoutGrid, List, Plus, Image as ImageIcon, Clock, CheckCircle } from 'lucide-react'
import AlbumCard from '../components/AlbumCard'

const mockAlbums = [
  { id: 1, title: 'Mountain Landscapes', photoCount: 128, description: 'Scenic mountain views and landscapes with natural beauty.', isAIGenerated: true, coverUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80' },
  { id: 2, title: 'Wedding Moments', photoCount: 248, description: 'Beautiful moments captured from weddings and celebrations.', isAIGenerated: true, coverUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80' },
  { id: 3, title: 'Portraits', photoCount: 156, description: 'Stunning portraits with perfect lighting and expressions.', isAIGenerated: true, coverUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80' },
  { id: 4, title: 'City at Night', photoCount: 97, description: 'Night cityscapes with lights and urban vibes.', isAIGenerated: true, coverUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&q=80' },
  { id: 5, title: 'Wildlife in Nature', photoCount: 164, description: 'Animals and wildlife captured in their natural habitat.', isAIGenerated: true, coverUrl: 'https://images.unsplash.com/photo-1517825738774-7de2b2b186b5?w=800&q=80' },
  { id: 6, title: 'Sunset Wonders', photoCount: 203, description: 'Breathtaking sunsets and golden hour moments.', isAIGenerated: true, coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80' },
  { id: 7, title: 'Waterfalls', photoCount: 78, description: 'Majestic waterfalls and flowing water scenes.', isAIGenerated: true, coverUrl: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80' },
  { id: 8, title: 'Food Photography', photoCount: 112, description: 'Delicious food shots and culinary art.', isAIGenerated: true, coverUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80' },
]

export default function AlbumsPage() {
  const [activeTab, setActiveTab] = useState('all')

  return (
    <div className="fade-in page-section">
      <div className="container" style={{ maxWidth: '1600px' }}>
        
        <div className="page-with-sidebar">
          {/* Main Content */}
          <div className="main-content-area">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  AI Albums
                  <Sparkles size={24} color="var(--color-highlight)" />
                </h1>
                <p className="section-subtitle">Automatically created albums using AI from your photos.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-secondary">
                  <Plus size={16} />
                  Create Album
                </button>
                <button className="btn btn-primary" style={{ background: 'rgba(221, 184, 146, 0.15)', color: 'var(--color-highlight-hover)', borderColor: 'rgba(221, 184, 146, 0.3)', boxShadow: 'none' }}>
                  <Sparkles size={16} />
                  AI Create Album
                </button>
              </div>
            </div>

            {/* Controls Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div className="tab-filters">
                <button className={`tab-filter-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All Albums</button>
                <button className={`tab-filter-btn ${activeTab === 'ai' ? 'active' : ''}`} onClick={() => setActiveTab('ai')}>AI Generated</button>
                <button className={`tab-filter-btn ${activeTab === 'smart' ? 'active' : ''}`} onClick={() => setActiveTab('smart')}>Smart Albums</button>
                <button className={`tab-filter-btn ${activeTab === 'custom' ? 'active' : ''}`} onClick={() => setActiveTab('custom')}>Custom Albums</button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  <input type="text" placeholder="Search albums..." style={{ padding: '0.4rem 1rem 0.4rem 2rem', borderRadius: '12px', border: '1px solid var(--color-border)', outline: 'none', fontSize: '0.85rem' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Sort by:</span>
                  <select style={{ border: 'none', background: 'transparent', fontWeight: 600, color: 'var(--color-text-primary)', outline: 'none', cursor: 'pointer' }}>
                    <option>Newest</option>
                    <option>Oldest</option>
                  </select>
                </div>
                <div style={{ display: 'flex', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '0.25rem' }}>
                  <button style={{ background: 'var(--color-accent)', color: '#FFF', border: 'none', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer' }}>
                    <LayoutGrid size={16} />
                  </button>
                  <button style={{ background: 'transparent', color: 'var(--color-text-secondary)', border: 'none', borderRadius: '8px', padding: '0.4rem', cursor: 'pointer' }}>
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="photo-grid" style={{ columns: 3 }}>
              {mockAlbums.map(album => (
                <div className="photo-grid-item" key={album.id}>
                  <AlbumCard album={album} />
                </div>
              ))}
            </div>

            {/* Load More Placeholder */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
              <button className="btn btn-secondary" style={{ borderRadius: '999px', padding: '0.75rem 2rem' }}>
                Load More Albums &darr;
              </button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="right-sidebar">
            
            {/* AI Album Insights */}
            <div className="sidebar-block">
              <div className="sidebar-block-title">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Sparkles size={16} color="var(--color-highlight)" /> AI Album Insights</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ background: 'var(--color-bg-primary)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                  <div style={{ color: 'var(--color-success)', marginBottom: '0.5rem' }}><ImageIcon size={20} /></div>
                  <div className="numbers" style={{ fontSize: '1.25rem', fontWeight: 700 }}>12</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>AI Albums Generated</div>
                </div>
                <div style={{ background: 'var(--color-bg-primary)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                  <div style={{ color: '#FB5607', marginBottom: '0.5rem' }}><LayoutGrid size={20} /></div>
                  <div className="numbers" style={{ fontSize: '1.25rem', fontWeight: 700 }}>1,486</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Photos Organized</div>
                </div>
                <div style={{ background: 'var(--color-bg-primary)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                  <div style={{ color: '#8338EC', marginBottom: '0.5rem' }}><CheckCircle size={20} /></div>
                  <div className="numbers" style={{ fontSize: '1.25rem', fontWeight: 700 }}>98%</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Accuracy AI Recognition</div>
                </div>
                <div style={{ background: 'var(--color-bg-primary)', padding: '1rem', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
                  <div style={{ color: 'var(--color-warning)', marginBottom: '0.5rem' }}><Clock size={20} /></div>
                  <div className="numbers" style={{ fontSize: '1.25rem', fontWeight: 700 }}>36h</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Time Saved This Month</div>
                </div>
              </div>
            </div>

            {/* AI Album Generator */}
            <div className="sidebar-block" style={{ background: 'rgba(221, 184, 146, 0.05)', borderColor: 'rgba(221, 184, 146, 0.2)' }}>
              <div className="sidebar-block-title">AI Album Generator</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                Let AI automatically organize your photos into beautiful albums.
              </p>
              <button className="btn" style={{ width: '100%', background: '#FFFFFF', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
                <Sparkles size={16} color="var(--color-highlight)" />
                Generate New Albums
              </button>
            </div>

            {/* Recent AI Albums */}
            <div className="sidebar-block">
              <div className="sidebar-block-title">
                Recent AI Albums
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: 600 }}>View All</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={`https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=100&q=80`} alt="Album" style={{ width: 48, height: 48, borderRadius: '8px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div className="truncate-2" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Travel Diaries</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>84 photos</div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{i}h ago</div>
                  </div>
                ))}
              </div>
              <button className="btn btn-secondary" style={{ width: '100%', marginTop: '1rem', border: 'none', background: 'var(--color-bg-primary)' }}>
                View All Albums &gt;
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
