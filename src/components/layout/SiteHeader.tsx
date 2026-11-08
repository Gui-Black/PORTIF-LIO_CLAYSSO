import { useEffect, useRef, useState } from 'react'
import { ArrowIcon } from '../ui/ArrowIcon'

export function SiteHeader({ homePrefix = '' }: { homePrefix?: string }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!menuOpen) return

    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        toggleRef.current?.focus()
      }
    }
    function handleOutside(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !headerRef.current?.contains(event.target)
      )
        setMenuOpen(false)
    }
    const desktop = window.matchMedia('(min-width: 760px)')
    function handleResize() {
      if (desktop.matches) setMenuOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    document.addEventListener('pointerdown', handleOutside)
    desktop.addEventListener('change', handleResize)
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.removeEventListener('pointerdown', handleOutside)
      desktop.removeEventListener('change', handleResize)
    }
  }, [menuOpen])

  return (
    <header className="site-header page-width" ref={headerRef}>
      <a
        className="wordmark"
        href={`${homePrefix}#inicio`}
        aria-label="Click’s do Morty — início"
        onClick={() => setMenuOpen(false)}
      >
        <span>click’s do</span>Morty<span className="wordmark-dot">.</span>
      </a>
      <span className="header-location">
        Fotografia
        <br />
        GRU / SP
      </span>
      <button
        className="menu-toggle"
        type="button"
        ref={toggleRef}
        aria-expanded={menuOpen}
        aria-controls="navegacao"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? 'Fechar' : 'Menu'}
        <span aria-hidden="true">{menuOpen ? '−' : '+'}</span>
      </button>
      <nav
        id="navegacao"
        className={`site-nav${menuOpen ? ' is-open' : ''}`}
        aria-label="Navegação principal"
      >
        <a href={`${homePrefix}#olhar`} onClick={() => setMenuOpen(false)}>
          O olhar
        </a>
        <a href={`${homePrefix}#trabalhos`} onClick={() => setMenuOpen(false)}>
          Trabalhos
        </a>
        <a
          href={`${homePrefix}#experiencia`}
          onClick={() => setMenuOpen(false)}
        >
          A experiência
        </a>
        <a
          className="nav-contact"
          href={`${homePrefix}#contato`}
          onClick={() => setMenuOpen(false)}
        >
          Vamos conversar <ArrowIcon diagonal />
        </a>
      </nav>
    </header>
  )
}
