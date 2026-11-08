import { ArrowIcon } from '../../components/ui/ArrowIcon'
import './experience.css'

const steps = [
  {
    title: 'Conte sua ideia',
    text: 'Um ensaio, uma celebração ou uma fotografia para o seu negócio. A conversa começa pelo que você quer registrar.',
  },
  {
    title: 'Vamos pensar nos detalhes',
    text: 'Data, lugar e referências ajudam a dar forma à sua ideia. Leve suas dúvidas para essa conversa.',
  },
  {
    title: 'Dê espaço ao momento',
    text: 'Entre um gesto e outro, há uma história que merece ser vista. A sua também.',
  },
]

export function ExperienceSection() {
  return (
    <section
      className="experience"
      id="experiencia"
      tabIndex={-1}
      aria-labelledby="experience-title"
      data-scroll-scene
    >
      <div className="experience-grid page-width">
        <div className="experience-intro" data-reveal>
          <p className="eyebrow">04 — Antes do primeiro clique</p>
          <h2 id="experience-title">
            Tudo começa
            <br />
            <em>com uma conversa.</em>
          </h2>
          <p>
            Você não precisa chegar com tudo planejado. Uma ideia já é um
            começo.
          </p>
          <figure className="experience-photo">
            <img
              src="/images/abraco.jpeg"
              alt="Dois homens se abraçando, em uma fotografia em preto e branco."
              loading="lazy"
              decoding="async"
              width="1206"
              height="2089"
            />
            <figcaption>O encontro vem antes da fotografia.</figcaption>
          </figure>
        </div>
        <div className="experience-content">
          <ol className="experience-steps">
            {steps.map((step, index) => (
              <li key={step.title} data-reveal>
                <span className="experience-number" aria-hidden="true">
                  0{index + 1}
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <a className="text-link" href="#contato">
            Vamos falar do seu momento <ArrowIcon />
          </a>
        </div>
      </div>
    </section>
  )
}
