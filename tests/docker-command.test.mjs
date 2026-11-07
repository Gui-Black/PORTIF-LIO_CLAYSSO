import assert from 'node:assert/strict'
import test from 'node:test'
import { describeDockerError } from '../scripts/docker-command.mjs'

test('distingue executável ausente de sessão sem permissão', () => {
  assert.match(describeDockerError({ code: 'ENOENT' }), /Docker não encontrado/)
  for (const error of [
    { code: 'EPERM' },
    { code: 'EACCES' },
    {
      stderr: Buffer.from(
        'permission denied while trying to connect to the docker API',
      ),
    },
    { stderr: 'Access is denied.' },
  ]) {
    assert.match(describeDockerError(error), /sessão não tem permissão/)
  }
})

test('diferencia motor inacessível e timeout sem recomendar reinstalação', () => {
  assert.match(
    describeDockerError({
      stderr:
        'Cannot connect to the Docker daemon. Is the docker daemon running?',
    }),
    /motor Docker não está acessível/,
  )
  assert.match(describeDockerError({ code: 'ETIMEDOUT' }), /30 segundos/)
})

test('não repassa conteúdo arbitrário do stderr para a mensagem do projeto', () => {
  assert.doesNotMatch(
    describeDockerError({ stderr: 'token=segredo-de-teste' }),
    /segredo-de-teste/,
  )
})
