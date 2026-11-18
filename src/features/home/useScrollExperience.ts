import { useEffect, useRef } from 'react'
import { useScrollReveal } from '../../lib/useScrollReveal'

export function useScrollExperience() {
  const pageRef = useRef<HTMLElement>(null)
  useScrollReveal(pageRef)

  useEffect(() => {
    const page = pageRef.current
    if (!page) return
    let disposed = false
    let stopMotion: (() => void) | undefined

    void import('./home-motion')
      .then(({ startHomeMotion }) => {
        if (!disposed) stopMotion = startHomeMotion(page)
      })
      .catch(() => {
        // The existing native reveals and all navigation remain available.
      })

    return () => {
      disposed = true
      stopMotion?.()
    }
  }, [])

  useEffect(() => {
    const page = pageRef.current
    if (!page) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const scenes = page.querySelectorAll<HTMLElement>('[data-scroll-scene]')
    let frame = 0

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
      scheduleUpdate()
    }

    updateScene()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    motion.addEventListener('change', handleMotionChange)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      motion.removeEventListener('change', handleMotionChange)
      scenes.forEach((scene) => scene.style.removeProperty('--scene-progress'))
    }
  }, [])

  return pageRef
}
