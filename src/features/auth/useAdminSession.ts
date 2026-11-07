import { useEffect, useState } from 'react'
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import { isRecoverySession } from '../../lib/supabase'
import { checkAdministrator } from './authorization'

type Access = {
  userId: string
  token: string
  status: 'allowed' | 'denied' | 'error'
  revision: number
}

export function useAdminSession(client: SupabaseClient) {
  const [identity, setIdentity] = useState<{
    session: Session | null
    ready: boolean
    recovery: boolean
    error: boolean
  }>({ session: null, ready: false, recovery: false, error: false })
  const [access, setAccess] = useState<Access | null>(null)
  const [revision, setRevision] = useState(0)

  useEffect(() => {
    let active = true
    let events = 0
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (!active) return
      events += 1
      // Não executar chamadas Supabase dentro deste callback: ele usa o lock do Auth.
      setIdentity((previous) => ({
        session,
        ready: true,
        error: false,
        recovery:
          session !== null &&
          (event === 'PASSWORD_RECOVERY' ||
            isRecoverySession(session.user.id) ||
            (event !== 'SIGNED_IN' && previous.recovery)),
      }))
    })
    const initialEvents = events
    void client.auth
      .getSession()
      .then(({ data, error }) => {
        if (active && events === initialEvents) {
          setIdentity({
            session: data.session,
            ready: true,
            recovery: isRecoverySession(data.session?.user.id),
            error: Boolean(error),
          })
        }
      })
      .catch(() => {
        if (active && events === initialEvents)
          setIdentity({
            session: null,
            ready: true,
            recovery: false,
            error: true,
          })
      })
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [client])

  const session = identity.session
  useEffect(() => {
    if (!session) return
    const { access_token: token, user } = session
    let active = true
    const controller = new AbortController()
    async function verify() {
      try {
        const allowed = await checkAdministrator(
          client,
          user.id,
          controller.signal,
        )
        if (active)
          setAccess({
            userId: user.id,
            token,
            revision,
            status: allowed ? 'allowed' : 'denied',
          })
      } catch {
        if (active)
          setAccess({ userId: user.id, token, revision, status: 'error' })
      }
    }
    void verify()
    return () => {
      active = false
      controller.abort()
    }
  }, [client, session, revision])

  useEffect(() => {
    const recheck = () => setRevision((value) => value + 1)
    window.addEventListener('focus', recheck)
    return () => window.removeEventListener('focus', recheck)
  }, [])

  const status = !identity.ready
    ? 'loading'
    : !session
      ? 'signed-out'
      : access?.token !== session.access_token || access.revision !== revision
        ? 'loading'
        : access.status
  return {
    ...identity,
    status,
    hasVerifiedAccess: Boolean(
      session &&
      access?.userId === session.user.id &&
      access.status === 'allowed',
    ),
    retry: () => setRevision((value) => value + 1),
  }
}
