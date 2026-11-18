import assert from 'node:assert/strict'
import test from 'node:test'
import { register } from 'node:module'

register('./fixtures/tsx-loader.mjs', import.meta.url)
const { selectPublishedWorks } =
  await import('../src/features/portfolio/catalog-selection.ts')
const works = [
  { slug: 'primeiro', published_version_id: 'v1' },
  { slug: 'segundo', published_version_id: 'v2' },
]
const versions = ['v1', 'v2'].map((id) => ({
  id,
  title: id,
  description: '',
  category_id: 'category',
  cover_photo_id: `${id}-cover`,
}))
const photos = ['v1', 'v2'].flatMap((id) =>
  ['cover', 'detail'].map((suffix) => ({
    id: `${id}-${suffix}`,
    version_id: id,
    storage_path: `${id}/${suffix}.jpg`,
    alt_text: 'Fotografia de teste',
    width: 800,
    height: 1200,
  })),
)
const categoryRows = [{ id: 'category', slug: 'ensaios' }]
const urls = () =>
  new Map(
    photos.map((photo) => [
      photo.storage_path,
      `https://example.test/${photo.storage_path}`,
    ]),
  )

test('foto sem URL não derruba outros álbuns nem produz src vazio', () => {
  const signed = urls()
  signed.delete('v1/detail.jpg')
  const result = selectPublishedWorks(
    works,
    versions,
    photos,
    categoryRows,
    signed,
  )
  assert.equal(result.incomplete, true)
  assert.equal(result.items.length, 2)
  assert.equal(result.items[0].photos.length, 1)
  assert.equal(result.items[1].photos.length, 2)
  assert.ok(
    result.items.every((work) => work.photos.every((photo) => photo.src)),
  )
})

test('capa indisponível omite somente seu álbum e preserva a ordem dos demais', () => {
  const signed = urls()
  signed.delete('v1/cover.jpg')
  const result = selectPublishedWorks(
    works,
    versions,
    photos,
    categoryRows,
    signed,
  )
  assert.deepEqual(
    result.items.map((work) => work.slug),
    ['segundo'],
  )
  assert.equal(result.incomplete, true)
})

test('versão ausente, categoria desconhecida e metadados inválidos são isolados', () => {
  assert.equal(
    selectPublishedWorks(works, versions.slice(1), photos, categoryRows, urls())
      .items.length,
    1,
  )
  const unknown = [{ ...versions[0], category_id: 'unknown' }, versions[1]]
  assert.equal(
    selectPublishedWorks(works, unknown, photos, categoryRows, urls()).items
      .length,
    1,
  )
  const invalid = photos.map((photo) =>
    photo.id === 'v1-cover' ? { ...photo, width: null } : photo,
  )
  assert.equal(
    selectPublishedWorks(works, versions, invalid, categoryRows, urls()).items
      .length,
    1,
  )
})

test('catálogo válido mantém seleção, capa e ordem; catálogo vazio não inventa conteúdo', () => {
  const result = selectPublishedWorks(
    works,
    versions,
    photos,
    categoryRows,
    urls(),
  )
  assert.equal(result.incomplete, false)
  assert.deepEqual(
    result.items.map((work) => work.slug),
    ['primeiro', 'segundo'],
  )
  assert.equal(result.items[0].cover.id, 'v1-cover')
  assert.deepEqual(selectPublishedWorks([], [], [], [], new Map()), {
    items: [],
    incomplete: false,
  })
})
