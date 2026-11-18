import assert from 'node:assert/strict'
import test from 'node:test'
import { composeAlbum } from '../src/features/portfolio/album-layout.ts'

function photo(id, width = 800, height = 1200) {
  return {
    id,
    src: `/images/${id}.jpg`,
    alt: 'Fotografia de teste',
    width,
    height,
  }
}

test('composição mista preserva ordem, identidade e índice usado pelo lightbox', () => {
  const photos = [
    photo('a'),
    photo('b'),
    photo('c'),
    photo('d', 1400, 800),
    photo('e'),
    photo('f', 800, 800),
    photo('g', 1400, 800),
  ]
  const frames = composeAlbum(photos)
  assert.deepEqual(
    frames.map((frame) => frame.placement),
    [
      'opening-portrait',
      'pair',
      'pair-offset',
      'wide',
      'pair',
      'pair-offset',
      'wide',
    ],
  )
  assert.deepEqual(
    frames.map((frame) => frame.index),
    [0, 1, 2, 3, 4, 5, 6],
  )
  frames.forEach((frame, index) => assert.equal(frame.photo, photos[index]))
})

test('retrato sem par ganha composição própria, sem pular ou repetir fotografias', () => {
  for (const count of [2, 4, 12]) {
    const photos = Array.from({ length: count }, (_, index) =>
      photo(String(index)),
    )
    const frames = composeAlbum(photos)
    assert.equal(frames.length, count)
    assert.equal(frames.at(-1).placement, 'portrait')
    assert.deepEqual(
      frames.map((frame) => frame.index),
      photos.map((_, index) => index),
    )
  }
})

test('álbum vazio, foto única e horizontais consecutivas permanecem válidos', () => {
  assert.deepEqual(composeAlbum([]), [])
  assert.equal(composeAlbum([photo('a')])[0].placement, 'opening-portrait')
  const photos = [photo('a', 1600, 900), photo('b', 1200, 800)]
  assert.deepEqual(
    composeAlbum(photos).map((frame) => frame.placement),
    ['wide', 'wide'],
  )
})
