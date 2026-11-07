import { useState } from 'react'
import type { Photo } from './portfolio-data'

export function PortfolioImage({
  photo,
  eager = false,
}: {
  photo: Photo
  eager?: boolean
}) {
  const [failed, setFailed] = useState<string | null>(null)
  if (failed === photo.src)
    return (
      <span className="photo-unavailable" role="img" aria-label={photo.alt}>
        Foto indisponível no momento.
      </span>
    )
  return (
    <img
      src={photo.src}
      alt={photo.alt}
      width={photo.width}
      height={photo.height}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(photo.src)}
    />
  )
}
