import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Heart, Download, ArrowLeft, User, Calendar, Eye, Share2, Tag, Sparkles, Trash2, Edit3, Image as ImageIcon, Hash, MapPin } from 'lucide-react'
import photoService from '../services/photoService'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import ConfirmModal from '../components/ConfirmModal'
import EXIFMiniMap from '../components/EXIFMiniMap'

export default function PhotoViewPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', description: '' })
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [liking, setLiking] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    
    const fetch = async () => {
      try {
        const data = await photoService.getById(id)
        const p = data.photo || data
        setPhoto(p)
        setEditForm({ title: p.title || '', description: p.description || '' })
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

  const handleSaveEdit = async () => {
    try {
      const res = await photoService.update(id, editForm)
      setPhoto({ ...photo, ...editForm })
      setEditing(false)
      toast.success('Updated successfully')
    } catch (err) {
      toast.error('Failed to update')
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3, borderTopColor: 'var(--color-accent)' }} />
      </div>
    )
  }

  if (!photo) return null

  return (
    <div className="fade-in" style={{ padding: '2rem 1.5rem', paddingBottom: '5rem' }}>
      <div className="container" style={{ maxWidth: '1400px' }}>
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm"
          style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem', background: '#FFFFFF', borderRadius: '999px', border: '1px solid var(--color-border)' }}
        >
          <ArrowLeft size={16} /> Back to Gallery
        </button>

        <div className="photo-view-grid" style={{ display: 'grid', gap: '2.5rem', alignItems: 'start' }}>
          {/* ===== IMAGE ===== */}
          <div style={{ position: 'sticky', top: '5rem' }}>
            <div
              style={{
                borderRadius: '24px',
                overflow: 'hidden',
                background: 'var(--color-bg-secondary)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px'
              }}
            >
              <img
                src={photo.image_url || photo.imageUrl}
                alt={photo.title}
                style={{ width: '100%', display: 'block', maxHeight: '85vh', objectFit: 'contain' }}
              />
            </div>
          </div>

          {/* ===== DETAILS PANEL ===== */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Title & Description */}
            <div>
              {editing ? (
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <input 
                    type="text" 
                    value={editForm.title} 
                    onChange={e => setEditForm({...editForm, title: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', background: '#FFFFFF', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '1.25rem', fontWeight: 600, outline: 'none' }}
                  />
                  <textarea 
                    value={editForm.description} 
                    onChange={e => setEditForm({...editForm, description: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', background: '#FFFFFF', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: '12px', minHeight: '120px', resize: 'vertical', fontFamily: 'var(--font-sans)', outline: 'none' }}
                  />
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={handleSaveEdit} className="btn btn-primary">Save Changes</button>
                    <button onClick={() => setEditing(false)} className="btn btn-secondary">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.1, letterSpacing: '-0.5px' }}>
                      {photo.title || 'Untitled'}
                    </h1>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={handleLike} className="icon-btn" style={{ background: liked ? 'rgba(211,93,93,0.1)' : '#FFFFFF', color: liked ? 'var(--color-error)' : 'var(--color-text-secondary)', border: '1px solid var(--color-border)', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
                      </button>
                      <button onClick={handleShare} className="icon-btn" style={{ background: '#FFFFFF', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Share2 size={20} />
                      </button>
                      <button onClick={handleDownload} className="icon-btn" style={{ background: 'var(--color-accent)', color: '#FFFFFF', border: 'none', width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Download size={20} />
                      </button>
                    </div>
                  </div>

                  {photo.description && (
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '0' }}>
                      {photo.description}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Photographer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
              <Link to={`/profile/${photo.user_id}`} style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-accent)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 600 }}>
                  {photo.photographer?.username?.[0]?.toUpperCase() || <User size={20} />}
                </div>
                <div>
                  <p style={{ color: 'var(--color-text-primary)', fontWeight: 600, fontSize: '1rem', margin: '0 0 0.1rem 0' }}>
                    {photo.photographer?.displayName || photo.photographer?.username || 'Anonymous'}
                  </p>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', margin: 0 }}>
                    <Calendar size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    {new Date(photo.created_at || photo.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </Link>
              
              {user && photo.user_id === user.id && !editing && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => setEditing(true)} className="btn btn-secondary btn-sm" style={{ padding: '0.5rem 1rem', borderRadius: '999px' }}>
                    <Edit3 size={14} style={{ marginRight: '0.25rem' }} /> Edit
                  </button>
                  <button onClick={() => setConfirmDeleteOpen(true)} className="btn btn-sm" style={{ padding: '0.5rem 1rem', borderRadius: '999px', background: 'rgba(211,93,93,0.1)', color: 'var(--color-error)' }} disabled={deleting}>
                    <Trash2 size={14} style={{ marginRight: '0.25rem' }} /> Delete
                  </button>
                </div>
              )}
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[
                { icon: <Heart size={18} />, label: 'Likes', value: likeCount },
                { icon: <Download size={18} />, label: 'Downloads', value: photo.download_count || 0 },
                { icon: <Eye size={18} />, label: 'Views', value: photo.view_count || 0 },
              ].map(({ icon, label, value }) => (
                <div key={label} className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ color: 'var(--color-accent)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
                  <div className="numbers" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{value}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* AI Metadata Area */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                <Sparkles size={18} color="var(--color-accent)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>AI Vision Analysis</h3>
              </div>

              {/* Tags */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ImageIcon size={14} /> Visual Objects
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {photo.tags?.length > 0 ? photo.tags.map((tag) => (
                    <Link key={tag} to={`/search?q=${encodeURIComponent(tag)}`} className="tag">
                      {tag}
                    </Link>
                  )) : <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No visual objects detected.</span>}
                </div>
              </div>

              {/* Keywords & Hashtags */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Tag size={14} /> Semantic Keywords
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {photo.keywords?.length > 0 ? photo.keywords.map(k => (
                      <span key={k} style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', background: 'rgba(0,0,0,0.03)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{k}</span>
                    )) : <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>None generated.</span>}
                  </div>
                </div>
                
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Hash size={14} /> Suggested Hashtags
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {photo.hashtags?.length > 0 ? photo.hashtags.map(h => (
                      <span key={h} style={{ fontSize: '0.8rem', color: 'var(--color-accent)', fontWeight: 500 }}>{h}</span>
                    )) : <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>None generated.</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Geotagged Location EXIF MiniMap */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <MapPin size={18} color="var(--color-accent)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Location & EXIF Map</h3>
              </div>
              <EXIFMiniMap
                latitude={photo.latitude || 48.8584}
                longitude={photo.longitude || 2.2945}
                locationName={photo.location || photo.location_name || 'Geotagged Location (Paris)'}
                height="200px"
              />
            </div>

          </div>
        </div>

        <style>{`
          .photo-view-grid { grid-template-columns: 1.2fr 1fr; }
          @media (max-width: 960px) {
            .photo-view-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>

      <ConfirmModal
        isOpen={confirmDeleteOpen}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
        title="Delete this photo forever?"
        message="This photo will be permanently removed from PixelVault and cannot be recovered."
        confirmLabel="Delete Forever"
        isDanger
      />
    </div>
  )
}
