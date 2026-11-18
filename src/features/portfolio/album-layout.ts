import type { Photo } from './portfolio-data'

export type AlbumFrame = {
  photo: Photo
  index: number
  placement: 'opening-portrait' | 'wide' | 'portrait' | 'pair' | 'pair-offset'
}

/** Pair consecutive portraits without changing order or lightbox indices. */
export function composeAlbum(photos: readonly Photo[]): AlbumFrame[] {
  const frames: AlbumFrame[] = []
  const isWide = (photo: Photo) => photo.width / photo.height >= 1.15
  for (let index = 0; index < photos.length; index++) {
    const photo = photos[index]!
    if (isWide(photo)) frames.push({ photo, index, placement: 'wide' })
    else if (index === 0)
      frames.push({ photo, index, placement: 'opening-portrait' })
    else {
      const next = photos[index + 1]
      if (next && !isWide(next)) {
        frames.push({ photo, index, placement: 'pair' })
        frames.push({ photo: next, index: index + 1, placement: 'pair-offset' })
        index++
      } else frames.push({ photo, index, placement: 'portrait' })
    }
  }
  return frames
}
