import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

export const supabaseUrl = process.env.SUPABASE_URL
export const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY !== 'YOUR_SERVICE_ROLE_KEY' 
  ? process.env.SUPABASE_SERVICE_ROLE_KEY 
  : process.env.SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export const createScopedClient = (token) => {
  return createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  })
}
