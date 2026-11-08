import { useEffect, useRef } from 'react'

export function useScrollExperience() {
  const pageRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const page = pageRef.current
    if (!page) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const elements = page.querySelectorAll<HTMLElement>('[data-reveal]')
    const scenes = page.querySelectorAll<HTMLElement>('[data-scroll-scene]')
    let frame = 0
    const observer =
      'IntersectionObserver' in window
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (entry.isIntersecting) {
                  ;(entry.target as HTMLElement).dataset.revealState = 'visible'
                  observer?.unobserve(entry.target)
                }
              }
            },
            { threshold: 0.08 },
          )
        : null

    for (const element of elements) {
      if (
        observer &&
        !motion.matches &&
        element.getBoundingClientRect().top >= window.innerHeight
      ) {
        element.dataset.revealState = 'pending'
        observer.observe(element)
      }
    }

    function updateScene() {
      frame = 0
      for (const scene of scenes) {
        const progress = motion.matches
          ? 1
          : Math.min(
              1,
              Math.max(
                0,
                (window.innerHeight - scene.getBoundingClientRect().top) /
                  (window.innerHeight * 0.8),
              ),
            )
        scene.style.setProperty('--scene-progress', progress.toFixed(3))
      }
    }
    function scheduleUpdate() {
      if (!frame) frame = window.requestAnimationFrame(updateScene)
    }
    function handleMotionChange() {
      if (motion.matches) {
        observer?.disconnect()
        elements.forEach((element) => {
          element.dataset.revealState = 'visible'
        })
      }
      scheduleUpdate()
    }

    updateScene()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    motion.addEventListener('change', handleMotionChange)
    return () => {
      observer?.disconnect()
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      motion.removeEventListener('change', handleMotionChange)
      elements.forEach((element) => {
        delete element.dataset.revealState
      })
      scenes.forEach((scene) => scene.style.removeProperty('--scene-progress'))
    }
  }, [])

  return pageRef
}
