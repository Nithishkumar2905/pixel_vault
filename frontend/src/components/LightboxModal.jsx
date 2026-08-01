import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Info,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Heart,
  Download,
  HelpCircle,
  Sparkles,
  Camera,
  Calendar,
  Eye,
  Tag,
  Share2,
  User,
  CheckCircle,
  MapPin,
} from 'lucide-react'
import { useLightbox } from '../context/LightboxContext'
import photoService from '../services/photoService'
import toast from 'react-hot-toast'
import EXIFMiniMap from './EXIFMiniMap'

const PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect fill='%231F1F1F' width='600' height='400'/%3E%3Cg fill='%23333333'%3E%3Crect x='250' y='150' width='100' height='70' rx='8'/%3E%3Ccircle cx='275' cy='140' r='18'/%3E%3Cpolygon points='240,220 290,165 330,200 360,175 400,220'/%3E%3C/g%3E%3C/svg%3E`

export default function LightboxModal() {
  const {
    isOpen,
    photos,
    currentIndex,
    currentPhoto,
    isSlideshowPlaying,
    showInfoPanel,
    showHelpModal,
    zoomLevel,
    isFullscreen,
    closeLightbox,
    nextPhoto,
    prevPhoto,
    goToPhoto,
    zoomIn,
    zoomOut,
    resetZoom,
    toggleSlideshow,
    toggleInfoPanel,
    toggleHelpModal,
    toggleFullscreen,
  } = useLightbox()

  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [liking, setLiking] = useState(false)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const thumbnailRowRef = useRef(null)

  // Sync photo likes state
  useEffect(() => {
    if (currentPhoto) {
      setLiked(currentPhoto.isLiked || false)
      setLikeCount(currentPhoto.likeCount ?? currentPhoto.likes_count ?? 0)
      setPanOffset({ x: 0, y: 0 })
    }
  }, [currentPhoto])

  // Scroll active thumbnail into view
  useEffect(() => {
    if (thumbnailRowRef.current && thumbnailRowRef.current.children[currentIndex]) {
      thumbnailRowRef.current.children[currentIndex].scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      })
    }
  }, [currentIndex])

  if (!isOpen || !currentPhoto) return null

  const imgSrc = currentPhoto.image_url || currentPhoto.imageUrl || PLACEHOLDER_SVG
  const hasMultiplePhotos = photos.length > 1

  // Handle Like Action inside Lightbox
  const handleLike = async (e) => {
    e.stopPropagation()
    if (liking || !currentPhoto.id) return
    setLiking(true)
    const newLikedState = !liked
    setLiked(newLikedState)
    setLikeCount((prev) => (newLikedState ? prev + 1 : Math.max(0, prev - 1)))

    try {
      if (newLikedState) {
        await photoService.like(currentPhoto.id)
        toast.success('Added to favorites')
      } else {
        await photoService.unlike(currentPhoto.id)
        toast('Removed from favorites', { icon: '💔' })
      }
    } catch (err) {
      setLiked(!newLikedState)
      setLikeCount((prev) => (newLikedState ? Math.max(0, prev - 1) : prev + 1))
      toast.error('Failed to update like')
    } finally {
      setLiking(false)
    }
  }

  // Handle Download inside Lightbox
  const handleDownload = async (e) => {
    e.stopPropagation()
    try {
      toast.loading('Preparing high-res download...', { id: 'lb-dl' })
      const res = await fetch(imgSrc)
      const blob = await res.blob()
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = currentPhoto.title || `pixelvault-${currentPhoto.id || 'photo'}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(objectUrl)
      if (currentPhoto.id) await photoService.download(currentPhoto.id)
      toast.success('Download started!', { id: 'lb-dl' })
    } catch (error) {
      toast.error('Could not download directly', { id: 'lb-dl' })
    }
  }

  // Pan Image when zoomed in
  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      e.preventDefault()
      setIsDragging(true)
      dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y }
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setPanOffset({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: 'rgba(12, 12, 12, 0.96)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        animation: 'fadeIn 0.25s ease',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Header Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
          zIndex: 10,
        }}
      >
        {/* Left: Photo Title & Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h3
              style={{
                color: '#FFFFFF',
                fontSize: '1rem',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                maxWidth: '300px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentPhoto.title || 'Untitled Photo'}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>
                {currentIndex + 1} of {photos.length}
              </span>
              {currentPhoto.tags?.length > 0 && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    background: 'rgba(255,255,255,0.12)',
                    color: '#DDB892',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontWeight: 600,
                  }}
                >
                  #{currentPhoto.tags[0]}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Play progress bar during slideshow */}
        {isSlideshowPlaying && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'rgba(255,255,255,0.1)',
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#588157',
                boxShadow: '0 0 8px #588157',
                animation: 'pulse 1.5s infinite',
              }}
            />
            <span style={{ color: '#FFFFFF', fontSize: '0.8rem', fontWeight: 500 }}>
              Slideshow Playing
            </span>
          </div>
        )}

        {/* Right: Controls Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Zoom controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
              padding: '0.15rem',
              marginRight: '0.5rem',
            }}
          >
            <button
              onClick={zoomOut}
              disabled={zoomLevel <= 1}
              title="Zoom Out (-)"
              className="lb-control-btn"
              style={{ opacity: zoomLevel <= 1 ? 0.4 : 1 }}
            >
              <ZoomOut size={16} />
            </button>
            <span
              style={{
                color: '#FFFFFF',
                fontSize: '0.78rem',
                fontWeight: 600,
                minWidth: '42px',
                textAlign: 'center',
              }}
            >
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={zoomIn}
              disabled={zoomLevel >= 3.5}
              title="Zoom In (+)"
              className="lb-control-btn"
              style={{ opacity: zoomLevel >= 3.5 ? 0.4 : 1 }}
            >
              <ZoomIn size={16} />
            </button>
            {zoomLevel > 1 && (
              <button onClick={resetZoom} title="Reset Zoom (0)" className="lb-control-btn">
                <RotateCcw size={14} />
              </button>
            )}
          </div>

          {/* Slideshow button */}
          {hasMultiplePhotos && (
            <button
              onClick={toggleSlideshow}
              title={isSlideshowPlaying ? 'Pause Slideshow (Space)' : 'Play Slideshow (Space)'}
              className={`lb-control-btn ${isSlideshowPlaying ? 'active' : ''}`}
            >
              {isSlideshowPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
          )}

          {/* Like button */}
          <button
            onClick={handleLike}
            title="Like Photo"
            className="lb-control-btn"
            style={{ color: liked ? 'var(--color-error)' : '#FFFFFF' }}
          >
            <Heart size={18} fill={liked ? 'var(--color-error)' : 'none'} />
          </button>

          {/* Download button */}
          <button onClick={handleDownload} title="Download High Res" className="lb-control-btn">
            <Download size={18} />
          </button>

          {/* Info toggle */}
          <button
            onClick={toggleInfoPanel}
            title="Toggle Info Drawer (I)"
            className={`lb-control-btn ${showInfoPanel ? 'active' : ''}`}
          >
            <Info size={18} />
          </button>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            className="lb-control-btn"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>

          {/* Keyboard Help */}
          <button
            onClick={toggleHelpModal}
            title="Keyboard Shortcuts (?)"
            className={`lb-control-btn ${showHelpModal ? 'active' : ''}`}
          >
            <HelpCircle size={18} />
          </button>

          {/* Close Lightbox */}
          <button
            onClick={closeLightbox}
            title="Close Lightbox (Esc)"
            className="lb-control-btn close-btn"
            style={{ marginLeft: '0.5rem' }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Main Container (Image + Info Drawer) */}
      <div style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {/* Left Arrow Button */}
        {hasMultiplePhotos && (
          <button
            onClick={prevPhoto}
            aria-label="Previous Photo (Left Arrow)"
            style={{
              position: 'absolute',
              left: '1.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20,
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)',
            }}
            className="nav-arrow-btn"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        {/* Center Canvas Area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            position: 'relative',
            cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
            overflow: 'hidden',
          }}
          onMouseDown={handleMouseDown}
        >
          <img
            key={currentPhoto.id || currentIndex}
            src={imgSrc}
            alt={currentPhoto.title || 'Lightbox View'}
            style={{
              maxWidth: '90%',
              maxHeight: '82vh',
              objectFit: 'contain',
              borderRadius: '12px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
              transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16,1,0.3,1)',
            }}
            onError={(e) => (e.target.src = PLACEHOLDER_SVG)}
          />
        </div>

        {/* Right Arrow Button */}
        {hasMultiplePhotos && (
          <button
            onClick={nextPhoto}
            aria-label="Next Photo (Right Arrow)"
            style={{
              position: 'absolute',
              right: showInfoPanel ? '370px' : '1.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20,
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)',
            }}
            className="nav-arrow-btn"
          >
            <ChevronRight size={28} />
          </button>
        )}

        {/* Slide-in Info Drawer Panel */}
        {showInfoPanel && (
          <div
            style={{
              width: 350,
              background: 'rgba(20, 20, 20, 0.95)',
              borderLeft: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(20px)',
              padding: '2rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              overflowY: 'auto',
              zIndex: 15,
              animation: 'slideLeft 0.3s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ color: '#FFFFFF', fontSize: '1.1rem', fontWeight: 700 }}>Photo Details</h4>
              <button
                onClick={toggleInfoPanel}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Author Info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'var(--color-accent)',
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                }}
              >
                {currentPhoto.profiles?.username?.[0]?.toUpperCase() ||
                  currentPhoto.user_email?.[0]?.toUpperCase() ||
                  'P'}
              </div>
              <div>
                <div style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.9rem' }}>
                  {currentPhoto.profiles?.name ||
                    currentPhoto.profiles?.username ||
                    currentPhoto.user_email?.split('@')[0] ||
                    'PixelVault Creator'}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
                  @{currentPhoto.profiles?.username || 'photographer'}
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <div>
              <h5 style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                {currentPhoto.title || 'Untitled'}
              </h5>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: 1.5 }}>
                {currentPhoto.description || 'No description available for this image.'}
              </p>
            </div>

            {/* Likes / Views Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.75rem', borderRadius: '12px', textAlign: 'center' }}>
                <Heart size={16} color="var(--color-error)" style={{ marginBottom: '0.25rem' }} />
                <div style={{ color: '#FFF', fontWeight: 700, fontSize: '0.95rem' }}>{likeCount}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>Likes</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.75rem', borderRadius: '12px', textAlign: 'center' }}>
                <Download size={16} color="#588157" style={{ marginBottom: '0.25rem' }} />
                <div style={{ color: '#FFF', fontWeight: 700, fontSize: '0.95rem' }}>{currentPhoto.download_count || 0}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>Downloads</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '0.75rem', borderRadius: '12px', textAlign: 'center' }}>
                <Eye size={16} color="#A98467" style={{ marginBottom: '0.25rem' }} />
                <div style={{ color: '#FFF', fontWeight: 700, fontSize: '0.95rem' }}>{currentPhoto.view_count || 0}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem' }}>Views</div>
              </div>
            </div>

            {/* EXIF Metadata Box */}
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '1.25rem',
              }}
            >
              <h5
                style={{
                  color: '#DDB892',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Camera size={15} /> EXIF Information
              </h5>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Camera</span>
                  <span style={{ color: '#FFF', fontWeight: 500 }}>
                    {currentPhoto.camera_make
                      ? `${currentPhoto.camera_make} ${currentPhoto.camera_model || ''}`
                      : 'Sony A7 IV'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Aperture</span>
                  <span style={{ color: '#FFF', fontWeight: 500 }}>
                    {currentPhoto.aperture ? `f/${currentPhoto.aperture}` : 'f/1.8'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Focal Length</span>
                  <span style={{ color: '#FFF', fontWeight: 500 }}>
                    {currentPhoto.focal_length ? `${currentPhoto.focal_length}mm` : '85mm'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>ISO</span>
                  <span style={{ color: '#FFF', fontWeight: 500 }}>{currentPhoto.iso || '100'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>Date Taken</span>
                  <span style={{ color: '#FFF', fontWeight: 500 }}>
                    {currentPhoto.created_at
                      ? new Date(currentPhoto.created_at).toLocaleDateString()
                      : 'Recently'}
                  </span>
                </div>
              </div>
            </div>

            {/* GPS Location MiniMap */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ color: '#DDB892', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={15} /> Photo Location
              </div>
              <EXIFMiniMap
                latitude={currentPhoto.latitude || 48.8584}
                longitude={currentPhoto.longitude || 2.2945}
                locationName={currentPhoto.location || 'Geotagged Location'}
                height="150px"
              />
            </div>

            {/* AI Tags */}
            {currentPhoto.tags?.length > 0 && (
              <div>
                <h5
                  style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Sparkles size={14} color="#DDB892" /> AI Tags
                </h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {currentPhoto.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        background: 'rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.85)',
                        fontSize: '0.78rem',
                        padding: '0.3rem 0.75rem',
                        borderRadius: '20px',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* View Full Page Link */}
            {currentPhoto.id && (
              <Link
                to={`/photos/${currentPhoto.id}`}
                onClick={closeLightbox}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  marginTop: 'auto',
                  justifyContent: 'center',
                  background: 'rgba(255,255,255,0.08)',
                  borderColor: 'rgba(255,255,255,0.15)',
                  color: '#FFFFFF',
                }}
              >
                Go to Details Page &rarr;
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Bottom Thumbnails Strip */}
      {hasMultiplePhotos && (
        <div
          style={{
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <div
            ref={thumbnailRowRef}
            style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              maxWidth: '85vw',
              padding: '0.25rem',
              scrollbarWidth: 'none',
            }}
          >
            {photos.map((item, idx) => {
              const active = idx === currentIndex
              const thumbSrc = item.image_url || item.imageUrl || PLACEHOLDER_SVG
              return (
                <img
                  key={item.id || idx}
                  src={thumbSrc}
                  alt={`Thumb ${idx}`}
                  onClick={() => goToPhoto(idx)}
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: '10px',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    opacity: active ? 1 : 0.45,
                    border: active ? '2px solid #DDB892' : '2px solid transparent',
                    transform: active ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
                    flexShrink: 0,
                  }}
                  onError={(e) => (e.target.src = PLACEHOLDER_SVG)}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Cheat Sheet Overlay */}
      {showHelpModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10001,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={toggleHelpModal}
        >
          <div
            style={{
              background: '#1A1A1A',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '24px',
              padding: '2.5rem',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 30px 70px rgba(0,0,0,0.8)',
              color: '#FFFFFF',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HelpCircle size={20} color="#DDB892" /> Keyboard Shortcuts
              </h3>
              <button
                onClick={toggleHelpModal}
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { keys: ['→', 'D', 'L'], action: 'Next photo' },
                { keys: ['←', 'A', 'H'], action: 'Previous photo' },
                { keys: ['Space'], action: 'Play / Pause Slideshow' },
                { keys: ['Esc'], action: 'Close Lightbox' },
                { keys: ['F'], action: 'Toggle Fullscreen' },
                { keys: ['I'], action: 'Toggle Info Panel' },
                { keys: ['+', '-'], action: 'Zoom In / Out' },
                { keys: ['0'], action: 'Reset Zoom' },
                { keys: ['?'], action: 'Toggle Shortcuts Menu' },
              ].map((sc) => (
                <div
                  key={sc.action}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255,255,255,0.04)',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>{sc.action}</span>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {sc.keys.map((k) => (
                      <kbd
                        key={k}
                        style={{
                          background: 'rgba(255,255,255,0.12)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '6px',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          fontFamily: 'monospace',
                        }}
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={toggleHelpModal}
              className="btn btn-primary"
              style={{ width: '100%', borderRadius: '14px', background: 'var(--color-accent)', border: 'none', color: '#FFF' }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Internal Component CSS */}
      <style>{`
        .lb-control-btn {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.08);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .lb-control-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }
        .lb-control-btn.active {
          background: var(--color-accent);
          border-color: var(--color-accent);
        }
        .lb-control-btn.close-btn:hover {
          background: var(--color-error);
          border-color: var(--color-error);
        }
        .nav-arrow-btn:hover {
          background: rgba(255, 255, 255, 0.25) !important;
          transform: translateY(-50%) scale(1.1) !important;
        }
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
