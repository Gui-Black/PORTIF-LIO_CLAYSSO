import assert from 'node:assert/strict'
import test from 'node:test'
import { readSupabaseConfig } from '../src/lib/supabase-config.ts'

test('configuração aceita somente chave publicável e URL segura', () => {
  assert.deepEqual(
    readSupabaseConfig('http://127.0.0.1:54321', 'sb_publishable_teste'),
    {
      url: 'http://127.0.0.1:54321',
      key: 'sb_publishable_teste',
    },
  )
  for (const key of [
    '',
    'sb_secret_teste',
    'eyJservice_role',
    'sb_publishable_ teste',
  ]) {
    assert.equal(readSupabaseConfig('http://localhost:54321', key), null)
  }
  for (const url of [
    'http://example.com',
    'https://user:password@example.com',
    'https://example.com/path',
    'https://example.com?secret=x',
    'invalid',
  ]) {
    assert.equal(readSupabaseConfig(url, 'sb_publishable_teste'), null)
  }
})
