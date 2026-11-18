import { ArrowIcon } from '../../components/ui/ArrowIcon'
import {
  categories,
  categoryName,
  filterWorks,
  portfolioUrl,
  type PortfolioFilter,
  type Work,
} from './portfolio-data'
import { changeFilter, isLocalClick, openWork } from './navigation'
import { PortfolioImage } from './PortfolioImage'
import { CatalogNotice, type CatalogState } from './CatalogNotice'
import type { CSSProperties } from 'react'

export function PortfolioSection({
  filter,
  items,
  catalogState,
}: {
  filter: PortfolioFilter
  items?: readonly Work[]
  catalogState?: CatalogState
}) {
  const filteredWorks = filterWorks(filter, items)
  return (
    <section
      className="portfolio page-width"
      id="trabalhos"
      tabIndex={-1}
      aria-labelledby="portfolio-title"
    >
      <div className="portfolio-heading" data-reveal>
        <div>
          <p className="eyebrow">03 — Histórias para explorar</p>
          <h2 id="portfolio-title">
            Um instante.
            <br />
            <em>Muitas memórias.</em>
          </h2>
        </div>
        <p>
          Escolha um olhar. Abra uma história.
          <br />
          Fique o tempo que quiser.
        </p>
      </div>
      {catalogState ? <CatalogNotice {...catalogState} /> : null}
      {!catalogState || catalogState.status === 'ready' ? (
        <>
          <div
            className="portfolio-filters"
            role="group"
            aria-label="Filtrar trabalhos por categoria"
          >
            {[{ slug: 'todos', name: 'Todos' }, ...categories].map(
              (category) => (
                <button
                  key={category.slug}
                  type="button"
                  aria-pressed={filter === category.slug}
                  onClick={() =>
                    changeFilter(portfolioUrl(category.slug as PortfolioFilter))
                  }
                >
                  {category.name}
                </button>
              ),
            )}
          </div>
          <p className="portfolio-count" role="status" aria-live="polite">
            {filteredWorks.length}{' '}
            {filteredWorks.length === 1
              ? 'seleção disponível'
              : 'seleções disponíveis'}
          </p>
          {filteredWorks.length ? (
            <div
              className={`work-grid${filteredWorks.length === 1 ? ' work-grid-single' : ''}`}
              key={filter}
            >
              {filteredWorks.map((work, index) => (
                <a
                  className="work-card"
                  id={`work-${work.slug}`}
                  key={work.slug}
                  data-reveal
                  style={
                    {
                      '--reveal-delay': `${(index % 2) * 100}ms`,
                    } as CSSProperties
                  }
                  href={portfolioUrl(filter, work.slug)}
                  onClick={(event) => {
                    if (isLocalClick(event)) {
                      event.preventDefault()
                      openWork(
                        portfolioUrl(filter, work.slug),
                        `work-${work.slug}`,
                      )
                    }
                  }}
                >
                  <div className="work-cover">
                    <PortfolioImage
                      photo={work.cover}
                      sizes={
                        filteredWorks.length === 1
                          ? '(max-width: 759px) calc(100vw - 48px), (max-width: 850px) 90vw, 760px'
                          : undefined
                      }
                    />
                    <span className="work-open">
                      Ver seleção <ArrowIcon diagonal />
                    </span>
                  </div>
                  <div className="work-meta">
                    <div>
                      <p className="eyebrow">{categoryName(work.category)}</p>
                      <h3>{work.title}</h3>
                    </div>
                    <span>{work.photos.length} fotos</span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="portfolio-empty">
              <h3>
                {catalogState?.incomplete && !items?.length
                  ? 'Seleções indisponíveis no momento.'
                  : 'Novas histórias vêm aí.'}
              </h3>
              <p>
                {catalogState?.incomplete && !items?.length
                  ? 'Use Tentar carregar as fotos acima ou entre em contato para conhecer o trabalho.'
                  : 'Ainda não há trabalhos nesta categoria.'}
              </p>
              <button
                className="button"
                type="button"
                onClick={() => changeFilter(portfolioUrl('todos'))}
              >
                Ver todas as seleções <ArrowIcon />
              </button>
            </div>
          )}
        </>
      ) : null}
    </section>
  )
}
