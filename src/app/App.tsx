import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useSyncExternalStore,
} from 'react'
import { SiteHeader } from '../components/layout/SiteHeader'
import { HomePage } from '../features/home/HomePage'
import {
  currentSearch,
  subscribeToNavigation,
} from '../features/portfolio/navigation'
import { findWork, parseFilter } from '../features/portfolio/portfolio-data'
import { WorkPage } from '../features/portfolio/WorkPage'
import { usePublicCatalog } from '../features/portfolio/usePublicCatalog'

const AuthPage = lazy(() => import('../features/auth/AuthPage'))

export function App() {
  const search = useSyncExternalStore(subscribeToNavigation, currentSearch)
  const route = new URLSearchParams(search).get('acesso')
  return route &&
    ['entrar', 'recuperar', 'nova-senha', 'painel'].includes(route) ? (
    <Suspense
      fallback={
        <main id="conteudo">
          <p role="status">Abrindo área de acesso…</p>
        </main>
      }
    >
      <AuthPage route={route} />
    </Suspense>
  ) : (
    <PortfolioApp />
  )
}

function PortfolioApp() {
  const catalog = usePublicCatalog()
  const search = useSyncExternalStore(subscribeToNavigation, currentSearch)
  const params = new URLSearchParams(search)
  const slug = params.get('trabalho')
  const filter = parseFilter(params.get('categoria'))
  const work = slug !== null ? findWork(slug, catalog.items) : undefined

  useEffect(() => {
    const previous = window.history.scrollRestoration
    window.history.scrollRestoration = 'manual'
    return () => {
      window.history.scrollRestoration = previous
    }
  }, [])

  useLayoutEffect(() => {
    document.title =
      slug !== null
        ? `${work?.title ?? 'Trabalho não encontrado'} | Click’s do Morty`
        : 'Click’s do Morty | Fotografia em Guarulhos'
    if (slug !== null) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      document.getElementById('conteudo')?.focus({ preventScroll: true })
    } else if (typeof window.history.state?.portfolioScroll === 'number') {
      window.scrollTo({
        top: window.history.state.portfolioScroll,
        behavior: 'instant',
      })
      document
        .getElementById(window.history.state.portfolioFocus)
        ?.focus({ preventScroll: true })
    } else if (window.location.hash) {
      const section = document.getElementById(window.location.hash.slice(1))
      section?.scrollIntoView({ behavior: 'instant' })
      section?.focus({ preventScroll: true })
    }
  }, [slug, work?.title, catalog.status])

  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <SiteHeader homePrefix={slug !== null ? '/' : ''} />
      {catalog.status !== 'ready' ? (
        <main id="conteudo" className="page-width">
          <p role={catalog.status === 'error' ? 'alert' : 'status'}>
            {catalog.status === 'error'
              ? 'Não foi possível carregar a galeria. Tente novamente.'
              : 'Carregando histórias…'}
          </p>
          {catalog.status === 'error' ? (
            <button type="button" onClick={catalog.retry}>
              Tentar novamente
            </button>
          ) : null}
        </main>
      ) : slug !== null ? (
        <WorkPage key={slug} work={work} filter={filter} />
      ) : (
        <HomePage filter={filter} items={catalog.items} />
      )}
    </>
  )
}
