import express from 'express'
import { uploadPhoto, updatePhotoStatus } from '../controllers/photoController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Process uploaded image URL (AI analysis and DB insert)
router.post('/process', protect, uploadPhoto)

// Update photo publish status, title, description
router.patch('/:id/status', protect, updatePhotoStatus)

export default router
