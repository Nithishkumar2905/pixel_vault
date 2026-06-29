import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Image as ImageIcon, Eye, Lock, RefreshCw, Trash2, Edit3, Tag, Upload, HardDrive } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import photoService from '../services/photoService'
import toast from 'react-hot-toast'

export default function WorkspacePage() {
  const { user } = useAuth()
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)

  const loadPhotos = async () => {
    try {
      setLoading(true)
      const res = await photoService.getUserPhotos(user.id)
      setPhotos(res.photos)
    } catch (err) {
      toast.error('Failed to load workspace')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) loadPhotos()
  }, [user])

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published'
      await photoService.update(id, { publish_status: newStatus })
      toast.success(newStatus === 'published' ? 'Photo published!' : 'Moved to drafts')
      loadPhotos()
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return
    try {
      await photoService.delete(id)
      toast.success('Photo deleted')
      loadPhotos()
    } catch (err) {
      toast.error('Failed to delete photo')
    }
  }

  if (loading) {
    return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <RefreshCw className="spinner" size={32} color="var(--color-accent)" />
    </div>
  }

  const publishedCount = photos.filter(p => p.publish_status === 'published').length
  const draftCount = photos.length - publishedCount
  const totalTags = photos.reduce((acc, p) => acc + (p.tags?.length || 0) + (p.keywords?.length || 0), 0)

  return (
    <div className="fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Dashboard Header Stats */}
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', letterSpacing: '-1px' }}>
          Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || user?.user_metadata?.username || 'Creator'} ✨
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', marginBottom: '2rem' }}>
          Manage, organize and publish your photography portfolio with AI.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(93, 138, 102, 0.1)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ImageIcon size={28} />
            </div>
            <div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Total Photos</p>
              <p className="numbers" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{photos.length}</p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(184, 115, 51, 0.1)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tag size={28} />
            </div>
            <div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>AI Tags Generated</p>
              <p className="numbers" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{totalTags}</p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--color-highlight)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Eye size={28} />
            </div>
            <div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Published Photos</p>
              <p className="numbers" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{publishedCount}</p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(102, 120, 95, 0.1)', color: 'var(--color-secondary-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HardDrive size={28} />
            </div>
            <div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>Storage Used</p>
              <p className="numbers" style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>2.45 GB</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>My Workspace ✨</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem', background: '#FFFFFF', padding: '0.25rem', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <button className="btn btn-sm" style={{ background: 'var(--color-text-primary)', color: '#FFF' }}>All ({photos.length})</button>
            <button className="btn btn-ghost btn-sm">Draft ({draftCount})</button>
            <button className="btn btn-ghost btn-sm">Published ({publishedCount})</button>
          </div>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><ImageIcon size={40} /></div>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Your workspace is empty</h3>
          <p style={{ marginBottom: '2rem' }}>Upload your first batch of photos to let AI analyze them.</p>
          <Link to="/upload" className="btn btn-primary btn-lg"><Upload size={18} /> Start Uploading</Link>
        </div>
      ) : (
        <div className="photo-grid">
          {photos.map(photo => (
            <div key={photo.id} className="photo-grid-item glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', height: '220px' }}>
                <img src={photo.image_url} alt={photo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                  {photo.publish_status === 'published' ? (
                    <span style={{ background: 'var(--color-success)', color: '#fff', fontSize: '0.7rem', padding: '0.25rem 0.75rem', borderRadius: '8px', fontWeight: 600 }}>
                      Published
                    </span>
                  ) : (
                    <span style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', color: '#fff', fontSize: '0.7rem', padding: '0.25rem 0.75rem', borderRadius: '8px', fontWeight: 600 }}>
                      Draft
                    </span>
                  )}
                </div>
              </div>
              
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  {(photo.tags || []).slice(0, 3).map(t => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                </div>
                
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-sans)', fontWeight: 600 }} className="truncate-2">{photo.title || 'Untitled'}</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem', flex: 1 }} className="truncate-2">
                  {photo.description || 'No description available for this image.'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    2h ago
                  </span>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/photos/${photo.id}`} className="icon-btn" style={{ width: '32px', height: '32px', background: '#F5F5F5' }}>
                      <Edit3 size={14} />
                    </Link>
                    <button 
                      onClick={() => handleTogglePublish(photo.id, photo.publish_status)}
                      className="icon-btn" style={{ width: '32px', height: '32px', background: '#F5F5F5' }}
                      title={photo.publish_status === 'published' ? 'Unpublish' : 'Publish'}
                    >
                      {photo.publish_status === 'published' ? <Lock size={14} /> : <Eye size={14} />}
                    </button>
                    <button 
                      onClick={() => handleDelete(photo.id)}
                      className="icon-btn" style={{ width: '32px', height: '32px', background: 'rgba(211,93,93,0.1)', color: 'var(--color-error)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
