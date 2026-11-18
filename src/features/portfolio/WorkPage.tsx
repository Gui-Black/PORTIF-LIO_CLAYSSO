import { useRef, useState } from 'react'
import { ArrowIcon } from '../../components/ui/ArrowIcon'
import {
  categoryName,
  portfolioUrl,
  type PortfolioFilter,
  type Work,
} from './portfolio-data'
import { isLocalClick, returnToPortfolio } from './navigation'
import { PhotoViewer } from './PhotoViewer'
import { PortfolioImage } from './PortfolioImage'
import { contactUrl, contactChannel } from '../../lib/contact'
import { composeAlbum } from './album-layout'
import { useScrollReveal } from '../../lib/useScrollReveal'

export function WorkPage({
  work,
  filter,
  demo = false,
}: {
  work: Work | undefined
  filter: PortfolioFilter
  demo?: boolean
}) {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null)
  const pageRef = useRef<HTMLElement>(null)
  useScrollReveal(pageRef)
  const frames = composeAlbum(work?.photos ?? [])
  const backUrl = portfolioUrl(filter)
  return (
    <main
      className="work-page page-width"
      id="conteudo"
      tabIndex={-1}
      ref={pageRef}
    >
      <a
        className="text-link work-back"
        href={backUrl}
        onClick={(event) => {
          if (isLocalClick(event)) {
            event.preventDefault()
            returnToPortfolio(backUrl)
          }
        }}
      >
        ← Voltar aos trabalhos
      </a>
      {work ? (
        <>
          {demo ? (
            <p className="catalog-notice">
              Seleção demonstrativa do protótipo.
            </p>
          ) : null}
          <header className="work-heading">
            <p className="eyebrow">
              {categoryName(work.category)} · {work.photos.length} fotografias
            </p>
            <h1>{work.title}</h1>
            <p>{work.description}</p>
            <span>Toque em uma foto para olhar mais de perto.</span>
          </header>
          <div className="work-photos">
            {frames.map(({ photo, index, placement }) => (
              <figure
                className={`album-frame album-frame--${placement}`}
                key={photo.id}
                data-reveal
              >
                <button
                  className="work-photo"
                  type="button"
                  onClick={() => setSelectedPhoto(index)}
                  aria-label={`Ampliar foto ${index + 1}: ${photo.alt}`}
                >
                  <PortfolioImage
                    photo={photo}
                    eager={index === 0}
                    sizes={
                      placement === 'wide'
                        ? '(max-width: 1600px) 91vw, 1440px'
                        : placement === 'pair' || placement === 'pair-offset'
                          ? '(max-width: 759px) calc(100vw - 48px), 45vw'
                          : '(max-width: 759px) calc(100vw - 48px), 740px'
                    }
                  />
                  <span className="photo-expand" aria-hidden="true">
                    Ampliar <ArrowIcon diagonal />
                  </span>
                </button>
                <figcaption className="album-photo-index" aria-hidden="true">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <span className="album-index-line" />
                  <span>{String(work.photos.length).padStart(2, '0')}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="work-contact" data-reveal>
            <h2>
              Sua história também
              <br />
              <em>merece ficar.</em>
            </h2>
            <a
              className="button"
              href={contactUrl}
              target="_blank"
              rel="noreferrer"
            >
              Vamos conversar <ArrowIcon diagonal />
              <span className="sr-only">
                {' '}
                no {contactChannel} (abre em nova aba)
              </span>
            </a>
          </div>
          {selectedPhoto !== null ? (
            <PhotoViewer
              work={work}
              initialIndex={selectedPhoto}
              onClose={() => setSelectedPhoto(null)}
            />
          ) : null}
        </>
      ) : (
        <div className="portfolio-empty">
          <p className="eyebrow">Trabalho não encontrado</p>
          <h1>Essa história não está por aqui.</h1>
          <p>
            O endereço pode estar incorreto ou o trabalho não estar disponível.
            Volte à galeria para explorar as seleções.
          </p>
        </div>
      )}
    </main>
  )
}
