import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

const LightboxContext = createContext()

export function LightboxProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false)
  const [photos, setPhotos] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false)
  const [showInfoPanel, setShowInfoPanel] = useState(false)
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const slideshowTimerRef = useRef(null)

  // Open Lightbox with a list of photos and starting index
  const openLightbox = useCallback((photoList, index = 0) => {
    if (!photoList || photoList.length === 0) return
    setPhotos(photoList)
    setCurrentIndex(Math.max(0, Math.min(index, photoList.length - 1)))
    setIsOpen(true)
    setZoomLevel(1)
    setIsSlideshowPlaying(false)
    setShowHelpModal(false)
  }, [])

  // Close Lightbox
  const closeLightbox = useCallback(() => {
    setIsOpen(false)
    setIsSlideshowPlaying(false)
    setZoomLevel(1)
    if (slideshowTimerRef.current) {
      clearInterval(slideshowTimerRef.current)
    }
  }, [])

  // Navigation
  const nextPhoto = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % photos.length)
    setZoomLevel(1)
  }, [photos.length])

  const prevPhoto = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)
    setZoomLevel(1)
  }, [photos.length])

  const goToPhoto = useCallback((index) => {
    if (index >= 0 && index < photos.length) {
      setCurrentIndex(index)
      setZoomLevel(1)
    }
  }, [photos.length])

  // Zoom controls
  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3.5))
  }, [])

  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 1))
  }, [])

  const resetZoom = useCallback(() => {
    setZoomLevel(1)
  }, [])

  // Toggles
  const toggleSlideshow = useCallback(() => {
    setIsSlideshowPlaying((prev) => !prev)
  }, [])

  const toggleInfoPanel = useCallback(() => {
    setShowInfoPanel((prev) => !prev)
  }, [])

  const toggleHelpModal = useCallback(() => {
    setShowHelpModal((prev) => !prev)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
      }
    }
  }, [])

  // Auto Slideshow Effect (3.5 sec per photo)
  useEffect(() => {
    if (isSlideshowPlaying && isOpen && photos.length > 1) {
      slideshowTimerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length)
        setZoomLevel(1)
      }, 3500)
    } else if (slideshowTimerRef.current) {
      clearInterval(slideshowTimerRef.current)
    }

    return () => {
      if (slideshowTimerRef.current) {
        clearInterval(slideshowTimerRef.current)
      }
    }
  }, [isSlideshowPlaying, isOpen, photos.length])

  // Global Keyboard Listener
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if active element is an input/textarea
      const activeEl = document.activeElement
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return
      }

      switch (e.key) {
        case 'ArrowRight':
        case 'd':
        case 'D':
        case 'l':
        case 'L':
          e.preventDefault()
          nextPhoto()
          break

        case 'ArrowLeft':
        case 'a':
        case 'A':
        case 'h':
        case 'H':
          e.preventDefault()
          prevPhoto()
          break

        case 'Escape':
          e.preventDefault()
          if (showHelpModal) {
            setShowHelpModal(false)
          } else {
            closeLightbox()
          }
          break

        case ' ':
          e.preventDefault()
          toggleSlideshow()
          break

        case 'f':
        case 'F':
          e.preventDefault()
          toggleFullscreen()
          break

        case 'i':
        case 'I':
          e.preventDefault()
          toggleInfoPanel()
          break

        case '?':
        case '/':
          e.preventDefault()
          toggleHelpModal()
          break

        case '+':
        case '=':
          e.preventDefault()
          zoomIn()
          break

        case '-':
        case '_':
          e.preventDefault()
          zoomOut()
          break

        case '0':
          e.preventDefault()
          resetZoom()
          break

        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    isOpen,
    showHelpModal,
    nextPhoto,
    prevPhoto,
    closeLightbox,
    toggleSlideshow,
    toggleFullscreen,
    toggleInfoPanel,
    toggleHelpModal,
    zoomIn,
    zoomOut,
    resetZoom,
  ])

  const currentPhoto = photos[currentIndex] || null

  return (
    <LightboxContext.Provider
      value={{
        isOpen,
        photos,
        currentIndex,
        currentPhoto,
        isSlideshowPlaying,
        showInfoPanel,
        showHelpModal,
        zoomLevel,
        isFullscreen,
        openLightbox,
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
      }}
    >
      {children}
    </LightboxContext.Provider>
  )
}

export function useLightbox() {
  const context = useContext(LightboxContext)
  if (!context) {
    throw new Error('useLightbox must be used within a LightboxProvider')
  }
  return context
}
