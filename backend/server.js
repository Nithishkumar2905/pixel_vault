import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
import { errorHandler, notFound } from './middleware/errorHandler.js'

// Route imports
import photoRoutes from './routes/photos.js'

const app = express()
const PORT = process.env.PORT || 5000

// ===== MIDDLEWARE =====
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false,
}))

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

// ===== HEALTH CHECK =====
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    status: 'ok',
    version: '1.0.0',
    service: 'PixelVault API',
    timestamp: new Date().toISOString(),
  })
})

// ===== ROUTES =====
app.use('/api/photos', photoRoutes)

// ===== ERROR HANDLING & PRODUCTION SERVE =====

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (process.env.NODE_ENV === 'production') {
  // Serve static files from the frontend dist folder
  const frontendDistPath = path.join(__dirname, '../frontend/dist')
  app.use(express.static(frontendDistPath))

  // Any route that isn't caught by API goes to index.html
  app.use((req, res) => {
    res.sendFile(path.resolve(frontendDistPath, 'index.html'))
  })
} else {
  app.get('/', (req, res) => res.send('API is running... Please start frontend using Vite.'))
}

// Map 404 to API routes specifically
app.use('/api', notFound)
app.use(errorHandler)

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════╗
  ║     📷 PixelVault API Server      ║
  ╠═══════════════════════════════════╣
  ║  Status:  Running                 ║
  ║  Port:    ${PORT}                    ║
  ║  Mode:    ${process.env.NODE_ENV || 'development'}             ║
  ║  Health:  /api/health             ║
  ╚═══════════════════════════════════╝
  `)
})

export default app
