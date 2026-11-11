import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/** Decorative motion only: content remains usable if this module cannot load. */
export function startHomeMotion(page: HTMLElement) {
  const media = gsap.matchMedia()
  const select = gsap.utils.selector(page)
  let refreshFrame = 0

  media.add(
    '(prefers-reduced-motion: no-preference)',
    () => {
      if (window.scrollY < 100) {
        gsap.from(select('.hero-copy > *'), {
          y: 22,
          opacity: 0,
          duration: 0.8,
          stagger: 0.09,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
        })
        gsap.fromTo(
          select('.hero-photo'),
          { clipPath: 'inset(5% 5% 5% 5%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.2,
            ease: 'power3.out',
            clearProps: 'clipPath',
          },
        )
      }

      for (const image of page.querySelectorAll<HTMLImageElement>(
        '.story-photo img, .experience-photo img',
      )) {
        // Restored scroll positions must not replay already visited photographs.
        if (image.getBoundingClientRect().top < window.innerHeight * 0.9)
          continue
        gsap.fromTo(
          image,
          { clipPath: 'inset(0% 0% 14% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.1,
            ease: 'power3.out',
            clearProps: 'clipPath',
            scrollTrigger: { trigger: image, start: 'top 90%', once: true },
          },
        )
      }

      gsap.fromTo(
        select('.reading-progress'),
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: page,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
          },
        },
      )
    },
    page,
  )

  media.add(
    '(min-width: 760px) and (prefers-reduced-motion: no-preference)',
    () => {
      gsap.fromTo(
        select('.hero-photo img'),
        { scale: 1.08, yPercent: -3 },
        {
          scale: 1.08,
          yPercent: 3,
          ease: 'none',
          scrollTrigger: {
            trigger: page.querySelector('.hero'),
            start: 'top top',
            end: 'bottom top',
            scrub: 0.6,
          },
        },
      )
    },
    page,
  )

  // A remote gallery can change page height after its request completes.
  const resize = new ResizeObserver(() => {
    cancelAnimationFrame(refreshFrame)
    refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh())
  })
  resize.observe(page)

  return () => {
    resize.disconnect()
    cancelAnimationFrame(refreshFrame)
    media.revert()
  }
}
