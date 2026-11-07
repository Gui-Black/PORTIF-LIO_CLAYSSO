import assert from 'node:assert/strict'
import test from 'node:test'
import { checkAdministrator } from '../src/features/auth/authorization.ts'
import { publicEnvironment } from '../scripts/public-env.mjs'

test('autorização verifica a identidade no servidor antes de consultar a permissão', async () => {
  const client = {
    auth: {
      getUser: async () => ({
        data: { user: { id: 'outra-conta' } },
        error: null,
      }),
    },
    rpc: () =>
      assert.fail('Identidade divergente não pode consultar autorização'),
  }
  await assert.rejects(
    checkAdministrator(client, 'minha-conta', new AbortController().signal),
    /Sessão inválida/,
  )
})

test('somente true explícito autoriza; erro de RPC bloqueia acesso', async () => {
  for (const data of [true, false, null, 'true']) {
    const client = {
      auth: {
        getUser: async () => ({ data: { user: { id: 'conta' } }, error: null }),
      },
      rpc: (name) => {
        assert.equal(name, 'current_user_is_administrator')
        return { abortSignal: async () => ({ data, error: null }) }
      },
    }
    assert.equal(
      await checkAdministrator(client, 'conta', new AbortController().signal),
      data === true,
    )
    client.rpc = () => ({
      abortSignal: async () => ({ error: new Error('offline') }),
    })
    await assert.rejects(
      checkAdministrator(client, 'conta', new AbortController().signal),
      /confirmar a permissão/,
    )
  }
})

test('geração de ambiente exporta somente chave pública e recusa destino remoto e injeção de linhas', () => {
  const status = {
    API_URL: 'http://127.0.0.1:54321',
    PUBLISHABLE_KEY: 'sb_publishable_teste',
    SECRET_KEY: 'sb_secret_nao_exportar',
  }
  const content = publicEnvironment(status)
  assert.equal(content.split('\n').filter(Boolean).length, 2)
  assert.doesNotMatch(content, /sb_secret|SECRET_KEY/)
  assert.throws(() =>
    publicEnvironment({ ...status, API_URL: 'https://example.com' }),
  )
  assert.throws(() =>
    publicEnvironment({
      ...status,
      PUBLISHABLE_KEY: 'sb_publishable_x\nVITE_SECRET=senha',
    }),
  )
})
