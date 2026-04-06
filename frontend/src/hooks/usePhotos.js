import { useState, useCallback } from 'react'
import photoService from '../services/photoService'
import toast from 'react-hot-toast'

/**
 * usePhotos — CRUD & interaction helpers for photos
 */
export function usePhotos() {
  const [loading, setLoading] = useState(false)

  const uploadPhoto = useCallback(async (formData, onProgress) => {
    setLoading(true)
    try {
      const data = await photoService.upload(formData, onProgress)
      toast.success('Photo uploaded!')
      return data.photo
    } catch (err) {
      toast.error(err.message || 'Upload failed')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const likePhoto = useCallback(async (photoId, currentlyLiked) => {
    try {
      if (currentlyLiked) {
        return await photoService.unlike(photoId)
      }
      return await photoService.like(photoId)
    } catch (err) {
      toast.error(err.message || 'Action failed')
      throw err
    }
  }, [])

  const downloadPhoto = useCallback(async (photoId, imageUrl, title) => {
    try {
      await photoService.download(photoId)
      // Trigger browser download
      const link = document.createElement('a')
      link.href = imageUrl
      link.download = title || 'pixelvault-photo'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Download started!')
    } catch (err) {
      // Still try to open in new tab even if count update fails
      window.open(imageUrl, '_blank')
    }
  }, [])

  const deletePhoto = useCallback(async (photoId) => {
    setLoading(true)
    try {
      await photoService.delete(photoId)
      toast.success('Photo deleted')
    } catch (err) {
      toast.error(err.message || 'Delete failed')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, uploadPhoto, likePhoto, downloadPhoto, deletePhoto }
}
