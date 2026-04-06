import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Sparkles, Search, Camera, Zap, Hash, X } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import PhotoGrid from '../components/PhotoGrid'
import photoService from '../services/photoService'


// ── Category definitions with icon and matched tags ───────────────────────────
const CATEGORIES = [
  { label: 'All',          tags: [],                                   emoji: '✦' },
  { label: 'Nature',       tags: ['nature','forest','flowers','green'], emoji: '🌿' },
  { label: 'Landscape',    tags: ['landscape','mountains','sky','fog'], emoji: '🏔' },
  { label: 'Urban',        tags: ['urban','city','night','rain'],       emoji: '🏙' },
  { label: 'Travel',       tags: ['travel','beach','desert'],           emoji: '✈️' },
  { label: 'Ocean',        tags: ['ocean','water','beach'],             emoji: '🌊' },
  { label: 'Sunset',       tags: ['sunset','sky','stars','night'],      emoji: '🌅' },
  { label: 'Portrait',     tags: ['portrait','people'],                 emoji: '🤍' },
  { label: 'Wildlife',     tags: ['wildlife','animals'],                emoji: '🦁' },
  { label: 'Architecture', tags: ['architecture','art'],                emoji: '🏛' },
  { label: 'Abstract',     tags: ['abstract','minimal','art'],          emoji: '◈' },
  { label: 'Macro',        tags: ['macro','flowers'],                   emoji: '🔬' },
  { label: 'Winter',       tags: ['winter','snow','mountains'],         emoji: '❄️' },
  { label: 'Autumn',       tags: ['autumn','forest','nature'],          emoji: '🍂' },
]

const FEATURES = [
  { icon: <Sparkles size={20} />, title: 'AI Auto-Tagging',  desc: 'Auto-generated tags & descriptions via Google Vision API' },
  { icon: <Zap size={20} />,      title: 'Instant Upload',   desc: 'Cloudinary-powered global image delivery' },
  { icon: <TrendingUp size={20} />, title: 'Smart Search',   desc: 'Vector similarity search for visually related photos' },
]

