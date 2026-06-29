import 'dotenv/config'

export const analyzeImage = async (imageUrl) => {
  try {
    console.log('--- Vision AI Analysis Start ---')
    console.log('Target Image:', imageUrl)

    const apiKey = process.env.VISION_API_KEY
    if (!apiKey || apiKey === 'YOUR_VISION_API_KEY') {
      throw new Error('VISION_API_KEY is missing or invalid in environment variables.')
    }

    const payload = {
      requests: [
        {
          image: {
            source: {
              imageUri: imageUrl
            }
          },
          features: [
            {
              type: "LABEL_DETECTION",
              maxResults: 10
            },
            {
              type: "SAFE_SEARCH_DETECTION"
            }
          ]
        }
      ]
    }

    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok || data.error) {
       throw new Error(`Google Vision API Error: ${data.error?.message || response.statusText}`)
    }

    // Also check for per-image errors inside responses array
    if (data.responses[0]?.error) {
      throw new Error(`Vision image error: ${data.responses[0].error.message}`)
    }

    const safeSearch = data.responses[0]?.safeSearchAnnotation
    let isExplicit = false
    if (safeSearch) {
      const badLevels = ['LIKELY', 'VERY_LIKELY']
      if (badLevels.includes(safeSearch.adult) || badLevels.includes(safeSearch.violence) || badLevels.includes(safeSearch.racy)) {
        isExplicit = true
        console.log('Vision AI: Explicit content detected.', safeSearch)
      }
    }

    const labels = data.responses[0]?.labelAnnotations || []

    if (labels.length === 0) {
      console.log('Vision AI: No labels detected in image.')
      return { tags: [], description: '', isExplicit }
    }

    // Convert labels to a simple array of strings as tags
    const tags = labels.map((label) => label.description.toLowerCase().replace(/\s+/g, '-'))

    // Generate a simple description from top 4 tags
    const topLabels = labels.slice(0, 4).map((label) => label.description.toLowerCase())
    const description = topLabels.length > 0 ? `A view showcasing ${topLabels.join(', ')}.` : ''

    console.log('Vision AI successfully extracted tags:', tags)
    return { tags, description, isExplicit }
  } catch (error) {
    console.error('Vision API Error:', error.message)

    // Smart Fallback without hardcoding default captions
    const urlParts = imageUrl.toLowerCase().split('/')
    const filenameWithExt = urlParts[urlParts.length - 1]
    const filename = filenameWithExt.split(/[?.]/)[0] // Handle query params and extension

    // Extract dynamic tags from the filename, filtering out purely numeric strings (like timestamps) 
    // and suspicious alphanumeric IDs (like hex strings)
    const nameTags = filename.split(/[-_]/)
      .filter(word => {
        const isTooShort = word.length <= 2;
        const isPureNumber = /^\d+$/.test(word);
        const isRandomId = word.length > 10 && /\d/.test(word) && /[a-z]/.test(word);
        return !isTooShort && !isPureNumber && !isRandomId;
      })
    
    let contextualTags = [...nameTags].slice(0, 6)

    // If no tags extracted from filename, use sensible defaults
    if (contextualTags.length === 0) {
      contextualTags = ['photography', 'pixelvault', 'visuals']
    }

    let fallbackDesc = ''
    if (nameTags.length > 0) {
      fallbackDesc = `Image featuring ${nameTags.join(', ')}.`
    } else {
      fallbackDesc = 'A beautiful photograph captured on PixelVault.'
    }

    return {
      tags: contextualTags,
      description: fallbackDesc,
      isExplicit: false,
      isFallback: true
    }
  }
}
