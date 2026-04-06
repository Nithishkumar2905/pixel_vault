import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user || null)
      if (session) {
        localStorage.setItem('pv_token', session.access_token)
      } else {
        localStorage.removeItem('pv_token')
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user || null)
      if (session) {
        localStorage.setItem('pv_token', session.access_token)
      } else {
        localStorage.removeItem('pv_token')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }, [])

  const register = useCallback(async ({ email, password, username, name, bio, location, portfolio_link }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          name: name || username,
          bio: bio || null,
          location: location || null,
          portfolio_link: portfolio_link || null,
          avatar_url: null,
        }
      }
    })
    if (error) throw error

    return data
  }, [])

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Logged out successfully')
    }
  }, [])

  const loginWithGoogle = useCallback(async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) throw error
    return data
  }, [])

  const updateUser = useCallback(async (updates) => {
    if (!user) return
    const { data, error } = await supabase.from('users').update(updates).eq('id', user.id).select()
    if (error) throw error
    // Note: To fully sync, we might need to rely on the table instead of auth.user metadata for profile data
    return data?.[0] || data
  }, [user])

  return (
    <AuthContext.Provider value={{ user, session, loading, login, register, logout, updateUser, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
