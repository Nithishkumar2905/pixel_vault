import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import ProfileHeader from '../components/ProfileHeader'
import PhotoGrid from '../components/PhotoGrid'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import photoService from '../services/photoService'

export default function ProfilePage() {
  const { userId } = useParams()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [photos, setPhotos] = useState([])
  const [allPhotos, setAllPhotos] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const targetId = userId || user?.id

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
        setPhotos(ph)

        // For DAM Analytics
        const totalUploaded = ph.length
        const publishedImages = ph.filter(p => p.publish_status === 'published').length
        const privateImages = totalUploaded - publishedImages
        const totalTags = ph.reduce((sum, p) => sum + (p.tags?.length || 0) + (p.keywords?.length || 0), 0)
        const totalLikes = ph.reduce((sum, photo) => sum + (photo.likes_count || 0), 0)
        const totalDownloads = ph.reduce((sum, photo) => sum + (photo.download_count || 0), 0)
        const uniqueAlbums = new Set(ph.filter(p => p.album).map(p => p.album)).size

        setStats({ 
          photoCount: totalUploaded, 
          published: publishedImages,
          private: privateImages,
          tagsGenerated: totalTags,
          totalLikes, 
          totalDownloads,
          albums: uniqueAlbums
        })
        
        // If viewing someone else's profile, only show published photos
        if (targetId !== user?.id) {
          setPhotos(ph.filter(p => p.publish_status === 'published'))
        } else {
          setPhotos(ph)
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
        setProfile(null)
        setPhotos([])
        setStats({ photoCount: 0, published: 0, private: 0, tagsGenerated: 0, totalLikes: 0, totalDownloads: 0, albums: 0 })
      } finally {
        setLoading(false)
      }
    }

    if (targetId) fetchData()
    else setLoading(false)
  }, [targetId])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
      </div>
    )
  }

  const handlePhotoDelete = (deletedId) => {
    setPhotos(prev => prev.filter(p => p.id !== deletedId))
    setStats(prev => ({
      ...prev,
      photoCount: prev.photoCount - 1
      // Note: totalLikes and totalDownloads could be recalculated if needed, but this is fine for now
    }))
  }

  const isOwn = !userId || userId === user?.id

  return (
    <div className="fade-in">
      <ProfileHeader profile={profile} stats={stats} isOwn={isOwn} />
      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF' }}>
            Portfolio
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {photos.length} photo{photos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <PhotoGrid photos={photos} loading={false} onDelete={handlePhotoDelete} />
      </div>
    </div>
  )
}
