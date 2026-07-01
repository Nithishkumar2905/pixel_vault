import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, Sparkles, LayoutGrid, List, Heart, Calendar, MapPin, Tag, Palette, Maximize, Lock, CheckCircle, Smartphone, Monitor } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import PhotoCard from '../components/PhotoCard'
import photoService from '../services/photoService'

const SUGGESTIONS = [
  'Mountain landscapes', 'Wedding moments', 'Portrait with natural light', 'City at night', 'Wildlife in forest'
]

// Mock results with AI Match scores
const mockSearchPhotos = [
  { id: 1, title: 'Golden Beach Sunset', matchPercentage: 98, image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', isLiked: true, tags: ['Sunset', 'Beach', 'People', 'Golden Hour'] },
  { id: 2, title: 'Palm Trees Silhouette', matchPercentage: 97, image_url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80', isLiked: false, tags: ['Sunset', 'Beach', 'Palm Trees', 'People'] },
  { id: 3, title: 'Lifeguard Tower', matchPercentage: 96, image_url: 'https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=800&q=80', isLiked: false, tags: ['Sunset', 'Beach', 'Sky', 'Ocean'] },
  { id: 4, title: 'Family at the Beach', matchPercentage: 95, image_url: 'https://images.unsplash.com/photo-1520610360655-b04e6c986eb7?w=800&q=80', isLiked: true, tags: ['Sunset', 'Beach', 'Family', 'Golden Hour'] },
  { id: 5, title: 'Sunset Reflection', matchPercentage: 98, image_url: 'https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=800&q=80', isLiked: true, tags: ['Sunset', 'Beach', 'Silhouette', 'Clouds'] },
  { id: 6, title: 'Walking on the Beach', matchPercentage: 96, image_url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80', isLiked: false, tags: ['Sunset', 'Beach', 'Reflection', 'People'] },
  { id: 7, title: 'Ocean Waves at Dusk', matchPercentage: 94, image_url: 'https://images.unsplash.com/photo-1473496169904-658ba98b5840?w=800&q=80', isLiked: false, tags: ['Sunset', 'Beach', 'Clouds', 'Sky'] },
  { id: 8, title: 'Golden Hour Pier', matchPercentage: 93, image_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80', isLiked: false, tags: ['Sunset', 'Beach', 'Palm Trees', 'Golden Hour'] },
]

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || 'Sunset photos at the beach with people walking and golden sky'
  const [photos, setPhotos] = useState(mockSearchPhotos) // Use mock for this UI preview
  
  const handleSearch = (newQ) => setSearchParams({ q: newQ })

  return (
    <div className="fade-in page-section">
      <div className="container" style={{ maxWidth: '1600px' }}>
        
        <div className="page-with-sidebar">
          {/* Main Content */}
          <div className="main-content-area">
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
              <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                AI Search
                <Sparkles size={24} color="var(--color-highlight)" />
              </h1>
              <p className="section-subtitle">Describe what you're looking for in natural language. AI will find it for you.</p>
            </div>

            {/* Huge Search Input */}
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '0.5rem', boxShadow: 'var(--shadow-soft)' }}>
                <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRight: '1px solid var(--color-border)' }}>
                   <Monitor size={18} color="var(--color-text-muted)" />
                   <Sparkles size={18} color="var(--color-text-muted)" />
                </div>
                <input 
                  type="text"
                  defaultValue={q}
                  style={{ flex: 1, padding: '1rem', border: 'none', outline: 'none', fontSize: '1rem', color: 'var(--color-text-primary)' }}
                />
                <button style={{ width: 48, height: 48, background: 'var(--color-accent)', borderRadius: '50%', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0, marginRight: '0.5rem' }}>
                  &gt;
                </button>
              </div>
            </div>

            {/* Suggestions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Try these examples:</span>
              {SUGGESTIONS.map(s => (
                <button key={s} className="tag" onClick={() => handleSearch(s)} style={{ border: 'none', background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-soft)' }}>
                  {s}
                </button>
              ))}
              <button className="btn btn-secondary btn-sm" style={{ padding: '0.4rem' }}>
                 <Sparkles size={16} />
              </button>
            </div>

            {/* Results Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Search Results</h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>342 results found</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button className="btn btn-secondary btn-sm" style={{ gap: '0.5rem' }}>
                  <Heart size={14} /> Save Search
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Sort by:</span>
                  <select style={{ border: 'none', background: 'transparent', fontWeight: 600, color: 'var(--color-text-primary)', outline: 'none', cursor: 'pointer' }}>
                    <option>Relevance</option>
                    <option>Newest</option>
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
            <div className="photo-grid">
              {photos.map(photo => (
                <PhotoCard key={photo.id} photo={photo} />
              ))}
            </div>

            {/* Pagination Placeholder */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '3rem' }}>
              <button className="btn btn-secondary btn-sm" style={{ padding: '0.5rem' }}>&lt;</button>
              <button className="btn btn-primary btn-sm" style={{ padding: '0.5rem 1rem' }}>1</button>
              <button className="btn btn-ghost btn-sm" style={{ padding: '0.5rem 1rem' }}>2</button>
              <button className="btn btn-ghost btn-sm" style={{ padding: '0.5rem 1rem' }}>3</button>
              <span style={{ color: 'var(--color-text-secondary)' }}>...</span>
              <button className="btn btn-ghost btn-sm" style={{ padding: '0.5rem 1rem' }}>18</button>
              <button className="btn btn-secondary btn-sm" style={{ padding: '0.5rem' }}>&gt;</button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="right-sidebar">
            
            {/* AI Suggestions */}
            <div className="sidebar-block" style={{ background: 'rgba(221, 184, 146, 0.05)', borderColor: 'rgba(221, 184, 146, 0.2)' }}>
              <div className="sidebar-block-title">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Sparkles size={16} color="var(--color-highlight)" /> AI Suggestions</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--color-secondary-accent)', marginTop: '2px' }}><Sparkles size={14} /></div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>Find photos taken at beaches during sunset</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>428 photos</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--color-secondary-accent)', marginTop: '2px' }}><Sparkles size={14} /></div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>Show me pictures with golden hour lighting</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>1,248 photos</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--color-secondary-accent)', marginTop: '2px' }}><Sparkles size={14} /></div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>Photos with people walking or silhouette</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>842 photos</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--color-secondary-accent)', marginTop: '2px' }}><Sparkles size={14} /></div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>Best sunset photos in my collection</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>512 photos</div>
                  </div>
                </div>
              </div>
              <button className="btn btn-ghost" style={{ width: '100%', marginTop: '1rem', color: 'var(--color-secondary-accent)' }}>
                <Sparkles size={14} /> View More Suggestions
              </button>
            </div>

            {/* Refine Search Filters */}
            <div className="sidebar-block">
              <div className="sidebar-block-title">
                Refine Search
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: 600 }}>Clear All</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
                <div>
                  <label className="input-label">Media Type</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-sm" style={{ background: 'var(--color-accent)', color: '#FFF' }}>All</button>
                    <button className="btn btn-secondary btn-sm">Photos</button>
                    <button className="btn btn-secondary btn-sm">Videos</button>
                  </div>
                </div>

                <div>
                  <label className="input-label">Date Taken</label>
                  <div className="input-field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem' }}>
                    <Calendar size={16} color="var(--color-text-muted)" />
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Select Date Range</span>
                  </div>
                </div>

                <div>
                  <label className="input-label">Location</label>
                  <div className="input-field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem' }}>
                    <MapPin size={16} color="var(--color-text-muted)" />
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>All Locations</span>
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
                  <label className="input-label">Colors</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    {['#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#000000'].map(color => (
                      <div key={color} style={{ width: 24, height: 24, borderRadius: '50%', background: color, cursor: 'pointer', border: '1px solid rgba(0,0,0,0.1)' }}></div>
                    ))}
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#FFFFFF', cursor: 'pointer', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '12px' }}>+</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="input-label">Orientation</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button className="btn btn-secondary btn-sm" style={{ padding: '0.5rem', flex: 1 }}><Maximize size={16} /></button>
                    <button className="btn btn-secondary btn-sm" style={{ padding: '0.5rem', flex: 1 }}><Smartphone size={16} /></button>
                    <button className="btn btn-secondary btn-sm" style={{ padding: '0.5rem', flex: 1 }}><Monitor size={16} /></button>
                  </div>
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: '100%', marginTop: '2rem' }}>
                Apply Filters
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
