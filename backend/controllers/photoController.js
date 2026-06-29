import { supabase, createScopedClient } from '../config/supabase.js'
import { analyzeImageWithVision, generateMetadataWithGrok } from '../services/ai.service.js'

export const uploadPhoto = async (req, res, next) => {
  try {
    const { title, description, tags, imageUrl } = req.body

    if (!imageUrl) return res.status(400).json({ success: false, message: 'Image URL is required' })

    // Synchronously check the image using Vision AI before inserting it into DB
    console.log('Analyzing image for explicit content and generating tags...');
    const visionData = await analyzeImageWithVision(imageUrl);

    if (visionData.isExplicit) {
      console.log('Blocked upload due to explicit content.');
      return res.status(400).json({ 
        success: false, 
        message: 'Explicit content (such as nude, sexual, or violent content) detected. Please change the image.' 
      });
    }

    // Generate Grok Metadata based on tags
    console.log('Generating AI metadata with Grok...');
    const grokMetadata = await generateMetadataWithGrok(visionData.tags, imageUrl);
    
    // Process user tags: split, trim, lowercase, and remove duplicates/empty
    const userTags = tags 
      ? tags.split(/[,]+/).map(t => t.trim().toLowerCase()).filter(t => t.length > 1) 
      : [];
      
    // Merge AI tags, avoiding duplicates with user tags
    const aiTags = (visionData.tags || []).map(t => t.toLowerCase());
    const mergedTags = [...new Set([...userTags, ...aiTags])];
    
    // Ensure we have at least some tags
    const finalTags = mergedTags.length > 0 ? mergedTags.slice(0, 15) : ['photography', 'portfolio', 'pixelvault'];

    const photoData = {
      user_id: req.user.id,
      image_url: imageUrl,
      title: title || grokMetadata.caption || 'Untitled',
      description: description || grokMetadata.description || null,
      tags: finalTags,
      keywords: grokMetadata.keywords || [],
      hashtags: grokMetadata.hashtags || [],
      album: grokMetadata.album || 'Uncategorized',
      publish_status: 'draft',
      cloudinary_public_id: req.body.cloudinary_public_id || null
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

export const updatePhotoStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { publish_status, title, description } = req.body;
    const scopedClient = createScopedClient(req.token);

    const updateData = {};
    if (publish_status) updateData.publish_status = publish_status;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await scopedClient
      .from('photos')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Photo not found or not authorized.' });
    }

    res.status(200).json({ success: true, photo: data[0] });
  } catch (err) { next(err) }
}
