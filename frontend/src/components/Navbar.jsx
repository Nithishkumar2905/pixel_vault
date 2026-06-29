import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Camera, Upload, Search, User, LogIn, LogOut, Home, Menu, X, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileOpen(false)
  }

  const links = [
    { to: '/', icon: <Home size={16} />, label: 'Explore' },
    { to: '/search', icon: <Search size={16} />, label: 'Search' },
    ...(user ? [
      { to: '/workspace', icon: <LayoutDashboard size={16} />, label: 'Workspace' },
      { to: '/upload', icon: <Upload size={16} />, label: 'Upload' }
    ] : []),
  ]

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to="/" className="nav-logo" style={{ textDecoration: 'none' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Camera size={22} style={{ color: '#6366F1' }} />
          PixelVault
        </span>
      </Link>

      {/* Desktop nav */}
      <ul className="nav-links" style={{ display: 'flex' }}>
        {links.map(({ to, icon, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end={to === '/'}
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Desktop actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {user ? (
          <>
            <Link
              to={`/profile/${user.id}`}
              className="nav-link"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="avatar-placeholder"
                  style={{ width: 28, height: 28, fontSize: '0.7rem' }}
                >
                  {(user?.user_metadata?.full_name?.[0] || user?.user_metadata?.username?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                </div>
              )}
              <span style={{ color: '#E2E8F0', fontSize: '0.875rem', fontWeight: 500 }}>
                {user?.user_metadata?.full_name || user?.user_metadata?.username || user?.email?.split('@')[0]}
              </span>
            </Link>
            <button id="logout-btn" onClick={handleLogout} className="btn btn-ghost btn-sm">
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">
              <LogIn size={15} />
              <span>Login</span>
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </>
        )}

        {/* Mobile menu toggle */}
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{ display: 'none', padding: '0.375rem' }}
          id="mobile-menu-btn"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            top: 68,
            left: 0,
            right: 0,
            background: 'rgba(2, 6, 23, 0.98)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(99,102,241,0.15)',
            padding: '1rem 1.5rem',
            zIndex: 49,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          {links.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
              end={to === '/'}
              style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
            >
              {icon}
              <span>{label}</span>
            </NavLink>
          ))}
          {user ? (
            <button onClick={handleLogout} className="btn btn-ghost" style={{ justifyContent: 'flex-start', color: '#F87171' }}>
              <LogOut size={16} /> Logout
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary" onClick={() => setMobileOpen(false)}>
              <LogIn size={16} /> Login
            </Link>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
