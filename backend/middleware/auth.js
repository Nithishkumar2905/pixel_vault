import { supabase } from '../config/supabase.js'

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' })
    }

    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'User not found or token invalid' })
    }

    req.user = user
    req.token = token
    next()
  } catch (err) {
    next(err)
  }
}
