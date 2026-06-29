import { NavLink, Link, useNavigate } from 'react-router-dom'
import { 
  Camera, 
  LayoutDashboard, 
  Upload, 
  Search, 
  Image as ImageIcon, 
  Heart, 
  User, 
  Settings, 
  LogOut,
  FolderOpen
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleComingSoon = (e, featureName) => {
    e.preventDefault()
    toast(`✨ ${featureName} is coming soon!`, { icon: '🚧' })
  }

  const navItems = [
    { to: '/workspace', icon: <LayoutDashboard size={20} />, label: 'Dashboard', auth: true },
    { to: '/workspace', icon: <FolderOpen size={20} />, label: 'My Workspace', auth: true },
    { to: '/upload', icon: <Upload size={20} />, label: 'Upload', auth: true },
    { to: '/search', icon: <Search size={20} />, label: 'AI Search', auth: false },
    { to: '#albums', icon: <ImageIcon size={20} />, label: 'AI Albums', auth: true, onClick: (e) => handleComingSoon(e, 'AI Albums') },
    { to: '/', icon: <Camera size={20} />, label: 'Public Gallery', auth: false },
    { to: '#favorites', icon: <Heart size={20} />, label: 'Favorites', auth: true, onClick: (e) => handleComingSoon(e, 'Favorites') },
  ]

  const bottomItems = [
    { to: user ? `/profile/${user.id}` : '/login', icon: <User size={20} />, label: 'Profile', auth: false },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings', auth: true },
  ]

  return (
    <aside style={{
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      width: '280px',
      background: 'var(--color-bg-secondary)',
      borderRight: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem 1.5rem',
      zIndex: 50
    }}>
      {/* Logo */}
      <Link to="/" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem', 
        textDecoration: 'none',
        marginBottom: '3rem',
        paddingLeft: '1rem'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'var(--color-text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-highlight)'
        }}>
          <Camera size={20} />
        </div>
        <span style={{ 
          fontFamily: 'var(--font-heading)', 
          fontSize: '1.25rem', 
          fontWeight: 700,
          color: 'var(--color-text-primary)'
        }}>
          PixelVault AI
        </span>
      </Link>

      {/* Main Navigation */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.filter(item => !item.auth || user).map((item, idx) => (
          <NavLink
            key={idx}
            to={item.to}
            onClick={item.onClick}
            className={({ isActive }) => `sidebar-link ${isActive && !item.onClick ? 'active' : ''}`}
            end={item.to === '/'}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Storage Indicator */}
      {user && (
        <div style={{
          padding: '1.5rem',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid var(--color-border)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div style={{ color: 'var(--color-accent)' }}><Upload size={16} /></div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Storage Used</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
            2.45 GB / 10 GB
          </div>
          <div style={{ height: '4px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden', marginBottom: '1rem' }}>
            <div style={{ width: '24%', height: '100%', background: 'var(--color-accent)', borderRadius: '2px' }}></div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            ✨ Upgrade Plan
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {bottomItems.filter(item => !item.auth || user).map((item, idx) => (
          <NavLink
            key={idx}
            to={item.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
        {user && (
          <button 
            onClick={handleLogout} 
            className="sidebar-link"
            style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        )}
      </div>

      <style>{`
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.875rem 1rem;
          border-radius: 12px;
          color: var(--color-text-secondary);
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .sidebar-link:hover {
          background: rgba(0,0,0,0.03);
          color: var(--color-text-primary);
        }
        .sidebar-link.active {
          background: #1E1E1E;
          color: #FFFFFF;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
      `}</style>
    </aside>
  )
}
