import { useEffect } from 'react'

const siteUrl = 'https://clicks-do-morty-preview.vercel.app/'
const defaultDescription =
  'Fotografia em Guarulhos e São Paulo. Ensaios, casamentos, aniversários, eventos e produtos. Conheça o olhar do Click’s do Morty e converse sobre seu próximo momento.'

export function usePageMetadata(
  title: string,
  description = defaultDescription,
  slug?: string | null,
  privatePage = false,
) {
  useEffect(() => {
    document.title = title
    const canonical = new URL(siteUrl)
    if (slug) canonical.searchParams.set('trabalho', slug)
    for (const [attribute, name, content] of [
      ['name', 'description', description],
      ['name', 'robots', 'noindex, nofollow'],
      ['property', 'og:title', title],
      ['property', 'og:description', description],
      ['property', 'og:url', canonical.href],
      ['name', 'twitter:title', title],
      ['name', 'twitter:description', description],
    ] as const) {
      let meta = document.head.querySelector<HTMLMetaElement>(
        `meta[${attribute}="${name}"]`,
      )
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute(attribute, name)
        document.head.append(meta)
      }
      meta.content = content
    }
    let link = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    )
    if (privatePage) link?.remove()
    else {
      if (!link) {
        link = document.createElement('link')
        link.rel = 'canonical'
        document.head.append(link)
      }
      link.href = canonical.href
    }
  }, [title, description, slug, privatePage])
}
