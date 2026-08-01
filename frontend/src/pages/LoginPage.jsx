import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Camera, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
)

export default function LoginPage() {
  const { login, loginWithGoogle, user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
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
    if (!email) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email address'
    if (!form.password) e.password = 'Password is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await login(form.email.trim(), form.password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'Login failed')
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
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(107,112,92,0.07) 0%, transparent 70%)',
          top: '10%',
          left: '20%',
          pointerEvents: 'none',
        }}
      />

      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: 600,
          padding: '2.5rem',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6B705C, #A98467)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 8px 24px rgba(107, 112, 92, 0.35)',
            }}
          >
            <Camera size={24} style={{ color: '#FFFFFF' }} />
          </div>
          <h1
            style={{
              fontFamily: 'Poppins, sans-serif',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#FFFFFF',
              marginBottom: '0.5rem',
            }}
          >
            Welcome back
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            Sign in to your PixelVault account
          </p>
        </div>

        <form onSubmit={handleSubmit} id="login-form" noValidate>
          {/* Email */}
          <div className="input-group">
            <label className="input-label" htmlFor="login-email">
              <Mail size={13} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Email address
            </label>
            <input
              id="login-email"
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
          <div className="input-group">
            <label className="input-label" htmlFor="login-password">
              <Lock size={13} style={{ display: 'inline', marginRight: '0.25rem' }} />
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={set('password')}
                placeholder="Your password"
                className="input-field"
                autoComplete="current-password"
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                id="toggle-password-btn"
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: 'absolute',
                  right: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#475569',
                  padding: 0,
                }}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {errors.password && <p className="input-error">{errors.password}</p>}
          </div>

          <button
            type="submit"
            id="login-submit-btn"
            className="btn btn-primary"
            disabled={loading || googleLoading}
            style={{ width: '100%', padding: '0.875rem', fontSize: '0.95rem', marginTop: '0.5rem' }}
          >
            {loading ? (
              <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in…</>
            ) : (
              <>Sign in <ArrowRight size={17} /></>
            )}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          <span style={{ padding: '0 1rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
        </div>

        <button
          type="button"
          onClick={async () => {
            setGoogleLoading(true)
            try {
              await loginWithGoogle()
            } catch (err) {
              toast.error(err.message || 'Google login failed')
              setGoogleLoading(false)
            }
          }}
          className="btn btn-secondary"
          disabled={loading || googleLoading}
          style={{ width: '100%', padding: '0.875rem', fontSize: '0.95rem', background: '#FFFFFF', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'center', gap: '0.5rem', borderRadius: '14px', boxShadow: 'var(--shadow-soft)', transition: 'var(--transition-smooth)' }}
        >
          {googleLoading ? (
            <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Connecting to Google…</>
          ) : (
            <>
              <GoogleIcon />
              Continue with Google
            </>
          )}
        </button>

        <hr className="divider" />

        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{ color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}
            id="goto-register-link"
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  )
}
