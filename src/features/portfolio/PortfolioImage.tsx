import { useState } from 'react'
import type { Photo } from './portfolio-data'
import { responsiveImage } from '../../lib/responsive-images'

export function PortfolioImage({
  photo,
  eager = false,
  sizes = '(max-width: 759px) calc(100vw - 48px), 45vw',
  announceLoading = false,
}: {
  photo: Photo
  eager?: boolean
  sizes?: string
  announceLoading?: boolean
}) {
  const [failed, setFailed] = useState<string | null>(null)
  const [loaded, setLoaded] = useState<string | null>(null)
  if (failed === photo.src)
    return (
      <span className="photo-unavailable" role="img" aria-label={photo.alt}>
        Foto indisponível no momento.
      </span>
    )
  return (
    <>
      {announceLoading && loaded !== photo.src ? (
        <span className="viewer-loading" role="status">
          Carregando fotografia…
        </span>
      ) : null}
      <img
        src={photo.src}
        {...responsiveImage(photo.src, sizes)}
        alt={photo.alt}
        width={photo.width}
        height={photo.height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        data-loaded={loaded === photo.src}
        onLoad={() => setLoaded(photo.src)}
        onError={() => setFailed(photo.src)}
      />
    </>
  )
}
