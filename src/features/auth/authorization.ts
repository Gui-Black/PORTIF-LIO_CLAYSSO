import type { SupabaseClient } from '@supabase/supabase-js'

export async function checkAdministrator(
  client: SupabaseClient,
  expectedUserId: string,
  signal: AbortSignal,
) {
  const user = await client.auth.getUser()
  if (user.error || user.data.user?.id !== expectedUserId)
    throw new Error('Sessão inválida')
  const result = await client
    .rpc('current_user_is_administrator')
    .abortSignal(signal)
  if (result.error) throw new Error('Não foi possível confirmar a permissão')
  return result.data === true
}
