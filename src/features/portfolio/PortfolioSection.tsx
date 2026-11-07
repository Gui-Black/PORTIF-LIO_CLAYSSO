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

export function PortfolioSection({
  filter,
  items,
}: {
  filter: PortfolioFilter
  items?: readonly Work[]
}) {
  const filteredWorks = filterWorks(filter, items)
  return (
    <section
      className="portfolio page-width"
      id="trabalhos"
      tabIndex={-1}
      aria-labelledby="portfolio-title"
    >
      <div className="portfolio-heading">
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
      <div
        className="portfolio-filters"
        role="group"
        aria-label="Filtrar trabalhos por categoria"
      >
        {[{ slug: 'todos', name: 'Todos' }, ...categories].map((category) => (
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
        ))}
      </div>
      <p className="portfolio-count" role="status" aria-live="polite">
        {filteredWorks.length}{' '}
        {filteredWorks.length === 1
          ? 'seleção disponível'
          : 'seleções disponíveis'}
      </p>
      {filteredWorks.length ? (
        <div className="work-grid">
          {filteredWorks.map((work) => (
            <a
              className="work-card"
              id={`work-${work.slug}`}
              key={work.slug}
              href={portfolioUrl(filter, work.slug)}
              onClick={(event) => {
                if (isLocalClick(event)) {
                  event.preventDefault()
                  openWork(portfolioUrl(filter, work.slug), `work-${work.slug}`)
                }
              }}
            >
              <div className="work-cover">
                <PortfolioImage photo={work.cover} />
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
          <h3>Novas histórias vêm aí.</h3>
          <p>Ainda não há trabalhos nesta categoria.</p>
          <button
            className="button"
            type="button"
            onClick={() => changeFilter(portfolioUrl('todos'))}
          >
            Ver todas as seleções <ArrowIcon />
          </button>
        </div>
      )}
    </section>
  )
}
