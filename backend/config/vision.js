import vision from '@google-cloud/vision'
import fs from 'fs'
import path from 'path'

const credsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 'google-credentials.json'
let client = null

try {
  if (fs.existsSync(credsPath)) {
    client = new vision.ImageAnnotatorClient({ keyFilename: credsPath })
    console.log('✅ Vision AI Client Initialized')
  } else {
    console.warn('⚠️ Vision AI: Credentials file missing. AI features will be disabled/mocked.')
  }
} catch (err) {
  console.error('❌ Vision AI: Failed to initialize client:', err.message)
}

export const visionClient = client
