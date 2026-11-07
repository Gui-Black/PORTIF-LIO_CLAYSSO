export const categories = [
  { slug: 'ensaios', name: 'Ensaios' },
  { slug: 'casamentos', name: 'Casamentos' },
  { slug: 'aniversarios', name: 'Aniversários' },
  { slug: 'eventos', name: 'Eventos' },
  { slug: 'produtos', name: 'Produtos' },
] as const

export type CategorySlug = (typeof categories)[number]['slug']
export type PortfolioFilter = CategorySlug | 'todos'

export type Photo = {
  id: string
  src: string
  alt: string
  width: number
  height: number
}

export type Work = {
  slug: string
  title: string
  category: CategorySlug
  description: string
  cover: Photo
  photos: readonly Photo[]
}

const bride: Photo = {
  id: 'noiva',
  src: '/images/retrato-noiva.jpeg',
  alt: 'Noiva com buquê de rosas brancas sob luzes no jardim.',
  width: 1206,
  height: 2079,
}
const couple: Photo = {
  id: 'casal',
  src: '/images/casal.jpeg',
  alt: 'Casal de noivos com as testas próximas sob um arco de flores brancas.',
  width: 1206,
  height: 2079,
}
const embrace: Photo = {
  id: 'abraco',
  src: '/images/abraco.jpeg',
  alt: 'Dois homens se abraçando, em uma fotografia em preto e branco.',
  width: 1206,
  height: 2089,
}
const monochrome: Photo = {
  id: 'noiva-pb',
  src: '/images/noiva-preto-branco.jpeg',
  alt: 'Noiva olhando para o buquê, em um retrato em preto e branco.',
  width: 1206,
  height: 2085,
}
const portrait: Photo = {
  id: 'retrato',
  src: '/images/retrato-jardim.jpeg',
  alt: 'Mulher de vestido preto olhando sobre o ombro em um jardim iluminado.',
  width: 1206,
  height: 2089,
}
const smile: Photo = {
  id: 'sorriso',
  src: '/images/celebracao.jpeg',
  alt: 'Mulher sorrindo junto a uma ponte, com luzes de uma celebração ao fundo.',
  width: 1206,
  height: 679,
}

// Seleções editoriais para a demonstração; títulos e categorias ainda serão validados.
export const works: readonly Work[] = [
  {
    slug: 'entre-lacos-e-abracos',
    title: 'Entre laços e abraços',
    category: 'casamentos',
    description:
      'Uma seleção sobre encontros, afeto e os pequenos gestos de um dia especial.',
    cover: couple,
    photos: [couple, bride, embrace, monochrome],
  },
  {
    slug: 'retratos-no-jardim',
    title: 'Retratos no jardim',
    category: 'ensaios',
    description: 'Olhares e sorrisos em meio ao verde e às luzes do jardim.',
    cover: portrait,
    photos: [portrait, smile],
  },
]

export function parseFilter(value: string | null): PortfolioFilter {
  return categories.find((category) => category.slug === value)?.slug ?? 'todos'
}

export function filterWorks(
  filter: PortfolioFilter,
  source: readonly Work[] = works,
): readonly Work[] {
  return filter === 'todos'
    ? source
    : source.filter((work) => work.category === filter)
}

export function findWork(
  slug: string,
  source: readonly Work[] = works,
): Work | undefined {
  return source.find((work) => work.slug === slug)
}

export function categoryName(slug: CategorySlug) {
  return categories.find((category) => category.slug === slug)?.name ?? slug
}

export function portfolioUrl(filter: PortfolioFilter, slug?: string) {
  const params = new URLSearchParams()
  if (filter !== 'todos') params.set('categoria', filter)
  if (slug !== undefined) params.set('trabalho', slug)
  const query = params.size ? `?${params}` : ''
  return `/${query}${slug === undefined ? '#trabalhos' : ''}`
}
