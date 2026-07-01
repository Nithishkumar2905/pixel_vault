import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Image as ImageIcon, Eye, Lock, RefreshCw, Trash2, Edit3, Tag, Upload, HardDrive, CheckCircle2, Globe } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import photoService from '../services/photoService'
import toast from 'react-hot-toast'

export default function WorkspacePage() {
  const { user } = useAuth()
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all') // 'all', 'drafts', 'published', 'favorites'

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

  const publishedCount = photos.filter(p => p.publish_status === 'published').length
  const draftCount = photos.length - publishedCount
  const favoritesCount = photos.filter(p => p.isLiked).length
  const totalTags = photos.reduce((acc, p) => acc + (p.tags?.length || 0) + (p.keywords?.length || 0), 0)

  const filteredPhotos = useMemo(() => {
    if (activeFilter === 'published') return photos.filter(p => p.publish_status === 'published')
    if (activeFilter === 'drafts') return photos.filter(p => p.publish_status !== 'published')
    if (activeFilter === 'favorites') return photos.filter(p => p.isLiked)
    return photos
  }, [photos, activeFilter])

  if (loading) {
    return <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <RefreshCw className="spinner" size={32} color="var(--color-accent)" />
    </div>
  }

  const getBtnClass = (filterType) => activeFilter === filterType ? "btn btn-sm" : "btn btn-ghost btn-sm"
  const getBtnStyle = (filterType) => activeFilter === filterType 
    ? { background: 'var(--color-text-primary)', color: '#FFF', borderRadius: '12px', padding: '0.5rem 1.25rem' }
    : { borderRadius: '12px', padding: '0.5rem 1.25rem' }

  return (
    <div className="fade-in" style={{ paddingBottom: '3rem' }}>
      {/* Dashboard Header Stats */}
      <div style={{ marginBottom: '3.5rem' }}>
        <h1 style={{ fontSize: '2.75rem', marginBottom: '0.5rem', letterSpacing: '-1px' }}>
          Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || user?.user_metadata?.username || 'Creator'}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', marginBottom: '2.5rem' }}>
          Manage, organize and publish your photography portfolio with AI.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(107, 112, 92, 0.1)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ImageIcon size={32} />
            </div>
            <div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>Total Photos</p>
              <p className="numbers" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>{photos.length}</p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(169, 132, 103, 0.1)', color: 'var(--color-secondary-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Tag size={32} />
            </div>
            <div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>AI Tags</p>
              <p className="numbers" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>{totalTags}</p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(221, 184, 146, 0.15)', color: '#B88F61', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Eye size={32} />
            </div>
            <div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>Published</p>
              <p className="numbers" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>{publishedCount}</p>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'rgba(88, 129, 87, 0.1)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HardDrive size={32} />
            </div>
            <div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', fontWeight: 500 }}>Storage</p>
              <p className="numbers" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>2.45 <span style={{ fontSize: '1rem' }}>GB</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Processing Queue (Mock) */}
      {photos.length > 0 && (
        <div className="glass-card" style={{ padding: '1.5rem 2rem', marginBottom: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem', background: '#FFFFFF' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2, borderColor: 'rgba(0,0,0,0.1)', borderTopColor: 'var(--color-accent)' }}></span>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>AI Processing Queue</span>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>3 images remaining</span>
            </div>
            <div style={{ height: '6px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '45%', height: '100%', background: 'var(--color-accent)', borderRadius: '3px' }}></div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: '100%', background: 'rgba(107, 112, 92, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ImageIcon size={16} color="var(--color-accent)" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workspace Grid */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem' }}>My Workspace ✨</h2>
        <div style={{ display: 'flex', background: '#FFFFFF', padding: '0.35rem', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-soft)' }}>
          <button 
            onClick={() => setActiveFilter('all')}
            className={getBtnClass('all')} style={getBtnStyle('all')}>
            All <span style={{ opacity: 0.6, marginLeft: '0.25rem' }}>{photos.length}</span>
          </button>
          <button 
            onClick={() => setActiveFilter('drafts')}
            className={getBtnClass('drafts')} style={getBtnStyle('drafts')}>
            Drafts <span style={{ opacity: 0.6, marginLeft: '0.25rem' }}>{draftCount}</span>
          </button>
          <button 
            onClick={() => setActiveFilter('published')}
            className={getBtnClass('published')} style={getBtnStyle('published')}>
            Published <span style={{ opacity: 0.6, marginLeft: '0.25rem' }}>{publishedCount}</span>
          </button>
          <button 
            onClick={() => setActiveFilter('favorites')}
            className={getBtnClass('favorites')} style={getBtnStyle('favorites')}>
            Favorites <span style={{ opacity: 0.6, marginLeft: '0.25rem' }}>{favoritesCount}</span>
          </button>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Upload size={40} color="var(--color-accent)" /></div>
          <h3 style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)', marginBottom: '0.75rem' }}>Your workspace is empty</h3>
          <p style={{ marginBottom: '2.5rem', fontSize: '1.05rem' }}>Upload your first batch of photos to let AI analyze them.</p>
          <Link to="/upload" className="btn btn-primary btn-lg"><Upload size={18} /> Start Uploading</Link>
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div className="empty-state">
          <h3 style={{ fontSize: '1.5rem', color: 'var(--color-text-primary)', marginBottom: '0.75rem' }}>No photos found</h3>
          <p style={{ marginBottom: '2.5rem', fontSize: '1.05rem' }}>You don't have any photos matching this filter.</p>
          <button onClick={() => setActiveFilter('all')} className="btn btn-primary btn-lg">View All Photos</button>
        </div>
      ) : (
        <div className="photo-grid">
          {filteredPhotos.map(photo => (
            <div key={photo.id} className="photo-grid-item glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ position: 'relative', height: '240px' }}>
                <img src={photo.image_url} alt={photo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                  {photo.publish_status === 'published' ? (
                    <span style={{ background: 'var(--color-success)', color: '#fff', fontSize: '0.75rem', padding: '0.35rem 0.85rem', borderRadius: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle2 size={12} /> Published
                    </span>
                  ) : (
                    <span style={{ background: 'rgba(255,255,255,0.9)', color: 'var(--color-text-primary)', fontSize: '0.75rem', padding: '0.35rem 0.85rem', borderRadius: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                      <Lock size={12} /> Draft
                    </span>
                  )}
                </div>
              </div>
              
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  {(photo.tags || []).slice(0, 3).map(t => (
                    <span key={t} className="tag">{t}</span>
                  ))}
                  {(photo.tags?.length > 3) && (
                    <span className="tag" style={{ background: 'transparent', border: '1px dashed var(--color-border)' }}>+{photo.tags.length - 3}</span>
                  )}
                </div>
                
                <h3 style={{ fontSize: '1.15rem', margin: '0 0 0.5rem 0', fontWeight: 600, lineHeight: 1.3 }} className="truncate-2">{photo.title || 'Untitled'}</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1, lineHeight: 1.5 }} className="truncate-2">
                  {photo.description || 'No AI description generated yet.'}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                    {new Date(photo.created_at).toLocaleDateString()}
                  </span>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/photos/${photo.id}`} className="icon-btn" style={{ width: '36px', height: '36px', background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)' }}>
                      <Edit3 size={16} />
                    </Link>
                    <button 
                      onClick={() => handleTogglePublish(photo.id, photo.publish_status)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.4rem 0.75rem', gap: '0.4rem', color: photo.publish_status === 'published' ? 'var(--color-text-secondary)' : 'var(--color-accent)' }}
                    >
                      {photo.publish_status === 'published' ? <><Lock size={14} /> Unpublish</> : <><Globe size={14} /> Publish</>}
                    </button>
                    <button 
                      onClick={() => handleDelete(photo.id)}
                      className="icon-btn" style={{ width: '36px', height: '36px', background: 'rgba(188, 71, 73, 0.05)', color: 'var(--color-error)' }}
                    >
                      <Trash2 size={16} />
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
