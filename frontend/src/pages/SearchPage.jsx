import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, Sparkles, X, TrendingUp } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import PhotoGrid from '../components/PhotoGrid'
import photoService from '../services/photoService'

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest first' },
  { value: 'createdAt', label: 'Oldest first' },
  { value: '-likeCount', label: 'Most liked' },
  { value: '-downloadCount', label: 'Most downloaded' },
]

// Popular quick-search suggestions
const SUGGESTIONS = [
  'beach', 'sunset', 'mountains', 'forest', 'urban', 'portrait',
  'wildlife', 'abstract', 'snow', 'flowers', 'night', 'travel',
]

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [sort, setSort] = useState('-createdAt')

  const doSearch = useCallback(async (query, sortBy) => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await photoService.search(query, { sort: sortBy, limit: 40 })
      // Only show published photos in search
      const results = (res.photos || res.data || []).filter(p => p.publish_status === 'published')

      if (results.length > 0) {
        setPhotos(results)
        setTotalResults(res.total || results.length)
      } else {
        setPhotos([])
        setTotalResults(0)
      }

    } catch {
      setPhotos([])
      setTotalResults(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (q) doSearch(q, sort)
    else { setPhotos([]); setTotalResults(0) }
  }, [q, sort, doSearch])

  const handleSearch = (newQ) => setSearchParams({ q: newQ })

  return (
    <div className="fade-in" style={{ padding: '3rem 1rem', paddingBottom: '5rem' }}>
      <div className="container" style={{ maxWidth: '1400px' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 1rem', background: 'rgba(184, 115, 51, 0.08)', borderRadius: 999, color: 'var(--color-accent)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            <Sparkles size={14} />
            AI-Powered Search
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '1rem', letterSpacing: '-0.5px' }}>
            {q ? (
              <>Results for "<span style={{ color: 'var(--color-accent)' }}>{q}</span>"</>
            ) : (
              'Search Gallery'
            )}
          </h1>

          {q && (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', marginBottom: '2rem' }}>
              {loading
                ? 'Searching the vault...'
                : `Found ${totalResults} photo${totalResults !== 1 ? 's' : ''} matching your query`}
            </p>
          )}

          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <SearchBar initialValue={q} onSearch={handleSearch} size="large" />
          </div>
        </div>

        {/* ── Quick suggestions (shown when no query) ── */}
        {!q && (
          <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <TrendingUp size={16} color="var(--color-accent)" />
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Trending Searches
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', maxWidth: '800px', margin: '0 auto' }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSearch(s)}
                  style={{ cursor: 'pointer', border: '1px solid var(--color-border)', fontSize: '0.9rem', padding: '0.5rem 1.25rem', borderRadius: '999px', background: '#FFFFFF', color: 'var(--color-text-primary)', transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-accent)'
                    e.currentTarget.style.color = 'var(--color-accent)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-border)'
                    e.currentTarget.style.color = 'var(--color-text-primary)'
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Filter / sort bar ── */}
        {q && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
            {/* Active query chip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem', background: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '999px', color: 'var(--color-text-primary)', fontSize: '0.9rem', fontWeight: 500, boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                <Search size={14} color="var(--color-text-muted)" />
                {q}
                <button
                  onClick={() => setSearchParams({})}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: 0, marginLeft: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Sort dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Sort By:</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.9rem', cursor: 'pointer', border: '1px solid var(--color-border)', borderRadius: '8px', background: '#FFFFFF', outline: 'none', color: 'var(--color-text-primary)' }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* ── Results grid ── */}
        {q ? (
          <>
            <PhotoGrid photos={photos} loading={loading} />

            {!loading && photos.length === 0 && (
              <div className="empty-state" style={{ marginTop: '4rem' }}>
                <div className="empty-state-icon">
                  <Search size={40} />
                </div>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                  No results found
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
                  We couldn't find anything matching "{q}". Try a different keyword or explore popular tags.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center', marginBottom: '2rem' }}>
                  {SUGGESTIONS.slice(0, 6).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSearch(s)}
                      className="tag"
                      style={{ cursor: 'pointer', border: 'none' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <Link to="/" className="btn btn-secondary">
                  Browse Gallery
                </Link>
              </div>
            )}
          </>
        ) : (
          /* ── Empty state (no query yet) ── */
          <div className="empty-state" style={{ background: 'transparent', border: 'none' }}>
            <div className="empty-state-icon" style={{ background: '#FFFFFF' }}>
              <Search size={40} />
            </div>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)', marginBottom: '0.75rem' }}>
              Discover inspiration
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', maxWidth: 500, lineHeight: 1.7, margin: '0 auto' }}>
              Search by visual objects, semantic descriptions, photography styles, or tags. Our AI understands what's inside the photos.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
