import assert from 'node:assert/strict'
import test from 'node:test'
import { fetchAllRows } from '../src/lib/pagination.ts'

test('consultas paginadas preservam registros além do limite e recusam resultado parcial com erro', async () => {
  const source = Array.from({ length: 1101 }, (_, index) => index)
  assert.deepEqual(
    await fetchAllRows(async (start, end) => ({
      data: source.slice(start, end + 1),
      error: null,
    })),
    source,
  )
  await assert.rejects(
    fetchAllRows(async (start, end) =>
      start === 0
        ? { data: source.slice(start, end + 1), error: null }
        : { data: null, error: new Error('rede') },
    ),
  )
})
