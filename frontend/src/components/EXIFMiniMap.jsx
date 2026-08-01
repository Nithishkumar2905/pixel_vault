import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function EXIFMiniMap({
  latitude = 48.8566,
  longitude = 2.3522,
  locationName = 'Paris, France',
  height = '180px',
  zoom = 12,
}) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Clean up existing instance if re-rendering
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
    }

    const lat = Number(latitude) || 48.8566
    const lng = Number(longitude) || 2.3522

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: [lat, lng],
      zoom: zoom,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
    })

    // CartoDB Voyager Tile Layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map)

    // Custom CSS Pin Marker
    const customIcon = L.divIcon({
      className: 'exif-minimap-marker',
      html: `
        <div style="
          width: 28px;
          height: 28px;
          background: #6B705C;
          border: 3px solid #FFFFFF;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <div style="width: 8px; height: 8px; background: #FFFFFF; borderRadius: 50%;"></div>
          <div style="
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 7px solid #6B705C;
          "></div>
        </div>
      `,
      iconSize: [28, 34],
      iconAnchor: [14, 34],
    })

    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map)

    if (locationName) {
      marker.bindPopup(
        `<div style="font-family: sans-serif; font-size: 0.82rem; font-weight: 600; color: #1F1F1F; padding: 2px 4px;">📍 ${locationName}</div>`
      )
    }

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [latitude, longitude, locationName, zoom])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: height,
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Location overlay tag */}
      <div
        style={{
          position: 'absolute',
          bottom: '0.6rem',
          left: '0.6rem',
          background: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          borderRadius: '8px',
          padding: '0.35rem 0.75rem',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          zIndex: 400,
        }}
      >
        <span>📍</span> {locationName}
      </div>
    </div>
  )
}
