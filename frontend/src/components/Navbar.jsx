import { Link, useNavigate } from 'react-router-dom'
import { Search, Bell, Sun, Command } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`)
    }
  }

  const handleComingSoon = () => {
    toast('✨ Feature coming soon!', { icon: '🚧' })
  }

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      background: 'rgba(247, 244, 239, 0.95)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--color-border)',
      padding: '1.25rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '2rem'
    }}>
      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '640px', position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search 
          size={18} 
          style={{ position: 'absolute', left: '1.25rem', color: 'var(--color-text-muted)' }} 
        />
        <input 
          type="text" 
          placeholder="Search photos, albums, tags, places..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.85rem 3rem 0.85rem 3rem',
            borderRadius: '16px',
            border: '1px solid var(--color-border)',
            background: '#FFFFFF',
            outline: 'none',
            fontSize: '0.95rem',
            color: 'var(--color-text-primary)',
            boxShadow: 'var(--shadow-soft)',
            transition: 'var(--transition-smooth)'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--color-accent)';
            e.target.style.boxShadow = '0 0 0 3px rgba(107, 112, 92, 0.15)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--color-border)';
            e.target.style.boxShadow = 'var(--shadow-soft)';
          }}
        />
        <div style={{
          position: 'absolute',
          right: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          background: 'var(--color-bg-primary)',
          border: '1px solid var(--color-border)',
          padding: '0.25rem 0.5rem',
          borderRadius: '8px',
          color: 'var(--color-text-muted)',
          fontSize: '0.75rem',
          fontWeight: 600
        }}>
          <Command size={12} /> K
        </div>
      </form>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <button onClick={handleComingSoon} className="icon-btn" aria-label="Theme Toggle">
          <Sun size={20} />
        </button>
        <button onClick={handleComingSoon} className="icon-btn" style={{ position: 'relative' }} aria-label="Notifications">
          <Bell size={20} />
          <span style={{ 
            position: 'absolute', 
            top: '4px', 
            right: '4px', 
            width: '16px', 
            height: '16px', 
            background: 'var(--color-error)', 
            borderRadius: '50%',
            border: '2px solid #FFFFFF',
            color: '#FFFFFF',
            fontSize: '0.6rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700
          }}>3</span>
        </button>

        <div style={{ width: '1px', height: '24px', background: 'var(--color-border)', margin: '0 0.5rem' }}></div>

        {user ? (
          <Link to={`/profile/${user.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Nithish Kumar</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Photographer</span>
            </div>
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Avatar"
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                background: 'var(--color-accent)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '1.1rem'
              }}>
                {(user?.email?.[0] || 'U').toUpperCase()}
              </div>
            )}
          </Link>
        ) : (
          <Link to="/login" className="btn btn-primary" style={{ borderRadius: '12px' }}>
            Sign In
          </Link>
        )}
      </div>

      <style>{`
        .icon-btn {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: transparent;
          color: var(--color-text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .icon-btn:hover {
          background: rgba(0,0,0,0.05);
        }
      `}</style>
    </header>
  )
}
