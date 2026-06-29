import { Link, useNavigate } from 'react-router-dom'
import { Search, Bell, Sun, Upload } from 'lucide-react'
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
      background: 'rgba(247, 245, 242, 0.85)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid var(--color-border)',
      padding: '1rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '2rem'
    }}>
      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '600px', position: 'relative' }}>
        <Search 
          size={18} 
          style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} 
        />
        <input 
          type="text" 
          placeholder="Search photos, albums, tags, people..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.875rem 1.25rem 0.875rem 3rem',
            borderRadius: '999px',
            border: '1px solid var(--color-border)',
            background: '#FFFFFF',
            outline: 'none',
            fontSize: '0.95rem',
            color: 'var(--color-text-primary)',
            boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.01)',
            transition: 'all 0.2s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--color-accent)';
            e.target.style.boxShadow = '0 0 0 3px rgba(184, 115, 51, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--color-border)';
            e.target.style.boxShadow = 'inset 0 2px 5px rgba(0,0,0,0.01)';
          }}
        />
      </form>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={handleComingSoon} className="icon-btn" aria-label="Theme Toggle">
          <Sun size={20} />
        </button>
        <button onClick={handleComingSoon} className="icon-btn" style={{ position: 'relative' }} aria-label="Notifications">
          <Bell size={20} />
          <span style={{ 
            position: 'absolute', 
            top: '2px', 
            right: '2px', 
            width: '8px', 
            height: '8px', 
            background: 'var(--color-error)', 
            borderRadius: '50%',
            border: '2px solid var(--color-bg-primary)'
          }}></span>
        </button>

        <div style={{ width: '1px', height: '24px', background: 'var(--color-border)', margin: '0 0.5rem' }}></div>

        {user ? (
          <>
            <Link to="/upload" className="btn btn-primary btn-sm" style={{ padding: '0.5rem 1rem', borderRadius: '999px' }}>
              <Upload size={16} /> <span className="hide-on-mobile">Upload</span>
            </Link>
            <Link to={`/profile/${user.id}`}>
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
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
                  fontSize: '1.1rem',
                  border: '2px solid #FFFFFF',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  {(user?.user_metadata?.full_name?.[0] || user?.user_metadata?.username?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                </div>
              )}
            </Link>
          </>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm" style={{ borderRadius: '999px' }}>
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
          color: var(--color-text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .icon-btn:hover {
          background: rgba(0,0,0,0.04);
          color: var(--color-text-primary);
        }
        @media (max-width: 768px) {
          .hide-on-mobile { display: none !important; }
        }
      `}</style>
    </header>
  )
}
