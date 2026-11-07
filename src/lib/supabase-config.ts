export function readSupabaseConfig(url: unknown, key: unknown) {
  if (typeof url !== 'string' || typeof key !== 'string' || !url || !key) {
    return null
  }
  try {
    const endpoint = new URL(url)
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(
      endpoint.hostname,
    )
    if (
      endpoint.protocol !== 'https:' &&
      !(local && endpoint.protocol === 'http:')
    )
      return null
    if (
      endpoint.username ||
      endpoint.password ||
      endpoint.search ||
      endpoint.hash ||
      endpoint.pathname !== '/'
    )
      return null
    // Somente chave publicável. Nunca permitir service_role/secret no frontend.
    if (!key.startsWith('sb_publishable_') || /\s/.test(key)) return null
    return { url: endpoint.origin, key }
  } catch {
    return null
  }
}
