import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Camera, Eye, EyeOff, ArrowRight, Check, MapPin, Globe, FileText } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const REQUIREMENTS = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'Contains uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'Contains a number', test: (v) => /\d/.test(v) },
]

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
)

export default function RegisterPage() {
  const { register, loginWithGoogle, user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', confirmPassword: '', bio: '', location: '', portfolio_link: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  const validate = () => {
    const e = {}
    const email = form.email.trim()
    const username = form.username.trim()

    if (!username) e.username = 'Username is required'
    else if (username.length < 3) e.username = 'Username must be at least 3 characters'
    else if (!/^[a-zA-Z0-9_]+$/.test(username)) e.username = 'Only letters, numbers, underscores'

    if (!email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email address'

    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'At least 8 characters required'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await register({ ...form, email: form.email.trim(), username: form.username.trim() })
      toast.success('Account created! Welcome to PixelVault 🎉')
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setErrors((er) => ({ ...er, [field]: '' }))
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 68px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)',
          top: '-10%',
          right: '10%',
          pointerEvents: 'none',
        }}
      />

      <div className="glass-card" style={{ width: '100%', maxWidth: 480, padding: '2.5rem', position: 'relative' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366F1, #F59E0B)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
            }}
          >
            <Camera size={24} style={{ color: '#FFFFFF' }} />
          </div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>
            Create your account
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            Join thousands of photographers on PixelVault
          </p>
        </div>

        <form onSubmit={handleSubmit} id="register-form" noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Full Name */}
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" htmlFor="reg-name">
                <User size={13} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Full Name <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                id="reg-name"
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder="John Doe"
                className="input-field"
                autoComplete="name"
              />
            </div>

            {/* Username */}
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" htmlFor="reg-username">
                <User size={13} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Username
              </label>
              <input
                id="reg-username"
                type="text"
                value={form.username}
                onChange={set('username')}
                placeholder="johndoe"
                className="input-field"
                autoComplete="username"
              />
              {errors.username && <p className="input-error">{errors.username}</p>}
            </div>
          </div>

          {/* Email */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" htmlFor="reg-email">
              <Mail size={13} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Email address
            </label>
            <input
              id="reg-email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="you@example.com"
              className="input-field"
              autoComplete="email"
            />
            {errors.email && <p className="input-error">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" htmlFor="reg-password">
              <Lock size={13} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="Create a strong password"
                className="input-field"
                autoComplete="new-password"
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                id="reg-toggle-password"
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0 }}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password && <p className="input-error">{errors.password}</p>}

            {/* Password strength */}
            {form.password && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
                {REQUIREMENTS.map((req) => (
                  <div key={req.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: req.test(form.password) ? '#10B981' : '#474769' }}>
                    <Check size={11} />
                    {req.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" htmlFor="reg-confirm-password">
              <Lock size={13} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Confirm password
            </label>
            <input
              id="reg-confirm-password"
              type={showPass ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              placeholder="Repeat your password"
              className="input-field"
              autoComplete="new-password"
            />
            {errors.confirmPassword && <p className="input-error">{errors.confirmPassword}</p>}
          </div>

          <div style={{ height: 1, background: '#1E293B', margin: '0.5rem 0' }} />

          {/* Bio */}
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label" htmlFor="reg-bio">
              <FileText size={13} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Bio <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              id="reg-bio"
              value={form.bio}
              onChange={set('bio')}
              placeholder="Tell us about yourself and your photography style..."
              className="input-field"
              rows={2}
              style={{ resize: 'vertical' }}
              maxLength={300}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Location */}
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" htmlFor="reg-loc">
                <MapPin size={13} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Location <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                id="reg-loc"
                type="text"
                value={form.location}
                onChange={set('location')}
                placeholder="City, Country"
                className="input-field"
              />
            </div>

            {/* Portfolio Link */}
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" htmlFor="reg-portfolio">
                <Globe size={13} style={{ display: 'inline', marginRight: '0.25rem' }} />
                Portfolio Link <span style={{ color: '#475569', fontSize: '0.75rem', fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                id="reg-portfolio"
                type="url"
                value={form.portfolio_link}
                onChange={set('portfolio_link')}
                placeholder="https://myphoto.com"
                className="input-field"
              />
            </div>
          </div>

          <button
            type="submit"
            id="register-submit-btn"
            className="btn btn-primary"
            disabled={loading || googleLoading}
            style={{ width: '100%', padding: '0.875rem', fontSize: '0.95rem', marginTop: '1rem' }}
          >
            {loading ? (
              <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating account…</>
            ) : (
              <>Create Account <ArrowRight size={17} /></>
            )}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: 1, background: '#1E293B' }} />
          <span style={{ padding: '0 1rem', color: '#64748B', fontSize: '0.85rem' }}>or</span>
          <div style={{ flex: 1, height: 1, background: '#1E293B' }} />
        </div>

        <button
          type="button"
          onClick={async () => {
            setGoogleLoading(true)
            try {
              await loginWithGoogle()
            } catch (err) {
              toast.error(err.message || 'Google registration failed')
              setGoogleLoading(false)
            }
          }}
          className="btn btn-secondary"
          disabled={loading || googleLoading}
          style={{ width: '100%', padding: '0.875rem', fontSize: '0.95rem', background: '#0F172A', color: '#F8FAFC', border: '1px solid #1E293B', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
        >
          {googleLoading ? (
            <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Connecting to Google…</>
          ) : (
            <>
              <GoogleIcon />
              Sign up with Google
            </>
          )}
        </button>

        <hr className="divider" style={{ marginTop: '2rem' }} />

        <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#A5B4FC', fontWeight: 600, textDecoration: 'none' }} id="goto-login-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
