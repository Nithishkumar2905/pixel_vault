import api from './api'
import { supabase } from '../lib/supabase'

const photoService = {
  getAll: async (params = {}) => {
    const { page = 1, limit = 20, sort = '-created_at', userId, q, includeDrafts = false } = params
    const orderCol = sort.includes('created_at') ? 'created_at' : 'created_at'
    const ascending = !sort.startsWith('-')

    let query = supabase.from('photos').select('*, users!inner(name, username, avatar_url, email, portfolio_link)', { count: 'exact' })
    
    if (!includeDrafts) {
      query = query.eq('publish_status', 'published')
    }
    
    if (userId) query = query.eq('user_id', userId)
    if (q) {
      const safeTerm = q.trim().replace(/[,{}]/g, '') // remove characters that break PostgREST array syntax
      query = query.or(`title.ilike.%${safeTerm}%,description.ilike.%${safeTerm}%,tags.cs.{${safeTerm.toLowerCase()}},keywords.cs.{${safeTerm.toLowerCase()}},hashtags.cs.{${safeTerm.toLowerCase()}}`)
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: photos, error, count } = await query.order(orderCol, { ascending }).range(from, to)
    if (error) throw error

    // Fetch likes if user is logged in
    let result = photos
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const { data: userLikes } = await supabase
        .from('likes')
        .select('photo_id')
        .eq('user_id', session.user.id)
        .in('photo_id', photos.map(p => p.id))
      const likedSet = new Set((userLikes || []).map(l => l.photo_id))
      result = photos.map(p => ({ ...p, photographer: p.users, isLiked: likedSet.has(p.id) }))
    } else {
      result = photos.map(p => ({ ...p, photographer: p.users }))
    }

    return { photos: result, pagination: { total: count, page, pages: Math.ceil(count / limit), limit } }
  },

  getById: async (id) => {
    const { data: photo, error } = await supabase
      .from('photos')
      .select('*, users!inner(name, username, avatar_url, email, bio, portfolio_link)')
      .eq('id', id)
      .single()
    if (error) throw error

    photo.photographer = photo.users

    let isLiked = false
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const { data: like } = await supabase.from('likes').select('id').eq('user_id', session.user.id).eq('photo_id', id).maybeSingle()
      if (like) isLiked = true
    }

    return { ...photo, isLiked }
  },

  // Upload image to Supabase Storage and process via Backend (enables Vision AI)
  upload: async (formData) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated — please log in')

    const file = formData.get('image')
    if (!file) throw new Error('No image provided')

    // 1. Generate safe unique file path
    const extension = (file.name.split('.').pop() || '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const timestamp = Date.now()
    const filePath = `photos/${timestamp}.${extension}`

    // 2. Upload to Supabase Storage
    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Supabase storage upload error:', uploadError)
        throw new Error(uploadError.message || 'Failed to upload image to storage')
      }
    } catch (err) {
      console.error('Exception during Supabase upload:', err)
      throw new Error(`Upload exception: ${err.message}`)
    }

    // 3. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    // 4. Send to backend for DB insertion and Vision AI processing
    const payload = {
      title: formData.get('title'),
      description: formData.get('description'),
      tags: formData.get('tags'),
      imageUrl: publicUrl
    }

    const response = await fetch('/api/photos/process', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const res = await response.json()
    if (!response.ok) throw new Error(res.message || 'Server rejected processing')
    return res
  },

  save: async (data) => {
    // 1. Get the authenticated user directly (more reliable than just session)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Authentication error matching user:', authError)
      throw new Error('Not authenticated — please log in again')
    }

    // 2. Prepare payload ensuring user.id is correctly passed
    const photoData = {
      user_id: user.id,
      image_url: data.imageUrl,
      title: data.title || 'Untitled',
      description: data.description,
      tags: data.tags ? (Array.isArray(data.tags) ? data.tags : data.tags.split(',')).map(t => t.trim().toLowerCase()) : [],
    }
    
    // 3. Insert and log potential errors
    const { data: photo, error } = await supabase.from('photos').insert(photoData).select().single()
    if (error) {
      console.error('Database insertion error for photo:', error)
      throw error
    }
    
    return photo
  },

  update: async (id, data) => {
    const { data: photo, error } = await supabase.from('photos').update(data).eq('id', id).select()
    if (error) throw error
    return photo?.[0] || photo
  },

  delete: async (id) => {
    const { error } = await supabase.from('photos').delete().eq('id', id)
    if (error) throw error
    return { success: true }
  },

  search: async (query, params = {}) => {
    return await photoService.getAll({ ...params, q: query })
  },

  getFavorites: async (params = {}) => {
    const { page = 1, limit = 20, sort = '-created_at' } = params
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const { data: likes, error: likesError, count } = await supabase
      .from('likes')
      .select('photo_id', { count: 'exact' })
      .eq('user_id', session.user.id)
      
    if (likesError) throw likesError
    if (!likes || likes.length === 0) return { photos: [], pagination: { total: 0 } }
    
    const photoIds = likes.map(l => l.photo_id)

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: photos, error } = await supabase
      .from('photos')
      .select('*, users!inner(name, username, avatar_url, email, portfolio_link)')
      .in('id', photoIds)
      
    if (error) throw error

    const result = photos.map(p => ({ ...p, photographer: p.users, isLiked: true }))

    return { photos: result, pagination: { total: count, page, pages: Math.ceil(count / limit), limit } }
  },

  like: async (id) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const { error } = await supabase.from('likes').insert({ user_id: session.user.id, photo_id: id })
    if (error && error.code !== '23505') throw error

    const { data: p } = await supabase.from('photos').select('likes_count').eq('id', id).single()
    await supabase.from('photos').update({ likes_count: (p?.likes_count || 0) + 1 }).eq('id', id)
    return { success: true }
  },

  unlike: async (id) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('Not authenticated')

    const { error } = await supabase.from('likes').delete().eq('user_id', session.user.id).eq('photo_id', id)
    if (error) throw error

    const { data: p } = await supabase.from('photos').select('likes_count').eq('id', id).single()
    await supabase.from('photos').update({ likes_count: Math.max(0, (p?.likes_count || 0) - 1) }).eq('id', id)
    return { success: true }
  },

  download: async (id) => {
    const { data: p } = await supabase.from('photos').select('download_count').eq('id', id).single()
    if (p) {
      await supabase.from('photos').update({ download_count: (p.download_count || 0) + 1 }).eq('id', id)
    }
    return { success: true }
  },

  getUserPhotos: async (userId) => {
    return await photoService.getAll({ userId, includeDrafts: true })
  },
}

export default photoService
