import type { SupabaseClient } from '@supabase/supabase-js'
import { fetchAllRows } from '../../lib/pagination'

export type Category = { id: string; name: string; slug: string }
export type StoredPhoto = {
  id: string
  storage_path: string
  alt_text: string
  width: number
  height: number
  sort_order: number
  removed_at: string | null
}
export type Draft = {
  id: string
  work_id: string
  title: string
  description: string
  category_id: string
  cover_photo_id: string | null
  revision: number
  sealed_at: string | null
}
export type WorkSummary = {
  id: string
  slug: string
  published_version_id: string | null
}

export async function listManagement(client: SupabaseClient) {
  const [works, categories, versions] = await Promise.all([
    fetchAllRows((start, end) =>
      client
        .from('works')
        .select('id,slug,published_version_id')
        .order('created_at', { ascending: false })
        .order('id')
        .range(start, end),
    ),
    fetchAllRows((start, end) =>
      client
        .from('categories')
        .select('id,name,slug')
        .order('sort_order')
        .order('id')
        .range(start, end),
    ),
    fetchAllRows((start, end) =>
      client
        .from('work_versions')
        .select(
          'id,work_id,title,description,category_id,cover_photo_id,revision,sealed_at',
        )
        .order('id')
        .range(start, end),
    ),
  ])
  return {
    works: works as WorkSummary[],
    categories: categories as Category[],
    versions: versions as Draft[],
  }
}

export async function loadDraft(client: SupabaseClient, id: string) {
  const [version, photos] = await Promise.all([
    client
      .from('work_versions')
      .select(
        'id,work_id,title,description,category_id,cover_photo_id,revision,sealed_at',
      )
      .eq('id', id)
      .single(),
    fetchAllRows((start, end) =>
      client
        .from('photos')
        .select('id,storage_path,alt_text,width,height,sort_order,removed_at')
        .eq('version_id', id)
        .order('sort_order')
        .order('id')
        .range(start, end),
    ),
  ])
  if (version.error) throw new Error('Não foi possível carregar o rascunho.')
  return {
    version: version.data as Draft,
    photos: (photos as StoredPhoto[]).filter((photo) => !photo.removed_at),
    removedPhotos: (photos as StoredPhoto[]).filter(
      (photo) => photo.removed_at,
    ),
  }
}

export function managementError(error: unknown) {
  const code =
    typeof error === 'object' && error && 'code' in error ? error.code : ''
  if (code === '40001')
    return 'Outra alteração foi salva. Recarregue o rascunho antes de continuar.'
  if (code === '23505') return 'Esse endereço já está em uso. Escolha outro.'
  if (code === '42501') return 'Sua conta não tem permissão para essa operação.'
  if (code === 'PGRST202' || code === '42883')
    return 'Esta função precisa da atualização do banco local. Execute npm run supabase:migrate e recarregue a tela.'
  return 'Não foi possível confirmar a operação. Confira a conexão e recarregue antes de tentar novamente.'
}

export async function saveDraft(client: SupabaseClient, draft: Draft) {
  const result = await client.rpc('save_work_draft', {
    p_version_id: draft.id,
    p_expected_revision: draft.revision,
    p_title: draft.title,
    p_category_id: draft.category_id,
    p_description: draft.description,
    p_cover_photo_id: draft.cover_photo_id,
  })
  if (result.error) throw result.error
}

export async function publishDraft(client: SupabaseClient, draft: Draft) {
  const result = await client.rpc('publish_work', {
    p_work_id: draft.work_id,
    p_version_id: draft.id,
    p_expected_revision: draft.revision,
  })
  if (result.error) throw result.error
}

export async function beginRevision(
  client: SupabaseClient,
  source: Draft,
  newId: string,
) {
  const result = await client.rpc('begin_work_revision', {
    p_work_id: source.work_id,
    p_source_version_id: source.id,
    p_new_version_id: newId,
  })
  if (result.error) throw result.error
  if (typeof result.data !== 'string')
    throw new Error('Rascunho não confirmado')
  return result.data
}

export async function unpublishWork(client: SupabaseClient, work: WorkSummary) {
  const result = await client.rpc('unpublish_work', {
    p_work_id: work.id,
    p_expected_version_id: work.published_version_id,
  })
  if (result.error) throw result.error
}

export async function setPhotoRemoved(
  client: SupabaseClient,
  draft: Draft,
  photoId: string,
  removed: boolean,
) {
  const result = await client.rpc('set_draft_photo_removed', {
    p_version_id: draft.id,
    p_expected_revision: draft.revision,
    p_photo_id: photoId,
    p_removed: removed,
  })
  if (result.error) throw result.error
}

export async function reorderPhotos(
  client: SupabaseClient,
  draft: Draft,
  ids: string[],
) {
  const result = await client.rpc('reorder_draft_photos', {
    p_version_id: draft.id,
    p_expected_revision: draft.revision,
    p_photo_ids: ids,
  })
  if (result.error) throw result.error
}
