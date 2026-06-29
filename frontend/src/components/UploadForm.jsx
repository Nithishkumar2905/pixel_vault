import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, CheckCircle, AlertCircle, FileImage } from 'lucide-react'
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
    // Basic cancel: just clear pending/error files if not currently uploading
    if (uploading) {
      toast.error('Upload in progress. Reload page to force cancel.')
      return
    }
    setFiles([])
    setOverallProgress(0)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`upload-zone ${isDragActive ? 'active' : ''}`}
        style={{ padding: '3rem', border: '2px dashed #4F46E5', borderRadius: '16px', textAlign: 'center', cursor: 'pointer', background: isDragActive ? 'rgba(79, 70, 229, 0.1)' : 'rgba(17, 24, 39, 0.5)' }}
      >
        <input {...getInputProps()} />
        <Upload size={48} color="#6366F1" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>
          {isDragActive ? 'Drop files here' : 'Drag & drop photos or folders'}
        </h3>
        <p style={{ color: '#9ca3af' }}>Supports multiple files (max 500 images per batch)</p>
      </div>

      {/* Progress & Actions */}
      {files.length > 0 && (
        <div style={{ background: '#1F2937', padding: '1.5rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ color: '#fff', margin: 0 }}>Upload Queue ({files.length} files)</h4>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleCancel} disabled={uploading} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: '#374151', color: '#fff', border: 'none' }}>
                Clear All
              </button>
              <button onClick={handleBulkUpload} disabled={uploading} className="btn btn-primary" style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: '#4F46E5', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {uploading ? 'Uploading...' : 'Start Upload'}
              </button>
            </div>
          </div>
          
          {uploading && (
            <div style={{ width: '100%', background: '#374151', borderRadius: '4px', height: '8px', marginBottom: '1rem', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#4F46E5', width: `${overallProgress}%`, transition: 'width 0.3s' }}></div>
            </div>
          )}

          <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {files.map(f => (
              <div key={f.id} style={{ display: 'flex', alignItems: 'center', background: '#111827', padding: '0.75rem', borderRadius: '8px', gap: '1rem' }}>
                <img src={f.preview} alt="preview" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: '4px' }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ color: '#fff', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.file.name}</div>
                  <div style={{ color: '#9ca3af', fontSize: '0.75rem' }}>{(f.file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
                
                {f.status === 'pending' && <button onClick={() => removeFile(f.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={20} /></button>}
                {f.status === 'uploading' && <span style={{ color: '#60a5fa', fontSize: '0.85rem' }}>Uploading {f.progress}%</span>}
                {f.status === 'success' && <CheckCircle size={20} color="#10b981" />}
                {f.status === 'error' && <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}><AlertCircle size={20} /><span style={{ fontSize: '0.75rem', maxWidth: '100px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={f.error}>{f.error}</span></div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
