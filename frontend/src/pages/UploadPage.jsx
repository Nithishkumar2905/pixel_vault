import { Camera, Sparkles, Upload } from 'lucide-react'
import UploadForm from '../components/UploadForm'

export default function UploadPage() {
  return (
    <div className="fade-in" style={{ padding: '3rem 1rem' }}>
      <div className="container" style={{ maxWidth: 800 }}>
        {/* Header */}
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 20, background: 'var(--color-bg-secondary)', marginBottom: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <Upload size={28} color="var(--color-text-primary)" />
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '1rem', letterSpacing: '-1px' }}>
            Upload to Vault
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
            Share your best shots with the PixelVault community. Our AI will automatically generate tags and intelligent metadata.
          </p>
        </div>

        {/* Tips */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '3rem',
          }}
        >
          {[
            { icon: <Camera size={18} />, tip: 'High-res images (min 800px) work best for AI analysis' },
            { icon: <Sparkles size={18} />, tip: 'Vision AI automatically tags and describes your photos' },
            { icon: <Upload size={18} />, tip: 'Supports JPG, PNG, WebP — max 20MB per file' },
          ].map(({ icon, tip }, i) => (
            <div
              key={i}
              className="glass-card"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.875rem',
                padding: '1.25rem',
              }}
            >
              <span style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: 2 }}>{icon}</span>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>{tip}</p>
            </div>
          ))}
        </div>

        {/* Upload form */}
        <div className="glass-card" style={{ padding: '3rem' }}>
          <UploadForm />
        </div>
      </div>
    </div>
  )
}
