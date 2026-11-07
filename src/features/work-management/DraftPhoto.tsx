import { useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { StoredPhoto } from './work-service'
import { PortfolioImage } from '../portfolio/PortfolioImage'

export function DraftPhoto({
  client,
  photo,
}: {
  client: SupabaseClient
  photo: StoredPhoto
}) {
  const [src, setSrc] = useState('')
  useEffect(() => {
    let active = true
    const refresh = async () => {
      try {
        const result = await client.storage
          .from('portfolio')
          .createSignedUrl(photo.storage_path, 3600)
        if (active) setSrc(result.data?.signedUrl ?? '')
      } catch {
        if (active) setSrc('')
      }
    }
    void refresh()
    const timer = setInterval(() => void refresh(), 45 * 60 * 1000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [client, photo.storage_path])
  return src ? (
    <PortfolioImage
      photo={{
        id: photo.id,
        src,
        alt: photo.alt_text,
        width: photo.width,
        height: photo.height,
      }}
    />
  ) : (
    <span>Prévia indisponível</span>
  )
}
