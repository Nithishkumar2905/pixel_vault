import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, Sparkles, SlidersHorizontal, X, TrendingUp } from 'lucide-react'
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
      const results = res.photos || res.data || []

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
    <div className="fade-in" style={{ minHeight: 'calc(100vh - 68px)', padding: '2.5rem 1rem' }}>
      <div className="container" style={{ maxWidth: 1300 }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.375rem 1rem',
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 999, color: '#A5B4FC', fontSize: '0.8rem', fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            <Sparkles size={13} />
            AI-Powered Search
          </div>

          <h1
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
              fontWeight: 700, color: '#FFFFFF', marginBottom: '0.75rem',
            }}
          >
            {q ? (
              <>Results for "<span style={{ color: '#A5B4FC' }}>{q}</span>"</>
            ) : (
              'Search Photos'
            )}
          </h1>

          {q && (
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              {loading
                ? 'Searching…'
                : `${totalResults} photo${totalResults !== 1 ? 's' : ''} found`}
            </p>
          )}

          <SearchBar initialValue={q} onSearch={handleSearch} size="large" />
        </div>

        {/* ── Quick suggestions (shown when no query) ── */}
        {!q && (
          <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <TrendingUp size={15} style={{ color: '#6366F1' }} />
              <span style={{ color: '#94A3B8', fontSize: '0.85rem', fontWeight: 600 }}>
                Popular searches
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  id={`suggest-${s}`}
                  onClick={() => handleSearch(s)}
                  className="tag"
                  style={{ cursor: 'pointer', border: 'none', fontSize: '0.82rem', padding: '0.375rem 0.875rem' }}
                >
                  #{s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Filter / sort bar ── */}
        {q && (
          <div
            style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem',
            }}
          >
            {/* Active query chip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.3rem 0.875rem',
                  background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.22)',
                  borderRadius: 999, color: '#A5B4FC', fontSize: '0.82rem',
                }}
              >
                <Search size={11} />
                {q}
                <button
                  onClick={() => setSearchParams({})}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 0, marginLeft: '0.2rem', display: 'flex' }}
                  id="clear-search-btn"
                  aria-label="Clear search"
                >
                  <X size={12} />
                </button>
              </div>

              {/* Related suggestion chips */}
              {!loading && totalResults === 0 && (
                <span style={{ color: '#475569', fontSize: '0.78rem' }}>
                  Try:
                </span>
              )}
              {!loading && totalResults === 0 &&
                SUGGESTIONS.filter((s) => s !== q.toLowerCase()).slice(0, 4).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSearch(s)}
                    className="tag"
                    style={{ cursor: 'pointer', border: 'none', fontSize: '0.78rem' }}
                  >
                    #{s}
                  </button>
                ))}
            </div>

            {/* Sort dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Sort:</label>
              <select
                id="sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="input-field"
                style={{ width: 'auto', padding: '0.375rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer' }}
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
              <div className="empty-state">
                <div className="empty-state-icon">
                  <Search size={36} />
                </div>
                <h3 style={{ fontFamily: 'Poppins', fontSize: '1.25rem', color: '#94A3B8', marginBottom: '0.5rem' }}>
                  No results for "{q}"
                </h3>
                <p style={{ color: '#475569', marginBottom: '1.5rem' }}>
                  Try a different keyword — or explore these popular tags:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  {SUGGESTIONS.slice(0, 8).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSearch(s)}
                      className="tag"
                      style={{ cursor: 'pointer', border: 'none' }}
                    >
                      #{s}
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
          <div className="empty-state">
            <div className="empty-state-icon">
              <Search size={40} />
            </div>
            <h2 style={{ fontFamily: 'Poppins', fontSize: '1.4rem', color: '#94A3B8', marginBottom: '0.75rem' }}>
              What are you looking for?
            </h2>
            <p style={{ color: '#475569', maxWidth: 420, lineHeight: 1.7 }}>
              Search by photo title, tag, description, or photographer name.
              Our AI surfaces visually similar images too.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
