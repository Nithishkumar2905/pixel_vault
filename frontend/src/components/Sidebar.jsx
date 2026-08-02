import { NavLink, Link, useNavigate } from 'react-router-dom'
import {
  Aperture,
  Home,
  UploadCloud,
  Search,
  Image as ImageIcon,
  Heart,
  Settings,
  LogOut,
  LayoutGrid,
  MapPin,
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

  const navGroups = [
    {
      title: 'Main',
      shortTitle: '📌',
      items: [
        { to: '/', icon: <LayoutGrid size={20} />, label: 'Public Gallery', auth: false },
        { to: '/workspace', icon: <Home size={20} />, label: 'My Vault', auth: true },
        { to: '/upload', icon: <UploadCloud size={20} />, label: 'Upload Photos', auth: true },
      ],
    },
    {
      title: 'Library',
      shortTitle: '📸',
      items: [
        { to: '/search', icon: <Search size={20} />, label: 'AI Search', auth: false },
        { to: '/places', icon: <MapPin size={20} />, label: 'EXIF Map', auth: false },
        { to: '/albums', icon: <ImageIcon size={20} />, label: 'AI Albums', auth: true },
        { to: '/favorites', icon: <Heart size={20} />, label: 'Favorites', auth: true },
      ],
    },
    {
      title: 'Account',
      shortTitle: '⚙',
      items: [
        { to: '/settings', icon: <Settings size={20} />, label: 'Settings', auth: true },
        {
          to: '#logout',
          icon: <LogOut size={20} />,
          label: 'Logout',
          auth: true,
          onClick: (e) => {
            e.preventDefault()
            handleLogout()
          },
        },
      ],
    },
  ]

  const handleNavClick = (itemOnClick, e) => {
    if (itemOnClick) itemOnClick(e)
    if (isExpanded) {
      setIsExpanded(false)
    }
  }

  return (
    <aside
      className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}
      style={{
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
        transition: 'var(--transition-smooth)',
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          textDecoration: 'none',
          marginBottom: '2.5rem',
          paddingLeft: isExpanded ? '0.5rem' : '0',
          justifyContent: isExpanded ? 'flex-start' : 'center',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'var(--color-text-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#DDB892',
            flexShrink: 0,
          }}
        >
          <Aperture size={22} />
        </div>
        {isExpanded && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                lineHeight: 1,
              }}
            >
              PixelVault AI
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>
              Intelligent Photo Management
            </span>
          </div>
        )}
      </Link>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          alignItems: isExpanded ? 'stretch' : 'center',
        }}
      >
        {navGroups.map((group, groupIdx) => {
          const visibleItems = group.items.filter((item) => !item.auth || user)
          if (visibleItems.length === 0) return null

          return (
            <div
              key={groupIdx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                width: '100%',
                alignItems: isExpanded ? 'stretch' : 'center',
              }}
            >
              <div
                style={{
                  fontSize: isExpanded ? '0.75rem' : '0.9rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--color-text-muted)',
                  paddingLeft: isExpanded ? '1rem' : '0',
                  marginBottom: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isExpanded ? 'flex-start' : 'center',
                }}
                title={!isExpanded ? group.title : ''}
              >
                {isExpanded ? group.title : group.shortTitle}
              </div>
              {visibleItems.map((item, idx) => (
                <div key={idx} className="sidebar-link-wrapper" title={!isExpanded ? item.label : ''}>
                  <NavLink
                    to={item.to}
                    onClick={(e) => handleNavClick(item.onClick, e)}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive && !item.onClick && item.to !== '#logout' ? 'active' : ''}`
                    }
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
                  </NavLink>
                </div>
              ))}
            </div>
          )
        })}
      </nav>

      {/* Storage Indicator */}
      {user && isExpanded && (
        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>Storage Used</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>24%</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
            2.45 GB of 10 GB
          </div>
          <div style={{ height: '5px', background: 'var(--color-border)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: '24%', height: '100%', background: 'var(--color-accent)', borderRadius: '3px' }}></div>
          </div>
        </div>
      )}

      {/* Bottom Profile Info */}
      {user && (
        <Link
          to={`/profile/${user.id}`}
          title={!isExpanded ? 'Profile' : ''}
          style={{
            marginTop: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isExpanded ? 'space-between' : 'center',
            padding: isExpanded ? '0.75rem' : '0.5rem',
            background: isExpanded ? 'var(--color-bg-card)' : 'transparent',
            borderRadius: '16px',
            border: isExpanded ? '1px solid var(--color-border)' : 'none',
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="avatar-placeholder" style={{ width: 36, height: 36 }}>
              {(user.user_metadata?.full_name?.[0] || user.user_metadata?.username?.[0] || user.email?.[0] || 'U').toUpperCase()}
            </div>
            {isExpanded && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
                  {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.user_metadata?.username || user?.email?.split('@')[0] || 'User'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                  @{user?.user_metadata?.username || user?.email?.split('@')[0] || 'user'}
                </span>
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
      `}</style>
    </aside>
  )
}
