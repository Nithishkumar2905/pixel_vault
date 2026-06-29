import 'dotenv/config'
import Groq from 'groq-sdk'

export const analyzeImageWithVision = async (imageUrl) => {
  try {
    console.log('--- Vision AI Analysis Start ---')
    console.log('Target Image:', imageUrl)

    const apiKey = process.env.VISION_API_KEY
    if (!apiKey || apiKey === 'YOUR_VISION_API_KEY') {
      console.warn('VISION_API_KEY missing, using mock data.')
      return getMockVisionData()
    }

    const payload = {
      requests: [
        {
          image: { source: { imageUri: imageUrl } },
          features: [
            { type: "LABEL_DETECTION", maxResults: 10 },
            { type: "SAFE_SEARCH_DETECTION" },
            { type: "OBJECT_LOCALIZATION" },
            { type: "IMAGE_PROPERTIES" }
          ]
        }
      ]
    }

    const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok || data.error) {
       throw new Error(`Google Vision API Error: ${data.error?.message || response.statusText}`)
    }

    if (data.responses[0]?.error) {
      throw new Error(`Vision image error: ${data.responses[0].error.message}`)
    }

    const safeSearch = data.responses[0]?.safeSearchAnnotation
    let isExplicit = false
    if (safeSearch) {
      const badLevels = ['LIKELY', 'VERY_LIKELY']
      if (badLevels.includes(safeSearch.adult) || badLevels.includes(safeSearch.violence) || badLevels.includes(safeSearch.racy)) {
        isExplicit = true
      }
    }

    const labelAnnotations = data.responses[0]?.labelAnnotations || []
    const objectAnnotations = data.responses[0]?.localizedObjectAnnotations || []
    const labels = labelAnnotations.map(l => l.description)
    const objects = objectAnnotations.map(o => o.name)

    const allTags = [...new Set([...labels, ...objects])]

    return { tags: allTags, isExplicit }
  } catch (error) {
    console.error('Vision API Error:', error.message)
    return getMockVisionData()
  }
}

export const generateMetadataWithGroq = async (tags, imageUrl) => {
  try {
    console.log('--- Groq AI Metadata Generation Start ---')
    
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY') {
      console.warn('GROQ_API_KEY missing, using mock data.')
      return getMockGrokData(tags)
    }

    const groq = new Groq({ apiKey })

    const prompt = `You are an expert photography metadata generator. 
    Analyze these visual tags detected in an image: ${tags.join(', ')}.
    Generate professional metadata for this image in JSON format with exactly these keys:
    "caption": A professional, elegant caption (1 sentence).
    "description": A short detailed description (1-2 sentences).
    "keywords": Array of 5-8 SEO keywords as strings.
    "hashtags": Array of 5-8 social media hashtags as strings (including #).
    "album": A category album name (e.g., Nature, Portrait, Architecture, Wildlife, Street Photography, etc).`

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [
        { role: "system", content: "You output strict JSON only, without markdown formatting." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    })

    let resultText = completion.choices[0]?.message?.content?.trim() || '{}'

    const metadata = JSON.parse(resultText)
    return metadata

  } catch (error) {
    console.error('Groq API Error:', error.message)
    return getMockGrokData(tags)
  }
}

function getMockVisionData() {
  return {
    tags: ['Nature', 'Landscape', 'Photography', 'Sunset', 'Sky', 'Outdoors'],
    isExplicit: false
  }
}

function getMockGrokData(tags) {
  return {
    caption: 'A breathtaking capture of natural beauty.',
    description: `A stunning composition highlighting ${tags.slice(0, 3).join(', ')} captured in vibrant detail.`,
    keywords: [...tags.slice(0, 5), 'art', 'portfolio'],
    hashtags: tags.slice(0, 5).map(t => `#${t.replace(/\s+/g, '')}`),
    album: 'Nature'
  }
}
