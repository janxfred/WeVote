import { createClient } from '@supabase/supabase-js'

// Vite exposes env vars via import.meta.env. Prefer VITE_ prefixed vars which are embedded at build time.
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) || (import.meta.env.SUPABASE_URL as string) || ''
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || (import.meta.env.SUPABASE_ANON_KEY as string) || ''

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Warning will show during build/runtime if vars are missing
  // eslint-disable-next-line no-console
  console.warn('Missing Supabase environment variables: VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (or SUPABASE_URL / SUPABASE_ANON_KEY)')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Diagnostic token: will appear in the built bundle if this module is included in the deployment.
// Remove this log after verification.
// eslint-disable-next-line no-console
console.info('WEVOTE_SUPABASE_CLIENT_BUILT', { present: !!SUPABASE_URL, urlPreview: SUPABASE_URL ? SUPABASE_URL.slice(0, 40) : null })

export default supabase
