import { Camera, Sparkles, Upload, FileImage, Info } from 'lucide-react'
import UploadForm from '../components/UploadForm'

export default function UploadPage() {
  return (
    <div className="fade-in" style={{ padding: '2rem 1rem' }}>
      <div className="container" style={{ maxWidth: 1280 }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem', letterSpacing: '-1px' }}>
            Upload to Vault
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem' }}>
            Drop your images below. Our AI will automatically generate intelligent tags and metadata.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem' }}>
          {/* Main Upload Column */}
          <div style={{ flex: '1 1 700px', minWidth: 0 }}>
            <UploadForm />
          </div>

          {/* Right Sidebar Column */}
          <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Upload Summary (Mockup Donut Chart) */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HardDrive size={18} color="var(--color-accent)" /> Upload Summary
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '2rem 0' }}>
                <div style={{ width: '140px', height: '140px', borderRadius: '50%', border: '16px solid var(--color-bg-secondary)', borderTopColor: 'var(--color-accent)', borderRightColor: 'var(--color-accent)', transform: 'rotate(45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <div style={{ transform: 'rotate(-45deg)', textAlign: 'center' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>24%</span>
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Used</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Used Storage</span>
                <span style={{ fontWeight: 600 }}>2.45 GB</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Available</span>
                <span style={{ fontWeight: 600 }}>7.55 GB</span>
              </div>
            </div>

            {/* Upload Tips */}
            <div className="glass-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Info size={18} color="var(--color-secondary-accent)" /> Upload Tips
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <li style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(107, 112, 92, 0.1)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Camera size={14} />
                  </div>
                  High-resolution images (min 1200px) yield better AI analysis results.
                </li>
                <li style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(169, 132, 103, 0.1)', color: 'var(--color-secondary-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sparkles size={14} />
                  </div>
                  Our Vision AI automatically tags, categorizes, and describes your photos.
                </li>
                <li style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(188, 71, 73, 0.1)', color: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileImage size={14} />
                  </div>
                  Supported formats: JPG, PNG, WEBP. Max file size is 20MB per image.
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

function HardDrive({ size, color }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="2" y1="12" y2="12" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /><line x1="6" x2="6.01" y1="16" y2="16" /><line x1="10" x2="10.01" y1="16" y2="16" /></svg>
}
