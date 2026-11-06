import type { MouseEvent } from 'react'

const navigationEvent = 'portfolio:navigate'

export function subscribeToNavigation(callback: () => void) {
  window.addEventListener('popstate', callback)
  window.addEventListener(navigationEvent, callback)
  return () => {
    window.removeEventListener('popstate', callback)
    window.removeEventListener(navigationEvent, callback)
  }
}

export function currentSearch() {
  return window.location.search
}

export function isLocalClick(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  )
}

export function changeFilter(url: string) {
  window.history.replaceState(window.history.state, '', url)
  window.dispatchEvent(new Event(navigationEvent))
}

export function openWork(url: string, cardId: string) {
  window.history.replaceState(
    {
      ...window.history.state,
      portfolioScroll: window.scrollY,
      portfolioFocus: cardId,
    },
    '',
  )
  window.history.pushState({ fromPortfolio: true }, '', url)
  window.dispatchEvent(new Event(navigationEvent))
}

export function returnToPortfolio(url: string) {
  if (window.history.state?.fromPortfolio) {
    window.history.back()
  } else {
    window.history.replaceState(null, '', url)
    window.dispatchEvent(new Event(navigationEvent))
  }
}
