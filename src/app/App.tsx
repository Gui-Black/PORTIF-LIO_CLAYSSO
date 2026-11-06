import { SiteHeader } from '../components/layout/SiteHeader'
import { HomePage } from '../features/home/HomePage'

export function App() {
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <SiteHeader />
      <HomePage />
    </>
  )
}
