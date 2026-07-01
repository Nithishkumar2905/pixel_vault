import { useState, useEffect } from 'react'
import { Heart, LayoutGrid, List, Search, Image as ImageIcon, Folder, Video, Calendar, Tag } from 'lucide-react'
import PhotoCard from '../components/PhotoCard'
import photoService from '../services/photoService'

export default function FavoritesPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true)
        const res = await photoService.getFavorites({ limit: 100 })
        setFavorites(res.photos || [])
      } catch (err) {
        console.error('Failed to fetch favorites:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchFavorites()
  }, [])

  return (
    <div className="fade-in page-section">
      <div className="container" style={{ maxWidth: '1600px' }}>
        
        <div className="page-with-sidebar">
          {/* Main Content */}
          <div className="main-content-area">
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
              <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                Favorites
                <Heart size={28} color="var(--color-error)" strokeWidth={2.5} />
              </h1>
              <p className="section-subtitle">Your favorite photos and moments, all in one place.</p>
            </div>

            {/* Controls Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div className="tab-filters">
                <button 
                  className={`tab-filter-btn ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  All Favorites <span style={{ opacity: 0.7, fontSize: '0.75rem', marginLeft: '4px' }}>{favorites.length}</span>
                </button>
                <button 
                  className={`tab-filter-btn ${activeTab === 'photos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('photos')}
                >
                  Photos <span style={{ opacity: 0.7, fontSize: '0.75rem', marginLeft: '4px' }}>{favorites.length}</span>
                </button>
                <button 
                  className={`tab-filter-btn ${activeTab === 'albums' ? 'active' : ''}`}
                  onClick={() => setActiveTab('albums')}
                >
                  Albums <span style={{ opacity: 0.7, fontSize: '0.75rem', marginLeft: '4px' }}>0</span>
                </button>
                <button 
                  className={`tab-filter-btn ${activeTab === 'videos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('videos')}
                >
                  Videos <span style={{ opacity: 0.7, fontSize: '0.75rem', marginLeft: '4px' }}>0</span>
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                <div className="spinner"></div>
              </div>
            ) : favorites.length > 0 ? (
              <div className="photo-grid">
                {favorites.map(photo => (
                  <PhotoCard key={photo.id} photo={photo} />
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ marginTop: '3rem' }}>
                <div className="empty-state-icon">
                  <Heart size={40} />
                </div>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                  No favorites yet
                </h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                  Photos you like will appear here. Go explore and find some favorites!
                </p>
              </div>
            )}

            {/* Pagination Placeholder */}
            {favorites.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '3rem' }}>
                <button className="btn btn-secondary btn-sm" style={{ padding: '0.5rem' }}>&lt;</button>
                <button className="btn btn-primary btn-sm" style={{ padding: '0.5rem 1rem' }}>1</button>
                <button className="btn btn-secondary btn-sm" style={{ padding: '0.5rem' }}>&gt;</button>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="right-sidebar">
            
            {/* Overview */}
            <div className="sidebar-block">
              <div className="sidebar-block-title">Favorites Overview</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', marginTop: '1rem' }}>
                <div>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(188, 71, 73, 0.1)', color: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
                    <Heart size={18} />
                  </div>
                  <div className="numbers" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{favorites.length}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Total Favorites</div>
                </div>
                <div>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(107, 112, 92, 0.1)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
                    <ImageIcon size={18} />
                  </div>
                  <div className="numbers" style={{ fontSize: '1.25rem', fontWeight: 700 }}>{favorites.length}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Photos</div>
                </div>
                <div>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(131, 56, 236, 0.1)', color: '#8338EC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
                    <Folder size={18} />
                  </div>
                  <div className="numbers" style={{ fontSize: '1.25rem', fontWeight: 700 }}>0</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Albums</div>
                </div>
                <div>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(251, 86, 7, 0.1)', color: '#FB5607', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
                    <Video size={18} />
                  </div>
                  <div className="numbers" style={{ fontSize: '1.25rem', fontWeight: 700 }}>0</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>Videos</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            {favorites.length > 0 && (
              <div className="sidebar-block">
                <div className="sidebar-block-title">
                  Recent Activity
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: 600 }}>View All</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                  {favorites.slice(0, 5).map((photo, i) => (
                    <div key={photo.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={photo.image_url} alt="Activity" style={{ width: 48, height: 48, borderRadius: '8px', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div className="truncate-2" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{photo.title || 'Untitled'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>added to favorites</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                        <Heart size={14} color="var(--color-error)" fill="var(--color-error)" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="sidebar-block">
              <div className="sidebar-block-title">
                Filters
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: 600 }}>Clear All</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
                <div>
                  <label className="input-label">Date Added</label>
                  <div className="input-field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem' }}>
                    <Calendar size={16} color="var(--color-text-muted)" />
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Select Date Range</span>
                  </div>
                </div>

                <div>
                  <label className="input-label">Media Type</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-sm" style={{ background: 'var(--color-accent)', color: '#FFF' }}>All</button>
                    <button className="btn btn-secondary btn-sm">Photos</button>
                    <button className="btn btn-secondary btn-sm">Videos</button>
                    <button className="btn btn-secondary btn-sm">Albums</button>
                  </div>
                </div>

                <div>
                  <label className="input-label">Tags</label>
                  <div className="input-field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem' }}>
                    <Tag size={16} color="var(--color-text-muted)" />
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Select Tags</span>
                  </div>
                </div>

                <div>
                  <label className="input-label">Albums</label>
                  <div className="input-field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem' }}>
                    <Folder size={16} color="var(--color-text-muted)" />
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Select Albums</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
