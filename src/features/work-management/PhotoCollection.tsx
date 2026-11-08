import type { SupabaseClient } from '@supabase/supabase-js'
import { DraftPhoto } from './DraftPhoto'
import {
  reorderPhotos,
  saveDraft,
  setPhotoRemoved,
  type Draft,
  type StoredPhoto,
} from './work-service'

export function PhotoCollection({
  client,
  draft,
  photos,
  removedPhotos,
  disabled,
  perform,
}: {
  client: SupabaseClient
  draft: Draft
  photos: StoredPhoto[]
  removedPhotos: StoredPhoto[]
  disabled: boolean
  perform: (action: () => Promise<void>, success: string) => Promise<void>
}) {
  function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= photos.length) return
    const ids = photos.map((photo) => photo.id)
    ;[ids[index], ids[target]] = [ids[target]!, ids[index]!]
    void perform(
      () => reorderPhotos(client, draft, ids),
      'Ordem das fotos salva.',
    )
  }

  return (
    <>
      <ol className="draft-photos">
        {photos.map((photo, index) => (
          <li key={photo.id}>
            <DraftPhoto client={client} photo={photo} />
            <p>
              {index + 1}. {photo.alt_text}
            </p>
            <button
              type="button"
              aria-pressed={photo.id === draft.cover_photo_id}
              disabled={disabled || photo.id === draft.cover_photo_id}
              onClick={() =>
                void perform(
                  () =>
                    saveDraft(client, { ...draft, cover_photo_id: photo.id }),
                  'Capa salva.',
                )
              }
            >
              {photo.id === draft.cover_photo_id
                ? '✓ Capa escolhida'
                : 'Usar como capa'}
            </button>
            <div
              className="photo-order"
              role="group"
              aria-label={`Ordem da foto ${index + 1}`}
            >
              <button
                type="button"
                disabled={disabled || index === 0}
                onClick={() => move(index, -1)}
              >
                Mover antes
              </button>
              <button
                type="button"
                disabled={disabled || index === photos.length - 1}
                onClick={() => move(index, 1)}
              >
                Mover depois
              </button>
            </div>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                if (
                  window.confirm(
                    'Retirar esta foto da seleção? Você pode restaurá-la enquanto este trabalho estiver em rascunho.',
                  )
                )
                  void perform(
                    () => setPhotoRemoved(client, draft, photo.id, true),
                    'Foto retirada. Você pode restaurá-la em Fotos retiradas. Se era a capa, escolha outra.',
                  )
              }}
            >
              Retirar foto
            </button>
          </li>
        ))}
      </ol>
      {removedPhotos.length ? (
        <details className="removed-photos">
          <summary>Fotos retiradas ({removedPhotos.length})</summary>
          <p>
            Estas fotos não serão publicadas. Você pode restaurá-las antes de
            publicar este rascunho.
          </p>
          <ul className="draft-photos">
            {removedPhotos.map((photo) => (
              <li key={photo.id}>
                <DraftPhoto client={client} photo={photo} />
                <p>{photo.alt_text}</p>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() =>
                    void perform(
                      () => setPhotoRemoved(client, draft, photo.id, false),
                      'Foto restaurada. Confira a ordem e a capa antes de publicar.',
                    )
                  }
                >
                  Restaurar foto
                </button>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </>
  )
}
