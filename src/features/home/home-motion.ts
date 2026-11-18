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
        const intro = gsap.timeline({ defaults: { ease: 'power3.out' } })
        intro.from(
          select('.hero-copy .eyebrow'),
          {
            y: 10,
            opacity: 0,
            duration: 0.55,
            clearProps: 'transform,opacity',
          },
          0,
        )
        intro.from(
          select('[data-hero-line]'),
          {
            yPercent: 110,
            opacity: 0,
            duration: 0.85,
            stagger: 0.1,
            clearProps: 'transform,opacity',
          },
          0.08,
        )
        intro.from(
          select('.hero-description, .hero-copy .button, .hero-services'),
          {
            y: 14,
            opacity: 0,
            duration: 0.65,
            stagger: 0.08,
            clearProps: 'transform,opacity',
          },
          0.4,
        )
        intro.fromTo(
          select('.hero-photo'),
          { clipPath: 'inset(7% 4% 7% 4%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.1,
            clearProps: 'clipPath',
          },
          0.05,
        )
        intro.from(
          select('.hero-photo figcaption'),
          {
            y: 18,
            opacity: 0,
            duration: 0.7,
            clearProps: 'transform,opacity',
          },
          0.5,
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
