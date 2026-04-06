import express from 'express'
import { uploadPhoto } from '../controllers/photoController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Process uploaded image URL (AI analysis and DB insert)
router.post('/process', protect, uploadPhoto)

export default router
