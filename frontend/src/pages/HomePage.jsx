import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Camera, Sparkles, Hash, X } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import PhotoGrid from '../components/PhotoGrid'
import photoService from '../services/photoService'

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
]

export default function HomePage() {
  const [allPhotos, setAllPhotos] = useState([])
  const [loading, setLoading]     = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res  = await photoService.getAll({ limit: 40, sort: '-createdAt' })
        const data = res.photos || res.data || []
        // Only show published photos in public gallery
        setAllPhotos(data.filter(p => p.publish_status === 'published'))
      } catch {
      } finally {
        setLoading(false)
      }
    }
    fetchPhotos()
  }, [])

  const filteredPhotos = useMemo(() => {
    const cat = CATEGORIES.find((c) => c.label === activeCategory)
    if (!cat || cat.tags.length === 0) return allPhotos
    return allPhotos.filter((p) =>
      p.tags?.some((t) => cat.tags.includes(t.toLowerCase()))
    )
  }, [allPhotos, activeCategory])

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat.label)
    document.getElementById('gallery-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const activeCat = CATEGORIES.find((c) => c.label === activeCategory)

  return (
    <div className="fade-in">
      <section className="hero">
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.375rem 1rem',
          background: 'rgba(184, 115, 51, 0.08)',
          borderRadius: 999, color: 'var(--color-accent)', fontSize: '0.85rem', fontWeight: 600,
          marginBottom: '2rem'
        }}>
          <Sparkles size={14} />
          Powered by Vision AI & Grok
        </div>

        <h1 className="hero-title">
          Explore the world's<br />
          <span className="hero-gradient-text">best photography.</span>
        </h1>

        <p className="hero-subtitle">
          A curated space for creators to store, organize, and showcase their portfolio with intelligent tagging and semantic search.
        </p>

        <div style={{ maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
          <SearchBar size="large" />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/upload" className="btn btn-primary btn-lg" style={{ borderRadius: '999px', padding: '0.875rem 2rem' }}>
            <Camera size={18} /> Upload Your Work
          </Link>
          <a href="#gallery-section" className="btn btn-secondary btn-lg" style={{ borderRadius: '999px', padding: '0.875rem 2rem' }}>
            Browse Gallery
          </a>
        </div>
      </section>

      <section className="page-section" id="gallery-section" style={{ paddingTop: '1rem' }}>
        <div className="container" style={{ maxWidth: '1400px' }}>
          
          {/* Categories Filter */}
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'nowrap',
            overflowX: 'auto',
            paddingBottom: '1rem',
            marginBottom: '2rem',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.label
              return (
                <button
                  key={cat.label}
                  onClick={() => handleCategoryClick(cat)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.625rem 1.25rem',
                    borderRadius: '999px',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--color-text-primary)' : 'var(--color-border)',
                    background: isActive ? 'var(--color-text-primary)' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : 'var(--color-text-primary)',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                    boxShadow: isActive ? '0 4px 15px rgba(0,0,0,0.1)' : '0 2px 5px rgba(0,0,0,0.02)',
                  }}
                >
                  <span>{cat.emoji}</span>
                  {cat.label}
                  {isActive && cat.label !== 'All' && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveCategory('All')
                      }}
                      style={{ marginLeft: '0.25rem', display: 'flex', alignItems: 'center', color: '#FFF' }}
                    >
                      <X size={14} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {activeCategory !== 'All' && !loading && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Hash size={20} color="var(--color-accent)" /> 
                {activeCategory} Photography
                <span style={{ color: 'var(--color-text-muted)', fontSize: '1rem', fontWeight: 400 }}>({filteredPhotos.length})</span>
              </h3>
            </div>
          )}

          <PhotoGrid 
            photos={filteredPhotos} 
            loading={loading} 
            onDelete={(id) => setAllPhotos(prev => prev.filter(p => p.id !== id))}
          />

          {!loading && filteredPhotos.length === 0 && activeCategory !== 'All' && (
            <div className="empty-state" style={{ marginTop: '4rem' }}>
              <div className="empty-state-icon"><Hash size={32} /></div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No photos found in #{activeCategory}</h3>
              <p style={{ marginBottom: '1.5rem' }}>Be the first to upload and tag photos in this category!</p>
              <button onClick={() => setActiveCategory('All')} className="btn btn-secondary">
                View All Categories
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
