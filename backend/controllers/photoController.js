import { supabase, createScopedClient } from '../config/supabase.js'
import { analyzeImage } from '../services/visionService.js'

export const uploadPhoto = async (req, res, next) => {
  try {
    const { title, description, tags, imageUrl } = req.body

    if (!imageUrl) return res.status(400).json({ success: false, message: 'Image URL is required' })

    // Synchronously check the image using Vision AI before inserting it into DB
    console.log('Analyzing image for explicit content and generating tags...');
    const aiData = await analyzeImage(imageUrl);

    if (aiData.isExplicit) {
      console.log('Blocked upload due to explicit content.');
      return res.status(400).json({ 
        success: false, 
        message: 'Explicit content (such as nude, sexual, or violent content) detected. Please change the image.' 
      });
    }

    const finalDescription = description || aiData.description;
    const userTags = tags ? tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean) : [];
    const mergedTags = [...new Set([...userTags, ...(aiData.tags || [])])];
    const finalTags = mergedTags.length > 0 ? mergedTags : ['photography', 'portfolio'];

    const photoData = {
      user_id: req.user.id,
      image_url: imageUrl,
      title: title || 'Untitled',
      description: finalDescription || null,
      tags: finalTags,
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

    res.status(201).json({ success: true, photo, message: 'Photo uploaded successfully.' })
  } catch (err) { next(err) }
}
