import assert from 'node:assert/strict'
import test from 'node:test'
import { verifyLocalServices } from '../scripts/verify-local-services.mjs'

const status = {
  API_URL: 'http://127.0.0.1:54321',
  PUBLISHABLE_KEY: 'sb_publishable_ficticia',
  SECRET_KEY: 'sb_secret_ficticia',
}

function fakeRequest(overrides = {}) {
  return async (url, options) => {
    assert.equal(options.method, 'GET')
    assert.equal(options.redirect, 'error')
    assert.equal(options.headers.Authorization, undefined)
    const privileged = options.headers.apikey === status.SECRET_KEY
    const path = url.pathname
    if (Object.hasOwn(overrides, path)) return Response.json(overrides[path])
    if (path === '/auth/v1/health') return Response.json({ name: 'GoTrue' })
    if (path === '/rest/v1/categories')
      return Response.json(
        ['ensaios', 'casamentos', 'aniversarios', 'eventos', 'produtos'].map(
          (slug) => ({ slug }),
        ),
      )
    if (path === '/rest/v1/works')
      return Response.json(
        privileged
          ? [
              {
                id: '20000000-0000-4000-8000-000000000001',
                published_version_id: null,
              },
            ]
          : [],
      )
    if (path === '/rest/v1/work_versions')
      return Response.json(
        privileged
          ? [
              {
                id: '30000000-0000-4000-8000-000000000001',
                sealed_at: null,
              },
            ]
          : [],
      )
    assert.equal(path, '/storage/v1/bucket/portfolio')
    return Response.json({ id: 'portfolio', public: false })
  }
}

test('verificação usa somente leituras e não inclui chaves nos resultados', async () => {
  const messages = []
  await verifyLocalServices(status, {
    request: fakeRequest(),
    report: (message) => messages.push(message),
  })
  assert.equal(messages.length, 5)
  assert.doesNotMatch(messages.join('\n'), /sb_secret|sb_publishable/)
})

test('recusa destino remoto antes de enviar credenciais e não segue redirecionamentos', async () => {
  for (const API_URL of [
    'https://example.com',
    'http://127.0.0.1.evil.test',
    'http://user:password@localhost:54321',
  ]) {
    await assert.rejects(
      verifyLocalServices(
        { ...status, API_URL },
        {
          request: () => assert.fail('Não pode enviar credenciais'),
          report: () => {},
        },
      ),
      /próprio computador/,
    )
  }
})

test('rascunho inexistente não é confundido com proteção RLS funcionando', async () => {
  await assert.rejects(
    verifyLocalServices(status, {
      request: fakeRequest({ '/rest/v1/works': [] }),
      report: () => {},
    }),
    /rascunho original.*ausente/,
  )
})

test('recusa rascunho visível ao visitante e bucket público', async () => {
  const normal = fakeRequest()
  await assert.rejects(
    verifyLocalServices(status, {
      request: (url, options) =>
        url.pathname === '/rest/v1/works' &&
        options.headers.apikey === status.PUBLISHABLE_KEY
          ? Response.json([{ id: 'indevidamente-visivel' }])
          : normal(url, options),
      report: () => {},
    }),
    /Falha de privacidade/,
  )
  await assert.rejects(
    verifyLocalServices(status, {
      request: fakeRequest({
        '/storage/v1/bucket/portfolio': { id: 'portfolio', public: true },
      }),
      report: () => {},
    }),
    /não está privado/,
  )
})

test('erros de rede e HTTP não expõem conteúdo da resposta ou credenciais', async () => {
  for (const request of [
    () => {
      throw new Error(status.SECRET_KEY)
    },
    () => new Response(status.SECRET_KEY, { status: 401 }),
  ]) {
    await assert.rejects(
      verifyLocalServices(status, { request, report: () => {} }),
      (error) => {
        assert.doesNotMatch(error.message, /sb_secret/)
        return true
      },
    )
  }
})
