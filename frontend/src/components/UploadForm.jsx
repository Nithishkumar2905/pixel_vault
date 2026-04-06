import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Image as ImageIcon, X, Sparkles, Tag, FileText } from 'lucide-react'
import photoService from '../services/photoService'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function UploadForm() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback((accepted) => {
    const f = accepted[0]
    if (!f) return
    if (f.size > 20 * 1024 * 1024) {
      toast.error('File must be under 20MB')
      return
    }
    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(f)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] },
    multiple: false,
  })

  const clearFile = () => {
    setFile(null)
    setPreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) { toast.error('Please select an image'); return }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('title', title || file.name.replace(/\.[^/.]+$/, ''))
      formData.append('description', description)
      formData.append('tags', tags)
      const res = await photoService.upload(formData)
      toast.success('Photo uploaded successfully! 🎉')
      navigate(`/photos/${res.photo?.id || ''}`)
    } catch (err) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <form
      id="upload-form"
      onSubmit={handleSubmit}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      {/* Drop Zone */}
      {!preview ? (
        <div
          {...getRootProps()}
          className={`upload-zone ${isDragActive ? 'active' : ''}`}
          id="upload-dropzone"
        >
          <input {...getInputProps()} id="upload-file-input" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(99,102,241,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6366F1',
              }}
            >
              <Upload size={32} />
            </div>
            <div>
              <p style={{ color: '#E2E8F0', fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>
                {isDragActive ? 'Drop your photo here!' : 'Drag & drop your photo'}
              </p>
              <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>
                or <span style={{ color: '#6366F1', fontWeight: 600, cursor: 'pointer' }}>browse</span> to select
              </p>
              <p style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                JPG, PNG, WebP, GIF — max 20MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#111827' }}>
          <img
            src={preview}
            alt="Preview"
            id="photo-preview"
            style={{
              width: '100%',
              maxHeight: 450,
              objectFit: 'contain',
              display: 'block',
              borderRadius: 16,
            }}
          />
          <button
            type="button"
            onClick={clearFile}
            className="btn btn-danger btn-sm"
            id="remove-photo-btn"
            style={{
              position: 'absolute',
              top: '0.75rem',
              right: '0.75rem',
              borderRadius: '50%',
              padding: '0.4rem',
            }}
            aria-label="Remove photo"
          >
            <X size={16} />
          </button>
          <div
            style={{
              position: 'absolute',
              bottom: '0.75rem',
              left: '0.75rem',
              background: 'rgba(2,6,23,0.8)',
              backdropFilter: 'blur(8px)',
              borderRadius: 8,
              padding: '0.375rem 0.75rem',
              fontSize: '0.75rem',
              color: '#94A3B8',
            }}
          >
            <ImageIcon size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
            {file?.name} · {(file?.size / 1024 / 1024).toFixed(2)} MB
          </div>
        </div>
      )}

      {/* Fields */}
      <div className="input-group">
        <label className="input-label" htmlFor="photo-title">
          <FileText size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
          Title <span style={{ color: '#475569', fontSize: '0.75rem' }}>(optional)</span>
        </label>
        <input
          id="photo-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your photo a title…"
          className="input-field"
          maxLength={120}
        />
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="photo-description">
          <FileText size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
          Description <span style={{ color: '#475569', fontSize: '0.75rem' }}>(optional)</span>
        </label>
        <textarea
          id="photo-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your photo…"
          className="input-field"
          rows={3}
          style={{ resize: 'vertical', minHeight: 80 }}
          maxLength={500}
        />
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="photo-tags">
          <Tag size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
          Tags <span style={{ color: '#475569', fontSize: '0.75rem' }}>(comma-separated)</span>
        </label>
        <input
          id="photo-tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="nature, landscape, sunset…"
          className="input-field"
        />
      </div>

      {/* AI note */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          padding: '0.875rem 1rem',
          background: 'rgba(245,158,11,0.06)',
          border: '1px solid rgba(245,158,11,0.15)',
          borderRadius: 12,
        }}
      >
        <Sparkles size={18} style={{ color: '#F59E0B', flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ color: '#FCD34D', fontSize: '0.8rem', fontWeight: 600 }}>AI Auto-Tagging</p>
          <p style={{ color: '#94A3B8', fontSize: '0.75rem', marginTop: '0.125rem' }}>
            After upload, Google Cloud Vision AI will automatically generate tags, descriptions, and similar photo recommendations.
          </p>
        </div>
      </div>

      <button
        type="submit"
        id="upload-submit-btn"
        className="btn btn-primary btn-lg"
        disabled={uploading || !file}
        style={{ alignSelf: 'flex-start', minWidth: 160 }}
      >
        {uploading ? (
          <>
            <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
            Uploading…
          </>
        ) : (
          <>
            <Upload size={18} />
            Upload Photo
          </>
        )}
      </button>
    </form>
  )
}
