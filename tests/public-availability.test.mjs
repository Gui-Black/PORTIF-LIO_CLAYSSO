import assert from 'node:assert/strict'
import test from 'node:test'
import { register } from 'node:module'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

register('./fixtures/tsx-loader.mjs', import.meta.url)
const { HomePage } = await import('../src/features/home/HomePage.tsx')

function render(status, demo = false) {
  return renderToStaticMarkup(
    createElement(HomePage, {
      filter: 'todos',
      items: [],
      catalogState: { status, demo, retry() {} },
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
