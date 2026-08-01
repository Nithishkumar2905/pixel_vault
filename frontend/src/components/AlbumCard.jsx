import { Link } from 'react-router-dom'
import { Sparkles, Image as ImageIcon, ArrowRight } from 'lucide-react'

export default function AlbumCard({ album }) {
  const isAI = album.isAIGenerated

  return (
    <div
      className="album-card"
      style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid var(--color-border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-soft)',
        transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = 'var(--shadow-elevated)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'var(--shadow-soft)'
      }}
    >
      {/* Cover Image */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
        <img
          src={album.coverUrl || 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80'}
          alt={album.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80'
          }}
        />

        {/* Gradient Overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)',
        }} />

        {/* AI Badge */}
        {isAI && (
          <div style={{
            position: 'absolute', top: '0.75rem', left: '0.75rem',
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(8px)',
            borderRadius: '8px', padding: '0.3rem 0.6rem',
            fontSize: '0.7rem', fontWeight: 700,
            color: 'var(--color-secondary-accent)',
            letterSpacing: '0.02em',
          }}>
            <Sparkles size={11} />
            AI Generated
          </div>
        )}

        {/* Photo Count Badge */}
        <div style={{
          position: 'absolute', bottom: '0.75rem', right: '0.75rem',
          display: 'flex', alignItems: 'center', gap: '4px',
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(6px)',
          borderRadius: '8px', padding: '0.3rem 0.6rem',
          fontSize: '0.75rem', fontWeight: 600, color: '#FFFFFF',
        }}>
          <ImageIcon size={12} />
          {album.photoCount} photos
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '1.25rem 1.25rem 1rem' }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '0.4rem',
          letterSpacing: '-0.02em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {album.title}
        </h3>

        {album.description && (
          <p style={{
            fontSize: '0.82rem',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: '1rem',
          }}>
            {album.description}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex' }}>
              {[...Array(Math.min(3, Math.ceil(album.photoCount / 50)))].map((_, i) => (
                <div key={i} style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: ['var(--color-accent)', 'var(--color-secondary-accent)', 'var(--color-highlight)'][i],
                  marginLeft: i > 0 ? -6 : 0,
                  border: '2px solid #FFFFFF',
                  opacity: 0.8,
                }} />
              ))}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
              {album.photoCount} photos
            </span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28, borderRadius: '50%',
            background: 'var(--color-bg-primary)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}>
            <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </div>
  )
}
