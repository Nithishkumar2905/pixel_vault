import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Eye, Download, User, Trash2 } from 'lucide-react'
import photoService from '../services/photoService'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'



export default function PhotoCard({ photo, index = 0, onDelete }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [liked, setLiked] = useState(photo.isLiked || false)
  const [likeCount, setLikeCount] = useState(photo.likeCount ?? 0)
  const [liking, setLiking] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const imgSrc = photo.image_url || photo.imageUrl
  const isOwner = user && (photo.user_id === user.id)

  const handleDelete = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!window.confirm('Are you sure you want to delete this photo?')) return
    
    setDeleting(true)
    try {
      await photoService.delete(photo.id)
      toast.success('Photo deleted')
      if (onDelete) onDelete(photo.id)
    } catch (err) {
      toast.error('Failed to delete photo')
    } finally {
      setDeleting(false)
    }
  }

  const handleLike = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { toast.error('Please login to like photos'); return }
    if (liking) return
    setLiking(true)
    try {
      if (liked) {
        await photoService.unlike(photo.id)
        setLiked(false)
        setLikeCount(c => Math.max(0, c - 1))
      } else {
        await photoService.like(photo.id)
        setLiked(true)
        setLikeCount(c => c + 1)
      }
    } catch {
      toast.error('Action failed')
    } finally {
      setLiking(false)
    }
  }

  const handleDownload = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const response = await fetch(imgSrc)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = photo.title ? `${photo.title}.jpg` : 'photovault-photo.jpg'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(objectUrl)
      
      if (photo.id) await photoService.download(photo.id)
      toast.success('Download started!')
    } catch (error) {
      console.error('Download error:', error)
      const link = document.createElement('a')
      link.href = imgSrc
      link.download = photo.title || 'photovault-photo'
      link.target = '_blank'
      link.click()
      toast.error('Could not download directly, opened in new tab')
    }
  }

  return (
    <div
      className="photo-card photo-grid-item"
      id={`photo-card-${photo.id || index}`}
      onClick={() => photo.id && navigate(`/photos/${photo.id}`)}
      style={{ cursor: photo.id ? 'pointer' : 'default' }}
    >
      <img
        src={imgSrc}
        alt={photo.title || photo.altText || 'Photo'}
        loading="lazy"
        style={{
          width: '100%',
          display: 'block',
          objectFit: 'cover',
          borderRadius: 16,
          opacity: deleting ? 0.5 : 1
        }}
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Found'
        }}
      />

      {/* Overlay */}
      <div className="photo-card-overlay">
        {/* Photographer info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div
            className="avatar-placeholder"
            style={{ width: 28, height: 28, fontSize: '0.7rem', flexShrink: 0 }}
          >
            {photo.photographer?.username?.[0]?.toUpperCase() || <User size={12} />}
          </div>
          <div>
            <p style={{ color: '#FFFFFF', fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.1 }}>
              {photo.title || 'Untitled'}
            </p>
            <p style={{ color: '#94A3B8', fontSize: '0.7rem' }}>
              {photo.photographer?.username || 'Anonymous'}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            id={`like-btn-${photo.id || index}`}
            onClick={handleLike}
            className={`like-btn ${liked ? 'liked' : ''}`}
            disabled={liking}
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <Heart size={13} fill={liked ? 'currentColor' : 'none'} />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>

          {photo.id && (
            <Link
              to={`/photos/${photo.id}`}
              onClick={(e) => e.stopPropagation()}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.3rem', fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
            >
              <Eye size={12} /> View
            </Link>
          )}

          <button
            id={`download-btn-${photo.id || index}`}
            onClick={handleDownload}
            className="btn btn-ghost btn-sm"
            style={{ gap: '0.3rem', fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: '#94A3B8' }}
            aria-label="Download"
          >
            <Download size={12} />
          </button>

          {isOwner && (
            <button
              onClick={handleDelete}
              className="btn btn-ghost btn-sm"
              style={{ gap: '0.3rem', fontSize: '0.75rem', padding: '0.3rem 0.6rem', color: '#F87171' }}
              disabled={deleting}
              aria-label="Delete"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Tags badge */}
      {photo.tags?.length > 0 && (
        <div className="photo-card-badge">
          #{photo.tags[0]}
        </div>
      )}
    </div>
  )
}
