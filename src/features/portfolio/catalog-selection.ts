import { categories, type Work } from './portfolio-data'

export type PublishedWorkRow = {
  slug: string
  published_version_id: string
}
export type VersionRow = {
  id: string
  title: string
  description: string
  category_id: string
  cover_photo_id: string | null
}
export type PhotoRow = {
  id: string
  version_id: string
  storage_path: string
  alt_text: string
  width: number | null
  height: number | null
}

// Only assemble rows already authorized by the public API. Request failures
// must propagate: they are not equivalent to an unavailable individual image.
export function selectPublishedWorks(
  works: readonly PublishedWorkRow[],
  versions: readonly VersionRow[],
  photos: readonly PhotoRow[],
  categoryRows: readonly { id: string; slug: string }[],
  urls: ReadonlyMap<string, string>,
): { items: Work[]; incomplete: boolean } {
  const items: Work[] = []
  let incomplete = false
  const byVersion = new Map(versions.map((version) => [version.id, version]))
  const byCategory = new Map(
    categoryRows.map((category) => [category.id, category.slug]),
  )
  const byAlbum = new Map<string, PhotoRow[]>()
  for (const photo of photos) {
    const album = byAlbum.get(photo.version_id) ?? []
    album.push(photo)
    byAlbum.set(photo.version_id, album)
  }
  for (const work of works) {
    const version = byVersion.get(work.published_version_id)
    const category = categories.find(
      (entry) =>
        entry.slug === (version && byCategory.get(version.category_id)),
    )
    if (!version || !category) {
      incomplete = true
      continue
    }
    const album = byAlbum.get(version.id) ?? []
    const selection = album.flatMap((photo) => {
      const src = urls.get(photo.storage_path)
      if (
        !src ||
        !photo.width ||
        !photo.height ||
        photo.width < 1 ||
        photo.height < 1 ||
        !photo.alt_text.trim()
      ) {
        incomplete = true
        return []
      }
      return [
        {
          id: photo.id,
          src,
          alt: photo.alt_text,
          width: photo.width,
          height: photo.height,
        },
      ]
    })
    const cover = selection.find((photo) => photo.id === version.cover_photo_id)
    if (!cover) {
      incomplete = true
      continue
    }
    items.push({
      slug: work.slug,
      title: version.title,
      description: version.description,
      category: category.slug,
      cover,
      photos: selection,
    })
  }
  return { items, incomplete }
}
