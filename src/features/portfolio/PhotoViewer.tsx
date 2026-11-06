import { useEffect, useRef, useState } from 'react'
import type { Work } from './portfolio-data'
import { nextPhotoIndex, swipeDirection } from './photo-navigation'
import { PortfolioImage } from './PortfolioImage'

export function PhotoViewer({
  work,
  initialIndex,
  onClose,
}: {
  work: Work
  initialIndex: number
  onClose: () => void
}) {
  const [index, setIndex] = useState(initialIndex)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const photo = work.photos[index]

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    dialog.showModal()
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus({ preventScroll: true })
    }
  }, [])

  function navigate(direction: number) {
    setIndex((current) =>
      nextPhotoIndex(current, direction, work.photos.length),
    )
  }

  return (
    <dialog
      className="photo-viewer"
      ref={dialogRef}
      aria-labelledby="viewer-title"
      aria-describedby="viewer-help"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onKeyDown={(event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault()
          navigate(event.key === 'ArrowRight' ? 1 : -1)
        }
      }}
    >
      <div className="viewer-header">
        <h2 id="viewer-title">{work.title}</h2>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fechar visualização ampliada"
        >
          Fechar <span aria-hidden="true">×</span>
        </button>
      </div>
      <div
        className="viewer-stage"
        onTouchStart={(event) => {
          const touch = event.touches[0]
          touchStart.current =
            event.touches.length === 1 && touch
              ? { x: touch.clientX, y: touch.clientY }
              : null
        }}
        onTouchCancel={() => {
          touchStart.current = null
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current
          const end = event.changedTouches[0]
          touchStart.current = null
          if (start && end && event.touches.length === 0) {
            const direction = swipeDirection(
              start.x,
              start.y,
              end.clientX,
              end.clientY,
            )
            if (direction) navigate(direction)
          }
        }}
      >
        {photo ? (
          <PortfolioImage key={photo.id} photo={photo} eager />
        ) : (
          <p>Foto indisponível.</p>
        )}
      </div>
      <div className="viewer-controls">
        <button
          type="button"
          aria-label="Foto anterior"
          disabled={work.photos.length < 2}
          onClick={() => navigate(-1)}
        >
          ← <span>Anterior</span>
        </button>
        <p role="status" aria-live="polite" aria-atomic="true">
          {index + 1} / {work.photos.length}
          <span className="sr-only"> — {photo?.alt}</span>
        </p>
        <button
          type="button"
          aria-label="Próxima foto"
          disabled={work.photos.length < 2}
          onClick={() => navigate(1)}
        >
          <span>Próxima</span> →
        </button>
      </div>
      <p id="viewer-help">
        Use as setas, deslize para os lados ou pressione Esc para fechar.
      </p>
    </dialog>
  )
}
