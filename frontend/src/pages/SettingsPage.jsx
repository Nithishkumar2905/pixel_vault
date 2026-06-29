import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { User, MapPin, Globe, Camera, Save, ArrowLeft, X, Check, Shield, Bell, Key, HardDrive, AlertTriangle } from 'lucide-react'
import Cropper from 'react-easy-crop'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'

// Helper to extract a cropped image from html canvas
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.src = url
  })

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) return null

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.95)
  })
}

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    bio: '',
    location: '',
    portfolio_link: '',
    avatar_url: ''
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  
  // Crop States
  const [imageSrc, setImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [showCropModal, setShowCropModal] = useState(false)

  const fileInputRef = useRef(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return navigate('/login')
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single()
          
        if (error) throw error
        
        if (data) {
          setFormData({
            name: data.name || '',
            username: data.username || '',
            bio: data.bio || '',
            location: data.location || '',
            portfolio_link: data.portfolio_link || '',
            avatar_url: data.avatar_url || ''
          })
        }
      } catch (err) {
        toast.error('Failed to load profile')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfile()
  }, [user, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      return toast.error('Image must be under 5MB')
    }

    const reader = new FileReader()
    reader.onload = () => {
      setImageSrc(reader.result)
      setShowCropModal(true)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
    }
    reader.readAsDataURL(file)
    
    // Clear input so selecting the same file triggers onChange again
    if (fileInputRef.current) fileInputRef.current.value = null
  }

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const handleUploadCropped = async () => {
    try {
      setUploadingAvatar(true)
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
      
      const arrayBuffer = await croppedBlob.arrayBuffer()
      const fileName = `avatars/${Date.now()}-avatar.jpg`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, arrayBuffer, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg'
        })
      
      if (uploadError) throw new Error(uploadError.message || 'Supabase storage rejected avatar')

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName)

      if (publicUrl) {
        setFormData(prev => ({ ...prev, avatar_url: publicUrl }))
        toast.success('Avatar cropped & uploaded!')
        setShowCropModal(false)
        setImageSrc(null)
      }
    } catch (err) {
      toast.error('Failed to crop and upload image')
      console.error(err)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      await updateUser({
        name: formData.name,
        username: formData.username,
        bio: formData.bio,
        location: formData.location,
        portfolio_link: formData.portfolio_link,
        avatar_url: formData.avatar_url
      })
      toast.success('Profile updated successfully!')
      navigate(`/profile/${user.id}`)
    } catch (err) {
      toast.error(err.message || 'Failed to update profile')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3, borderColor: 'var(--color-accent)' }} />
      </div>
    )
  }

  return (
    <div className="fade-in container" style={{ padding: '2rem 2rem 4rem', maxWidth: 1280 }}>
      
      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
        <button 
          onClick={() => navigate(-1)} 
          className="btn btn-ghost" 
          style={{ marginBottom: '1rem', marginLeft: '-0.5rem', display: 'inline-flex' }}
        >
          <ArrowLeft size={18} /> Back
        </button>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '-1px' }}>
          Settings
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem' }}>
          Manage your account settings and preferences.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr 320px', gap: '3rem' }}>
        
        {/* Left Nav */}
        <div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <button className={`settings-tab ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
              <User size={18} /> General
            </button>
            <button className={`settings-tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
              <Shield size={18} /> Security
            </button>
            <button className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
              <Bell size={18} /> Notifications
            </button>
            <button className={`settings-tab ${activeTab === 'api' ? 'active' : ''}`} onClick={() => setActiveTab('api')}>
              <Key size={18} /> API Keys
            </button>
          </nav>
        </div>

        {/* Middle Form */}
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '2rem' }}>General Settings</h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Avatar Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'var(--color-bg-primary)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
              <div 
                style={{ position: 'relative', cursor: 'pointer' }}
                onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
              >
                {formData.avatar_url ? (
                  <img 
                    src={formData.avatar_url} 
                    alt="Avatar preview" 
                    style={{ width: 88, height: 88, borderRadius: '24px', objectFit: 'cover', border: '4px solid #FFFFFF', boxShadow: 'var(--shadow-soft)', opacity: uploadingAvatar ? 0.5 : 1 }} 
                  />
                ) : (
                  <div 
                    style={{ width: 88, height: 88, borderRadius: '24px', background: 'var(--color-bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 600, color: 'var(--color-accent)', border: '4px solid #FFFFFF', boxShadow: 'var(--shadow-soft)', opacity: uploadingAvatar ? 0.5 : 1 }}
                  >
                    {formData.username?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                
                <div style={{
                  position: 'absolute',
                  bottom: -4,
                  right: -4,
                  background: 'var(--color-text-primary)',
                  borderRadius: '50%',
                  padding: '0.4rem',
                  border: '2px solid #FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Camera size={14} color="#FFFFFF" />
                </div>
              </div>
              
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                  Profile Picture
                </p>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  Recommended size: 256x256px. Max size 5MB.
                </p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="name">Display Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="input-field"
                  required
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="username">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="username"
                  className="input-field"
                  required
                  pattern="[a-zA-Z0-9_]+"
                  title="Only letters, numbers, and underscores allowed"
                />
              </div>
            </div>

            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                className="input-field"
                rows={4}
                style={{ resize: 'vertical' }}
                maxLength={300}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="location">Location</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                  className="input-field"
                />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label" htmlFor="portfolio_link">Portfolio Link</label>
                <input
                  id="portfolio_link"
                  name="portfolio_link"
                  type="url"
                  value={formData.portfolio_link}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="input-field"
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={saving}
                style={{ padding: '0.75rem 2rem' }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HardDrive size={18} color="var(--color-accent)" /> Current Storage
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.75rem' }}>
              <span className="numbers" style={{ fontSize: '1.5rem', fontWeight: 700 }}>2.45 GB</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>of 10 GB</span>
            </div>
            <div style={{ height: '8px', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.25rem' }}>
              <div style={{ width: '24.5%', height: '100%', background: 'var(--color-accent)' }}></div>
            </div>
            <button className="btn btn-secondary" style={{ width: '100%' }}>
              Manage Storage
            </button>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(188, 71, 73, 0.2)', background: 'rgba(188, 71, 73, 0.02)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-error)' }}>
              <AlertTriangle size={18} /> Danger Zone
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button className="btn btn-danger" style={{ width: '100%' }}>
              Delete Account
            </button>
          </div>
          
        </div>
      </div>

      {/* Crop Modal (Hidden logic preserved) */}
      {showCropModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(247, 244, 239, 0.85)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="modal" style={{ maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 600, fontSize: '1.25rem' }}>Crop Profile Picture</h3>
              <button onClick={() => { setShowCropModal(false); setImageSrc(null) }} className="icon-btn">
                <X size={20} />
              </button>
            </div>
            
            <div style={{ position: 'relative', width: '100%', height: 350, background: 'var(--color-bg-secondary)', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem' }}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>Zoom</span>
              <input type="range" value={zoom} min={1} max={3} step={0.05} onChange={(e) => setZoom(e.target.value)} style={{ flex: 1, accentColor: 'var(--color-accent)' }} />
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" onClick={() => { setShowCropModal(false); setImageSrc(null) }} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button type="button" onClick={handleUploadCropped} className="btn btn-primary" style={{ flex: 1 }}>
                {uploadingAvatar ? 'Uploading...' : 'Crop & Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .settings-tab {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1.25rem;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: var(--color-text-secondary);
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }
        .settings-tab:hover {
          background: rgba(107, 112, 92, 0.05);
          color: var(--color-text-primary);
        }
        .settings-tab.active {
          background: var(--color-bg-card);
          color: var(--color-accent);
          font-weight: 600;
          box-shadow: var(--shadow-soft);
          border: 1px solid var(--color-border);
        }
      `}</style>
    </div>
  )
}
