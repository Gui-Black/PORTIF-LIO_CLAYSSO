import { useEffect, type RefObject } from 'react'

/** Shared observer also discovers photographs loaded after the initial render. */
export function useScrollReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const page = root.current
    if (!page) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const tracked = new Set<HTMLElement>()
    const observer =
      'IntersectionObserver' in window
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (entry.isIntersecting) {
                  const element = entry.target as HTMLElement
                  element.dataset.revealState = 'visible'
                  observer?.unobserve(element)
                }
              }
            },
            { threshold: 0.06 },
          )
        : null

    const scan = () => {
      for (const element of page.querySelectorAll<HTMLElement>(
        '[data-reveal]',
      )) {
        if (tracked.has(element)) continue
        tracked.add(element)
        if (
          observer &&
          !motion.matches &&
          element.getBoundingClientRect().top >= window.innerHeight
        ) {
          element.dataset.revealState = 'pending'
          observer.observe(element)
        }
      }
      for (const element of tracked) {
        if (!page.contains(element)) {
          observer?.unobserve(element)
          tracked.delete(element)
        }
      }
    }
    function handleMotionChange() {
      if (motion.matches) {
        observer?.disconnect()
        for (const element of tracked) element.dataset.revealState = 'visible'
      }
    }

    scan()
    const mutations = new MutationObserver(scan)
    mutations.observe(page, { childList: true, subtree: true })
    motion.addEventListener('change', handleMotionChange)
    return () => {
      observer?.disconnect()
      mutations.disconnect()
      motion.removeEventListener('change', handleMotionChange)
      for (const element of tracked) delete element.dataset.revealState
    }
  }, [root])
}
