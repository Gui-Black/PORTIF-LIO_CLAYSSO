import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import {
  categories,
  works,
  parseFilter,
  filterWorks,
  findWork,
  portfolioUrl,
} from '../src/features/portfolio/portfolio-data.ts'
import {
  nextPhotoIndex,
  swipeDirection,
} from '../src/features/portfolio/photo-navigation.ts'

test('cada seleção tem endereço único, capa pertencente ao álbum e fotos locais válidas', () => {
  assert.equal(new Set(works.map((work) => work.slug)).size, works.length)
  for (const work of works) {
    assert.match(work.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    assert.ok(categories.some((category) => category.slug === work.category))
    assert.ok(work.photos.some((photo) => photo.id === work.cover.id))
    assert.equal(
      new Set(work.photos.map((photo) => photo.id)).size,
      work.photos.length,
    )
    for (const photo of work.photos) {
      assert.ok(existsSync(new URL(`../public${photo.src}`, import.meta.url)))
      assert.ok(photo.alt.length > 10 && photo.width > 0 && photo.height > 0)
    }
  }
})

test('filtros reconhecidos, categoria vazia e valores desconhecidos', () => {
  assert.equal(filterWorks('todos').length, works.length)
  for (const category of categories) {
    assert.equal(parseFilter(category.slug), category.slug)
    assert.ok(
      filterWorks(category.slug).every(
        (work) => work.category === category.slug,
      ),
    )
  }
  assert.deepEqual(filterWorks('produtos'), [])
  assert.equal(parseFilter('inexistente'), 'todos')
  assert.equal(parseFilter(null), 'todos')
})

test('link direto identifica a seleção e conserva o filtro de retorno', () => {
  const work = works[0]
  const url = new URL(
    portfolioUrl('casamentos', work.slug),
    'https://example.test',
  )
  assert.equal(findWork(url.searchParams.get('trabalho')), work)
  assert.equal(parseFilter(url.searchParams.get('categoria')), 'casamentos')
  assert.equal(portfolioUrl('casamentos'), '/?categoria=casamentos#trabalhos')
  assert.equal(findWork('inexistente'), undefined)
  assert.equal(findWork(''), undefined)
})

test('navegação de fotos retorna ao início e ao fim sem índices inválidos', () => {
  assert.equal(nextPhotoIndex(3, 1, 4), 0)
  assert.equal(nextPhotoIndex(0, -1, 4), 3)
  assert.equal(nextPhotoIndex(0, 1, 1), 0)
  assert.equal(nextPhotoIndex(0, 1, 0), 0)
})

test('gestos verticais e toques curtos não trocam fotos', () => {
  assert.equal(swipeDirection(150, 0, 40, 10), 1)
  assert.equal(swipeDirection(40, 10, 150, 0), -1)
  assert.equal(swipeDirection(0, 0, 40, 5), 0)
  assert.equal(swipeDirection(0, 0, 100, 180), 0)
})
