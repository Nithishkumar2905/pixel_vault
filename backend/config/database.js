import mongoose from 'mongoose'

const connectDB = async () => {
  const uri = process.env.MONGODB_URI

  // Skip connection if URI is still a placeholder
  if (!uri || uri.includes('<username>') || uri.includes('xxxxx')) {
    console.warn('⚠️  MongoDB URI not configured — skipping DB connection. Cloudinary uploads will still work.')
    return
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    })
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message)
    console.warn('⚠️  Server will continue without database. Photo/auth routes will not work.')
    // Don't exit — allow Cloudinary upload route to function independently
  }
}

export default connectDB
