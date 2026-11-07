export function publicEnvironment(status) {
  const url = new URL(status.API_URL)
  if (
    url.protocol !== 'http:' ||
    !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error('A configuração automática aceita somente a API local.')
  }
  const key = status.PUBLISHABLE_KEY
  if (typeof key !== 'string' || !/^sb_publishable_[a-zA-Z0-9_-]+$/.test(key)) {
    throw new Error(
      'Chave publicável local ausente ou inválida. Nenhum arquivo foi criado.',
    )
  }
  return `VITE_SUPABASE_URL=${url.origin}\nVITE_SUPABASE_PUBLISHABLE_KEY=${key}\n`
}
