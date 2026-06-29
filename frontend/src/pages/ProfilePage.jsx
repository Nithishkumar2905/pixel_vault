import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import photoService from '../services/photoService'
import PhotoGrid from '../components/PhotoGrid'
import { MapPin, Globe, Calendar, Eye, Download, Heart, Hash, Settings, Activity } from 'lucide-react'

export default function ProfilePage() {
  const { userId } = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [photos, setPhotos] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const targetId = userId || user?.id
  const isOwn = !userId || userId === user?.id

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, photosRes] = await Promise.all([
          supabase.from('users').select('*').eq('id', targetId).single(),
          photoService.getUserPhotos(targetId),
        ])

        const p = profileRes.data || {}
        const ph = photosRes.photos || []

        setProfile(p)

        const publishedImages = ph.filter(photo => photo.publish_status === 'published')
        
        // Use all photos if viewing own profile, otherwise only published
        const displayPhotos = isOwn ? ph : publishedImages

        setPhotos(displayPhotos)

        const totalLikes = displayPhotos.reduce((sum, photo) => sum + (photo.likes_count || 0), 0)
        const totalDownloads = displayPhotos.reduce((sum, photo) => sum + (photo.download_count || 0), 0)
        
        // Mock views for aesthetic purposes
        const totalViews = displayPhotos.length * 45 + 12450

        setStats({ 
          photoCount: displayPhotos.length, 
          totalLikes, 
          totalDownloads,
          totalViews,
          topTag: 'Nature'
        })
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }

    if (targetId) fetchData()
    else setLoading(false)
  }, [targetId, isOwn])

  const handlePhotoDelete = (deletedId) => {
    setPhotos(prev => prev.filter(p => p.id !== deletedId))
    setStats(prev => ({ ...prev, photoCount: prev.photoCount - 1 }))
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" />
      </div>
    )
  }

  const displayUsername = profile?.username || user?.user_metadata?.username || 'user'
  const displayName = profile?.name || profile?.username || user?.user_metadata?.name || 'Photographer'
  const initial = displayUsername[0]?.toUpperCase() || '?'

  return (
    <div className="fade-in" style={{ paddingBottom: '4rem' }}>
      {/* Cinematic Banner */}
      <div style={{ 
        height: '280px', 
        background: 'linear-gradient(135deg, var(--color-bg-secondary) 0%, rgba(107, 112, 92, 0.15) 100%)',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=2500")', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.7 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--color-bg-primary) 0%, transparent 100%)' }} />
      </div>

      <div className="container" style={{ position: 'relative', marginTop: '-80px', maxWidth: 1200 }}>
        
        {/* Profile Info Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2rem' }}>
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                style={{ width: 160, height: 160, borderRadius: '24px', border: '6px solid var(--color-bg-primary)', objectFit: 'cover', boxShadow: 'var(--shadow-float)', background: '#FFF' }}
              />
            ) : (
              <div style={{ width: 160, height: 160, borderRadius: '24px', border: '6px solid var(--color-bg-primary)', background: 'var(--color-bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 600, color: 'var(--color-accent)', boxShadow: 'var(--shadow-float)' }}>
                {initial}
              </div>
            )}

            <div style={{ paddingBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.25rem', letterSpacing: '-1px' }}>
                {displayName}
              </h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', marginBottom: '1rem' }}>
                @{displayUsername}
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                {profile?.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={16} color="var(--color-text-muted)" /> {profile.location}
                  </span>
                )}
                {profile?.portfolio_link && (
                  <a href={profile.portfolio_link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 500 }}>
                    <Globe size={16} /> Portfolio
                  </a>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={16} color="var(--color-text-muted)" /> Joined {new Date(profile?.created_at || Date.now()).getFullYear()}
                </span>
              </div>
            </div>
          </div>

          {isOwn && (
            <Link to="/settings" className="btn btn-secondary" style={{ padding: '0.75rem 1.5rem', borderRadius: '16px' }}>
              <Settings size={18} /> Edit Profile
            </Link>
          )}
        </div>

        {profile?.bio && (
          <p style={{ color: 'var(--color-text-primary)', fontSize: '1.05rem', maxWidth: 600, marginBottom: '4rem', lineHeight: 1.6 }}>
            {profile.bio}
          </p>
        )}

        {/* Analytics Overview */}
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={20} color="var(--color-accent)" /> Analytics Overview
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', fontWeight: 500, marginBottom: '0.5rem' }}>Total Views</p>
            <p className="numbers" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{stats?.totalViews.toLocaleString()}</p>
            {/* Mock Sparkline */}
            <svg style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: '50px', opacity: 0.2 }} viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,30 L10,20 L20,25 L30,10 L40,15 L50,5 L60,18 L70,12 L80,22 L90,8 L100,20 L100,30 Z" fill="var(--color-accent)" />
            </svg>
          </div>
          
          <div className="glass-card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', fontWeight: 500, marginBottom: '0.5rem' }}>Total Downloads</p>
            <p className="numbers" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{stats?.totalDownloads.toLocaleString()}</p>
            <svg style={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', height: '50px', opacity: 0.15 }} viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,30 L10,25 L20,28 L30,15 L40,20 L50,10 L60,12 L70,5 L80,18 L90,10 L100,25 L100,30 Z" fill="var(--color-secondary-accent)" />
            </svg>
          </div>
          
          <div className="glass-card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', fontWeight: 500, marginBottom: '0.5rem' }}>Profile Likes</p>
            <p className="numbers" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{stats?.totalLikes.toLocaleString()}</p>
            <Heart size={48} color="var(--color-error)" style={{ position: 'absolute', bottom: '-10px', right: '10px', opacity: 0.05 }} />
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', fontWeight: 500, marginBottom: '0.5rem' }}>Top Tag</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {stats?.topTag}
            </p>
            <Hash size={48} color="var(--color-accent)" style={{ position: 'absolute', bottom: '-10px', right: '10px', opacity: 0.05 }} />
          </div>
        </div>

        {/* Portfolio Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.75rem' }}>{isOwn ? 'My Portfolio' : 'Portfolio'}</h2>
          <span style={{ background: 'var(--color-bg-card)', padding: '0.35rem 1rem', borderRadius: '12px', border: '1px solid var(--color-border)', fontSize: '0.9rem', fontWeight: 600 }}>
            {photos.length} photos
          </span>
        </div>

        <PhotoGrid photos={photos} loading={false} onDelete={handlePhotoDelete} />

      </div>
    </div>
  )
}
