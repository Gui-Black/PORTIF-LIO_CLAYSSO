import { createClient } from '@supabase/supabase-js'
import { readSupabaseConfig } from './supabase-config'

const configuration = readSupabaseConfig(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
)

export const supabase = configuration
  ? createClient(configuration.url, configuration.key, {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: (input, init) => {
          const signal =
            init?.signal ?? (input instanceof Request ? input.signal : null)
          return fetch(input, {
            ...init,
            signal: AbortSignal.any([
              AbortSignal.timeout(15_000),
              ...(signal ? [signal] : []),
            ]),
          })
        },
      },
    })
  : null

// Registrar imediatamente: o retorno PKCE pode terminar antes da montagem React.
let recoveryUserId: string | null = null
supabase?.auth.onAuthStateChange((event, session) => {
  if (event === 'PASSWORD_RECOVERY') recoveryUserId = session?.user.id ?? null
  else if (event === 'SIGNED_OUT' || event === 'SIGNED_IN')
    recoveryUserId = null
})

export function isRecoverySession(userId: string | undefined) {
  return Boolean(userId && userId === recoveryUserId)
}
