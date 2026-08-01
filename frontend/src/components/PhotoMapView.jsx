import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Maximize2, MapPin, Layers, RefreshCw, Eye, Sparkles } from 'lucide-react'
import { useLightbox } from '../context/LightboxContext'

const MAP_STYLES = {
  voyager: {
    name: 'Warm Ivory (Default)',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB &copy; OpenStreetMap',
  },
  positron: {
    name: 'Clean Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB &copy; OpenStreetMap',
  },
  dark: {
    name: 'Obsidian Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CartoDB &copy; OpenStreetMap',
  },
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
}

export default function PhotoMapView({
  photos = [],
  height = '620px',
  onMarkerClick,
}) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const layerGroupRef = useRef(null)
  const tileLayerRef = useRef(null)

  const [activeStyle, setActiveStyle] = useState('voyager')
  const [showStyleMenu, setShowStyleMenu] = useState(false)

  const { openLightbox } = useLightbox()

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const map = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 2.5,
      zoomControl: false,
      attributionControl: false,
    })

    // Base Tile Layer
    const tileLayer = L.tileLayer(MAP_STYLES[activeStyle].url, {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map)

    tileLayerRef.current = tileLayer
    layerGroupRef.current = L.layerGroup().addTo(map)
    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update Tile Layer when activeStyle changes
  useEffect(() => {
    if (mapInstanceRef.current && tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current)
      tileLayerRef.current = L.tileLayer(MAP_STYLES[activeStyle].url, {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(mapInstanceRef.current)
    }
  }, [activeStyle])

  // Populate Markers when photos change
  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return

    const layerGroup = layerGroupRef.current
    layerGroup.clearLayers()

    const bounds = []

    photos.forEach((photo, index) => {
      if (!photo.latitude || !photo.longitude) return

      const lat = Number(photo.latitude)
      const lng = Number(photo.longitude)
      bounds.push([lat, lng])

      const thumbUrl = photo.image_url || photo.imageUrl || ''
      const title = photo.title || 'Untitled Photo'
      const locName = photo.location_name || photo.location || 'Geotagged Location'

      // Custom Circular Photo Marker Icon
      const markerHtml = `
        <div class="pv-map-marker-pin" style="
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 3px solid #6B705C;
          box-shadow: 0 6px 18px rgba(0,0,0,0.25);
          overflow: hidden;
          position: relative;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        ">
          <img src="${thumbUrl}" alt="${title}" style="width:100%; height:100%; object-fit:cover;" />
          <div style="
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 8px solid #6B705C;
          "></div>
        </div>
      `

      const icon = L.divIcon({
        className: 'custom-photo-map-pin',
        html: markerHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 44],
        popupAnchor: [0, -44],
      })

      const marker = L.marker([lat, lng], { icon })

      // Interactive Popup Content
      const popupHtml = `
        <div style="width: 220px; font-family: sans-serif; padding: 2px;">
          <div style="position: relative; height: 120px; border-radius: 12px; overflow: hidden; margin-bottom: 8px; background: #1F1F1F;">
            <img src="${thumbUrl}" style="width:100%; height:100%; object-fit:cover;" />
            <div style="position: absolute; bottom: 6px; left: 6px; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); color: #FFF; font-size: 11px; padding: 2px 6px; border-radius: 6px; font-weight: 600;">
              📍 ${locName}
            </div>
          </div>
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #1F1F1F; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${title}</h4>
          <p style="margin: 0 0 10px 0; font-size: 11px; color: #6F6F6F;">
            ${photo.camera_model ? `📷 ${photo.camera_model}` : 'PixelVault Camera'}
          </p>
          <div style="display: flex; gap: 6px;">
            <button id="lb-view-btn-${photo.id || index}" style="
              flex: 1;
              background: #6B705C;
              color: #FFFFFF;
              border: none;
              border-radius: 8px;
              padding: 6px 10px;
              font-size: 12px;
              font-weight: 600;
              cursor: pointer;
            ">
              🔍 Lightbox
            </button>
            <a href="/photos/${photo.id || ''}" style="
              text-decoration: none;
              background: #F4F1E9;
              color: #1F1F1F;
              border: 1px solid #ECE7DF;
              border-radius: 8px;
              padding: 6px 10px;
              font-size: 12px;
              font-weight: 600;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              Details
            </a>
          </div>
        </div>
      `

      marker.bindPopup(popupHtml)

      // Event listener inside popup
      marker.on('popupopen', () => {
        const btn = document.getElementById(`lb-view-btn-${photo.id || index}`)
        if (btn) {
          btn.onclick = () => {
            openLightbox(photos, index)
            marker.closePopup()
          }
        }
      })

      marker.on('click', () => {
        if (onMarkerClick) onMarkerClick(photo)
      })

      layerGroup.addLayer(marker)
    })

    // Fit map bounds if markers exist
    if (bounds.length > 0) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 12 })
    }
  }, [photos, openLightbox, onMarkerClick])

  // Fit Bounds helper
  const handleFitBounds = () => {
    if (!mapInstanceRef.current || photos.length === 0) return
    const validCoords = photos.filter((p) => p.latitude && p.longitude).map((p) => [Number(p.latitude), Number(p.longitude)])
    if (validCoords.length > 0) {
      mapInstanceRef.current.fitBounds(validCoords, { padding: [60, 60] })
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: height,
        borderRadius: '24px',
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      {/* Map Canvas */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Map Controls */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          zIndex: 400,
          display: 'flex',
          gap: '0.5rem',
        }}
      >
        {/* Style Selector Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            className="btn btn-secondary btn-sm"
            style={{
              background: '#FFFFFF',
              boxShadow: 'var(--shadow-soft)',
              borderRadius: '12px',
              padding: '0.5rem 0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Layers size={15} color="var(--color-accent)" />
            <span>Map Theme</span>
          </button>

          {showStyleMenu && (
            <div
              style={{
                position: 'absolute',
                top: '110%',
                right: 0,
                background: '#FFFFFF',
                border: '1px solid var(--color-border)',
                borderRadius: '16px',
                padding: '0.5rem',
                boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                width: 200,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                zIndex: 500,
              }}
            >
              {Object.keys(MAP_STYLES).map((styleKey) => (
                <button
                  key={styleKey}
                  onClick={() => {
                    setActiveStyle(styleKey)
                    setShowStyleMenu(false)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: activeStyle === styleKey ? 'var(--color-bg-primary)' : 'transparent',
                    color: activeStyle === styleKey ? 'var(--color-accent)' : 'var(--color-text-primary)',
                    fontWeight: activeStyle === styleKey ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {MAP_STYLES[styleKey].name}
                  {activeStyle === styleKey && <Sparkles size={13} color="var(--color-accent)" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Fit Bounds Button */}
        <button
          onClick={handleFitBounds}
          className="btn btn-secondary btn-sm"
          style={{
            background: '#FFFFFF',
            boxShadow: 'var(--shadow-soft)',
            borderRadius: '12px',
            padding: '0.5rem',
          }}
          title="Fit All Photos in View"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Map Badge Info */}
      <div
        style={{
          position: 'absolute',
          bottom: '1rem',
          left: '1rem',
          zIndex: 400,
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          padding: '0.6rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        <MapPin size={18} color="var(--color-accent)" />
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            {photos.filter((p) => p.latitude && p.longitude).length} Geotagged Locations
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            Click markers to preview EXIF details & photos
          </div>
        </div>
      </div>

      {/* Internal Custom Map Marker Animation CSS */}
      <style>{`
        .custom-photo-map-pin:hover .pv-map-marker-pin {
          transform: scale(1.2) translateY(-4px) !important;
          border-color: #A98467 !important;
          box-shadow: 0 12px 28px rgba(0,0,0,0.35) !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          padding: 8px !important;
          box-shadow: 0 16px 36px rgba(0,0,0,0.18) !important;
          border: 1px solid var(--color-border) !important;
        }
        .leaflet-popup-tip {
          background: #FFFFFF !important;
        }
      `}</style>
    </div>
  )
}
