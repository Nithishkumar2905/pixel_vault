import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Camera, Sparkles, Hash } from 'lucide-react'
import PhotoGrid from '../components/PhotoGrid'
import photoService from '../services/photoService'

const CATEGORIES = [
  { label: 'All',          tags: [] },
  { label: 'Nature',       tags: ['nature','forest','flowers','green'] },
  { label: 'Portrait',     tags: ['portrait','people'] },
  { label: 'Architecture', tags: ['architecture','art', 'building', 'city'] },
  { label: 'Travel',       tags: ['travel','beach','desert', 'adventure'] },
  { label: 'Animals',      tags: ['wildlife','animals', 'pets', 'dog', 'cat'] },
  { label: 'Food',         tags: ['food','drink', 'coffee', 'meal'] },
]

export default function HomePage() {
  const [allPhotos, setAllPhotos] = useState([])
  const [loading, setLoading]     = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res  = await photoService.getAll({ limit: 50, sort: '-createdAt' })
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
      p.tags?.some((t) => cat.tags.includes(t.toLowerCase())) ||
      p.keywords?.some((k) => cat.tags.includes(k.toLowerCase()))
    )
  }, [allPhotos, activeCategory])

  return (
    <div className="fade-in">
      <section style={{ 
        padding: '3rem 1rem 1rem', 
        textAlign: 'center', 
        maxWidth: '800px', 
        margin: '0 auto 1.5rem' 
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 1.25rem',
          background: 'rgba(107, 112, 92, 0.08)',
          borderRadius: 999, color: 'var(--color-accent)', fontSize: '0.85rem', fontWeight: 600,
          marginBottom: '2.5rem',
          border: '1px solid rgba(107, 112, 92, 0.2)'
        }}>
          <Sparkles size={14} />
          Curated by Vision AI
        </div>

        <h1 style={{ 
          fontSize: '3.5rem', 
          lineHeight: 1.1, 
          marginBottom: '1.25rem', 
          fontFamily: 'var(--font-heading)',
          color: 'var(--color-text-primary)'
        }}>
          Explore the world's <span style={{ color: 'var(--color-accent)' }}>best photography.</span>
        </h1>

        <p style={{ 
          color: 'var(--color-text-secondary)', 
          fontSize: '1.15rem', 
          maxWidth: '600px', 
          margin: '0 auto 2.5rem',
          lineHeight: 1.6
        }}>
          Discover incredible images from our global community of creators. Powered by semantic search and intelligent tagging.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/upload" className="btn btn-primary btn-lg" style={{ borderRadius: '16px', padding: '0.875rem 2.25rem', fontSize: '1.05rem' }}>
            <Camera size={20} /> Upload Your Work
          </Link>
        </div>
      </section>

      <section className="page-section" id="gallery-section" style={{ paddingTop: '0' }}>
        <div className="container" style={{ maxWidth: '1440px', padding: '0 2.5rem' }}>
          
          {/* Categories Filter */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
            paddingBottom: '1rem',
            marginBottom: '2.5rem',
          }}>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.label
              return (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(cat.label)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.6rem 1.5rem',
                    borderRadius: '999px',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--color-accent)' : 'var(--color-border)',
                    background: isActive ? 'var(--color-accent)' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : 'var(--color-text-primary)',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                    boxShadow: isActive ? '0 4px 15px var(--color-accent-glow)' : 'var(--shadow-soft)',
                  }}
                >
                  {cat.label}
                </button>
              )
            })}
          </div>

          <PhotoGrid 
            photos={filteredPhotos} 
            loading={loading} 
            onDelete={(id) => setAllPhotos(prev => prev.filter(p => p.id !== id))}
          />

          {!loading && filteredPhotos.length === 0 && (
            <div className="empty-state" style={{ marginTop: '3rem', padding: '5rem 2rem' }}>
              <div className="empty-state-icon" style={{ background: 'rgba(107, 112, 92, 0.05)', color: 'var(--color-accent)' }}>
                <Hash size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>No photos found</h3>
              <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-secondary)' }}>Be the first to upload photos for this category.</p>
              <button onClick={() => setActiveCategory('All')} className="btn btn-secondary" style={{ borderRadius: '12px' }}>
                View All
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
