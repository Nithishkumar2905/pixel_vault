import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Eye, Download, User, Trash2, Globe, Lock, Maximize2 } from 'lucide-react'
import photoService from '../services/photoService'
import { useAuth } from '../context/AuthContext'
import { useLightbox } from '../context/LightboxContext'
import toast from 'react-hot-toast'
import ConfirmModal from './ConfirmModal'

// Reliable inline SVG placeholder — no external service needed
const PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect fill='%23F4F1E9' width='600' height='400'/%3E%3Cg fill='%23C8C2B6'%3E%3Crect x='250' y='150' width='100' height='70' rx='8'/%3E%3Ccircle cx='275' cy='140' r='18'/%3E%3Cpolygon points='240,220 290,165 330,200 360,175 400,220'/%3E%3C/g%3E%3C/svg%3E`

export default function PhotoCard({ photo, index = 0, onDelete, allPhotos }) {
  const { user } = useAuth()
  const { openLightbox } = useLightbox()
  const navigate = useNavigate()
  const [liked, setLiked] = useState(photo.isLiked || false)
  const [likeCount, setLikeCount] = useState(photo.likeCount ?? photo.likes_count ?? 0)
  const [liking, setLiking] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [publishStatus, setPublishStatus] = useState(photo.publish_status || 'private')
  const [publishing, setPublishing] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const imgSrc = photo.image_url || photo.imageUrl
  const isOwner = user && (photo.user_id === user.id)

  const handleDelete = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setConfirmOpen(true)
  }

  const confirmDelete = async () => {
    setConfirmOpen(false)
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

  const handleTogglePublish = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (publishing) return
    setPublishing(true)
    const newStatus = publishStatus === 'published' ? 'private' : 'published'
    try {
      await photoService.update(photo.id, { publish_status: newStatus })
      setPublishStatus(newStatus)
      toast.success(newStatus === 'published' ? 'Photo published!' : 'Photo made private')
    } catch (err) {
      toast.error('Failed to update status')
    } finally {
      setPublishing(false)
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
      onClick={() => {
        const photoList = allPhotos && allPhotos.length > 0 ? allPhotos : [photo]
        const idx = allPhotos && allPhotos.length > 0 ? allPhotos.findIndex((p) => p.id === photo.id) : 0
        openLightbox(photoList, idx >= 0 ? idx : 0)
      }}
      style={{ cursor: 'pointer', opacity: deleting ? 0.5 : 1 }}
    >
      {photo.matchPercentage && (
        <div className="album-card-badge" style={{ top: '0.75rem', left: '0.75rem', background: 'rgba(0,0,0,0.6)' }}>
          {photo.matchPercentage}% Match
        </div>
      )}
      <img
        src={imgSrc}
        alt={photo.title || photo.altText || 'Photo'}
        style={{ transform: 'translateZ(0)' }}
        onError={(e) => {
          e.target.src = PLACEHOLDER_SVG
        }}
      />

      {/* Overlay */}
      <div className="photo-card-overlay">
        {/* Photographer info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div
            className="avatar-placeholder"
            style={{ width: 32, height: 32, fontSize: '0.75rem', flexShrink: 0, border: 'none', background: 'rgba(255,255,255,0.2)' }}
          >
            {photo.photographer?.username?.[0]?.toUpperCase() || <User size={14} color="#FFF" />}
          </div>
          <div>
            <p className="photo-card-overlay-text" style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: 1.2, fontFamily: 'var(--font-heading)' }}>
              {photo.title || 'Untitled'}
            </p>
            <p className="photo-card-overlay-text" style={{ fontSize: '0.75rem', opacity: 0.8, fontFamily: 'var(--font-sans)' }}>
              {photo.photographer?.username || 'Anonymous'}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            id={`like-btn-${photo.id || index}`}
            onClick={handleLike}
            className={`btn btn-secondary btn-sm ${liked ? 'liked' : ''}`}
            disabled={liking}
            style={{ padding: '0.4rem 0.6rem', color: liked ? 'var(--color-error)' : 'var(--color-text-primary)' }}
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
            {likeCount > 0 && <span className="numbers">{likeCount}</span>}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation()
              const photoList = allPhotos && allPhotos.length > 0 ? allPhotos : [photo]
              const idx = allPhotos && allPhotos.length > 0 ? allPhotos.findIndex((p) => p.id === photo.id) : 0
              openLightbox(photoList, idx >= 0 ? idx : 0)
            }}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.3rem', padding: '0.4rem 0.6rem' }}
            title="Open Lightbox (Fullscreen)"
            aria-label="Expand Lightbox"
          >
            <Maximize2 size={14} />
          </button>

          {photo.id && (
            <Link
              to={`/photos/${photo.id}`}
              onClick={(e) => e.stopPropagation()}
              className="btn btn-secondary btn-sm"
              style={{ gap: '0.3rem', padding: '0.4rem 0.6rem' }}
              title="View Photo Details Page"
            >
              <Eye size={14} />
            </Link>
          )}

          <button
            id={`download-btn-${photo.id || index}`}
            onClick={handleDownload}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.3rem', padding: '0.4rem 0.6rem' }}
            aria-label="Download"
          >
            <Download size={14} />
          </button>

          {isOwner && (
            <>
              <button
                onClick={handleTogglePublish}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.3rem', padding: '0.4rem 0.6rem', color: publishStatus === 'published' ? 'var(--color-success)' : 'var(--color-text-secondary)' }}
                disabled={publishing}
                aria-label="Toggle Publish"
              >
                {publishStatus === 'published' ? <Globe size={14} /> : <Lock size={14} />}
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-secondary btn-sm"
                style={{ gap: '0.3rem', padding: '0.4rem 0.6rem', color: 'var(--color-error)' }}
                disabled={deleting}
                aria-label="Delete"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tags badge */}
      {photo.tags?.length > 0 && (
        <div className="photo-card-badge" style={{ display: 'flex', gap: '0.25rem' }}>
          <span>{photo.tags[0]}</span>
          {photo.tags.length > 1 && <span className="hide-on-mobile">, {photo.tags[1]}</span>}
        </div>
      )}

      <ConfirmModal
        isOpen={confirmOpen}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
        title="Delete this photo?"
        message="This photo will be permanently removed from PixelVault. This action cannot be undone."
        confirmLabel="Delete Photo"
        isDanger
      />
    </div>
  )
}
