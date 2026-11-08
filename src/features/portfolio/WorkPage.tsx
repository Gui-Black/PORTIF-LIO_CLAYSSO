import { useState } from 'react'
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
  const backUrl = portfolioUrl(filter)
  return (
    <main className="work-page page-width" id="conteudo" tabIndex={-1}>
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
            {work.photos.map((photo, index) => (
              <button
                className="work-photo"
                type="button"
                key={photo.id}
                onClick={() => setSelectedPhoto(index)}
                aria-label={`Ampliar foto ${index + 1}: ${photo.alt}`}
              >
                <PortfolioImage photo={photo} eager={index < 2} />
                <span className="photo-expand" aria-hidden="true">
                  Ampliar ↗
                </span>
              </button>
            ))}
          </div>
          <div className="work-contact">
            <h2>
              Sua história também
              <br />
              <em>merece ficar.</em>
            </h2>
            <a
              className="button"
              href="https://www.instagram.com/clicksmortyofc/"
              target="_blank"
              rel="noreferrer"
            >
              Vamos conversar <ArrowIcon diagonal />
              <span className="sr-only"> no Instagram (abre em nova aba)</span>
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
