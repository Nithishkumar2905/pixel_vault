import { Link } from 'react-router-dom'
import { Sparkles, Image as ImageIcon } from 'lucide-react'

export default function AlbumCard({ album }) {
  const isAI = album.isAIGenerated

  return (
    <div className="album-card">
      <div className="album-card-image-container">
        {isAI && (
          <div className="album-card-badge" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} />
            AI Generated
          </div>
        )}
        <img 
          src={album.coverUrl || 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80'} 
          alt={album.title}
          className="album-card-image"
        />
      </div>
      <div className="album-card-content">
        <h3 className="album-card-title">{album.title}</h3>
        <div className="album-card-meta">
          <ImageIcon size={14} />
          <span>{album.photoCount} photos</span>
        </div>
        <p className="album-card-desc truncate-2">{album.description}</p>
      </div>
    </div>
  )
}
