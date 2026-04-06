import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { User, MapPin, Globe, Camera, Save, ArrowLeft, X, Check } from 'lucide-react'
import Cropper from 'react-easy-crop'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import api from '../services/api'

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
      
      // 1. Convert to ArrayBuffer to avoid string regex matching DOMExceptions
      const arrayBuffer = await croppedBlob.arrayBuffer()
      const fileName = `avatars/${Date.now()}-avatar.jpg`

      // 2. Upload cleanly to Supabase 'images' bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, arrayBuffer, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg'
        })
      
      if (uploadError) throw new Error(uploadError.message || 'Supabase storage rejected avatar')

      // 3. Return the stored public String URL
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
        // Optional: you can omit username if you don't want to allow changing it, or handle uniqueness checks
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
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
      </div>
    )
  }

  return (
    <div className="fade-in" style={{ padding: '2rem 1.5rem', maxWidth: 640, margin: '0 auto' }}>
      <button 
        onClick={() => navigate(-1)} 
        className="btn btn-ghost" 
        style={{ marginBottom: '1.5rem', marginLeft: '-0.5rem' }}
      >
        <ArrowLeft size={18} /> Back
      </button>

      <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Edit Profile
      </h1>
      <p style={{ color: '#94A3B8', marginBottom: '2rem' }}>
        Update your personal details and public portfolio information.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Crop Modal */}
        {showCropModal && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(2, 6, 23, 0.9)', backdropFilter: 'blur(8px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
          }}>
            <div style={{ width: '100%', maxWidth: 500, background: '#0F172A', borderRadius: 16, overflow: 'hidden', border: '1px solid #1E293B', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ color: '#F8FAFC', fontWeight: 600, margin: 0 }}>Crop Profile Picture</h3>
                <button 
                  type="button"
                  onClick={() => { setShowCropModal(false); setImageSrc(null) }} 
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', display: 'flex' }}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div style={{ position: 'relative', width: '100%', height: 350, background: '#020617' }}>
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
              
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ color: '#94A3B8', fontSize: '0.875rem', minWidth: 40 }}>Zoom</span>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.05}
                    onChange={(e) => setZoom(e.target.value)}
                    style={{ flex: 1, accentColor: '#6366F1' }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => { setShowCropModal(false); setImageSrc(null) }}
                    className="btn btn-ghost"
                    style={{ flex: 1 }}
                    disabled={uploadingAvatar}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUploadCropped}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? (
                      <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Uploading...</>
                    ) : (
                      <><Check size={16} /> Crop & Upload</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Avatar Picker Overlay */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '0.5rem' }}>
          <div 
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
          >
            {formData.avatar_url ? (
              <img 
                src={formData.avatar_url} 
                alt="Avatar preview" 
                style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #1E293B', opacity: uploadingAvatar ? 0.5 : 1 }} 
              />
            ) : (
              <div 
                style={{ width: 80, height: 80, borderRadius: '50%', background: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 600, color: '#64748B', opacity: uploadingAvatar ? 0.5 : 1 }}
              >
                {formData.username?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            
            {/* Overlay Icon */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              background: '#6366F1',
              borderRadius: '50%',
              padding: '0.35rem',
              border: '2px solid #020617',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Camera size={14} color="#FFFFFF" />
            </div>

            {uploadingAvatar && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
              }}>
                <div className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }} />
              </div>
            )}
          </div>
          
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, color: '#FFFFFF', marginBottom: '0.25rem' }}>
              Profile Picture <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 400 }}>(optional)</span>
            </p>
            <p style={{ color: '#94A3B8', fontSize: '0.8rem' }}>
              Click the avatar to upload a new one. <br/>
              Recommended size: 256x256px. Max size 5MB.
            </p>
            {formData.avatar_url && (
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, avatar_url: '' }))}
                style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '0.8rem', marginTop: '0.5rem', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
              >
                Remove Avatar
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="name">
            <User size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
            Display Name
          </label>
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

        <div className="input-group">
          <label className="input-label" htmlFor="username">
            <User size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
            Username
          </label>
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

        <div className="input-group">
          <label className="input-label" htmlFor="bio">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us about yourself and your photography style..."
            className="input-field"
            rows={4}
            style={{ resize: 'vertical' }}
            maxLength={300}
          />
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="location">
            <MapPin size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
            Location
          </label>
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

        <div className="input-group">
          <label className="input-label" htmlFor="portfolio_link">
            <Globe size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
            Portfolio or Website Link
          </label>
          <input
            id="portfolio_link"
            name="portfolio_link"
            type="url"
            value={formData.portfolio_link}
            onChange={handleChange}
            placeholder="https://myportfolio.com"
            className="input-field"
          />
        </div>

        <div style={{ marginTop: '1rem', borderTop: '1px solid #1E293B', paddingTop: '1.5rem' }}>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={saving}
            style={{ width: '100%' }}
          >
            {saving ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Saving Changes...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Profile
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  )
}
