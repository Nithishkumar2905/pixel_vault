import { supabase, createScopedClient } from '../config/supabase.js'
import { analyzeImage } from '../services/visionService.js'

export const uploadPhoto = async (req, res, next) => {
  try {
    const { title, description, tags, imageUrl } = req.body

    if (!imageUrl) return res.status(400).json({ success: false, message: 'Image URL is required' })

    // Immediately insert the photo without tags and description first to ensure it succeeds fast
    const photoData = {
      user_id: req.user.id,
      image_url: imageUrl,
      title: title || 'Untitled',
      description: description || null,
      tags: tags ? tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [],
    }

    const scopedClient = createScopedClient(req.token)
    
    // Ensure the user exists in public.users to satisfy the foreign key constraint
    const { data: userRecord } = await scopedClient.from('users').select('id').eq('id', req.user.id).maybeSingle()
    if (!userRecord) {
      const baseName = req.user.user_metadata?.username || req.user.email.split('@')[0]
      await scopedClient.from('users').insert({
        id: req.user.id,
        email: req.user.email,
        username: `${baseName}_${Math.floor(Math.random() * 10000)}`,
        name: req.user.user_metadata?.name || baseName,
      })
    }

    const { data: result, error } = await scopedClient.from('photos').insert(photoData).select()
    if (error) throw error

    const photo = result?.[0] || result

    // Asynchronously trigger AI processing in the background (fire-and-forget for speed, but logged)
    analyzeImage(imageUrl).then(async (aiData) => {
      console.log('AI Analysis Result background success:', aiData)
      
      const finalDescription = description || aiData.description
      const userTags = tags ? tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : []
      const mergedTags = [...new Set([...userTags, ...aiData.tags])]
      const finalTags = mergedTags.length > 0 ? mergedTags : ['photography', 'portfolio']
      
      const { error: updateError } = await createScopedClient(req.token)
        .from('photos')
        .update({ description: finalDescription, tags: finalTags })
        .eq('id', photo.id)
      
      if (updateError) console.error('Error updating photo with AI tags:', updateError.message)
      else console.log('Successfully updated photo with AI tags for ID:', photo.id)
    }).catch(aiError => {
       console.error('Background API error failed completely:', aiError.message)
    })

    res.status(201).json({ success: true, photo, message: 'Photo uploaded successfully. AI processing in background.' })
  } catch (err) { next(err) }
}
