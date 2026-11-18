import assert from 'node:assert/strict'
import test from 'node:test'
import { existsSync } from 'node:fs'
import { responsiveImage } from '../src/lib/responsive-images.ts'

test('todas as variantes locais referenciadas existem sem alterar URLs assinadas', () => {
  for (const name of [
    'abraco',
    'casal',
    'celebracao',
    'noiva-preto-branco',
    'retrato-jardim',
    'retrato-noiva',
  ]) {
    const image = responsiveImage(`/images/${name}.jpeg`, '100vw')
    assert.equal(image.sizes, '100vw')
    for (const candidate of image.srcSet.split(', ')) {
      const [path] = candidate.split(' ')
      assert.ok(existsSync(new URL(`../public${path}`, import.meta.url)), path)
    }
  }
  for (const src of [
    'https://example.test/image.jpg?token=signed',
    '/images/unknown.jpeg',
    '/images/casal.jpeg?token=signed',
  ]) {
    assert.deepEqual(responsiveImage(src, '100vw'), {})
  }
})
