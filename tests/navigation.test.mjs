import test from 'node:test'
import assert from 'node:assert/strict'
import {
  changeFilter,
  currentSearch,
  isLocalClick,
  openWork,
  returnToPortfolio,
  subscribeToNavigation,
} from '../src/features/portfolio/navigation.ts'

// Simula o contrato de History para validar o estado salvo, sem substituir teste em navegador.
function browserFixture(t, initialUrl) {
  const previousWindow = globalThis.window
  const target = new EventTarget()
  let position = 0
  const entries = [
    { state: null, url: new URL(initialUrl, 'https://example.test') },
  ]
  const browser = {
    scrollY: 1240,
    addEventListener: target.addEventListener.bind(target),
    removeEventListener: target.removeEventListener.bind(target),
    dispatchEvent: target.dispatchEvent.bind(target),
    get location() {
      return entries[position].url
    },
    history: {
      get state() {
        return entries[position].state
      },
      replaceState(state, _title, url) {
        entries[position] = {
          state,
          url: url
            ? new URL(url, entries[position].url)
            : entries[position].url,
        }
      },
      pushState(state, _title, url) {
        const next = new URL(url, entries[position].url)
        entries.splice(position + 1)
        entries.push({ state, url: next })
        position += 1
      },
      back() {
        if (position > 0) {
          position -= 1
          target.dispatchEvent(new Event('popstate'))
        }
      },
      forward() {
        if (position < entries.length - 1) {
          position += 1
          target.dispatchEvent(new Event('popstate'))
        }
      },
    },
  }
  globalThis.window = browser
  t.after(() => {
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
  })
  return browser
}

test('abrir, voltar e avançar preservam filtro, rolagem e alvo de foco', (t) => {
  const browser = browserFixture(t, '/#trabalhos')
  const changes = []
  const unsubscribe = subscribeToNavigation(() => changes.push(currentSearch()))
  changeFilter('/?categoria=casamentos#trabalhos')
  openWork(
    '/?categoria=casamentos&trabalho=entre-lacos-e-abracos',
    'work-entre-lacos-e-abracos',
  )
  assert.equal(browser.history.state.fromPortfolio, true)
  returnToPortfolio('/?categoria=casamentos#trabalhos')
  assert.equal(currentSearch(), '?categoria=casamentos')
  assert.equal(browser.history.state.portfolioScroll, 1240)
  assert.equal(
    browser.history.state.portfolioFocus,
    'work-entre-lacos-e-abracos',
  )
  browser.history.forward()
  assert.match(currentSearch(), /trabalho=entre-lacos-e-abracos/)
  assert.equal(changes.length, 4)
  unsubscribe()
  browser.history.back()
  assert.equal(changes.length, 4)
})

test('entrada por link direto volta à galeria sem sair do site', (t) => {
  const browser = browserFixture(t, '/?trabalho=retratos-no-jardim')
  returnToPortfolio('/#trabalhos')
  assert.equal(browser.location.pathname + browser.location.hash, '/#trabalhos')
  assert.equal(currentSearch(), '')
})

test('atalhos e botão do meio mantêm navegação nativa do link', () => {
  const click = {
    button: 0,
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
  }
  assert.equal(isLocalClick(click), true)
  for (const modifier of ['ctrlKey', 'metaKey', 'altKey', 'shiftKey'])
    assert.equal(isLocalClick({ ...click, [modifier]: true }), false)
  assert.equal(isLocalClick({ ...click, button: 1 }), false)
})
