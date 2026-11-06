import { ArrowIcon } from '../../components/ui/ArrowIcon'
import { useScrollExperience } from './useScrollExperience'
import { PortfolioSection } from '../portfolio/PortfolioSection'
import type { PortfolioFilter } from '../portfolio/portfolio-data'

const instagramUrl = 'https://www.instagram.com/clicksmortyofc/'

export function HomePage({ filter }: { filter: PortfolioFilter }) {
  const pageRef = useScrollExperience()

  return (
    <main id="conteudo" ref={pageRef} tabIndex={-1}>
      <section
        className="hero page-width"
        id="inicio"
        aria-labelledby="hero-title"
      >
        <div className="hero-copy">
          <p className="eyebrow">Um olhar para o que fica</p>
          <h1 id="hero-title">
            O instante
            <br />
            passa.
            <br />
            <em>
              A história
              <br />
              fica.
            </em>
          </h1>
          <p className="hero-description">
            Pessoas, encontros e tudo o que faz um momento ser seu.
          </p>
          <a className="button" href="#olhar">
            Sinta esse olhar <ArrowIcon />
          </a>
          <p className="hero-services">Ensaios · Casamentos · Celebrações</p>
        </div>
        <figure className="hero-photo">
          <img
            src="/images/retrato-noiva.jpeg"
            alt="Noiva com buquê de rosas brancas, sob luzes quentes em um jardim."
            width="1206"
            height="2079"
            fetchPriority="high"
          />
          <figcaption>
            <span>01 / Um dia para lembrar</span>
            <strong>
              Sentir.
              <br />
              <em>Lembrar.</em>
            </strong>
          </figcaption>
          <span className="photo-corner" aria-hidden="true" />
        </figure>
        <div className="hero-bottom">
          <a className="scroll-cue" href="#olhar">
            <span aria-hidden="true">↓</span> Role para descobrir
          </a>
          <span>Click’s do Morty · Guarulhos, SP</span>
        </div>
      </section>

      <section
        className="story page-width"
        id="olhar"
        aria-labelledby="story-title"
      >
        <div className="section-heading" data-reveal>
          <p className="eyebrow">01 — Pessoas & histórias</p>
          <h2 id="story-title">
            Tem muito de você
            <br />
            <em>em cada fotografia.</em>
          </h2>
        </div>
        <div className="story-grid">
          <figure className="story-photo" data-reveal>
            <img
              src="/images/celebracao.jpeg"
              alt="Mulher sorrindo junto a uma ponte, com luzes de uma celebração ao fundo."
              width="1206"
              height="679"
              loading="lazy"
              decoding="async"
            />
            <figcaption>Os gestos pequenos. As lembranças enormes.</figcaption>
          </figure>
          <div className="story-copy" data-reveal>
            <span className="decorative-quote" aria-hidden="true">
              “
            </span>
            <h3>
              Um abraço.
              <br />
              Um olhar.
              <br />
              <em>Um jeito de ser.</em>
            </h3>
            <p>
              Guardar o que torna cada encontro único. Dos pequenos gestos aos
              dias que merecem ser lembrados por inteiro.
            </p>
            <a className="text-link" href="#atmosfera">
              Existe mais para sentir <ArrowIcon />
            </a>
          </div>
        </div>
      </section>

      <section
        className="atmosphere"
        id="atmosfera"
        data-scroll-scene
        aria-labelledby="atmosphere-title"
      >
        <div className="atmosphere-inner page-width">
          <div className="atmosphere-copy" data-reveal>
            <p className="eyebrow">02 — Outra forma de sentir</p>
            <h2 id="atmosphere-title">
              Muda a luz.
              <br />
              <em>Fica a emoção.</em>
            </h2>
            <p>
              Às vezes, tirar a cor é descobrir outros detalhes. Um silêncio,
              uma expressão, um instante só seu.
            </p>
            <span className="scene-note">A beleza também mora na pausa.</span>
          </div>
          <figure className="atmosphere-photo" data-reveal>
            <div className="photo-window">
              <img
                src="/images/noiva-preto-branco.jpeg"
                alt="Retrato em preto e branco de uma noiva olhando para seu buquê."
                width="1206"
                height="2085"
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption>Entre a luz e a memória.</figcaption>
          </figure>
          <div className="atmosphere-bottom" data-reveal>
            <p>
              Uma nova atmosfera.
              <br />O mesmo cuidado com o momento.
            </p>
            <a
              className="text-link"
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
            >
              Mais histórias no Instagram <ArrowIcon diagonal />
              <span className="sr-only"> (abre em nova aba)</span>
            </a>
          </div>
        </div>
      </section>

      <PortfolioSection filter={filter} />

      <section
        className="contact page-width"
        id="contato"
        aria-labelledby="contact-title"
      >
        <div data-reveal>
          <p className="eyebrow">Click’s do Morty · Por Claysso</p>
          <h2 id="contact-title">
            Qual história
            <br />
            <em>vamos guardar?</em>
          </h2>
          <p>
            Fotografia em Guarulhos e São Paulo.
            <br />
            Vamos conversar sobre o seu próximo momento.
          </p>
          <a
            className="button"
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
          >
            Chame no Instagram <ArrowIcon diagonal />
            <span className="sr-only"> (abre em nova aba)</span>
          </a>
        </div>
      </section>
      <footer className="site-footer page-width">
        <span>Click’s do Morty</span>
        <span>Feito de instantes. Pensado para lembrar.</span>
        <a href="#inicio">Voltar ao início ↑</a>
      </footer>
    </main>
  )
}
