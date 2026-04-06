import { Link } from 'react-router-dom'
import { Camera, Github, Twitter, Instagram, Heart } from 'lucide-react'

const NAV_COLS = [
  {
    heading: 'Platform',
    links: [
      { label: 'Explore Gallery', to: '/' },
      { label: 'Search Photos', to: '/search' },
      { label: 'Upload Your Work', to: '/upload' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { label: 'Sign In', to: '/login' },
      { label: 'Create Account', to: '/register' },
      { label: 'My Profile', to: '/profile' },
    ],
  },
  {
    heading: 'About',
    links: [
      { label: 'How It Works', to: '/' },
      { label: 'AI Tagging', to: '/' },
      { label: 'Cloudinary Storage', to: '/' },
    ],
  },
]

const SOCIALS = [
  { icon: <Github size={17} />, href: '#', label: 'GitHub' },
  { icon: <Twitter size={17} />, href: '#', label: 'Twitter' },
  { icon: <Instagram size={17} />, href: '#', label: 'Instagram' },
]

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid rgba(99,102,241,0.12)',
        background: 'rgba(2,6,23,0.95)',
        backdropFilter: 'blur(16px)',
        padding: '3rem 1.5rem 1.5rem',
        marginTop: 'auto',
      }}
    >
      <div className="container" style={{ maxWidth: 1280 }}>
        {/* Top row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem',
          }}
        >
          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                marginBottom: '0.875rem',
              }}
            >
              <Camera size={20} style={{ color: '#6366F1' }} />
              <span
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(90deg, #6366F1, #F59E0B)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                PixelVault
              </span>
            </Link>
            <p
              style={{
                color: '#475569',
                fontSize: '0.82rem',
                lineHeight: 1.7,
                maxWidth: 220,
                marginBottom: '1.25rem',
              }}
            >
              Store, Discover, and Explore Photography with AI. An open platform for creators.
            </p>
            {/* Social links */}
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              {SOCIALS.map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#94A3B8',
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(99,102,241,0.18)'
                    e.currentTarget.style.color = '#FFFFFF'
                    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(99,102,241,0.08)'
                    e.currentTarget.style.color = '#94A3B8'
                    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)'
                  }}
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {NAV_COLS.map((col) => (
            <div key={col.heading}>
              <p
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '1rem',
                }}
              >
                {col.heading}
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {col.links.map(({ label, to }) => (
                  <li key={label}>
                    <Link
                      to={to}
                      style={{
                        color: '#64748B',
                        fontSize: '0.83rem',
                        textDecoration: 'none',
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#A5B4FC')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: '1px solid rgba(99,102,241,0.08)',
            paddingTop: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <p style={{ color: '#334155', fontSize: '0.78rem' }}>
            © {new Date().getFullYear()} PixelVault. All rights reserved.
          </p>
          <p
            style={{
              color: '#334155',
              fontSize: '0.78rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            Made with <Heart size={12} style={{ color: '#F43F5E', fill: '#F43F5E' }} /> for photographers
          </p>
        </div>
      </div>
    </footer>
  )
}
