import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const isDev = import.meta.env.DEV
const basename = isDev ? '' : '/hrmis-web-beta'
const baseUrl = isDev ? 'http://localhost:5173' : 'https://paulkuff.github.io'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    redirectTo: `${baseUrl}${basename}/auth/callback`,
  },
})
