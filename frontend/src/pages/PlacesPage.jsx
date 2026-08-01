import { useState, useEffect } from 'react'
import { MapPin, Sparkles, Search, Compass, Globe, Filter, Calendar, Camera } from 'lucide-react'
import PhotoMapView from '../components/PhotoMapView'
import PhotoCard from '../components/PhotoCard'
import photoService from '../services/photoService'

// Curated Photovolta Geotagged Collections (World Locations with Real GPS Coordinates)
const GEOTAGGED_MOCK_PHOTOS = [
  {
    id: 'geo-1',
    title: 'Eiffel Tower at Golden Hour',
    location: 'Paris, France',
    latitude: 48.8584,
    longitude: 2.2945,
    camera_model: 'Sony A7 IV',
    aperture: '1.8',
    iso: 100,
    image_url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&q=80',
    tags: ['Paris', 'Architecture', 'Sunset', 'Travel'],
    likes_count: 342,
    isLiked: true,
  },
  {
    id: 'geo-2',
    title: 'Shibuya Crossing City Lights',
    location: 'Tokyo, Japan',
    latitude: 35.6595,
    longitude: 139.7004,
    camera_model: 'Fujifilm X-T4',
    aperture: '2.0',
    iso: 400,
    image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80',
    tags: ['Tokyo', 'Night', 'Urban', 'Japan'],
    likes_count: 512,
    isLiked: false,
  },
  {
    id: 'geo-3',
    title: 'Santorini Sunset Over Aegean',
    location: 'Santorini, Greece',
    latitude: 36.3932,
    longitude: 25.4615,
    camera_model: 'Canon EOS R5',
    aperture: '2.8',
    iso: 100,
    image_url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
    tags: ['Greece', 'Sea', 'Sunset', 'Architecture'],
    likes_count: 489,
    isLiked: true,
  },
  {
    id: 'geo-4',
    title: 'Majestic Alps Mountain Range',
    location: 'Zermatt, Switzerland',
    latitude: 45.9765,
    longitude: 7.7491,
    camera_model: 'Nikon Z7 II',
    aperture: '5.6',
    iso: 64,
    image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    tags: ['Mountains', 'Snow', 'Landscape', 'Swiss'],
    likes_count: 278,
    isLiked: false,
  },
  {
    id: 'geo-5',
    title: 'Reykjavik Northern Lights Glow',
    location: 'Reykjavik, Iceland',
    latitude: 64.1466,
    longitude: -21.9426,
    camera_model: 'Sony A1',
    aperture: '1.4',
    iso: 1600,
    image_url: 'https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=800&q=80',
    tags: ['Aurora', 'Night', 'Iceland', 'Nature'],
    likes_count: 620,
    isLiked: true,
  },
  {
    id: 'geo-6',
    title: 'Grand Canyon Red Rocks',
    location: 'Arizona, USA',
    latitude: 36.0544,
    longitude: -112.1401,
    camera_model: 'Leica Q2',
    aperture: '4.0',
    iso: 200,
    image_url: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?w=800&q=80',
    tags: ['Canyon', 'Desert', 'USA', 'Landscape'],
    likes_count: 194,
    isLiked: false,
  },
  {
    id: 'geo-7',
    title: 'Kyoto Bamboo Forest Walk',
    location: 'Kyoto, Japan',
    latitude: 35.0116,
    longitude: 135.6777,
    camera_model: 'Fujifilm X100V',
    aperture: '2.0',
    iso: 320,
    image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
    tags: ['Kyoto', 'Forest', 'Bamboo', 'Nature'],
    likes_count: 410,
    isLiked: true,
  },
  {
    id: 'geo-8',
    title: 'Sydney Opera House Reflection',
    location: 'Sydney, Australia',
    latitude: -33.8568,
    longitude: 151.2153,
    camera_model: 'Canon EOS R6',
    aperture: '2.8',
    iso: 100,
    image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80',
    tags: ['Sydney', 'Australia', 'Harbor', 'Architecture'],
    likes_count: 367,
    isLiked: false,
  },
]

const REGIONS = [
  { label: 'All Places', value: 'all' },
  { label: 'Europe', value: 'Europe' },
  { label: 'Asia', value: 'Asia' },
  { label: 'Americas', value: 'Americas' },
  { label: 'Oceania', value: 'Oceania' },
]

