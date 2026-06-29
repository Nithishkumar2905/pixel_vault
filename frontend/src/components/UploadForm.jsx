import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, X, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react'
import photoService from '../services/photoService'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function UploadForm() {
  const navigate = useNavigate()
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [overallProgress, setOverallProgress] = useState(0)

  const onDrop = useCallback((accepted) => {
    if (accepted.length > 500) {
      toast.error('Maximum 500 images allowed per batch')
      return
    }
    
    const newFiles = accepted.map(f => ({
      file: f,
      id: Math.random().toString(36).substring(7),
      preview: URL.createObjectURL(f),
      status: 'pending', // pending, uploading, success, error
      progress: 0,
      error: null
    }))
    
    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] },
    multiple: true,
  })

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const handleBulkUpload = async () => {
    if (files.length === 0) return
    setUploading(true)
    let completed = 0;

    for (let i = 0; i < files.length; i++) {
      const fileObj = files[i]
      if (fileObj.status === 'success') {
        completed++;
        continue;
      }

      setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'uploading', progress: 50 } : f))

      try {
        const formData = new FormData()
        formData.append('image', fileObj.file)
        formData.append('title', fileObj.file.name.replace(/\.[^/.]+$/, ''))
        
        await photoService.upload(formData)
        
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'success', progress: 100 } : f))
        completed++;
      } catch (err) {
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'error', error: err.message } : f))
      }
      
      setOverallProgress(Math.round((completed / files.length) * 100))
    }

    setUploading(false)
    if (completed === files.length) {
      toast.success('All files uploaded successfully!')
      setTimeout(() => navigate('/workspace'), 1500)
    } else {
      toast.error(`Uploaded ${completed} of ${files.length} files.`)
    }
  }

  const handleCancel = () => {
    if (uploading) {
      toast.error('Upload in progress. Reload page to force cancel.')
      return
    }
    setFiles([])
    setOverallProgress(0)
  }

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: '2rem' }}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`upload-zone ${isDragActive ? 'active' : ''}`}
        style={{ 
          padding: '5rem 2rem', 
          border: '2px dashed',
          borderColor: isDragActive ? 'var(--color-accent)' : 'var(--color-border)',
          borderRadius: '16px', 
          textAlign: 'center', 
          cursor: 'pointer', 
          background: isDragActive ? 'rgba(107, 112, 92, 0.03)' : 'var(--color-bg-primary)',
          transition: 'all 0.3s ease',
          marginBottom: files.length > 0 ? '2rem' : 0
        }}
      >
        <input {...getInputProps()} />
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: 'var(--shadow-soft)',
          border: '1px solid var(--color-border)'
        }}>
          <UploadCloud size={32} color="var(--color-accent)" />
        </div>
        <h3 style={{ color: 'var(--color-text-primary)', fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 600 }}>
          {isDragActive ? 'Drop images here' : 'Drag & drop your images here'}
        </h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          or <span style={{ color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'underline' }}>browse files</span> from your computer
        </p>
      </div>

      {/* Progress & Actions */}
      {files.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
            <div>
              <h4 style={{ color: 'var(--color-text-primary)', margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: 600 }}>Uploading {files.length} file{files.length !== 1 && 's'}</h4>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                {uploading ? `${overallProgress}% completed` : 'Ready to upload'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleCancel} disabled={uploading} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', borderRadius: '12px' }}>
                Cancel
              </button>
              <button onClick={handleBulkUpload} disabled={uploading} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {uploading ? 'Processing...' : 'Start Upload'}
              </button>
            </div>
          </div>
          
          {uploading && (
            <div style={{ width: '100%', background: 'var(--color-bg-primary)', borderRadius: '999px', height: '6px', marginBottom: '1.5rem', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'var(--color-accent)', width: `${overallProgress}%`, transition: 'width 0.3s' }}></div>
            </div>
          )}

          <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.5rem' }}>
            {files.map(f => (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', background: 'var(--color-bg-primary)', padding: '0.75rem 1rem', borderRadius: '12px', gap: '1rem', border: '1px solid var(--color-border)' }}>
                <img src={f.preview} alt="preview" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '8px' }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ color: 'var(--color-text-primary)', fontSize: '0.9rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.25rem' }}>{f.file.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>{(f.file.size / 1024 / 1024).toFixed(2)} MB</span>
                    {f.status === 'uploading' && (
                      <div style={{ flex: 1, height: '4px', background: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${f.progress}%`, height: '100%', background: 'var(--color-accent)' }}></div>
                      </div>
                    )}
                  </div>
                </div>
                
                {f.status === 'pending' && (
                  <button onClick={() => removeFile(f.id)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: '0.5rem', display: 'flex' }} className="icon-btn-hover">
                    <X size={16} />
                  </button>
                )}
                {f.status === 'success' && <CheckCircle size={20} color="var(--color-success)" />}
                {f.status === 'error' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-error)' }}>
                    <AlertCircle size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .icon-btn-hover:hover { color: var(--color-error) !important; }
      `}</style>
    </div>
  )
}
