import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Sparkles, LayoutGrid, List, Calendar, MapPin, Tag, Maximize, Smartphone, Monitor, Loader2 } from 'lucide-react'
import PhotoCard from '../components/PhotoCard'
import photoService from '../services/photoService'

const SUGGESTIONS = [
  'Mountain landscapes', 'Wedding moments', 'Portrait with natural light', 'City at night', 'Wildlife in forest'
]

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState(q)
  const [totalCount, setTotalCount] = useState(0)

  const runSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setPhotos([])
      setTotalCount(0)
      return
    }
    setLoading(true)
    try {
      const res = await photoService.search(query, { limit: 40 })
      setPhotos(res.photos || [])
      setTotalCount(res.pagination?.total || (res.photos?.length ?? 0))
    } catch (err) {
      console.error('Search failed:', err)
      setPhotos([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setInputValue(q)
    runSearch(q)
  }, [q, runSearch])

  const handleSearch = (e) => {
    e.preventDefault()
    if (inputValue.trim()) {
      setSearchParams({ q: inputValue.trim() })
    }
  }

  const handleSuggestion = (s) => {
    setInputValue(s)
    setSearchParams({ q: s })
  }

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

            {/* Search Input */}
            <div style={{ marginBottom: '2rem' }}>
              <form
                onSubmit={handleSearch}
                style={{
                  position: 'relative', width: '100%', display: 'flex', alignItems: 'center',
                  background: '#FFFFFF', border: '1px solid var(--color-border)',
                  borderRadius: '16px', padding: '0.5rem', boxShadow: 'var(--shadow-soft)'
                }}
              >
                <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRight: '1px solid var(--color-border)' }}>
                  <Monitor size={18} color="var(--color-text-muted)" />
                  <Sparkles size={18} color="var(--color-text-muted)" />
                </div>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="e.g. sunset photos at the beach with people walking..."
                  style={{ flex: 1, padding: '1rem', border: 'none', outline: 'none', fontSize: '1rem', color: 'var(--color-text-primary)', background: 'transparent' }}
                />
                <button
                  type="submit"
                  aria-label="Search"
                  style={{ width: 48, height: 48, background: 'var(--color-accent)', borderRadius: '50%', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', flexShrink: 0, marginRight: '0.5rem' }}
                >
                  <Search size={18} />
                </button>
              </form>
            </div>

            {/* Suggestions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Try these examples:</span>
              {SUGGESTIONS.map(s => (
                <button key={s} className="tag" onClick={() => handleSuggestion(s)} style={{ border: 'none', background: 'var(--color-bg-card)', boxShadow: 'var(--shadow-soft)' }}>
                  {s}
                </button>
              ))}
            </div>

            {/* Results Header — only when there's a query */}
            {q && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Search Results</h2>
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                    {loading ? 'Searching...' : `${totalCount} result${totalCount !== 1 ? 's' : ''} found`}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
            )}

            {/* Loading State */}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '6rem 2rem', gap: '1rem' }}>
                <Loader2 size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--color-accent)' }} />
                <span style={{ fontSize: '1.05rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>Searching PixelVault...</span>
              </div>
            )}

            {/* Empty state — no query yet */}
            {!loading && !q && (
              <div className="empty-state" style={{ marginTop: '1rem' }}>
                <div className="empty-state-icon" style={{ background: 'rgba(107, 112, 92, 0.06)', color: 'var(--color-accent)', width: 88, height: 88 }}>
                  <Search size={38} />
                </div>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', fontWeight: 600 }}>Start your AI search</h3>
                <p style={{ color: 'var(--color-text-secondary)', maxWidth: 500, lineHeight: 1.6 }}>
                  Describe your photo in natural language — objects, mood, colors, places, or people. Our Vision AI will find the best matches from the community gallery.
                </p>
              </div>
            )}

            {/* Empty state — query but no results */}
            {!loading && q && photos.length === 0 && (
              <div className="empty-state" style={{ marginTop: '1rem' }}>
                <div className="empty-state-icon" style={{ background: 'rgba(107, 112, 92, 0.05)', color: 'var(--color-text-muted)', width: 88, height: 88 }}>
                  <Search size={38} />
                </div>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', fontWeight: 600 }}>No photos found</h3>
                <p style={{ color: 'var(--color-text-secondary)', maxWidth: 500, marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  We couldn't find any published photos matching "<strong>{q}</strong>". Try different keywords or a broader description.
                </p>
                <button
                  onClick={() => { setInputValue(''); setSearchParams({}) }}
                  className="btn btn-secondary"
                  style={{ borderRadius: '12px' }}
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* Results Grid */}
            {!loading && photos.length > 0 && (
              <div className="photo-grid">
                {photos.map(photo => (
                  <PhotoCard key={photo.id} photo={photo} allPhotos={photos} />
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="right-sidebar">

            {/* AI Suggestions */}
            <div className="sidebar-block" style={{ background: 'rgba(221, 184, 146, 0.05)', borderColor: 'rgba(221, 184, 146, 0.2)' }}>
              <div className="sidebar-block-title">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} color="var(--color-highlight)" /> AI Suggestions
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                {[
                  { text: 'Find photos taken at beaches during sunset', count: '428 photos' },
                  { text: 'Show me pictures with golden hour lighting', count: '1,248 photos' },
                  { text: 'Photos with people walking or silhouette', count: '842 photos' },
                  { text: 'Best sunset photos in collection', count: '512 photos' },
                ].map(({ text, count }) => (
                  <div
                    key={text}
                    style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', cursor: 'pointer' }}
                    onClick={() => handleSuggestion(text)}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.75'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    <div style={{ color: 'var(--color-secondary-accent)', marginTop: '2px', flexShrink: 0 }}>
                      <Sparkles size={14} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>{text}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{count}</div>
                    </div>
                  </div>
                ))}
              </div>
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
                    {['#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6', '#1C1C1E'].map(color => (
                      <div key={color} title={color} style={{ width: 24, height: 24, borderRadius: '50%', background: color, cursor: 'pointer', border: '1px solid rgba(0,0,0,0.1)', transition: 'transform 0.15s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="input-label">Orientation</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button className="btn btn-secondary btn-sm" aria-label="Square" style={{ padding: '0.5rem', flex: 1 }}><Maximize size={16} /></button>
                    <button className="btn btn-secondary btn-sm" aria-label="Portrait" style={{ padding: '0.5rem', flex: 1 }}><Smartphone size={16} /></button>
                    <button className="btn btn-secondary btn-sm" aria-label="Landscape" style={{ padding: '0.5rem', flex: 1 }}><Monitor size={16} /></button>
                  </div>
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={() => runSearch(inputValue)}>
                Apply Filters
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