export default function PlacesPage() {
  const [mapPhotos, setMapPhotos] = useState(GEOTAGGED_MOCK_PHOTOS)
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserGeotaggedPhotos = async () => {
      try {
        setLoading(true)
        const res = await photoService.getAll({ limit: 50 })
        if (res.photos && res.photos.length > 0) {
          // Merge user photos with mock geotagged photos if they have coordinates
          const userGeotagged = res.photos.filter((p) => p.latitude && p.longitude)
          if (userGeotagged.length > 0) {
            setMapPhotos([...userGeotagged, ...GEOTAGGED_MOCK_PHOTOS])
          }
        }
      } catch (err) {
        console.error('Failed to load map photos:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUserGeotaggedPhotos()
  }, [])

  // Filter photos by region or search query
  const filteredPhotos = mapPhotos.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!matchesSearch) return false

    if (selectedRegion === 'Europe') {
      return (
        p.location?.includes('France') ||
        p.location?.includes('Greece') ||
        p.location?.includes('Switzerland') ||
        p.location?.includes('Iceland')
      )
    }
    if (selectedRegion === 'Asia') {
      return p.location?.includes('Japan') || p.location?.includes('Tokyo') || p.location?.includes('Kyoto')
    }
    if (selectedRegion === 'Americas') {
      return p.location?.includes('USA') || p.location?.includes('Arizona')
    }
    if (selectedRegion === 'Oceania') {
      return p.location?.includes('Australia') || p.location?.includes('Sydney')
    }

    return true
  })

  // Unique country count calculation
  const uniqueCountries = new Set(
    filteredPhotos.map((p) => p.location?.split(',').pop()?.trim()).filter(Boolean)
  ).size

  return (
    <div className="fade-in page-section">
      <div className="container" style={{ maxWidth: '1600px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                EXIF Map View
                <Compass size={28} color="var(--color-accent)" />
              </h1>
              <p className="section-subtitle">
                Explore your memories geographically on an interactive world map powered by EXIF GPS metadata.
              </p>
            </div>

            {/* Quick Stats Badges */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  padding: '0.75rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  boxShadow: 'var(--shadow-soft)',
                }}
              >
                <MapPin size={20} color="var(--color-accent)" />
                <div>
                  <div className="numbers" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    {filteredPhotos.length}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                    Geotagged Locations
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  borderRadius: '16px',
                  padding: '0.75rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  boxShadow: 'var(--shadow-soft)',
                }}
              >
                <Globe size={20} color="var(--color-secondary-accent)" />
                <div>
                  <div className="numbers" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    {uniqueCountries}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>
                    Countries Visited
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div
          style={{
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Region Tabs */}
          <div className="tab-filters">
            {REGIONS.map((reg) => (
              <button
                key={reg.value}
                className={`tab-filter-btn ${selectedRegion === reg.value ? 'active' : ''}`}
                onClick={() => setSelectedRegion(reg.value)}
              >
                {reg.label}
              </button>
            ))}
          </div>

          {/* Search Location Input */}
          <div style={{ position: 'relative', width: 280 }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search location, country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 1rem 0.55rem 2.25rem',
                borderRadius: '14px',
                border: '1px solid var(--color-border)',
                background: '#FFFFFF',
                outline: 'none',
                fontSize: '0.85rem',
                color: 'var(--color-text-primary)',
                boxShadow: 'var(--shadow-soft)',
              }}
            />
          </div>
        </div>

        {/* Leaflet Map Area */}
        <div style={{ marginBottom: '3rem' }}>
          <PhotoMapView photos={filteredPhotos} height="640px" />
        </div>

        {/* Photos Grid for Selected Region */}
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <h2
              style={{
                fontSize: '1.35rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Sparkles size={18} color="var(--color-highlight)" /> Photos in {selectedRegion === 'all' ? 'All Places' : selectedRegion}
            </h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
              Showing {filteredPhotos.length} geotagged photos
            </span>
          </div>

          <div className="photo-grid">
            {filteredPhotos.map((photo, i) => (
              <PhotoCard key={photo.id} photo={photo} index={i} allPhotos={filteredPhotos} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
