import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Image as ImageIcon, Eye, Lock, RefreshCw, Trash2, Edit3, CheckCircle, Tag } from 'lucide-react'
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
      <RefreshCw className="spinner" size={32} color="#6366F1" />
    </div>
  }

  return (
    <div className="fade-in" style={{ padding: '3rem 1rem', minHeight: 'calc(100vh - 68px)' }}>
      <div className="container" style={{ maxWidth: 1200 }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(99,102,241,0.4)' }}>
                <LayoutDashboard size={20} style={{ color: '#FFFFFF' }} />
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>My Workspace</h1>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '0.95rem', margin: 0 }}>
              Manage your private uploads, AI metadata, and publish settings.
            </p>
          </div>
          <Link to="/upload" className="btn btn-primary">
            Upload New
          </Link>
        </div>

        {photos.length === 0 ? (
          <div style={{ background: '#111827', borderRadius: '16px', padding: '4rem 2rem', textAlign: 'center', border: '1px solid #1f2937' }}>
            <ImageIcon size={48} color="#4b5563" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ color: '#e5e7eb', marginBottom: '0.5rem' }}>No photos yet</h3>
            <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>Upload some photos to see them in your workspace.</p>
            <Link to="/upload" className="btn btn-primary">Start Uploading</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {photos.map(photo => (
              <div key={photo.id} style={{ background: '#111827', borderRadius: '12px', overflow: 'hidden', border: '1px solid #1f2937', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: 200 }}>
                  <img src={photo.image_url} alt={photo.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                    {photo.publish_status === 'published' ? (
                      <span style={{ background: 'rgba(16,185,129,0.9)', color: '#fff', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.25rem', backdropFilter: 'blur(4px)' }}>
                        <Eye size={12} /> Published
                      </span>
                    ) : (
                      <span style={{ background: 'rgba(79,70,229,0.9)', color: '#fff', fontSize: '0.75rem', padding: '0.25rem 0.5rem', borderRadius: '999px', display: 'flex', alignItems: 'center', gap: '0.25rem', backdropFilter: 'blur(4px)' }}>
                        <Lock size={12} /> Draft
                      </span>
                    )}
                  </div>
                </div>
                
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ color: '#f3f4f6', fontSize: '1.1rem', margin: '0 0 0.5rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{photo.title || 'Untitled'}</h3>
                  <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '1rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {photo.description || 'No description.'}
                  </p>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    {(photo.tags || []).slice(0, 3).map(t => (
                      <span key={t} style={{ fontSize: '0.7rem', background: '#1f2937', color: '#d1d5db', padding: '0.125rem 0.375rem', borderRadius: '4px' }}>
                        <Tag size={10} style={{ display: 'inline', marginRight: '2px' }}/> {t}
                      </span>
                    ))}
                    {photo.tags?.length > 3 && <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>+{photo.tags.length - 3}</span>}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid #1f2937', paddingTop: '1rem' }}>
                    <Link to={`/photos/${photo.id}`} className="btn btn-secondary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.85rem', textAlign: 'center' }}>
                      <Edit3 size={14} style={{ display: 'inline', marginRight: '0.25rem' }} /> View/Edit
                    </Link>
                    <button 
                      onClick={() => handleTogglePublish(photo.id, photo.publish_status)}
                      className={photo.publish_status === 'published' ? "btn btn-secondary" : "btn btn-primary"}
                      style={{ flex: 1, padding: '0.4rem', fontSize: '0.85rem' }}
                    >
                      {photo.publish_status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button 
                      onClick={() => handleDelete(photo.id)}
                      className="btn btn-danger"
                      style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
