const localImages = new Set([
  'retrato-noiva',
  'celebracao',
  'noiva-preto-branco',
  'abraco',
  'casal',
  'retrato-jardim',
])

export function responsiveImage(src: string, sizes: string) {
  const name = /^\/images\/([a-z-]+)\.jpeg$/.exec(src)?.[1]
  if (!name || !localImages.has(name)) return {}
  return {
    srcSet: [480, 800, 1206]
      .map((width) => `/images/responsive/${name}-${width}.jpg ${width}w`)
      .join(', '),
    sizes,
  }
}
