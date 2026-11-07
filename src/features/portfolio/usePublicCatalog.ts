import { useEffect, useState } from 'react'
import { works, type Work } from './portfolio-data'

export function usePublicCatalog() {
  const configured = Boolean(
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  )
  const [state, setState] = useState<{
    items: readonly Work[]
    status: 'loading' | 'ready' | 'error'
  }>({
    items: configured ? [] : works,
    status: configured ? 'loading' : 'ready',
  })
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    if (!configured) return
    let active = true
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30_000)
    void import('./public-catalog')
      .then(({ loadPublishedWorks }) => loadPublishedWorks(controller.signal))
      .then((items) => {
        if (active) setState({ items, status: 'ready' })
      })
      .catch(() => {
        if (active) setState({ items: [], status: 'error' })
      })
      .finally(() => clearTimeout(timeout))
    return () => {
      active = false
      clearTimeout(timeout)
      controller.abort()
    }
  }, [configured, revision])
  useEffect(() => {
    if (!configured) return
    const refresh = () => setRevision((value) => value + 1)
    const interval = setInterval(refresh, 45 * 60 * 1000)
    window.addEventListener('focus', refresh)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', refresh)
    }
  }, [configured])
  return {
    ...state,
    configured,
    retry: () => setRevision((value) => value + 1),
  }
}
