import { createClient } from '@supabase/supabase-js'
import { readSupabaseConfig } from '../../lib/supabase-config'
import type { Work } from './portfolio-data'
import { selectPublishedWorks } from './catalog-selection'
import { fetchAllRows as pages } from '../../lib/pagination'

const config = readSupabaseConfig(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
)
// A vitrine não herda a sessão do administrador.
const client = config
  ? createClient(config.url, config.key, {
      global: {
        fetch: (input, init) =>
          fetch(input, {
            ...init,
            signal: AbortSignal.any([
              AbortSignal.timeout(15_000),
              ...(init?.signal ? [init.signal] : []),
            ]),
          }),
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
        storageKey: 'portfolio-public',
      },
    })
  : null

export async function loadPublishedCatalog(signal: AbortSignal) {
  if (!client) throw new Error('Configuração indisponível.')
  const api = client
  const works = await pages((start, end) =>
    api
      .from('works')
      .select('id,slug,published_version_id')
      .not('published_version_id', 'is', null)
      .order('sort_order')
      .order('id')
      .range(start, end)
      .abortSignal(signal),
  )
  if (!works.length) return { items: [], incomplete: false }
  const output: Work[] = []
  let incomplete = false
  for (let offset = 0; offset < works.length; offset += 50) {
    const batch = works.slice(offset, offset + 50)
    const ids = batch.map((work) => work.published_version_id as string)
    const [versions, photos, categoryResult] = await Promise.all([
      pages((start, end) =>
        api
          .from('work_versions')
          .select('id,title,description,category_id,cover_photo_id')
          .in('id', ids)
          .order('id')
          .range(start, end)
          .abortSignal(signal),
      ),
      pages((start, end) =>
        api
          .from('photos')
          .select('id,version_id,storage_path,alt_text,width,height,sort_order')
          .in('version_id', ids)
          .eq('upload_state', 'ready')
          .is('removed_at', null)
          .order('sort_order')
          .order('id')
          .range(start, end)
          .abortSignal(signal),
      ),
      api.from('categories').select('id,slug').abortSignal(signal),
    ])
    if (categoryResult.error) throw new Error('Falha ao carregar categorias.')
    const urls = new Map<string, string>()
    for (let index = 0; index < photos.length; index += 100) {
      if (signal.aborted) throw new Error('Consulta cancelada')
      const signed = await api.storage.from('portfolio').createSignedUrls(
        photos.slice(index, index + 100).map((photo) => photo.storage_path),
        3600,
      )
      if (signed.error) throw new Error('Falha ao carregar fotografias.')
      for (const item of signed.data) {
        if (item.path && item.signedUrl && !item.error)
          urls.set(item.path, item.signedUrl)
      }
    }
    signal.throwIfAborted()
    const selection = selectPublishedWorks(
      batch,
      versions,
      photos,
      categoryResult.data,
      urls,
    )
    output.push(...selection.items)
    incomplete ||= selection.incomplete
  }
  return { items: output, incomplete }
}

export async function loadPublishedWorks(signal: AbortSignal): Promise<Work[]> {
  return (await loadPublishedCatalog(signal)).items
}
