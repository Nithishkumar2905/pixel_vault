import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Heart, Download, ArrowLeft, User, Calendar, Eye, Share2, Tag, Sparkles, Trash2 } from 'lucide-react'
import photoService from '../services/photoService'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'


export default function PhotoViewPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [liking, setLiking] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await photoService.getById(id)
        const p = data.photo || data
        setPhoto(p)
        setLiked(p.isLiked || false)
        setLikeCount(p.likeCount || 0)
      } catch {
        toast.error('Photo not found')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetch()
  }, [id, navigate])

  const handleLike = async () => {
    if (!user) { toast.error('Please login to like photos'); return }
    if (liking) return
    setLiking(true)
    try {
      if (liked) {
        await photoService.unlike(id)
        setLiked(false)
        setLikeCount((c) => Math.max(0, c - 1))
      } else {
        await photoService.like(id)
        setLiked(true)
        setLikeCount((c) => c + 1)
      }
    } catch { toast.error('Action failed') }
    finally { setLiking(false) }
  }

  const handleDownload = async () => {
    if (!photo) return
    try {
      const imageUrl = photo.image_url || photo.imageUrl
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = objectUrl
      link.download = photo.title ? `${photo.title}.jpg` : 'photovault.jpg'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(objectUrl)

      if (id) await photoService.download(id)
      toast.success('Download started!')
    } catch (error) {
      console.error('Download error:', error)
      const link = document.createElement('a')
      link.href = photo.image_url || photo.imageUrl
      link.download = photo.title || 'photovault'
      link.target = '_blank'
      link.click()
      toast.error('Could not download directly, opened in new tab')
    }
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href)
    toast.success('Link copied to clipboard!')
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this photo forever?')) return
    setDeleting(true)
    try {
      await photoService.delete(id)
      toast.success('Photo deleted successfully')
      navigate(`/profile/${user.id}`)
    } catch (err) {
      toast.error('Failed to delete photo')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
      </div>
    )
  }

  if (!photo) return null

  return (
    <div className="fade-in" style={{ minHeight: 'calc(100vh - 68px)' }}>
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Back button */}
        <button
          id="back-btn"
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: '1.5rem', gap: '0.375rem' }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div
          className="photo-view-grid"
          style={{
            display: 'grid',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          {/* ===== IMAGE ===== */}
          <div>
            <div
              style={{
                borderRadius: 20,
                overflow: 'hidden',
                background: '#111827',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
              }}
            >
              <img
                src={photo.image_url || photo.imageUrl}
                alt={photo.title}
                id="photo-main-image"
                style={{ width: '100%', display: 'block', maxHeight: '80vh', objectFit: 'contain' }}
              />
            </div>
          </div>

          {/* ===== DETAILS PANEL ===== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '5rem' }}>
            {/* Title & Actions */}
            <div>
              <h1
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  marginBottom: '0.75rem',
                  lineHeight: 1.25,
                }}
              >
                {photo.title || 'Untitled'}
              </h1>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                <button
                  id="like-photo-btn"
                  onClick={handleLike}
                  className={`btn ${liked ? 'btn-danger' : 'btn-secondary'}`}
                  disabled={liking}
                >
                  <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
                  {likeCount > 0 ? likeCount : ''} {liked ? 'Liked' : 'Like'}
                </button>
                <button id="download-photo-btn" onClick={handleDownload} className="btn btn-highlight">
                  <Download size={16} /> Download
                </button>
                <button id="share-photo-btn" onClick={handleShare} className="btn btn-ghost btn-sm">
                  <Share2 size={15} />
                </button>

                {user && photo.user_id === user.id && (
                  <button 
                    onClick={handleDelete} 
                    className="btn btn-danger btn-sm"
                    disabled={deleting}
                    style={{ marginLeft: 'auto' }}
                  >
                    <Trash2 size={15} /> Delete
                  </button>
                )}
              </div>
            </div>

            {/* Stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '0.625rem',
              }}
            >
              {[
                { icon: <Heart size={14} />, label: 'Likes', value: likeCount },
                { icon: <Download size={14} />, label: 'Downloads', value: photo.download_count || 0 },
                { icon: <Eye size={14} />, label: 'Views', value: photo.view_count || 0 },
              ].map(({ icon, label, value }) => (
                <div key={label} className="stat-card" style={{ padding: '0.75rem' }}>
                  <div style={{ color: '#6366F1', marginBottom: '0.25rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
                  <div className="stat-value" style={{ fontSize: '1.125rem' }}>{value}</div>
                  <div className="stat-label" style={{ fontSize: '0.7rem' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            {photo.description && (
              <div className="glass-card" style={{ padding: '1rem', borderRadius: 12 }}>
                <p style={{ color: '#CBD5E1', fontSize: '0.875rem', lineHeight: 1.6 }}>{photo.description}</p>
              </div>
            )}

            {/* Tags */}
            {photo.tags?.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                  <Tag size={14} style={{ color: '#6366F1' }} />
                  <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: 600 }}>Tags</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {photo.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/search?q=${encodeURIComponent(tag)}`}
                      className="tag"
                      style={{ textDecoration: 'none' }}
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
                {photo.aiGenerated && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.5rem' }}>
                    <Sparkles size={11} style={{ color: '#F59E0B' }} />
                    <span style={{ color: '#64748B', fontSize: '0.7rem' }}>Tags generated by AI</span>
                  </div>
                )}
              </div>
            )}

            {/* Photographer */}
            <div className="glass-card" style={{ padding: '1rem', borderRadius: 12 }}>
              <p style={{ color: '#94A3B8', fontSize: '0.75rem', marginBottom: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Photographer
              </p>
              <Link
                to={`/profile/${photo.user_id}`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}
                id="photographer-link"
              >
                <div
                  className="avatar-placeholder"
                  style={{ width: 40, height: 40, fontSize: '1rem', flexShrink: 0 }}
                >
                  {photo.photographer?.username?.[0]?.toUpperCase() || <User size={16} />}
                </div>
                <div>
                  <p style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.9rem' }}>
                    {photo.photographer?.displayName || photo.photographer?.username}
                  </p>
                  <p style={{ color: '#6366F1', fontSize: '0.78rem' }}>@{photo.photographer?.username}</p>
                </div>
              </Link>
            </div>

            {/* Date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#475569', fontSize: '0.78rem' }}>
              <Calendar size={13} />
              {new Date(photo.created_at || photo.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Mobile responsive override */}
        <style>{`
          .photo-view-grid { grid-template-columns: 1fr 380px; }
          @media (max-width: 900px) {
            .photo-view-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </div>
  )
}
