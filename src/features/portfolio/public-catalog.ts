import { createClient } from '@supabase/supabase-js'
import { readSupabaseConfig } from '../../lib/supabase-config'
import { categories, type Work } from './portfolio-data'
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

export async function loadPublishedWorks(signal: AbortSignal): Promise<Work[]> {
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
  if (!works.length) return []
  const output: Work[] = []
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
        if (!item.path || !item.signedUrl || item.error)
          throw new Error('Fotografia indisponível.')
        urls.set(item.path, item.signedUrl)
      }
    }
    for (const work of batch) {
      const version = versions.find(
        (entry) => entry.id === work.published_version_id,
      )
      if (!version) continue
      const category = categoryResult.data.find(
        (entry) => entry.id === version.category_id,
      )
      const knownCategory = categories.find(
        (entry) => entry.slug === category?.slug,
      )
      if (!knownCategory)
        throw new Error('Categoria não suportada nesta versão.')
      const selection = photos
        .filter((photo) => photo.version_id === version.id)
        .map((photo) => ({
          id: photo.id as string,
          src: urls.get(photo.storage_path) ?? '',
          alt: photo.alt_text as string,
          width: photo.width as number,
          height: photo.height as number,
        }))
      const cover = selection.find(
        (photo) => photo.id === version.cover_photo_id,
      )
      if (!cover || selection.some((photo) => !photo.src))
        throw new Error('Seleção incompleta.')
      output.push({
        slug: work.slug,
        title: version.title,
        description: version.description,
        category: knownCategory.slug,
        cover,
        photos: selection,
      })
    }
  }
  return output
}
