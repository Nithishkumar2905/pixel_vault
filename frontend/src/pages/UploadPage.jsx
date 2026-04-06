import { Camera, Sparkles, Upload } from 'lucide-react'
import UploadForm from '../components/UploadForm'

export default function UploadPage() {
  return (
    <div className="fade-in" style={{ minHeight: 'calc(100vh - 68px)', padding: '3rem 1rem' }}>
      <div className="container" style={{ maxWidth: 720 }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(99,102,241,0.4)',
              }}
            >
              <Upload size={20} style={{ color: '#FFFFFF' }} />
            </div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}>
              Upload Photo
            </h1>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem' }}>
            Share your best shots with the PhotoVault community. AI will auto-generate tags and descriptions.
          </p>
        </div>

        {/* Tips */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '0.875rem',
            marginBottom: '2rem',
          }}
        >
          {[
            { icon: <Camera size={16} />, tip: 'High-res images (min 800px) work best' },
            { icon: <Sparkles size={16} />, tip: 'AI tags generated automatically after upload' },
            { icon: <Upload size={16} />, tip: 'Supports JPG, PNG, WebP, GIF — max 20MB' },
          ].map(({ icon, tip }, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.625rem',
                padding: '0.875rem',
                background: 'rgba(99,102,241,0.06)',
                border: '1px solid rgba(99,102,241,0.12)',
                borderRadius: 12,
              }}
            >
              <span style={{ color: '#6366F1', flexShrink: 0, marginTop: 1 }}>{icon}</span>
              <p style={{ color: '#94A3B8', fontSize: '0.78rem', lineHeight: 1.4 }}>{tip}</p>
            </div>
          ))}
        </div>

        {/* Upload form */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <UploadForm />
        </div>
      </div>
    </div>
  )
}
