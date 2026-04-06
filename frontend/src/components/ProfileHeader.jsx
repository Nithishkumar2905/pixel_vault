import { Link } from 'react-router-dom'
import { MapPin, Globe, Heart, Image, Calendar } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ProfileHeader({ profile, stats, isOwn: isOwnProp }) {
  const { user } = useAuth()
  const isOwn = isOwnProp ?? (user?.id === profile?.id)

  const displayUsername = profile?.username || user?.user_metadata?.username || 'user'
  const displayName = profile?.name || profile?.username || user?.user_metadata?.name || 'Photographer'
  
  const initial = displayUsername[0]?.toUpperCase() || '?'

  return (
    <div>
      {/* Banner */}
      <div className="profile-banner">
        <div style={{ position: 'absolute', inset: 0 }} />
      </div>

      {/* Profile info */}
      <div
        className="container"
        style={{ position: 'relative', marginTop: '-60px', paddingBottom: '2rem' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Avatar */}
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="avatar"
              style={{
                width: 100,
                height: 100,
                border: '4px solid #020617',
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              className="avatar-placeholder"
              style={{
                width: 100,
                height: 100,
                fontSize: '2rem',
                border: '4px solid #020617',
                flexShrink: 0,
              }}
            >
              {initial}
            </div>
          )}

          {/* Info */}
          <div style={{ flex: 1, minWidth: 200, paddingBottom: '0.5rem' }}>
            <h1
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '1.75rem',
                fontWeight: 700,
                color: '#FFFFFF',
                marginBottom: '0.25rem',
              }}
            >
              {displayName}
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              @{displayUsername}
            </p>
            {profile?.bio && (
              <p style={{ color: '#CBD5E1', fontSize: '0.875rem', maxWidth: 480, marginBottom: '0.75rem' }}>
                {profile.bio}
              </p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem', color: '#64748B' }}>
              {profile?.location && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin size={13} /> {profile.location}
                </span>
              )}
              {profile?.portfolio_link && (
                <a
                  href={profile.portfolio_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#6366F1' }}
                >
                  <Globe size={13} /> Portfolio
                </a>
              )}
              {profile?.created_at && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={13} />
                  Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>

          {/* Edit button */}
          {isOwn && (
            <Link
              to="/settings"
              className="btn btn-secondary"
              style={{ alignSelf: 'flex-end', marginBottom: '0.5rem' }}
              id="edit-profile-btn"
            >
              Edit Profile
            </Link>
          )}
        </div>

        {/* Stats row */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <div className="stat-card">
            <div className="stat-value">{stats?.photoCount ?? 0}</div>
            <div className="stat-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
              <Image size={12} /> Photos
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.totalLikes ?? 0}</div>
            <div className="stat-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
              <Heart size={12} /> Likes
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats?.totalDownloads ?? 0}</div>
            <div className="stat-label">Downloads</div>
          </div>
        </div>
      </div>
    </div>
  )
}