export default function HomePage() {
  const [allPhotos, setAllPhotos] = useState([])
  const [loading, setLoading]     = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  // ── Initial fetch ───────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res  = await photoService.getAll({ limit: 40, sort: '-createdAt' })
        const data = res.photos || res.data || []
        setAllPhotos(data)
      } catch {
        // error handled implicitly
      } finally {
        setLoading(false)
      }
    }
    fetchPhotos()
  }, [])

  // ── Filter photos by active category ───────────────────────────────────────
  const filteredPhotos = useMemo(() => {
    const cat = CATEGORIES.find((c) => c.label === activeCategory)
    if (!cat || cat.tags.length === 0) return allPhotos
    return allPhotos.filter((p) =>
      p.tags?.some((t) => cat.tags.includes(t.toLowerCase()))
    )
  }, [allPhotos, activeCategory])

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat.label)
    // Scroll to gallery smoothly
    document.getElementById('gallery-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const activeCat = CATEGORIES.find((c) => c.label === activeCategory)

  return (
    <div className="fade-in">
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="hero">
        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.375rem 1rem',
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: 999, color: '#FCD34D', fontSize: '0.8rem', fontWeight: 600,
            marginBottom: '1.5rem', position: 'relative',
          }}
        >
          <Sparkles size={13} />
          Store, Discover, and Explore Photography with AI.
        </div>

        <h1 className="hero-title" style={{ position: 'relative' }}>
          <span className="hero-gradient-text">PixelVault</span>
        </h1>

        <p className="hero-subtitle">
          Upload your photography, discover amazing visuals, and explore images using AI-powered search.
        </p>

        <div style={{ position: 'relative', width: '100%', marginBottom: '1rem' }}>
          <SearchBar size="large" />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/search" className="btn btn-primary btn-lg" id="hero-explore-btn">
            <Search size={18} /> Explore Photos
          </Link>
          <Link to="/upload" className="btn btn-secondary btn-lg" id="hero-upload-btn">
            <Camera size={16} /> Upload Your Work
          </Link>
        </div>
      </section>

      {/* ═══════════════════ FEATURE CARDS ═══════════════════ */}
      <section style={{ padding: '1rem 0 2rem' }}>
        <div className="container" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="glass-card"
              style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.875rem', flex: '1', minWidth: 200, maxWidth: 320 }}
            >
              <div style={{ color: '#6366F1', flexShrink: 0 }}>{f.icon}</div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#FFFFFF', marginBottom: '0.15rem' }}>{f.title}</p>
                <p style={{ color: '#64748B', fontSize: '0.75rem' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ GALLERY + TAGS ═══════════════════ */}
      <section className="page-section" id="gallery-section">
        <div className="container">

          {/* ── Section header ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
            <TrendingUp size={18} style={{ color: '#6366F1' }} />
            <h2 style={{ fontFamily: 'Poppins', fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF' }}>
              Trending
            </h2>
            {activeCategory !== 'All' && (
              <span
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                  padding: '0.2rem 0.625rem',
                  background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                  borderRadius: 999, color: '#A5B4FC', fontSize: '0.75rem',
                }}
              >
                <Hash size={11} />
                {activeCategory}
              </span>
            )}
          </div>

          {/* ── Tag pills row – scrollable on mobile ── */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              marginBottom: '2rem',
              paddingBottom: '0.25rem',
            }}
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.label
              return (
                <button
                  key={cat.label}
                  id={`filter-${cat.label.toLowerCase()}`}
                  onClick={() => handleCategoryClick(cat)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.375rem 0.875rem',
                    borderRadius: 999,
                    border: isActive
                      ? '1px solid rgba(245,158,11,0.5)'
                      : '1px solid rgba(99,102,241,0.18)',
                    background: isActive
                      ? 'rgba(245,158,11,0.12)'
                      : 'rgba(99,102,241,0.07)',
                    color: isActive ? '#FCD34D' : '#94A3B8',
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    transform: isActive ? 'translateY(-1px)' : 'none',
                    boxShadow: isActive ? '0 4px 12px rgba(245,158,11,0.2)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'
                      e.currentTarget.style.color = '#FFFFFF'
                      e.currentTarget.style.background = 'rgba(99,102,241,0.14)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'rgba(99,102,241,0.18)'
                      e.currentTarget.style.color = '#94A3B8'
                      e.currentTarget.style.background = 'rgba(99,102,241,0.07)'
                    }
                  }}
                  aria-pressed={isActive}
                >
                  <span style={{ fontSize: '0.85rem' }}>{cat.emoji}</span>
                  {cat.label}
                  {isActive && cat.label !== 'All' && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveCategory('All')
                      }}
                      style={{
                        marginLeft: '0.15rem', display: 'flex', alignItems: 'center',
                        color: '#F59E0B', cursor: 'pointer',
                      }}
                      aria-label="Clear filter"
                    >
                      <X size={11} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* ── Result count + "searching by" label ── */}
          {activeCategory !== 'All' && !loading && (
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                marginBottom: '1.25rem',
                padding: '0.625rem 1rem',
                background: 'rgba(99,102,241,0.06)',
                border: '1px solid rgba(99,102,241,0.12)',
                borderRadius: 10,
              }}
            >
              <span style={{ fontSize: '0.95rem' }}>{activeCat?.emoji}</span>
              <p style={{ color: '#94A3B8', fontSize: '0.84rem' }}>
                Showing{' '}
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>
                  {filteredPhotos.length}
                </span>{' '}
                photo{filteredPhotos.length !== 1 ? 's' : ''} tagged with{' '}
                <span style={{ color: '#A5B4FC', fontWeight: 600 }}>
                  #{activeCategory.toLowerCase()}
                </span>
                {activeCat?.tags?.length > 1 && (
                  <span style={{ color: '#475569' }}>
                    {' '}+{' '}
                    {activeCat.tags.slice(1).map((t, i) => (
                      <span key={t}>
                        <span style={{ color: '#6366F1' }}>#{t}</span>
                        {i < activeCat.tags.length - 2 ? ', ' : ''}
                      </span>
                    ))}
                  </span>
                )}
              </p>
              <button
                onClick={() => setActiveCategory('All')}
                className="btn btn-ghost btn-sm"
                style={{ marginLeft: 'auto', color: '#475569', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                id="clear-filter-btn"
              >
                <X size={13} /> Clear
              </button>
            </div>
          )}

          {/* ── Photo grid ── */}
          <PhotoGrid 
            photos={filteredPhotos} 
            loading={loading} 
            onDelete={(id) => setAllPhotos(prev => prev.filter(p => p.id !== id))}
          />

          {/* ── Empty state for filtered view ── */}
          {!loading && filteredPhotos.length === 0 && activeCategory !== 'All' && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Hash size={36} />
              </div>
              <h3 style={{ fontFamily: 'Poppins', fontSize: '1.2rem', color: '#94A3B8', marginBottom: '0.5rem' }}>
                No photos in #{activeCategory}
              </h3>
              <p style={{ color: '#475569', marginBottom: '1.5rem' }}>
                Be the first to tag photos with this category!
              </p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => setActiveCategory('All')} className="btn btn-secondary">
                  Show All Photos
                </button>
                <Link to="/upload" className="btn btn-primary">
                  Upload a Photo
                </Link>
              </div>
            </div>
          )}

          {/* ── Empty state for zero photos total ── */}
          {!loading && allPhotos.length === 0 && activeCategory === 'All' && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Camera size={36} />
              </div>
              <h3 style={{ fontFamily: 'Poppins', fontSize: '1.25rem', color: '#94A3B8', marginBottom: '0.5rem' }}>
                No photos yet
              </h3>
              <p style={{ color: '#475569', marginBottom: '1.5rem' }}>
                Be the first to share your photography!
              </p>
              <Link to="/upload" className="btn btn-primary">
                Upload a Photo
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
