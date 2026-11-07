const demoWorkId = '20000000-0000-4000-8000-000000000001'
const demoVersionId = '30000000-0000-4000-8000-000000000001'
const expectedCategories = [
  'ensaios',
  'casamentos',
  'aniversarios',
  'eventos',
  'produtos',
]

function requireCondition(condition, message) {
  if (!condition) throw new Error(message)
}

function readConnection(status) {
  let endpoint
  try {
    endpoint = new URL(status?.API_URL)
  } catch {
    throw new Error('A CLI não retornou uma API_URL válida.')
  }
  requireCondition(
    endpoint.protocol === 'http:' &&
      ['127.0.0.1', 'localhost', '[::1]'].includes(endpoint.hostname) &&
      endpoint.pathname === '/' &&
      !endpoint.username &&
      !endpoint.password &&
      !endpoint.search &&
      !endpoint.hash,
    'A verificação aceita somente uma API HTTP no próprio computador.',
  )
  const publicKey = status.PUBLISHABLE_KEY || status.ANON_KEY
  const secretKey = status.SECRET_KEY || status.SERVICE_ROLE_KEY
  requireCondition(
    typeof publicKey === 'string' &&
      publicKey.length > 0 &&
      typeof secretKey === 'string' &&
      secretKey.length > 0,
    'A CLI não retornou as chaves locais necessárias. Não compartilhe sua saída de status.',
  )
  return { endpoint, publicKey, secretKey }
}

export async function verifyLocalServices(
  status,
  { request = fetch, report = console.log } = {},
) {
  const { endpoint, publicKey, secretKey } = readConnection(status)

  async function get(path, key, label) {
    const headers = { apikey: key }
    // As chaves novas não são JWTs; apenas as legadas usam Bearer.
    if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`
    let response
    try {
      response = await request(new URL(path, endpoint), {
        method: 'GET',
        headers,
        redirect: 'error',
        signal: AbortSignal.timeout(8000),
      })
    } catch {
      throw new Error(
        `${label}: conexão indisponível, redirecionamento ou tempo esgotado. Aguarde o término de supabase:start.`,
      )
    }
    requireCondition(
      response.ok,
      `${label}: HTTP ${response.status}. Confira se a inicialização terminou sem erros.`,
    )
    try {
      return await response.json()
    } catch {
      throw new Error(`${label}: resposta JSON inválida.`)
    }
  }

  await get('/auth/v1/health', publicKey, 'Saúde do Auth')
  report('OK: serviço Auth respondendo (login ainda não testado).')

  const categories = await get(
    '/rest/v1/categories?select=slug',
    publicKey,
    'Categorias públicas',
  )
  requireCondition(
    Array.isArray(categories) &&
      expectedCategories.every((slug) =>
        categories.some((category) => category.slug === slug),
      ),
    'Categorias: faltam dados do seed esperado. Nenhum dado foi alterado.',
  )
  report('OK: as cinco categorias do seed estão acessíveis ao visitante.')

  const workPath = `/rest/v1/works?id=eq.${demoWorkId}&select=id,published_version_id`
  const versionPath = `/rest/v1/work_versions?id=eq.${demoVersionId}&select=id,sealed_at`
  const privilegedWork = await get(
    workPath,
    secretKey,
    'Existência do trabalho demonstrativo',
  )
  const privilegedVersion = await get(
    versionPath,
    secretKey,
    'Existência do rascunho demonstrativo',
  )
  requireCondition(
    Array.isArray(privilegedWork) &&
      privilegedWork.length === 1 &&
      privilegedWork[0].id === demoWorkId &&
      privilegedWork[0].published_version_id === null &&
      Array.isArray(privilegedVersion) &&
      privilegedVersion.length === 1 &&
      privilegedVersion[0].id === demoVersionId &&
      privilegedVersion[0].sealed_at === null,
    'O rascunho original do seed está ausente ou foi alterado. Revise os dados; não execute reset automaticamente.',
  )
  for (const path of [workPath, versionPath]) {
    const rows = await get(path, publicKey, 'Privacidade do rascunho')
    requireCondition(
      Array.isArray(rows) && rows.length === 0,
      'Falha de privacidade: o visitante consegue ler o rascunho demonstrativo.',
    )
  }
  report(
    'OK: trabalho e versão demonstrativos existem e estão ocultos ao visitante.',
  )

  const bucket = await get(
    '/storage/v1/bucket/portfolio',
    secretKey,
    'Bucket portfolio',
  )
  requireCondition(
    bucket?.id === 'portfolio' && bucket.public === false,
    'O bucket portfolio está ausente ou não está privado.',
  )
  report('OK: serviço Storage respondendo e bucket portfolio privado.')
  report(
    'Verificação inicial concluída, somente com leituras. Login, uploads, URLs assinadas e concorrência ainda precisam de testes reais.',
  )
}
