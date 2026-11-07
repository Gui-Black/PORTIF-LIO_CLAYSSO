import assert from 'node:assert/strict'
import test from 'node:test'
import {
  checkLocalDocker,
  ensureLocalNetwork,
} from '../scripts/local-docker.mjs'

test('recusa DOCKER_HOST remoto antes de consultar ou alterar o Docker', () => {
  assert.throws(
    () =>
      checkLocalDocker(() => assert.fail('Não deveria executar Docker'), {
        DOCKER_HOST: 'ssh://server',
      }),
    /DOCKER_HOST/,
  )
})

test('recusa contexto remoto antes de consultar o motor', () => {
  const calls = []
  assert.throws(
    () =>
      checkLocalDocker((args) => {
        calls.push(args)
        return 'tcp://server:2376'
      }, {}),
    /destinos remotos/,
  )
  assert.equal(calls.length, 1)
})

test('aceita Docker local com containers Linux sem criar recursos', () => {
  for (const endpoint of [
    'npipe:////./pipe/dockerDesktopLinuxEngine',
    'unix:///var/run/docker.sock',
  ]) {
    checkLocalDocker((args) => {
      if (args[0] === 'context') return endpoint
      assert.deepEqual(args, ['info', '--format', '{{.OSType}}'])
      return 'linux'
    }, {})
  }
})

test('recusa containers Windows', () => {
  assert.throws(
    () =>
      checkLocalDocker(
        (args) =>
          args[0] === 'context' ? 'npipe:////./pipe/docker_engine' : 'windows',
        {},
      ),
    /containers Linux/,
  )
})

test('cria uma rede ausente com portas limitadas ao localhost e confere o resultado', () => {
  const calls = []
  ensureLocalNetwork((args) => {
    calls.push(args)
    if (args[1] === 'inspect')
      return JSON.stringify([
        {
          Driver: 'bridge',
          Options: {
            'com.docker.network.bridge.host_binding_ipv4': '127.0.0.1',
          },
        },
      ])
    return ''
  })
  assert.equal(calls.length, 3)
  assert.equal(calls[1][1], 'create')
  assert.ok(
    calls[1].includes('com.docker.network.bridge.host_binding_ipv4=127.0.0.1'),
  )
  assert.equal(calls[2][1], 'inspect')
})

test('reutiliza rede válida e recusa rede insegura sem remover recursos existentes', () => {
  for (const binding of ['127.0.0.1', '0.0.0.0', undefined]) {
    const runDocker = (args) => {
      if (args[1] === 'ls') return 'clicks-do-morty-local'
      assert.equal(args[1], 'inspect')
      return JSON.stringify([
        {
          Driver: 'bridge',
          Options: {
            'com.docker.network.bridge.host_binding_ipv4': binding,
          },
        },
      ])
    }
    if (binding === '127.0.0.1') ensureLocalNetwork(runDocker)
    else assert.throws(() => ensureLocalNetwork(runDocker), /127.0.0.1/)
  }
})
