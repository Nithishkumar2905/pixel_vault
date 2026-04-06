import { useState, useEffect } from 'react'
import photoService from '../services/photoService'

/**
 * useGallery — fetches a paginated list of photos from the backend.
 */
export function useGallery({ page = 1, limit = 24, sort = '-createdAt', userId } = {}) {
  const [photos, setPhotos]   = useState([])
  const [total, setTotal]     = useState(0)
  const [pages, setPages]     = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const params = { page, limit, sort }
    if (userId) params.userId = userId

    photoService
      .getAll(params)
      .then((res) => {
        if (cancelled) return
        const list = res.photos || res.data || []
        setPhotos(list)
        setTotal(res.pagination?.total ?? list.length)
        setPages(res.pagination?.pages ?? 1)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [page, limit, sort, userId])

  return { photos, total, pages, loading, error }
}

/**
 * usePhoto — fetches a single photo by id.
 */
export function usePhoto(id) {
  const [photo, setPhoto]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setError(null)

    photoService
      .getById(id)
      .then((res) => {
        if (!cancelled) setPhoto(res.photo || res)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [id])

  return { photo, setPhoto, loading, error }
}
