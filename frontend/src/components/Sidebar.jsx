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

export default function Sidebar({ isExpanded, setIsExpanded }) {
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

  const navGroups = [
    {
      title: '🏠 Home',
      shortTitle: '🏠',
      items: [
        { to: '/workspace', icon: <Home size={20} />, label: 'Dashboard', auth: true },
        { to: '#workspace-folder', icon: <FolderOpen size={20} />, label: 'My Workspace', auth: true, onClick: (e) => handleComingSoon(e, 'My Workspace') },
        { to: '/upload', icon: <UploadCloud size={20} />, label: 'Upload', auth: true, badge: '20+' },
      ]
    },
    {
      title: '📸 Library',
      shortTitle: '📸',
      items: [
        { to: '/search', icon: <Search size={20} />, label: 'AI Search', auth: false },
        { to: '/albums', icon: <ImageIcon size={20} />, label: 'AI Albums', auth: true },
        { to: '/favorites', icon: <Heart size={20} />, label: 'Favorites', auth: true },
      ]
    },
    {
      title: '🌍 Community',
      shortTitle: '🌍',
      items: [
        { to: '/', icon: <LayoutGrid size={20} />, label: 'Public Gallery', auth: false },
      ]
    },
    {
      title: '⚙ Account',
      shortTitle: '⚙',
      items: [
        { to: user ? `/profile/${user.id}` : '/login', icon: <User size={20} />, label: 'Profile', auth: false },
        { to: '/settings', icon: <Settings size={20} />, label: 'Settings', auth: true },
        { to: '#logout', icon: <LogOut size={20} />, label: 'Logout', auth: true, onClick: (e) => { e.preventDefault(); handleLogout(); } },
      ]
    }
  ]

  const handleNavClick = (itemOnClick, e) => {
    if (itemOnClick) itemOnClick(e);
    if (isExpanded) {
      setIsExpanded(false);
    }
  };

  return (
    <aside className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`} style={{
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      width: isExpanded ? '280px' : '72px',
      background: 'var(--color-bg-secondary)',
      borderRight: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      padding: isExpanded ? '2rem 1.5rem' : '2rem 0.5rem',
      zIndex: 50,
      overflowY: 'auto',
      overflowX: 'hidden',
      transition: 'var(--transition-smooth)'
    }}>
      {/* Logo */}
      <Link to="/" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem', 
        textDecoration: 'none',
        marginBottom: '2.5rem',
        paddingLeft: isExpanded ? '0.5rem' : '0',
        justifyContent: isExpanded ? 'flex-start' : 'center'
      }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: 'var(--color-text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#DDB892',
          flexShrink: 0
        }}>
          <Aperture size={22} />
        </div>
        {isExpanded && (
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
        )}
      </Link>

      {/* Main Navigation */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: isExpanded ? 'stretch' : 'center' }}>
        {navGroups.map((group, groupIdx) => {
          const visibleItems = group.items.filter(item => !item.auth || user);
          if (visibleItems.length === 0) return null;
          
          return (
            <div key={groupIdx} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%', alignItems: isExpanded ? 'stretch' : 'center' }}>
              <div style={{
                fontSize: isExpanded ? '0.8rem' : '1rem',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                paddingLeft: isExpanded ? '1rem' : '0',
                marginBottom: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isExpanded ? 'flex-start' : 'center',
                gap: '0.5rem'
              }} title={!isExpanded ? group.title : ''}>
                {isExpanded ? group.title : group.shortTitle}
              </div>
              {visibleItems.map((item, idx) => (
                <div key={idx} className="sidebar-link-wrapper" title={!isExpanded ? item.label : ''}>
                  <NavLink
                    to={item.to}
                    onClick={(e) => handleNavClick(item.onClick, e)}
                    className={({ isActive }) => `sidebar-link ${isActive && !item.onClick && item.to !== '#logout' ? 'active' : ''}`}
                    end={item.to === '/'}
                    style={{
                      justifyContent: isExpanded ? 'space-between' : 'center',
                      padding: isExpanded ? '0.75rem 1rem' : '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className="sidebar-icon">{item.icon}</span>
                      {isExpanded && <span>{item.label}</span>}
                    </div>
                    {isExpanded && item.badge && (
                      <span className="sidebar-badge">{item.badge}</span>
                    )}
                  </NavLink>
                </div>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Storage Indicator */}
      {user && isExpanded && (
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
        <Link to={`/profile/${user.id}`} title={!isExpanded ? "Profile" : ""} style={{ 
          marginTop: '1.5rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: isExpanded ? 'space-between' : 'center',
          padding: isExpanded ? '0.75rem' : '0.5rem',
          background: isExpanded ? 'var(--color-bg-card)' : 'transparent',
          borderRadius: '16px',
          border: isExpanded ? '1px solid var(--color-border)' : 'none',
          textDecoration: 'none',
          cursor: 'pointer'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="avatar-placeholder" style={{ width: 36, height: 36 }}>
              {user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            {isExpanded && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>Nithish Kumar</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Photographer</span>
              </div>
            )}
          </div>
        </Link>
      )}

      <style>{`
        .sidebar-link-wrapper {
          position: relative;
          width: 100%;
          display: flex;
          justify-content: center;
        }
        .sidebar-link {
          display: flex;
          align-items: center;
          border-radius: 12px;
          color: var(--color-text-primary);
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          transition: var(--transition-smooth);
          width: 100%;
        }
        .sidebar.collapsed .sidebar-link {
          width: 48px;
          height: 48px;
          border-radius: 12px;
        }
        .sidebar-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition-smooth);
        }
        .sidebar-link:hover {
          background: rgba(107, 112, 92, 0.05);
          transform: translateY(-1px);
        }
        .sidebar-link:hover .sidebar-icon {
          color: var(--color-accent);
        }
        .sidebar-link.active {
          background: rgba(107, 112, 92, 0.1);
          color: var(--color-accent);
          box-shadow: 0 2px 8px rgba(107, 112, 92, 0.05);
        }
        .sidebar-link.active .sidebar-icon {
          color: var(--color-accent);
        }
        
        .sidebar-badge {
          background: rgba(107, 112, 92, 0.1);
          color: var(--color-accent);
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: 999px;
        }
        
        /* Custom Tooltip styling handled natively via 'title' for now to keep it lightweight, 
           or could be done with a tooltip class. */
      `}</style>
    </aside>
  )
}
