import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Sparkles } from 'lucide-react'

export default function SearchBar({ initialValue = '', size = 'default', onSearch }) {
  const [query, setQuery] = useState(initialValue)
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    if (onSearch) {
      onSearch(q)
    } else {
      navigate(`/search?q=${encodeURIComponent(q)}`)
    }
  }

  const isLarge = size === 'large'

  return (
    <form
      onSubmit={handleSubmit}
      className="search-bar"
      style={{ maxWidth: isLarge ? 760 : 700 }}
      id="search-form"
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Search
          className="search-icon"
          size={isLarge ? 20 : 18}
          aria-hidden="true"
        />
        <input
          id="search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search photos, tags, or descriptions…"
          aria-label="Search photos"
          style={{
            padding: isLarge ? '1.125rem 9rem 1.125rem 3.5rem' : '0.875rem 8rem 0.875rem 3.25rem',
            fontSize: isLarge ? '1.05rem' : '0.95rem',
          }}
        />

        {/* AI badge */}
        <div
          style={{
            position: 'absolute',
            right: isLarge ? '6.5rem' : '6rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            color: '#F59E0B',
            fontSize: '0.7rem',
            fontWeight: 600,
            letterSpacing: '0.05em',
            pointer: 'none',
          }}
        >
          <Sparkles size={11} />
          AI
        </div>

        <button
          type="submit"
          id="search-submit-btn"
          className="btn btn-primary search-btn"
          style={{ padding: isLarge ? '0.625rem 1.25rem' : '0.5rem 1rem', fontSize: '0.875rem' }}
        >
          Search
        </button>
      </div>
    </form>
  )
}
