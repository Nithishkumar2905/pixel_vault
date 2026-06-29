import { NavLink, Link, useNavigate } from 'react-router-dom'
import { 
  Aperture, 
  Home, 
  UploadCloud, 
  Search, 
  Image as ImageIcon, 
  Heart, 
  User, 
  Settings, 
  LogOut,
  FolderOpen,
  LayoutGrid,
  ChevronDown
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
    { to: '/workspace', icon: <Home size={20} />, label: 'Dashboard', auth: true },
    { to: '#workspace-folder', icon: <FolderOpen size={20} />, label: 'My Workspace', auth: true, onClick: (e) => handleComingSoon(e, 'My Workspace Folder') },
    { to: '/upload', icon: <UploadCloud size={20} />, label: 'Upload', auth: true, badge: '20+' },
    { to: '/search', icon: <Search size={20} />, label: 'AI Search', auth: false },
    { to: '#albums', icon: <ImageIcon size={20} />, label: 'AI Albums', auth: true, onClick: (e) => handleComingSoon(e, 'AI Albums') },
    { to: '/', icon: <LayoutGrid size={20} />, label: 'Public Gallery', auth: false },
    { to: '#favorites', icon: <Heart size={20} />, label: 'Favorites', auth: true, onClick: (e) => handleComingSoon(e, 'Favorites') },
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
      zIndex: 50,
      overflowY: 'auto'
    }}>
      {/* Logo */}
      <Link to="/" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem', 
        textDecoration: 'none',
        marginBottom: '2.5rem',
        paddingLeft: '0.5rem'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: 'var(--color-text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#DDB892'
        }}>
          <Aperture size={22} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ 
            fontFamily: 'var(--font-heading)', 
            fontSize: '1.25rem', 
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            lineHeight: 1
          }}>
            PixelVault AI
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>Intelligent Photo Management</span>
        </div>
      </Link>

      {/* Main Navigation */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {navItems.filter(item => !item.auth || user).map((item, idx) => (
          <NavLink
            key={idx}
            to={item.to}
            onClick={item.onClick}
            className={({ isActive }) => `sidebar-link ${isActive && !item.onClick ? 'active' : ''}`}
            end={item.to === '/'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {item.icon}
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className="sidebar-badge">{item.badge}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Storage Indicator */}
      {user && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Storage Used</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>24%</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.75rem' }}>
            2.45 GB of 10 GB
          </div>
          <div style={{ height: '6px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden', marginBottom: '1.25rem' }}>
            <div style={{ width: '24%', height: '100%', background: 'var(--color-accent)', borderRadius: '3px' }}></div>
          </div>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%', background: 'transparent', borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}>
            ✨ Upgrade Plan
          </button>
        </div>
      )}

      {/* Bottom Profile Info */}
      {user && (
        <div style={{ 
          marginTop: '1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          padding: '0.75rem',
          background: 'var(--color-bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--color-border)',
          cursor: 'pointer'
        }} onClick={handleLogout}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="avatar-placeholder" style={{ width: 36, height: 36 }}>
              {user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>Nithish Kumar</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Photographer</span>
            </div>
          </div>
          <ChevronDown size={16} color="var(--color-text-secondary)" />
        </div>
      )}

      <style>{`
        .sidebar-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          color: var(--color-text-primary);
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          transition: var(--transition-smooth);
        }
        .sidebar-link:hover {
          background: rgba(107, 112, 92, 0.05);
        }
        .sidebar-link.active {
          background: var(--color-accent);
          color: #FFFFFF;
          box-shadow: 0 4px 12px var(--color-accent-glow);
        }
        .sidebar-badge {
          background: rgba(107, 112, 92, 0.1);
          color: var(--color-accent);
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: 999px;
        }
        .sidebar-link.active .sidebar-badge {
          background: rgba(255,255,255,0.2);
          color: #FFFFFF;
        }
      `}</style>
    </aside>
  )
}
