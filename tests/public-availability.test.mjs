import assert from 'node:assert/strict'
import test from 'node:test'
import { register } from 'node:module'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

register('./fixtures/tsx-loader.mjs', import.meta.url)
const { HomePage } = await import('../src/features/home/HomePage.tsx')

function render(status, demo = false, incomplete = false) {
  return renderToStaticMarkup(
    createElement(HomePage, {
      filter: 'todos',
      items: [],
      catalogState: { status, demo, incomplete, retry() {} },
    }),
  )
}

test('falha da galeria preserva apresentação, seis cenas e contato sem inventar seleções', () => {
  const html = render('error')
  for (const id of [
    'inicio',
    'olhar',
    'atmosfera',
    'trabalhos',
    'experiencia',
    'contato',
  ])
    assert.ok(html.includes(`id="${id}"`), id)
  assert.match(html, /instagram\.com\/clicksmortyofc/)
  assert.match(html, /role="alert"/)
  assert.match(html, /Tentar carregar as fotos/)
  assert.doesNotMatch(html, /portfolio-empty|work-card|Galeria demonstrativa/)
})

test('carregamento não é confundido com galeria vazia e não oferece tentativas simultâneas', () => {
  const html = render('loading')
  assert.match(html, /Carregando as seleções/)
  assert.doesNotMatch(html, /Tentar carregar as fotos|portfolio-empty/)
})

test('galeria configurada vazia permanece vazia e modo demonstrativo recebe identificação', () => {
  assert.match(render('ready'), /portfolio-empty/)
  assert.doesNotMatch(render('ready'), /Galeria demonstrativa/)
  assert.match(render('ready', true), /Galeria demonstrativa/)
})

test('catálogo parcial informa indisponibilidade sem inventar galeria vazia ou demonstração', () => {
  const html = render('ready', false, true)
  assert.match(html, /Algumas fotografias/)
  assert.match(html, /Tentar carregar as fotos/)
  assert.match(html, /Seleções indisponíveis/)
  assert.doesNotMatch(html, /Novas histórias|Galeria demonstrativa/)
})

test('título animado mantém nome acessível e texto no HTML antes de carregar movimento', () => {
  const html = render('ready')
  assert.match(html, /aria-label="O instante passa\. A história fica\."/)
  assert.equal((html.match(/data-hero-line/g) ?? []).length, 4)
  assert.doesNotMatch(html, /style="[^"]*(?:opacity:\s*0|visibility:\s*hidden)/)
})
